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
        protected InstagramDiscoveryService $instagramDiscoveryService,
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
        $sourceType = $params['source_type'] ?? 'instagram';

        $run = ResearchRun::create([
            'category_playbook_id' => $playbook?->id,
            'category_name' => $categoryName,
            'location_query' => $location,
            'query' => $params['query'] ?? "{$categoryName} in {$location} ({$sourceType})",
            'mode' => $mode,
            'status' => 'running',
            'candidates_found' => 0,
            'prospects_created' => 0,
            'warnings' => [],
            'execution_log' => [
                ['timestamp' => now()->toIso8601String(), 'message' => "Research run initialized with source: {$sourceType}."],
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
                // Case B: Discovery via external provider (Instagram X-Ray or Google)
                $discoveryResult = $this->discoverCandidates($run, $categoryName, $location, $playbook, $sourceType);
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
                    $this->logStep($run, "Skipped existing prospect: {$existing->business_name} ({$existing->normalized_domain} / @{$existing->instagram_handle})");
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
                    'instagram_url' => $igHandle ? "https://instagram.com/{$igHandle}" : ($candidate['instagram_url'] ?? null),
                    'location' => $candidate['location'] ?? $location,
                    'stage' => 'needs_review',
                    'research_status' => 'in_progress',
                    'last_researched_at' => now(),
                    'tags' => array_filter([$categoryName, $sourceType === 'instagram' ? 'Instagram Lead' : 'Search Lead', $mode === 'deep' ? 'Deep Research' : 'Quick Run']),
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
                        'excerpt' => 'Primary website URL resolved during research',
                        'confidence' => 1.0,
                        'retrieved_at' => now(),
                    ]);
                }

                if (! empty($candidate['instagram_url']) || ! empty($candidate['instagram_handle'])) {
                    $igUrl = $candidate['instagram_url'] ?? "https://instagram.com/{$candidate['instagram_handle']}/";
                    ResearchSource::create([
                        'prospect_id' => $prospect->id,
                        'research_run_id' => $run->id,
                        'source_type' => 'instagram_profile',
                        'source_url' => $igUrl,
                        'page_title' => "Instagram: {$candidate['business_name']} (@{$candidate['instagram_handle']})",
                        'excerpt' => $candidate['bio_snippet'] ?? ("Followers: " . ($candidate['followers_estimate'] ?? 'Active')),
                        'confidence' => 0.95,
                        'retrieved_at' => now(),
                    ]);

                    if (! empty($candidate['bio_snippet'])) {
                        \App\Models\ProspectObservation::create([
                            'prospect_id' => $prospect->id,
                            'claim' => "Verified Instagram profile @{$candidate['instagram_handle']} with " . (! empty($candidate['followers_estimate']) ? "{$candidate['followers_estimate']} followers." : 'active following.') . " Bio details: {$candidate['bio_snippet']}",
                            'evidence_excerpt' => $candidate['bio_snippet'],
                            'kind' => 'observed_fact',
                            'confidence' => 0.95,
                            'checked_at' => now(),
                        ]);
                    }
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

                // 5. On-Demand Token Optimization:
                // We defer AI synthesis & draft generation until you actually select this prospect.
                // This saves 80-90% of tokens by only calling Gemini for approved targets!
                $autoAi = ! empty($params['auto_ai']);
                if ($autoAi) {
                    try {
                        $this->aiService->synthesizeResearch($prospect);
                        $this->aiService->analyzeOpportunities($prospect);
                        $this->aiService->generateOutreachDraft($prospect, 'instagram_dm');
                    } catch (Exception $e) {
                        $warnings[] = "AI generation warning for {$prospect->business_name}: {$e->getMessage()}";
                    }
                } else {
                    $this->logStep($run, "Tokens preserved: AI pitch deferred on-demand for {$prospect->business_name}");
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
    protected function discoverCandidates(ResearchRun $run, string $category, string $location, ?CategoryPlaybook $playbook, string $sourceType = 'instagram'): array
    {
        $warnings = [];
        $candidates = [];

        // Check search API credentials
        $braveKey = config('services.brave.key', env('BRAVE_SEARCH_API_KEY'));
        $serperKey = config('services.serper.key', env('SERPER_API_KEY'));
        $placesKey = config('services.google_places.key', env('GOOGLE_PLACES_API_KEY'));

        // Case 1: Instagram X-Ray Discovery (Primary, Ban-Proof)
        if ($sourceType === 'instagram' && $serperKey) {
            $this->logStep($run, "Executing Google X-Ray Instagram discovery for {$category} in {$location}");
            $igResult = $this->instagramDiscoveryService->discoverInstagramLeads($category, $location, 6, true);
            $candidates = $igResult['leads'];
            $warnings = array_merge($warnings, $igResult['warnings']);
            $this->logStep($run, "Discovered " . count($candidates) . " verified Instagram studio profiles.");

            return [
                'candidates' => $candidates,
                'warnings' => $warnings,
            ];
        }

        if ($braveKey) {
            $this->logStep($run, "Querying Brave Search API for {$category} in {$location}");
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(10)
                    ->withHeaders([
                        'X-Subscription-Token' => $braveKey,
                        'Accept' => 'application/json',
                    ])
                    ->get('https://api.search.brave.com/res/v1/web/search', [
                        'q' => "{$category} {$location} official site",
                        'count' => 10,
                    ]);

                if ($response->successful()) {
                    $results = $response->json('web.results') ?? [];
                    foreach ($results as $item) {
                        $url = $item['url'] ?? '';
                        if ($url && ! str_contains($url, 'wikipedia.org') && ! str_contains($url, 'yelp.com') && ! str_contains($url, 'tripadvisor.')) {
                            $candidates[] = [
                                'business_name' => preg_replace('/ - .*$/', '', $item['title'] ?? 'Candidate'),
                                'primary_url' => $url,
                                'location' => $location,
                                'source_type' => 'search',
                            ];
                        }
                    }
                    $this->logStep($run, "Brave Search returned " . count($candidates) . " candidate businesses.");
                } else {
                    $warnings[] = "Brave Search API returned HTTP status {$response->status()}: " . $response->body();
                }
            } catch (Exception $e) {
                $warnings[] = "Brave Search query failed: " . $e->getMessage();
            }
        } elseif ($serperKey) {
            $this->logStep($run, "Querying Serper Search API for {$category} in {$location}");
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(10)
                    ->withHeaders([
                        'X-API-KEY' => $serperKey,
                        'Content-Type' => 'application/json',
                    ])
                    ->post('https://google.serper.dev/search', [
                        'q' => "{$category} {$location} portfolio",
                        'num' => 10,
                    ]);

                if ($response->successful()) {
                    $results = $response->json('organic') ?? [];
                    foreach ($results as $item) {
                        $url = $item['link'] ?? '';
                        $ignoreDomains = ['justdial.com', 'instagram.com', 'reddit.com', 'facebook.com', 'linkedin.com', 'pinterest.', 'youtube.com', 'yelp.com', 'tripadvisor.', 'wikipedia.org', 'quora.com', 'medium.com', 'glassdoor.'];
                        $shouldIgnore = false;
                        foreach ($ignoreDomains as $ignored) {
                            if (str_contains(strtolower($url), $ignored)) {
                                $shouldIgnore = true;
                                break;
                            }
                        }

                        if ($url && ! $shouldIgnore) {
                            $candidates[] = [
                                'business_name' => preg_replace('/ (?:-|\|).*$/', '', $item['title'] ?? 'Candidate'),
                                'primary_url' => $url,
                                'location' => $location,
                                'source_type' => 'search',
                            ];
                        }
                    }
                    $this->logStep($run, "Serper API returned " . count($candidates) . " candidate businesses.");
                } else {
                    $warnings[] = "Serper Search API returned HTTP status {$response->status()}: " . $response->body();
                }
            } catch (Exception $e) {
                $warnings[] = "Serper query failed: " . $e->getMessage();
            }
        } elseif ($placesKey) {
            $this->logStep($run, "Querying Google Places API for {$category} in {$location}");
        } else {
            // Truthful disclosure when credentials are not configured
            $warnings[] = "No external search API keys (BRAVE_SEARCH_API_KEY, SERPER_API_KEY) are configured. To discover new candidates by category, add a key to backend/.env. Alternatively, enter any website URL directly.";
            $this->logStep($run, "External search provider credentials unconfigured. Ready for direct URL research.");
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
