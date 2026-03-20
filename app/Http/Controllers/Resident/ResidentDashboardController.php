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
use App\Models\Privilege;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ResidentDashboardController extends Controller
{
    /**
     * Get all active privileges - DYNAMIC FROM DATABASE
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges', 3600, function () {
            return Privilege::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description'])
                ->map(function ($privilege) {
                    return [
                        'id' => $privilege->id,
                        'name' => $privilege->name,
                        'code' => $privilege->code,
                        'description' => $privilege->description,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get resident's active privileges - DYNAMIC
     */
    private function getResidentPrivileges(Resident $resident): array
    {
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege');
        }

        return $resident->residentPrivileges
            ->filter(function ($rp) {
                return $rp->isActive();
            })
            ->map(function ($rp) {
                $privilege = $rp->privilege;
                return [
                    'id' => $rp->id,
                    'privilege_id' => $privilege->id,
                    'code' => $privilege->code,
                    'name' => $privilege->name,
                    'id_number' => $rp->id_number,
                    'verified_at' => $rp->verified_at?->toISOString(),
                    'expires_at' => $rp->expires_at?->toISOString(),
                ];
            })
            ->values()
            ->toArray();
    }

    public function residentdashboard()
    {
        $user = Auth::user();
        
        // Get all privileges from database - NO HARDCODING
        $allPrivileges = $this->getAllPrivileges();
        
        $resident = $user->resident;
        
        if (!$resident) {
            return $this->handleNoResidentProfile($user, $allPrivileges);
        }
        
        // Load privileges
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege');
        }
        
        $household = null;
        $isHouseholdHead = false;
        $householdResidentIds = [$resident->id];
        
        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege'])->find($user->household_id);
        }
        
        if ($household) {
            $member = $household->householdMembers->firstWhere('resident_id', $resident->id);
            $isHouseholdHead = $member ? $member->is_head : false;
            
            $householdResidentIds = $household->householdMembers
                ->pluck('resident_id')
                ->unique()
                ->filter()
                ->push($resident->id)
                ->unique()
                ->values()
                ->toArray();
        }
        
        $data = $this->getDashboardData($resident, $household, $householdResidentIds, $isHouseholdHead, $allPrivileges);
        $data['allPrivileges'] = $allPrivileges;
        
        return Inertia::render('resident/residentdashboard', $data);
    }

    private function getDashboardData(Resident $resident, ?Household $household, array $householdResidentIds, bool $isHouseholdHead, array $allPrivileges): array
    {
        return [
            'stats' => $this->getStats($resident, $householdResidentIds, $household, $allPrivileges),
            'recentActivities' => $this->getRecentActivities($resident, $householdResidentIds, $allPrivileges),
            'recentPayments' => $this->getRecentPayments($resident, $householdResidentIds, $allPrivileges),
            'pendingClearances' => $this->getPendingClearances($resident, $householdResidentIds, $allPrivileges),
            'activeComplaints' => $this->getActiveComplaints($resident, $householdResidentIds, $allPrivileges),
            'announcements' => $this->getAnnouncements($allPrivileges),
            'paymentSummary' => $this->getPaymentSummary($resident, $householdResidentIds, $allPrivileges),
            'resident' => $this->getResidentData($resident, $household, $isHouseholdHead, $allPrivileges),
        ];
    }

    private function handleNoResidentProfile($user, array $allPrivileges): \Inertia\Response
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
                'privileges_count' => 0,
                'has_privileges' => false,
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
                'privileges' => [],
                'privileges_count' => 0,
                'has_privileges' => false,
            ],
            'allPrivileges' => $allPrivileges,
        ]);
    }

    private function getStats(Resident $resident, array $householdResidentIds, ?Household $household, array $allPrivileges): array
    {
        try {
            $householdMemberCount = count($householdResidentIds);
            
            $totalPayments = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->count();
            
            $totalClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)->count();
            $pendingClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment'])
                ->count();
            
            $totalComplaints = Complaint::whereHas('user.resident', fn($q) => $q->whereIn('id', $householdResidentIds))->count();
            $activeComplaints = Complaint::whereHas('user.resident', fn($q) => $q->whereIn('id', $householdResidentIds))
                ->whereIn('status', ['pending', 'processing', 'investigating'])->count();
            
            $pendingRequests = $pendingClearances + $activeComplaints;
            $activePrivileges = $this->getResidentPrivileges($resident);
            
            return [
                'total_payments' => $totalPayments,
                'total_clearances' => $totalClearances,
                'total_complaints' => $totalComplaints,
                'pending_clearances' => $pendingClearances,
                'active_complaints' => $activeComplaints,
                'pending_requests' => $pendingRequests,
                'household_members' => $householdMemberCount,
                'privileges_count' => count($activePrivileges),
                'has_privileges' => count($activePrivileges) > 0,
                'privileges' => $activePrivileges,
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
                'privileges_count' => 0,
                'has_privileges' => false,
                'privileges' => [],
            ];
        }
    }

    private function getRecentActivities(Resident $resident, array $householdResidentIds, array $allPrivileges): array
    {
        $activities = collect([]);
        
        try {
            // Payments
            $recentPayments = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->whereDate('payment_date', '>=', now()->subMonths(3))
                ->orderBy('payment_date', 'desc')
                ->take(5)
                ->get()
                ->map(function ($payment) use ($allPrivileges) {
                    $payerResident = Resident::with(['residentPrivileges.privilege'])->find($payment->payer_id);
                    
                    return [
                        'id' => 'payment-' . $payment->id,
                        'type' => 'payment',
                        'description' => ($payerResident?->first_name ?? 'Household Member') . ' paid: ' . ($payment->clearance_type ?? 'Barangay Fee'),
                        'status' => $payment->status ?? 'completed',
                        'date' => $payment->payment_date?->toISOString() ?? now()->toISOString(),
                        'amount' => '₱' . number_format($payment->total_amount ?? 0, 2),
                        'originalId' => $payment->id,
                        'payer_name' => $payerResident?->first_name ?? 'Household Member',
                        'privileges' => $payerResident ? $this->getResidentPrivileges($payerResident) : [],
                    ];
                });

            // Clearances
            $recentClearances = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($clearance) use ($allPrivileges) {
                    $applicantResident = Resident::with(['residentPrivileges.privilege'])->find($clearance->resident_id);
                    
                    return [
                        'id' => 'clearance-' . $clearance->id,
                        'type' => 'clearance',
                        'description' => ($applicantResident?->first_name ?? 'Household Member') . ' requested: ' . ($clearance->clearanceType?->name ?? 'Clearance'),
                        'status' => $clearance->status,
                        'date' => $clearance->created_at->toISOString(),
                        'originalId' => $clearance->id,
                        'applicant_name' => $applicantResident?->first_name ?? 'Household Member',
                        'privileges' => $applicantResident ? $this->getResidentPrivileges($applicantResident) : [],
                    ];
                });

            // Complaints
            $recentComplaints = Complaint::whereHas('user.resident', fn($q) => $q->whereIn('id', $householdResidentIds))
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($complaint) use ($allPrivileges) {
                    $complainantUser = $complaint->user;
                    $complainantResident = $complainantUser?->resident;
                    
                    return [
                        'id' => 'complaint-' . $complaint->id,
                        'type' => 'complaint',
                        'description' => ($complainantUser?->name ?? 'Household Member') . ' filed: ' . ($complaint->subject ?? 'Complaint'),
                        'status' => $complaint->status,
                        'date' => $complaint->created_at->toISOString(),
                        'originalId' => $complaint->id,
                        'complainant_name' => $complainantUser?->name ?? 'Household Member',
                        'privileges' => $complainantResident ? $this->getResidentPrivileges($complainantResident) : [],
                    ];
                });

            return $activities->concat($recentPayments)
                ->concat($recentClearances)
                ->concat($recentComplaints)
                ->sortByDesc('date')
                ->take(8)
                ->values()
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Error getting recent activities: ' . $e->getMessage());
            return [];
        }
    }

    private function getRecentPayments(Resident $resident, array $householdResidentIds, array $allPrivileges): array
    {
        try {
            return Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->with(['items', 'items.clearanceRequest'])
                ->whereDate('payment_date', '>=', now()->subMonths(3))
                ->orderBy('payment_date', 'desc')
                ->take(8)
                ->get()
                ->map(function ($payment) use ($allPrivileges) {
                    $payerResident = Resident::with(['residentPrivileges.privilege'])->find($payment->payer_id);
                    
                    return [
                        'id' => $payment->id,
                        'reference_number' => $payment->or_number ?? $payment->reference_number,
                        'amount' => (float) ($payment->total_amount ?? 0),
                        'status' => $payment->status ?? 'completed',
                        'fee_type' => $payment->clearance_type ?? $this->getPaymentFeeType($payment),
                        'payment_date' => $payment->payment_date?->toISOString(),
                        'created_at' => $payment->created_at->toISOString(),
                        'payment_method' => $payment->payment_method,
                        'payer_name' => $payerResident ? $payerResident->first_name . ' ' . $payerResident->last_name : 'Household Member',
                        'payer_id' => $payment->payer_id,
                        'is_current_user' => $payerResident && $payerResident->user && $payerResident->user->id === Auth::id(),
                        'privileges' => $payerResident ? $this->getResidentPrivileges($payerResident) : [],
                        'has_privileges' => $payerResident && $payerResident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count() > 0,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting recent payments: ' . $e->getMessage());
            return [];
        }
    }

    private function getPaymentFeeType(Payment $payment): string
    {
        if ($payment->clearance_type) {
            return str_replace('_', ' ', ucwords(strtolower($payment->clearance_type)));
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

    private function getPendingClearances(Resident $resident, array $householdResidentIds, array $allPrivileges): array
    {
        try {
            return ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->with(['clearanceType', 'documents', 'resident.residentPrivileges.privilege'])
                ->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->map(function ($clearance) use ($allPrivileges) {
                    $applicantResident = $clearance->resident;
                    
                    return [
                        'id' => $clearance->id,
                        'clearance_type' => $clearance->clearanceType?->name ?? 'General Clearance',
                        'purpose' => $clearance->purpose ?? 'No purpose specified',
                        'status' => $clearance->status,
                        'created_at' => $clearance->created_at->toISOString(),
                        'requirements_count' => $clearance->documents?->count() ?? 0,
                        'reference_number' => $clearance->reference_number,
                        'urgency' => $clearance->urgency,
                        'applicant_name' => $applicantResident ? $applicantResident->first_name . ' ' . $applicantResident->last_name : 'Household Member',
                        'applicant_id' => $clearance->resident_id,
                        'is_current_user' => $applicantResident && $applicantResident->user && $applicantResident->user->id === Auth::id(),
                        'privileges' => $applicantResident ? $this->getResidentPrivileges($applicantResident) : [],
                        'has_privileges' => $applicantResident && $applicantResident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count() > 0,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting pending clearances: ' . $e->getMessage());
            return [];
        }
    }

    private function getActiveComplaints(Resident $resident, array $householdResidentIds, array $allPrivileges): array
    {
        try {
            return Complaint::whereHas('user.resident', fn($q) => $q->whereIn('id', $householdResidentIds))
                ->with(['type', 'updates', 'user.resident.residentPrivileges.privilege'])
                ->whereIn('status', ['pending', 'processing', 'investigating', 'action_taken'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->map(function ($complaint) use ($allPrivileges) {
                    $complainantUser = $complaint->user;
                    $complainantResident = $complainantUser?->resident;
                    
                    return [
                        'id' => $complaint->id,
                        'subject' => $complaint->subject ?? 'No subject',
                        'complaint_type' => $complaint->type?->name ?? 'General Complaint',
                        'status' => $complaint->status,
                        'created_at' => $complaint->created_at->toISOString(),
                        'priority' => $complaint->priority,
                        'complaint_number' => $complaint->complaint_number,
                        'complainant_name' => $complainantUser?->name ?? 'Anonymous',
                        'user_id' => $complaint->user_id,
                        'is_current_user' => $complainantUser && $complainantUser->id === Auth::id(),
                        'privileges' => $complainantResident ? $this->getResidentPrivileges($complainantResident) : [],
                        'has_privileges' => $complainantResident && $complainantResident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count() > 0,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting active complaints: ' . $e->getMessage());
            return [];
        }
    }

    private function getAnnouncements(array $allPrivileges): array
    {
        try {
            return Announcement::where('is_active', true)
                ->where(fn($q) => $q->whereNull('start_date')->orWhere('start_date', '<=', now()))
                ->where(fn($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', now()))
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(fn($a) => [
                    'id' => $a->id,
                    'title' => $a->title ?? 'Announcement',
                    'content' => $a->content,
                    'priority' => $a->priority,
                    'author' => $a->author ?? 'Barangay Official',
                    'created_at' => $a->created_at->toISOString(),
                ])
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting announcements: ' . $e->getMessage());
            return [];
        }
    }

    private function getPaymentSummary(Resident $resident, array $householdResidentIds, array $allPrivileges): array
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
                ->map(fn($s) => [
                    'type' => $s->type,
                    'total' => (float) $s->total,
                    'count' => (int) $s->count,
                    'status' => $s->status,
                    'formatted_type' => str_replace('_', ' ', ucwords(strtolower($s->type))),
                ])
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting payment summary: ' . $e->getMessage());
            return [];
        }
    }

    private function getResidentData(Resident $resident, ?Household $household = null, bool $isHouseholdHead = false, array $allPrivileges = []): array
    {
        $activePrivileges = $this->getResidentPrivileges($resident);
        
        $data = [
            'id' => $resident->id,
            'user_id' => $resident->user?->id,
            'full_name' => $resident->full_name,
            'first_name' => $resident->first_name ?? 'Resident',
            'last_name' => $resident->last_name ?? '',
            'middle_name' => $resident->middle_name ?? '',
            'suffix' => $resident->suffix ?? '',
            'email' => $resident->email ?? '',
            'phone_number' => $resident->contact_number ?? $resident->phone_number ?? 'N/A',
            'birth_date' => $resident->birth_date?->format('Y-m-d'),
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'occupation' => $resident->occupation,
            'is_voter' => $resident->is_voter,
            'status' => $resident->status,
            'profile_photo_url' => $resident->photo_path ? asset('storage/' . $resident->photo_path) : null,
            'profile_completion' => $this->calculateProfileCompletion($resident),
            'is_household_head' => $isHouseholdHead,
            
            // DYNAMIC privilege data - NO HARDCODING
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ];

        // DYNAMICALLY create flags for EVERY privilege
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $data["is_{$code}"] = true;
            $data["has_{$code}"] = true;
            $data["{$code}_id_number"] = $priv['id_number'];
        }

        if ($household) {
            $household->load(['householdMembers.resident.residentPrivileges.privilege']);
            
            $data['household_number'] = $household->household_number;
            $data['zone'] = $household->zone;
            $data['purok'] = $household->purok;
            $data['address'] = $household->address;
            $data['household_id'] = $household->id;
            $data['household_member_count'] = $household->householdMembers->count();
            
            $data['household_members'] = $household->householdMembers
                ->map(function ($member) use ($allPrivileges) {
                    $mr = $member->resident;
                    if (!$mr) return null;
                    
                    $memberPrivileges = $this->getResidentPrivileges($mr);
                    
                    $memberData = [
                        'id' => $member->resident_id,
                        'full_name' => $mr->full_name,
                        'first_name' => $mr->first_name,
                        'last_name' => $mr->last_name,
                        'relationship' => $member->relationship_to_head,
                        'is_head' => $member->is_head,
                        'is_current_user' => $mr->user && $mr->user->id === Auth::id(),
                        'age' => $mr->age,
                        'gender' => $mr->gender,
                        'privileges' => $memberPrivileges,
                        'has_privileges' => count($memberPrivileges) > 0,
                    ];
                    
                    // DYNAMIC flags for each member
                    foreach ($memberPrivileges as $priv) {
                        $code = strtolower($priv['code']);
                        $memberData["is_{$code}"] = true;
                    }
                    
                    return $memberData;
                })
                ->filter()
                ->values()
                ->toArray();
                
            $data['household'] = [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'zone' => $household->zone,
                'purok' => $household->purok,
                'address' => $household->address,
            ];
        } else {
            $data['household_number'] = 'N/A';
            $data['zone'] = 'N/A';
            $data['purok'] = $resident->purok?->name ?? 'N/A';
            $data['purok_id'] = $resident->purok_id;
            $data['address'] = $resident->address ?? 'N/A';
            $data['household_member_count'] = 0;
            $data['household_members'] = [];
        }

        return $data;
    }

    private function calculateProfileCompletion(Resident $resident): int
    {
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

        $filled = count(array_filter($fields));
        return (int) round(($filled / count($fields)) * 100);
    }

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
        
        $resident = Resident::create([
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
        ]);

        $user->update(['resident_id' => $resident->id]);

        return redirect()->route('resident.dashboard')
            ->with('success', 'Profile created successfully!');
    }

    public function profile()
    {
        $user = Auth::user();
        
        if (!$user->resident) {
            return redirect()->route('resident.profile-setup');
        }
        
        $allPrivileges = $this->getAllPrivileges();
        $resident = $user->resident;
        
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege');
        }
        
        $activePrivileges = $this->getResidentPrivileges($resident);
        
        $data = [
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
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'is_voter' => $resident->is_voter,
            
            // DYNAMIC privilege data
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ];

        // DYNAMIC flags
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $data["is_{$code}"] = true;
            $data["{$code}_id_number"] = $priv['id_number'];
        }

        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege'])->find($user->household_id);
            
            if ($household) {
                $data['household'] = [
                    'household_number' => $household->household_number,
                    'zone' => $household->zone,
                    'purok' => $household->purok,
                    'address' => $household->address,
                    'members' => $household->householdMembers
                        ->map(function ($member) use ($user, $allPrivileges) {
                            $mr = $member->resident;
                            if (!$mr) return null;
                            
                            $memberPrivileges = $this->getResidentPrivileges($mr);
                            
                            $memberData = [
                                'id' => $member->resident_id,
                                'full_name' => $mr->full_name,
                                'relationship' => $member->relationship_to_head,
                                'age' => $mr->age,
                                'is_head' => $member->is_head,
                                'is_current_user' => $mr->user && $mr->user->id === $user->id,
                                'privileges' => $memberPrivileges,
                                'has_privileges' => count($memberPrivileges) > 0,
                            ];
                            
                            foreach ($memberPrivileges as $priv) {
                                $code = strtolower($priv['code']);
                                $memberData["is_{$code}"] = true;
                            }
                            
                            return $memberData;
                        })
                        ->filter()
                        ->values()
                        ->toArray(),
                ];
            }
        }

        return Inertia::render('Resident/Profile', [
            'resident' => $data,
            'allPrivileges' => $allPrivileges,
        ]);
    }

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
    
    public function createResidentRecord()
    {
        $user = Auth::user();
        
        if ($user->resident) {
            return redirect()->route('resident.dashboard')
                ->with('info', 'You already have a resident profile.');
        }
        
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
        ]);
        
        $user->update(['resident_id' => $resident->id]);
        
        return redirect()->route('resident.dashboard')
            ->with('success', 'Basic profile created. Please update your complete profile.');
    }
}