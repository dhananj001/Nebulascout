<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailySprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'sprint_date',
        'target_count',
        'completed_count',
        'target_niche',
        'deal_size_estimate',
        'conversion_rate_estimate',
        'status',
        'streak_count',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'sprint_date' => 'date',
        'target_count' => 'integer',
        'completed_count' => 'integer',
        'streak_count' => 'integer',
        'deal_size_estimate' => 'float',
        'conversion_rate_estimate' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(DailySprintItem::class)->orderBy('sort_order');
    }

    /**
     * Compute potential expected pipeline value generated.
     */
    public function getProjectedPipelineValueAttribute(): float
    {
        $closeRate = ($this->conversion_rate_estimate ?: 4.0) / 100;
        return round($this->completed_count * $closeRate * ($this->deal_size_estimate ?: 2500.0), 2);
    }

    /**
     * Compute progress percentage.
     */
    public function getProgressPercentAttribute(): int
    {
        if ($this->target_count <= 0) {
            return 0;
        }
        return min(100, (int) round(($this->completed_count / $this->target_count) * 100));
    }

    /**
     * Get or initialize today's sprint record.
     */
    public static function getOrCreateToday(): self
    {
        $today = Carbon::today()->toDateString();
        $sprint = self::whereDate('sprint_date', $today)->first();

        if (! $sprint) {
            // Calculate current streak
            $streak = self::calculateCurrentStreak($today);

            $sprint = self::create([
                'sprint_date' => $today,
                'target_count' => 25,
                'completed_count' => 0,
                'target_niche' => 'Web Development & Redesign',
                'deal_size_estimate' => 2500.00,
                'conversion_rate_estimate' => 4.00,
                'status' => 'not_started',
                'streak_count' => max(1, $streak),
            ]);
        }

        return $sprint;
    }

    /**
     * Calculate consecutive days with at least 5 pitches completed.
     */
    public static function calculateCurrentStreak(string $forDate): int
    {
        $streak = 1;
        $checkDate = Carbon::parse($forDate)->subDay();

        while (true) {
            $pastSprint = self::whereDate('sprint_date', $checkDate->toDateString())->first();
            if ($pastSprint && $pastSprint->completed_count >= 5) {
                $streak++;
                $checkDate->subDay();
            } else {
                break;
            }
        }

        return $streak;
    }
}
