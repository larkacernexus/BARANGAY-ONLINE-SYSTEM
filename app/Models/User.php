<?php

// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\CausesActivity;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;


class User extends Authenticatable
{
    use HasFactory, Notifiable, CausesActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
    'first_name',
    'last_name',
    'email',
    'username',
    'password',
    'contact_number',
    'position',
    'department_id',
    'role_id',
    'status',
    'email_verified_at',
    'require_password_change',
    'password_changed_at',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'two_factor_confirmed_at',
    'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'require_password_change' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the user's role.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the user's department.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the user's custom permissions.
     */
    public function customPermissions()
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot('is_granted')
            ->wherePivot('is_granted', true);
    }

    /**
     * Get all permissions for the user (including role permissions).
     */
    public function getAllPermissions()
    {
        // Get permissions from role
        $rolePermissions = $this->role ? $this->role->permissions->pluck('id') : collect();
        
        // Get custom permissions
        $customPermissions = $this->customPermissions->pluck('id');
        
        // Merge and get unique permission IDs
        $allPermissionIds = $rolePermissions->merge($customPermissions)->unique();
        
        // Return all permissions
        return Permission::whereIn('id', $allPermissionIds)
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get all permission names for the user.
     */
    public function getPermissionNames(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permissionName): bool
    {
        // Admin role has all permissions
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        return $this->getAllPermissions()
            ->where('name', $permissionName)
            ->isNotEmpty();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissionNames): bool
    {
        // Admin role has all permissions
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        return $this->getAllPermissions()
            ->whereIn('name', $permissionNames)
            ->isNotEmpty();
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissionNames): bool
    {
        // Admin role has all permissions
        if ($this->role && $this->role->name === 'Administrator') {
            return true;
        }

        $userPermissions = $this->getAllPermissions()->pluck('name')->toArray();
        
        return empty(array_diff($permissionNames, $userPermissions));
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return $this->role && in_array($this->role->name, $roleNames);
    }

    /**
     * Assign custom permissions to user.
     */
    public function assignPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $permissionsData = [];
        foreach ($permissionIds as $permissionId) {
            $permissionsData[$permissionId] = ['is_granted' => $isGranted];
        }
        
        $this->customPermissions()->sync($permissionsData, false); // false = don't detach existing
    }

    /**
     * Revoke custom permissions from user.
     */
    public function revokePermissions(array $permissionIds): void
    {
        $this->customPermissions()->detach($permissionIds);
    }

    /**
     * Sync custom permissions (replace all).
     */
    public function syncPermissions(array $permissionIds, bool $isGranted = true): void
    {
        $permissionsData = [];
        foreach ($permissionIds as $permissionId) {
            $permissionsData[$permissionId] = ['is_granted' => $isGranted];
        }
        
        $this->customPermissions()->sync($permissionsData);
    }

    /**
     * Get the user's activity logs.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include users with a specific role.
     */
    public function scopeWithRole($query, $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    /**
     * Scope a query to only include users in a specific department.
     */
    public function scopeInDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    
       public function hasEnabledTwoFactorAuthentication(): bool
    {
        return !is_null($this->two_factor_secret) && !is_null($this->two_factor_confirmed_at);
    }

    /**
     * Record user login activity.
     */
    public function recordLogin(string $ipAddress): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
        ]);

        ActivityLog::create([
            'user_id' => $this->id,
            'action' => 'login',
            'description' => 'User logged in',
            'ip_address' => $ipAddress,
        ]);
    }

    public function residentProfile()
{
    return $this->hasOne(ResidentProfile::class, 'user_id');
}

public function residentDocuments()
{
    return $this->hasMany(ResidentDocument::class, 'resident_id');
}
}