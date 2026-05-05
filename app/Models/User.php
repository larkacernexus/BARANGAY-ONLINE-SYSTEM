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

class User extends Authenticatable
{
    use HasFactory, Notifiable, CausesActivity, LogsActivity, HasNotificationPreferences;

    protected $fillable = [
        'username',
        'email',
        'contact_number',
        'position',
        'password',
        'email_verified_at',
        'require_password_change',
        'password_changed_at',
        'resident_id',
        'household_id',
        'current_resident_id',
        'notification_preferences',
    ];

    protected $guarded = [
        'role_id',
        'status',
        'failed_login_attempts',
        'last_failed_login_at',
        'account_locked_until',
        'login_count',
        'last_login_at',
        'last_login_ip',
        'current_login_ip',
        'last_logout_at',
        'last_login_device',
        'last_login_browser',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'two_factor_enabled_at',
        'two_factor_last_used_at',
        'two_factor_used_recovery_codes',
        'remember_token',
        'login_qr_code',
        'login_qr_code_generated_at',
        'login_qr_code_expires_at',
        'login_qr_code_used_count',
        'qr_code_url',
        'qr_code_generated_at',
        'qr_code_download_count',
        'password_requested_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'login_qr_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'              => 'datetime',
            'password'                       => 'hashed',
            'require_password_change'        => 'boolean',
            'two_factor_enabled_at'          => 'datetime',
            'two_factor_last_used_at'        => 'datetime',
            'last_login_at'                  => 'datetime',
            'password_changed_at'            => 'datetime',
            'two_factor_confirmed_at'        => 'datetime',
            'last_failed_login_at'           => 'datetime',
            'account_locked_until'           => 'datetime',
            'failed_login_attempts'          => 'integer',
            'two_factor_used_recovery_codes' => 'array',
            'login_count'                    => 'integer',
            'notification_preferences'       => 'array',
            'login_qr_code_generated_at'     => 'datetime',
            'login_qr_code_expires_at'       => 'datetime',
            'qr_code_generated_at'           => 'datetime',
            'login_qr_code_used_count'       => 'integer',
            'qr_code_download_count'         => 'integer',
        ];
    }

    public function getFullNameAttribute(): string
    {
        $name = trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));

        return $name !== '' ? $name : ($this->username ?? 'User');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name', 'last_name', 'email', 'username',
                'contact_number', 'position', 'role_id', 'status',
                'household_id', 'current_resident_id',
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "User {$eventName}")
            ->dontSubmitEmptyLogs()
            ->useLogName('user');
    }

    // ----------------------------------------------------------------
    // RELATIONSHIPS
    // ----------------------------------------------------------------

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function currentResident()
    {
        return $this->belongsTo(Resident::class, 'current_resident_id');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot('is_granted')
            ->withTimestamps();
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

    public function loginLogs()
    {
        return $this->hasMany(UserLoginLog::class);
    }

    public function activeSessions()
    {
        return $this->hasMany(Session::class, 'user_id')
            ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120)));
    }

    // ----------------------------------------------------------------
    // PERMISSIONS
    // ----------------------------------------------------------------

    public function getAllPermissions()
    {
        $rolePermissionIds = $this->role
            ? $this->role->permissions()->where('permissions.is_active', true)->pluck('permissions.id')
            : collect();

        $userPermissionIds = $this->permissions()
            ->wherePivot('is_granted', true)
            ->pluck('permissions.id');

        return Permission::whereIn('id', $rolePermissionIds->merge($userPermissionIds)->unique())
            ->where('is_active', true)
            ->get();
    }

    public function getPermissionNames(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    public function hasPermission(string $permissionName): bool
    {
        return $this->getAllPermissions()
            ->where('name', $permissionName)
            ->isNotEmpty();
    }

    public function can($ability, $arguments = []): bool
    {
        return $this->hasPermission($ability);
    }

    public function hasAnyPermission(array $permissionNames): bool
    {
        return $this->getAllPermissions()
            ->whereIn('name', $permissionNames)
            ->isNotEmpty();
    }

    public function hasAllPermissions(array $permissionNames): bool
    {
        $userPermissionNames = $this->getAllPermissions()->pluck('name')->toArray();

        return empty(array_diff($permissionNames, $userPermissionNames));
    }

    // ----------------------------------------------------------------
    // ROLES
    // ----------------------------------------------------------------

    public function hasRole(string $roleName): bool
    {
        return $this->role !== null && $this->role->name === $roleName;
    }

    public function hasAnyRole(array $roleNames): bool
    {
        return $this->role !== null && in_array($this->role->name, $roleNames, true);
    }

    public function isAdministrator(): bool
    {
        return $this->hasRole('Administrator');
    }

    public function isHouseholdHead(): bool
    {
        return $this->hasRole('Household Head');
    }

    // ----------------------------------------------------------------
    // PERMISSION MANAGEMENT
    // ----------------------------------------------------------------

    public function assignPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $data = [];
        foreach ($permissionIds as $id) {
            $data[$id] = ['is_granted' => $isGranted];
        }

        $this->permissions()->syncWithoutDetaching($data);
    }

    public function revokePermissions(array $permissionIds): void
    {
        $this->permissions()->detach($permissionIds);
    }

    public function syncPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $data = [];
        foreach ($permissionIds as $id) {
            $data[$id] = ['is_granted' => $isGranted];
        }

        $this->permissions()->sync($data);
    }

    // ----------------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------------

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function belongsToHousehold(): bool
    {
        return $this->household_id !== null;
    }

    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return $this->two_factor_secret !== null
            && $this->two_factor_confirmed_at !== null;
    }

    // ----------------------------------------------------------------
    // STATE MUTATIONS
    // ----------------------------------------------------------------

    public function recordLogin(string $ipAddress): void
    {
        $this->update([
            'last_login_at'         => now(),
            'last_login_ip'         => $ipAddress,
            'login_count'           => $this->login_count + 1,
            'failed_login_attempts' => 0,
            'account_locked_until'  => null,
        ]);
    }

    public function markPasswordAsChanged(): void
    {
        $this->update([
            'password_changed_at'     => now(),
            'require_password_change' => false,
        ]);
    }

    public function transferToResident(Resident $newResident): bool
    {
        if (!$this->belongsToHousehold()) {
            return false;
        }

        if ($newResident->household_id !== $this->household_id) {
            return false;
        }

        return $this->update([
            'current_resident_id' => $newResident->id,
            'first_name'          => $newResident->first_name,
            'last_name'           => $newResident->last_name,
            'contact_number'      => $this->household->contact_number,
            'email'               => $this->household->email ?? $newResident->email,
        ]);
    }

    public function deactivateHouseholdAccount(): void
    {
        if (!$this->belongsToHousehold()) {
            return;
        }

        $this->update([
            'status'              => 'inactive',
            'household_id'        => null,
            'current_resident_id' => null,
        ]);
    }

    // ----------------------------------------------------------------
    // QR CODE
    // ----------------------------------------------------------------

    public function hasQrCode(): bool
    {
        return $this->login_qr_code !== null && $this->qr_code_url !== null;
    }

    public function isQrCodeExpired(): bool
    {
        if ($this->login_qr_code_expires_at === null) {
            return false;
        }

        return now()->gt($this->login_qr_code_expires_at);
    }

    public function getQrCodeUrlAttribute($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = ltrim($value, '/\\');

        if (str_contains($value, '..')) {
            return null;
        }

        return asset('storage/' . $value);
    }

    public function incrementQrCodeDownloadCount(): void
    {
        $this->increment('qr_code_download_count');
    }

    public function clearQrCode(): void
    {
        $this->update([
            'login_qr_code'              => null,
            'login_qr_code_generated_at' => null,
            'login_qr_code_expires_at'   => null,
            'login_qr_code_used_count'   => 0,
            'qr_code_url'                => null,
        ]);
    }

    public function getQrCodeStatusAttribute(): array
    {
        return [
            'has_code'      => $this->hasQrCode(),
            'url'           => $this->qr_code_url,
            'generated_at'  => $this->login_qr_code_generated_at,
            'expires_at'    => $this->login_qr_code_expires_at,
            'is_expired'    => $this->isQrCodeExpired(),
            'used_count'    => $this->login_qr_code_used_count,
            'download_count'=> $this->qr_code_download_count,
        ];
    }

    // ----------------------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------------------

    public function getNotificationPreferences(): array
    {
        $defaults = [
            'clearance'     => true,
            'fees'          => true,
            'household'     => true,
            'announcements' => true,
            'reports'       => true,
            'email'         => true,
            'sms'           => false,
            'quiet_hours'   => false,
        ];

        return array_merge($defaults, $this->notification_preferences ?? []);
    }

    public function setNotificationPreferences(array $preferences): void
    {
        $this->notification_preferences = $preferences;
        $this->save();
    }

    // ----------------------------------------------------------------
    // SCOPES
    // ----------------------------------------------------------------

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
        return $query->whereHas('role', fn ($q) => $q->where('name', $roleName));
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

    // ----------------------------------------------------------------
    // ACTIVITY LOGS
    // ----------------------------------------------------------------

    public function getRecentActivityLogs($limit = 10)
    {
        return $this->activityLogs()
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getCurrentSessionAttribute()
    {
        return Session::where('user_id', $this->id)
            ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120)))
            ->latest('last_activity')
            ->first();
    }

    public function getIsLoggedInAttribute(): bool
    {
        return $this->current_session !== null;
    }

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

    public function getCurrentHeadResidentAttribute()
    {
        if (!$this->belongsToHousehold()) {
            return null;
        }

        return $this->currentResident;
    }
}