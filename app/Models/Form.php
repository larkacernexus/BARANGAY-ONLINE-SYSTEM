<?php
// app/Models/Form.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
        'is_featured',
        'is_public',
        'requires_login',
        'tags',
        'view_count',
        'download_count',
        'last_viewed_at',
        'last_viewed_by',
        'last_downloaded_at',
        'last_downloaded_by',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'requires_login' => 'boolean',
        'tags' => 'array',
        'download_count' => 'integer',
        'view_count' => 'integer',
        'file_size' => 'integer',
        'last_viewed_at' => 'datetime',
        'last_downloaded_at' => 'datetime',
    ];

    protected $appends = [
        'download_url',
        'formatted_file_size',
        'conversion_rate',
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

protected function downloadUrl(): Attribute
{
    return Attribute::make(
        get: fn () => route('admin.forms.download', $this), // FIXED: Changed from admin.forms.download
    );
}

    protected function formattedFileSize(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->file_size) return '0 Bytes';
                
                $bytes = $this->file_size;
                $units = ['Bytes', 'KB', 'MB', 'GB'];
                
                for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
                    $bytes /= 1024;
                }
                
                return round($bytes, 2) . ' ' . $units[$i];
            }
        );
    }

    protected function conversionRate(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->view_count === 0) return 0;
                return round(($this->download_count / $this->view_count) * 100, 2);
            }
        );
    }

    protected function mimeType(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->file_type, // Alias for frontend compatibility
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lastViewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_viewed_by');
    }

    public function lastDownloadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_downloaded_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
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
              ->orWhere('category', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    // Check if file can be previewed in browser
    public function canPreview(): bool
    {
        $previewableTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'text/plain',
            'text/html',
        ];

        return in_array($this->file_type, $previewableTypes);
    }

    // Get file extension
    public function getFileExtension(): string
    {
        return pathinfo($this->file_name, PATHINFO_EXTENSION);
    }
}