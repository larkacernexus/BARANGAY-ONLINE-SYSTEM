<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialDiscountApplication extends Model
{
    protected $fillable = [
        'fee_id',
        'special_discount_id',
        'resident_id',
        'requested_by',
        'requested_at',
        'reason',
        'supporting_docs', // JSON array of file paths
        'status', // pending, approved, rejected
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'applied_percentage',
        'applied_amount',
        'notes'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'supporting_docs' => 'array',
        'applied_percentage' => 'decimal:2',
        'applied_amount' => 'decimal:2',
    ];

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }

    public function specialDiscount()
    {
        return $this->belongsTo(SpecialDiscount::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}