<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Services\Ai\GeminiAiService;
use App\Services\Audit\WebsiteAuditService;
use App\Services\Research\IdentityResolutionService;
use App\Services\Scoring\ScoringService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProspectController extends Controller
{
    public function __construct(
        protected IdentityResolutionService $identityService,
        protected WebsiteAuditService $auditService,
        protected ScoringService $scoringService,
        protected GeminiAiService $aiService,
    ) {}

    /**
     * Display a listing of prospects with filters, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Prospect::with(['category', 'playbook', 'latestWebsiteAudit']);

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('normalized_domain', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('instagram_handle', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Stage filter
        if ($stage = $request->query('stage')) {
            if ($stage === 'active_pipeline') {
                $query->whereNotIn('stage', ['won', 'lost', 'not_a_fit', 'do_not_contact']);
            } else {
                $query->where('stage', $stage);
            }
        }

        // Stale filter
        if ($request->boolean('stale_only')) {
            $query->where(function ($q) {
                $q->whereNull('last_researched_at')
                    ->orWhere('last_researched_at', '<=', now()->subDays(60));
            });
        }

        // Do not contact filter
        if ($request->has('is_do_not_contact')) {
            $query->where('is_do_not_contact', $request->boolean('is_do_not_contact'));
        }

        // Sorting
        $sortField = $request->query('sort', 'created_at');
        $sortDirection = $request->query('direction', 'desc');
        $allowedSorts = ['created_at', 'fit_score', 'opportunity_score', 'confidence_score', 'business_name', 'last_researched_at'];
        
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderByDesc('created_at');
        }

        $perPage = min(100, max(5, (int) $request->query('per_page', 25)));
        $prospects = $query->paginate($perPage);

        return response()->json($prospects);
    }

    /**
     * Store a newly created prospect.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'category_playbook_id' => 'nullable|exists:category_playbooks,id',
            'primary_url' => 'nullable|string|max:500',
            'instagram_handle' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'tags' => 'nullable|array',
            'auto_research' => 'nullable|boolean',
        ]);

        $domain = $this->identityService->normalizeDomain($validated['primary_url'] ?? null);
        $igHandle = $this->identityService->normalizeInstagramHandle($validated['instagram_handle'] ?? null);

        // Check deduplication
        $existing = $this->identityService->findExisting($validated);
        if ($existing) {
            return response()->json([
                'message' => 'A prospect with matching domain or Instagram handle already exists.',
                'duplicate' => true,
                'prospect' => $existing,
            ], 409);
        }

        $prospect = Prospect::create([
            'category_id' => $validated['category_id'] ?? null,
            'category_playbook_id' => $validated['category_playbook_id'] ?? null,
            'business_name' => $validated['business_name'],
            'normalized_domain' => $domain,
            'primary_url' => $validated['primary_url'] ?? null,
            'instagram_handle' => $igHandle,
            'instagram_url' => $igHandle ? "https://instagram.com/{$igHandle}" : null,
            'location' => $validated['location'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'stage' => 'discovered',
            'tags' => $validated['tags'] ?? [],
        ]);

        $this->identityService->syncIdentifiers($prospect);
        $prospect->recordActivity('created', 'Prospect created manually by operator.');

        if ($request->boolean('auto_research') && $prospect->primary_url) {
            try {
                $this->auditService->audit($prospect);
                $this->aiService->synthesizeResearch($prospect);
                $this->aiService->analyzeOpportunities($prospect);
                $this->aiService->generateOutreachDraft($prospect, 'instagram_dm');
                $scores = $this->scoringService->calculate($prospect);
                $prospect->update([
                    'fit_score' => $scores['fit_score'],
                    'opportunity_score' => $scores['opportunity_score'],
                    'confidence_score' => $scores['confidence_score'],
                    'score_explanation' => $scores['score_explanation'],
                    'stage' => 'needs_review',
                    'last_researched_at' => now(),
                    'research_status' => 'completed',
                ]);
            } catch (Exception $e) {
                // Return created prospect even if immediate background audit had a warning
            }
        }

        return response()->json($prospect->fresh(['category', 'playbook', 'latestWebsiteAudit']), 201);
    }

    /**
     * Display comprehensive details for a single prospect.
     */
    public function show(int $id): JsonResponse
    {
        $prospect = Prospect::with([
            'category',
            'playbook',
            'sources',
            'observations',
            'websiteAudits',
            'opportunities',
            'drafts' => fn ($q) => $q->orderByDesc('version'),
            'sentMessages',
            'followUps' => fn ($q) => $q->orderBy('due_date'),
            'activities',
            'notes',
        ])->findOrFail($id);

        return response()->json($prospect);
    }

    /**
     * Update an existing prospect.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $prospect = Prospect::findOrFail($id);

        $validated = $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'category_playbook_id' => 'nullable|exists:category_playbooks,id',
            'primary_url' => 'nullable|string|max:500',
            'instagram_handle' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'stage' => 'nullable|string',
            'commercial_estimate' => 'nullable|numeric',
            'tags' => 'nullable|array',
            'is_do_not_contact' => 'nullable|boolean',
            'do_not_contact_reason' => 'nullable|string',
        ]);

        if (isset($validated['primary_url'])) {
            $validated['normalized_domain'] = $this->identityService->normalizeDomain($validated['primary_url']);
        }
        if (isset($validated['instagram_handle'])) {
            $validated['instagram_handle'] = $this->identityService->normalizeInstagramHandle($validated['instagram_handle']);
            $validated['instagram_url'] = $validated['instagram_handle'] ? "https://instagram.com/{$validated['instagram_handle']}" : null;
        }

        if (isset($validated['is_do_not_contact']) && $validated['is_do_not_contact'] && ! $prospect->is_do_not_contact) {
            $validated['do_not_contact_at'] = now();
            $prospect->recordActivity('do_not_contact', 'Prospect marked as Do Not Contact: ' . ($validated['do_not_contact_reason'] ?? 'Unspecified reason'));
        }

        $prospect->update($validated);
        $this->identityService->syncIdentifiers($prospect);

        return response()->json($prospect->fresh(['category', 'playbook']));
    }

    /**
     * Update CRM pipeline stage with audit trail.
     */
    public function updateStage(Request $request, int $id): JsonResponse
    {
        $prospect = Prospect::findOrFail($id);
        $validated = $request->validate([
            'stage' => 'required|string|in:discovered,researching,needs_review,qualified,ready_to_contact,draft_ready,contacted,replied,follow_up_due,meeting_booked,proposal_sent,won,lost,not_a_fit,do_not_contact',
            'notes' => 'nullable|string',
        ]);

        $oldStage = $prospect->stage;
        $newStage = $validated['stage'];

        $prospect->update(['stage' => $newStage]);
        $prospect->recordActivity('stage_changed', "Pipeline stage updated from '{$oldStage}' to '{$newStage}'", [
            'from' => $oldStage,
            'to' => $newStage,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($prospect);
    }

    /**
     * Trigger fresh research & scoring for this prospect.
     */
    public function research(int $id): JsonResponse
    {
        $prospect = Prospect::findOrFail($id);

        if (! $prospect->primary_url) {
            return response()->json(['message' => 'Prospect does not have a website URL to audit.'], 422);
        }

        try {
            $this->auditService->audit($prospect);
            $this->aiService->synthesizeResearch($prospect);
            $this->aiService->analyzeOpportunities($prospect);
            $this->aiService->generateOutreachDraft($prospect, 'instagram_dm');
            
            $scores = $this->scoringService->calculate($prospect);
            $prospect->update([
                'fit_score' => $scores['fit_score'],
                'opportunity_score' => $scores['opportunity_score'],
                'confidence_score' => $scores['confidence_score'],
                'score_explanation' => $scores['score_explanation'],
                'last_researched_at' => now(),
                'research_status' => 'completed',
            ]);

            $prospect->recordActivity('researched', "Manual re-research executed with updated scores: Fit {$scores['fit_score']}, Opportunity {$scores['opportunity_score']}");

            return response()->json($prospect->fresh(['latestWebsiteAudit', 'observations', 'opportunities', 'drafts']));
        } catch (Exception $e) {
            return response()->json(['message' => 'Research failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Add a manual note.
     */
    public function addNote(Request $request, int $id): JsonResponse
    {
        $prospect = Prospect::findOrFail($id);
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note = $prospect->notes()->create([
            'content' => $validated['content'],
        ]);

        $prospect->recordActivity('note_added', 'Added internal operator note.');

        return response()->json($note, 201);
    }

    /**
     * Export prospects as CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = Prospect::with(['category', 'playbook']);

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }

        $prospects = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="nebulascout_prospects_' . date('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($prospects) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID', 'Business Name', 'Category', 'Website', 'Instagram',
                'Location', 'Phone', 'Email', 'Stage', 'Fit Score',
                'Opportunity Score', 'Confidence Score', 'Commercial Estimate', 'Created At'
            ]);

            foreach ($prospects as $p) {
                fputcsv($file, [
                    $p->id,
                    $p->business_name,
                    $p->category?->name ?? 'Unassigned',
                    $p->primary_url,
                    $p->instagram_handle ? '@' . $p->instagram_handle : '',
                    $p->location,
                    $p->phone,
                    $p->email,
                    $p->stage,
                    $p->fit_score,
                    $p->opportunity_score,
                    $p->confidence_score,
                    $p->commercial_estimate,
                    $p->created_at->toIso8601String(),
                ]);
            }
            fclose($file);
        }, 200, $headers);
    }

    /**
     * Import prospects from CSV.
     */
    public function importCsv(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            return response()->json(['message' => 'Unable to read CSV file.'], 422);
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);
            return response()->json(['message' => 'CSV file is empty.'], 422);
        }

        $normalizedHeader = array_map(fn ($h) => strtolower(trim(str_replace([' ', '_', '-'], '', $h))), $header);

        $imported = 0;
        $skipped = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row))) {
                continue;
            }

            $data = [];
            foreach ($normalizedHeader as $idx => $key) {
                $data[$key] = $row[$idx] ?? null;
            }

            $name = $data['businessname'] ?? $data['name'] ?? $data['business'] ?? $data['company'] ?? null;
            $url = $data['website'] ?? $data['url'] ?? $data['primaryurl'] ?? null;
            $ig = $data['instagram'] ?? $data['instagramhandle'] ?? $data['handle'] ?? null;
            $location = $data['location'] ?? $data['city'] ?? null;
            $phone = $data['phone'] ?? null;
            $email = $data['email'] ?? null;

            if (! $name && ! $url) {
                continue;
            }

            $candidate = [
                'business_name' => $name ?: parse_url($url, PHP_URL_HOST),
                'primary_url' => $url,
                'instagram_handle' => $ig,
            ];

            // Deduplication
            if ($this->identityService->findExisting($candidate)) {
                $skipped++;
                continue;
            }

            try {
                $prospect = Prospect::create([
                    'category_id' => $request->input('category_id'),
                    'business_name' => $candidate['business_name'],
                    'normalized_domain' => $this->identityService->normalizeDomain($url),
                    'primary_url' => $url,
                    'instagram_handle' => $this->identityService->normalizeInstagramHandle($ig),
                    'location' => $location,
                    'phone' => $phone,
                    'email' => $email,
                    'stage' => 'discovered',
                    'tags' => ['CSV Import'],
                ]);
                $this->identityService->syncIdentifiers($prospect);
                $prospect->recordActivity('created', 'Imported via CSV file.');
                $imported++;
            } catch (Exception $e) {
                $errors[] = $e->getMessage();
            }
        }
        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'skipped_duplicates' => $skipped,
            'errors' => $errors,
        ]);
    }

    /**
     * Delete a prospect.
     */
    public function destroy(int $id): JsonResponse
    {
        $prospect = Prospect::findOrFail($id);
        $prospect->delete();

        return response()->json(['message' => 'Prospect deleted successfully.']);
    }
}
