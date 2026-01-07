<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'default_amount',
        'is_active',
        'is_recurring',
        'recurring_period',
        'due_day',
        'grace_period_days',
        'applicable_to',
        'requirements',
    ];

    protected $casts = [
        'default_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'is_recurring' => 'boolean',
        'applicable_to' => 'array',
        'requirements' => 'array',
        'due_date' => 'date',
    ];

    protected $appends = [
        'formatted_amount',
    ];

    /**
     * Scope active payment types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope recurring payment types
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Get formatted amount attribute
     */
    public function getFormattedAmountAttribute()
    {
        return '₱' . number_format($this->default_amount, 2);
    }

    /**
     * Check if payment type is applicable to specific resident type
     */
    public function isApplicableTo($residentType)
    {
        if (empty($this->applicable_to)) {
            return true; // Applicable to all if not specified
        }

        return in_array($residentType, $this->applicable_to);
    }

    /**
     * Calculate next due date
     */
    public function calculateNextDueDate()
    {
        if (!$this->is_recurring) {
            return null;
        }

        $now = now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        $dueDate = now()->setDate($currentYear, $currentMonth, $this->due_day ?? 1);

        // If due date has passed this month, move to next period
        if ($dueDate->isPast()) {
            switch ($this->recurring_period) {
                case 'monthly':
                    $dueDate->addMonth();
                    break;
                case 'quarterly':
                    $dueDate->addMonths(3);
                    break;
                case 'biannually':
                    $dueDate->addMonths(6);
                    break;
                case 'annually':
                    $dueDate->addYear();
                    break;
            }
        }

        return $dueDate;
    }

    /**
     * Relationship with payments
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}