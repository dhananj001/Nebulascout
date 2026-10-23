<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'research_run_id',
        'source_type',
        'source_url',
        'page_title',
        'excerpt',
        'content_hash',
        'confidence',
        'status',
        'retrieved_at',
    ];

    protected $casts = [
        'confidence' => 'float',
        'retrieved_at' => 'datetime',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }

    public function researchRun(): BelongsTo
    {
        return $this->belongsTo(ResearchRun::class);
    }
}
