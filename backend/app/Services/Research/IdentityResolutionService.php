<?php

namespace App\Services\Research;

use App\Models\Prospect;
use App\Models\ProspectIdentifier;

class IdentityResolutionService
{
    /**
     * Normalize a web domain.
     */
    public function normalizeDomain(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $url = trim($url);
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = 'https://' . $url;
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return null;
        }

        $host = strtolower($host);
        if (str_starts_with($host, 'www.')) {
            $host = substr($host, 4);
        }

        return $host ?: null;
    }

    /**
     * Normalize an Instagram handle or profile URL.
     */
    public function normalizeInstagramHandle(?string $input): ?string
    {
        if (! $input) {
            return null;
        }

        $input = trim($input);
        if (str_contains($input, 'instagram.com/')) {
            $path = parse_url($input, PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $input = $segments[0] ?? '';
        }

        $handle = ltrim($input, '@');
        $handle = strtolower(preg_replace('/[^a-zA-Z0-9._]/', '', $handle));

        return $handle ?: null;
    }

    /**
     * Find an existing prospect using deterministic identifiers.
     */
    public function findExisting(array $attributes): ?Prospect
    {
        $domain = $this->normalizeDomain($attributes['primary_url'] ?? $attributes['website'] ?? null);
        $igHandle = $this->normalizeInstagramHandle($attributes['instagram_handle'] ?? $attributes['instagram_url'] ?? null);

        if ($domain) {
            $existing = Prospect::where('normalized_domain', $domain)->first();
            if ($existing) {
                return $existing;
            }

            $idMatch = ProspectIdentifier::where('type', 'domain')
                ->where('normalized_value', $domain)
                ->first();
            if ($idMatch) {
                return $idMatch->prospect;
            }
        }

        if ($igHandle) {
            $existing = Prospect::where('instagram_handle', $igHandle)->first();
            if ($existing) {
                return $existing;
            }

            $idMatch = ProspectIdentifier::where('type', 'instagram')
                ->where('normalized_value', $igHandle)
                ->first();
            if ($idMatch) {
                return $idMatch->prospect;
            }
        }

        return null;
    }

    /**
     * Register identifiers for a newly created or updated prospect.
     */
    public function syncIdentifiers(Prospect $prospect): void
    {
        if ($prospect->normalized_domain) {
            ProspectIdentifier::firstOrCreate(
                [
                    'type' => 'domain',
                    'normalized_value' => $prospect->normalized_domain,
                ],
                [
                    'prospect_id' => $prospect->id,
                    'value' => $prospect->primary_url ?: $prospect->normalized_domain,
                ]
            );
        }

        if ($prospect->instagram_handle) {
            ProspectIdentifier::firstOrCreate(
                [
                    'type' => 'instagram',
                    'normalized_value' => $prospect->instagram_handle,
                ],
                [
                    'prospect_id' => $prospect->id,
                    'value' => '@' . $prospect->instagram_handle,
                ]
            );
        }
    }
}
