<?php
// app/Models/Announcement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'type',
        'priority',
        'is_active',
        'start_date',
        'start_time',
        'end_date',
        'end_time',
        'audience_type',
        'target_roles',
        'target_puroks',
        'target_households',
        'target_users',
        'target_businesses',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'priority' => 'integer',
    ];

    protected $appends = [
        'audience_summary',
        'estimated_reach',
        'status',
        'status_color',
        'status_label',
        'formatted_date_range',
        'priority_label',
        'type_label',
        'has_attachments',
        'attachments_count',
    ];

    // ========== CONSTANTS ==========
    
    const AUDIENCE_ALL = 'all';
    const AUDIENCE_ROLES = 'roles';
    const AUDIENCE_PUROKS = 'puroks';
    const AUDIENCE_HOUSEHOLDS = 'households';
    const AUDIENCE_HOUSEHOLD_MEMBERS = 'household_members';
    const AUDIENCE_BUSINESSES = 'businesses';
    const AUDIENCE_SPECIFIC_USERS = 'specific_users';

    const TYPE_GENERAL = 'general';
    const TYPE_IMPORTANT = 'important';
    const TYPE_EVENT = 'event';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_OTHER = 'other';

    const PRIORITY_NORMAL = 0;
    const PRIORITY_LOW = 1;
    const PRIORITY_MEDIUM = 2;
    const PRIORITY_HIGH = 3;
    const PRIORITY_URGENT = 4;

    // ========== RELATIONSHIPS ==========

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the attachments for this announcement.
     */
    public function attachments()
    {
        return $this->hasMany(AnnouncementAttachment::class);
    }

    // ========== ACCESSORS & MUTATORS FOR JSON FIELDS ==========

    /**
     * Get target roles as array
     */
    public function getTargetRolesAttribute($value)
    {
        if (is_null($value)) return [];
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? array_map('intval', $decoded) : [];
    }

    /**
     * Set target roles as JSON
     */
    public function setTargetRolesAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['target_roles'] = json_encode(array_map('intval', $value));
        } else {
            $this->attributes['target_roles'] = null;
        }
    }

    /**
     * Get target puroks as array
     */
    public function getTargetPuroksAttribute($value)
    {
        if (is_null($value)) return [];
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? array_map('intval', $decoded) : [];
    }

    /**
     * Set target puroks as JSON
     */
    public function setTargetPuroksAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['target_puroks'] = json_encode(array_map('intval', $value));
        } else {
            $this->attributes['target_puroks'] = null;
        }
    }

    /**
     * Get target households as array - FIXED: handles string IDs in JSON
     */
    public function getTargetHouseholdsAttribute($value)
    {
        if (is_null($value)) return [];
        
        // Decode JSON
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        
        if (!is_array($decoded)) return [];
        
        // Convert each value to integer, handling string numbers
        return array_map(function($item) {
            return is_numeric($item) ? (int) $item : $item;
        }, $decoded);
    }

    /**
     * Set target households as JSON - FIXED: stores as strings for JSON compatibility
     */
    public function setTargetHouseholdsAttribute($value)
    {
        if (is_array($value)) {
            // Convert all values to strings for consistent JSON storage
            $this->attributes['target_households'] = json_encode(array_map('strval', $value));
        } else {
            $this->attributes['target_households'] = null;
        }
    }

    /**
     * Get target users as array
     */
    public function getTargetUsersAttribute($value)
    {
        if (is_null($value)) return [];
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? array_map('intval', $decoded) : [];
    }

    /**
     * Set target users as JSON
     */
    public function setTargetUsersAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['target_users'] = json_encode(array_map('intval', $value));
        } else {
            $this->attributes['target_users'] = null;
        }
    }

    /**
     * Get target businesses as array
     */
    public function getTargetBusinessesAttribute($value)
    {
        if (is_null($value)) return [];
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? array_map('intval', $decoded) : [];
    }

    /**
     * Set target businesses as JSON
     */
    public function setTargetBusinessesAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['target_businesses'] = json_encode(array_map('intval', $value));
        } else {
            $this->attributes['target_businesses'] = null;
        }
    }

    // ========== SCOPES ==========

    /**
     * Scope for active announcements (no date restrictions)
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for published announcements (active, with date restrictions)
     */
    public function scopePublished($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Scope for current announcements (published and ordered)
     */
    public function scopeCurrent($query)
    {
        return $query->published()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Scope to filter announcements visible to a specific user - FIXED for household JSON
     */
    public function scopeVisibleToUser($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            // Announcements for all users
            $q->where('audience_type', self::AUDIENCE_ALL);
            
            // Announcements for specific roles
            if ($user->role_id) {
                $q->orWhere(function ($subq) use ($user) {
                    $subq->where('audience_type', self::AUDIENCE_ROLES)
                          ->whereJsonContains('target_roles', $user->role_id);
                });
            }
            
            // Announcements for specific puroks (based on user's household's purok)
            if ($user->household && $user->household->purok_id) {
                $q->orWhere(function ($subq) use ($user) {
                    $subq->where('audience_type', self::AUDIENCE_PUROKS)
                          ->whereJsonContains('target_puroks', $user->household->purok_id);
                });
            }
            
            // Announcements for specific households - FIXED: uses string casting for JSON comparison
            if ($user->household_id) {
                $q->orWhere(function ($subq) use ($user) {
                    $subq->where('audience_type', self::AUDIENCE_HOUSEHOLDS)
                          ->whereRaw('JSON_CONTAINS(target_households, ?)', ['"' . $user->household_id . '"']);
                });
                
                // Announcements for all household members
                $q->orWhere(function ($subq) use ($user) {
                    $subq->where('audience_type', self::AUDIENCE_HOUSEHOLD_MEMBERS)
                          ->whereRaw('JSON_CONTAINS(target_households, ?)', ['"' . $user->household_id . '"']);
                });
            }
            
            // Announcements for businesses (if user is a business owner)
            if ($user->current_resident_id) {
                $businessIds = Business::where('owner_id', $user->current_resident_id)
                    ->orWhereJsonContains('owner_id', $user->current_resident_id)
                    ->pluck('id')
                    ->toArray();
                    
                if (!empty($businessIds)) {
                    $q->orWhere(function ($subq) use ($businessIds) {
                        $subq->where('audience_type', self::AUDIENCE_BUSINESSES)
                              ->where(function ($businessQ) use ($businessIds) {
                                  foreach ($businessIds as $id) {
                                      $businessQ->orWhereRaw('JSON_CONTAINS(target_businesses, ?)', ['"' . $id . '"']);
                                  }
                              });
                    });
                }
            }
            
            // Announcements for specific users
            $q->orWhere(function ($subq) use ($user) {
                $subq->where('audience_type', self::AUDIENCE_SPECIFIC_USERS)
                      ->whereJsonContains('target_users', $user->id);
            });
        });
    }

    /**
     * Scope for upcoming announcements
     */
    public function scopeUpcoming($query)
    {
        return $query->where('is_active', true)
            ->whereNotNull('start_date')
            ->where('start_date', '>', now());
    }

    /**
     * Scope for expired announcements
     */
    public function scopeExpired($query)
    {
        return $query->where('is_active', true)
            ->whereNotNull('end_date')
            ->where('end_date', '<', now());
    }

    /**
     * Scope by audience type
     */
    public function scopeOfAudienceType($query, $type)
    {
        return $query->where('audience_type', $type);
    }

    /**
     * Scope by purok
     */
    public function scopeForPurok($query, $purokId)
    {
        return $query->where('audience_type', self::AUDIENCE_PUROKS)
            ->whereRaw('JSON_CONTAINS(target_puroks, ?)', ['"' . $purokId . '"']);
    }

    /**
     * Scope by household - FIXED
     */
    public function scopeForHousehold($query, $householdId)
    {
        return $query->whereIn('audience_type', [self::AUDIENCE_HOUSEHOLDS, self::AUDIENCE_HOUSEHOLD_MEMBERS])
            ->whereRaw('JSON_CONTAINS(target_households, ?)', ['"' . $householdId . '"']);
    }

    /**
     * Scope by role
     */
    public function scopeForRole($query, $roleId)
    {
        return $query->where('audience_type', self::AUDIENCE_ROLES)
            ->whereRaw('JSON_CONTAINS(target_roles, ?)', ['"' . $roleId . '"']);
    }

    /**
     * Scope for announcements with attachments
     */
    public function scopeHasAttachments($query)
    {
        return $query->has('attachments');
    }

    /**
     * Scope for announcements without attachments
     */
    public function scopeWithoutAttachments($query)
    {
        return $query->doesntHave('attachments');
    }

    // ========== ACCESSORS ==========

    /**
     * Check if announcement has attachments
     */
    public function getHasAttachmentsAttribute(): bool
    {
        return $this->attachments()->exists();
    }

    /**
     * Get attachments count
     */
    public function getAttachmentsCountAttribute(): int
    {
        return $this->attachments()->count();
    }

    /**
     * Get audience summary - FIXED for households
     */
    public function getAudienceSummaryAttribute(): string
    {
        $audienceTypes = self::getAudienceTypes();
        $type = $audienceTypes[$this->audience_type] ?? $this->audience_type;
        
        switch ($this->audience_type) {
            case self::AUDIENCE_ROLES:
                $roles = Role::whereIn('id', $this->target_roles ?? [])->pluck('name')->implode(', ');
                return "{$type}: {$roles}";
                
            case self::AUDIENCE_PUROKS:
                $puroks = Purok::whereIn('id', $this->target_puroks ?? [])->pluck('name')->implode(', ');
                return "{$type}: {$puroks}";
                
            case self::AUDIENCE_HOUSEHOLDS:
            case self::AUDIENCE_HOUSEHOLD_MEMBERS:
                $households = Household::whereIn('id', $this->target_households ?? [])
                    ->get()
                    ->map(fn($h) => $h->household_number . ($h->purok ? ' (Purok ' . $h->purok->name . ')' : ''))
                    ->implode(', ');
                return "{$type}: {$households}";
                
            case self::AUDIENCE_BUSINESSES:
                $businesses = Business::whereIn('id', $this->target_businesses ?? [])
                    ->pluck('business_name')
                    ->implode(', ');
                return "{$type}: {$businesses}";
                
            case self::AUDIENCE_SPECIFIC_USERS:
                $users = User::whereIn('id', $this->target_users ?? [])
                    ->get()
                    ->map(fn($u) => $u->full_name)
                    ->implode(', ');
                return "{$type}: {$users}";
                
            default:
                return $type;
        }
    }

    /**
     * Get estimated reach count - FIXED for households
     */
    public function getEstimatedReachAttribute(): int
    {
        switch ($this->audience_type) {
            case self::AUDIENCE_ALL:
                return User::active()->count();
                
            case self::AUDIENCE_ROLES:
                return User::active()
                    ->whereIn('role_id', $this->target_roles ?? [])
                    ->count();
                    
            case self::AUDIENCE_PUROKS:
                return User::active()
                    ->whereHas('household', fn($q) => 
                        $q->whereIn('purok_id', $this->target_puroks ?? [])
                    )
                    ->count();
                    
            case self::AUDIENCE_HOUSEHOLDS:
                return User::active()
                    ->whereIn('household_id', $this->target_households ?? [])
                    ->count();
                    
            case self::AUDIENCE_HOUSEHOLD_MEMBERS:
                return Resident::whereIn('household_id', $this->target_households ?? [])
                    ->count();
                    
            case self::AUDIENCE_BUSINESSES:
                return Business::whereIn('id', $this->target_businesses ?? [])
                    ->count();
                    
            case self::AUDIENCE_SPECIFIC_USERS:
                return count($this->target_users ?? []);
                
            default:
                return 0;
        }
    }

    /**
     * Get combined start datetime
     */
    public function getStartDateTimeAttribute()
    {
        if (!$this->start_date) {
            return null;
        }
        
        return $this->start_time 
            ? $this->start_date->setTimeFrom($this->start_time)
            : $this->start_date->startOfDay();
    }

    /**
     * Get combined end datetime
     */
    public function getEndDateTimeAttribute()
    {
        if (!$this->end_date) {
            return null;
        }
        
        return $this->end_time 
            ? $this->end_date->setTimeFrom($this->end_time)
            : $this->end_date->endOfDay();
    }

    /**
     * Check if announcement is currently active with time consideration
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        // Check start date/time
        if ($this->start_date) {
            $startDateTime = $this->startDateTime;
            if ($startDateTime && $startDateTime->gt($now)) {
                return false;
            }
        }

        // Check end date/time
        if ($this->end_date) {
            $endDateTime = $this->endDateTime;
            if ($endDateTime && $endDateTime->lt($now)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get announcement status
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }
        
        if ($this->isExpired()) {
            return 'expired';
        }
        
        if ($this->isUpcoming()) {
            return 'upcoming';
        }
        
        return 'active';
    }

    /**
     * Get status color for badges
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => 'green',
            'upcoming' => 'blue',
            'expired' => 'red',
            'inactive' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'active' => 'Active',
            'upcoming' => 'Upcoming',
            'expired' => 'Expired',
            'inactive' => 'Inactive',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute(): string
    {
        return self::getPriorityOptions()[$this->priority] ?? 'Normal';
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute(): string
    {
        return self::getTypes()[$this->type] ?? ucfirst($this->type);
    }

    /**
     * Get formatted date range
     */
    public function getFormattedDateRangeAttribute(): string
    {
        if (!$this->start_date && !$this->end_date) {
            return 'No schedule';
        }

        $format = 'M j, Y';
        $timeFormat = 'g:i A';

        $start = $this->start_date ? $this->start_date->format($format) : 'No start';
        $end = $this->end_date ? $this->end_date->format($format) : 'No end';

        if ($this->start_date && $this->end_date && $this->start_date->isSameDay($this->end_date)) {
            // Same day
            $startTime = $this->start_time ? $this->start_time->format($timeFormat) : '';
            $endTime = $this->end_time ? $this->end_time->format($timeFormat) : '';
            
            if ($startTime && $endTime) {
                return "{$start} ({$startTime} - {$endTime})";
            } elseif ($startTime) {
                return "{$start} starting at {$startTime}";
            } elseif ($endTime) {
                return "{$start} ending at {$endTime}";
            }
            return $start;
        }

        // Different days
        $result = "{$start}";
        if ($this->start_time) {
            $result .= " " . $this->start_time->format($timeFormat);
        }
        
        $result .= " → {$end}";
        if ($this->end_time) {
            $result .= " " . $this->end_time->format($timeFormat);
        }
        
        return $result;
    }

    // ========== BUSINESS LOGIC METHODS ==========

    /**
     * Get all users who should see this announcement
     */
    public function getTargetUsers()
    {
        switch ($this->audience_type) {
            case self::AUDIENCE_ALL:
                return User::active()->get();
                
            case self::AUDIENCE_ROLES:
                return User::active()
                    ->whereIn('role_id', $this->target_roles ?? [])
                    ->get();
                    
            case self::AUDIENCE_PUROKS:
                return User::active()
                    ->whereHas('household', fn($q) => 
                        $q->whereIn('purok_id', $this->target_puroks ?? [])
                    )
                    ->get();
                    
            case self::AUDIENCE_HOUSEHOLDS:
                return User::active()
                    ->whereIn('household_id', $this->target_households ?? [])
                    ->get();
                    
            case self::AUDIENCE_HOUSEHOLD_MEMBERS:
                $residentIds = Resident::whereIn('household_id', $this->target_households ?? [])
                    ->pluck('id');
                return User::active()
                    ->whereIn('current_resident_id', $residentIds)
                    ->get();
                    
            case self::AUDIENCE_BUSINESSES:
                $businesses = Business::whereIn('id', $this->target_businesses ?? [])
                    ->get();
                $residentIds = $businesses->pluck('owner_id')->filter();
                return User::active()
                    ->whereIn('current_resident_id', $residentIds)
                    ->get();
                    
            case self::AUDIENCE_SPECIFIC_USERS:
                return User::whereIn('id', $this->target_users ?? [])->get();
                
            default:
                return collect();
        }
    }

    /**
     * Check if announcement is expired
     */
    public function isExpired(): bool
    {
        if ($this->end_date) {
            $endDateTime = $this->endDateTime;
            return $endDateTime ? $endDateTime->lt(now()) : false;
        }
        return false;
    }

    /**
     * Check if announcement is upcoming
     */
    public function isUpcoming(): bool
    {
        if ($this->start_date) {
            $startDateTime = $this->startDateTime;
            return $startDateTime ? $startDateTime->gt(now()) : false;
        }
        return false;
    }

    /**
     * Check if announcement is visible to a specific user - FIXED
     */
    public function isVisibleToUser(User $user): bool
    {
        switch ($this->audience_type) {
            case self::AUDIENCE_ALL:
                return true;
                
            case self::AUDIENCE_ROLES:
                return in_array($user->role_id, $this->target_roles ?? []);
                
            case self::AUDIENCE_PUROKS:
                return $user->household && 
                       in_array($user->household->purok_id, $this->target_puroks ?? []);
                
            case self::AUDIENCE_HOUSEHOLDS:
                return $user->household_id && 
                       in_array($user->household_id, $this->target_households ?? []);
                
            case self::AUDIENCE_HOUSEHOLD_MEMBERS:
                return $user->household_id && 
                       in_array($user->household_id, $this->target_households ?? []);
                
            case self::AUDIENCE_BUSINESSES:
                if (!$user->current_resident_id) return false;
                return Business::where('owner_id', $user->current_resident_id)
                    ->whereIn('id', $this->target_businesses ?? [])
                    ->exists();
                
            case self::AUDIENCE_SPECIFIC_USERS:
                return in_array($user->id, $this->target_users ?? []);
                
            default:
                return false;
        }
    }

    /**
     * Format the time range for display
     */
    public function getTimeRangeAttribute(): ?string
    {
        if (!$this->start_time && !$this->end_time) {
            return null;
        }

        $start = $this->start_time ? $this->start_time->format('g:i A') : 'TBA';
        $end = $this->end_time ? $this->end_time->format('g:i A') : 'TBA';

        return "{$start} - {$end}";
    }

    // ========== DEBUG METHOD ==========

    /**
     * Debug method to check visibility
     */
    public function isVisibleToUserDebug(User $user): array
    {
        $result = [
            'is_visible' => false,
            'reason' => '',
            'checks' => []
        ];
        
        $result['checks']['audience_type'] = $this->audience_type;
        $result['checks']['target_households_raw'] = $this->getRawOriginal('target_households');
        $result['checks']['target_households_parsed'] = $this->target_households;
        
        switch ($this->audience_type) {
            case self::AUDIENCE_ALL:
                $result['is_visible'] = true;
                $result['reason'] = 'Visible to all users';
                return $result;
                
            case self::AUDIENCE_ROLES:
                $check = in_array($user->role_id, $this->target_roles ?? []);
                $result['checks']['role_check'] = [
                    'user_role' => $user->role_id,
                    'target_roles' => $this->target_roles,
                    'matches' => $check
                ];
                if ($check) {
                    $result['is_visible'] = true;
                    $result['reason'] = 'User role matches target roles';
                }
                break;
                
            case self::AUDIENCE_PUROKS:
                $userPurokId = $user->household?->purok_id;
                $check = $userPurokId && in_array($userPurokId, $this->target_puroks ?? []);
                $result['checks']['purok_check'] = [
                    'user_purok' => $userPurokId,
                    'target_puroks' => $this->target_puroks,
                    'matches' => $check
                ];
                if ($check) {
                    $result['is_visible'] = true;
                    $result['reason'] = 'User purok matches target puroks';
                }
                break;
                
            case self::AUDIENCE_HOUSEHOLDS:
            case self::AUDIENCE_HOUSEHOLD_MEMBERS:
                $check = $user->household_id && in_array($user->household_id, $this->target_households ?? []);
                $result['checks']['household_check'] = [
                    'user_household' => $user->household_id,
                    'target_households' => $this->target_households,
                    'matches' => $check
                ];
                if ($check) {
                    $result['is_visible'] = true;
                    $result['reason'] = 'User household matches target households';
                }
                break;
                
            case self::AUDIENCE_BUSINESSES:
                if ($user->current_resident_id) {
                    $businessIds = Business::where('owner_id', $user->current_resident_id)
                        ->orWhereJsonContains('owner_id', $user->current_resident_id)
                        ->pluck('id')
                        ->toArray();
                    $check = !empty(array_intersect($businessIds, $this->target_businesses ?? []));
                    $result['checks']['business_check'] = [
                        'user_businesses' => $businessIds,
                        'target_businesses' => $this->target_businesses,
                        'matches' => $check
                    ];
                    if ($check) {
                        $result['is_visible'] = true;
                        $result['reason'] = 'User owns a target business';
                    }
                }
                break;
                
            case self::AUDIENCE_SPECIFIC_USERS:
                $check = in_array($user->id, $this->target_users ?? []);
                $result['checks']['user_check'] = [
                    'user_id' => $user->id,
                    'target_users' => $this->target_users,
                    'matches' => $check
                ];
                if ($check) {
                    $result['is_visible'] = true;
                    $result['reason'] = 'User is specifically targeted';
                }
                break;
        }
        
        if (!$result['is_visible']) {
            $result['reason'] = 'No matching audience criteria';
        }
        
        return $result;
    }

    // ========== NOTIFICATION METHODS ==========

    /**
     * Send notifications to target audience.
     */
    public function notifyTargetAudience(string $action = 'created')
    {
        $users = $this->getTargetUsers(); // Using the method, not attribute
        $count = 0;
        
        foreach ($users as $user) {
            $user->notify(new \App\Notifications\NewAnnouncementNotification($this, $action));
            $count++;
        }
        
        // Log notification sending
        if (function_exists('activity')) {
            activity()
                ->performedOn($this)
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => $action,
                    'recipient_count' => $count,
                    'audience_type' => $this->audience_type,
                    'has_attachments' => $this->has_attachments,
                    'attachments_count' => $this->attachments_count,
                ])
                ->log('announcement_notifications_sent');
        }
        
        return $count;
    }

    /**
     * Send notifications to admins about this announcement.
     */
    public function notifyAdmins(string $action = 'created')
    {
        $admins = User::whereHas('role', function ($query) {
            $query->whereIn('name', ['admin', 'super_admin']);
        })->get();
        
        $count = 0;
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\NewAnnouncementNotification($this, $action));
            $count++;
        }
        
        return $count;
    }

    /**
     * Get notification statistics.
     */
    public function getNotificationStats()
    {
        $notifications = DB::table('notifications')
            ->where('type', 'App\Notifications\NewAnnouncementNotification')
            ->where('data->announcement_id', $this->id)
            ->get();
        
        $totalTargetUsers = $this->getTargetUsers()->count();
        $notificationsSent = $notifications->count();
        $readCount = $notifications->whereNotNull('read_at')->count();
        
        return [
            'total_target_users' => $totalTargetUsers,
            'notifications_sent' => $notificationsSent,
            'read_count' => $readCount,
            'unread_count' => $notificationsSent - $readCount,
            'delivery_rate' => $totalTargetUsers > 0 
                ? round(($notificationsSent / $totalTargetUsers) * 100, 2) 
                : 0,
            'read_rate' => $notificationsSent > 0 
                ? round(($readCount / $notificationsSent) * 100, 2) 
                : 0,
        ];
    }

    // ========== STATIC METHODS ==========

    /**
     * Get audience types
     */
    public static function getAudienceTypes(): array
    {
        return [
            self::AUDIENCE_ALL => 'All Users',
            self::AUDIENCE_ROLES => 'Specific Roles',
            self::AUDIENCE_PUROKS => 'Specific Puroks',
            self::AUDIENCE_HOUSEHOLDS => 'Specific Households (User Accounts)',
            self::AUDIENCE_HOUSEHOLD_MEMBERS => 'All Household Members (Residents)',
            self::AUDIENCE_BUSINESSES => 'Business Owners',
            self::AUDIENCE_SPECIFIC_USERS => 'Specific Users',
        ];
    }

    /**
     * Get announcement types
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_GENERAL => 'General',
            self::TYPE_IMPORTANT => 'Important',
            self::TYPE_EVENT => 'Event',
            self::TYPE_MAINTENANCE => 'Maintenance',
            self::TYPE_OTHER => 'Other',
        ];
    }

    /**
     * Get priority options
     */
    public static function getPriorityOptions(): array
    {
        return [
            self::PRIORITY_NORMAL => 'Normal',
            self::PRIORITY_LOW => 'Low',
            self::PRIORITY_MEDIUM => 'Medium',
            self::PRIORITY_HIGH => 'High',
            self::PRIORITY_URGENT => 'Urgent',
        ];
    }

    /**
     * Get status options
     */
    public static function getStatusOptions(): array
    {
        return [
            'active' => 'Active',
            'upcoming' => 'Upcoming',
            'expired' => 'Expired',
            'inactive' => 'Inactive',
        ];
    }

    /**
     * Get priority color
     */
    public static function getPriorityColor(int $priority): string
    {
        return match($priority) {
            self::PRIORITY_URGENT => 'red',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_MEDIUM => 'yellow',
            self::PRIORITY_LOW => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get type color
     */
    public static function getTypeColor(string $type): string
    {
        return match($type) {
            self::TYPE_IMPORTANT => 'red',
            self::TYPE_EVENT => 'blue',
            self::TYPE_MAINTENANCE => 'amber',
            self::TYPE_OTHER => 'gray',
            default => 'green',
        };
    }

    /**
     * Get type icon
     */
    public static function getTypeIcon(string $type): string
    {
        return match($type) {
            self::TYPE_IMPORTANT => 'AlertCircle',
            self::TYPE_EVENT => 'Calendar',
            self::TYPE_MAINTENANCE => 'Wrench',
            self::TYPE_OTHER => 'Tag',
            default => 'Bell',
        };
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // When deleting an announcement, also delete its attachments
        static::deleting(function ($announcement) {
            if ($announcement->isForceDeleting()) {
                // Force delete - permanently delete files
                foreach ($announcement->attachments as $attachment) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
                    $attachment->forceDelete();
                }
            }
        });
    }
}