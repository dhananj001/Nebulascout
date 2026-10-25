<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DailySprint;
use App\Models\DailySprintItem;
use App\Models\FollowUp;
use App\Models\Prospect;
use App\Models\SentMessage;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailySprintController extends Controller
{
    /**
     * Get or initialize today's Daily Sprint data.
     */
    public function getToday(): JsonResponse
    {
        $sprint = DailySprint::getOrCreateToday();

        // Load items with full prospect details and eager relations
        $sprint->load([
            'items' => function ($q) {
                $q->orderByDesc('completed_at')->orderBy('sort_order');
            },
            'items.prospect.category',
            'items.prospect.followUps',
            'items.prospect.sentMessages',
            'items.prospect.activities',
            'items.prospect.latestWebsiteAudit',
        ]);

        // Compute 7-day streak calendar history
        $calendar = [];
        $today = Carbon::today();
        for ($i = 6; $i >= 0; $i--) {
            $d = $today->copy()->subDays($i);
            $dayStr = $d->toDateString();
            $past = DailySprint::whereDate('sprint_date', $dayStr)->first();
            $calendar[] = [
                'date' => $dayStr,
                'day_label' => $d->format('D'),
                'day_num' => $d->format('j'),
                'is_today' => $i === 0,
                'target_count' => $past ? $past->target_count : 25,
                'completed_count' => $past ? $past->completed_count : 0,
                'achieved' => $past ? ($past->completed_count >= $past->target_count) : false,
                'has_activity' => $past ? ($past->completed_count > 0) : false,
            ];
        }

        // Strictly isolate follow-ups and replies to ONLY manually reported prospects in this sprint
        $prospectIdsInSprint = $sprint->items->pluck('prospect_id')->filter()->unique()->toArray();

        $pendingFollowUps = empty($prospectIdsInSprint)
            ? collect()
            : FollowUp::with('prospect')
                ->whereIn('prospect_id', $prospectIdsInSprint)
                ->where('status', 'pending')
                ->orderBy('due_date')
                ->get();

        $dueTodayFollowUps = $pendingFollowUps->filter(fn ($f) => $f->due_date && (Carbon::parse($f->due_date)->isToday() || Carbon::parse($f->due_date)->isPast()))->values();
        $upcomingFollowUps = $pendingFollowUps->filter(fn ($f) => $f->due_date && Carbon::parse($f->due_date)->isFuture() && ! Carbon::parse($f->due_date)->isToday())->values();

        // Count replies among manually logged prospects
        $repliedCount = empty($prospectIdsInSprint)
            ? 0
            : Prospect::whereIn('id', $prospectIdsInSprint)
                ->whereIn('stage', ['replied', 'meeting_booked', 'proposal_sent', 'won'])
                ->count();

        // Calculate milestone badges based purely on discipline and effort
        $completed = $sprint->completed_count;
        $target = $sprint->target_count;
        $milestones = [
            'bronze' => ['label' => 'Warmup (5 Reachouts)', 'threshold' => 5, 'unlocked' => $completed >= 5],
            'silver' => ['label' => 'Flow State (15 Reachouts)', 'threshold' => 15, 'unlocked' => $completed >= 15],
            'gold' => ['label' => "Daily Goal ({$target} Reachouts)", 'threshold' => $target, 'unlocked' => $completed >= $target],
        ];

        return response()->json([
            'sprint' => $sprint,
            'stats' => [
                'target_count' => $sprint->target_count,
                'completed_count' => $sprint->completed_count,
                'progress_percent' => $sprint->progress_percent,
                'streak_count' => $sprint->streak_count,
                'replied_count' => $repliedCount,
                'due_follow_ups_count' => $dueTodayFollowUps->count(),
                'milestones' => $milestones,
            ],
            'follow_ups' => [
                'due_today' => $dueTodayFollowUps,
                'upcoming' => $upcomingFollowUps,
            ],
            'calendar' => $calendar,
        ]);
    }

    /**
     * Update today's target count.
     */
    public function updateTarget(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_count' => 'required|integer|min:5|max:100',
            'target_niche' => 'nullable|string',
        ]);

        $sprint = DailySprint::getOrCreateToday();
        $sprint->update($validated);

        return $this->getToday();
    }

    /**
     * Completely manual outreach logger:
     * Report an outreach message sent on WhatsApp, Instagram, Phone, Email, etc.
     */
    public function logReachout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'channel' => 'required|string', // whatsapp, instagram_dm, phone_call, email, linkedin, website_contact
            'contact_handle' => 'nullable|string|max:255', // phone number, @handle, email
            'website_url' => 'nullable|string|max:255',
            'pitch_notes' => 'nullable|string',
            'category_name' => 'nullable|string',
            'schedule_follow_up_days' => 'nullable|integer|min:1|max:30',
            'follow_up_reason' => 'nullable|string',
        ]);

        $sprint = DailySprint::getOrCreateToday();
        $channel = $validated['channel'];
        $handle = trim($validated['contact_handle'] ?? '');
        $name = trim($validated['business_name']);

        // Find or create Prospect record
        $prospect = null;
        if (! empty($handle)) {
            if ($channel === 'instagram_dm') {
                $cleanHandle = ltrim($handle, '@');
                $prospect = Prospect::where('instagram_handle', $cleanHandle)->first();
            } elseif ($channel === 'whatsapp' || $channel === 'phone_call') {
                $prospect = Prospect::where('phone', $handle)->first();
            } elseif ($channel === 'email') {
                $prospect = Prospect::where('email', $handle)->first();
            }
        }

        if (! $prospect) {
            $prospect = Prospect::where('business_name', $name)->first();
        }

        if (! $prospect) {
            $prospectData = [
                'business_name' => $name,
                'stage' => 'contacted',
                'fit_score' => 80,
                'opportunity_score' => 80,
            ];

            if (! empty($validated['website_url'])) {
                $prospectData['primary_url'] = $validated['website_url'];
            }

            if (! empty($handle)) {
                if ($channel === 'instagram_dm') {
                    $cleanHandle = ltrim($handle, '@');
                    $prospectData['instagram_handle'] = $cleanHandle;
                    $prospectData['instagram_url'] = "https://instagram.com/{$cleanHandle}";
                } elseif ($channel === 'whatsapp' || $channel === 'phone_call') {
                    $prospectData['phone'] = $handle;
                } elseif ($channel === 'email') {
                    $prospectData['email'] = $handle;
                }
            }

            $prospect = Prospect::create($prospectData);
        } else {
            $prospect->update(['stage' => 'contacted']);
            if (! empty($handle)) {
                if ($channel === 'instagram_dm' && empty($prospect->instagram_handle)) {
                    $cleanHandle = ltrim($handle, '@');
                    $prospect->update([
                        'instagram_handle' => $cleanHandle,
                        'instagram_url' => "https://instagram.com/{$cleanHandle}",
                    ]);
                } elseif (($channel === 'whatsapp' || $channel === 'phone_call') && empty($prospect->phone)) {
                    $prospect->update(['phone' => $handle]);
                }
            }
        }

        // Record permanent Sent Message
        $messageText = ! empty($validated['pitch_notes'])
            ? $validated['pitch_notes']
            : "Sent initial pitch via {$channel} to {$name}";

        SentMessage::create([
            'prospect_id' => $prospect->id,
            'channel' => $channel,
            'exact_sent_text' => $messageText,
            'sent_at' => now(),
        ]);

        // Schedule automated follow-up reminder
        $followUpDays = $validated['schedule_follow_up_days'] ?? 3;
        FollowUp::create([
            'prospect_id' => $prospect->id,
            'due_date' => now()->addDays($followUpDays),
            'reason' => $validated['follow_up_reason'] ?? "Touch #2: Follow-up on {$channel} outreach",
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        // Add or update Daily Sprint Item
        $item = DailySprintItem::where('daily_sprint_id', $sprint->id)
            ->where('prospect_id', $prospect->id)
            ->first();

        if (! $item) {
            $maxOrder = DailySprintItem::where('daily_sprint_id', $sprint->id)->max('sort_order') ?? 0;
            $item = DailySprintItem::create([
                'daily_sprint_id' => $sprint->id,
                'prospect_id' => $prospect->id,
                'sort_order' => $maxOrder + 1,
                'status' => 'completed',
                'preferred_channel' => $channel,
                'completed_at' => now(),
            ]);
        } else {
            $item->update([
                'status' => 'completed',
                'preferred_channel' => $channel,
                'completed_at' => now(),
            ]);
        }

        // Update sprint completed count
        $completedCount = DailySprintItem::where('daily_sprint_id', $sprint->id)
            ->where('status', 'completed')
            ->count();

        $updateData = ['completed_count' => $completedCount];
        if ($completedCount >= $sprint->target_count) {
            $updateData['status'] = 'completed';
            $updateData['completed_at'] = now();
        }
        $sprint->update($updateData);

        // Record activity log
        $prospect->recordActivity('message_sent', "Daily Sprint: Logged outreach via {$channel}.", [
            'sprint_id' => $sprint->id,
            'channel' => $channel,
            'handle' => $handle,
        ]);

        return $this->getToday();
    }

    /**
     * Record a prospect's reply and update workflow.
     */
    public function recordReply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prospect_id' => 'required|integer',
            'reply_sentiment' => 'required|string', // interested, curious, price_check, not_now, not_interested
            'reply_text' => 'nullable|string',
            'next_follow_up_days' => 'nullable|integer|min:1|max:30',
            'next_follow_up_reason' => 'nullable|string',
        ]);

        $prospect = Prospect::findOrFail($validated['prospect_id']);

        // Stage mapping
        $newStage = match ($validated['reply_sentiment']) {
            'interested' => 'meeting_booked',
            'curious', 'price_check' => 'replied',
            'not_now' => 'replied',
            'not_interested' => 'not_a_fit',
            default => 'replied',
        };

        $prospect->update(['stage' => $newStage]);

        // Complete any pending follow-up
        FollowUp::where('prospect_id', $prospect->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        // Schedule new follow-up if requested
        if (! empty($validated['next_follow_up_days'])) {
            FollowUp::create([
                'prospect_id' => $prospect->id,
                'due_date' => now()->addDays((int) $validated['next_follow_up_days']),
                'reason' => $validated['next_follow_up_reason'] ?? "Follow up on reply: {$validated['reply_sentiment']}",
                'status' => 'pending',
                'priority' => 'high',
            ]);
        }

        $prospect->recordActivity('reply_recorded', "Recorded reply: {$validated['reply_sentiment']}. " . ($validated['reply_text'] ?? ''), [
            'sentiment' => $validated['reply_sentiment'],
            'reply_text' => $validated['reply_text'] ?? null,
        ]);

        return $this->getToday();
    }

    /**
     * Log a follow-up nudge sent to an existing prospect.
     */
    public function logFollowUpSent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'follow_up_id' => 'required|integer',
            'channel' => 'required|string',
            'sent_text' => 'nullable|string',
            'next_follow_up_days' => 'nullable|integer|min:1|max:30',
        ]);

        $followUp = FollowUp::with('prospect')->findOrFail($validated['follow_up_id']);
        $prospect = $followUp->prospect;

        $followUp->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        SentMessage::create([
            'prospect_id' => $prospect->id,
            'channel' => $validated['channel'],
            'exact_sent_text' => $validated['sent_text'] ?? "Sent follow-up nudge via {$validated['channel']}",
            'sent_at' => now(),
        ]);

        if (! empty($validated['next_follow_up_days'])) {
            FollowUp::create([
                'prospect_id' => $prospect->id,
                'due_date' => now()->addDays((int) $validated['next_follow_up_days']),
                'reason' => "Touch #3: Final follow-up on {$validated['channel']}",
                'status' => 'pending',
                'priority' => 'medium',
            ]);
        }

        $prospect->recordActivity('follow_up_sent', "Sent follow-up nudge via {$validated['channel']}.");

        return $this->getToday();
    }

    /**
     * Remove an item from today's sprint if logged in error.
     */
    public function deleteItem(int $id): JsonResponse
    {
        $item = DailySprintItem::findOrFail($id);
        $sprintId = $item->daily_sprint_id;
        $item->delete();

        $sprint = DailySprint::find($sprintId);
        if ($sprint) {
            $completedCount = DailySprintItem::where('daily_sprint_id', $sprint->id)
                ->where('status', 'completed')
                ->count();
            $sprint->update(['completed_count' => $completedCount]);
        }

        return $this->getToday();
    }
}
