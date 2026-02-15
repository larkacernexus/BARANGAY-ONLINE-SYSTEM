<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BackupActivity extends Model
{
    protected $fillable = [
        'backup_id',
        'user_id',
        'action',
        'details',
        'status',
        'duration',
        'file_size',
    ];
    
    protected $casts = [
        'details' => 'array',
        'duration' => 'integer',
        'file_size' => 'integer',
    ];
    
    public function backup(): BelongsTo
    {
        return $this->belongsTo(Backup::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function getHumanFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}