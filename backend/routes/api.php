<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\CategoryPlaybookController;
use App\Http\Controllers\Api\V1\FollowUpController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\OutreachController;
use App\Http\Controllers\Api\V1\ProspectController;
use App\Http\Controllers\Api\V1\ResearchRunController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health & System Status
    Route::get('/health', [HealthController::class, 'health']);
    Route::get('/providers', [HealthController::class, 'providers']);

    // Analytics & Metrics
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // Prospects CRUD & Actions
    Route::get('/prospects', [ProspectController::class, 'index']);
    Route::post('/prospects', [ProspectController::class, 'store']);
    Route::get('/prospects/export', [ProspectController::class, 'exportCsv']);
    Route::post('/prospects/import', [ProspectController::class, 'importCsv']);
    Route::get('/prospects/{id}', [ProspectController::class, 'show']);
    Route::put('/prospects/{id}', [ProspectController::class, 'update']);
    Route::delete('/prospects/{id}', [ProspectController::class, 'destroy']);
    Route::post('/prospects/{id}/stage', [ProspectController::class, 'updateStage']);
    Route::post('/prospects/{id}/research', [ProspectController::class, 'research']);
    Route::post('/prospects/{id}/notes', [ProspectController::class, 'addNote']);

    // Research Runs
    Route::get('/research-runs', [ResearchRunController::class, 'index']);
    Route::post('/research-runs', [ResearchRunController::class, 'store']);
    Route::get('/research-runs/{id}', [ResearchRunController::class, 'show']);

    // Outreach CRM Flow
    Route::post('/outreach/prospects/{prospectId}/draft', [OutreachController::class, 'generateDraft']);
    Route::put('/outreach/drafts/{draftId}', [OutreachController::class, 'updateDraft']);
    Route::post('/outreach/drafts/{draftId}/copy', [OutreachController::class, 'copyDraft']);
    Route::post('/outreach/drafts/{draftId}/confirm-sent', [OutreachController::class, 'confirmSent']);
    Route::post('/outreach/prospects/{prospectId}/reply', [OutreachController::class, 'recordReply']);

    // Follow-Ups
    Route::get('/follow-ups', [FollowUpController::class, 'index']);
    Route::post('/follow-ups', [FollowUpController::class, 'store']);
    Route::put('/follow-ups/{id}', [FollowUpController::class, 'update']);

    // Categories & Playbooks
    Route::get('/categories', [CategoryPlaybookController::class, 'index']);
    Route::post('/playbooks', [CategoryPlaybookController::class, 'store']);
    Route::put('/playbooks/{id}', [CategoryPlaybookController::class, 'update']);
    Route::get('/playbooks/{id}/export', [CategoryPlaybookController::class, 'exportPlaybook']);
    Route::post('/playbooks/import', [CategoryPlaybookController::class, 'importPlaybook']);
});
