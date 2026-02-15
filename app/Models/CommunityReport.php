<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'report_type_id',
        'report_number',
        'title',
        'description',
        'detailed_description',
        'location',
        'incident_date',
        'incident_time',
        'urgency_level',
        'recurring_issue',
        'affected_people',
        'estimated_affected_count',
        'is_anonymous',
        'reporter_name',
        'reporter_contact',
        'reporter_address',
        'perpetrator_details',
        'preferred_resolution',
        'has_previous_report',
        'previous_report_id',
        'impact_level',
        'safety_concern',
        'environmental_impact',
        'noise_level',
        'duration_hours',
        'status',
        'priority',
        'assigned_to',
        'resolution_notes',
        'resolved_at',
        'acknowledged_at',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'incident_time' => 'datetime:H:i:s',
        'is_anonymous' => 'boolean',
        'recurring_issue' => 'boolean',
        'safety_concern' => 'boolean',
        'environmental_impact' => 'boolean',
        'has_previous_report' => 'boolean',
        'resolved_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reportType(): BelongsTo
    {
        return $this->belongsTo(ReportType::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function previousReport(): BelongsTo
    {
        return $this->belongsTo(CommunityReport::class, 'previous_report_id');
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(ReportEvidence::class, 'report_id');
    }

    // Auto-generate report number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            // Generate report number only if not provided
            if (empty($report->report_number)) {
                $year = date('Y');
                $month = date('m');
                $sequence = static::withTrashed()
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->count() + 1;
                
                $report->report_number = 'BRGY-REPORT-' . $year . $month . '-' . str_pad($sequence, 5, '0', STR_PAD_LEFT);
            }
            
            // Set defaults
            if (empty($report->status)) {
                $report->status = 'pending';
            }
            if (empty($report->urgency_level)) {
                $report->urgency_level = 'medium';
            }
            if (empty($report->priority)) {
                $report->priority = 'medium';
            }
            if (empty($report->impact_level)) {
                $report->impact_level = 'moderate';
            }
            if (empty($report->affected_people)) {
                $report->affected_people = 'individual';
            }
        });
    }

    // Status colors
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'orange',
            'under_review' => 'blue',
            'assigned' => 'yellow',
            'in_progress' => 'purple',
            'resolved' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }

    // Urgency colors
    public function getUrgencyColorAttribute(): string
    {
        return match($this->urgency_level) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'red',
            default => 'gray',
        };
    }

    // Priority colors
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
            default => 'gray',
        };
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->whereHas('reportType', function ($q) use ($category) {
            $q->where('category', $category);
        });
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'critical']);
    }

    public function scopeHighUrgency($query)
    {
        return $query->where('urgency_level', 'high');
    }

    // Check status
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isAssigned(): bool
    {
        return $this->status === 'assigned' || $this->status === 'in_progress';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    // Get display names
    public function getStatusDisplayAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->status));
    }

    public function getUrgencyDisplayAttribute(): string
    {
        return ucfirst($this->urgency_level);
    }

    public function getPriorityDisplayAttribute(): string
    {
        return ucfirst($this->priority);
    }

    public function getImpactDisplayAttribute(): string
    {
        return ucfirst($this->impact_level);
    }

    public function getAffectedPeopleDisplayAttribute(): string
    {
        return ucfirst($this->affected_people);
    }
}