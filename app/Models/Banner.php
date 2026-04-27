<?php
// app/Models/Banner.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image_path',
        'mobile_image_path',
        'link_url',
        'button_text',
        'alt_text',
        'sort_order',
        'is_active',
        'start_date',
        'end_date',
        'target_audience',
        'target_roles',
        'target_puroks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'target_roles' => 'array',
        'target_puroks' => 'array',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'mobile_image_url',
    ];

    // COPY THE EXACT SAME PATTERN AS RESIDENT MODEL
   public function getImageUrlAttribute(): ?string
{
    if (!$this->image_path) {
        return null;
    }
    
    if (str_starts_with($this->image_path, 'http')) {
        return $this->image_path;
    }
    
    // Try Storage::url first
    $url = Storage::url($this->image_path);
    
    // Fallback: use asset helper
    if (!file_exists(public_path($url))) {
        return asset('storage/' . $this->image_path);
    }
    
    return $url;
}

    public function getMobileImageUrlAttribute(): ?string
    {
        if (!$this->mobile_image_path) {
            return $this->image_url;
        }
        
        if (str_starts_with($this->mobile_image_path, 'http')) {
            return $this->mobile_image_path;
        }
        
        return Storage::url($this->mobile_image_path);
    }

    // Helper for checking if image exists
    public function getHasImageAttribute(): bool
    {
        return !empty($this->image_path);
    }

    public function getHasMobileImageAttribute(): bool
    {
        return !empty($this->mobile_image_path);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            });
    }

    public function scopeVisibleToUser($query, $user)
    {
        return $query->where('target_audience', 'all');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}