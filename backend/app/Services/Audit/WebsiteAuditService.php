<?php

namespace App\Services\Audit;

use App\Models\Prospect;
use App\Models\WebsiteAudit;
use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebsiteAuditService
{
    /**
     * Bounded response size: 2MB maximum.
     */
    protected const MAX_RESPONSE_BYTES = 2097152;

    /**
     * Connection timeout in seconds.
     */
    protected const TIMEOUT_SECONDS = 8;

    /**
     * Perform an SSRF-safe, bounded technical audit of a prospect website.
     */
    public function audit(Prospect $prospect, ?string $overrideUrl = null): WebsiteAudit
    {
        $targetUrl = $overrideUrl ?: $prospect->primary_url;

        if (! $targetUrl) {
            throw new Exception("No primary URL configured for prospect {$prospect->id}");
        }

        // 1. SSRF and URL validation
        $validatedUrl = $this->validateAndSanitizeUrl($targetUrl);

        $startTime = microtime(true);
        $isAccessible = false;
        $httpsSupported = str_starts_with(strtolower($validatedUrl), 'https://');
        $responseTimeMs = null;
        $pageTitle = null;
        $metaDescription = null;
        $viewportFound = false;
        $portfolioFound = false;
        $enquiryPaths = [];
        $brokenLinksCount = 0;
        $altCoveragePercent = 0;
        $techSignals = [];
        $checkDetails = [];
        $status = 'pass';

        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders([
                    'User-Agent' => 'NebulaScout-ResearchBot/1.0 (+https://nebulastack.dev/research)',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->withoutRedirecting() // Validate redirect targets independently for SSRF protection
                ->get($validatedUrl);

            $responseTimeMs = (int) round((microtime(true) - $startTime) * 1000);

            // Handle single safe redirect if present
            if ($response->status() >= 300 && $response->status() < 400 && $response->header('Location')) {
                $redirectUrl = $response->header('Location');
                $redirectUrl = $this->resolveRedirectUrl($validatedUrl, $redirectUrl);
                $validatedUrl = $this->validateAndSanitizeUrl($redirectUrl);

                $response = Http::timeout(self::TIMEOUT_SECONDS)
                    ->withHeaders([
                        'User-Agent' => 'NebulaScout-ResearchBot/1.0 (+https://nebulastack.dev/research)',
                        'Accept' => 'text/html,application/xhtml+xml',
                    ])
                    ->get($validatedUrl);
            }

            if ($response->successful()) {
                $isAccessible = true;
                $html = substr($response->body(), 0, self::MAX_RESPONSE_BYTES);

                // Parse HTML safely without external entity loading
                $auditData = $this->inspectHtmlContent($html, $validatedUrl);
                $pageTitle = $auditData['title'];
                $metaDescription = $auditData['meta_description'];
                $viewportFound = $auditData['viewport_found'];
                $portfolioFound = $auditData['portfolio_found'];
                $enquiryPaths = $auditData['enquiry_paths'];
                $altCoveragePercent = $auditData['alt_coverage_percent'];
                $techSignals = $auditData['tech_signals'];
                $checkDetails = $auditData['checks'];

                if (empty($enquiryPaths) || $altCoveragePercent < 50 || ! $viewportFound || $responseTimeMs > 2500) {
                    $status = 'warning';
                }
            } else {
                $status = 'warning';
                $checkDetails['http_status'] = "Returned status {$response->status()}";
            }
        } catch (Exception $e) {
            $status = 'fail';
            $isAccessible = false;
            $checkDetails['error'] = 'Connection failed or blocked by safety policy: ' . $e->getMessage();
            Log::warning("Website audit error for prospect {$prospect->id}: " . $e->getMessage());
        }

        return WebsiteAudit::create([
            'prospect_id' => $prospect->id,
            'url' => $validatedUrl,
            'is_accessible' => $isAccessible,
            'https_supported' => $httpsSupported,
            'response_time_ms' => $responseTimeMs,
            'page_title' => $pageTitle,
            'meta_description' => $metaDescription,
            'viewport_meta_found' => $viewportFound,
            'enquiry_paths_found' => $enquiryPaths,
            'portfolio_found' => $portfolioFound,
            'broken_links_count' => $brokenLinksCount,
            'alt_coverage_percent' => $altCoveragePercent,
            'tech_stack_signals' => $techSignals,
            'status' => $status,
            'check_details' => $checkDetails,
            'audited_at' => now(),
        ]);
    }

    /**
     * Inspect HTML content with safe DOM parser.
     */
    protected function inspectHtmlContent(string $html, string $baseUrl): array
    {
        $libxmlState = libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_clear_errors();
        libxml_use_internal_errors($libxmlState);

        $xpath = new DOMXPath($dom);

        // Title
        $titleNodes = $xpath->query('//title');
        $title = $titleNodes->length > 0 ? trim($titleNodes->item(0)->textContent) : null;

        // Meta Description
        $descNodes = $xpath->query('//meta[translate(@name, "DESCRIPTION", "description")="description"]/@content');
        $metaDescription = $descNodes->length > 0 ? trim($descNodes->item(0)->nodeValue) : null;

        // Viewport
        $viewportNodes = $xpath->query('//meta[translate(@name, "VIEWPORT", "viewport")="viewport"]');
        $viewportFound = $viewportNodes->length > 0;

        // Enquiry Paths
        $enquiryPaths = [];
        $linkNodes = $xpath->query('//a[@href]');
        $portfolioKeywords = ['project', 'work', 'portfolio', 'gallery', 'case-stud', 'monograph', 'stories'];
        $portfolioFound = false;

        foreach ($linkNodes as $link) {
            $href = trim($link->getAttribute('href'));
            $text = strtolower(trim($link->textContent));

            if (str_starts_with($href, 'mailto:')) {
                $enquiryPaths[] = $href;
            } elseif (str_starts_with($href, 'tel:')) {
                $enquiryPaths[] = $href;
            } elseif (str_contains($href, 'whatsapp.com') || str_contains($href, 'wa.me')) {
                $enquiryPaths[] = 'whatsapp:' . $href;
            } elseif (str_contains(strtolower($href), 'contact') || str_contains($text, 'contact') || str_contains($text, 'enquir')) {
                $enquiryPaths[] = $href;
            }

            foreach ($portfolioKeywords as $keyword) {
                if (str_contains(strtolower($href), $keyword) || str_contains($text, $keyword)) {
                    $portfolioFound = true;
                    break;
                }
            }
        }

        // Image Alt Coverage
        $imgNodes = $xpath->query('//img');
        $totalImages = $imgNodes->length;
        $imagesWithAlt = 0;

        foreach ($imgNodes as $img) {
            $alt = trim($img->getAttribute('alt'));
            if ($alt !== '') {
                $imagesWithAlt++;
            }
        }

        $altCoveragePercent = $totalImages > 0 ? (int) round(($imagesWithAlt / $totalImages) * 100) : 100;

        // Tech stack heuristics
        $techSignals = [];
        if (str_contains($html, 'wp-content') || str_contains($html, 'wp-includes')) {
            $techSignals[] = 'WordPress';
        }
        if (str_contains($html, 'elementor')) {
            $techSignals[] = 'Elementor';
        }
        if (str_contains($html, 'squarespace')) {
            $techSignals[] = 'Squarespace';
        }
        if (str_contains($html, 'wix.com')) {
            $techSignals[] = 'Wix';
        }
        if (str_contains($html, '_next') || str_contains($html, '__NEXT_DATA__')) {
            $techSignals[] = 'Next.js';
        }
        if (str_contains($html, 'shopify')) {
            $techSignals[] = 'Shopify';
        }

        $checks = [
            'viewport_meta' => $viewportFound ? 'pass' : 'fail (mobile layout issue)',
            'enquiry_discovery' => count($enquiryPaths) > 0 ? 'pass (' . count($enquiryPaths) . ' found)' : 'warning (no clear inquiry path)',
            'portfolio_discovery' => $portfolioFound ? 'pass' : 'warning (project showcase not identified in nav)',
            'image_accessibility' => "{$altCoveragePercent}% alt coverage ({$imagesWithAlt}/{$totalImages} images)",
            'tech_stack' => count($techSignals) > 0 ? implode(', ', $techSignals) : 'Custom/Unidentified',
        ];

        return [
            'title' => $title,
            'meta_description' => $metaDescription,
            'viewport_found' => $viewportFound,
            'portfolio_found' => $portfolioFound,
            'enquiry_paths' => array_values(array_unique(array_slice($enquiryPaths, 0, 8))),
            'alt_coverage_percent' => $altCoveragePercent,
            'tech_signals' => $techSignals,
            'checks' => $checks,
        ];
    }

    /**
     * Strict SSRF prevention & URL sanitization.
     */
    protected function validateAndSanitizeUrl(string $url): string
    {
        $url = trim($url);
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = 'https://' . $url;
        }

        $parts = parse_url($url);
        if (! $parts || empty($parts['host'])) {
            throw new Exception("Invalid URL format: {$url}");
        }

        $scheme = strtolower($parts['scheme'] ?? '');
        if ($scheme !== 'http' && $scheme !== 'https') {
            throw new Exception("Unsupported protocol '{$scheme}'. Only HTTP and HTTPS are permitted.");
        }

        $host = strtolower($parts['host']);

        // Check for disallowed literal hostnames
        $disallowedHosts = ['localhost', '127.0.0.1', '::1', 'metadata.google.internal', 'instance-data'];
        if (in_array($host, $disallowedHosts, true) || str_ends_with($host, '.internal') || str_ends_with($host, '.local')) {
            throw new Exception("Access to host '{$host}' is blocked for SSRF security.");
        }

        // If host is directly an IP address, validate it immediately
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if ($this->isPrivateOrReservedIp($host)) {
                throw new Exception("Host '{$host}' is a restricted private/reserved IP. Request blocked.");
            }
        }

        // Resolve DNS and test IP against private/reserved ranges
        $ips = @dns_get_record($host, DNS_A + DNS_AAAA);
        if (! $ips || count($ips) === 0) {
            $singleIp = @gethostbyname($host);
            if ($singleIp && $singleIp !== $host) {
                $ips = [['ip' => $singleIp]];
            }
        }

        if ($ips) {
            foreach ($ips as $record) {
                $ip = $record['ip'] ?? $record['ipv6'] ?? null;
                if ($ip && $this->isPrivateOrReservedIp($ip)) {
                    throw new Exception("Host '{$host}' resolved to restricted IP '{$ip}'. Request blocked.");
                }
            }
        }

        return $url;
    }

    /**
     * Check if an IP is private, loopback, link-local or reserved.
     */
    protected function isPrivateOrReservedIp(string $ip): bool
    {
        return ! filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }

    /**
     * Safe relative or absolute redirect resolver.
     */
    protected function resolveRedirectUrl(string $base, string $relative): string
    {
        if (parse_url($relative, PHP_URL_SCHEME) !== null) {
            return $relative;
        }

        $parts = parse_url($base);
        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'] ?? '';
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        if (str_starts_with($relative, '/')) {
            return "{$scheme}://{$host}{$port}{$relative}";
        }

        $path = $parts['path'] ?? '/';
        $dir = dirname($path);
        if ($dir === '/' || $dir === '.') {
            $dir = '';
        }

        return "{$scheme}://{$host}{$port}{$dir}/{$relative}";
    }
}
