<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ResearchRun;
use App\Services\Research\ResearchOrchestrator;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResearchRunController extends Controller
{
    public function __construct(
        protected ResearchOrchestrator $orchestrator,
    ) {}

    /**
     * List recent research runs.
     */
    public function index(): JsonResponse
    {
        $runs = ResearchRun::with('playbook')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($runs);
    }

    /**
     * Launch a new research run.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_playbook_id' => 'nullable|exists:category_playbooks,id',
            'category_name' => 'nullable|string|max:255',
            'location_query' => 'nullable|string|max:255',
            'query' => 'nullable|string|max:255',
            'mode' => 'nullable|string|in:quick,deep',
            'manual_url' => 'nullable|string|max:500',
            'business_name' => 'nullable|string|max:255',
            'instagram_handle' => 'nullable|string|max:100',
        ]);

        try {
            $run = $this->orchestrator->executeRun($validated);
            return response()->json($run, 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to execute research run: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * View details of a specific research run.
     */
    public function show(int $id): JsonResponse
    {
        $run = ResearchRun::with(['playbook', 'sources.prospect'])->findOrFail($id);
        return response()->json($run);
    }
}
