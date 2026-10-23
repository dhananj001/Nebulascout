<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\Category;
use App\Models\FollowUp;
use App\Models\OutreachActivity;
use App\Models\OutreachDraft;
use App\Models\Prospect;
use App\Models\SentMessage;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    /**
     * Compute actual recorded metrics and learning loop statistics.
     */
    public function index(): JsonResponse
    {
        $totalProspects = Prospect::count();
        $qualifiedProspects = Prospect::whereIn('stage', ['qualified', 'ready_to_contact', 'draft_ready', 'contacted', 'replied', 'meeting_booked', 'proposal_sent', 'won'])->count();
        $draftsCount = OutreachDraft::count();
        $confirmedSentCount = SentMessage::count();
        
        $repliedCount = Prospect::whereIn('stage', ['replied', 'meeting_booked', 'proposal_sent', 'won'])->count();
        $meetingsCount = Prospect::whereIn('stage', ['meeting_booked', 'proposal_sent', 'won'])->count();
        $proposalsCount = Prospect::whereIn('stage', ['proposal_sent', 'won'])->count();
        $wonCount = Prospect::where('stage', 'won')->count();

        // Exact denominator calculations
        // Reply Rate: confirmed sent messages as denominator (never unsent drafts or discovered leads)
        $replyRatePercent = $confirmedSentCount > 0 
            ? round(($repliedCount / $confirmedSentCount) * 100, 1) 
            : 0;

        $meetingConversionPercent = $repliedCount > 0 
            ? round(($meetingsCount / $repliedCount) * 100, 1) 
            : 0;

        $wonRevenue = Prospect::where('stage', 'won')->sum('commercial_estimate') ?: 0;
        $pipelineValue = Prospect::whereNotIn('stage', ['lost', 'not_a_fit', 'do_not_contact'])->sum('commercial_estimate') ?: 0;

        // Stage Breakdown
        $stages = [
            'discovered' => Prospect::where('stage', 'discovered')->count(),
            'needs_review' => Prospect::where('stage', 'needs_review')->count(),
            'qualified' => Prospect::where('stage', 'qualified')->count(),
            'ready_to_contact' => Prospect::where('stage', 'ready_to_contact')->count(),
            'draft_ready' => Prospect::where('stage', 'draft_ready')->count(),
            'contacted' => Prospect::where('stage', 'contacted')->count(),
            'replied' => Prospect::where('stage', 'replied')->count(),
            'meeting_booked' => Prospect::where('stage', 'meeting_booked')->count(),
            'proposal_sent' => Prospect::where('stage', 'proposal_sent')->count(),
            'won' => $wonCount,
            'lost' => Prospect::where('stage', 'lost')->count(),
            'not_a_fit' => Prospect::where('stage', 'not_a_fit')->count(),
            'do_not_contact' => Prospect::where('stage', 'do_not_contact')->count(),
        ];

        // By Category Performance
        $categoryBreakdown = Category::withCount(['prospects', 'prospects as contacted_count' => function ($q) {
            $q->whereIn('stage', ['contacted', 'replied', 'meeting_booked', 'proposal_sent', 'won']);
        }, 'prospects as replied_count' => function ($q) {
            $q->whereIn('stage', ['replied', 'meeting_booked', 'proposal_sent', 'won']);
        }])->get()->map(fn ($cat) => [
            'category_id' => $cat->id,
            'name' => $cat->name,
            'prospects_count' => $cat->prospects_count,
            'contacted_count' => $cat->contacted_count,
            'replied_count' => $cat->replied_count,
            'reply_rate' => $cat->contacted_count > 0 ? round(($cat->replied_count / $cat->contacted_count) * 100, 1) : null,
        ]);

        // Follow-Up Metrics
        $pendingFollowUps = FollowUp::where('status', 'pending')->count();
        $overdueFollowUps = FollowUp::where('status', 'pending')->where('due_date', '<', now()->startOfDay())->count();

        // AI Usage Summary
        $aiTotalTokens = AiUsageLog::sum('prompt_tokens') + AiUsageLog::sum('completion_tokens');
        $aiTotalCost = (float) AiUsageLog::sum('estimated_cost');
        $aiCallsCount = AiUsageLog::count();

        // Recent Activity Feed
        $recentActivity = OutreachActivity::with('prospect')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_prospects' => $totalProspects,
                'qualified_prospects' => $qualifiedProspects,
                'drafts_generated' => $draftsCount,
                'confirmed_sent' => $confirmedSentCount,
                'replied' => $repliedCount,
                'meetings_booked' => $meetingsCount,
                'proposals_sent' => $proposalsCount,
                'deals_won' => $wonCount,
                'reply_rate_percent' => $replyRatePercent,
                'meeting_conversion_percent' => $meetingConversionPercent,
                'won_revenue' => $wonRevenue,
                'pipeline_value' => $pipelineValue,
                'has_sufficient_sample' => $confirmedSentCount >= 10,
            ],
            'pipeline_stages' => $stages,
            'categories' => $categoryBreakdown,
            'follow_ups' => [
                'pending' => $pendingFollowUps,
                'overdue' => $overdueFollowUps,
            ],
            'ai_usage' => [
                'total_calls' => $aiCallsCount,
                'total_tokens' => $aiTotalTokens,
                'estimated_spend_usd' => $aiTotalCost,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }
}
