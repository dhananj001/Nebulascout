<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Opportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'title',
        'rationale',
        'supporting_source_ids',
        'confidence',
        'is_hypothesis',
    ];

    protected $casts = [
        'supporting_source_ids' => 'array',
        'confidence' => 'float',
        'is_hypothesis' => 'boolean',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }
}
