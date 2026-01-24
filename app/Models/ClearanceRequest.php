<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Notifications\Notifiable;

class ClearanceRequest extends Model
{
    use LogsActivity, Notifiable;

    protected $fillable = [
        // Resident & Type
        'resident_id',
        'clearance_type_id',
        
        // Request Details
        'reference_number',
        'purpose',
        'specific_purpose',
        'urgency', // normal, rush, express
        'needed_date',
        'additional_requirements',
        'fee_amount',
        
        // Status
        'status', // pending, processing, approved, issued, rejected, cancelled, pending_payment, expired
        
        // Clearance Issuance Details
        'clearance_number',
        'issue_date',
        'valid_until',
        'requirements_met',
        'remarks',
        'issuing_officer_id', // Changed to store user ID instead of name
        'issuing_officer_name', // Keep name for display
        
        // Processing Details
        'admin_notes',
        'cancellation_reason',
        'processed_at',
        'processed_by',
    ];

    protected $casts = [
        'needed_date' => 'date',
        'issue_date' => 'date',
        'valid_until' => 'date',
        'processed_at' => 'datetime',
        'fee_amount' => 'decimal:2',
        'requirements_met' => 'array',
    ];
    
    protected $appends = [
        'formatted_fee',
        'status_display',
        'urgency_display',
        'estimated_completion_date',
        'is_valid',
        'days_remaining',
        'formatted_status_history', // Added
    ];
    
