<?php

namespace Tests\Feature;

use App\Models\DailySprint;
use App\Models\Prospect;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailySprintWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_manual_reachout_reporting_and_workflow_tracking(): void
    {
        // 1. Get today's sprint
        $res = $this->getJson('/api/v1/sprint/today');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'sprint' => ['sprint_date', 'target_count', 'completed_count', 'status'],
                'stats' => ['target_count', 'completed_count', 'progress_percent', 'streak_count', 'milestones'],
                'follow_ups' => ['due_today', 'upcoming'],
                'calendar',
            ]);

        // 2. Update target reachout goal
        $targetRes = $this->postJson('/api/v1/sprint/target', [
            'target_count' => 25,
        ]);
        $targetRes->assertStatus(200);
        $this->assertEquals(25, DailySprint::first()->target_count);

        // 3. Manually log a WhatsApp outreach
        $reachoutRes = $this->postJson('/api/v1/sprint/log-reachout', [
            'business_name' => 'Zenith Architectural Studio',
            'channel' => 'whatsapp',
            'contact_handle' => '+91 98765 43210',
            'pitch_notes' => 'Sent interactive redesign concept for their villa portfolio',
            'schedule_follow_up_days' => 3,
            'follow_up_reason' => 'Check if principal saw the portfolio concept',
        ]);
        $reachoutRes->assertStatus(200);
        $this->assertEquals(1, $reachoutRes->json('stats.completed_count'));

        $prospect = Prospect::where('business_name', 'Zenith Architectural Studio')->first();
        $this->assertNotNull($prospect);
        $this->assertEquals('+91 98765 43210', $prospect->phone);
        $this->assertEquals('contacted', $prospect->stage);

        // Check scheduled follow-up
        $followUp = $prospect->followUps()->where('status', 'pending')->first();
        $this->assertNotNull($followUp);
        $this->assertEquals('Check if principal saw the portfolio concept', $followUp->reason);

        // 4. Manually log an Instagram outreach
        $instaRes = $this->postJson('/api/v1/sprint/log-reachout', [
            'business_name' => 'Nova Interior Design',
            'channel' => 'instagram_dm',
            'contact_handle' => '@nova.interiors',
            'pitch_notes' => 'Pitched mobile site optimization and enquiry form fix',
            'schedule_follow_up_days' => 2,
        ]);
        $instaRes->assertStatus(200);
        $this->assertEquals(2, $instaRes->json('stats.completed_count'));

        $nova = Prospect::where('business_name', 'Nova Interior Design')->first();
        $this->assertNotNull($nova);
        $this->assertEquals('nova.interiors', $nova->instagram_handle);

        // 5. Record a reply
        $replyRes = $this->postJson('/api/v1/sprint/record-reply', [
            'prospect_id' => $prospect->id,
            'reply_sentiment' => 'interested',
            'reply_text' => 'Loved the concept, let us connect over a call on Friday.',
            'next_follow_up_days' => 2,
            'next_follow_up_reason' => 'Discovery call scheduled for Friday',
        ]);
        $replyRes->assertStatus(200);
        $this->assertEquals('meeting_booked', $prospect->fresh()->stage);

        // 6. Log a follow-up sent to Nova
        $novaFollowUp = $nova->followUps()->where('status', 'pending')->first();
        $this->assertNotNull($novaFollowUp);

        $followUpSentRes = $this->postJson('/api/v1/sprint/log-followup', [
            'follow_up_id' => $novaFollowUp->id,
            'channel' => 'instagram_dm',
            'sent_text' => 'Hey team, following up on the portfolio breakdown.',
            'next_follow_up_days' => 3,
        ]);
        $followUpSentRes->assertStatus(200);
        $this->assertEquals('completed', $novaFollowUp->fresh()->status);
    }
}
