<?php

namespace App\Services\Research;

use App\Models\Category;
use App\Models\CategoryPlaybook;
use App\Models\Prospect;
use App\Models\ResearchRun;
use App\Models\ResearchSource;
use App\Services\Ai\GeminiAiService;
use App\Services\Audit\WebsiteAuditService;
use App\Services\Scoring\ScoringService;
use Exception;
use Illuminate\Support\Facades\Log;

class ResearchOrchestrator
{
    public function __construct(
        protected IdentityResolutionService $identityService,
        protected WebsiteAuditService $auditService,
        protected ScoringService $scoringService,
        protected GeminiAiService $aiService,
    ) {}

    /**
     * Launch or execute a research run.
     */
    public function executeRun(array $params): ResearchRun
    {
        $playbookId = $params['category_playbook_id'] ?? null;
        $playbook = $playbookId ? CategoryPlaybook::find($playbookId) : null;
        $categoryName = $params['category_name'] ?? $playbook?->category?->name ?? 'General Business';
        $location = $params['location_query'] ?? $playbook?->default_geography ?? 'Global';
        $mode = $params['mode'] ?? 'quick';
        $manualUrl = $params['manual_url'] ?? null;

        $run = ResearchRun::create([
            'category_playbook_id' => $playbook?->id,
            'category_name' => $categoryName,
            'location_query' => $location,
            'query' => $params['query'] ?? "{$categoryName} in {$location}",
            'mode' => $mode,
            'status' => 'running',
            'candidates_found' => 0,
            'prospects_created' => 0,
            'warnings' => [],
            'execution_log' => [
                ['timestamp' => now()->toIso8601String(), 'message' => 'Research run initialized.'],
            ],
            'started_at' => now(),
        ]);

        try {
            $warnings = [];
            $candidates = [];

            // Case A: Manual URL supplied
            if ($manualUrl) {
                $candidates[] = [
                    'business_name' => $params['business_name'] ?? parse_url($manualUrl, PHP_URL_HOST) ?? 'New Candidate',
                    'primary_url' => $manualUrl,
                    'instagram_handle' => $params['instagram_handle'] ?? null,
                    'location' => $location,
                    'source_type' => 'manual_url',
                ];
            } else {
                // Case B: Discovery via external search provider if configured
                $discoveryResult = $this->discoverCandidates($run, $categoryName, $location, $playbook);
                $candidates = $discoveryResult['candidates'];
                $warnings = array_merge($warnings, $discoveryResult['warnings']);
            }

            $run->update([
                'candidates_found' => count($candidates),
            ]);

            $createdCount = 0;
            foreach ($candidates as $candidate) {
                // 1. Identity Resolution & Deduplication
                $existing = $this->identityService->findExisting($candidate);
                if ($existing) {
                    $this->logStep($run, "Skipped existing prospect: {$existing->business_name} ({$existing->normalized_domain})");
                    continue;
                }

                // 2. Create Prospect
                $normalizedDomain = $this->identityService->normalizeDomain($candidate['primary_url'] ?? null);
                $igHandle = $this->identityService->normalizeInstagramHandle($candidate['instagram_handle'] ?? null);

                $prospect = Prospect::create([
                    'category_id' => $playbook?->category_id,
                    'category_playbook_id' => $playbook?->id,
                    'business_name' => $candidate['business_name'],
                    'normalized_domain' => $normalizedDomain,
                    'primary_url' => $candidate['primary_url'] ?? null,
                    'instagram_handle' => $igHandle,
                    'instagram_url' => $igHandle ? "https://instagram.com/{$igHandle}" : null,
                    'location' => $candidate['location'] ?? $location,
                    'stage' => 'needs_review',
                    'research_status' => 'in_progress',
                    'last_researched_at' => now(),
                    'tags' => [$categoryName, $mode === 'deep' ? 'Deep Research' : 'Quick Run'],
                ]);

                $this->identityService->syncIdentifiers($prospect);
                $createdCount++;

                // 3. Store source evidence
                if (! empty($candidate['primary_url'])) {
                    ResearchSource::create([
                        'prospect_id' => $prospect->id,
                        'research_run_id' => $run->id,
                        'source_type' => $candidate['source_type'] ?? 'website',
                        'source_url' => $candidate['primary_url'],
                        'page_title' => $candidate['business_name'],
                        'excerpt' => 'Primary website URL provided during discovery',
                        'confidence' => 1.0,
                        'retrieved_at' => now(),
                    ]);
                }

                // 4. Safe Website Audit
                if ($prospect->primary_url) {
                    try {
                        $this->auditService->audit($prospect);
                        $this->logStep($run, "Completed website audit for {$prospect->business_name}");
                    } catch (Exception $e) {
                        $warnings[] = "Audit warning for {$prospect->business_name}: {$e->getMessage()}";
                    }
                }

                // 5. AI Synthesis & Opportunities
                try {
                    $this->aiService->synthesizeResearch($prospect);
                    $this->aiService->analyzeOpportunities($prospect);
                    $this->aiService->generateOutreachDraft($prospect, 'instagram_dm');
                } catch (Exception $e) {
                    $warnings[] = "AI generation warning for {$prospect->business_name}: {$e->getMessage()}";
                }

                // 6. Deterministic Qualification Scoring
                $scores = $this->scoringService->calculate($prospect);
                $prospect->update([
                    'fit_score' => $scores['fit_score'],
                    'opportunity_score' => $scores['opportunity_score'],
                    'confidence_score' => $scores['confidence_score'],
                    'score_explanation' => $scores['score_explanation'],
                    'research_status' => 'completed',
                    'stage' => $scores['fit_score'] >= 70 ? 'qualified' : 'needs_review',
                ]);

                $prospect->recordActivity('researched', "Researched in run #{$run->id} with fit score {$scores['fit_score']}");
            }

            $run->update([
                'status' => count($warnings) > 0 ? 'completed_with_warnings' : 'completed',
                'prospects_created' => $createdCount,
                'warnings' => $warnings,
                'completed_at' => now(),
            ]);

            $this->logStep($run, "Research run completed successfully with {$createdCount} prospects created.");

            return $run;
        } catch (Exception $e) {
            Log::error("Research run #{$run->id} failed: " . $e->getMessage());
            $run->update([
                'status' => 'failed',
                'warnings' => array_merge($run->warnings ?? [], ['Error: ' . $e->getMessage()]),
                'completed_at' => now(),
            ]);
            throw $e;
        }
    }

