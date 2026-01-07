<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Payment;
use App\Models\Clearance;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ResidentDashboardController extends Controller
{
    public function residentdashboard()
    {
        // Get authenticated resident
        $resident = Auth::user()->resident;
        
        // If no resident profile found
        if (!$resident) {
            return Inertia::render('resident/residentdashboard', [
                'stats' => [
                    'totalPayments' => 0,
                    'totalClearances' => 0,
                    'totalComplaints' => 0,
                    'pendingRequests' => 0,
                ],
                'recentActivities' => [
                    'recentPayments' => [],
                    'recentClearances' => [],
                    'recentComplaints' => [],
                ],
                'announcements' => [],
                'upcomingEvents' => [],
                'paymentSummary' => [],
                'resident' => [
                    'full_name' => 'N/A',
                    'household_number' => 'N/A',
                    'zone' => 'N/A',
                    'avatar' => null,
                ],
            ]);
        }

        // Get dashboard data
        return Inertia::render('Resident/residents/residentdashboard', [
            'stats' => [
                'totalPayments' => Payment::where('resident_id', $resident->id)->count(),
                'totalClearances' => Clearance::where('resident_id', $resident->id)->count(),
                'totalComplaints' => Complaint::where('resident_id', $resident->id)->count(),
                'pendingRequests' => Clearance::where('resident_id', $resident->id)
                    ->where('status', 'pending')->count(),
            ],
            
            'recentActivities' => [
                'recentPayments' => Payment::where('resident_id', $resident->id)
                    ->latest()
                    ->take(5)
                    ->get(),
                'recentClearances' => Clearance::where('resident_id', $resident->id)
                    ->latest()
                    ->take(5)
                    ->get(),
                'recentComplaints' => Complaint::where('resident_id', $resident->id)
                    ->latest()
                    ->take(5)
                    ->get(),
            ],
            
            'announcements' => Announcement::where('is_active', true)
                ->whereDate('start_date', '<=', now())
                ->whereDate('end_date', '>=', now())
                ->orderBy('priority', 'desc')
                ->latest()
                ->take(5)
                ->get(),
                
            'upcomingEvents' => Event::where('is_active', true)
                ->whereDate('event_date', '>=', now())
                ->orderBy('event_date')
                ->take(3)
                ->get(),
                
            'paymentSummary' => Payment::where('resident_id', $resident->id)
                ->whereYear('payment_date', now()->year)
                ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
                
            'resident' => [
                'full_name' => $resident->full_name,
                'household_number' => $resident->household?->household_number,
                'zone' => $resident->household?->zone,
                'avatar' => $resident->profile_photo_url,
            ],
        ]);
    }

    public function profile()
    {
        $resident = Auth::user()->resident->load(['household']);
        return Inertia::render('Resident/Dashboard/Profile', [
            'resident' => $resident,
        ]);
    }
}