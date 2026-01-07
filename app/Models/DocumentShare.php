<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class DocumentShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'token',
        'access_type',
        'requires_password',
        'password',
        'expires_at',
        'max_views',
        'view_count',
        'is_active',
    ];

    protected $casts = [
        'requires_password' => 'boolean',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'max_views' => 'integer',
        'view_count' => 'integer',
    ];

    /**
     * Get the document that owns the share.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(ResidentDocument::class, 'document_id');
    }

    /**
     * Check if share is expired.
     */
    public function isExpired(): bool
    {
        return ($this->expires_at && $this->expires_at->isPast()) || 
               ($this->max_views && $this->view_count >= $this->max_views);
    }

    /**
     * Increment view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Generate a unique token.
     */
    public static function generateToken(): string
    {
        do {
            $token = Str::random(32);
        } while (self::where('token', $token)->exists());

        return $token;
    }
}