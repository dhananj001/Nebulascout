<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_sprints', function (Blueprint $table) {
            $table->id();
            $table->date('sprint_date')->unique()->index();
            $table->unsignedInteger('target_count')->default(25);
            $table->unsignedInteger('completed_count')->default(0);
            $table->string('target_niche')->nullable();
            $table->decimal('deal_size_estimate', 10, 2)->default(2500.00);
            $table->decimal('conversion_rate_estimate', 5, 2)->default(4.00);
            $table->string('status')->default('in_progress')->index(); // not_started, in_progress, completed, paused
            $table->unsignedInteger('streak_count')->default(1);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('daily_sprint_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_sprint_id')->constrained('daily_sprints')->cascadeOnDelete();
            $table->foreignId('prospect_id')->constrained('prospects')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('pending')->index(); // pending, completed, skipped
            $table->string('preferred_channel')->default('instagram_dm');
            $table->string('skip_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['daily_sprint_id', 'prospect_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_sprint_items');
        Schema::dropIfExists('daily_sprints');
    }
};
