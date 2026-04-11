<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Privilege extends Model
{
    use HasFactory;

    protected $table = 'privileges';

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'discount_type_id',
    ];

    protected $casts = [
        'id' => 'integer',
        'is_active' => 'boolean',
        'discount_type_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    // ========== RELATIONSHIPS ==========
    
    /**
     * The discount type that this privilege grants (if any)
     */
    public function discountType(): BelongsTo
    {
        return $this->belongsTo(DiscountType::class);
    }

    /**
     * Residents who have this privilege (through pivot)
     */
    public function residentPrivileges(): HasMany
    {
        return $this->hasMany(ResidentPrivilege::class);
    }

    /**
     * Get all residents with this privilege (convenience)
     */
    public function residents()
    {
        return $this->belongsToMany(Resident::class, 'resident_privileges')
                    ->withPivot('id_number', 'verified_at', 'expires_at', 'remarks')
                    ->withTimestamps();
    }

    // ========== ACCESSORS ==========
    
    /**
     * Get discount percentage from the linked discount type
     * ✅ FIXED: Use 'percentage' instead of 'default_percentage'
     */
    public function getDiscountPercentageAttribute(): float
    {
        return $this->discountType?->percentage ?? 0;
    }

    /**
     * Check if this privilege has an associated discount
     */
    public function getHasDiscountAttribute(): bool
    {
        return !is_null($this->discount_type_id) && $this->discountType?->is_active;
    }

    /**
     * Get verification requirements from the discount type
     */
    public function getRequiresVerificationAttribute(): bool
    {
        return $this->discountType?->requires_verification ?? false;
    }

    /**
     * Get ID number requirement from the discount type
     */
    public function getRequiresIdNumberAttribute(): bool
    {
        return $this->discountType?->requires_id_number ?? false;
    }

    /**
     * Get validity days from the discount type
     */
    public function getValidityDaysAttribute(): int
    {
        return $this->discountType?->validity_days ?? 0;
    }

    // ========== SCOPES ==========
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithDiscount($query)
    {
        return $query->whereNotNull('discount_type_id')
                    ->whereHas('discountType', function($q) {
                        $q->where('is_active', true);
                    });
    }

    public function scopeWithoutDiscount($query)
    {
        return $query->whereNull('discount_type_id');
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }

    // ========== HELPER METHODS ==========
    
    /**
     * Find privilege by code
     */
    public static function findByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }

    /**
     * Get active residents with this privilege (not expired)
     */
    public function getActiveResidents()
    {
        return $this->residents()
            ->wherePivotNotNull('verified_at')
            ->wherePivot(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->get();
    }

    /**
     * Count active residents with this privilege
     */
    public function getActiveResidentsCountAttribute(): int
    {
        return $this->residentPrivileges()
            ->whereNotNull('verified_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->count();
    }

    /**
     * Get total residents count (including expired)
     */
    public function getTotalResidentsCountAttribute(): int
    {
        return $this->residentPrivileges()->count();
    }
}