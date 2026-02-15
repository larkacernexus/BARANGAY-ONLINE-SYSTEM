<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReportEvidence extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'report_evidences';

    protected $fillable = [
        'report_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'notes',
        'uploaded_by',           // Resident ID or NULL for anonymous
        'is_verified',
        'verified_by',
        'verified_at',
        'verification_notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationship: Evidence belongs to a report
    public function report(): BelongsTo
    {
        return $this->belongsTo(CommunityReport::class, 'report_id');
    }

    // Relationship: Evidence uploaded by a resident (head of household)
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'uploaded_by');
    }

    // Relationship: Evidence verified by (admin/officer)
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Check if uploaded anonymously (uploaded_by is NULL)
    public function getIsAnonymousAttribute(): bool
    {
        return $this->uploaded_by === null;
    }

    // Get full URL to the file
    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    // Check if file is an image
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->file_type, 'image/');
    }

    // Check if file is a video
    public function getIsVideoAttribute(): bool
    {
        return str_starts_with($this->file_type, 'video/');
    }

    // Check if file is a PDF
    public function getIsPdfAttribute(): bool
    {
        return $this->file_type === 'application/pdf';
    }

    // Format file size for display
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    // Get file icon based on type
    public function getFileIconAttribute(): string
    {
        if ($this->is_image) {
            return 'image';
        } elseif ($this->is_video) {
            return 'video';
        } elseif ($this->is_pdf) {
            return 'file-text';
        } else {
            return 'file';
        }
    }
}