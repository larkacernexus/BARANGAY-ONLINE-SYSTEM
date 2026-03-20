<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResidentPrivilege extends Model
{
    use HasFactory;

    protected $table = 'resident_privileges';
    
    protected $fillable = [
        'resident_id',
        'privilege_id',
        'discount_type_id',
        'id_number',
        'verified_at',
        'expires_at',
        'remarks',
        'discount_percentage',
    ];

    protected $casts = [
        'id' => 'integer',
        'resident_id' => 'integer',
        'privilege_id' => 'integer',
        'discount_type_id' => 'integer',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'verified_at',
        'expires_at',
    ];

    /**
     * Get the resident that owns this privilege assignment
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the privilege that this assignment belongs to
     */
    public function privilege(): BelongsTo
    {
        return $this->belongsTo(Privilege::class);
    }

    /**
     * Get the discount type for this privilege assignment
     */
    public function discountType(): BelongsTo
    {
        return $this->belongsTo(DiscountType::class);
    }

    /**
     * Check if this privilege assignment is active
     */
    public function isActive(): bool
    {
        if (!$this->verified_at) {
            return false;
        }
        
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        
        return true;
    }

    /**
     * Get the status of this privilege assignment
     */
    public function getStatusAttribute(): string
    {
        if (!$this->verified_at) {
            return 'pending';
        }
        
        if (!$this->expires_at) {
            return 'active';
        }
        
        if ($this->expires_at->isPast()) {
            return 'expired';
        }
        
        if ($this->expires_at->diffInDays(now()) <= 30) {
            return 'expiring_soon';
        }
        
        return 'active';
    }

    /**
     * Get the effective discount percentage
     */
    public function getEffectiveDiscountPercentageAttribute(): ?float
    {
        if ($this->discount_percentage) {
            return $this->discount_percentage;
        }
        
        if ($this->discountType) {
            return $this->discountType->default_percentage;
        }
        
        if ($this->privilege) {
            return $this->privilege->default_discount_percentage;
        }
        
        return null;
    }

    /**
     * Scope for active privileges
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('verified_at')
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope for pending privileges (not verified)
     */
    public function scopePending($query)
    {
        return $query->whereNull('verified_at');
    }

    /**
     * Scope for verified privileges
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Scope for expiring soon (within 30 days)
     */
    public function scopeExpiringSoon($query)
    {
        return $query->whereNotNull('verified_at')
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays(30)]);
    }

    /**
     * Scope for expired
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('verified_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }

    /**
     * Scope by discount type
     */
    public function scopeByDiscountType($query, $discountTypeId)
    {
        return $query->where('discount_type_id', $discountTypeId);
    }

    /**
     * Scope by privilege
     */
    public function scopeByPrivilege($query, $privilegeId)
    {
        return $query->where('privilege_id', $privilegeId);
    }
}