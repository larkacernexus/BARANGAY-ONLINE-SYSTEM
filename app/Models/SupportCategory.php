<?php
// app/Models/SupportCategory.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportCategory extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'order',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    public function tickets()
    {
        return $this->hasMany(SupportTicket::class, 'category', 'slug');
    }
    
    public function faqs()
    {
        return $this->hasMany(Faq::class, 'category', 'slug');
    }
}