    // ========== ACTIVITY LOG CONFIGURATION ==========
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'purpose', 'specific_purpose', 'urgency', 'fee_amount', 'remarks', 'admin_notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Clearance request {$eventName}")
            ->useLogName('clearance-requests');
    }
    
    // ========== RELATIONSHIPS ==========

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function clearanceType(): BelongsTo
    {
        return $this->belongsTo(ClearanceType::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ClearanceRequestDocument::class);
    }

    public function issuingOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuing_officer_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
    
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

     public function paymentItem(): HasOne
    {
        return $this->hasOne(PaymentItem::class, 'clearance_request_id');
    }

    public function payments(): HasMany
{
    return $this->hasMany(Payment::class, 'clearance_request_id');
}
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }
    
    /**
     * Get all activities for this clearance request.
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->orderBy('created_at', 'desc');
    }
    
    /**
     * Get status change history for this clearance request.
     */
    public function statusHistory()
    {
        return $this->morphMany(Activity::class, 'subject')
            ->where(function ($query) {
                // Look for activities where the status field was changed
                $query->whereJsonContains('properties->changes', ['status' => '!'])
                      ->orWhere('description', 'LIKE', '%status%')
                      ->orWhere('event', 'LIKE', '%status%');
            })
            ->orderBy('created_at', 'desc');
    }
    
    // ========== ACCESSORS ==========
    
    public function getFormattedFeeAttribute()
    {
        return '₱' . number_format($this->fee_amount, 2);
    }

    public function getStatusDisplayAttribute()
    {
        $statuses = [
            'pending' => 'Pending Review',
            'pending_payment' => 'Pending Payment',
            'processing' => 'Under Processing',
            'approved' => 'Approved (Ready for Issuance)',
            'issued' => 'Issued',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
            'expired' => 'Expired',
        ];
        
        return $statuses[$this->status] ?? ucfirst($this->status);
    }

    public function getUrgencyDisplayAttribute()
    {
        $urgencies = [
            'normal' => 'Normal',
            'rush' => 'Rush',
            'express' => 'Express',
        ];
        
        return $urgencies[$this->urgency] ?? ucfirst($this->urgency);
    }
    
    public function getIsValidAttribute()
    {
        if ($this->status !== 'issued') {
            return false;
        }
        
        return $this->valid_until && $this->valid_until->isFuture();
    }
    
    public function getDaysRemainingAttribute()
    {
        if (!$this->valid_until || $this->status !== 'issued') {
            return null;
        }
        
        return $this->valid_until->diffInDays(now(), false); // Negative if expired
    }

    // Calculate estimated completion date
    public function getEstimatedCompletionDateAttribute()
    {
        if (!$this->clearanceType || $this->isCompleted()) {
            return null;
        }
        
        $processingDays = $this->clearanceType->processing_days ?? 3;
        
        // Adjust for urgency
        if ($this->urgency === 'rush') {
            $processingDays = ceil($processingDays * 0.5);
        } elseif ($this->urgency === 'express') {
            $processingDays = 1;
        }
        
        $startDate = $this->created_at ?? now();
        return $startDate->addDays($processingDays);
    }
    
    public function getRequestingUserAttribute()
    {
        if ($this->requestedBy) {
            return $this->requestedBy;
        }
        
        if ($this->resident && $this->resident->user) {
            return $this->resident->user;
        }
        
        return null;
    }
    
    /**
     * Get formatted status history as an array.
     */
    public function getFormattedStatusHistoryAttribute()
    {
        if (!$this->relationLoaded('statusHistory')) {
            $this->load(['statusHistory' => function ($query) {
                $query->with('causer')->orderBy('created_at', 'desc');
            }]);
        }
        
        return $this->statusHistory->map(function ($activity) {
            $oldStatus = null;
            $newStatus = null;
            $description = $activity->description;
            
            // Extract status changes from properties
            if (isset($activity->properties['changes']['status'])) {
                $oldStatus = $activity->properties['changes']['status']['old'] ?? null;
                $newStatus = $activity->properties['changes']['status']['new'] ?? null;
                
                if ($oldStatus && $newStatus) {
                    $description = "Status changed from {$oldStatus} to {$newStatus}";
                }
            }
            
            return [
                'id' => $activity->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'description' => $description,
                'changed_by' => $activity->causer ? $activity->causer->name : 'System',
                'changed_by_user' => $activity->causer,
                'changed_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'formatted_date' => $activity->created_at->format('F j, Y g:i A'),
                'properties' => $activity->properties,
                'event' => $activity->event,
            ];
        })->values()->toArray();
    }
    
    /**
     * Helper method to get old status from an activity.
     */
    public function getOldStatusFromActivity($activity)
    {
        return $activity->properties['changes']['status']['old'] ?? null;
    }
    
    /**
     * Helper method to get new status from an activity.
     */
    public function getNewStatusFromActivity($activity)
    {
        return $activity->properties['changes']['status']['new'] ?? null;
    }
    
    // ========== SCOPES ==========
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByResident($query, $residentId)
    {
        return $query->where('resident_id', $residentId);
    }

    public function scopeNeedsProcessing($query)
    {
        return $query->whereIn('status', ['pending', 'processing', 'approved']);
    }
    
    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }
    
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'processing', 'approved']);
    }
    
    public function scopeExpired($query)
    {
        return $query->where('status', 'issued')
            ->whereDate('valid_until', '<', now());
    }
    
    // ========== BUSINESS LOGIC METHODS ==========
    
    public function canBeProcessed(): bool
    {
        return $this->status === 'pending' || $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['issued', 'rejected', 'cancelled', 'expired']);
    }
    
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
    
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }
    
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
    
    public function isIssued(): bool
    {
        return $this->status === 'issued';
    }
    
    // ========== ACTION METHODS ==========
    
    public function markAsProcessing($userId = null)
    {
        $this->update([
            'status' => 'processing',
            'processed_by' => $userId ?? auth()->id(),
            'processed_at' => now(),
        ]);
        
        return $this;
    }
    
    public function approve($validUntil = null)
    {
        // Store the authenticated user as issuing officer
        $user = auth()->user();
        
        $this->update([
            'status' => 'approved',
            'issuing_officer_id' => $user->id,
            'issuing_officer_name' => $user->name, // Store name for easy display
            'processed_by' => $user->id,
            'processed_at' => now(),
            'issue_date' => now(),
            'valid_until' => $validUntil ?? now()->addDays($this->clearanceType->validity_days ?? 30),
        ]);
        
        return $this;
    }
    
    public function issue()
    {
        // Move from 'approved' to 'issued' (final step)
        $user = auth()->user();
        
        $this->update([
            'status' => 'issued',
            'issuing_officer_id' => $user->id,
            'issuing_officer_name' => $user->name,
            'issue_date' => $this->issue_date ?? now(),
        ]);
        
        return $this;
    }

    public function getIssuingOfficerDisplayAttribute()
    {
        if ($this->issuingOfficer) {
            return $this->issuingOfficer->name . ' (ID: ' . $this->issuingOfficer->id . ')';
        }
        return $this->issuing_officer_name ?? 'N/A';
    }

    public function reject($reason, $processedBy = null)
    {
        if (!$this->canBeProcessed()) {
            throw new \Exception('Request cannot be rejected at this stage.');
        }

        $this->update([
            'status' => 'rejected',
            'admin_notes' => $reason,
            'processed_by' => $processedBy ?? auth()->id(),
            'processed_at' => now(),
        ]);

        return $this;
    }

    public function cancel($reason = null, $cancelledByResident = true)
    {
        if (!in_array($this->status, ['pending', 'processing', 'pending_payment'])) {
            throw new \Exception('Cannot cancel request at this stage.');
        }

        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'processed_at' => $cancelledByResident ? null : now(),
            'processed_by' => $cancelledByResident ? null : auth()->id(),
        ]);

        return $this;
    }
    
    public function markAsPendingPayment()
    {
        $this->update([
            'status' => 'pending_payment',
        ]);
        
        return $this;
    }

    public function clearance_type(): BelongsTo
    {
        return $this->belongsTo(ClearanceType::class, 'clearance_type_id');
    }
    
    public function markAsExpired()
    {
        if ($this->status !== 'issued' || $this->is_valid) {
            throw new \Exception('Only expired issued clearances can be marked as expired.');
        }
        
        $this->update([
            'status' => 'expired',
        ]);
        
        return $this;
    }
    
    // ========== GENERATORS ==========
    
    public static function generateReferenceNumber()
    {
        $prefix = 'REQ-' . date('Ymd') . '-';
        $lastRequest = self::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
    
    public static function generateClearanceNumber()
    {
        $prefix = 'CLR-' . date('Y') . '-';
        $lastClearance = self::where('clearance_number', 'like', $prefix . '%')
            ->orderBy('clearance_number', 'desc')
            ->first();

        if ($lastClearance) {
            $lastNumber = (int) str_replace($prefix, '', $lastClearance->clearance_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
    
    // ========== BOOT METHOD ==========
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->reference_number) {
                $model->reference_number = self::generateReferenceNumber();
            }
        });
        
        // Auto-mark as expired when validity passes
        static::saving(function ($model) {
            if ($model->status === 'issued' && $model->valid_until && $model->valid_until->isPast()) {
                $model->status = 'expired';
            }
        });
    }
}