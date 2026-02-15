<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Backup extends Model
{
    protected $fillable = [
        'name',
        'filename',
        'type',
        'size',
        'path',
        'status',
        'compressed',
        'tables',
        'storage_location',
        'contains_files',
        'contains_database',
        'file_count',
        'created_by',
        'restored_by',
        'last_restored_at',
        'expires_at',
        'checksum',
    ];
    
    protected $casts = [
        'tables' => 'array',
        'compressed' => 'boolean',
        'contains_files' => 'boolean',
        'contains_database' => 'boolean',
        'last_restored_at' => 'datetime',
        'expires_at' => 'datetime',
        'file_count' => 'integer',
    ];
    
    protected $appends = [
        'human_size',
        'download_url',
        'restore_url',
        'delete_url',
        'contents_summary',
        'is_expired',
    ];
    
    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function restorer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'restored_by');
    }
    
    // Accessors
    public function getHumanSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    public function getDownloadUrlAttribute(): string
    {
        return route('backups.download', $this->id);
    }
    
    public function getRestoreUrlAttribute(): string
    {
        return route('backups.restore', $this->id);
    }
    
    public function getDeleteUrlAttribute(): string
    {
        return route('backups.destroy', $this->id);
    }
    
    public function getContentsSummaryAttribute(): array
    {
        return [
            'database' => $this->contains_database,
            'files' => $this->contains_files,
            'tables' => $this->tables,
            'file_count' => $this->file_count,
            'compressed' => $this->compressed,
        ];
    }
    
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
    
    // Scopes
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<', now());
    }
    
    public function scopeWithDatabase($query)
    {
        return $query->where('contains_database', true);
    }
    
    public function scopeWithFiles($query)
    {
        return $query->where('contains_files', true);
    }
    
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    // Methods
    public function fileExists(): bool
    {
        return Storage::disk('backups')->exists($this->filename);
    }
    
    public function getFileSize(): int
    {
        if (!$this->fileExists()) {
            return 0;
        }
        
        return Storage::disk('backups')->size($this->filename);
    }
    
    public function getFilePath(): string
    {
        return Storage::disk('backups')->path($this->filename);
    }
}