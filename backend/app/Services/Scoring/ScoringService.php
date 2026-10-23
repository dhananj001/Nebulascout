<?php

namespace App\Services\Scoring;

use App\Models\Prospect;

class ScoringService
{
    /**
     * Calculate transparent scores and breakdown for a prospect based on playbook criteria.
     */
    public function calculate(Prospect $prospect): array
    {
        $playbook = $prospect->playbook;
        $weights = $playbook?->scoring_weights ?? [
            'service_fit' => 25,
            'evidence_opportunity' => 30,
            'business_potential' => 20,
            'research_confidence' => 15,
            'reachability' => 10,
        ];

        // 1. Service Fit
        $fitPoints = 0;
        $fitFactors = [];

        if ($prospect->category_id) {
            $fitPoints += 15;
            $fitFactors[] = "Classified within target category '{$prospect->category?->name}' (+15)";
        }
        if ($prospect->primary_url) {
            $fitPoints += 10;
            $fitFactors[] = 'Has dedicated brand web domain (+10)';
        }
        if (! empty($prospect->metadata['specialty'])) {
            $fitPoints += 10;
            $fitFactors[] = 'Documented practice specialty identified (+10)';
        }

        // 2. Evidence Opportunity
        $oppPoints = 0;
        $oppFactors = [];

        $audit = $prospect->latestWebsiteAudit;
        if ($audit) {
            if ($audit->status === 'warning') {
                $oppPoints += 25;
                $oppFactors[] = 'Website audit highlighted optimization opportunities (+25)';
            }
            if ($audit->alt_coverage_percent < 60) {
                $oppPoints += 15;
                $oppFactors[] = "Low image accessibility/SEO metadata coverage: {$audit->alt_coverage_percent}% (+15)";
            }
            if (empty($audit->enquiry_paths_found)) {
                $oppPoints += 20;
                $oppFactors[] = 'No structured intake questionnaire or clear inquiry button discovered (+20)';
            }
            if ($audit->response_time_ms && $audit->response_time_ms > 1500) {
                $oppPoints += 15;
                $oppFactors[] = "Slow server response time: {$audit->response_time_ms}ms (+15)";
            }
        } elseif ($prospect->primary_url) {
            $oppPoints += 15;
            $oppFactors[] = 'Web domain discovered, pending deep audit (+15)';
        }

        if ($prospect->opportunities()->count() > 0) {
            $oppPoints += 20;
            $oppFactors[] = 'Identified ' . $prospect->opportunities()->count() . ' evidence-grounded improvement opportunities (+20)';
        }

        // 3. Research Confidence
        $confPoints = 0;
        $confFactors = [];

        $sourceCount = $prospect->sources()->count();
        if ($sourceCount >= 3) {
            $confPoints += 40;
            $confFactors[] = "3+ verified research sources collected ({$sourceCount} sources) (+40)";
        } elseif ($sourceCount >= 1) {
            $confPoints += 20;
            $confFactors[] = "{$sourceCount} research source verified (+20)";
        } else {
            $confFactors[] = 'Penalty: No verified independent sources yet (0)';
        }

        if ($audit && $audit->is_accessible) {
            $confPoints += 30;
            $confFactors[] = 'Direct website crawl verified live and responsive (+30)';
        }

        if ($prospect->observations()->count() > 0) {
            $confPoints += 30;
            $confFactors[] = 'Grounded observations verified against source excerpts (+30)';
        }

        // 4. Reachability
        $reachPoints = 0;
        $reachFactors = [];

        if ($prospect->instagram_handle) {
            $reachPoints += 50;
            $reachFactors[] = "Direct public Instagram handle verified: @{$prospect->instagram_handle} (+50)";
        }
        if ($prospect->email) {
            $reachPoints += 30;
            $reachFactors[] = "Public business email verified: {$prospect->email} (+30)";
        }
        if ($prospect->phone) {
            $reachPoints += 20;
            $reachFactors[] = "Public contact phone verified: {$prospect->phone} (+20)";
        }

        // Normalize scores to 0-100 bounds
        $fitScore = min(100, (int) round(($fitPoints / 35) * 100));
        $opportunityScore = min(100, (int) round(($oppPoints / 95) * 100));
        $confidenceScore = min(100, (int) round(($confPoints / 100) * 100));

        // Adjust fitScore based on weights
        $explanation = [
            'fit_factors' => $fitFactors,
            'opportunity_factors' => $oppFactors,
            'confidence_factors' => $confFactors,
            'reachability_factors' => $reachFactors,
            'calculated_at' => now()->toIso8601String(),
        ];

        return [
            'fit_score' => $fitScore,
            'opportunity_score' => $opportunityScore,
            'confidence_score' => $confidenceScore,
            'score_explanation' => $explanation,
        ];
    }
}
