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
use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Carbon\Carbon;

/**
 * Resident Dashboard Controller
 * 
 * @method \Illuminate\Routing\ControllerMiddlewareOptions middleware(string|array $middleware, array $options = [])
 */
class ResidentDashboardController extends Controller
{
    // SECURITY NOTE: Cache TTL constants
    private const CACHE_TTL_PRIVILEGES = 3600; // 1 hour
    
    // SECURITY NOTE: Allowed date filters - whitelist for validation
    private const ALLOWED_DATE_FILTERS = ['today', 'week', 'month', 'year', 'all'];
    
    // LOGIC NOTE: Middleware is applied via routes - no constructor needed
    
    /**
     * Get all active privileges - DYNAMIC FROM DATABASE
     * 
     * SECURITY NOTE: Cache key includes version for cache busting on schema changes
     */
    private function getAllPrivileges(): array
    {
        $cacheKey = 'all_active_privileges:v1';
        
        return Cache::remember($cacheKey, self::CACHE_TTL_PRIVILEGES, function () {
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
     * 
     * SECURITY NOTE: Only returns privileges belonging to the resident
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
                    'title' => $this->sanitizeOutput($banner->title),
                    'description' => $this->sanitizeOutput($banner->description),
                    'link' => $banner->link_url,
                    'buttonText' => $this->sanitizeOutput($banner->button_text) ?? 'Learn More',
                    'alt' => $this->sanitizeOutput($banner->alt_text) ?? $this->sanitizeOutput($banner->title),
                ];
            })->toArray();
            
        } catch (\Exception $e) {
            \Log::error('Error getting banners', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
            return $this->sanitizeOutput($content);
        }
        return $this->sanitizeOutput(substr($content, 0, $length)) . '...';
    }

    /**
     * Get date range from filter - SERVER SIDE
     * 
     * SECURITY NOTE: Validates filter against whitelist
     */
    private function getDateRangeFromFilter(?string $filter): ?array
    {
        // SECURITY NOTE: Validate filter against whitelist
        if (!$filter || !in_array($filter, self::ALLOWED_DATE_FILTERS, true)) {
            return null;
        }
        
        if ($filter === 'all') {
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
        if (!in_array($filter, self::ALLOWED_DATE_FILTERS, true) || $filter === 'all') {
            return null;
        }
        
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
     * 
     * SECURITY NOTE: Rate limited to prevent abuse
     */
    public function residentdashboard(Request $request)
    {
        $user = Auth::user();
        
        // SECURITY NOTE: Rate limiting for dashboard
        $rateLimitKey = 'dashboard:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 30)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            
            return Inertia::render('resident/residentdashboard', [
                'error' => "Too many requests. Please wait {$seconds} seconds.",
                'rate_limited' => true,
            ]);
        }
        
        RateLimiter::hit($rateLimitKey, 60); // 30 attempts per minute
        
        // SECURITY NOTE: Validate date filter
        $dateFilter = $request->input('date_filter', 'week');
        if (!in_array($dateFilter, self::ALLOWED_DATE_FILTERS, true)) {
            $dateFilter = 'week';
        }
        
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
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege.discountType'])
                ->find($user->household_id);
        }
        
        if ($household) {
            // SECURITY NOTE: Verify resident belongs to this household
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
            'announcements' => $this->getAnnouncements(),
            'paymentSummary' => $paymentSummary,
            'resident' => $this->getResidentData($resident, $household, $isHouseholdHead, $allPrivileges),
            'allPrivileges' => $allPrivileges,
            'bannerSlides' => $this->getBannerSlides(),
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
                'total_reports' => 0,
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
            
            // Community Reports stats
            $totalReports = 0;
            $reportsQuery = CommunityReport::whereIn('resident_id', $householdResidentIds);
            if ($dateRange) {
                $reportsQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }
            $totalReports = $reportsQuery->count();
            
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
                'total_reports' => $totalReports,
                'pending_clearances' => $pendingClearances,
                'pending_requests' => $pendingClearances,
                'household_members' => count($householdResidentIds),
                'percentage_change' => round($percentageChange, 1),
                'trend' => $trend,
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting dashboard stats', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return [
                'total_payments' => 0,
                'total_payments_amount' => 0,
                'total_clearances' => 0,
                'total_reports' => 0,
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
                        'description' => $this->sanitizeOutput(
                            ($payerResident?->first_name ?? 'Household Member') . ' paid: ' . ($payment->clearance_type ?? 'Barangay Fee')
                        ),
                        'status' => $payment->status ?? 'completed',
                        'date' => $payment->payment_date?->toISOString() ?? now()->toISOString(),
                        'amount' => '₱' . number_format($payment->total_amount ?? 0, 2),
                        'originalId' => $payment->id,
                        'payer_name' => $this->sanitizeOutput($payerResident?->first_name ?? 'Household Member'),
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
                        'description' => $this->sanitizeOutput(
                            ($applicantResident?->first_name ?? 'Household Member') . ' requested: ' . ($clearance->clearanceType?->name ?? 'Clearance')
                        ),
                        'status' => $clearance->status,
                        'date' => $clearance->created_at->toISOString(),
                        'originalId' => $clearance->id,
                        'applicant_name' => $this->sanitizeOutput($applicantResident?->first_name ?? 'Household Member'),
                    ];
                });
            
            // Community reports activities
            $reportsQuery = CommunityReport::whereIn('resident_id', $householdResidentIds);
            
            if ($dateRange) {
                $reportsQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }
            
            $recentReports = $reportsQuery
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($report) {
                    $reporterResident = Resident::find($report->resident_id);
                    
                    return [
                        'id' => 'report-' . $report->id,
                        'type' => 'report',
                        'description' => $this->sanitizeOutput(
                            ($reporterResident?->first_name ?? 'Household Member') . ' submitted: ' . ($report->title ?? 'Community Report')
                        ),
                        'status' => $report->status ?? 'pending',
                        'date' => $report->created_at->toISOString(),
                        'originalId' => $report->id,
                        'reporter_name' => $this->sanitizeOutput($reporterResident?->first_name ?? 'Household Member'),
                    ];
                });

            return $activities->concat($recentPayments)
                ->concat($recentClearances)
                ->concat($recentReports)
                ->sortByDesc('date')
                ->take(8)
                ->values()
                ->toArray();

        } catch (\Exception $e) {
            \Log::error('Error getting recent activities', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
                        'reference_number' => $this->sanitizeOutput($payment->or_number ?? $payment->reference_number),
                        'amount' => (float) ($payment->total_amount ?? 0),
                        'status' => $payment->status ?? 'completed',
                        'fee_type' => $this->sanitizeOutput($payment->clearance_type ?? $this->getPaymentFeeType($payment)),
                        'payment_date' => $payment->payment_date?->toISOString(),
                        'created_at' => $payment->created_at->toISOString(),
                        'payment_method' => $payment->payment_method,
                        'payer_name' => $payerResident ? $this->sanitizeOutput($payerResident->first_name . ' ' . $payerResident->last_name) : 'Household Member',
                        'payer_id' => $payment->payer_id,
                        'is_current_user' => $payerResident && $payerResident->user && $payerResident->user->id === Auth::id(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting recent payments', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
                        'clearance_type' => $this->sanitizeOutput($clearance->clearanceType?->name ?? 'General Clearance'),
                        'purpose' => $this->sanitizeOutput($clearance->purpose ?? 'No purpose specified'),
                        'status' => $clearance->status,
                        'created_at' => $clearance->created_at->toISOString(),
                        'requirements_count' => $clearance->documents?->count() ?? 0,
                        'reference_number' => $this->sanitizeOutput($clearance->reference_number),
                        'urgency' => $clearance->urgency,
                        'applicant_name' => $applicantResident ? $this->sanitizeOutput($applicantResident->first_name . ' ' . $applicantResident->last_name) : 'Household Member',
                        'applicant_id' => $clearance->resident_id,
                        'is_current_user' => $applicantResident && $applicantResident->user && $applicantResident->user->id === Auth::id(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting pending clearances', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get announcements
     */
    private function getAnnouncements(): array
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
                        'title' => $this->sanitizeOutput($a->title ?? 'Announcement'),
                        'content' => $this->sanitizeOutput($a->content),
                        'type' => $a->type ?? 'general',
                        'priority' => $a->priority ?? 0,
                        'author' => $this->sanitizeOutput($a->creator?->first_name . ' ' . $a->creator?->last_name) ?? 'Barangay Official',
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
            \Log::error('Error getting announcements', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
                        'title' => $this->sanitizeOutput($a->title ?? 'Announcement'),
                        'content' => $this->sanitizeOutput($a->content),
                        'type' => $a->type ?? 'general',
                        'priority' => $a->priority ?? 0,
                        'author' => $this->sanitizeOutput($a->creator?->first_name . ' ' . $a->creator?->last_name) ?? 'Barangay Official',
                        'created_at' => $a->created_at->toISOString(),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting public announcements', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
            
            // SECURITY NOTE: Group by hardcoded column name - safe
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
                    'formatted_type' => $this->sanitizeOutput(str_replace('_', ' ', ucwords(strtolower($s->type)))),
                ])
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error getting payment summary', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
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
            'full_name' => $this->sanitizeOutput($resident->full_name),
            'first_name' => $this->sanitizeOutput($resident->first_name ?? 'Resident'),
            'last_name' => $this->sanitizeOutput($resident->last_name ?? ''),
            'middle_name' => $this->sanitizeOutput($resident->middle_name ?? ''),
            'suffix' => $this->sanitizeOutput($resident->suffix ?? ''),
            'email' => $resident->email ?? '',
            'phone_number' => $resident->contact_number ?? $resident->phone_number ?? 'N/A',
            'birth_date' => $resident->birth_date?->format('Y-m-d'),
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'occupation' => $this->sanitizeOutput($resident->occupation),
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
            
            $data['household_number'] = $this->sanitizeOutput($household->household_number);
            $data['zone'] = $this->sanitizeOutput($household->zone);
            $data['purok'] = $this->sanitizeOutput($household->purok);
            $data['address'] = $this->sanitizeOutput($household->address);
            $data['household_id'] = $household->id;
            $data['household_member_count'] = $household->householdMembers->count();
            
            $data['household_members'] = $household->householdMembers
                ->map(function ($member) {
                    $mr = $member->resident;
                    if (!$mr) return null;
                    
                    $memberPrivileges = $this->getResidentPrivileges($mr);
                    
                    $memberData = [
                        'id' => $member->resident_id,
                        'full_name' => $this->sanitizeOutput($mr->full_name),
                        'first_name' => $this->sanitizeOutput($mr->first_name),
                        'last_name' => $this->sanitizeOutput($mr->last_name),
                        'relationship' => $this->sanitizeOutput($member->relationship_to_head),
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
                'household_number' => $this->sanitizeOutput($household->household_number),
                'zone' => $this->sanitizeOutput($household->zone),
                'purok' => $this->sanitizeOutput($household->purok),
                'address' => $this->sanitizeOutput($household->address),
            ];
        } else {
            $data['household_number'] = 'N/A';
            $data['zone'] = 'N/A';
            $data['purok'] = $resident->purok?->name ?? 'N/A';
            $data['purok_id'] = $resident->purok_id;
            $data['address'] = $this->sanitizeOutput($resident->address) ?? 'N/A';
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
     * 
     * SECURITY NOTE: Uses validated data only
     */
    public function saveProfileSetup(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'birth_date' => 'required|date|before:today',
            'gender' => 'required|string|in:male,female,other',
            'address' => 'required|string|max:500',
        ]);

        $user = Auth::user();
        
        DB::beginTransaction();
        
        try {
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
            
            DB::commit();
            
            return redirect()->route('resident.dashboard')
                ->with('success', 'Profile created successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Profile setup failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'Failed to create profile. Please try again.']);
        }
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
            'first_name' => $this->sanitizeOutput($resident->first_name),
            'last_name' => $this->sanitizeOutput($resident->last_name),
            'middle_name' => $this->sanitizeOutput($resident->middle_name),
            'suffix' => $this->sanitizeOutput($resident->suffix),
            'email' => $resident->email,
            'phone_number' => $resident->contact_number,
            'birth_date' => $resident->birth_date?->format('Y-m-d'),
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'occupation' => $this->sanitizeOutput($resident->occupation),
            'address' => $this->sanitizeOutput($resident->address),
            'profile_photo_url' => $resident->photo_path ? asset('storage/' . $resident->photo_path) : null,
            'purok' => $this->sanitizeOutput($resident->purok?->name),
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
            $household = Household::with(['householdMembers.resident.residentPrivileges.privilege.discountType'])
                ->find($user->household_id);
            
            if ($household) {
                $data['household'] = [
                    'household_number' => $this->sanitizeOutput($household->household_number),
                    'zone' => $this->sanitizeOutput($household->zone),
                    'purok' => $this->sanitizeOutput($household->purok),
                    'address' => $this->sanitizeOutput($household->address),
                    'members' => $household->householdMembers
                        ->map(function ($member) use ($user) {
                            $mr = $member->resident;
                            if (!$mr) return null;
                            
                            $memberPrivileges = $this->getResidentPrivileges($mr);
                            
                            $memberData = [
                                'id' => $member->resident_id,
                                'full_name' => $this->sanitizeOutput($mr->full_name),
                                'relationship' => $this->sanitizeOutput($member->relationship_to_head),
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
     * 
     * SECURITY NOTE: Returns actual emergency contacts from config
     */
    public function emergencyContacts()
    {
        $contacts = config('emergency.contacts', [
            ['name' => 'Police', 'number' => '911'],
            ['name' => 'Fire', 'number' => '911'],
            ['name' => 'Ambulance', 'number' => '911'],
            ['name' => 'Barangay Hall', 'number' => null],
        ]);
        
        // Filter out contacts without numbers
        $contacts = array_filter($contacts, fn($c) => !empty($c['number']));
        
        return response()->json(['data' => array_values($contacts)]);
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
        
        DB::beginTransaction();
        
        try {
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
            
            DB::commit();
            
            return redirect()->route('resident.dashboard')
                ->with('success', 'Basic profile created. Please update your complete profile.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Failed to create resident record', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'Failed to create profile. Please try again.']);
        }
    }
    
    /**
     * Sanitize output for safe display
     * 
     * SECURITY NOTE: Prevents XSS attacks
     */
    private function sanitizeOutput(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}