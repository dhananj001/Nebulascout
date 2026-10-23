<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_type',
        'provider',
        'model',
        'prompt_tokens',
        'completion_tokens',
        'estimated_cost',
        'duration_ms',
        'status',
        'error_message',
    ];

    protected $casts = [
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'estimated_cost' => 'decimal:4',
        'duration_ms' => 'integer',
    ];
}
