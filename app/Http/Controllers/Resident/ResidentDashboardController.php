<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\Announcement;
use App\Models\Privilege;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResidentDashboardController extends Controller
{
    /**
     * Get all active privileges - DYNAMIC FROM DATABASE
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges', 3600, function () {
            return Privilege::with('discountType')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
                ->map(function ($privilege) {
                    return [
                        'id' => $privilege->id,
                        'name' => $privilege->name,
                        'code' => $privilege->code,
                        'description' => $privilege->description,
                        'discount_type_id' => $privilege->discount_type_id,
                        'default_discount_percentage' => (float) ($privilege->discountType?->percentage ?? 0),
                        'discount_type' => $privilege->discountType ? [
                            'id' => $privilege->discountType->id,
                            'code' => $privilege->discountType->code,
                            'name' => $privilege->discountType->name,
                            'percentage' => (float) $privilege->discountType->percentage,
                            'requires_id_number' => (bool) $privilege->discountType->requires_id_number,
                            'requires_verification' => (bool) $privilege->discountType->requires_verification,
                            'verification_document' => $privilege->discountType->verification_document,
                            'validity_days' => $privilege->discountType->validity_days,
                        ] : null,
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
            $resident->load('residentPrivileges.privilege.discountType');
        }

        return $resident->residentPrivileges
            ->filter(function ($rp) {
                return $rp->isActive();
            })
            ->map(function ($rp) {
                $privilege = $rp->privilege;
                $discountPercentage = $rp->discount_percentage 
                    ?? $privilege->discountType?->percentage 
                    ?? 0;
                
                return [
                    'id' => $rp->id,
                    'privilege_id' => $privilege->id,
                    'code' => $privilege->code,
                    'name' => $privilege->name,
                    'id_number' => $rp->id_number,
                    'discount_percentage' => (float) $discountPercentage,
                    'verified_at' => $rp->verified_at?->toISOString(),
                    'expires_at' => $rp->expires_at?->toISOString(),
                    'status' => $this->getPrivilegeStatus($rp),
                    'discount_type' => $privilege->discountType ? [
                        'id' => $privilege->discountType->id,
                        'code' => $privilege->discountType->code,
                        'name' => $privilege->discountType->name,
                        'percentage' => (float) $privilege->discountType->percentage,
                    ] : null,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get privilege status based on expiry
     */
    private function getPrivilegeStatus($residentPrivilege): string
    {
        if (!$residentPrivilege->verified_at) {
            return 'pending';
        }
        
        if ($residentPrivilege->expires_at) {
            $daysUntilExpiry = Carbon::now()->diffInDays($residentPrivilege->expires_at, false);
            
            if ($daysUntilExpiry <= 0) {
                return 'expired';
            }
            
            if ($daysUntilExpiry <= 30) {
                return 'expiring_soon';
            }
        }
        
        return 'active';
    }

    /**
     * Get banner slides from database
     */
    private function getBannerSlides(): array
    {
        try {
            $banners = Banner::active()
                ->ordered()
                ->take(5)
                ->get();
            
            if ($banners->isEmpty()) {
                return [];
            }
            
            return $banners->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'image' => $banner->image_url,
                    'mobileImage' => $banner->mobile_image_url,
                    'title' => $banner->title,
                    'description' => $banner->description,
                    'link' => $banner->link_url,
                    'buttonText' => $banner->button_text ?? 'Learn More',
                    'alt' => $banner->alt_text ?? $banner->title,
                ];
            })->toArray();
            
        } catch (\Exception $e) {
            \Log::error('Error getting banners: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get upcoming events
     */
    private function getUpcomingEvents(): array
    {
        try {
            if (!class_exists('\App\Models\Event')) {
                return [];
            }
            
            $user = Auth::user();
            
            return \App\Models\Event::where('is_active', true)
                ->where('event_date', '>=', now())
                ->when($user && $user->resident, function ($query) use ($user) {
                    if (method_exists(\App\Models\Event::class, 'visibleToUser')) {
                        return $query->visibleToUser($user);
                    }
                    return $query;
                })
                ->orderBy('event_date', 'asc')
                ->take(3)
                ->get()
                ->map(function ($e) {
                    return [
                        'id' => $e->id,
                        'title' => $e->title,
                        'description' => $this->createExcerpt($e->description ?? '', 80),
                        'event_date' => $e->event_date->toISOString(),
                        'start_time' => $e->start_time,
                        'end_time' => $e->end_time,
                        'location' => $e->location,
                        'type' => $e->type ?? 'event',
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting upcoming events: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Create excerpt from content
     */
    private function createExcerpt($content, $length = 100): string
    {
        if (empty($content)) {
            return '';
        }
        
        $content = strip_tags($content);
        if (strlen($content) <= $length) {
            return $content;
        }
        return substr($content, 0, $length) . '...';
    }

    /**
     * Get date range from filter - SERVER SIDE
     */
    private function getDateRangeFromFilter(?string $filter): ?array
    {
        if (!$filter || $filter === 'all') {
            return null;
        }
        
        $now = Carbon::now();
        
        switch ($filter) {
            case 'today':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'week':
                return [
                    'start' => $now->copy()->subDays(7)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'month':
                return [
                    'start' => $now->copy()->subDays(30)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'year':
                return [
                    'start' => $now->copy()->subDays(365)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            default:
                return null;
        }
    }

    /**
     * Get previous period date range for trend calculation
     */
    private function getPreviousPeriodRange(string $filter): ?array
    {
        $now = Carbon::now();
        
        switch ($filter) {
            case 'today':
                return [
                    'start' => $now->copy()->subDay()->startOfDay(),
                    'end' => $now->copy()->subDay()->endOfDay(),
                ];
            case 'week':
                return [
                    'start' => $now->copy()->subDays(14)->startOfDay(),
                    'end' => $now->copy()->subDays(7)->endOfDay(),
                ];
            case 'month':
                return [
                    'start' => $now->copy()->subDays(60)->startOfDay(),
                    'end' => $now->copy()->subDays(30)->endOfDay(),
                ];
            case 'year':
                return [
                    'start' => $now->copy()->subDays(730)->startOfDay(),
                    'end' => $now->copy()->subDays(365)->endOfDay(),
                ];
            default:
                return null;
        }
    }

    /**
     * Calculate percentage change between two periods
     */
    private function calculatePercentageChange(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return (($current - $previous) / $previous) * 100;
    }

    /**
     * Main dashboard method
     */
    public function residentdashboard(Request $request)
    {
        $user = Auth::user();
        
        // Get date filter from request (default to 'week')
        $dateFilter = $request->input('date_filter', 'week');
        
        // Get date range based on filter
        $dateRange = $this->getDateRangeFromFilter($dateFilter);
        $previousRange = $this->getPreviousPeriodRange($dateFilter);
        
        // Get all privileges from database
        $allPrivileges = $this->getAllPrivileges();
        
        $resident = $user->resident;
        
        if (!$resident) {
            return $this->handleNoResidentProfile($user, $allPrivileges, $dateFilter);
        }
        
        // Load privileges
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege.discountType');
        }
        
        $household = null;
        $isHouseholdHead = false;
        $householdResidentIds = [$resident->id];
        
        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege.discountType'])->find($user->household_id);
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
        
        // Get all data with server-side filtering
        $stats = $this->getStats($householdResidentIds, $dateRange, $previousRange);
        $recentPayments = $this->getRecentPayments($householdResidentIds, $dateRange);
        $pendingClearances = $this->getPendingClearances($householdResidentIds, $dateRange);
        $recentActivities = $this->getRecentActivities($householdResidentIds, $dateRange);
        $paymentSummary = $this->getPaymentSummary($householdResidentIds, $dateRange);
        
        return Inertia::render('resident/residentdashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'recentPayments' => $recentPayments,
            'pendingClearances' => $pendingClearances,
            'announcements' => $this->getAnnouncements($allPrivileges),
            'paymentSummary' => $paymentSummary,
            'resident' => $this->getResidentData($resident, $household, $isHouseholdHead, $allPrivileges),
            'allPrivileges' => $allPrivileges,
            'bannerSlides' => $this->getBannerSlides(),
            'upcomingEvents' => $this->getUpcomingEvents(),
            'dateFilter' => $dateFilter,
        ]);
    }

    private function handleNoResidentProfile($user, array $allPrivileges, string $dateFilter = 'week'): \Inertia\Response
    {
        return Inertia::render('resident/residentdashboard', [
            'stats' => [
                'total_payments' => 0,
                'total_payments_amount' => 0,
                'total_clearances' => 0,
                'total_complaints' => 0,
                'pending_clearances' => 0,
                'pending_requests' => 0,
                'household_members' => 0,
                'percentage_change' => 0,
                'trend' => 'neutral',
            ],
            'recentActivities' => [],
            'recentPayments' => [],
            'pendingClearances' => [],
            'announcements' => $this->getPublicAnnouncements(),
            'paymentSummary' => [],
            'upcomingEvents' => $this->getUpcomingEvents(),
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
            'bannerSlides' => $this->getBannerSlides(),
            'dateFilter' => $dateFilter,
        ]);
    }

    /**
     * Get stats with server-side filtering
     */
    private function getStats(array $householdResidentIds, ?array $dateRange, ?array $previousRange = null): array
    {
        try {
            // Current period stats
            $paymentsQuery = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident');
            
            if ($dateRange) {
                $paymentsQuery->whereBetween('payment_date', [$dateRange['start'], $dateRange['end']]);
            }
            
            $totalPayments = $paymentsQuery->count();
            $totalPaymentsAmount = (float) $paymentsQuery->sum('total_amount');
            
            $clearancesQuery = ClearanceRequest::whereIn('resident_id', $householdResidentIds);
            
            if ($dateRange) {
                $clearancesQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }
            
            $totalClearances = $clearancesQuery->count();
            $pendingClearances = $clearancesQuery->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment'])->count();
            
            $totalComplaints = 0;
            if (class_exists('\App\Models\Complaint')) {
                $complaintsQuery = \App\Models\Complaint::whereIn('resident_id', $householdResidentIds);
                if ($dateRange) {
                    $complaintsQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
                $totalComplaints = $complaintsQuery->count();
            }
            
            // Calculate trend percentage
            $percentageChange = 0;
            $trend = 'neutral';
            
            if ($previousRange && $dateRange && $dateRange['start']) {
                $previousPaymentsQuery = Payment::whereIn('payer_id', $householdResidentIds)
                    ->where('payer_type', 'resident')
                    ->whereBetween('payment_date', [$previousRange['start'], $previousRange['end']]);
                
                $previousAmount = (float) $previousPaymentsQuery->sum('total_amount');
                $percentageChange = $this->calculatePercentageChange($totalPaymentsAmount, $previousAmount);
                $trend = $percentageChange > 0 ? 'up' : ($percentageChange < 0 ? 'down' : 'neutral');
            }
            
            return [
                'total_payments' => $totalPayments,
                'total_payments_amount' => $totalPaymentsAmount,
                'total_clearances' => $totalClearances,
                'total_complaints' => $totalComplaints,
                'pending_clearances' => $pendingClearances,
                'pending_requests' => $pendingClearances,
                'household_members' => count($householdResidentIds),
                'percentage_change' => round($percentageChange, 1),
                'trend' => $trend,
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting dashboard stats: ' . $e->getMessage());
            return [
                'total_payments' => 0,
                'total_payments_amount' => 0,
                'total_clearances' => 0,
                'total_complaints' => 0,
                'pending_clearances' => 0,
                'pending_requests' => 0,
                'household_members' => 0,
                'percentage_change' => 0,
                'trend' => 'neutral',
            ];
        }
    }

    /**
     * Get recent activities with server-side filtering
     */
    private function getRecentActivities(array $householdResidentIds, ?array $dateRange): array
    {
        $activities = collect([]);
        
        try {
            $paymentsQuery = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident');
            
            if ($dateRange) {
                $paymentsQuery->whereBetween('payment_date', [$dateRange['start'], $dateRange['end']]);
            }
            
            $recentPayments = $paymentsQuery
                ->orderBy('payment_date', 'desc')
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    $payerResident = Resident::find($payment->payer_id);
                    
                    return [
                        'id' => 'payment-' . $payment->id,
                        'type' => 'payment',
                        'description' => ($payerResident?->first_name ?? 'Household Member') . ' paid: ' . ($payment->clearance_type ?? 'Barangay Fee'),
                        'status' => $payment->status ?? 'completed',
                        'date' => $payment->payment_date?->toISOString() ?? now()->toISOString(),
                        'amount' => '₱' . number_format($payment->total_amount ?? 0, 2),
                        'originalId' => $payment->id,
                        'payer_name' => $payerResident?->first_name ?? 'Household Member',
                    ];
                });

            $clearancesQuery = ClearanceRequest::whereIn('resident_id', $householdResidentIds);
            
            if ($dateRange) {
                $clearancesQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }
            
            $recentClearances = $clearancesQuery
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($clearance) {
                    $applicantResident = Resident::find($clearance->resident_id);
                    
                    return [
                        'id' => 'clearance-' . $clearance->id,
                        'type' => 'clearance',
                        'description' => ($applicantResident?->first_name ?? 'Household Member') . ' requested: ' . ($clearance->clearanceType?->name ?? 'Clearance'),
                        'status' => $clearance->status,
                        'date' => $clearance->created_at->toISOString(),
                        'originalId' => $clearance->id,
                        'applicant_name' => $applicantResident?->first_name ?? 'Household Member',
                    ];
                });

            return $activities->concat($recentPayments)
                ->concat($recentClearances)
                ->sortByDesc('date')
                ->take(8)
                ->values()
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Error getting recent activities: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent payments with server-side filtering
     */
    private function getRecentPayments(array $householdResidentIds, ?array $dateRange): array
    {
        try {
            $paymentsQuery = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident')
                ->with(['items', 'items.clearanceRequest']);
            
            if ($dateRange) {
                $paymentsQuery->whereBetween('payment_date', [$dateRange['start'], $dateRange['end']]);
            }
            
            return $paymentsQuery
                ->orderBy('payment_date', 'desc')
                ->take(8)
                ->get()
                ->map(function ($payment) {
                    $payerResident = Resident::find($payment->payer_id);
                    
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
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting recent payments: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get payment fee type
     */
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

    /**
     * Get pending clearances with server-side filtering
     */
    private function getPendingClearances(array $householdResidentIds, ?array $dateRange): array
    {
        try {
            $clearancesQuery = ClearanceRequest::whereIn('resident_id', $householdResidentIds)
                ->with(['clearanceType', 'documents'])
                ->whereIn('status', ['pending', 'processing', 'under_review', 'pending_payment']);
            
            if ($dateRange) {
                $clearancesQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }
            
            return $clearancesQuery
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->map(function ($clearance) {
                    $applicantResident = Resident::find($clearance->resident_id);
                    
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
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting pending clearances: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get announcements
     */
    private function getAnnouncements(array $allPrivileges): array
    {
        try {
            $user = Auth::user();
            
            $query = Announcement::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('start_date')->orWhere('start_date', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                });
            
            // Filter by audience if user has resident profile
            if ($user && $user->resident) {
                $query->visibleToUser($user);
            } else {
                $query->where('audience_type', Announcement::AUDIENCE_ALL);
            }
            
            return $query->with(['creator:id,first_name,last_name'])
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'title' => $a->title ?? 'Announcement',
                        'content' => $a->content,
                        'type' => $a->type ?? 'general',
                        'priority' => $a->priority ?? 0,
                        'author' => $a->creator?->first_name . ' ' . $a->creator?->last_name ?? 'Barangay Official',
                        'created_at' => $a->created_at->toISOString(),
                        'status' => $a->status,
                        'status_color' => $a->status_color,
                        'status_label' => $a->status_label,
                        'priority_label' => $a->priority_label,
                        'type_label' => $a->type_label,
                        'has_attachments' => $a->has_attachments,
                        'attachments_count' => $a->attachments_count,
                        'formatted_date_range' => $a->formatted_date_range,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting announcements: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get public announcements for guests
     */
    private function getPublicAnnouncements(): array
    {
        try {
            return Announcement::where('is_active', true)
                ->where('audience_type', Announcement::AUDIENCE_ALL)
                ->where(function ($q) {
                    $q->whereNull('start_date')->orWhere('start_date', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                })
                ->with(['creator:id,first_name,last_name'])
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'title' => $a->title ?? 'Announcement',
                        'content' => $a->content,
                        'type' => $a->type ?? 'general',
                        'priority' => $a->priority ?? 0,
                        'author' => $a->creator?->first_name . ' ' . $a->creator?->last_name ?? 'Barangay Official',
                        'created_at' => $a->created_at->toISOString(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting public announcements: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get payment summary with server-side filtering
     */
    private function getPaymentSummary(array $householdResidentIds, ?array $dateRange): array
    {
        try {
            $paymentsQuery = Payment::whereIn('payer_id', $householdResidentIds)
                ->where('payer_type', 'resident');
            
            if ($dateRange) {
                $paymentsQuery->whereBetween('payment_date', [$dateRange['start'], $dateRange['end']]);
            }
            
            return $paymentsQuery
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

    /**
     * Get resident data
     */
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
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ];

        // Dynamic flags for privileges
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $data["is_{$code}"] = true;
            $data["has_{$code}"] = true;
            $data["{$code}_id_number"] = $priv['id_number'];
        }

        if ($household) {
            $household->load(['householdMembers.resident.residentPrivileges.privilege.discountType']);
            
            $data['household_number'] = $household->household_number;
            $data['zone'] = $household->zone;
            $data['purok'] = $household->purok;
            $data['address'] = $household->address;
            $data['household_id'] = $household->id;
            $data['household_member_count'] = $household->householdMembers->count();
            
            $data['household_members'] = $household->householdMembers
                ->map(function ($member) {
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

    /**
     * Calculate profile completion percentage
     */
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

    /**
     * Profile setup page
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
     * Save profile setup
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

    /**
     * Profile page
     */
    public function profile()
    {
        $user = Auth::user();
        
        if (!$user->resident) {
            return redirect()->route('resident.profile-setup');
        }
        
        $allPrivileges = $this->getAllPrivileges();
        $resident = $user->resident;
        
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege.discountType');
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
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ];

        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $data["is_{$code}"] = true;
            $data["{$code}_id_number"] = $priv['id_number'];
        }

        if ($user->household_id) {
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege.discountType'])->find($user->household_id);
            
            if ($household) {
                $data['household'] = [
                    'household_number' => $household->household_number,
                    'zone' => $household->zone,
                    'purok' => $household->purok,
                    'address' => $household->address,
                    'members' => $household->householdMembers
                        ->map(function ($member) use ($user) {
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

    /**
     * Emergency contacts API
     */
    public function emergencyContacts()
    {
        return response()->json([
            'data' => [
                ['name' => 'Police', 'number' => '911'],
                ['name' => 'Fire', 'number' => '911'],
                ['name' => 'Ambulance', 'number' => '911'],
                ['name' => 'Barangay Hall', 'number' => '(082) 123-4567'],
            ]
        ]);
    }
    
    /**
     * Create resident record for existing user
     */
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