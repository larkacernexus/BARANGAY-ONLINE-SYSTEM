<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\HouseholdMember;
use App\Models\Household;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\Announcement;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ResidentDashboardController extends Controller
{
    public function residentdashboard()
    {
        $user = Auth::user();
        
        // Check if user has a resident profile
        $resident = $user->resident;
        
        if (!$resident) {
            return $this->handleNoResidentProfile($user);
        }
        
        // Get household information - user now has household_id
        $household = null;
        $householdMember = null;
        $isHouseholdHead = false;
        $householdResidentIds = [$resident->id]; // Start with current resident
        
        // Get household from user's household_id
        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident'])->find($user->household_id);
        }
        
        if ($household) {
            // Check if current resident is household head
            $member = $household->householdMembers->firstWhere('resident_id', $resident->id);
            $isHouseholdHead = $member ? $member->is_head : false;
            
            // Get all resident IDs in this household
            $householdResidentIds = $household->householdMembers
                ->pluck('resident_id')
                ->unique()
                ->filter()
                ->values()
                ->toArray();
                
            // Make sure current resident is included
            if (!in_array($resident->id, $householdResidentIds)) {
                $householdResidentIds[] = $resident->id;
            }
        }
        
        $data = $this->getDashboardData($resident, $household, $householdResidentIds, $isHouseholdHead);
        
        return Inertia::render('resident/residentdashboard', $data);
    }

    /**
     * Get all dashboard data for a resident and their household
     */
    private function getDashboardData(Resident $resident, ?Household $household, array $householdResidentIds, bool $isHouseholdHead): array
    {
        return [
            'stats' => $this->getStats($resident, $householdResidentIds, $household),
            'recentActivities' => $this->getRecentActivities($resident, $householdResidentIds),
            'recentPayments' => $this->getRecentPayments($resident, $householdResidentIds),
            'pendingClearances' => $this->getPendingClearances($resident, $householdResidentIds),
            'activeComplaints' => $this->getActiveComplaints($resident, $householdResidentIds),
            'announcements' => $this->getAnnouncements(),
            'paymentSummary' => $this->getPaymentSummary($resident, $householdResidentIds),
            'resident' => $this->getResidentData($resident, $household, $isHouseholdHead),
        ];
    }

    /**
     * Handle case when no resident profile exists
     */
    private function handleNoResidentProfile($user): \Inertia\Response
    {
        return Inertia::render('resident/residentdashboard', [
            'stats' => [
                'total_payments' => 0,
                'total_clearances' => 0,
                'total_complaints' => 0,
                'pending_clearances' => 0,
                'active_complaints' => 0,
                'pending_requests' => 0,
                'household_members' => 0,
            ],
            'recentActivities' => [],
            'recentPayments' => [],
            'pendingClearances' => [],
            'activeComplaints' => [],
            'announcements' => [],
            'paymentSummary' => [],
            'resident' => [
                'id' => null,
                'full_name' => 'Guest Resident',
                'first_name' => 'Guest',
                'last_name' => 'Resident',
                'email' => $user->email,
                'phone_number' => 'N/A',
                'household_number' => 'N/A',
                'zone' => 'N/A',
                'purok' => 'N/A',
                'address' => 'N/A',
                'profile_photo_url' => null,
                'profile_completion' => 0,
                'is_household_head' => false,
                'household_member_count' => 0,
            ],
        ]);
    }

    /**
     * Get dashboard statistics for resident and household
     */
    private function getStats(Resident $resident, array $householdResidentIds, ?Household $household): array
    {
        try {
            // Get household member count
            $householdMemberCount = count($householdResidentIds);
            
            // Get payments for entire household
            $totalPayments = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->count();
            
            // Get clearances for entire household
            $totalClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->count();
                
            $pendingClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment'])
                ->count();
            
            // Get complaints for entire household
            $totalComplaints = Complaint::whereHas('user', function($query) use ($householdResidentIds) {
                $query->whereHas('resident', function($q) use ($householdResidentIds) {
                    $q->whereIn('id', $householdResidentIds);
                });
            })->count();
            
            $activeComplaints = Complaint::whereHas('user', function($query) use ($householdResidentIds) {
                $query->whereHas('resident', function($q) use ($householdResidentIds) {
                    $q->whereIn('id', $householdResidentIds);
                });
            })->whereIn('status', ['pending', 'processing', 'investigating'])
                ->count();
            
            // Calculate pending requests
            $pendingRequests = $pendingClearances + $activeComplaints;
            
            return [
                'total_payments' => $totalPayments,
                'total_clearances' => $totalClearances,
                'total_complaints' => $totalComplaints,
                'pending_clearances' => $pendingClearances,
                'active_complaints' => $activeComplaints,
                'pending_requests' => $pendingRequests,
                'household_members' => $householdMemberCount,
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting dashboard stats: ' . $e->getMessage());
            return [
                'total_payments' => 0,
                'total_clearances' => 0,
                'total_complaints' => 0,
                'pending_clearances' => 0,
                'active_complaints' => 0,
                'pending_requests' => 0,
                'household_members' => 0,
            ];
        }
    }

    /**
     * Get recent activities from all sources for household
     */
    private function getRecentActivities(Resident $resident, array $householdResidentIds): array
    {
        $activities = collect([]);
        
        try {
            // Get recent payments for household (last 3 months)
            $recentPayments = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->whereDate('payment_date', '>=', now()->subMonths(3))
                ->orderBy('payment_date', 'desc')
                ->take(5)
                ->get();

            foreach ($recentPayments as $payment) {
                // Get payer resident info
                $payerResident = Resident::find($payment->payer_id);
                $payerName = $payerResident ? $payerResident->first_name : 'Household Member';
                
                $activities->push([
                    'id' => 'payment-' . $payment->id,
                    'type' => 'payment',
                    'description' => $payerName . ' paid: ' . ($payment->clearance_type ?? 'Barangay Fee'),
                    'status' => $payment->status ?? 'completed',
                    'date' => $payment->payment_date ? $payment->payment_date->toISOString() : now()->toISOString(),
                    'amount' => '₱' . number_format($payment->total_amount ?? 0, 2),
                    'originalId' => $payment->id,
                    'payer_name' => $payerName,
                ]);
            }

            // Get recent clearance requests for household
            $recentClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            foreach ($recentClearances as $clearance) {
                $applicantResident = Resident::find($clearance->resident_id);
                $applicantName = $applicantResident ? $applicantResident->first_name : 'Household Member';
                
                $activities->push([
                    'id' => 'clearance-' . $clearance->id,
                    'type' => 'clearance',
                    'description' => $applicantName . ' requested: ' . ($clearance->clearance_type ? $clearance->clearance_type->name : 'Clearance'),
                    'status' => $clearance->status,
                    'date' => $clearance->created_at->toISOString(),
                    'originalId' => $clearance->id,
                    'applicant_name' => $applicantName,
                ]);
            }

            // Get recent complaints for household
            $recentComplaints = Complaint::whereHas('user', function($query) use ($householdResidentIds) {
                $query->whereHas('resident', function($q) use ($householdResidentIds) {
                    $q->whereIn('id', $householdResidentIds);
                });
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

            foreach ($recentComplaints as $complaint) {
                $complainantUser = $complaint->user;
                $complainantName = $complainantUser ? $complainantUser->name : 'Household Member';
                
                $activities->push([
                    'id' => 'complaint-' . $complaint->id,
                    'type' => 'complaint',
                    'description' => $complainantName . ' filed: ' . ($complaint->subject ?? 'Complaint'),
                    'status' => $complaint->status,
                    'date' => $complaint->created_at->toISOString(),
                    'originalId' => $complaint->id,
                    'complainant_name' => $complainantName,
                ]);
            }

            // Sort by date and limit
            return $activities->sortByDesc('date')
                ->take(8)
                ->values()
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Error getting recent activities: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent payments for household
     */
    private function getRecentPayments(Resident $resident, array $householdResidentIds): array
    {
        try {
            return Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->with(['items', 'items.clearanceRequest'])
                ->whereDate('payment_date', '>=', now()->subMonths(3))
                ->orderBy('payment_date', 'desc')
                ->take(8)
                ->get()
                ->map(function ($payment) {
                    // Get payer info
                    $payerResident = Resident::find($payment->payer_id);
                    
                    return [
                        'id' => $payment->id,
                        'reference_number' => $payment->or_number ?? $payment->reference_number,
                        'amount' => (float) ($payment->total_amount ?? 0),
                        'status' => $payment->status ?? 'completed',
                        'fee_type' => $payment->clearance_type ?? $this->getPaymentFeeType($payment),
                        'payment_date' => $payment->payment_date ? $payment->payment_date->toISOString() : null,
                        'created_at' => $payment->created_at->toISOString(),
                        'payment_method' => $payment->payment_method,
                        'payer_name' => $payerResident ? $payerResident->first_name . ' ' . $payerResident->last_name : 'Household Member',
                        'payer_id' => $payment->payer_id,
                        'is_current_user' => $payerResident && $payerResident->user && $payerResident->user->id === Auth::id(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting recent payments: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get payment fee type from items or clearance type
     */
    private function getPaymentFeeType(Payment $payment): string
    {
        if ($payment->clearance_type) {
            return $this->formatClearanceType($payment->clearance_type);
        }
        
        if ($payment->items && $payment->items->isNotEmpty()) {
            $firstItem = $payment->items->first();
            if ($firstItem->clearanceRequest && $firstItem->clearanceRequest->clearanceType) {
                return $firstItem->clearanceRequest->clearanceType->name;
            }
            return $firstItem->fee_name ?? 'Barangay Fee';
        }
        
        return 'Barangay Fee';
    }

    /**
     * Format clearance type for display
     */
    private function formatClearanceType(string $type): string
    {
        $types = [
            'BRGY_CLEARANCE' => 'Barangay Clearance',
            'BARANGAY_CLEARANCE' => 'Barangay Clearance',
            'BUSINESS_CLEARANCE' => 'Business Clearance',
            'INDIGENCY_CERT' => 'Certificate of Indigency',
            'RESIDENCY_CERT' => 'Certificate of Residency',
            'CEDULA' => 'Cedula',
        ];
        
        return $types[$type] ?? ucwords(strtolower(str_replace('_', ' ', $type)));
    }

    /**
     * Get pending clearance requests for household
     */
    private function getPendingClearances(Resident $resident, array $householdResidentIds): array
    {
        try {
            return ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->with(['clearanceType', 'documents'])
                ->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->map(function ($clearance) {
                    $applicantResident = Resident::find($clearance->resident_id);
                    
                    return [
                        'id' => $clearance->id,
                        'clearance_type' => $clearance->clearanceType ? $clearance->clearanceType->name : 'General Clearance',
                        'purpose' => $clearance->purpose ?? 'No purpose specified',
                        'status' => $clearance->status,
                        'created_at' => $clearance->created_at->toISOString(),
                        'requirements_count' => $clearance->documents ? $clearance->documents->count() : 0,
                        'reference_number' => $clearance->reference_number,
                        'urgency' => $clearance->urgency,
                        'applicant_name' => $applicantResident ? $applicantResident->first_name . ' ' . $applicantResident->last_name : 'Household Member',
                        'applicant_id' => $clearance->resident_id,
                        'is_current_user' => $applicantResident && $applicantResident->user && $applicantResident->user->id === Auth::id(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting pending clearances: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get active complaints for household
     */
    private function getActiveComplaints(Resident $resident, array $householdResidentIds): array
    {
        try {
            return Complaint::whereHas('user', function($query) use ($householdResidentIds) {
                $query->whereHas('resident', function($q) use ($householdResidentIds) {
                    $q->whereIn('id', $householdResidentIds);
                });
            })
            ->with(['type', 'updates'])
            ->whereIn('status', ['pending', 'processing', 'investigating', 'action_taken'])
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($complaint) {
                $complainantUser = $complaint->user;
                $complainantResident = $complainantUser ? $complainantUser->resident : null;
                
                return [
                    'id' => $complaint->id,
                    'subject' => $complaint->subject ?? 'No subject',
                    'complaint_type' => $complaint->type ? $complaint->type->name : 'General Complaint',
                    'status' => $complaint->status,
                    'created_at' => $complaint->created_at->toISOString(),
                    'priority' => $complaint->priority,
                    'complaint_number' => $complaint->complaint_number,
                    'complainant_name' => $complainantUser ? $complainantUser->name : 'Anonymous',
                    'user_id' => $complaint->user_id,
                    'is_current_user' => $complainantUser && $complainantUser->id === Auth::id(),
                ];
            })
            ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting active complaints: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get active announcements (public - same for all)
     */
    private function getAnnouncements(): array
    {
        try {
            return Announcement::where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('start_date')
                        ->orWhere('start_date', '<=', now());
                })
                ->where(function ($query) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                })
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($announcement) {
                    return [
                        'id' => $announcement->id,
                        'title' => $announcement->title ?? 'Announcement',
                        'content' => $announcement->content,
                        'priority' => $announcement->priority,
                        'author' => $announcement->author ?? 'Barangay Official',
                        'created_at' => $announcement->created_at->toISOString(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting announcements: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get payment summary for household for current year
     */
    private function getPaymentSummary(Resident $resident, array $householdResidentIds): array
    {
        try {
            return Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->whereYear('payment_date', now()->year)
                ->selectRaw('
                    CASE 
                        WHEN clearance_type IS NOT NULL THEN clearance_type
                        ELSE "General Fee"
                    END as type,
                    SUM(total_amount) as total,
                    COUNT(*) as count,
                    MAX(status) as status
                ')
                ->groupBy('clearance_type')
                ->get()
                ->map(function ($summary) {
                    return [
                        'type' => $summary->type,
                        'total' => (float) $summary->total,
                        'count' => (int) $summary->count,
                        'status' => $summary->status,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting payment summary: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get resident data for dashboard with household info
     */
    private function getResidentData(Resident $resident, ?Household $household = null, bool $isHouseholdHead = false): array
    {
        $householdMemberCount = 0;
        $householdMembers = [];
        $householdInfo = null;
        
        if ($household) {
            $household->load(['householdMembers.resident']);
            
            $householdMemberCount = $household->householdMembers->count();
            
            // Get household members details
            $householdMembers = $household->householdMembers->map(function ($member) {
                $memberResident = $member->resident;
                $user = $memberResident ? $memberResident->user : null;
                
                return [
                    'id' => $member->resident_id,
                    'full_name' => $memberResident ? $memberResident->full_name : 'Unknown',
                    'first_name' => $memberResident ? $memberResident->first_name : '',
                    'last_name' => $memberResident ? $memberResident->last_name : '',
                    'relationship' => $member->relationship_to_head,
                    'is_head' => $member->is_head,
                    'is_current_user' => $user && $user->id === Auth::id(),
                    'age' => $memberResident ? $memberResident->age : null,
                    'gender' => $memberResident ? $memberResident->gender : null,
                ];
            })->toArray();
            
            $householdInfo = [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'zone' => $household->zone,
                'purok' => $household->purok,
                'address' => $household->address,
            ];
        }
        
        // Get purok name from relationship
        $purokName = null;
        if ($resident->purok_id) {
            $resident->load('purok');
            $purokName = $resident->purok ? $resident->purok->name : null;
        }
        
        // Get user reference
        $user = $resident->user;
        
        return [
            'id' => $resident->id,
            'user_id' => $user ? $user->id : null,
            'full_name' => $resident->full_name,
            'first_name' => $resident->first_name ?? 'Resident',
            'last_name' => $resident->last_name ?? '',
            'middle_name' => $resident->middle_name ?? '',
            'suffix' => $resident->suffix ?? '',
            'email' => $resident->email ?? '',
            'phone_number' => $resident->contact_number ?? $resident->phone_number ?? 'N/A',
            'household_number' => $household ? $household->household_number : 'N/A',
            'zone' => $household ? $household->zone : 'N/A',
            'purok' => $purokName ?? ($household ? $household->purok : 'N/A'),
            'purok_id' => $resident->purok_id,
            'address' => $household ? $household->address : ($resident->address ?? 'N/A'),
            'profile_photo_url' => $resident->photo_path ? asset('storage/' . $resident->photo_path) : null,
            'profile_completion' => $this->calculateProfileCompletion($resident),
            'is_household_head' => $isHouseholdHead,
            'household_member_count' => $householdMemberCount,
            'household_members' => $householdMembers,
            'household' => $householdInfo,
            'household_id' => $household ? $household->id : null,
            'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'occupation' => $resident->occupation,
            'is_voter' => $resident->is_voter,
            'is_pwd' => $resident->is_pwd,
            'is_senior' => $resident->is_senior,
            'status' => $resident->status,
        ];
    }

    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion(Resident $resident): int
    {
        try {
            $fields = [
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'email' => $resident->email,
                'contact_number' => $resident->contact_number,
                'address' => $resident->address,
                'birth_date' => $resident->birth_date,
                'gender' => $resident->gender,
                'civil_status' => $resident->civil_status,
            ];

            $filledFields = 0;
            foreach ($fields as $field => $value) {
                if (!empty($value)) {
                    $filledFields++;
                }
            }

            return min(100, round(($filledFields / count($fields)) * 100));
        } catch (\Exception $e) {
            \Log::error('Error calculating profile completion: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Profile setup for new residents
     */
    public function profileSetup()
    {
        $user = Auth::user();
        
        if ($user->resident) {
            return redirect()->route('resident.dashboard');
        }

        return Inertia::render('Resident/ProfileSetup', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    /**
     * Save initial profile
     */
    public function saveProfileSetup(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'birth_date' => 'required|date',
            'gender' => 'required|string|in:male,female,other',
            'address' => 'required|string|max:500',
        ]);

        $user = Auth::user();
        
        // Create resident record with required fields
        $resident = Resident::create([
            // No user_id since it's now in users table
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $user->email,
            'contact_number' => $validated['contact_number'],
            'birth_date' => $validated['birth_date'],
            'gender' => $validated['gender'],
            'address' => $validated['address'],
            'status' => 'active',
            'civil_status' => 'single',
            'age' => Carbon::parse($validated['birth_date'])->age,
            'is_voter' => false,
            'is_pwd' => false,
            'is_senior' => Carbon::parse($validated['birth_date'])->age >= 60,
        ]);

        // Update user with resident_id
        $user->update([
            'resident_id' => $resident->id,
        ]);

        return redirect()->route('resident.dashboard')
            ->with('success', 'Profile created successfully!');
    }

    public function profile()
    {
        $user = Auth::user();
        
        if (!$user->resident) {
            return redirect()->route('resident.profile-setup');
        }
        
        $resident = $user->resident;
        
        // Get household info from user's household_id
        $household = null;
        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident'])->find($user->household_id);
        }
        
        // Get purok info
        $purokName = null;
        if ($resident->purok_id) {
            $resident->load('purok');
            $purokName = $resident->purok ? $resident->purok->name : null;
        }
        
        return Inertia::render('Resident/Profile', [
            'resident' => [
                'id' => $resident->id,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'suffix' => $resident->suffix,
                'email' => $resident->email,
                'phone_number' => $resident->contact_number,
                'birth_date' => $resident->birth_date?->format('Y-m-d'),
                'age' => $resident->age,
                'gender' => $resident->gender,
                'civil_status' => $resident->civil_status,
                'occupation' => $resident->occupation,
                'address' => $resident->address,
                'profile_photo_url' => $resident->photo_path ? asset('storage/' . $resident->photo_path) : null,
                'purok' => $purokName,
                'purok_id' => $resident->purok_id,
                'is_voter' => $resident->is_voter,
                'is_pwd' => $resident->is_pwd,
                'is_senior' => $resident->is_senior,
                'household' => $household ? [
                    'household_number' => $household->household_number,
                    'zone' => $household->zone,
                    'purok' => $household->purok,
                    'address' => $household->address,
                    'members' => $household->householdMembers->map(function ($member) use ($user) {
                        $memberResident = $member->resident;
                        return [
                            'id' => $member->resident_id,
                            'full_name' => $memberResident ? $memberResident->full_name : 'Unknown',
                            'relationship' => $member->relationship_to_head,
                            'age' => $memberResident ? $memberResident->age : null,
                            'is_head' => $member->is_head,
                            'is_current_user' => $memberResident && $memberResident->user && $memberResident->user->id === $user->id,
                        ];
                    }),
                ] : null,
            ],
        ]);
    }

    /**
     * Get emergency contacts
     */
    public function emergencyContacts()
    {
        return response()->json([
            'data' => [
                ['name' => 'Police', 'number' => '117'],
                ['name' => 'Fire', 'number' => '160'],
                ['name' => 'Ambulance', 'number' => '161'],
                ['name' => 'Barangay', 'number' => '(082) 123-4567'],
            ]
        ]);
    }
    
    /**
     * Quick fix: Create resident record for current user
     */
    public function createResidentRecord()
    {
        $user = Auth::user();
        
        if ($user->resident) {
            return redirect()->route('resident.dashboard')
                ->with('info', 'You already have a resident profile.');
        }
        
        // Create minimal resident record
        $resident = Resident::create([
            'first_name' => $user->name,
            'last_name' => '',
            'email' => $user->email,
            'contact_number' => '',
            'address' => '',
            'status' => 'active',
            'civil_status' => 'single',
            'age' => 0,
            'is_voter' => false,
            'is_pwd' => false,
            'is_senior' => false,
        ]);
        
        // Update user with resident_id
        $user->update([
            'resident_id' => $resident->id,
        ]);
        
        return redirect()->route('resident.dashboard')
            ->with('success', 'Basic profile created. Please update your complete profile.');
    }
}