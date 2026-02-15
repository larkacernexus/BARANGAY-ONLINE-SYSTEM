<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id',
        'resident_id',
        'user_id',
        'type',
        'title',
        'description',
        'is_anonymous',
        'status',
        'reported_as_name',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'hearing_date' => 'datetime',
    ];

    /**
     * Get the household associated with the incident.
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the resident who reported the incident.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the user who filed the incident.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the blotter details for the incident.
     */
    public function blotterDetails(): HasOne
    {
        return $this->hasOne(BlotterDetails::class, 'incident_id');
    }

    /**
     * Scope for complaints only.
     */
    public function scopeComplaints($query)
    {
        return $query->where('type', 'complaint');
    }

    /**
     * Scope for blotters only.
     */
    public function scopeBlotters($query)
    {
        return $query->where('type', 'blotter');
    }

    /**
     * Scope for pending incidents.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for under investigation incidents.
     */
    public function scopeUnderInvestigation($query)
    {
        return $query->where('status', 'under_investigation');
    }

    /**
     * Scope for resolved incidents.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope for dismissed incidents.
     */
    public function scopeDismissed($query)
    {
        return $query->where('status', 'dismissed');
    }

    /**
     * Get the display name based on anonymity.
     */
    public function getReporterNameAttribute(): string
    {
        return $this->is_anonymous ? 'Anonymous' : $this->reported_as_name;
    }

    /**
     * Check if incident is a blotter.
     */
    public function isBlotter(): bool
    {
        return $this->type === 'blotter';
    }

    /**
     * Check if incident is a complaint.
     */
    public function isComplaint(): bool
    {
        return $this->type === 'complaint';
    }

    /**
     * Get the reference number.
     */
    public function getReferenceNumberAttribute(): string
    {
        if ($this->isBlotter()) {
            return 'BLT-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
        }
        return 'CMP-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'under_investigation' => 'blue',
            'resolved' => 'green',
            'dismissed' => 'red',
            default => 'gray',
        };
    }


            /**
         * Get the evidences for the incident.
         */
        public function evidences(): HasMany
        {
            return $this->hasMany(IncidentEvidence::class);
        }

        /**
         * Get the count of evidences for the incident.
         */
        public function getEvidencesCountAttribute(): int
        {
            return $this->evidences()->count();
        }

    /**
     * Get the type badge color.
     */
    public function getTypeColorAttribute(): string
    {
        return $this->isBlotter() ? 'orange' : 'purple';
    }
}