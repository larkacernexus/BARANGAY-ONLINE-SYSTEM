<?php
// app/Models/AnnouncementAttachment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnnouncementAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'announcement_id',
        'file_path',
        'file_name',
        'original_name',
        'file_size',
        'mime_type',
        'created_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    protected $appends = [
        'formatted_size',
        'is_image',
    ];

    // ========== RELATIONSHIPS ==========

    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ========== ACCESSORS ==========

    /**
     * Get formatted file size
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes === 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Check if file is an image
     */
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    // ========== SCOPES ==========

    /**
     * Scope for images only
     */
    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    /**
     * Scope for documents only (non-images)
     */
    public function scopeDocuments($query)
    {
        return $query->where('mime_type', 'not like', 'image/%');
    }
}