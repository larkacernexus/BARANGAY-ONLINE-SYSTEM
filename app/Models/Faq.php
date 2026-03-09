<?php
// app/Models/Faq.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'question',
        'answer',
        'category',
        'order',
        'is_active',
        'views',
        'helpful_count',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
}