<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailySprintItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'daily_sprint_id',
        'prospect_id',
        'sort_order',
        'status',
        'preferred_channel',
        'skip_reason',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(DailySprint::class, 'daily_sprint_id');
    }

    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class);
    }
}
