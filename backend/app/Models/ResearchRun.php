<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_playbook_id',
        'category_name',
        'location_query',
        'query',
        'mode',
        'status',
        'candidates_found',
        'prospects_created',
        'warnings',
        'execution_log',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'warnings' => 'array',
        'execution_log' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'candidates_found' => 'integer',
        'prospects_created' => 'integer',
    ];

    public function playbook(): BelongsTo
    {
        return $this->belongsTo(CategoryPlaybook::class, 'category_playbook_id');
    }

    public function sources(): HasMany
    {
        return $this->hasMany(ResearchSource::class);
    }
}
