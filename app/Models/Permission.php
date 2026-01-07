<?php

// app/Models/Permission.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the roles that have this permission.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withTimestamps();
    }

    /**
     * Get the users with this permission.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions')
            ->withPivot('is_granted')
            ->withTimestamps();
    }

    /**
     * Scope a query to only include active permissions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include permissions for a specific module.
     */
    public function scopeForModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope a query to order by module.
     */
    public function scopeOrderedByModule($query)
    {
        return $query->orderBy('module')->orderBy('display_name');
    }

    /**
     * Get all available modules.
     */
    public static function getModules(): array
    {
        return self::distinct()->pluck('module')->toArray();
    }

    /**
     * Get permission grouped by module.
     */
    public static function getGroupedByModule()
    {
        return self::active()
            ->orderedByModule()
            ->get()
            ->groupBy('module');
    }

    /**
     * Check if permission is granted to a specific user.
     */
    public function isGrantedToUser(User $user): bool
    {
        // Check if user has this permission via their role
        if ($user->role && $user->role->permissions->contains('id', $this->id)) {
            return true;
        }

        // Check if user has this permission as a custom permission
        return $user->customPermissions->contains('id', $this->id);
    }
}