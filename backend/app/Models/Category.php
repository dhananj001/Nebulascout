<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function playbooks(): HasMany
    {
        return $this->hasMany(CategoryPlaybook::class);
    }

    public function prospects(): HasMany
    {
        return $this->hasMany(Prospect::class);
    }
}
