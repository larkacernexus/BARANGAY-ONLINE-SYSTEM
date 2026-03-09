<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\CausesActivity;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\HasNotificationPreferences;
use App\Models\Session;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable, CausesActivity, LogsActivity, HasNotificationPreferences;

    protected $fillable = [
        'username',
        'email',
        'contact_number',
        'position',
        'role_id',
        'status',
        'password',
        'email_verified_at',
        'require_password_change',
        'password_changed_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'two_factor_enabled_at',
        'two_factor_last_used_at',
        'two_factor_used_recovery_codes',
        'remember_token',
        'last_login_at',
        'last_login_ip',
        'login_count',
        'current_login_ip',
        'last_logout_at',
        'last_login_device',
        'last_login_browser',
        'failed_login_attempts',
        'last_failed_login_at',
        'account_locked_until',
        'resident_id',
        'household_id',
        'current_resident_id',
        // ADD THESE QR CODE FIELDS
        'login_qr_code',
        'login_qr_code_generated_at',
        'login_qr_code_expires_at',
        'login_qr_code_used_count',
        'qr_code_url',
        'qr_code_generated_at',
        'qr_code_download_count',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'login_qr_code', // Hide QR token for security
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'require_password_change' => 'boolean',
            'two_factor_enabled_at' => 'datetime',
            'two_factor_last_used_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'last_failed_login_at' => 'datetime',
            'account_locked_until' => 'datetime',
            'failed_login_attempts' => 'integer',
            'two_factor_used_recovery_codes' => 'array',
            'login_count' => 'integer',
            'notification_preferences' => 'array',
            // ADD THESE QR CODE CASTS
            'login_qr_code_generated_at' => 'datetime',
            'login_qr_code_expires_at' => 'datetime',
            'qr_code_generated_at' => 'datetime',
            'login_qr_code_used_count' => 'integer',
            'qr_code_download_count' => 'integer',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email', 'username', 'contact_number', 
                      'position', 'role_id', 'status', 'household_id', 'current_resident_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "User {$eventName}")
            ->dontSubmitEmptyLogs()
            ->useLogName('user');
    }

    // ADD HELPER METHODS FOR QR CODE

    /**
     * Check if user has a QR code
     */
    public function hasQrCode(): bool
    {
        return !is_null($this->login_qr_code) && !is_null($this->qr_code_url);
    }

    /**
     * Check if QR code is expired
     */
    public function isQrCodeExpired(): bool
    {
        if (!$this->login_qr_code_expires_at) {
            return false;
        }
        return now()->gt($this->login_qr_code_expires_at);
    }

    /**
     * Get QR code image URL
     */
    public function getQrCodeUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }
        return asset('storage/' . $value);
    }

    /**
     * Increment QR code download count
     */
    public function incrementQrCodeDownloadCount(): void
    {
        $this->increment('qr_code_download_count');
    }

    /**
     * Clear QR code data (when regenerating)
     */
    public function clearQrCode(): void
    {
        $this->update([
            'login_qr_code' => null,
            'login_qr_code_generated_at' => null,
            'login_qr_code_expires_at' => null,
            'login_qr_code_used_count' => 0,
            'qr_code_url' => null,
        ]);
    }

    /**
     * Get QR code status
     */
    public function getQrCodeStatusAttribute(): array
    {
        return [
            'has_code' => $this->hasQrCode(),
            'url' => $this->qr_code_url,
            'generated_at' => $this->login_qr_code_generated_at,
            'expires_at' => $this->login_qr_code_expires_at,
            'is_expired' => $this->isQrCodeExpired(),
            'used_count' => $this->login_qr_code_used_count,
            'download_count' => $this->qr_code_download_count,
        ];
    }

    // ... rest of your existing methods remain the same ...

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function currentResident()
    {
        return $this->belongsTo(Resident::class, 'current_resident_id');
    }

    public function customPermissions()
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot('is_granted')
            ->wherePivot('is_granted', true)
            ->withTimestamps();
    }

    public function getAllPermissions()
    {
        $rolePermissions = $this->role ? $this->role->permissions->pluck('id') : collect();
        $customPermissions = $this->customPermissions->pluck('id');
        $allPermissionIds = $rolePermissions->merge($customPermissions)->unique();
        
        return Permission::whereIn('id', $allPermissionIds)
            ->where('is_active', true)
            ->get();
    }

    public function getPermissionNames(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        return $this->getAllPermissions()
            ->where('name', $permissionName)
            ->isNotEmpty();
    }

    public function hasAnyPermission(array $permissionNames): bool
    {
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        return $this->getAllPermissions()
            ->whereIn('name', $permissionNames)
            ->isNotEmpty();
    }

    public function hasAllPermissions(array $permissionNames): bool
    {
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        $userPermissions = $this->getAllPermissions()->pluck('name')->toArray();
        return empty(array_diff($permissionNames, $userPermissions));
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function hasAnyRole(array $roleNames): bool
    {
        return $this->role && in_array($this->role->name, $roleNames);
    }

    public function assignPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $permissionsData = [];
        foreach ($permissionIds as $permissionId) {
            $permissionsData[$permissionId] = ['is_granted' => $isGranted];
        }
        
        $this->customPermissions()->sync($permissionsData, false);
    }

    public function revokePermissions(array $permissionIds): void
    {
        $this->customPermissions()->detach($permissionIds);
    }

    public function syncPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $permissionsData = [];
        foreach ($permissionIds as $permissionId) {
            $permissionsData[$permissionId] = ['is_granted' => $isGranted];
        }
        
        $this->customPermissions()->sync($permissionsData);
    }

    public function activityLogs()
    {
        return $this->hasMany(Activity::class, 'causer_id')
            ->where('causer_type', self::class);
    }

    public function subjectLogs()
    {
        return $this->hasMany(Activity::class, 'subject_id')
            ->where('subject_type', self::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeWithRole($query, $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    public function scopeWithHousehold($query)
    {
        return $query->whereNotNull('household_id');
    }

    public function scopeWithoutHousehold($query)
    {
        return $query->whereNull('household_id');
    }

    public function scopeRequiresPasswordChange($query)
    {
        return $query->where('require_password_change', true);
    }

    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return !is_null($this->two_factor_secret) && !is_null($this->two_factor_confirmed_at);
    }

    public function recordLogin(string $ipAddress): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
            'login_count' => $this->login_count + 1,
            'failed_login_attempts' => 0,
            'account_locked_until' => null,
        ]);
    }

    public function isAdministrator(): bool
    {
        return $this->hasRole('Administrator');
    }

    public function isHouseholdHead(): bool
    {
        return $this->role && $this->role->name === 'Household Head';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function getRecentActivityLogs($limit = 10)
    {
        return $this->activityLogs()
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function markPasswordAsChanged(): void
    {
        $this->update([
            'password_changed_at' => now(),
            'require_password_change' => false,
        ]);
    }

    public function loginLogs()
    {
        return $this->hasMany(UserLoginLog::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withTimestamps()
            ->withPivot('created_at', 'updated_at');
    }

    /**
     * Get current active session
     */
    public function getCurrentSessionAttribute()
    {
        return Session::where('user_id', $this->id)
            ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120)))
            ->latest('last_activity')
            ->first();
    }

    /**
     * Get all active sessions
     */
    public function activeSessions()
    {
        return $this->hasMany(Session::class, 'user_id')
            ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120)));
    }

    /**
     * Check if user is currently logged in
     */
    public function getIsLoggedInAttribute(): bool
    {
        return $this->current_session !== null;
    }

    /**
     * Get login logs for current session
     */
    public function getCurrentLoginLogAttribute()
    {
        if (!$this->current_session) {
            return null;
        }

        return UserLoginLog::where('user_id', $this->id)
            ->where('session_id', $this->current_session->id)
            ->where('is_successful', true)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();
    }

    /**
     * Check if this user account belongs to a household
     */
    public function belongsToHousehold(): bool
    {
        return !is_null($this->household_id);
    }

    /**
     * Get the household head's current resident
     */
    public function getCurrentHeadResidentAttribute()
    {
        if (!$this->belongsToHousehold()) {
            return null;
        }
        return $this->currentResident;
    }

    /**
     * Transfer this user account to a different resident in the same household
     */
    public function transferToResident(Resident $newResident): bool
    {
        if (!$this->belongsToHousehold()) {
            return false;
        }

        // Verify new resident belongs to the same household
        if ($newResident->household_id !== $this->household_id) {
            return false;
        }

        $this->update([
            'current_resident_id' => $newResident->id,
            'first_name' => $newResident->first_name,
            'last_name' => $newResident->last_name,
            'contact_number' => $this->household->contact_number,
            'email' => $this->household->email ?? $newResident->email,
        ]);

        return true;
    }

    /**
     * Deactivate household user account
     */
    public function deactivateHouseholdAccount(): void
    {
        if ($this->belongsToHousehold()) {
            $this->update([
                'status' => 'inactive',
                'household_id' => null,
                'current_resident_id' => null,
            ]);
        }
    }

    public function getNotificationPreferences(): array
    {
        $defaults = [
            'clearance' => true,
            'fees' => true,
            'household' => true,
            'announcements' => true,
            'reports' => true,
            'email' => true,
            'sms' => false,
            'quiet_hours' => false,
        ];
        
        return array_merge($defaults, $this->notification_preferences ?? []);
    }

    public function setNotificationPreferences(array $preferences): void
    {
        $this->notification_preferences = $preferences;
        $this->save();
    }
}