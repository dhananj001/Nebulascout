<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryPlaybook;
use Illuminate\Database\Seeder;

class CategoryPlaybookSeeder extends Seeder
{
    public function run(): void
    {
        $playbooks = [
            [
                'category_name' => 'Architecture Studios',
                'category_slug' => 'architecture-studios',
                'category_desc' => 'High-end contemporary residential & commercial architectural design practices.',
                'category_icon' => 'Building2',
                'playbook_name' => 'High-End Architecture Practice Outreach',
                'playbook_slug' => 'architecture-studios-default',
                'ideal_customer_profile' => 'Boutique or mid-sized architecture practices with 3-25 architects, focused on bespoke residences, public spaces, or hospitality projects, seeking high-editorial web portfolio storytelling.',
                'search_terms' => ['architecture studio', 'contemporary architects', 'bespoke residential architects', 'architectural design firm'],
                'default_geography' => 'Pune, Mumbai, Bengaluru, New Delhi, London',
                'research_questions' => [
                    'Do they showcase recent completed projects with high-res photography?',
                    'Is the navigation intuitive on mobile devices?',
                    'Are enquiry paths (contact form, press email, office address) clearly accessible?',
                    'Is their design philosophy clearly articulated in project narratives?'
                ],
                'desired_attributes' => ['Published monographs', 'AIA/IIA member', 'Editorial features (Dezeen, ArchDaily)', 'Active project portfolio'],
                'opportunity_criteria' => [
                    'Portfolio slow to load high-res photography',
                    'Lack of responsive case study layouts',
                    'Missing dedicated enquiry paths for high-ticket residential inquiries',
                    'Outdated typography or layout distracting from architectural elegance'
                ],
                'disqualifiers' => ['Mass low-cost generic civil drafting', 'No digital presence or closed business', 'Already redesigned site within last 6 months'],
                'scoring_weights' => ['service_fit' => 25, 'evidence_opportunity' => 30, 'business_potential' => 20, 'research_confidence' => 15, 'reachability' => 10],
                'preferred_services' => ['Custom Next.js Architectural Portfolio', 'Interactive Project Storytelling', 'High-Performance Image Optimization', 'Editorial Brand Identity'],
                'outreach_tone' => 'Respectful, design-literate, understated, peer-to-peer editorial tone',
                'prohibited_claims' => ['Do not claim their work looks amateur', 'Do not invent unverified awards', 'Do not make false speed benchmark claims'],
                'sample_messages' => [
                    'instagram_dm' => 'Hello [Principal/Studio Team], admiring the spatial balance and material palette in your [Recent Project Name] project. Noticed how cleanly your drawings connect with the photography. We build editorial, high-performance digital portfolios for architecture studios—curious if you have considered modernizing the case study narrative structure for your upcoming monograph releases?',
                    'email' => 'Subject: [Studio Name] portfolio presentation & digital experience'
                ],
                're_research_days' => 60,
                'is_default' => true,
            ],
            [
                'category_name' => 'Photographers & Videographers',
                'category_slug' => 'photographers-videographers',
                'category_desc' => 'Commercial, architectural, fashion, and editorial visual artists.',
                'category_icon' => 'Camera',
                'playbook_name' => 'Visual Artists & Commercial Photographers',
                'playbook_slug' => 'photographers-default',
                'ideal_customer_profile' => 'Commercial, fashion, and architectural photographers with distinguished client rosters, who rely heavily on visual impact and frictionless client gallery deliveries.',
                'search_terms' => ['commercial photographer', 'architectural photographer', 'editorial photographer', 'fashion director'],
                'default_geography' => 'Mumbai, London, New York, Berlin, Singapore',
                'research_questions' => [
                    'Does the portfolio load smoothly with proper aspect ratios?',
                    'Is there a clean showreel or full bleed visual narrative?',
                    'Is there an accessible booking or inquiry workflow?'
                ],
                'desired_attributes' => ['High commercial client caliber', 'Regular editorial publications', 'Distinct visual signature'],
                'opportunity_criteria' => [
                    'Compressive artifacting or slow gallery scrolling',
                    'Lack of mobile-optimized fullscreen galleries',
                    'Clunky PDF portfolio downloads instead of live fluid decks'
                ],
                'disqualifiers' => ['Amateur hobbyist', 'Exclusively stock photography'],
                'scoring_weights' => ['service_fit' => 30, 'evidence_opportunity' => 25, 'business_potential' => 20, 'research_confidence' => 15, 'reachability' => 10],
                'preferred_services' => ['High-FPS Fluid Gallery Web Experience', 'Private Client Proofing Portals', 'Minimalist Digital Archive'],
                'outreach_tone' => 'Appreciative, concise, highly visual, direct',
                'prohibited_claims' => ['Do not critique photo composition', 'Do not claim their site is broken without proof'],
                'sample_messages' => [
                    'instagram_dm' => 'Hi [Name], your series on [Project/Series] has an incredible light treatment. As an agency building digital experiences for visual studios, we noticed your portfolio could showcase full-bleed aspect ratios without any compression lag. Would love to share an interactive concept when you have a moment.'
                ],
                're_research_days' => 45,
                'is_default' => true,
            ],
            [
                'category_name' => 'Interior Designers',
                'category_slug' => 'interior-designers',
                'category_desc' => 'High-end residential, hospitality, and luxury interior architects.',
                'category_icon' => 'Sofa',
                'playbook_name' => 'Luxury Interior Design Studios',
                'playbook_slug' => 'interior-designers-default',
                'ideal_customer_profile' => 'Interior design studios with premium residential or boutique hospitality portfolios looking for sophisticated brand positioning and qualification of high-net-worth clients.',
                'search_terms' => ['luxury interior designer', 'interior architecture studio', 'residential interior designer'],
                'default_geography' => 'Pune, Mumbai, Dubai, Singapore, London',
                'research_questions' => [
                    'Are project narratives detailed with material specifications?',
                    'Is there a clear consultation booking or discovery call funnel?',
                    'Is the press/editorial coverage showcased effectively?'
                ],
                'desired_attributes' => ['AD100 or Elle Decor featured', 'Luxury residential focus', 'Turnkey project capability'],
                'opportunity_criteria' => [
                    'Outdated template or generic theme appearance',
                    'No client consultation qualification intake',
                    'Lack of video walkthroughs or rich spatial story flow'
                ],
                'disqualifiers' => ['Commercial office fit-out contractors only', 'Incomplete or abandoned portfolio'],
                'scoring_weights' => ['service_fit' => 25, 'evidence_opportunity' => 30, 'business_potential' => 25, 'research_confidence' => 10, 'reachability' => 10],
                'preferred_services' => ['High-End Bespoke Web Presence', 'Consultation Intake Funnel', 'Interactive Lookbook'],
                'outreach_tone' => 'Sophisticated, curated, high-end agency peer',
                'prohibited_claims' => ['Never say a room design looks bad', 'No spammy marketing buzzwords'],
                'sample_messages' => [
                    'instagram_dm' => 'Hello [Studio Team], your work on [Project Name] captures such a refined tactile ambiance. We specialize in digital experiences that match this tier of craftsmanship for luxury studios. If you are ever revisiting how your consultation process starts online, we would be delighted to share some ideas.'
                ],
                're_research_days' => 60,
                'is_default' => true,
            ],
            [
                'category_name' => 'Clinics & Healthcare Practices',
                'category_slug' => 'clinics-healthcare',
                'category_desc' => 'Specialized medical, dental, dermatology, and aesthetic practices.',
                'category_icon' => 'Stethoscope',
                'playbook_name' => 'Specialist Clinics & Premium Practices',
                'playbook_slug' => 'clinics-healthcare-default',
                'ideal_customer_profile' => 'Private clinics, cosmetic dermatologists, and boutique dental practices needing clear patient booking pathways, verified credentials display, and frictionless mobile access.',
                'search_terms' => ['private dermatology clinic', 'boutique dental clinic', 'specialist medical practice'],
                'default_geography' => 'Metro urban centers',
                'research_questions' => [
                    'Can patients seamlessly book or request appointments on mobile?',
                    'Are doctors credentials and verified services clearly laid out?',
                    'Is clinic location, timing, and direct WhatsApp/phone reachable in 1 tap?'
                ],
                'desired_attributes' => ['Private accredited clinic', 'Multi-specialist team', 'High patient trust requirement'],
                'opportunity_criteria' => [
                    'Confusing appointment booking flow',
                    'Non-responsive layout making phone calls difficult',
                    'Outdated aesthetic not conveying clinical hygiene and care'
                ],
                'disqualifiers' => ['Public government hospitals', 'Unsupported clinical claims'],
                'scoring_weights' => ['service_fit' => 25, 'evidence_opportunity' => 35, 'business_potential' => 20, 'research_confidence' => 10, 'reachability' => 10],
                'preferred_services' => ['Patient-First Appointment Booking System', 'Mobile Healthcare Landing Experience', 'Accessibility-Compliant UI'],
                'outreach_tone' => 'Professional, respectful, clear, objective',
                'prohibited_claims' => ['Never evaluate clinical quality', 'Never make medical claims or promises of patient conversion numbers'],
                'sample_messages' => [
                    'email' => 'Subject: Improving patient appointment accessibility for [Clinic Name]'
                ],
                're_research_days' => 90,
                'is_default' => true,
            ],
            [
                'category_name' => 'Restaurants & Hospitality',
                'category_slug' => 'restaurants-hospitality',
                'category_desc' => 'Fine dining, boutique hotels, artisan bakeries, and culinary destinations.',
                'category_icon' => 'Utensils',
                'playbook_name' => 'Fine Dining & Boutique Hospitality',
                'playbook_slug' => 'restaurants-hospitality-default',
                'ideal_customer_profile' => 'Chef-driven restaurants, boutique resorts, and premium cocktail venues seeking direct table reservations, rich sensory storytelling, and fast mobile menu access.',
                'search_terms' => ['fine dining restaurant', 'boutique resort', 'chef tasting menu', 'artisan culinary lounge'],
                'default_geography' => 'Goa, Mumbai, Delhi, Bengaluru, London, Dubai',
                'research_questions' => [
                    'Can guests view the seasonal menu without downloading an unreadable PDF?',
                    'Is the reservation engine (SevenRooms, OpenTable, direct form) 1 tap away?',
                    'Are ambiance and photography presented with high aesthetic fidelity?'
                ],
                'desired_attributes' => ['Michelin/Conde Nast recognized', 'Active seasonal tasting menus', 'Strong local brand reputation'],
                'opportunity_criteria' => [
                    'Menu only available as a slow 15MB PDF download',
                    'Reservation link buried or broken',
                    'Slow mobile site frustrating hungry visitors'
                ],
                'disqualifiers' => ['Fast food franchises', 'Delivery-only cloud kitchens without physical presence'],
                'scoring_weights' => ['service_fit' => 30, 'evidence_opportunity' => 30, 'business_potential' => 20, 'research_confidence' => 10, 'reachability' => 10],
                'preferred_services' => ['Live Mobile Menu Experience', 'Direct Table Booking UX', 'Visual Ambiance Storytelling'],
                'outreach_tone' => 'Warm, sensory, polished, direct',
                'prohibited_claims' => ['Never critique food taste', 'Do not make unsupported revenue claims'],
                'sample_messages' => [
                    'instagram_dm' => 'Hi [Team], love the seasonal concept at [Restaurant]. We noticed many guests on mobile have to download a PDF to browse your tasting menu—we build lightning-fast web menus and direct reservation experiences for boutique culinary destinations. Happy to show a 30-second preview!'
                ],
                're_research_days' => 45,
                'is_default' => true,
            ],
            [
                'category_name' => 'Event Planners & Consultants',
                'category_slug' => 'event-planners-consultants',
                'category_desc' => 'Luxury destination wedding planners, bespoke brand activations, and executive event producers.',
                'category_icon' => 'Calendar',
                'playbook_name' => 'Luxury Event Producers & Planners',
                'playbook_slug' => 'event-planners-default',
                'ideal_customer_profile' => 'High-ticket event producers handling multi-day destination weddings, luxury corporate galas, and cultural summits.',
                'search_terms' => ['luxury wedding planner', 'destination event producer', 'bespoke brand activation agency'],
                'default_geography' => 'Global destination hubs',
                'research_questions' => [
                    'Are case studies structured to demonstrate production scale and logistics mastery?',
                    'Is there a direct consultation request questionnaire?',
                    'Are vendor partnerships and press features prominently displayed?'
                ],
                'desired_attributes' => ['Vogue Weddings featured', 'International destination projects', 'High-net-worth client base'],
                'opportunity_criteria' => [
                    'Site fails to convey scale and high-production value',
                    'No client intake qualification form',
                    'Low visual impact compared to actual event scale'
                ],
                'disqualifiers' => ['Local budget party rentals'],
                'scoring_weights' => ['service_fit' => 25, 'evidence_opportunity' => 30, 'business_potential' => 25, 'research_confidence' => 10, 'reachability' => 10],
                'preferred_services' => ['Immersive Production Portfolio', 'HNW Client Qualification Intake', 'Interactive Experience Decks'],
                'outreach_tone' => 'Professional, high-energy, polished, collaborative',
                'prohibited_claims' => ['Do not claim events lack creativity'],
                'sample_messages' => [
                    'email' => 'Subject: Highlighting production scale for [Brand Name] upcoming destination season'
                ],
                're_research_days' => 60,
                'is_default' => true,
            ],
            [
                'category_name' => 'Custom Category',
                'category_slug' => 'custom-category',
                'category_desc' => 'User-defined bespoke category and research parameters.',
                'category_icon' => 'Sparkles',
                'playbook_name' => 'User-Configured Custom Playbook',
                'playbook_slug' => 'custom-playbook',
                'ideal_customer_profile' => 'Defined by operator.',
                'search_terms' => ['digital agency prospect'],
                'default_geography' => 'Global',
                'research_questions' => ['What are their core offerings?'],
                'desired_attributes' => ['Active online presence'],
                'opportunity_criteria' => ['Digital presence opportunity'],
                'disqualifiers' => ['Closed business'],
                'scoring_weights' => ['service_fit' => 25, 'evidence_opportunity' => 30, 'business_potential' => 20, 'research_confidence' => 15, 'reachability' => 10],
                'preferred_services' => ['Custom Web Experience'],
                'outreach_tone' => 'Professional and direct',
                'prohibited_claims' => ['No fabricated claims'],
                'sample_messages' => ['email' => 'Personalized outreach'],
                're_research_days' => 60,
                'is_default' => false,
            ]
        ];

        foreach ($playbooks as $item) {
            $category = Category::firstOrCreate(
                ['slug' => $item['category_slug']],
                [
                    'name' => $item['category_name'],
                    'description' => $item['category_desc'],
                    'icon' => $item['category_icon'],
                    'is_active' => true,
                ]
            );

            CategoryPlaybook::firstOrCreate(
                ['slug' => $item['playbook_slug']],
                [
                    'category_id' => $category->id,
                    'name' => $item['playbook_name'],
                    'ideal_customer_profile' => $item['ideal_customer_profile'],
                    'search_terms' => $item['search_terms'],
                    'default_geography' => $item['default_geography'],
                    'research_questions' => $item['research_questions'],
                    'desired_attributes' => $item['desired_attributes'],
                    'opportunity_criteria' => $item['opportunity_criteria'],
                    'disqualifiers' => $item['disqualifiers'],
                    'scoring_weights' => $item['scoring_weights'],
                    'preferred_services' => $item['preferred_services'],
                    'outreach_tone' => $item['outreach_tone'],
                    'prohibited_claims' => $item['prohibited_claims'],
                    'sample_messages' => $item['sample_messages'],
                    're_research_days' => $item['re_research_days'],
                    'is_default' => $item['is_default'],
                ]
            );
        }
    }
}
