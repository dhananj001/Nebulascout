<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Prospect extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'category_playbook_id',
        'business_name',
        'normalized_domain',
        'primary_url',
        'instagram_handle',
        'instagram_url',
        'location',
        'city',
        'country',
        'phone',
        'email',
        'stage',
        'fit_score',
        'opportunity_score',
        'confidence_score',
        'score_explanation',
        'research_status',
        'last_researched_at',
        'is_do_not_contact',
        'do_not_contact_reason',
        'do_not_contact_at',
        'commercial_estimate',
        'tags',
        'metadata',
    ];

    protected $casts = [
        'fit_score' => 'integer',
        'opportunity_score' => 'integer',
        'confidence_score' => 'integer',
        'score_explanation' => 'array',
        'last_researched_at' => 'datetime',
        'is_do_not_contact' => 'boolean',
        'do_not_contact_at' => 'datetime',
        'commercial_estimate' => 'decimal:2',
        'tags' => 'array',
        'metadata' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function playbook(): BelongsTo
    {
        return $this->belongsTo(CategoryPlaybook::class, 'category_playbook_id');
    }

    public function identifiers(): HasMany
    {
        return $this->hasMany(ProspectIdentifier::class);
    }

    public function sources(): HasMany
    {
        return $this->hasMany(ResearchSource::class);
    }

    public function observations(): HasMany
    {
        return $this->hasMany(ProspectObservation::class);
    }

    public function websiteAudits(): HasMany
    {
        return $this->hasMany(WebsiteAudit::class);
    }

    public function latestWebsiteAudit(): HasOne
    {
        return $this->hasOne(WebsiteAudit::class)->latestOfMany();
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    public function drafts(): HasMany
    {
        return $this->hasMany(OutreachDraft::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(SentMessage::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(OutreachActivity::class)->orderByDesc('created_at');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class)->orderByDesc('created_at');
    }

    /**
     * Check if prospect requires stale research refresh.
     */
    public function isStale(): bool
    {
        if (! $this->last_researched_at) {
            return true;
        }

        $days = $this->playbook?->re_research_days ?? 60;
        return $this->last_researched_at->diffInDays(now()) >= $days;
    }

    /**
     * Log an outreach activity on this prospect.
     */
    public function recordActivity(string $eventType, string $description, array $metadata = [], string $actor = 'operator'): OutreachActivity
    {
        return $this->activities()->create([
            'event_type' => $eventType,
            'description' => $description,
            'metadata' => $metadata,
            'actor' => $actor,
        ]);
    }
}
