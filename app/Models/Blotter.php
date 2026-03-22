<?php
// app/Models/Blotter.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blotter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'blotter_number',
        'incident_type',
        'incident_description',
        'incident_datetime',
        'location',
        'barangay',
        'reporter_name',
        'reporter_contact',
        'reporter_address',
        'respondent_name',
        'respondent_address',
        'witnesses',
        'evidence',
        'status',
        'priority',
        'action_taken',
        'investigator',
        'resolved_datetime',
        'attachments',
        'involved_residents'
    ];

    protected $casts = [
        'incident_datetime' => 'datetime',
        'resolved_datetime' => 'datetime',
        'attachments' => 'array',
        'involved_residents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'pending',
        'priority' => 'medium'
    ];

    // Boot method to auto-generate blotter number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blotter) {
            if (empty($blotter->blotter_number)) {
                $blotter->blotter_number = static::generateBlotterNumber();
            }
        });
    }

    // Generate unique blotter number
    public static function generateBlotterNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastBlotter = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastBlotter) {
            $lastNumber = intval(substr($lastBlotter->blotter_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "BLT-{$year}{$month}-{$newNumber}";
    }

    // Scopes for filtering
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInvestigating($query)
    {
        return $query->where('status', 'investigating');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeByBarangay($query, $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('incident_datetime', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedIncidentDateTimeAttribute(): string
    {
        return $this->incident_datetime->format('M d, Y h:i A');
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'investigating' => 'bg-blue-100 text-blue-800',
            'resolved' => 'bg-green-100 text-green-800',
            'archived' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getPriorityBadgeAttribute(): string
    {
        return match($this->priority) {
            'low' => 'bg-green-100 text-green-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'high' => 'bg-orange-100 text-orange-800',
            'urgent' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}