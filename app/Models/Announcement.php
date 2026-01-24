<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'priority' => 'integer',
    ];

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
     * Scope for announcements happening today
     */
    public function scopeToday($query)
    {
        return $query->published()
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now());
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

    /**
     * Format the full date range for display
     */
    public function getFullDateTimeRangeAttribute(): string
    {
        $dateFormat = 'F j, Y';
        $timeFormat = 'g:i A';

        $start = $this->start_date ? $this->start_date->format($dateFormat) : 'TBA';
        $end = $this->end_date ? $this->end_date->format($dateFormat) : 'TBA';

        if ($this->start_date && $this->end_date && $this->start_date->isSameDay($this->end_date)) {
            // Same day, show time range
            $timeRange = $this->time_range;
            return "{$start} {$timeRange}";
        }

        $startTime = $this->start_time ? $this->start_time->format($timeFormat) : '';
        $endTime = $this->end_time ? $this->end_time->format($timeFormat) : '';

        $result = $start;
        if ($startTime) $result .= " {$startTime}";
        
        $result .= " to {$end}";
        if ($endTime) $result .= " {$endTime}";

        return $result;
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
     * Get announcement types
     */
    public static function getTypes(): array
    {
        return [
            'general' => 'General',
            'important' => 'Important',
            'event' => 'Event',
            'maintenance' => 'Maintenance',
            'other' => 'Other',
        ];
    }

    /**
     * Get priority options
     */
    public static function getPriorityOptions(): array
    {
        return [
            0 => 'Normal',
            1 => 'Low',
            2 => 'Medium',
            3 => 'High',
            4 => 'Urgent',
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
}