<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SentMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'prospect_id',
        'outreach_draft_id',
        'channel',
        'exact_sent_text',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }

    public function draft(): BelongsTo
    {
        return $this->belongsTo(OutreachDraft::class, 'outreach_draft_id');
    }
}
