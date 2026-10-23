<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedView extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'filter_criteria',
        'sort_field',
        'sort_order',
        'is_default',
    ];

    protected $casts = [
        'filter_criteria' => 'array',
        'is_default' => 'boolean',
    ];
}
