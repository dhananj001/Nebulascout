<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutreachActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'event_type',
        'description',
        'metadata',
        'actor',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }
}
