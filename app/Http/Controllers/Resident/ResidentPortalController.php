<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use App\Models\Resident;
use App\Models\Clearance;
use App\Models\Payment;
use App\Models\Household;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ResidentPortalController extends Controller
{
    /**
     * Resident dashboard
     */
    public function residentdashboard(Request $request)
    {
        $resident = Resident::where('user_id', Auth::id())
            ->with(['household', 'clearances', 'payments'])
            ->firstOrFail();
        
        // Get recent clearances
        $recentClearances = $resident->clearances()
            ->orderBy('issue_date', 'desc')
            ->take(5)
            ->get();
        
        // Get recent payments
        $recentPayments = $resident->payments()
            ->orderBy('payment_date', 'desc')
            ->take(5)
            ->get();
        
        // Get family members
        $familyMembers = [];
        if ($resident->household_id) {
            $familyMembers = Resident::where('household_id', $resident->household_id)
                ->where('id', '!=', $resident->id)
                ->get();
        }
        
        // Get barangay announcements
        $announcements = Announcement::where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        // Calculate stats
        $stats = [
            'activeClearances' => $resident->clearances()
                ->where('status', 'issued')
                ->where('valid_until', '>=', now())
                ->count(),
            'totalPayments' => $resident->payments()
                ->where('status', 'paid')
                ->sum('amount'),
            'familyMembers' => count($familyMembers),
            'yearsInBarangay' => $resident->created_at->diffInYears(),
        ];
        
        // Upcoming deadlines (payments due)
        $upcomingDeadlines = $resident->payments()
            ->where('status', 'pending')
            ->where('due_date', '>=', now())
            ->orderBy('due_date')
            ->take(3)
            ->get()
            ->map(function ($payment) {
                return [
                    'item' => $payment->type,
                    'dueDate' => $payment->due_date->format('Y-m-d'),
                    'amount' => '₱' . number_format($payment->amount, 2),
                    'status' => $payment->due_date->diffInDays(now()) <= 30 ? 'Upcoming' : 'Future'
                ];
            });
        
        return Inertia::render('Dashboard/Index', [
            'resident' => $resident,
            'recentClearances' => $recentClearances,
            'recentPayments' => $recentPayments,
            'familyMembers' => $familyMembers,
            'announcements' => $announcements,
            'stats' => $stats,
            'upcomingDeadlines' => $upcomingDeadlines,
        ]);
    }
    
    /**
     * Resident profile
     */
    public function profile()
    {
        $resident = Resident::where('user_id', Auth::id())
            ->with(['household'])
            ->firstOrFail();
        
        return Inertia::render('ResidentPortal/Profile', [
            'resident' => $resident,
        ]);
    }
    
    /**
     * Edit resident profile
     */
    public function editProfile()
    {
        $resident = Resident::where('user_id', Auth::id())
            ->firstOrFail();
        
        $puroks = [
            'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4',
            'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8'
        ];
        
        $civilStatuses = [
            'Single', 'Married', 'Widowed', 'Separated', 'Divorced'
        ];
        
        return Inertia::render('ResidentPortal/EditProfile', [
            'resident' => $resident,
            'puroks' => $puroks,
            'civilStatuses' => $civilStatuses,
        ]);
    }
    
    /**
     * Update resident profile
     */
    public function updateProfile(Request $request)
    {
        $resident = Resident::where('user_id', Auth::id())->firstOrFail();
        
        $validated = $request->validate([
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:500',
            'purok' => 'nullable|string|max:50',
            'occupation' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
        ]);
        
        // Only allow updating certain fields
        $resident->update($validated);
        
        // Log the update
        activity()
            ->causedBy(Auth::user())
            ->performedOn($resident)
            ->log('updated their profile');
        
        return redirect()->route('resident.profile')
            ->with('success', 'Profile updated successfully!');
    }
    
    /**
     * View resident documents
     */
    public function documents()
    {
        $resident = Resident::where('user_id', Auth::id())->firstOrFail();
        
        $documents = $resident->clearances()
            ->orderBy('issue_date', 'desc')
            ->paginate(10);
        
        return Inertia::render('ResidentPortal/Documents', [
            'documents' => $documents,
            'resident' => $resident,
        ]);
    }
    
    /**
     * Request new clearance
     */
    public function requestClearance()
    {
        $clearanceTypes = [
            'Business Clearance',
            'Residency Certificate',
            'Good Moral Character',
            'Certificate of Indigency',
            'Non-Derogatory Record',
            'Barangay ID',
            'Other'
        ];
        
        return Inertia::render('ResidentPortal/RequestClearance', [
            'clearanceTypes' => $clearanceTypes,
        ]);
    }
    
    /**
     * Store new clearance request
     */
    public function storeClearance(Request $request)
    {
        $resident = Resident::where('user_id', Auth::id())->firstOrFail();
        
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'purpose' => 'required|string|max:500',
            'requirements_met' => 'nullable|array',
        ]);
        
        $clearance = Clearance::create([
            'resident_id' => $resident->id,
            'type' => $validated['type'],
            'purpose' => $validated['purpose'],
            'requirements_met' => json_encode($validated['requirements_met'] ?? []),
            'status' => 'pending',
            'issue_date' => null,
            'valid_until' => null,
            'fee_amount' => $this->getClearanceFee($validated['type']),
            'issuing_officer' => 'Pending',
        ]);
        
        return redirect()->route('resident.documents')
            ->with('success', 'Clearance request submitted successfully!');
    }
    
    private function getClearanceFee($type)
    {
        $fees = [
            'Business Clearance' => 200,
            'Residency Certificate' => 100,
            'Good Moral Character' => 150,
            'Certificate of Indigency' => 50,
            'Non-Derogatory Record' => 100,
            'Barangay ID' => 50,
            'Other' => 100,
        ];
        
        return $fees[$type] ?? 100;
    }
    
    /**
     * View payment history
     */
    public function paymentHistory()
    {
        $resident = Resident::where('user_id', Auth::id())->firstOrFail();
        
        $payments = $resident->payments()
            ->orderBy('payment_date', 'desc')
            ->paginate(10);
        
        $summary = [
            'total_paid' => $resident->payments()->where('status', 'paid')->sum('amount'),
            'pending_payments' => $resident->payments()->where('status', 'pending')->sum('amount'),
            'payment_methods' => $resident->payments()->distinct('payment_method')->pluck('payment_method'),
        ];
        
        return Inertia::render('ResidentPortal/PaymentHistory', [
            'payments' => $payments,
            'summary' => $summary,
        ]);
    }
    
    /**
     * View family members
     */
    public function family()
    {
        $resident = Resident::where('user_id', Auth::id())
            ->with(['household.members'])
            ->firstOrFail();
        
        $familyMembers = [];
        if ($resident->household) {
            $familyMembers = $resident->household->members()
                ->where('id', '!=', $resident->id)
                ->get();
        }
        
        return Inertia::render('ResidentPortal/Family', [
            'resident' => $resident,
            'familyMembers' => $familyMembers,
            'household' => $resident->household,
        ]);
    }
}