<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProspectObservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'claim',
        'evidence_excerpt',
        'kind',
        'confidence',
        'supporting_source_ids',
        'checked_at',
    ];

    protected $casts = [
        'confidence' => 'float',
        'supporting_source_ids' => 'array',
        'checked_at' => 'datetime',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }
}
