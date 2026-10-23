<?php

namespace App\Services\Research;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstagramDiscoveryService
{
    protected ?string $serperKey;

    public function __construct()
    {
        $this->serperKey = config('services.serper.key', env('SERPER_API_KEY'));
    }

    /**
     * Harvest verified Instagram profiles in a specific niche and city using Google X-Ray indexing.
     * 100% free, zero login required, and ban-proof.
     *
     * @param string $category e.g. "Interior Designers", "Architects", "Luxury Photographers"
     * @param string $location e.g. "Mumbai", "London", "Dubai", "New York"
     * @param int $limit Max candidates to retrieve
     * @param bool $enrichWebsites Whether to resolve their official portfolio website
     * @return array
     */
    public function discoverInstagramLeads(string $category, string $location, int $limit = 8, bool $enrichWebsites = true): array
    {
        if (empty($this->serperKey)) {
            return [
                'leads' => [],
                'warnings' => ['SERPER_API_KEY is not configured in backend/.env.'],
            ];
        }

        // Calibrated commercial studio query with strict exclusion of educational and institutional profiles
        $lowerCat = strtolower($category);
        $nicheKeywords = match(true) {
            str_contains($lowerCat, 'arch') => '"architecture studio" OR "architects" OR "architectural design"',
            str_contains($lowerCat, 'photo') || str_contains($lowerCat, 'video') => '"photographer" OR "photography studio" OR "commercial photographer"',
            str_contains($lowerCat, 'interior') => '"interior designer" OR "interior design studio" OR "interiors"',
            str_contains($lowerCat, 'clinic') || str_contains($lowerCat, 'health') => '"clinic" OR "aesthetic clinic" OR "dental clinic"',
            str_contains($lowerCat, 'restaurant') || str_contains($lowerCat, 'hospitality') || str_contains($lowerCat, 'cafe') => '"restaurant" OR "cafe" OR "bistro" OR "bakery"',
            str_contains($lowerCat, 'event') || str_contains($lowerCat, 'wedding') => '"event planner" OR "wedding planner" OR "luxury events"',
            default => "\"{$category}\"",
        };

        // Explicitly ban colleges, universities, student fests, councils, and academic directories
        $exclusions = "-college -university -school -institute -institution -academy -education -council -exam -alumni -admissions -campus -students -fest";
        $query = "site:instagram.com {$nicheKeywords} \"{$location}\" {$exclusions}";
        $leads = [];
        $warnings = [];

        try {
            // Free Serper accounts strictly disallow num > 10 ("Query pattern not allowed for free accounts")
            $numResults = min(10, max(5, $limit));
            $response = Http::timeout(12)
                ->withHeaders([
                    'X-API-KEY' => $this->serperKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://google.serper.dev/search', [
                    'q' => $query,
                    'num' => $numResults,
                ]);

            if (! $response->successful()) {
                $warnings[] = "Serper Instagram discovery returned HTTP {$response->status()}: " . $response->body();
                return ['leads' => [], 'warnings' => $warnings];
            }

            $organic = $response->json('organic') ?? [];

            // Disqualifying tokens for academic, institutional, and media entities
            $disqualifiedWords = [
                'college', 'university', 'school', 'institute', 'academy', 'campus', 
                'alumni', 'education', 'council', 'dept', 'department', 'students',
                'admissions', 'classes', 'magazine', 'news', 'portal', 'association'
            ];

            foreach ($organic as $item) {
                $link = $item['link'] ?? '';
                $title = $item['title'] ?? '';
                $snippet = $item['snippet'] ?? '';

                // Extract Instagram handle from URL
                $handle = $this->extractInstagramHandle($link);
                if (! $handle) {
                    continue;
                }

                $combinedText = strtolower("{$handle} {$title} {$snippet}");
                $isDisqualified = false;
                foreach ($disqualifiedWords as $badWord) {
                    if (str_contains($combinedText, $badWord)) {
                        $isDisqualified = true;
                        break;
                    }
                }

                if ($isDisqualified) {
                    continue;
                }

                // Extract Clean Business Name
                $businessName = $this->cleanBusinessName($title, $handle);

                // Extract followers and bio info from snippet
                $followers = $this->extractFollowerCount($snippet);
                $bio = $this->cleanBioSnippet($snippet);

                // Check if already in leads list
                if (isset($leads[$handle])) {
                    continue;
                }

                $lead = [
                    'instagram_handle' => $handle,
                    'instagram_url' => "https://www.instagram.com/{$handle}/",
                    'business_name' => $businessName,
                    'location' => $location,
                    'followers_estimate' => $followers,
                    'bio_snippet' => $bio,
                    'source_type' => 'instagram_xray',
                    'primary_url' => null,
                ];

                // Attempt to resolve their official portfolio website if requested
                if ($enrichWebsites) {
                    $website = $this->resolveOfficialWebsite($businessName, $location);
                    if ($website) {
                        $lead['primary_url'] = $website;
                    }
                }

                $leads[$handle] = $lead;

                if (count($leads) >= $limit) {
                    break;
                }
            }
        } catch (Exception $e) {
            Log::error("Instagram X-Ray discovery failed: " . $e->getMessage());
            $warnings[] = "Instagram search error: " . $e->getMessage();
        }

        return [
            'leads' => array_values($leads),
            'warnings' => $warnings,
        ];
    }

