<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OutreachDraft extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'channel',
        'angle',
        'subject',
        'body',
        'status',
        'version',
        'prompt_version',
        'supporting_evidence_ids',
        'strategy_notes',
    ];

    protected $casts = [
        'supporting_evidence_ids' => 'array',
        'version' => 'integer',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }

    public function sentMessage(): HasOne
    {
        return $this->hasOne(SentMessage::class);
    }
}
