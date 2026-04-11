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
        'discount_percentage' => 'decimal:2',
    ];

    protected $dates = [
        'verified_at',
        'expires_at',
    ];

    // ========== RELATIONSHIPS ==========

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

    // ========== ACCESSORS ==========

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
     * ✅ FIXED: Use 'percentage' from DiscountType
     */
    public function getEffectiveDiscountPercentageAttribute(): ?float
    {
        // Priority 1: Direct discount_percentage on the pivot
        if ($this->discount_percentage) {
            return (float) $this->discount_percentage;
        }
        
        // Priority 2: Percentage from DiscountType
        if ($this->discountType && $this->discountType->percentage) {
            return (float) $this->discountType->percentage;
        }
        
        // Priority 3: Percentage from Privilege's DiscountType
        if ($this->privilege && $this->privilege->discountType) {
            return (float) $this->privilege->discountType->percentage;
        }
        
        return null;
    }

    /**
     * Get formatted discount percentage
     */
    public function getFormattedDiscountPercentageAttribute(): string
    {
        $percentage = $this->effective_discount_percentage;
        return $percentage ? $percentage . '%' : '0%';
    }

    /**
     * Check if privilege requires ID number
     */
    public function getRequiresIdNumberAttribute(): bool
    {
        if ($this->discountType) {
            return (bool) $this->discountType->requires_id_number;
        }
        if ($this->privilege && $this->privilege->discountType) {
            return (bool) $this->privilege->discountType->requires_id_number;
        }
        return true;
    }

    /**
     * Check if privilege requires verification
     */
    public function getRequiresVerificationAttribute(): bool
    {
        if ($this->discountType) {
            return (bool) $this->discountType->requires_verification;
        }
        if ($this->privilege && $this->privilege->discountType) {
            return (bool) $this->privilege->discountType->requires_verification;
        }
        return true;
    }

    /**
     * Get verification document requirement
     */
    public function getVerificationDocumentAttribute(): ?string
    {
        if ($this->discountType) {
            return $this->discountType->verification_document;
        }
        if ($this->privilege && $this->privilege->discountType) {
            return $this->privilege->discountType->verification_document;
        }
        return null;
    }

    /**
     * Get validity days
     */
    public function getValidityDaysAttribute(): int
    {
        if ($this->discountType) {
            return (int) $this->discountType->validity_days;
        }
        if ($this->privilege && $this->privilege->discountType) {
            return (int) $this->privilege->discountType->validity_days;
        }
        return 365;
    }

    // ========== SCOPES ==========

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

    /**
     * Scope by privilege code
     */
    public function scopeByPrivilegeCode($query, $code)
    {
        return $query->whereHas('privilege', function($q) use ($code) {
            $q->where('code', $code);
        });
    }
}