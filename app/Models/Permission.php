<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')->withTimestamps();
    }

    /**
     * Scope a query to only include active permissions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order permissions by module.
     */
    public function scopeOrderedByModule($query)
    {
        return $query->orderBy('module')->orderBy('display_name');
    }

    public static function getModules(): array
    {
        return [
            [
                'name' => 'Dashboard',
                'display_name' => 'Dashboard',
                'description' => 'Main dashboard and statistics',
                'icon' => 'LayoutDashboard'
            ],
            [
                'name' => 'Residents',
                'display_name' => 'Residents',
                'description' => 'Resident management module',
                'icon' => 'Users'
            ],
            [
                'name' => 'Households',
                'display_name' => 'Households',
                'description' => 'Household management module',
                'icon' => 'Home'
            ],
            [
                'name' => 'Fees',
                'display_name' => 'Fees',
                'description' => 'Fee collection and management',
                'icon' => 'File'
            ],
            [
                'name' => 'Calendar',
                'display_name' => 'Calendar',
                'description' => 'Event and schedule management',
                'icon' => 'Calendar'
            ],
            [
                'name' => 'Settings',
                'display_name' => 'Settings',
                'description' => 'System settings and configuration',
                'icon' => 'Settings'
            ],
            [
                'name' => 'Notifications',
                'display_name' => 'Notifications',
                'description' => 'Notification management',
                'icon' => 'Bell'
            ],
            [
                'name' => 'Reports',
                'display_name' => 'Reports',
                'description' => 'Report generation and analytics',
                'icon' => 'BarChart3'
            ],
        ];
    }
}