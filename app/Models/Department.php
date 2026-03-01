<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'departments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'head_user_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'head_name',
        'employee_count',
        'status_label',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the head of this department
     */
    public function head()
    {
        return $this->belongsTo(User::class, 'head_user_id');
    }

    /**
     * Get all users belonging to this department
     */
    public function users()
    {
        return $this->hasMany(User::class, 'department_id');
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the head's full name
     */
    public function getHeadNameAttribute(): ?string
    {
        return $this->head ? $this->head->full_name : 'Vacant';
    }

    /**
     * Get the number of employees in this department
     */
    public function getEmployeeCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->is_active ? 'Active' : 'Inactive';
    }

    /**
     * Get formatted created date
     */
    public function getCreatedAtFormattedAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('M d, Y') : 'N/A';
    }

    /**
     * Get formatted updated date
     */
    public function getUpdatedAtFormattedAttribute(): string
    {
        return $this->updated_at ? $this->updated_at->format('M d, Y') : 'N/A';
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active departments
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive departments
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope a query to only include departments with a head
     */
    public function scopeHasHead($query)
    {
        return $query->whereNotNull('head_user_id');
    }

    /**
     * Scope a query to only include departments without a head
     */
    public function scopeNoHead($query)
    {
        return $query->whereNull('head_user_id');
    }

    /**
     * Scope a query to search departments by name
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%");
    }

    // ==================== METHODS ====================

    /**
     * Assign a head to this department
     */
    public function assignHead(User $user): bool
    {
        if ($this->head_user_id === $user->id) {
            return false;
        }

        $this->head_user_id = $user->id;
        return $this->save();
    }

    /**
     * Remove the head from this department
     */
    public function removeHead(): bool
    {
        $this->head_user_id = null;
        return $this->save();
    }

    /**
     * Activate the department
     */
    public function activate(): bool
    {
        $this->is_active = true;
        return $this->save();
    }

    /**
     * Deactivate the department
     */
    public function deactivate(): bool
    {
        $this->is_active = false;
        return $this->save();
    }

    /**
     * Check if department has a head
     */
    public function hasHead(): bool
    {
        return !is_null($this->head_user_id);
    }

    /**
     * Check if a user is the head of this department
     */
    public function isHead(User $user): bool
    {
        return $this->head_user_id === $user->id;
    }

    /**
     * Get department statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_employees' => $this->employee_count,
            'has_head' => $this->hasHead(),
            'head_name' => $this->head_name,
            'status' => $this->status_label,
            'created_at' => $this->created_at_formatted,
        ];
    }

    /**
     * Get validation rules
     */
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get update validation rules
     */
    public static function updateValidationRules($id): array
    {
        return [
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
            'head_user_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ];
    }
}