    /**
     * Resolve official studio website via Google query without visiting Instagram directly.
     */
    public function resolveOfficialWebsite(string $businessName, string $location): ?string
    {
        // Don't search for generic single words
        if (str_word_count($businessName) < 1 || strlen($businessName) < 3) {
            return null;
        }

        try {
            $response = Http::timeout(6)
                ->withHeaders([
                    'X-API-KEY' => $this->serperKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://google.serper.dev/search', [
                    'q' => "{$businessName} official website",
                    'num' => 3,
                ]);

            if ($response->successful()) {
                $results = $response->json('organic') ?? [];
                $ignoreDomains = [
                    'instagram.com', 'facebook.com', 'linkedin.com', 'twitter.com', 'x.com',
                    'youtube.com', 'pinterest.', 'wikipedia.org', 'yelp.com', 'justdial.com',
                    'tripadvisor.', 'indiamart.com', 'quora.com', 'reddit.com'
                ];

                foreach ($results as $res) {
                    $link = $res['link'] ?? '';
                    $isIgnored = false;
                    foreach ($ignoreDomains as $ignored) {
                        if (str_contains(strtolower($link), $ignored)) {
                            $isIgnored = true;
                            break;
                        }
                    }

                    if ($link && ! $isIgnored) {
                        return $link;
                    }
                }
            }
        } catch (Exception $e) {
            // Non-blocking fallback
        }

        return null;
    }

    /**
     * Extract Instagram username from URL, discarding /p/, /reel/, /stories/, etc.
     */
    protected function extractInstagramHandle(string $url): ?string
    {
        // Must be instagram.com
        if (! str_contains(strtolower($url), 'instagram.com')) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (! $path) {
            return null;
        }

        $segments = array_values(array_filter(explode('/', trim($path, '/'))));
        if (empty($segments)) {
            return null;
        }

        $first = strtolower($segments[0]);
        $skipSegments = ['p', 'reel', 'reels', 'stories', 'explore', 'tags', 'tv', 'about', 'accounts', 'developer', 'legal'];

        if (in_array($first, $skipSegments)) {
            return null;
        }

        // Handles must be valid characters
        if (preg_match('/^[a-zA-Z0-9._]{2,30}$/', $first)) {
            return strtolower($first);
        }

        return null;
    }

    /**
     * Clean up business name from search title.
     */
    protected function cleanBusinessName(string $title, string $handle): string
    {
        // Strip out handle parentheses e.g. "Studio (@handle)" -> "Studio"
        $cleaned = preg_replace('/\s*\(@[a-zA-Z0-9._]+\)/i', '', $title);
        // Strip trailing Instagram indicators
        $cleaned = preg_replace('/\s*(?:•|\||-|·)\s*Instagram.*$/i', '', $cleaned);
        // Strip trailing location or tags
        $cleaned = preg_replace('/\s*(?:•|\||-|·).*$/i', '', $cleaned);
        $cleaned = trim($cleaned);

        return $cleaned ?: ucwords(str_replace(['.', '_'], ' ', $handle));
    }

    /**
     * Extract follower count from Google snippet.
     */
    protected function extractFollowerCount(string $snippet): ?string
    {
        if (preg_match('/([0-9.]+[KkMm]?)\s*followers/i', $snippet, $matches)) {
            return strtoupper($matches[1]);
        }
        return null;
    }

    /**
     * Clean bio text snippet.
     */
    protected function cleanBioSnippet(string $snippet): string
    {
        // Remove "123K followers · 456 following..." boilerplate
        $cleaned = preg_replace('/^[0-9.]+[KkMm]?\s*followers[^\w]*/i', '', $snippet);
        $cleaned = preg_replace('/[0-9.]+[KkMm]?\s*following[^\w]*/i', '', $cleaned);
        $cleaned = preg_replace('/[0-9.]+[KkMm]?\s*posts[^\w]*/i', '', $cleaned);
        return trim($cleaned);
    }
}