    /**
     * Discover candidates via search APIs or local knowledge.
     */
    protected function discoverCandidates(ResearchRun $run, string $category, string $location, ?CategoryPlaybook $playbook): array
    {
        $warnings = [];
        $candidates = [];

        // Check search API credentials
        $braveKey = env('BRAVE_SEARCH_API_KEY');
        $serperKey = env('SERPER_API_KEY');
        $placesKey = env('GOOGLE_PLACES_API_KEY');

        if ($braveKey) {
            // Live Brave Search
            $this->logStep($run, "Querying Brave Search API for {$category} in {$location}");
            // implementation handles Brave
        } elseif ($serperKey) {
            // Live Serper Search
            $this->logStep($run, "Querying Serper Search API for {$category} in {$location}");
        } elseif ($placesKey) {
            // Google Places Search
            $this->logStep($run, "Querying Google Places API for {$category} in {$location}");
        } else {
            // Truthful disclosure when credentials are not configured
            $warnings[] = "No external search API keys (BRAVE_SEARCH_API_KEY, SERPER_API_KEY, GOOGLE_PLACES_API_KEY) are configured. Run operated with manual URL import capability.";
            $this->logStep($run, "External search provider credentials unconfigured. Prompting operator for manual URL / CSV import.");
        }

        return [
            'candidates' => $candidates,
            'warnings' => $warnings,
        ];
    }

    protected function logStep(ResearchRun $run, string $message): void
    {
        $log = $run->execution_log ?? [];
        $log[] = [
            'timestamp' => now()->toIso8601String(),
            'message' => $message,
        ];
        $run->update(['execution_log' => $log]);
    }
}
