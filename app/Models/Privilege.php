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
        'default_discount_percentage',
        'requires_id_number',
        'requires_verification',
        'validity_years',
    ];

    protected $casts = [
        'id' => 'integer',
        'is_active' => 'boolean',
        'discount_type_id' => 'integer',
        'default_discount_percentage' => 'decimal:2',
        'requires_id_number' => 'boolean',
        'requires_verification' => 'boolean',
        'validity_years' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
        'requires_id_number' => true,
        'requires_verification' => true,
    ];

    /**
     * Get the discount type for this privilege
     */
    public function discountType(): BelongsTo
    {
        return $this->belongsTo(DiscountType::class);
    }

    /**
     * Get the resident privileges for this privilege
     */
    public function residentPrivileges(): HasMany
    {
        return $this->hasMany(ResidentPrivilege::class);
    }

    /**
     * Get residents through the resident_privileges table (convenience method)
     * This uses the ResidentPrivilege model as the pivot
     */
    public function getResidentsAttribute()
    {
        return $this->residentPrivileges()
            ->with('resident')
            ->get()
            ->pluck('resident');
    }

    /**
     * Get active residents with this privilege
     */
    public function getActiveResidentsAttribute()
    {
        return $this->residentPrivileges()
            ->whereNotNull('verified_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->with('resident')
            ->get()
            ->pluck('resident');
    }

    /**
     * Count residents with this privilege
     */
    public function getResidentsCountAttribute(): int
    {
        return $this->residentPrivileges()->count();
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

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function findByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }
}