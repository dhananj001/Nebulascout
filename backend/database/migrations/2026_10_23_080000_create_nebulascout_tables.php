<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Category Playbooks
        Schema::create('category_playbooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('ideal_customer_profile')->nullable();
            $table->json('search_terms')->nullable();
            $table->string('default_geography')->nullable();
            $table->json('research_questions')->nullable();
            $table->json('desired_attributes')->nullable();
            $table->json('opportunity_criteria')->nullable();
            $table->json('disqualifiers')->nullable();
            $table->json('scoring_weights')->nullable();
            $table->json('preferred_services')->nullable();
            $table->string('outreach_tone')->default('editorial');
            $table->json('prohibited_claims')->nullable();
            $table->json('sample_messages')->nullable();
            $table->integer('re_research_days')->default(60);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 3. Prospects
        Schema::create('prospects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_playbook_id')->nullable()->constrained()->nullOnDelete();
            $table->string('business_name');
            $table->string('normalized_domain')->nullable()->index();
            $table->string('primary_url')->nullable();
            $table->string('instagram_handle')->nullable()->index();
            $table->string('instagram_url')->nullable();
            $table->string('location')->nullable()->index();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // CRM Stage & Status
            $table->string('stage')->default('discovered')->index();
            // Discovered, Researching, Needs review, Qualified, Ready to contact, Draft ready, Contacted, Replied, Follow-up due, Meeting booked, Proposal sent, Won, Lost, Not a fit, Do not contact
            
            // Quantitative scoring (0-100)
            $table->unsignedTinyInteger('fit_score')->default(0);
            $table->unsignedTinyInteger('opportunity_score')->default(0);
            $table->unsignedTinyInteger('confidence_score')->default(0);
            $table->json('score_explanation')->nullable();
            
            // Research metadata
            $table->string('research_status')->default('idle')->index(); // idle, queued, in_progress, completed, failed
            $table->timestamp('last_researched_at')->nullable();
            
            // Opt-out & Governance
            $table->boolean('is_do_not_contact')->default(false)->index();
            $table->string('do_not_contact_reason')->nullable();
            $table->timestamp('do_not_contact_at')->nullable();
            
            // Commercial & Taxonomy
            $table->decimal('commercial_estimate', 10, 2)->nullable();
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // 4. Prospect Identifiers (for strict identity resolution & deduplication)
        Schema::create('prospect_identifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // domain, instagram, phone, external_id
            $table->string('value');
            $table->string('normalized_value')->index();
            $table->timestamps();

            $table->unique(['type', 'normalized_value']);
        });

        // 5. Research Runs
        Schema::create('research_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_playbook_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category_name')->nullable();
            $table->string('location_query')->nullable();
            $table->string('query')->nullable();
            $table->string('mode')->default('quick'); // quick, deep
            $table->string('status')->default('queued')->index(); // queued, running, waiting_for_provider, completed, completed_with_warnings, failed, cancelled
            $table->integer('candidates_found')->default(0);
            $table->integer('prospects_created')->default(0);
            $table->json('warnings')->nullable();
            $table->json('execution_log')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 6. Research Sources (Evidence Store & Provenance)
        Schema::create('research_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->foreignId('research_run_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_type'); // website, search, social_meta, manual_url, csv
            $table->text('source_url');
            $table->string('page_title')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('content_hash')->nullable()->index();
            $table->float('confidence')->default(1.0);
            $table->string('status')->default('current'); // current, stale, unreachable, superseded
            $table->timestamp('retrieved_at');
            $table->timestamps();
        });

        // 7. Prospect Observations (Facts vs Hypotheses vs AI claims)
        Schema::create('prospect_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->text('claim');
            $table->text('evidence_excerpt')->nullable();
            $table->string('kind')->default('observed_fact'); // observed_fact, ai_interpretation, unverified_hypothesis
            $table->float('confidence')->default(1.0);
            $table->json('supporting_source_ids')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();
        });

        // 8. Website Audits (Safe Technical & UX Inspection)
        Schema::create('website_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->text('url');
            $table->boolean('is_accessible')->default(true);
            $table->boolean('https_supported')->default(true);
            $table->integer('response_time_ms')->nullable();
            $table->string('page_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('viewport_meta_found')->default(false);
            $table->json('enquiry_paths_found')->nullable();
            $table->boolean('portfolio_found')->default(false);
            $table->integer('broken_links_count')->default(0);
            $table->integer('alt_coverage_percent')->default(0);
            $table->json('tech_stack_signals')->nullable();
            $table->string('status')->default('pass'); // pass, warning, fail
            $table->json('check_details')->nullable();
            $table->timestamp('audited_at');
            $table->timestamps();
        });

        // 9. Opportunities
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('rationale');
            $table->json('supporting_source_ids')->nullable();
            $table->float('confidence')->default(0.8);
            $table->boolean('is_hypothesis')->default(true);
            $table->timestamps();
        });

        // 10. Outreach Drafts (Editable versions)
        Schema::create('outreach_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->string('channel')->default('instagram_dm'); // instagram_dm, email, website_contact, linkedin
            $table->string('angle')->nullable();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('status')->default('draft')->index(); // draft, reviewed, copied, sent, superseded
            $table->integer('version')->default(1);
            $table->string('prompt_version')->nullable();
            $table->json('supporting_evidence_ids')->nullable();
            $table->text('strategy_notes')->nullable();
            $table->timestamps();
        });

        // 11. Sent Messages (Append-only immutable record of exact confirmed sends)
        Schema::create('sent_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->foreignId('outreach_draft_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel');
            $table->text('exact_sent_text');
            $table->timestamp('sent_at');
            $table->timestamps();
        });

        // 12. Outreach Activities (Timeline & Audit Trail)
        Schema::create('outreach_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->string('event_type')->index(); // created, researched, scored, draft_generated, draft_copied, message_sent, reply_recorded, follow_up_scheduled, stage_changed, note_added
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->string('actor')->default('operator');
            $table->timestamps();
        });

        // 13. Follow-Ups
        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->date('due_date')->index();
            $table->string('reason');
            $table->string('status')->default('pending')->index(); // pending, completed, skipped
            $table->string('priority')->default('medium'); // low, medium, high
            $table->text('suggested_angle')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 14. Notes
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });

        // 15. AI Usage Logs
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->string('task_type')->index(); // research_synthesis, opportunity_analysis, qualification, outreach_writer, reply_assistant
            $table->string('provider')->default('gemini');
            $table->string('model');
            $table->integer('prompt_tokens')->default(0);
            $table->integer('completion_tokens')->default(0);
            $table->decimal('estimated_cost', 8, 4)->default(0);
            $table->integer('duration_ms')->default(0);
            $table->string('status')->default('success'); // success, error
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 16. Saved Views
        Schema::create('saved_views', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('filter_criteria');
            $table->string('sort_field')->default('created_at');
            $table->string('sort_order')->default('desc');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_views');
        Schema::dropIfExists('ai_usage_logs');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('follow_ups');
        Schema::dropIfExists('outreach_activities');
        Schema::dropIfExists('sent_messages');
        Schema::dropIfExists('outreach_drafts');
        Schema::dropIfExists('opportunities');
        Schema::dropIfExists('website_audits');
        Schema::dropIfExists('prospect_observations');
        Schema::dropIfExists('research_sources');
        Schema::dropIfExists('research_runs');
        Schema::dropIfExists('prospect_identifiers');
        Schema::dropIfExists('prospects');
        Schema::dropIfExists('category_playbooks');
        Schema::dropIfExists('categories');
    }
};
