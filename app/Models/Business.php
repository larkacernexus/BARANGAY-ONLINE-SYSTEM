<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity as ActivityModel;

class Business extends Model
{
    use HasFactory, LogsActivity;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'businesses';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_name',
        'business_type',
        'owner_id',
        'owner_name',
        'dti_sec_number',
        'tin_number',
        'mayors_permit_number',
        'address',
        'purok_id',
        'capital_amount',
        'monthly_gross',
        'employee_count',
        'permit_expiry_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capital_amount' => 'decimal:2',
        'monthly_gross' => 'decimal:2',
        'employee_count' => 'integer',
        'permit_expiry_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'formatted_capital',
        'formatted_monthly_gross',
        'permit_status',
        'status_label',
        'status_color',
        'business_type_label',
    ];

    // ========== BOOT METHOD ==========

    protected static function boot()
    {
        parent::boot();

        // Auto-generate permit number if not provided
        static::creating(function ($business) {
            if (empty($business->mayors_permit_number)) {
                $business->mayors_permit_number = $business->generatePermitNumber();
            }
        });
    }

    // ========== ACTIVITY LOG CONFIGURATION ==========

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'business_name',
                'business_type',
                'owner_id',
                'owner_name',
                'dti_sec_number',
                'tin_number',
                'mayors_permit_number',
                'address',
                'purok_id',
                'capital_amount',
                'monthly_gross',
                'employee_count',
                'permit_expiry_date',
                'status',
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => $this->getDescriptionForEvent($eventName))
            ->dontSubmitEmptyLogs()
            ->logExcept(['updated_at'])
            ->useLogName('businesses');
    }

    private function getDescriptionForEvent(string $eventName): string
    {
        $businessName = $this->business_name;
        
        switch ($eventName) {
            case 'created':
                return "Created new business: {$businessName}";
            case 'updated':
                return "Updated business: {$businessName}";
            case 'deleted':
                return "Deleted business: {$businessName}";
            default:
                return "Performed action on business: {$businessName}";
        }
    }

    public function tapActivity(ActivityModel $activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'business_id' => $this->id,
            'business_name' => $this->business_name,
        ]);
        
        if ($eventName === 'updated' && $this->getChanges()) {
            $activity->properties = $activity->properties->merge([
                'changes' => $this->getChanges(),
                'old_values' => array_intersect_key($this->getOriginal(), $this->getChanges()),
            ]);
        }
    }

    // ========== RELATIONSHIPS ==========

    /**
     * Get the resident owner of the business.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'owner_id');
    }

    /**
     * Get the purok where the business is located.
     */
    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class, 'purok_id');
    }

    /**
     * Get the fees for this business.
     */
    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class, 'business_id');
    }

    /**
     * Get the payments for this business through fees.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'business_id');
    }

    /**
     * Get the activity logs for this business.
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(ActivityModel::class, 'subject');
    }

    // ========== ACCESSORS ==========

    /**
     * Get the formatted capital amount.
     */
    public function getFormattedCapitalAttribute(): string
    {
        return '₱' . number_format($this->capital_amount, 2);
    }

    /**
     * Get the formatted monthly gross.
     */
    public function getFormattedMonthlyGrossAttribute(): string
    {
        return '₱' . number_format($this->monthly_gross, 2);
    }

    /**
     * Get the permit status.
     */
    public function getPermitStatusAttribute(): string
    {
        if (!$this->permit_expiry_date) {
            return 'no_permit';
        }

        if ($this->permit_expiry_date->isPast()) {
            return 'expired';
        }

        if ($this->permit_expiry_date->diffInDays(now()) <= 30) {
            return 'expiring_soon';
        }

        return 'valid';
    }

    /**
     * Get the permit status label.
     */
    public function getPermitStatusLabelAttribute(): string
    {
        return match($this->permit_status) {
            'valid' => 'Valid',
            'expiring_soon' => 'Expiring Soon',
            'expired' => 'Expired',
            'no_permit' => 'No Permit',
            default => 'Unknown'
        };
    }

    /**
     * Get the permit status color.
     */
    public function getPermitStatusColorAttribute(): string
    {
        return match($this->permit_status) {
            'valid' => 'green',
            'expiring_soon' => 'yellow',
            'expired' => 'red',
            'no_permit' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get the status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'closed' => 'Closed',
            'pending' => 'Pending',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get the status color for badges.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'green',
            'closed' => 'red',
            'pending' => 'yellow',
            default => 'gray'
        };
    }

    /**
     * Get the business type label.
     */
    public function getBusinessTypeLabelAttribute(): string
    {
        $types = [
            'sari_sari' => 'Sari-Sari Store',
            'retail' => 'Retail Store',
            'restaurant' => 'Restaurant / Eatery',
            'carinderia' => 'Carinderia',
            'services' => 'Services',
            'manufacturing' => 'Manufacturing',
            'wholesale' => 'Wholesale',
            'agriculture' => 'Agriculture',
            'transport' => 'Transportation',
            'rental' => 'Rental Services',
            'others' => 'Others',
        ];

        return $types[$this->business_type] ?? ucfirst(str_replace('_', ' ', $this->business_type));
    }

    /**
     * Get the owner display name.
     */
    public function getOwnerDisplayAttribute(): string
    {
        if ($this->owner_id && $this->owner) {
            return $this->owner->full_name;
        }
        
        return $this->owner_name;
    }

    /**
     * Check if permit is expiring soon.
     */
    public function getIsPermitExpiringSoonAttribute(): bool
    {
        if (!$this->permit_expiry_date) {
            return false;
        }

        return $this->permit_expiry_date->isFuture() && 
               $this->permit_expiry_date->diffInDays(now()) <= 30;
    }

    /**
     * Get the purok name.
     */
    public function getPurokNameAttribute(): ?string
    {
        return $this->purok?->name;
    }

    // ========== BUSINESS LOGIC METHODS ==========

    /**
     * Generate a unique permit number.
     */
    public function generatePermitNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $random = strtoupper(substr(uniqid(), -6));
        
        return "BP-{$year}-{$month}-{$random}";
    }

    /**
     * Check if the business permit is valid.
     */
    public function hasValidPermit(): bool
    {
        return $this->permit_expiry_date && 
               $this->permit_expiry_date->isFuture() &&
               $this->status === 'active';
    }

    /**
     * Check if the business is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the business is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the business is closed.
     */
    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    /**
     * Check if owned by a resident.
     */
    public function isOwnedByResident(): bool
    {
        return !is_null($this->owner_id);
    }

    /**
     * Get total fees amount.
     */
    public function getTotalFeesAttribute(): float
    {
        return $this->fees()->sum('amount');
    }

    /**
     * Get total paid amount.
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()->sum('amount_paid');
    }

    /**
     * Get outstanding balance.
     */
    public function getOutstandingBalanceAttribute(): float
    {
        return $this->total_fees - $this->total_paid;
    }

    /**
     * Renew business permit.
     */
    public function renewPermit(int $validityDays = 365): bool
    {
        $oldExpiry = $this->permit_expiry_date;
        
        $newExpiry = $oldExpiry && $oldExpiry->isFuture()
            ? $oldExpiry->addDays($validityDays)
            : now()->addDays($validityDays);
        
        $this->update([
            'permit_expiry_date' => $newExpiry,
            'status' => 'active',
        ]);

        activity()
            ->performedOn($this)
            ->withProperties([
                'old_expiry' => $oldExpiry,
                'new_expiry' => $newExpiry,
                'validity_days' => $validityDays,
            ])
            ->log('renewed_permit');

        return true;
    }

    /**
     * Close the business.
     */
    public function close(string $reason = null): bool
    {
        $this->update([
            'status' => 'closed',
        ]);

        activity()
            ->performedOn($this)
            ->withProperties([
                'reason' => $reason,
                'closed_at' => now(),
            ])
            ->log('closed_business');

        return true;
    }

    /**
     * Reopen the business.
     */
    public function reopen(): bool
    {
        $this->update([
            'status' => 'active',
        ]);

        activity()
            ->performedOn($this)
            ->log('reopened_business');

        return true;
    }

    /**
     * Update capital and gross amounts.
     */
    public function updateFinancials(float $capital, float $monthlyGross): bool
    {
        $oldCapital = $this->capital_amount;
        $oldGross = $this->monthly_gross;
        
        $this->update([
            'capital_amount' => $capital,
            'monthly_gross' => $monthlyGross,
        ]);

        activity()
            ->performedOn($this)
            ->withProperties([
                'old_capital' => $oldCapital,
                'new_capital' => $capital,
                'old_gross' => $oldGross,
                'new_gross' => $monthlyGross,
            ])
            ->log('updated_financials');

        return true;
    }

    /**
     * Log custom activity.
     */
    public function logActivity(string $description, array $properties = [], ?Model $causer = null): void
    {
        $activity = activity()
            ->performedOn($this)
            ->withProperties($properties)
            ->log($description);

        if ($causer) {
            $activity->causedBy($causer);
        }
    }

    /**
     * Get activity logs for this business.
     */
    public function getActivityLogs()
    {
        return ActivityModel::where('subject_type', self::class)
            ->where('subject_id', $this->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // ========== SCOPES ==========

    /**
     * Scope a query to only include active businesses.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include pending businesses.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include closed businesses.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope a query to only include businesses with valid permits.
     */
    public function scopeWithValidPermit($query)
    {
        return $query->where('status', 'active')
            ->whereNotNull('permit_expiry_date')
            ->where('permit_expiry_date', '>=', now());
    }

    /**
     * Scope a query to only include businesses with expiring permits.
     */
    public function scopeExpiringPermits($query, $days = 30)
    {
        return $query->where('status', 'active')
            ->whereNotNull('permit_expiry_date')
            ->whereBetween('permit_expiry_date', [
                now()->startOfDay(),
                now()->addDays($days)->endOfDay()
            ]);
    }

    /**
     * Scope a query to only include businesses with expired permits.
     */
    public function scopeExpiredPermits($query)
    {
        return $query->where('status', 'active')
            ->whereNotNull('permit_expiry_date')
            ->where('permit_expiry_date', '<', now());
    }

    /**
     * Scope a query to filter by business type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('business_type', $type);
    }

    /**
     * Scope a query to filter by purok.
     */
    public function scopeInPurok($query, $purokId)
    {
        return $query->where('purok_id', $purokId);
    }

    /**
     * Scope a query to filter by owner.
     */
    public function scopeOwnedBy($query, $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    /**
     * Scope a query to search businesses.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('business_name', 'like', "%{$search}%")
              ->orWhere('owner_name', 'like', "%{$search}%")
              ->orWhere('dti_sec_number', 'like', "%{$search}%")
              ->orWhere('tin_number', 'like', "%{$search}%")
              ->orWhere('mayors_permit_number', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query to include businesses with recent activity.
     */
    public function scopeWithRecentActivity($query, $days = 7)
    {
        return $query->whereHas('activities', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
        });
    }

    /**
     * Scope a query to order by permit expiry.
     */
    public function scopeOrderByPermitExpiry($query, $direction = 'asc')
    {
        return $query->orderBy('permit_expiry_date', $direction);
    }
}