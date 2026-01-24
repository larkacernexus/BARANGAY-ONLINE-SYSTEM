<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'user_agent',
        'method',
        'url',
        'route_name',
        'parameters',
        'status_code',
        'response_time',
        'response_data',
        'action_type',
        'resource_type',
        'resource_id',
        'description',
        'is_sensitive',
        'accessed_at'
    ];

    protected $casts = [
        'parameters' => 'array',
        'response_data' => 'array',
        'is_sensitive' => 'boolean',
        'accessed_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include sensitive actions.
     */
    public function scopeSensitive($query)
    {
        return $query->where('is_sensitive', true);
    }

    /**
     * Scope a query to only include actions of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('action_type', $type);
    }

    /**
     * Scope a query to only include actions on a specific resource.
     */
    public function scopeForResource($query, $type, $id = null)
    {
        $query->where('resource_type', $type);
        if ($id) {
            $query->where('resource_id', $id);
        }
        return $query;
    }

    /**
     * Get the formatted response time.
     */
    public function getFormattedResponseTimeAttribute()
    {
        if ($this->response_time < 1000) {
            return $this->response_time . 'ms';
        }
        return round($this->response_time / 1000, 2) . 's';
    }

    /**
     * Get the action type badge class.
     */
    public function getActionTypeClassAttribute()
    {
        $classes = [
            'create' => 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            'read' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'update' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            'delete' => 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
            'login' => 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
            'logout' => 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
            'export' => 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
        ];

        return $classes[$this->action_type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }

    /**
     * Get method badge class.
     */
    public function getMethodClassAttribute()
    {
        $classes = [
            'GET' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'POST' => 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            'PUT' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            'PATCH' => 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
            'DELETE' => 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        ];

        return $classes[$this->method] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }

    /**
     * Get status code badge class.
     */
    public function getStatusCodeClassAttribute()
    {
        if ($this->status_code >= 200 && $this->status_code < 300) {
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        } elseif ($this->status_code >= 300 && $this->status_code < 400) {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
        } elseif ($this->status_code >= 400 && $this->status_code < 500) {
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        } else {
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    }
}