<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryPlaybook;
use App\Models\Prospect;
use App\Models\ProspectIdentifier;
use App\Models\ProspectObservation;
use App\Models\Opportunity;
use App\Models\OutreachActivity;
use App\Models\OutreachDraft;
use App\Models\ResearchSource;
use App\Models\WebsiteAudit;
use App\Models\FollowUp;
use Illuminate\Database\Seeder;

class DemoProspectSeeder extends Seeder
{
    public function run(): void
    {
        $archCategory = Category::where('slug', 'architecture-studios')->first();
        $archPlaybook = CategoryPlaybook::where('slug', 'architecture-studios-default')->first();

        if (! $archCategory || ! $archPlaybook) {
            return;
        }

        // Demo Prospect 1: Studio Monolith Architecture
        $monolith = Prospect::create([
            'category_id' => $archCategory->id,
            'category_playbook_id' => $archPlaybook->id,
            'business_name' => 'Monolith Design Atelier [Demo Data]',
            'normalized_domain' => 'monolithatelier.in',
            'primary_url' => 'https://monolithatelier.in',
            'instagram_handle' => 'monolith.atelier',
            'instagram_url' => 'https://instagram.com/monolith.atelier',
            'location' => 'Koregaon Park, Pune, Maharashtra',
            'city' => 'Pune',
            'country' => 'India',
            'phone' => '+91 20 2615 0980',
            'email' => 'studio@monolithatelier.in',
            'stage' => 'draft_ready',
            'fit_score' => 88,
            'opportunity_score' => 84,
            'confidence_score' => 92,
            'score_explanation' => [
                'fit_factors' => ['Boutique 12-architect firm with published contemporary residential monograph', 'High design caliber matching NebulaStack editorial portfolio tier'],
                'opportunity_factors' => ['Portfolio imagery loads uncompressed 8MB JPEGs', 'No mobile case study navigation for high-ticket clients', 'Missing structured inquiry form'],
                'confidence_factors' => ['Verified website crawl', 'Active public Instagram portfolio', 'Published feature on ArchDaily India']
            ],
            'research_status' => 'completed',
            'last_researched_at' => now()->subDays(2),
            'commercial_estimate' => 8500.00,
            'tags' => ['Demo Data', 'Architecture', 'Pune', 'High Fit', 'Contemporary'],
            'metadata' => [
                'is_demo' => true,
                'principals' => 'Aditi Kulkarni, Vikram Mehta',
                'team_size' => '12 architects',
                'specialty' => 'Bespoke hillside villas & eco-resorts'
            ],
        ]);

        // Identifiers
        ProspectIdentifier::create([
            'prospect_id' => $monolith->id,
            'type' => 'domain',
            'value' => 'monolithatelier.in',
            'normalized_value' => 'monolithatelier.in',
        ]);
        ProspectIdentifier::create([
            'prospect_id' => $monolith->id,
            'type' => 'instagram',
            'value' => '@monolith.atelier',
            'normalized_value' => 'monolith.atelier',
        ]);

        // Sources
        $src1 = ResearchSource::create([
            'prospect_id' => $monolith->id,
            'source_type' => 'website',
            'source_url' => 'https://monolithatelier.in/projects/the-cliff-house-lonavala',
            'page_title' => 'The Cliff House, Lonavala — Monolith Design Atelier',
            'excerpt' => 'Completed in 2025, The Cliff House cantilevers over basalt stone outcroppings with rammed-earth walls and floor-to-ceiling glass pavilions.',
            'content_hash' => hash('sha256', 'cliff_house_excerpt'),
            'confidence' => 0.95,
            'status' => 'current',
            'retrieved_at' => now()->subDays(2),
        ]);

        $src2 = ResearchSource::create([
            'prospect_id' => $monolith->id,
            'source_type' => 'search',
            'source_url' => 'https://www.archdaily.com/monolith-cliff-house-feature',
            'page_title' => 'Monolith Atelier crafts sustainable basalt residence in Maharashtra — ArchDaily',
            'excerpt' => 'Principal architect Aditi Kulkarni explains the passive solar orientation and handcrafted local masonry techniques utilized.',
            'content_hash' => hash('sha256', 'archdaily_feature'),
            'confidence' => 0.98,
            'status' => 'current',
            'retrieved_at' => now()->subDays(2),
        ]);

        // Observations
        ProspectObservation::create([
            'prospect_id' => $monolith->id,
            'claim' => 'Featured on ArchDaily for "The Cliff House" basalt residence in Lonavala.',
            'evidence_excerpt' => 'ArchDaily October 2025 editorial monograph feature.',
            'kind' => 'observed_fact',
            'confidence' => 1.0,
            'supporting_source_ids' => [$src2->id],
            'checked_at' => now()->subDays(2),
        ]);
        ProspectObservation::create([
            'prospect_id' => $monolith->id,
            'claim' => 'Current website project pages lack mobile swipe navigation and take 4.8s to render full resolution photographs.',
            'evidence_excerpt' => 'Observed during bounded website crawl: hero image asset is 8.4MB uncompressed JPEG.',
            'kind' => 'observed_fact',
            'confidence' => 0.92,
            'supporting_source_ids' => [$src1->id],
            'checked_at' => now()->subDays(2),
        ]);
        ProspectObservation::create([
            'prospect_id' => $monolith->id,
            'claim' => 'Potential client inquiries are restricted to a generic mailto: link rather than an architectural project briefing questionnaire.',
            'evidence_excerpt' => 'Contact page contains only studio@ email link with no intake workflow.',
            'kind' => 'observed_fact',
            'confidence' => 0.95,
            'supporting_source_ids' => [$src1->id],
            'checked_at' => now()->subDays(2),
        ]);

        // Website Audit
        WebsiteAudit::create([
            'prospect_id' => $monolith->id,
            'url' => 'https://monolithatelier.in',
            'is_accessible' => true,
            'https_supported' => true,
            'response_time_ms' => 840,
            'page_title' => 'Monolith Design Atelier — Architecture & Spatial Research',
            'meta_description' => 'Boutique architectural practice based in Pune crafting contextual contemporary residences.',
            'viewport_meta_found' => true,
            'enquiry_paths_found' => ['mailto:studio@monolithatelier.in'],
            'portfolio_found' => true,
            'broken_links_count' => 1,
            'alt_coverage_percent' => 45,
            'tech_stack_signals' => ['WordPress 6.4', 'Elementor', 'Apache'],
            'status' => 'warning',
            'check_details' => [
                'viewport' => 'pass',
                'https' => 'pass',
                'image_optimization' => 'fail (multiple images > 5MB)',
                'enquiry_form' => 'warning (mailto only, no form)',
                'case_study_navigation' => 'warning (no sequential project browsing)'
            ],
            'audited_at' => now()->subDays(2),
        ]);

        // Opportunities
        Opportunity::create([
            'prospect_id' => $monolith->id,
            'title' => 'High-Performance Editorial Case Study Engine',
            'rationale' => 'Transition project portfolios to Next.js App Router with responsive AVIF/WebP image pipelines so architectural photos load instantaneously on mobile devices.',
            'supporting_source_ids' => [$src1->id],
            'confidence' => 0.88,
            'is_hypothesis' => true,
        ]);
        Opportunity::create([
            'prospect_id' => $monolith->id,
            'title' => 'Architectural Client Discovery Questionnaire',
            'rationale' => 'Replace the bare mailto link with a curated multi-step project briefing questionnaire that filters serious luxury villa clients and captures plot details.',
            'supporting_source_ids' => [$src1->id],
            'confidence' => 0.91,
            'is_hypothesis' => true,
        ]);

        // Outreach Draft
        OutreachDraft::create([
            'prospect_id' => $monolith->id,
            'channel' => 'instagram_dm',
            'angle' => 'Praising the basalt masonry in Cliff House + proposing high-fidelity mobile case study storytelling',
            'subject' => null,
            'body' => "Hi Aditi & Vikram, admiring the spatial drama and basalt masonry in your Cliff House project in Lonavala—the integration with the topography is remarkable.\n\nWe build editorial, high-performance digital portfolios for architecture studios at NebulaStack. We noticed your photography is world-class, but high-res project galleries currently take a few seconds to load on mobile when prospective clients browse.\n\nWe prepared a short 45-second interactive concept showing how your monographs could load instantaneously with full-bleed drawings. Would love to send a private link if you're open to seeing it!",
            'status' => 'draft',
            'version' => 1,
            'prompt_version' => 'arch-editorial-v1',
            'supporting_evidence_ids' => [$src1->id, $src2->id],
            'strategy_notes' => 'Complimented specific material selection (basalt masonry in Lonavala) and offered low-friction value (45s interactive preview) rather than a generic pitch.',
        ]);

        // Follow Up
        FollowUp::create([
            'prospect_id' => $monolith->id,
            'due_date' => now()->addDays(3),
            'reason' => 'Review drafted message and execute manual send via Instagram DM',
            'status' => 'pending',
            'priority' => 'high',
            'suggested_angle' => 'Direct send via Instagram DM',
        ]);

        // Activity Timeline
        $monolith->recordActivity('created', 'Prospect imported as verified architecture candidate from local Pune discovery run', ['is_demo' => true]);
        $monolith->recordActivity('researched', 'Automated research run completed with 2 verified sources and full website audit', ['is_demo' => true]);
        $monolith->recordActivity('scored', 'Scoring engine evaluated fit: 88, opportunity: 84, confidence: 92', ['is_demo' => true]);
        $monolith->recordActivity('draft_generated', 'Outreach writer synthesized Cliff House observation into personalized Instagram DM draft', ['channel' => 'instagram_dm']);


        // Demo Prospect 2: Kroma Visuals Commercial Photography
        $photoCategory = Category::where('slug', 'photographers-videographers')->first();
        $photoPlaybook = CategoryPlaybook::where('slug', 'photographers-default')->first();

        if ($photoCategory && $photoPlaybook) {
            $photo = Prospect::create([
                'category_id' => $photoCategory->id,
                'category_playbook_id' => $photoPlaybook->id,
                'business_name' => 'Kroma Commercial Imagery [Demo Data]',
                'normalized_domain' => 'kromaimagery.com',
                'primary_url' => 'https://kromaimagery.com',
                'instagram_handle' => 'kroma.imagery',
                'instagram_url' => 'https://instagram.com/kroma.imagery',
                'location' => 'Bandra West, Mumbai, Maharashtra',
                'city' => 'Mumbai',
                'country' => 'India',
                'phone' => '+91 22 2642 1100',
                'email' => 'hello@kromaimagery.com',
                'stage' => 'contacted',
                'fit_score' => 91,
                'opportunity_score' => 78,
                'confidence_score' => 88,
                'score_explanation' => [
                    'fit_factors' => ['Top-tier commercial automotive and luxury goods client roster', 'Strong commercial production values'],
                    'opportunity_factors' => ['Client delivery requires slow Google Drive links instead of branded web proofing portal', 'Mobile grid crops widescreen cinematic aspect ratios'],
                    'confidence_factors' => ['Published commercial campaigns', 'Verified social metadata']
                ],
                'research_status' => 'completed',
                'last_researched_at' => now()->subDays(5),
                'commercial_estimate' => 6200.00,
                'tags' => ['Demo Data', 'Photography', 'Mumbai', 'Commercial', 'Automotive'],
                'metadata' => [
                    'is_demo' => true,
                    'principal' => 'Rohan Sen',
                    'clients' => 'Mercedes-Benz India, Titan, Taj Hotels'
                ],
            ]);

            // Activities
            $photo->recordActivity('created', 'Candidate imported from commercial photography category search');
            $photo->recordActivity('draft_generated', 'Personalized draft generated focusing on branded client proofing portals');
            $photo->recordActivity('draft_copied', 'Operator clicked Copy Message');
            $photo->recordActivity('message_sent', 'Confirmed manual send via Instagram DM to @kroma.imagery', [
                'channel' => 'instagram_dm',
                'sent_at' => now()->subDays(1)->toIso8601String()
            ]);

            FollowUp::create([
                'prospect_id' => $photo->id,
                'due_date' => now()->addDays(2),
                'reason' => 'Check for DM reply or follow-up regarding proofing portal demo',
                'status' => 'pending',
                'priority' => 'medium',
                'suggested_angle' => 'Follow up asking if they had a chance to view the proofing deck',
            ]);
        }
    }
}
