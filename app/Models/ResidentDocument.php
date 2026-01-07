<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResidentDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resident_id',
        'document_category_id',
        'name',
        'file_name',
        'file_path',
        'file_extension',
        'file_size',
        'file_size_human',
        'mime_type',
        'reference_number',
        'description',
        'issue_date',
        'expiry_date',
        'metadata',
        'is_public',
        'requires_password',
        'password',
        'view_count',
        'download_count',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
        'requires_password' => 'boolean',
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'file_size' => 'integer',
        'view_count' => 'integer',
        'download_count' => 'integer',
    ];

    /**
     * Get the resident that owns the document.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the category that owns the document.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'document_category_id');
    }

    /**
     * Scope a query to only include active documents.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include expired documents.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(function ($q) {
                $q->where('status', 'active')
                  ->whereDate('expiry_date', '<', now());
            });
    }

    /**
     * Check if document is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired' || 
               ($this->status === 'active' && $this->expiry_date && $this->expiry_date->isPast());
    }

    /**
     * Increment view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment download count.
     */
    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    /**
     * Get the file URL for display.
     */
    public function getFileUrl(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get the storage path.
     */
    public function getStoragePath(): string
    {
        return storage_path('app/public/' . $this->file_path);
    }

    /**
     * Get file icon based on extension.
     */
    public function getFileIcon(): string
    {
        $icons = [
            'pdf' => 'FileText',
            'doc' => 'FileText',
            'docx' => 'FileText',
            'xls' => 'FileText',
            'xlsx' => 'FileText',
            'jpg' => 'FileImage',
            'jpeg' => 'FileImage',
            'png' => 'FileImage',
            'gif' => 'FileImage',
        ];

        return $icons[strtolower($this->file_extension)] ?? 'File';
    }
}