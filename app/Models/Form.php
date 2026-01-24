<?php
// app/Models/Form.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Form extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'issuing_agency',
        'category',
        'is_active',
        'download_count',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'download_count' => 'integer',
        'file_size' => 'integer',
    ];

    protected $appends = [
        'download_url',
        'formatted_file_size',
    ];

    // Predefined categories as constants
    const CATEGORIES = [
        'Social Services',
        'Permits & Licenses',
        'Health & Medical',
        'Education',
        'Legal & Police',
        'Employment',
        'Housing',
        'Other',
    ];

    const AGENCIES = [
        'City Mayor\'s Office',
        'DSWD',
        'PNP',
        'SSS',
        'GSIS',
        'PhilHealth',
        'BIR',
        'DENR',
        'DOLE',
        'DepEd',
        'TESDA',
        'LGU',
        'Other',
    ];

    public function getDownloadUrlAttribute(): string
    {
        return route('forms.download', $this->slug);
    }

    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) return 'N/A';
        
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAgency($query, $agency)
    {
        return $query->where('issuing_agency', $agency);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('issuing_agency', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%");
        });
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }
}