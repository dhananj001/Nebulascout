<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'url',
        'is_accessible',
        'https_supported',
        'response_time_ms',
        'page_title',
        'meta_description',
        'viewport_meta_found',
        'enquiry_paths_found',
        'portfolio_found',
        'broken_links_count',
        'alt_coverage_percent',
        'tech_stack_signals',
        'status',
        'check_details',
        'audited_at',
    ];

    protected $casts = [
        'is_accessible' => 'boolean',
        'https_supported' => 'boolean',
        'viewport_meta_found' => 'boolean',
        'portfolio_found' => 'boolean',
        'enquiry_paths_found' => 'array',
        'tech_stack_signals' => 'array',
        'check_details' => 'array',
        'audited_at' => 'datetime',
        'response_time_ms' => 'integer',
        'broken_links_count' => 'integer',
        'alt_coverage_percent' => 'integer',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }
}
