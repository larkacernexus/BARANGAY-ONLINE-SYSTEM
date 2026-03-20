<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity as ActivityModel;

class Resident extends Model
{
    use LogsActivity;

    protected $fillable = [
        'resident_id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'birth_date',
        'age',
        'gender',
        'civil_status',
        'contact_number',
        'email',
        'address',
        'purok_id',
        'household_id',
        'occupation',
        'education',
        'religion',
        'is_voter',
        'place_of_birth',
        'remarks',
        'status',
        'photo_path',
    ];

    protected $casts = [
        'is_voter' => 'boolean',
        'birth_date' => 'date',
        'age' => 'integer',
    ];

    protected $appends = [
        'full_name',
        'purok_name',
        'privileges_list',
        'active_privileges_list',
    ];

    // ========== ACTIVITY LOG CONFIGURATION ==========

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'birth_date',
                'age',
                'gender',
                'civil_status',
                'contact_number',
                'email',
                'address',
                'purok_id',
                'household_id',
                'occupation',
                'education',
                'religion',
                'is_voter',
                'place_of_birth',
                'remarks',
                'status',
                'photo_path',
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => $this->getDescriptionForEvent($eventName))
            ->dontSubmitEmptyLogs()
            ->logExcept(['updated_at'])
            ->useLogName('residents');
    }

    private function getDescriptionForEvent(string $eventName): string
    {
        $residentName = $this->full_name;
        
        switch ($eventName) {
            case 'created':
                return "Created new resident: {$residentName} (ID: {$this->resident_id})";
            case 'updated':
                return "Updated resident: {$residentName} (ID: {$this->resident_id})";
            case 'deleted':
                return "Deleted resident: {$residentName} (ID: {$this->resident_id})";
            default:
                return "Performed action on resident: {$residentName}";
        }
    }

    public function tapActivity(ActivityModel $activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'resident_id' => $this->resident_id,
            'full_name' => $this->full_name,
        ]);
        
        if ($eventName === 'updated' && $this->getChanges()) {
            $activity->properties = $activity->properties->merge([
                'changes' => $this->getChanges(),
                'old_values' => array_intersect_key($this->getOriginal(), $this->getChanges()),
            ]);
        }
    }

    // ========== RELATIONSHIPS ==========

    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class, 'purok_id');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }

    public function householdMemberships(): HasMany
    {
        return $this->hasMany(HouseholdMember::class, 'resident_id');
    }

    public function householdMember(): HasMany
    {
        return $this->hasMany(HouseholdMember::class, 'resident_id');
    }

    public function currentUserAccount(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id', 'current_resident_id');
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class);
    }

    public function officials(): HasMany
    {
        return $this->hasMany(Official::class);
    }

    public function clearances(): HasMany
    {
        return $this->hasMany(ClearanceRequest::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function residentDocuments(): HasMany
    {
        return $this->hasMany(ResidentDocument::class, 'resident_id');
    }

    /**
     * Get the resident privileges for this resident
     */
    public function residentPrivileges(): HasMany
    {
        return $this->hasMany(ResidentPrivilege::class);
    }

    /**
     * Get active resident privileges
     */
    public function activeResidentPrivileges(): HasMany
    {
        return $this->hasMany(ResidentPrivilege::class)
                    ->whereNotNull('verified_at')
                    ->where(function($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    });
    }

    // ========== ACCESSORS ==========

    public function getFullNameAttribute(): string
    {
        $parts = [];
        
        if ($this->first_name) {
            $parts[] = $this->first_name;
        }
        
        if ($this->middle_name) {
            $parts[] = $this->middle_name;
        }
        
        if ($this->last_name) {
            $parts[] = $this->last_name;
        }
        
        if ($this->suffix) {
            $parts[] = $this->suffix;
        }
        
        return implode(' ', $parts);
    }

    public function getPurokNameAttribute(): ?string
    {
        return $this->purok ? $this->purok->name : null;
    }

    public function getBirthDateAttribute($value): ?\Carbon\Carbon
    {
        return $value ? \Carbon\Carbon::parse($value) : null;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo_path) {
            return null;
        }
        
        if (str_starts_with($this->photo_path, 'http')) {
            return $this->photo_path;
        }
        
        return \Illuminate\Support\Facades\Storage::url($this->photo_path);
    }

    public function getHasPhotoAttribute(): bool
    {
        return !empty($this->photo_path);
    }

    /**
     * Get formatted list of all privileges with details
     */
    public function getPrivilegesListAttribute(): array
    {
        return $this->residentPrivileges()
            ->with('privilege')
            ->get()
            ->map(function ($residentPrivilege) {
                $privilege = $residentPrivilege->privilege;
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'description' => $privilege->description,
                    'is_active' => $privilege->is_active,
                    'id_number' => $residentPrivilege->id_number,
                    'verified_at' => $residentPrivilege->verified_at,
                    'expires_at' => $residentPrivilege->expires_at,
                    'remarks' => $residentPrivilege->remarks,
                    'status' => $this->getPrivilegeStatus($residentPrivilege),
                ];
            })
            ->toArray();
    }

    /**
     * Get formatted list of active privileges
     */
    public function getActivePrivilegesListAttribute(): array
    {
        return $this->activeResidentPrivileges()
            ->with('privilege')
            ->get()
            ->map(function ($residentPrivilege) {
                $privilege = $residentPrivilege->privilege;
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'discount_percentage' => $privilege->discount_percentage,
                    'id_number' => $residentPrivilege->id_number,
                    'expires_at' => $residentPrivilege->expires_at,
                ];
            })
            ->toArray();
    }

    /**
     * Helper to determine privilege status
     */
    private function getPrivilegeStatus($residentPrivilege): string
    {
        if (!$residentPrivilege->verified_at) {
            return 'pending';
        }
        
        if ($residentPrivilege->expires_at && $residentPrivilege->expires_at->isPast()) {
            return 'expired';
        }
        
        if ($residentPrivilege->expires_at && $residentPrivilege->expires_at->diffInDays(now()) <= 30) {
            return 'expiring_soon';
        }
        
        return 'active';
    }

    /**
     * Check if resident has a specific privilege by code
     */
    public function hasPrivilege(string $code): bool
    {
        return $this->residentPrivileges()
            ->whereHas('privilege', function($q) use ($code) {
                $q->where('code', $code);
            })
            ->exists();
    }

    /**
     * Check if resident has active specific privilege by code
     */
    public function hasActivePrivilege(string $code): bool
    {
        return $this->activeResidentPrivileges()
            ->whereHas('privilege', function($q) use ($code) {
                $q->where('code', $code);
            })
            ->exists();
    }

    /**
     * Get privilege ID number if exists
     */
    public function getPrivilegeIdNumber(string $code): ?string
    {
        $residentPrivilege = $this->residentPrivileges()
            ->whereHas('privilege', function($q) use ($code) {
                $q->where('code', $code);
            })
            ->first();
            
        return $residentPrivilege ? $residentPrivilege->id_number : null;
    }

    /**
     * Get all privileges assigned to this resident (returns collection of Privilege models)
     */
    public function getPrivilegesAttribute()
    {
        return $this->residentPrivileges()
            ->with('privilege')
            ->get()
            ->pluck('privilege');
    }

    /**
     * Get active privileges (returns collection of Privilege models)
     */
    public function getActivePrivilegesAttribute()
    {
        return $this->activeResidentPrivileges()
            ->with('privilege')
            ->get()
            ->pluck('privilege');
    }

    // Legacy methods for backward compatibility
    public function isSenior(): bool
    {
        return $this->hasActivePrivilege('SC') || $this->hasActivePrivilege('OSP') || $this->age >= 60;
    }

    public function isPwd(): bool
    {
        return $this->hasActivePrivilege('PWD');
    }

    public function isSoloParent(): bool
    {
        return $this->hasActivePrivilege('SP');
    }

    public function isIndigent(): bool
    {
        return $this->hasActivePrivilege('IND');
    }

    public function is4PsBeneficiary(): bool
    {
        return $this->hasActivePrivilege('4PS');
    }

    public function isIndigenousPeople(): bool
    {
        return $this->hasActivePrivilege('IP');
    }

    // ========== BUSINESS LOGIC METHODS ==========

    public function isHeadOfHousehold(): bool
    {
        return $this->householdMemberships()
            ->where('is_head', true)
            ->exists();
    }

    public function isMemberOfHousehold(): bool
    {
        return !is_null($this->household_id);
    }

    public function currentRelationshipToHead(): ?string
    {
        $membership = $this->householdMemberships()->first();
        return $membership ? $membership->relationship_to_head : null;
    }

    public function hasUserAccount(): bool
    {
        if (!$this->household) {
            return false;
        }
        
        return $this->household->user_id && 
               $this->household->user->current_resident_id === $this->id;
    }

    public function getUserAccountAttribute(): ?User
    {
        if (!$this->household || !$this->household->user_id) {
            return null;
        }
        
        $user = User::find($this->household->user_id);
        return $user && $user->current_resident_id === $this->id ? $user : null;
    }

    public function canBecomeHouseholdHead(): bool
    {
        return $this->isMemberOfHousehold() && 
               $this->age >= 18 &&
               $this->status === 'active';
    }

    public function transferToHousehold(Household $household, string $relationship = 'Other Relative', bool $isHead = false): bool
    {
        activity()
            ->performedOn($this)
            ->withProperties([
                'old_household_id' => $this->household_id,
                'new_household_id' => $household->id,
                'relationship' => $relationship,
                'is_head' => $isHead,
            ])
            ->log('transferred_to_household');

        if ($this->household_id) {
            $this->householdMemberships()->delete();
        }

        $this->update([
            'household_id' => $household->id,
            'purok_id' => $household->purok_id,
        ]);

        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $this->id,
            'relationship_to_head' => $relationship,
            'is_head' => $isHead,
        ]);

        $household->updateMemberCount();

        return true;
    }

    public function removeFromHousehold(): bool
    {
        if (!$this->isMemberOfHousehold()) {
            return false;
        }

        $household = $this->household;
        
        activity()
            ->performedOn($this)
            ->withProperties([
                'household_id' => $household->id,
                'household_name' => $household->name ?? 'N/A',
            ])
            ->log('removed_from_household');

        $this->householdMemberships()->delete();

        $this->update([
            'household_id' => null,
        ]);

        if ($household) {
            $household->updateMemberCount();
        }

        return true;
    }

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

    public function getActivityLogs()
    {
        return ActivityModel::where('subject_type', self::class)
            ->where('subject_id', $this->id)
            ->orWhere(function ($query) {
                $query->where('causer_type', self::class)
                      ->where('causer_id', $this->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // ========== SCOPES ==========

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeByPurok($query, $purokId)
    {
        return $query->where('purok_id', $purokId);
    }

    public function scopeWithoutHousehold($query)
    {
        return $query->whereNull('household_id');
    }

    public function scopeWithHousehold($query)
    {
        return $query->whereNotNull('household_id');
    }

    public function scopeIsHead($query)
    {
        return $query->whereHas('householdMemberships', function ($q) {
            $q->where('is_head', true);
        });
    }

    /**
     * Scope residents with a specific privilege
     */
    public function scopeWithPrivilege($query, string $code)
    {
        return $query->whereHas('residentPrivileges.privilege', function ($q) use ($code) {
            $q->where('code', $code);
        });
    }

    /**
     * Scope residents with active specific privilege
     */
    public function scopeWithActivePrivilege($query, string $code)
    {
        return $query->whereHas('residentPrivileges', function ($q) use ($code) {
            $q->whereNotNull('verified_at')
              ->where(function($q2) {
                  $q2->whereNull('expires_at')
                     ->orWhere('expires_at', '>', now());
              })
              ->whereHas('privilege', function($q3) use ($code) {
                  $q3->where('code', $code);
              });
        });
    }

    /**
     * Scope seniors (for backward compatibility)
     */
    public function scopeIsSenior($query)
    {
        return $query->where(function($q) {
            $q->whereHas('residentPrivileges.privilege', function ($q2) {
                $q2->whereIn('code', ['SC', 'OSP']);
            })->orWhere(function ($q3) {
                $q3->whereNotNull('birth_date')
                  ->whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) >= 60');
            });
        });
    }

    /**
     * Scope PWDs
     */
    public function scopeIsPwd($query)
    {
        return $query->whereHas('residentPrivileges.privilege', function ($q) {
            $q->where('code', 'PWD');
        });
    }

    /**
     * Scope solo parents
     */
    public function scopeIsSoloParent($query)
    {
        return $query->whereHas('residentPrivileges.privilege', function ($q) {
            $q->where('code', 'SP');
        });
    }

    /**
     * Scope indigent residents
     */
    public function scopeIsIndigent($query)
    {
        return $query->whereHas('residentPrivileges.privilege', function ($q) {
            $q->where('code', 'IND');
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('resident_id', 'like', "%{$search}%")
              ->orWhere('contact_number', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        });
    }

    public function scopeWithRecentActivity($query, $days = 7)
    {
        return $query->whereHas('activities', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
        });
    }

    public function activities()
    {
        return $this->morphMany(ActivityModel::class, 'subject');
    }
}