<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryPlaybook;
use App\Models\OutreachDraft;
use App\Models\Prospect;
use App\Services\Audit\WebsiteAuditService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NebulaScoutWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_health_and_providers_endpoints(): void
    {
        $response = $this->getJson('/api/v1/health');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'operational')
            ->assertJsonPath('database', 'healthy');

        $providers = $this->getJson('/api/v1/providers');
        $providers->assertStatus(200)
            ->assertJsonStructure(['ai', 'search', 'audit', 'instagram']);
    }

    public function test_prospect_listing_and_filtering(): void
    {
        $response = $this->getJson('/api/v1/prospects');
        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total']);

        $this->assertGreaterThan(0, $response->json('total'));
    }

    public function test_prospect_deduplication(): void
    {
        $category = Category::first();

        // 1. Create first prospect
        $first = $this->postJson('/api/v1/prospects', [
            'business_name' => 'Studio Obsidian',
            'primary_url' => 'https://obsidianstudio.co',
            'instagram_handle' => 'obsidian.studio',
            'category_id' => $category->id,
        ]);
        $first->assertStatus(201);

        // 2. Attempt creating duplicate by domain
        $dupDomain = $this->postJson('/api/v1/prospects', [
            'business_name' => 'Obsidian Architecture',
            'primary_url' => 'https://www.obsidianstudio.co/projects',
        ]);
        $dupDomain->assertStatus(409)
            ->assertJsonPath('duplicate', true);

        // 3. Attempt creating duplicate by Instagram handle
        $dupInstagram = $this->postJson('/api/v1/prospects', [
            'business_name' => 'Obsidian Design',
            'instagram_handle' => '@obsidian.studio',
        ]);
        $dupInstagram->assertStatus(409)
            ->assertJsonPath('duplicate', true);
    }

    public function test_outreach_copy_does_not_mark_sent(): void
    {
        $prospect = Prospect::first();
        $draft = OutreachDraft::create([
            'prospect_id' => $prospect->id,
            'channel' => 'instagram_dm',
            'body' => 'Test draft text for architectural client',
            'status' => 'draft',
        ]);

        $this->assertEquals('draft_ready', $prospect->stage);

        // Copy action
        $response = $this->postJson("/api/v1/outreach/drafts/{$draft->id}/copy");
        $response->assertStatus(200);

        // Assert draft status is copied, but message is NOT marked sent, prospect stage is still not 'contacted'
        $draft->refresh();
        $prospect->refresh();

        $this->assertEquals('copied', $draft->status);
        $this->assertNotEquals('contacted', $prospect->stage);
        $this->assertDatabaseMissing('sent_messages', ['outreach_draft_id' => $draft->id]);
    }

    public function test_confirm_sent_records_immutable_sent_message_and_updates_stage(): void
    {
        $prospect = Prospect::first();
        $draft = OutreachDraft::create([
            'prospect_id' => $prospect->id,
            'channel' => 'instagram_dm',
            'body' => 'Admiring your Cliff House basalt project.',
            'status' => 'copied',
        ]);

        $confirmResponse = $this->postJson("/api/v1/outreach/drafts/{$draft->id}/confirm-sent", [
            'exact_sent_text' => 'Admiring your Cliff House basalt project. Sent via Instagram.',
            'channel' => 'instagram_dm',
            'schedule_follow_up_days' => 4,
            'follow_up_reason' => 'Check DM inbox for reply',
        ]);

        $confirmResponse->assertStatus(201);

        $prospect->refresh();
        $draft->refresh();

        $this->assertEquals('contacted', $prospect->stage);
        $this->assertEquals('sent', $draft->status);

        $this->assertDatabaseHas('sent_messages', [
            'prospect_id' => $prospect->id,
            'outreach_draft_id' => $draft->id,
            'channel' => 'instagram_dm',
            'exact_sent_text' => 'Admiring your Cliff House basalt project. Sent via Instagram.',
        ]);

        // Verify follow-up task was scheduled
        $this->assertDatabaseHas('follow_ups', [
            'prospect_id' => $prospect->id,
            'reason' => 'Check DM inbox for reply',
            'status' => 'pending',
        ]);
    }

    public function test_recording_reply_updates_stage_and_analytics(): void
    {
        $prospect = Prospect::first();
        $prospect->update(['stage' => 'contacted']);

        $response = $this->postJson("/api/v1/outreach/prospects/{$prospect->id}/reply", [
            'channel' => 'instagram_dm',
            'reply_text' => 'Thanks for reaching out! We are interested in reviewing the concept.',
            'sentiment' => 'positive',
            'new_stage' => 'replied',
        ]);

        $response->assertStatus(200);
        $prospect->refresh();
        $this->assertEquals('replied', $prospect->stage);

        // Check Analytics endpoint
        $analytics = $this->getJson('/api/v1/analytics');
        $analytics->assertStatus(200)
            ->assertJsonPath('summary.replied', 1);
    }

    public function test_ssrf_protection_blocks_restricted_ips(): void
    {
        $auditService = app(WebsiteAuditService::class);
        $prospect = Prospect::first();

        // 1. Localhost
        $this->expectException(Exception::class);
        $auditService->audit($prospect, 'http://localhost/secret-admin');
    }

    public function test_ssrf_protection_blocks_loopback_ip(): void
    {
        $auditService = app(WebsiteAuditService::class);
        $prospect = Prospect::first();

        $this->expectException(Exception::class);
        $auditService->audit($prospect, 'http://127.0.0.1:8000/internal-api');
    }

    public function test_ssrf_protection_blocks_cloud_metadata(): void
    {
        $auditService = app(WebsiteAuditService::class);
        $prospect = Prospect::first();

        $this->expectException(Exception::class);
        $auditService->audit($prospect, 'http://169.254.169.254/latest/meta-data');
    }
}
