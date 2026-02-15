<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentEvidence extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'incident_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'uploaded_by',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the incident that owns the evidence.
     */
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    /**
     * Get the user who uploaded the evidence.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the URL for accessing the file.
     *
     * @return string
     */
    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Check if the evidence file is an image.
     *
     * @return bool
     */
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->file_type, 'image/');
    }

    /**
     * Check if the evidence file is a PDF.
     *
     * @return bool
     */
    public function getIsPdfAttribute(): bool
    {
        return $this->file_type === 'application/pdf' || str_contains($this->file_name, '.pdf');
    }

    /**
     * Check if the evidence file is a video.
     *
     * @return bool
     */
    public function getIsVideoAttribute(): bool
    {
        return str_starts_with($this->file_type, 'video/');
    }

    /**
     * Get the file extension.
     *
     * @return string
     */
    public function getFileExtensionAttribute(): string
    {
        return pathinfo($this->file_name, PATHINFO_EXTENSION);
    }

    /**
     * Get the formatted file size.
     *
     * @param int $precision
     * @return string
     */
    public function getFormattedSizeAttribute(int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($this->file_size, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Scope a query to only include image files.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeImages($query)
    {
        return $query->where('file_type', 'like', 'image/%');
    }

    /**
     * Scope a query to only include PDF files.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePdfs($query)
    {
        return $query->where('file_type', 'application/pdf');
    }

    /**
     * Scope a query to only include video files.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVideos($query)
    {
        return $query->where('file_type', 'like', 'video/%');
    }

    /**
     * Get the display name for the file.
     *
     * @return string
     */
    public function getDisplayNameAttribute(): string
    {
        // If filename is too long, truncate it
        if (strlen($this->file_name) > 30) {
            $extension = $this->file_extension;
            $name = substr($this->file_name, 0, 30 - strlen($extension) - 3);
            return $name . '...' . $extension;
        }
        
        return $this->file_name;
    }
}