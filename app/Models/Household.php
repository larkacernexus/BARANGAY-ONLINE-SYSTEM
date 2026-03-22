<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity as ActivityModel;

class Household extends Model
{
    use LogsActivity;

    protected $fillable = [
        'household_number',
        'contact_number',
        'email',
        'address',
        'purok_id',
        'member_count',
        'income_range',
        'housing_type',
        'ownership_status',
        'water_source',
        'electricity',
        'internet',
        'vehicle',
        'remarks',
        'status',
        'google_maps_url',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'electricity' => 'boolean',
        'internet' => 'boolean',
        'vehicle' => 'boolean',
        'member_count' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = [
        'head_of_household',
        'full_address',
        'has_electricity',
        'has_internet',
        'has_vehicle',
        'has_user_account',
        'current_head_name',
    ];

    // ========== BOOT METHOD FOR AUTO COORDINATE EXTRACTION ==========
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($household) {
            if ($household->google_maps_url && $household->isDirty('google_maps_url')) {
                $household->extractCoordinatesFromUrl();
            }
        });
    }

    // ========== GOOGLE MAPS COORDINATE EXTRACTION METHODS ==========

    /**
     * Extract latitude and longitude from Google Maps URL
     * This runs automatically when saving
     */
    public function extractCoordinatesFromUrl()
    {
        if (!$this->google_maps_url) {
            return;
        }

        try {
            $url = $this->google_maps_url;
            
            // Handle Google Maps short URLs (maps.app.goo.gl)
            if (strpos($url, 'maps.app.goo.gl') !== false) {
                $this->extractFromShortUrl($url);
                return;
            }
            
            // Try to parse coordinates from URL with @ symbol
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            // Try to parse from search format
            if (preg_match('/\/search\/(\d+\.\d+),[\+ ]*(\d+\.\d+)/', $url, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            // Try to parse from query parameter
            if (preg_match('/[?&]q=([^&]+)/', $url, $matches)) {
                $query = urldecode($matches[1]);
                if (preg_match('/(-?\d+\.\d+),(-?\d+\.\d+)/', $query, $coordMatches)) {
                    $this->latitude = (float) $coordMatches[1];
                    $this->longitude = (float) $coordMatches[2];
                    return;
                }
            }
            
        } catch (\Exception $e) {
            \Log::warning("Failed to extract coordinates from URL: {$this->google_maps_url}", [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Extract coordinates from Google Maps short URL
     */
    private function extractFromShortUrl($shortUrl)
    {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $shortUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            
            $response = curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);
            
            if (!$finalUrl) {
                return;
            }
            
            // Extract coordinates from the resolved URL
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('%\/search\/(\d+\.\d+),[\+ ]*(\d+\.\d+)%', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
            if (preg_match('/(\d+\.\d+),(\d+\.\d+)/', $finalUrl, $matches)) {
                $this->latitude = (float) $matches[1];
                $this->longitude = (float) $matches[2];
                return;
            }
            
        } catch (\Exception $e) {
            \Log::warning("Failed to resolve short URL: {$shortUrl}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get embed URL for Google Maps
     */
    public function getEmbedUrlAttribute()
    {
        $apiKey = env('VITE_GOOGLE_MAPS_API_KEY');
        
        if (!$apiKey) {
            return null;
        }
        
        if ($this->latitude && $this->longitude) {
            return "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q={$this->latitude},{$this->longitude}&zoom=16";
        }
        
        if ($this->google_maps_url) {
            return "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q=" . urlencode($this->google_maps_url);
        }
        
        return null;
    }

    // ========== ACTIVITY LOG CONFIGURATION ==========

    /**
     * Configure activity logging options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'household_number',
                'contact_number',
                'email',
                'address',
                'purok_id',
                'member_count',
                'income_range',
                'housing_type',
                'ownership_status',
                'water_source',
                'electricity',
                'internet',
                'vehicle',
                'remarks',
                'status',
                'user_id',
                'google_maps_url',
                'latitude',
                'longitude',
            ])
            ->logOnlyDirty() // Only log changed attributes
            ->setDescriptionForEvent(fn(string $eventName) => $this->getDescriptionForEvent($eventName))
            ->dontSubmitEmptyLogs() // Don't log if no attributes changed
            ->logExcept(['updated_at']) // Exclude timestamp columns
            ->useLogName('households'); // Custom log channel name
    }

    /**
     * Generate human-readable description for activity
     */
    private function getDescriptionForEvent(string $eventName): string
    {
        $householdNumber = $this->household_number;
        $headName = $this->current_head_name;
        
        switch ($eventName) {
            case 'created':
                return "Created new household: {$householdNumber} (Head: {$headName})";
            case 'updated':
                return "Updated household: {$householdNumber} (Head: {$headName})";
            case 'deleted':
                return "Deleted household: {$householdNumber} (Head: {$headName})";
            default:
                return "Performed action on household: {$householdNumber}";
        }
    }

    /**
     * Customize log properties
     */
    public function tapActivity(ActivityModel $activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'household_number' => $this->household_number,
            'head_of_household' => $this->current_head_name,
            'member_count' => $this->member_count,
        ]);
        
        // Add changed attributes in a structured way
        if ($eventName === 'updated' && $this->getChanges()) {
            $activity->properties = $activity->properties->merge([
                'changes' => $this->getChanges(),
                'old_values' => array_intersect_key($this->getOriginal(), $this->getChanges()),
            ]);
        }
    }

    // ========== RELATIONSHIPS ==========

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purok(): BelongsTo
    {
        return $this->belongsTo(Purok::class);
    }

    public function residents(): HasMany
    {
        return $this->hasMany(Resident::class);
    }

    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class);
    }

    public function headMember(): HasMany
    {
        return $this->hasMany(HouseholdMember::class)->where('is_head', true);
    }

    public function currentHeadResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'id', 'household_id')
            ->whereHas('householdMember', function ($query) {
                $query->where('is_head', true);
            });
    }

    /**
     * Get the activities relationship
     */
    public function activities()
    {
        return $this->morphMany(ActivityModel::class, 'subject');
    }

    // ========== ACCESSORS ==========

    public function getHeadOfHouseholdAttribute(): ?Resident
    {
        $headMember = $this->householdMembers()->where('is_head', true)->first();
        return $headMember ? $headMember->resident : null;
    }

    public function getCurrentHeadNameAttribute(): ?string
    {
        $head = $this->head_of_household;
        return $head ? $head->full_name : 'No Head Assigned';
    }

    public function getFullAddressAttribute(): string
    {
        $address = $this->address;
        if ($this->purok) {
            $address .= ", {$this->purok->name}";
        }
        return $address;
    }

    public function getHasElectricityAttribute(): bool
    {
        return (bool) $this->electricity;
    }

    public function getHasInternetAttribute(): bool
    {
        return (bool) $this->internet;
    }

    public function getHasVehicleAttribute(): bool
    {
        return (bool) $this->vehicle;
    }

    public function getHasUserAccountAttribute(): bool
    {
        return !is_null($this->user_id);
    }

    public function getUserAccountDetailsAttribute(): ?array
    {
        if (!$this->user_id || !$this->user) {
            return null;
        }

        return [
            'id' => $this->user->id,
            'username' => $this->user->username,
            'email' => $this->user->email,
            'status' => $this->user->status,
            'current_resident_name' => $this->user->currentResident ? 
                $this->user->currentResident->full_name : null,
            'current_resident_id' => $this->user->current_resident_id,
        ];
    }

    // ========== BUSINESS LOGIC METHODS ==========

    public function updateMemberCount(): int
    {
        $oldCount = $this->member_count;
        $newCount = $this->residents()->count();
        
        if ($oldCount !== $newCount) {
            $this->update(['member_count' => $newCount]);
            
            // Log the member count change
            activity()
                ->performedOn($this)
                ->withProperties([
                    'old_member_count' => $oldCount,
                    'new_member_count' => $newCount,
                    'change' => $newCount - $oldCount,
                ])
                ->log('member_count_updated');
        }
        
        return $newCount;
    }

    public function addMember(Resident $resident, string $relationshipToHead = 'Other', bool $isHead = false): HouseholdMember
    {
        // Log the action
        activity()
            ->performedOn($this)
            ->withProperties([
                'resident_id' => $resident->id,
                'resident_name' => $resident->full_name,
                'relationship_to_head' => $relationshipToHead,
                'is_head' => $isHead,
                'action' => 'add_member',
            ])
            ->log('member_added');

        // If setting as head, unset any existing head
        if ($isHead) {
            $oldHead = $this->head_of_household;
            $this->householdMembers()->where('is_head', true)->update(['is_head' => false]);
            
            // Log head change
            if ($oldHead) {
                activity()
                    ->performedOn($this)
                    ->withProperties([
                        'old_head_id' => $oldHead->id,
                        'old_head_name' => $oldHead->full_name,
                        'new_head_id' => $resident->id,
                        'new_head_name' => $resident->full_name,
                    ])
                    ->log('head_of_household_changed');
            }
            
            // Update user account if exists
            $this->updateUserAccountForNewHead($resident);
        }

        // Update resident's household and purok
        $resident->update([
            'household_id' => $this->id,
            'purok_id' => $this->purok_id,
        ]);

        // Create household member record
        $member = $this->householdMembers()->create([
            'resident_id' => $resident->id,
            'relationship_to_head' => $relationshipToHead,
            'is_head' => $isHead,
        ]);

        $this->updateMemberCount();

        return $member;
    }

    public function setHeadOfHousehold(Resident $resident): bool
    {
        $member = $this->householdMembers()->where('resident_id', $resident->id)->first();
        
        if (!$member) {
            return false;
        }

        $oldHead = $this->head_of_household;

        // Log the head change
        activity()
            ->performedOn($this)
            ->withProperties([
                'old_head_id' => $oldHead ? $oldHead->id : null,
                'old_head_name' => $oldHead ? $oldHead->full_name : 'None',
                'new_head_id' => $resident->id,
                'new_head_name' => $resident->full_name,
                'action' => 'set_head',
            ])
            ->log('head_of_household_changed');

        // Unset any existing head
        $this->householdMembers()->where('is_head', true)->update(['is_head' => false]);
        
        // Set new head
        $member->update(['is_head' => true]);
        
        // Update user account
        $this->updateUserAccountForNewHead($resident);

        return true;
    }

    public function updateUserAccountForNewHead(Resident $newHead): void
    {
        if (!$this->user_id) {
            return;
        }

        $user = User::find($this->user_id);
        if ($user) {
            $user->update([
                'current_resident_id' => $newHead->id,
                'first_name' => $newHead->first_name,
                'last_name' => $newHead->last_name,
                'contact_number' => $this->contact_number,
                'email' => $this->email ?? $newHead->email,
            ]);

            // Log user account update
            activity()
                ->performedOn($this)
                ->withProperties([
                    'user_id' => $user->id,
                    'new_head_id' => $newHead->id,
                    'new_head_name' => $newHead->full_name,
                ])
                ->log('user_account_updated_for_new_head');
        }
    }

    public function createUserAccount(Resident $headResident, array $credentials = []): ?User
    {
        if ($this->user_id) {
            return null; // Account already exists
        }

        // Log account creation attempt
        activity()
            ->performedOn($this)
            ->withProperties([
                'head_resident_id' => $headResident->id,
                'head_resident_name' => $headResident->full_name,
                'action' => 'create_user_account',
            ])
            ->log('creating_user_account');

        // Generate username from household number
        $username = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $this->household_number));
        $counter = 1;
        $originalUsername = $username;
        
        while (User::where('username', $username)->exists()) {
            $username = $originalUsername . $counter;
            $counter++;
        }

        // Use provided password or generate from contact number
        $password = $credentials['password'] ?? $this->contact_number;
        if (empty($password)) {
            $password = \Illuminate\Support\Str::password(12);
        }

        // Get or create Household Head role
        $role = Role::where('name', 'Household Head')->first();
        if (!$role) {
            $role = Role::create([
                'name' => 'Household Head',
                'guard_name' => 'web',
                'description' => 'Head of household with limited access'
            ]);
        }

        // Create user account
        $user = User::create([
            'first_name' => $headResident->first_name,
            'last_name' => $headResident->last_name,
            'username' => $username,
            'email' => $this->email ?? ($headResident->first_name . '.' . $headResident->last_name . '@example.com'),
            'password' => \Illuminate\Support\Facades\Hash::make($password),
            'contact_number' => $this->contact_number,
            'position' => 'Household Head',
            'role_id' => $role->id,
            'household_id' => $this->id,
            'current_resident_id' => $headResident->id,
            'status' => 'active',
            'require_password_change' => true,
            'email_verified_at' => now(),
        ]);

        // Update household with user_id
        $this->update(['user_id' => $user->id]);

        // Log successful account creation
        activity()
            ->performedOn($this)
            ->withProperties([
                'user_id' => $user->id,
                'username' => $user->username,
                'head_resident_id' => $headResident->id,
                'head_resident_name' => $headResident->full_name,
            ])
            ->log('user_account_created');

        return $user;
    }

    public function removeMember(Resident $resident): bool
    {
        $member = $this->householdMembers()->where('resident_id', $resident->id)->first();
        
        if (!$member) {
            return false;
        }

        $wasHead = $member->is_head;
        
        // Log member removal
        activity()
            ->performedOn($this)
            ->withProperties([
                'resident_id' => $resident->id,
                'resident_name' => $resident->full_name,
                'was_head' => $wasHead,
                'relationship' => $member->relationship_to_head,
            ])
            ->log('member_removed');

        // Remove member record
        $member->delete();
        
        // Update resident
        $resident->update(['household_id' => null]);
        
        // Update member count
        $this->updateMemberCount();

        // If head was removed, assign new head
        if ($wasHead) {
            $this->assignNewHead();
        }

        return true;
    }

    public function assignNewHead(): bool
    {
        // Log head assignment attempt
        activity()
            ->performedOn($this)
            ->withProperties([
                'action' => 'assign_new_head',
                'reason' => 'previous_head_removed',
            ])
            ->log('assigning_new_head');

        // Try spouse first
        $spouse = $this->householdMembers()
            ->where('relationship_to_head', 'Spouse')
            ->first();

        if ($spouse) {
            activity()
                ->performedOn($this)
                ->withProperties([
                    'new_head_id' => $spouse->resident_id,
                    'new_head_name' => $spouse->resident->full_name,
                    'method' => 'spouse',
                ])
                ->log('new_head_assigned');
            return $this->setHeadOfHousehold($spouse->resident);
        }

        // Try oldest adult member
        $oldestAdult = $this->residents()
            ->where('age', '>=', 18)
            ->orderBy('age', 'desc')
            ->first();

        if ($oldestAdult) {
            activity()
                ->performedOn($this)
                ->withProperties([
                    'new_head_id' => $oldestAdult->id,
                    'new_head_name' => $oldestAdult->full_name,
                    'method' => 'oldest_adult',
                    'age' => $oldestAdult->age,
                ])
                ->log('new_head_assigned');
            return $this->setHeadOfHousehold($oldestAdult);
        }

        // Try any member
        $anyMember = $this->residents()->first();
        if ($anyMember) {
            activity()
                ->performedOn($this)
                ->withProperties([
                    'new_head_id' => $anyMember->id,
                    'new_head_name' => $anyMember->full_name,
                    'method' => 'first_member',
                ])
                ->log('new_head_assigned');
            return $this->setHeadOfHousehold($anyMember);
        }

        // No members left, update user account to show no head
        if ($this->user_id) {
            $user = User::find($this->user_id);
            if ($user) {
                $user->update([
                    'current_resident_id' => null,
                    'first_name' => 'No Head',
                    'last_name' => 'Assigned',
                ]);

                // Log user account update
                activity()
                    ->performedOn($this)
                    ->withProperties([
                        'user_id' => $user->id,
                        'status' => 'no_head_assigned',
                    ])
                    ->log('user_account_updated_no_head');
            }
        }

        activity()
            ->performedOn($this)
            ->withProperties([
                'status' => 'no_members_available',
            ])
            ->log('new_head_assignment_failed');

        return false;
    }

    public function deactivateUserAccount(): bool
    {
        if (!$this->user_id) {
            return false;
        }

        $user = User::find($this->user_id);
        if ($user) {
            // Log account deactivation
            activity()
                ->performedOn($this)
                ->withProperties([
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'current_resident_id' => $user->current_resident_id,
                    'action' => 'deactivate_account',
                ])
                ->log('user_account_deactivated');

            $user->update([
                'status' => 'inactive',
                'household_id' => null,
                'current_resident_id' => null,
            ]);
            
            $this->update(['user_id' => null]);
            return true;
        }

        return false;
    }

    /**
     * Transfer household to another purok
     */
    public function transferToPurok(Purok $purok, string $reason = ''): bool
    {
        $oldPurok = $this->purok;
        
        // Log the transfer
        activity()
            ->performedOn($this)
            ->withProperties([
                'old_purok_id' => $oldPurok ? $oldPurok->id : null,
                'old_purok_name' => $oldPurok ? $oldPurok->name : 'None',
                'new_purok_id' => $purok->id,
                'new_purok_name' => $purok->name,
                'reason' => $reason,
            ])
            ->log('household_transferred_purok');

        // Update household purok
        $this->update(['purok_id' => $purok->id]);

        // Update all residents' purok
        $this->residents()->update(['purok_id' => $purok->id]);

        return true;
    }

    /**
     * Log a custom activity for this household
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
     * Get all activities for this household
     */
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

    public function scopeByPurok($query, $purokId)
    {
        return $query->where('purok_id', $purokId);
    }

    public function scopeWithElectricity($query)
    {
        return $query->where('electricity', true);
    }

    public function scopeWithInternet($query)
    {
        return $query->where('internet', true);
    }

    public function scopeWithUserAccount($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function scopeWithoutUserAccount($query)
    {
        return $query->whereNull('user_id');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('household_number', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%")
              ->orWhere('contact_number', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereHas('residents', function ($q) use ($search) {
                  $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Scope to get households with recent activity
     */
    public function scopeWithRecentActivity($query, $days = 7)
    {
        return $query->whereHas('activities', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
        });
    }

    /**
     * Scope to get households with specific member count range
     */
    public function scopeMemberCountBetween($query, $min = 1, $max = null)
    {
        $query->where('member_count', '>=', $min);
        
        if ($max !== null) {
            $query->where('member_count', '<=', $max);
        }
        
        return $query;
    }
}