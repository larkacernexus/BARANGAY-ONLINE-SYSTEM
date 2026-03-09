<?php
// app/Http/Controllers/Admin/BasePaymentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

abstract class BasePaymentController extends Controller
{
    /**
     * Generate a unique OR number
     */
    protected function generateOrNumber(): string
    {
        $date = now()->format('Ymd');
        $lastPayment = \App\Models\Payment::where('or_number', 'like', "BAR-{$date}-%")
            ->orderBy('or_number', 'desc')
            ->first();

        if ($lastPayment) {
            $lastNumber = (int) substr($lastPayment->or_number, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return "BAR-{$date}-{$newNumber}";
    }

    /**
     * Get payer model class based on type
     */
    protected function getPayerModelClass(string $payerType): string
    {
        return match($payerType) {
            'resident' => 'App\\Models\\Resident',
            'household' => 'App\\Models\\Household',
            'business' => 'App\\Models\\Business',
            default => 'App\\Models\\Resident',
        };
    }

    /**
     * Helper function to safely get household member
     */
    protected function getHouseholdMember($resident)
    {
        if (!$resident) return null;
        
        if ($resident->householdMember instanceof \Illuminate\Database\Eloquent\Collection) {
            return $resident->householdMember->first();
        }
        
        return $resident->householdMember;
    }

    /**
     * Log payment activity
     */
    protected function logPaymentActivity(string $action, array $data = []): void
    {
        Log::info("PAYMENT_{$action}", array_merge([
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'System',
            'timestamp' => now()->toIso8601String(),
        ], $data));
    }
}