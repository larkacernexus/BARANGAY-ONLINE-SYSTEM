<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

abstract class PaymentBaseController extends Controller
{
    protected function generateOrNumber(): string
    {
        $date = now()->format('Ymd');
        
        $latestPayment = Payment::where('or_number', 'like', "BAR-{$date}-%")
            ->orderByRaw('CAST(SUBSTRING(or_number, -3) AS UNSIGNED) DESC')
            ->first();

        if ($latestPayment) {
            $lastNumber = (int) substr($latestPayment->or_number, -3);
            $nextNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '001';
        }

        return "BAR-{$date}-{$nextNumber}";
    }

    protected function getAuthenticatedUserId(): int
    {
        $user = Auth::user();
        if (!$user) {
            Log::warning('No authenticated user found, using fallback user ID 1');
            return 1;
        }

        $userExists = DB::table('users')->where('id', $user->id)->exists();
        return $userExists ? $user->id : 1;
    }
}