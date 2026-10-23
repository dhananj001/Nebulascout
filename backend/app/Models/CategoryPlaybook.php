<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoryPlaybook extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'ideal_customer_profile',
        'search_terms',
        'default_geography',
        'research_questions',
        'desired_attributes',
        'opportunity_criteria',
        'disqualifiers',
        'scoring_weights',
        'preferred_services',
        'outreach_tone',
        'prohibited_claims',
        'sample_messages',
        're_research_days',
        'is_default',
    ];

    protected $casts = [
        'search_terms' => 'array',
        'research_questions' => 'array',
        'desired_attributes' => 'array',
        'opportunity_criteria' => 'array',
        'disqualifiers' => 'array',
        'scoring_weights' => 'array',
        'preferred_services' => 'array',
        'prohibited_claims' => 'array',
        'sample_messages' => 'array',
        're_research_days' => 'integer',
        'is_default' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function prospects(): HasMany
    {
        return $this->hasMany(Prospect::class);
    }

    public function researchRuns(): HasMany
    {
        return $this->hasMany(ResearchRun::class);
    }
}
