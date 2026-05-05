<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_system_role',
    ];

    protected function casts(): array
    {
        return [
            'is_system_role' => 'boolean',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withTimestamps();
    }

    public function assignPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()
            ->where('permissions.name', $permissionName)
            ->where('permissions.is_active', true)
            ->exists();
    }

    public function getPermissionNames(): array
    {
        return $this->permissions()
            ->where('permissions.is_active', true)
            ->pluck('permissions.name')
            ->toArray();
    }

    public function scopeSystemRoles($query)
    {
        return $query->where('is_system_role', true);
    }

    public function scopeCustomRoles($query)
    {
        return $query->where('is_system_role', false);
    }

    public function scopeActive($query)
    {
        return $query->whereHas('permissions', function ($q) {
            $q->where('permissions.is_active', true);
        });
    }
}