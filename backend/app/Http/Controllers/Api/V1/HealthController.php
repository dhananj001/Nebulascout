<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Ai\GeminiAiService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __construct(
        protected GeminiAiService $aiService,
    ) {}

    /**
     * Overall system health.
     */
    public function health(): JsonResponse
    {
        $dbStatus = 'healthy';
        try {
            DB::connection()->getPdo();
        } catch (Exception $e) {
            $dbStatus = 'unreachable: ' . $e->getMessage();
        }

        return response()->json([
            'status' => 'operational',
            'app' => 'NebulaScout',
            'version' => '1.0.0',
            'environment' => config('app.env'),
            'database' => $dbStatus,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Status of external research and AI providers.
     */
    public function providers(): JsonResponse
    {
        return response()->json([
            'ai' => $this->aiService->getStatus(),
            'search' => [
                'brave_search' => [
                    'configured' => ! empty(env('BRAVE_SEARCH_API_KEY')),
                    'required_env' => 'BRAVE_SEARCH_API_KEY',
                ],
                'serper' => [
                    'configured' => ! empty(env('SERPER_API_KEY')),
                    'required_env' => 'SERPER_API_KEY',
                ],
                'google_places' => [
                    'configured' => ! empty(env('GOOGLE_PLACES_API_KEY')),
                    'required_env' => 'GOOGLE_PLACES_API_KEY',
                ],
            ],
            'audit' => [
                'status' => 'native_ssrf_safe_engine',
                'active' => true,
            ],
            'instagram' => [
                'mode' => 'public_metadata_and_manual_entry',
                'automation_status' => 'human_controlled (safe policy)',
            ],
        ]);
    }
}
