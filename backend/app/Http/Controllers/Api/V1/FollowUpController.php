<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use App\Models\Prospect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowUpController extends Controller
{
    /**
     * List follow-ups with grouping (overdue, due today, upcoming).
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');
        $query = FollowUp::with('prospect.category');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $all = $query->orderBy('due_date')->get();

        $today = now()->startOfDay();
        $overdue = $all->filter(fn ($f) => $f->status === 'pending' && $f->due_date->startOfDay()->lt($today));
        $dueToday = $all->filter(fn ($f) => $f->status === 'pending' && $f->due_date->startOfDay()->equalTo($today));
        $upcoming = $all->filter(fn ($f) => $f->status === 'pending' && $f->due_date->startOfDay()->gt($today));
        $completed = $all->filter(fn ($f) => $f->status === 'completed');

        return response()->json([
            'counts' => [
                'overdue' => $overdue->count(),
                'due_today' => $dueToday->count(),
                'upcoming' => $upcoming->count(),
                'total_pending' => $overdue->count() + $dueToday->count() + $upcoming->count(),
            ],
            'overdue' => $overdue->values(),
            'due_today' => $dueToday->values(),
            'upcoming' => $upcoming->values(),
            'completed' => $completed->values(),
        ]);
    }

    /**
     * Create a follow-up.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prospect_id' => 'required|exists:prospects,id',
            'due_date' => 'required|date',
            'reason' => 'required|string|max:255',
            'priority' => 'nullable|string|in:low,medium,high',
            'suggested_angle' => 'nullable|string',
        ]);

        $followUp = FollowUp::create($validated);
        $prospect = Prospect::find($validated['prospect_id']);
        $prospect->recordActivity('follow_up_scheduled', "Follow-up scheduled for {$followUp->due_date->format('Y-m-d')}: {$followUp->reason}");

        return response()->json($followUp->load('prospect'), 201);
    }

    /**
     * Update follow-up status or due date.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $followUp = FollowUp::with('prospect')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|string|in:pending,completed,skipped',
            'due_date' => 'nullable|date',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && $followUp->status !== 'completed') {
            $validated['completed_at'] = now();
            $followUp->prospect->recordActivity('follow_up_completed', "Completed follow-up: {$followUp->reason}");
        }

        $followUp->update($validated);

        return response()->json($followUp);
    }
}
