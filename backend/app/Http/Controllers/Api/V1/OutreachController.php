<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use App\Models\OutreachDraft;
use App\Models\Prospect;
use App\Models\SentMessage;
use App\Services\Ai\GeminiAiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutreachController extends Controller
{
    public function __construct(
        protected GeminiAiService $aiService,
    ) {}

    /**
     * Generate a new AI draft for a prospect.
     */
    public function generateDraft(Request $request, int $prospectId): JsonResponse
    {
        $prospect = Prospect::findOrFail($prospectId);
        $channel = $request->input('channel', 'instagram_dm');

        try {
            $draft = $this->aiService->generateOutreachDraft($prospect, $channel);
            $prospect->recordActivity('draft_generated', "New {$channel} outreach draft generated (Version {$draft->version}).", [
                'channel' => $channel,
                'draft_id' => $draft->id,
            ]);

            return response()->json($draft, 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to generate draft: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update an editable draft.
     */
    public function updateDraft(Request $request, int $draftId): JsonResponse
    {
        $draft = OutreachDraft::findOrFail($draftId);
        $validated = $request->validate([
            'body' => 'required|string',
            'subject' => 'nullable|string|max:255',
            'angle' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,reviewed,copied,superseded',
        ]);

        $draft->update($validated);

        return response()->json($draft);
    }

    /**
     * Copy draft action: Logs copy activity but NEVER marks message sent.
     */
    public function copyDraft(int $draftId): JsonResponse
    {
        $draft = OutreachDraft::with('prospect')->findOrFail($draftId);

        // Update status to copied if currently draft
        if ($draft->status === 'draft') {
            $draft->update(['status' => 'copied']);
        }

        $draft->prospect->recordActivity('draft_copied', "Operator copied {$draft->channel} draft to clipboard.", [
            'draft_id' => $draft->id,
            'channel' => $draft->channel,
        ]);

        return response()->json([
            'message' => 'Draft copied to clipboard. Message remains unsent until explicitly confirmed.',
            'draft' => $draft,
            'channel' => $draft->channel,
        ]);
    }

    /**
     * Explicit Operator Confirmation of Manual Send.
     * Stores immutable record in sent_messages and moves stage to 'contacted'.
     */
    public function confirmSent(Request $request, int $draftId): JsonResponse
    {
        $draft = OutreachDraft::with('prospect')->findOrFail($draftId);
        $prospect = $draft->prospect;

        $validated = $request->validate([
            'exact_sent_text' => 'required|string',
            'channel' => 'required|string',
            'schedule_follow_up_days' => 'nullable|integer|min:1|max:90',
            'follow_up_reason' => 'nullable|string',
        ]);

        $sentMessage = SentMessage::create([
            'prospect_id' => $prospect->id,
            'outreach_draft_id' => $draft->id,
            'channel' => $validated['channel'],
            'exact_sent_text' => $validated['exact_sent_text'],
            'sent_at' => now(),
        ]);

        $draft->update(['status' => 'sent']);
        $prospect->update(['stage' => 'contacted']);

        $prospect->recordActivity('message_sent', "Message manually confirmed sent via {$validated['channel']}.", [
            'sent_message_id' => $sentMessage->id,
            'channel' => $validated['channel'],
            'sent_at' => now()->toIso8601String(),
        ]);

        // Optional automatic follow-up task
        if (! empty($validated['schedule_follow_up_days'])) {
            $days = (int) $validated['schedule_follow_up_days'];
            $followUp = FollowUp::create([
                'prospect_id' => $prospect->id,
                'due_date' => now()->addDays($days),
                'reason' => $validated['follow_up_reason'] ?? "Check for reply to {$validated['channel']} outreach",
                'status' => 'pending',
                'priority' => 'medium',
            ]);
            $prospect->recordActivity('follow_up_scheduled', "Follow-up scheduled for {$followUp->due_date->format('Y-m-d')}.");
        }

        return response()->json([
            'message' => 'Message successfully marked sent with immutable audit record.',
            'sent_message' => $sentMessage,
            'prospect_stage' => 'contacted',
        ], 201);
    }

    /**
     * Record a manual reply from the prospect.
     */
    public function recordReply(Request $request, int $prospectId): JsonResponse
    {
        $prospect = Prospect::findOrFail($prospectId);
        $validated = $request->validate([
            'channel' => 'required|string',
            'reply_text' => 'nullable|string',
            'sentiment' => 'required|string|in:positive,neutral,not_interested,opt_out',
            'notes' => 'nullable|string',
            'new_stage' => 'nullable|string|in:replied,meeting_booked,proposal_sent,not_a_fit,do_not_contact',
        ]);

        $sentiment = $validated['sentiment'];
        $newStage = $validated['new_stage'] ?? ($sentiment === 'not_interested' ? 'not_a_fit' : ($sentiment === 'opt_out' ? 'do_not_contact' : 'replied'));

        if ($sentiment === 'opt_out') {
            $prospect->update([
                'stage' => 'do_not_contact',
                'is_do_not_contact' => true,
                'do_not_contact_reason' => 'Prospect requested opt-out during reply.',
                'do_not_contact_at' => now(),
            ]);
        } else {
            $prospect->update(['stage' => $newStage]);
        }

        $prospect->recordActivity('reply_recorded', "Recorded {$sentiment} reply via {$validated['channel']}.", [
            'sentiment' => $sentiment,
            'channel' => $validated['channel'],
            'reply_text' => $validated['reply_text'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Reply recorded successfully.',
            'prospect' => $prospect->fresh(),
        ]);
    }
}
