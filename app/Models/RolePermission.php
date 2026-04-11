<?php

// app/Models/RolePermission.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'role_permissions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role_id',
        'permission_id',
        'granted_by',
        'granted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'granted_at' => 'datetime',
        ];
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'granter_name',
    ];

    /**
     * Get the role that owns the permission assignment.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the permission that is assigned.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    /**
     * Get the user who granted this permission.
     */
    public function granter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Get granter name attribute (handles NULL)
     */
    public function getGranterNameAttribute(): string
    {
        if (!$this->granted_by) {
            return 'System';
        }
        
        if ($this->relationLoaded('granter') && $this->granter) {
            return $this->granter->username ?: ($this->granter->first_name . ' ' . $this->granter->last_name);
        }
        
        return 'System';
    }

    /**
     * Scope a query to only include active role permissions.
     */
    public function scopeActive($query)
    {
        return $query->whereHas('permission', function ($q) {
            $q->where('is_active', true);
        })->whereHas('role', function ($q) {
            $q->where('is_system_role', false);
        });
    }
}