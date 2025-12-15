<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;


use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\Clearance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics
        $stats = [
            'totalResidents' => Resident::count(),
            'totalHouseholds' => Household::count(),
            'monthlyCollections' => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
            'pendingClearances' => Clearance::where('status', 'pending')->count(),
        ];

        // Get recent activities
        $recentActivities = [
            'newResidents' => Resident::latest()->take(5)->get(),
            'recentPayments' => Payment::with('payer')->latest()->take(5)->get(),
            'recentClearances' => Clearance::with('applicant')->latest()->take(5)->get(),
        ];

        // Get upcoming events (you would have an events model)
        $upcomingEvents = [
            [
                'title' => 'Barangay Assembly',
                'date' => now()->addDay()->format('Y-m-d'),
                'time' => '09:00 AM',
                'location' => 'Barangay Hall'
            ],
            // Add more events as needed
        ];

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'upcomingEvents' => $upcomingEvents,
            'paymentTypes' => $this->getPaymentTypesStats(),
            'clearanceTypes' => $this->getClearanceTypesStats(),
        ]);
    }

    private function getPaymentTypesStats()
    {
        return Payment::selectRaw('type, COUNT(*) as count, SUM(amount) as total')
            ->whereYear('payment_date', now()->year)
            ->whereMonth('payment_date', now()->month)
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => $item->count,
                    'amount' => number_format($item->total, 2)
                ];
            });
    }

    private function getClearanceTypesStats()
    {
        return Clearance::selectRaw('type, COUNT(*) as count')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => $item->count
                ];
            });
    }
}