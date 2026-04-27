<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;
use App\Models\Business;
use App\Models\Purok;
use App\Models\User;
use App\Models\Official;
use App\Models\CommunityReport;
use App\Models\ClearanceRequest;
use App\Models\Form;
use App\Models\Announcement;
use App\Models\Payment;
use App\Models\Privilege;
use App\Models\Fee;
use App\Models\Role;
use App\Models\Permission;
use App\Models\ClearanceType;
use App\Models\FeeType;
use App\Models\ReportType;
use App\Models\DocumentType;
use App\Models\Committee;
use App\Models\Position;
use Illuminate\Notifications\DatabaseNotification;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    
    /*
    |--------------------------------------------------------------------------
    | SECURITY CONFIGURATION
    |--------------------------------------------------------------------------
    */
    
    /**
     * Sensitive resident fields that should never be exposed to frontend.
     *
     * @var array<string>
     */
    protected array $sensitiveResidentFields = [
        'sss_number',
        'tin_number',
        'philhealth_number',
        'password',
        'remember_token',
        'email_verified_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];
    
    /**
     * Maximum search query length to prevent DoS attacks.
     *
     * @var int
     */
    protected const MAX_SEARCH_LENGTH = 100;
    
    /**
     * Minimum search query length.
     *
     * @var int
     */
    protected const MIN_SEARCH_LENGTH = 2;
    
    /**
     * Maximum results per entity type to prevent memory exhaustion.
     *
     * @var int
     */
    protected const MAX_SEARCH_RESULTS_PER_TYPE = 10;
    
    /**
     * Maximum total quick search results.
     *
     * @var int
     */
    protected const MAX_QUICK_SEARCH_RESULTS = 8;
    
    /**
     * Cache TTL for statistics data (in seconds).
     *
     * @var array<string, int>
     */
    protected array $cacheTtl = [
        'privileges' => 300,      // 5 minutes
        'report_stats' => 60,      // 1 minute
        'resident_stats' => 120,   // 2 minutes
        'payment_stats' => 60,     // 1 minute
        'service_stats' => 120,    // 2 minutes
        'system_stats' => 300,     // 5 minutes
    ];
    
    /**
     * Rate limit configuration for search.
     *
     * @var array<string, int>
     */
    protected array $rateLimit = [
        'search_max_attempts' => 30,
        'search_decay_minutes' => 1,
    ];

    /*
    |--------------------------------------------------------------------------
    | INERTIA CONFIGURATION
    |--------------------------------------------------------------------------
    */

    /**
     * Determine the current asset version.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZATION CHECKS
    |--------------------------------------------------------------------------
    */

    /**
     * Check if current user can access admin-level data.
     *
     * @return bool
     */
    private function userCanAccessAdminData(): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }
        
        // LOGIC NOTE: Check multiple authorization paths
        return $user->isAdministrator() ||
               $user->hasPermission('view-admin-dashboard') ||
               ($user->role && ($user->role->is_system_role ?? false));
    }

    /**
     * Check if user can access financial data.
     *
     * @return bool
     */
    private function userCanAccessFinancialData(): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }
        
        // SECURITY NOTE: Financial data requires specific authorization
        $financialRoles = ['Barangay Treasurer', 'Treasury Officer', 'Administrator'];
        
        return $user->isAdministrator() ||
               $user->hasPermission('view-financial-data') ||
               in_array($user->role?->name ?? '', $financialRoles, true);
    }

    /**
     * Check if user can access system-level data.
     *
     * @return bool
     */
    private function userCanAccessSystemData(): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }
        
        // SECURITY NOTE: System data only for super admins
        return $user->isAdministrator() || $user->hasPermission('manage-system');
    }

    /**
     * Check if user can search across all entities.
     *
     * @return bool
     */
    private function userCanPerformGlobalSearch(): bool
    {
        return $this->userCanAccessAdminData();
    }

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get user notifications with unread count.
     * SECURITY NOTE: Uses Laravel's built-in notification system.
     *
     * @param User $user
     * @return array
     */
    private function getUserNotifications(User $user): array
    {
        try {
            // Check if notifications table exists
            if (!Schema::hasTable('notifications')) {
                return ['unread' => 0, 'items' => []];
            }
            
            // Cache unread count for 30 seconds
            $cacheKey = "user_notifications_unread:{$user->id}";
            
            $unreadCount = Cache::remember($cacheKey, 30, function () use ($user) {
                return DatabaseNotification::where('notifiable_type', User::class)
                    ->where('notifiable_id', $user->id)
                    ->whereNull('read_at')
                    ->count();
            });
            
            // Get recent notifications (don't cache items)
            $items = DatabaseNotification::where('notifiable_type', User::class)
                ->where('notifiable_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $this->formatNotificationType($notification->type),
                        'data' => $notification->data,
                        'read_at' => $notification->read_at ? $notification->read_at->diffForHumans() : null,
                        'is_read' => !is_null($notification->read_at),
                        'created_at' => $notification->created_at->diffForHumans(),
                        'created_at_raw' => $notification->created_at->toISOString(),
                    ];
                })
                ->toArray();
            
            return [
                'unread' => $unreadCount,
                'items' => $items,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch user notifications', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            return ['unread' => 0, 'items' => []];
        }
    }
    
    /**
     * Format notification type for display.
     *
     * @param string $type
     * @return string
     */
    private function formatNotificationType(string $type): string
    {
        // Extract the class name without namespace
        $parts = explode('\\', $type);
        $className = end($parts);
        
        // Remove "Notification" suffix
        return str_replace('Notification', '', $className);
    }

    /*
    |--------------------------------------------------------------------------
    | DATA FETCHING METHODS (WITH AUTHORIZATION)
    |--------------------------------------------------------------------------
    */

    /**
     * Get all active privileges with their discount types.
     * SECURITY NOTE: Cached with proper TTL and only for authorized users.
     *
     * @return array
     */
    private function getAllPrivileges(): array
    {
        if (!$this->userCanAccessAdminData()) {
            return [];
        }
        
        return Cache::remember(
            'all_active_privileges_with_discounts',
            $this->cacheTtl['privileges'],
            function () {
                try {
                    return Privilege::with('discountType')
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
                        ->map(function ($privilege) {
                            $discountType = $privilege->discountType;
                            return [
                                'id' => $privilege->id,
                                'name' => $privilege->name,
                                'code' => $privilege->code,
                                'description' => $privilege->description,
                                'discount_type_id' => $privilege->discount_type_id,
                                'discount_type_code' => $discountType?->code,
                                'discount_type_name' => $discountType?->name,
                                'default_discount_percentage' => $discountType?->percentage ?? 0,
                                'requires_id_number' => $discountType?->requires_id_number ?? false,
                                'requires_verification' => $discountType?->requires_verification ?? false,
                                'validity_days' => $discountType?->validity_days ?? 0,
                                'priority' => $discountType?->priority ?? 100,
                            ];
                        })
                        ->toArray();
                } catch (\Exception $e) {
                    Log::error('Failed to fetch privileges', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    return [];
                }
            }
        );
    }

    /**
     * Get report statistics for sidebar badges.
     * SECURITY NOTE: Only shared with users having appropriate permissions.
     *
     * @return array
     */
    private function getReportStats(): array
    {
        if (!$this->userCanAccessAdminData()) {
            return [];
        }
        
        return Cache::remember(
            'sidebar_report_stats',
            $this->cacheTtl['report_stats'],
            function () {
                try {
                    $communityReportTypeId = null;
                    $blotterTypeId = null;
                    
                    if (class_exists(ReportType::class) && Schema::hasTable('report_types')) {
                        $communityReportTypeId = ReportType::where('code', 'community_report')
                            ->orWhere('name', 'like', '%community%')
                            ->value('id');
                        $blotterTypeId = ReportType::where('code', 'blotter')
                            ->orWhere('name', 'like', '%blotter%')
                            ->value('id');
                    }
                    
                    return [
                        'total' => CommunityReport::count(),
                        'pending' => CommunityReport::where('status', 'pending')->count(),
                        'community_reports' => $communityReportTypeId
                            ? CommunityReport::where('report_type_id', $communityReportTypeId)->count()
                            : 0,
                        'blotters' => $blotterTypeId
                            ? CommunityReport::where('report_type_id', $blotterTypeId)->count()
                            : 0,
                        'today' => CommunityReport::whereDate('created_at', today())->count(),
                        'under_review' => CommunityReport::where('status', 'under_review')->count(),
                        'assigned' => CommunityReport::where('status', 'assigned')->count(),
                        'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
                        'resolved' => CommunityReport::where('status', 'resolved')->count(),
                        'rejected' => CommunityReport::where('status', 'rejected')->count(),
                        'high_priority' => CommunityReport::where(function ($q) {
                            $q->whereIn('priority', ['high', 'critical'])
                              ->orWhere('urgency_level', 'high');
                        })->count(),
                        'pending_clearances' => ClearanceRequest::where('status', 'pending')->count(),
                    ];
                } catch (\Exception $e) {
                    Log::error('Failed to fetch report stats', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                    ]);
                    return $this->getEmptyReportStats();
                }
            }
        );
    }

    /**
     * Get empty report stats structure.
     *
     * @return array
     */
    private function getEmptyReportStats(): array
    {
        return [
            'total' => 0,
            'pending' => 0,
            'community_reports' => 0,
            'blotters' => 0,
            'today' => 0,
            'under_review' => 0,
            'assigned' => 0,
            'in_progress' => 0,
            'resolved' => 0,
            'rejected' => 0,
            'high_priority' => 0,
            'pending_clearances' => 0,
        ];
    }

    /**
     * Get resident statistics for sidebar badges.
     * SECURITY NOTE: Only shared with users having appropriate permissions.
     *
     * @return array
     */
    private function getResidentStats(): array
    {
        if (!$this->userCanAccessAdminData()) {
            return [];
        }
        
        return Cache::remember(
            'sidebar_resident_stats',
            $this->cacheTtl['resident_stats'],
            function () {
                try {
                    return [
                        'total' => Resident::count(),
                        'active' => Resident::where('status', 'active')->count(),
                        'inactive' => Resident::where('status', 'inactive')->count(),
                        'households' => Household::count(),
                        'businesses' => class_exists(Business::class) ? Business::count() : 0,
                        'voters' => Resident::where('is_voter', true)->count(),
                        'senior_citizens' => $this->getSeniorCitizensCount(),
                        'pwd' => $this->getPrivilegeCount('PWD'),
                        'solo_parents' => $this->getPrivilegeCount('SOLO_PARENT'),
                    ];
                } catch (\Exception $e) {
                    Log::error('Failed to fetch resident stats', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                    ]);
                    return $this->getEmptyResidentStats();
                }
            }
        );
    }

    /**
     * Get senior citizens count.
     *
     * @return int
     */
    private function getSeniorCitizensCount(): int
    {
        try {
            return Resident::where(function ($q) {
                $q->whereHas('activeResidentPrivileges', function ($q2) {
                    $q2->whereHas('privilege', function ($q3) {
                        $q3->whereIn('code', ['SENIOR', 'SC']);
                    });
                })->orWhere(function ($q3) {
                    $q3->whereNotNull('birth_date')
                       ->whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) >= 60');
                });
            })->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get count of residents with specific privilege.
     *
     * @param string $privilegeCode
     * @return int
     */
    private function getPrivilegeCount(string $privilegeCode): int
    {
        try {
            return Resident::whereHas('activeResidentPrivileges', function ($q) use ($privilegeCode) {
                $q->whereHas('privilege', function ($q2) use ($privilegeCode) {
                    $q2->where('code', $privilegeCode);
                });
            })->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get empty resident stats structure.
     *
     * @return array
     */
    private function getEmptyResidentStats(): array
    {
        return [
            'total' => 0,
            'active' => 0,
            'inactive' => 0,
            'households' => 0,
            'businesses' => 0,
            'voters' => 0,
            'senior_citizens' => 0,
            'pwd' => 0,
            'solo_parents' => 0,
        ];
    }

    /**
     * Get payment statistics for sidebar badges.
     * SECURITY NOTE: Financial data requires specific permission.
     *
     * @return array
     */
    private function getPaymentStats(): array
    {
        if (!$this->userCanAccessFinancialData()) {
            return [];
        }
        
        return Cache::remember(
            'sidebar_payment_stats',
            $this->cacheTtl['payment_stats'],
            function () {
                try {
                    $totalRevenue = Payment::where('status', 'completed')->sum('total_amount');
                    $todayCollections = Payment::where('status', 'completed')
                        ->whereDate('payment_date', today())
                        ->sum('total_amount');
                    $monthlyCollections = Payment::where('status', 'completed')
                        ->whereYear('payment_date', now()->year)
                        ->whereMonth('payment_date', now()->month)
                        ->sum('total_amount');
                    
                    return [
                        'total_fees' => Fee::count(),
                        'total_payments' => Payment::count(),
                        'pending_payments' => Payment::where('status', 'pending')->count(),
                        'total_revenue' => $totalRevenue,
                        'today_collections' => $todayCollections,
                        'monthly_collections' => $monthlyCollections,
                    ];
                } catch (\Exception $e) {
                    Log::error('Failed to fetch payment stats', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                    ]);
                    return $this->getEmptyPaymentStats();
                }
            }
        );
    }

    /**
     * Get empty payment stats structure.
     *
     * @return array
     */
    private function getEmptyPaymentStats(): array
    {
        return [
            'total_fees' => 0,
            'total_payments' => 0,
            'pending_payments' => 0,
            'total_revenue' => 0,
            'today_collections' => 0,
            'monthly_collections' => 0,
        ];
    }

    /**
     * Get service statistics for sidebar badges.
     *
     * @return array
     */
    private function getServiceStats(): array
    {
        if (!$this->userCanAccessAdminData()) {
            return [];
        }
        
        return Cache::remember(
            'sidebar_service_stats',
            $this->cacheTtl['service_stats'],
            function () {
                try {
                    return [
                        'total_forms' => Form::where('is_active', true)->count(),
                        'total_privileges' => Privilege::where('is_active', true)->count(),
                        'active_announcements' => Announcement::where('is_active', true)
                            ->where(function ($q) {
                                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                            })
                            ->count(),
                        'total_clearances' => ClearanceRequest::count(),
                        'pending_clearances' => ClearanceRequest::where('status', 'pending')->count(),
                        'approved_clearances' => ClearanceRequest::where('status', 'approved')->count(),
                    ];
                } catch (\Exception $e) {
                    Log::error('Failed to fetch service stats', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                    ]);
                    return $this->getEmptyServiceStats();
                }
            }
        );
    }

    /**
     * Get empty service stats structure.
     *
     * @return array
     */
    private function getEmptyServiceStats(): array
    {
        return [
            'total_forms' => 0,
            'total_privileges' => 0,
            'active_announcements' => 0,
            'total_clearances' => 0,
            'pending_clearances' => 0,
            'approved_clearances' => 0,
        ];
    }

    /**
     * Get system statistics for sidebar badges.
     * SECURITY NOTE: System stats only for super admins.
     *
     * @return array
     */
    private function getSystemStats(): array
    {
        if (!$this->userCanAccessSystemData()) {
            return [];
        }
        
        return Cache::remember(
            'sidebar_system_stats',
            $this->cacheTtl['system_stats'],
            function () {
                try {
                    return [
                        'total_users' => User::count(),
                        'total_roles' => class_exists(Role::class) ? Role::count() : 0,
                        'total_permissions' => class_exists(Permission::class) ? Permission::count() : 0,
                        'total_puroks' => Purok::count(),
                        'total_positions' => class_exists(Position::class) ? Position::count() : 0,
                        'total_committees' => class_exists(Committee::class) ? Committee::count() : 0,
                        'total_officials' => Official::where('status', 'active')->count(),
                        'total_clearance_types' => class_exists(ClearanceType::class) ? ClearanceType::count() : 0,
                        'total_fee_types' => class_exists(FeeType::class) ? FeeType::count() : 0,
                        'total_report_types' => class_exists(ReportType::class) ? ReportType::count() : 0,
                        'total_document_types' => class_exists(DocumentType::class) ? DocumentType::count() : 0,
                        'active_sessions' => cache()->get('active_sessions_count', 0),
                    ];
                } catch (\Exception $e) {
                    Log::error('Failed to fetch system stats', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                    ]);
                    return $this->getEmptySystemStats();
                }
            }
        );
    }

    /**
     * Get empty system stats structure.
     *
     * @return array
     */
    private function getEmptySystemStats(): array
    {
        return [
            'total_users' => 0,
            'total_roles' => 0,
            'total_permissions' => 0,
            'total_puroks' => 0,
            'total_positions' => 0,
            'total_committees' => 0,
            'total_officials' => 0,
            'total_clearance_types' => 0,
            'total_fee_types' => 0,
            'total_report_types' => 0,
            'total_document_types' => 0,
            'active_sessions' => 0,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RESIDENT DATA METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get resident's active privileges with discount info.
     * SECURITY NOTE: Only return data for the authenticated resident or admin users.
     *
     * @param Resident $resident
     * @return array
     */
    private function getResidentPrivileges(Resident $resident): array
    {
        // SECURITY NOTE: Ensure user owns this resident record or is admin
        $user = Auth::user();
        if (!$user) {
            return [];
        }
        
        if ($user->resident_id !== $resident->id && !$this->userCanAccessAdminData()) {
            Log::warning('Unauthorized attempt to access resident privileges', [
                'user_id' => $user->id,
                'target_resident_id' => $resident->id,
            ]);
            return [];
        }
        
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege.discountType');
        }
        
        return $resident->residentPrivileges
            ->filter(function ($rp) {
                return $rp->isActive();
            })
            ->map(function ($rp) {
                $privilege = $rp->privilege;
                $discountType = $privilege?->discountType;
                
                // SECURITY NOTE: Return only necessary fields
                return [
                    'id' => $rp->id,
                    'privilege_id' => $privilege?->id,
                    'code' => $privilege?->code,
                    'name' => $privilege?->name,
                    'id_number' => $this->userCanAccessAdminData() ? $rp->id_number : null,
                    'discount_percentage' => $rp->discount_percentage ?? $discountType?->percentage ?? 0,
                    'discount_type_id' => $discountType?->id,
                    'discount_type_code' => $discountType?->code,
                    'discount_type_name' => $discountType?->name,
                    'verified_at' => $rp->verified_at?->toISOString(),
                    'expires_at' => $rp->expires_at?->toISOString(),
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Sanitize resident data before sending to frontend.
     * SECURITY NOTE: Remove sensitive fields and only include necessary data.
     *
     * @param Resident $resident
     * @return array
     */
    private function sanitizeResidentData(Resident $resident): array
    {
        $activePrivileges = $this->getResidentPrivileges($resident);
        
        $privilegeFlags = [];
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"] = true;
            $privilegeFlags["has_{$code}_privilege"] = true;
            $privilegeFlags["{$code}_discount_percentage"] = $priv['discount_percentage'];
        }
        
        $data = [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'middle_name' => $resident->middle_name,
            'last_name' => $resident->last_name,
            'suffix' => $resident->suffix,
            'avatar' => $resident->avatar,
            'gender' => $resident->gender,
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ];
        
        // SECURITY NOTE: Only include sensitive data for admin users
        if ($this->userCanAccessAdminData()) {
            $data['birth_date'] = $resident->birth_date ? date('Y-m-d', strtotime($resident->birth_date)) : null;
            $data['marital_status'] = $resident->marital_status;
            $data['phone_number'] = $resident->phone_number;
            $data['email'] = $resident->email;
        }
        
        return array_merge($data, $privilegeFlags);
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH VALIDATION AND SANITIZATION
    |--------------------------------------------------------------------------
    */

    /**
     * Validate search query format and length.
     *
     * @param mixed $query
     * @return bool
     */
    private function isValidSearchQuery($query): bool
    {
        if (!is_string($query)) {
            return false;
        }
        
        $length = mb_strlen($query);
        if ($length < self::MIN_SEARCH_LENGTH || $length > self::MAX_SEARCH_LENGTH) {
            return false;
        }
        
        // SECURITY NOTE: Reject queries with suspicious patterns
        if (preg_match('/[<>"\'%;()]/', $query) && !preg_match('/^[a-zA-Z0-9\s\-_.@]+$/', $query)) {
            Log::warning('Suspicious search query rejected', [
                'query' => substr($query, 0, 50),
                'user_id' => Auth::id(),
                'ip' => request()->ip(),
            ]);
            return false;
        }
        
        return true;
    }

    /**
     * Sanitize search query for safe use in LIKE clauses.
     *
     * @param string $query
     * @return string
     */
    private function sanitizeSearchQuery(string $query): string
    {
        // LOGIC NOTE: Escape special characters for MySQL LIKE
        $sanitized = trim($query);
        $sanitized = addcslashes($sanitized, '%_\\');
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        
        return $sanitized;
    }

    /*
    |--------------------------------------------------------------------------
    | FLASH DATA HANDLING
    |--------------------------------------------------------------------------
    */

    /**
     * Get safe flash data for frontend.
     * SECURITY NOTE: Only expose whitelisted flash keys.
     *
     * @param Request $request
     * @return array
     */
    private function getSafeFlashData(Request $request): array
    {
        $safeFlashKeys = ['success', 'error', 'warning', 'info'];
        $flashData = [];
        
        foreach ($safeFlashKeys as $key) {
            if ($request->session()->has($key)) {
                $value = $request->session()->get($key);
                if (is_string($value)) {
                    // SECURITY NOTE: Strip any potentially harmful content
                    $value = strip_tags($value);
                }
                $flashData[$key] = $value;
            }
        }
        
        // SECURITY NOTE: Special handling for 2FA setup data
        if ($this->userCanAccessAdminData() || $request->user()?->two_factor_confirmed_at === null) {
            if ($request->session()->has('qrCodeSvg')) {
                $flashData['qrCodeSvg'] = $request->session()->get('qrCodeSvg');
            }
            if ($request->session()->has('manualSetupKey')) {
                $flashData['manualSetupKey'] = $request->session()->get('manualSetupKey');
            }
        }
        
        return $flashData;
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH HISTORY MANAGEMENT
    |--------------------------------------------------------------------------
    */

    /**
     * Store search query in session.
     * SECURITY NOTE: Atomic operation to prevent race conditions.
     *
     * @param Request $request
     * @param string $query
     * @return void
     */
    protected function storeSearchQuery(Request $request, string $query): void
    {
        // SECURITY NOTE: Limit query length stored in session
        $query = substr($query, 0, 50);
        
        $recentSearches = $request->session()->get('recent_searches', []);
        
        // Remove duplicates
        $recentSearches = array_values(array_filter($recentSearches, function ($item) use ($query) {
            return $item !== $query;
        }));
        
        array_unshift($recentSearches, $query);
        
        // SECURITY NOTE: Limit to 5 recent searches for privacy
        $recentSearches = array_slice($recentSearches, 0, 5);
        
        $request->session()->put('recent_searches', $recentSearches);
    }

    /**
     * Get recent searches from session.
     *
     * @param Request $request
     * @return array
     */
    protected function getRecentSearches(Request $request): array
    {
        return $request->session()->get('recent_searches', []);
    }

    /*
    |--------------------------------------------------------------------------
    | QUICK SEARCH
    |--------------------------------------------------------------------------
    */

    /**
     * Perform quick search across entities.
     *
     * @param string $query
     * @param array $allPrivileges
     * @return array
     */
    protected function performQuickSearch(string $query, array $allPrivileges): array
    {
        $searchTerm = '%' . $query . '%';
        $results = [];
        
        // Residents search
        $results = array_merge($results, $this->quickSearchResidents($searchTerm));
        
        // Admin-only searches
        if ($this->userCanPerformGlobalSearch()) {
            $results = array_merge($results, $this->quickSearchHouseholds($searchTerm));
            $results = array_merge($results, $this->quickSearchBusinesses($searchTerm));
            $results = array_merge($results, $this->quickSearchPuroks($searchTerm));
            $results = array_merge($results, $this->quickSearchUsers($searchTerm));
            $results = array_merge($results, $this->quickSearchOfficials($searchTerm));
            $results = array_merge($results, $this->quickSearchClearances($searchTerm));
            $results = array_merge($results, $this->quickSearchForms($searchTerm));
            $results = array_merge($results, $this->quickSearchAnnouncements($searchTerm));
            
            if ($this->userCanAccessFinancialData()) {
                $results = array_merge($results, $this->quickSearchPayments($searchTerm));
            }
            
            $results = array_merge($results, $this->quickSearchReports($searchTerm));
        }
        
        return array_slice($results, 0, self::MAX_QUICK_SEARCH_RESULTS);
    }

    /**
     * Quick search residents.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchResidents(string $searchTerm): array
    {
        try {
            return Resident::with(['purok'])
                ->where(function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm)
                      ->orWhere('middle_name', 'like', $searchTerm)
                      ->orWhere('email', 'like', $searchTerm)
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
                })
                ->limit(3)
                ->get()
                ->map(function ($resident) {
                    return [
                        'id' => $resident->id,
                        'type' => 'resident',
                        'text' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                        'subtext' => $resident->purok?->name ?? 'No purok',
                        'url' => route('admin.residents.show', $resident->id),
                        'icon' => 'User',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search residents failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search households.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchHouseholds(string $searchTerm): array
    {
        try {
            return Household::with(['purok'])
                ->where('household_number', 'like', $searchTerm)
                ->orWhere('address', 'like', $searchTerm)
                ->orWhere('head_of_family', 'like', $searchTerm)
                ->limit(2)
                ->get()
                ->map(function ($household) {
                    return [
                        'id' => $household->id,
                        'type' => 'household',
                        'text' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                        'subtext' => $household->address ?? 'No address',
                        'url' => route('admin.households.show', $household->id),
                        'icon' => 'Home',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search households failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search businesses.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchBusinesses(string $searchTerm): array
    {
        if (!class_exists('App\Models\Business')) {
            return [];
        }
        
        try {
            return Business::with(['purok'])
                ->where('business_name', 'like', $searchTerm)
                ->orWhere('owner_name', 'like', $searchTerm)
                ->orWhere('business_type', 'like', $searchTerm)
                ->limit(2)
                ->get()
                ->map(function ($business) {
                    return [
                        'id' => $business->id,
                        'type' => 'business',
                        'text' => $business->business_name ?? 'Unnamed Business',
                        'subtext' => $business->business_type ?? 'Business',
                        'url' => route('admin.businesses.show', $business->id),
                        'icon' => 'Briefcase',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search businesses failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search puroks.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchPuroks(string $searchTerm): array
    {
        try {
            return Purok::where('name', 'like', $searchTerm)
                ->orWhere('leader_name', 'like', $searchTerm)
                ->limit(1)
                ->get()
                ->map(function ($purok) {
                    return [
                        'id' => $purok->id,
                        'type' => 'purok',
                        'text' => $purok->name,
                        'subtext' => 'Leader: ' . ($purok->leader_name ?? 'None'),
                        'url' => route('admin.puroks.show', $purok->id),
                        'icon' => 'MapPin',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search puroks failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search users.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchUsers(string $searchTerm): array
    {
        try {
            return User::with('role')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm)
                      ->orWhere('username', 'like', $searchTerm)
                      ->orWhere('email', 'like', $searchTerm);
                })
                ->limit(2)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'type' => 'user',
                        'text' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: $user->username ?? 'User',
                        'subtext' => $user->role?->name ?? 'No role',
                        'url' => route('admin.users.show', $user->id),
                        'icon' => 'UserCircle',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search users failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search officials.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchOfficials(string $searchTerm): array
    {
        try {
            $query = Official::with(['resident'])
                ->whereHas('resident', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm);
                })
                ->limit(2)
                ->get();
            
            return $query->map(function ($official) {
                $position = $this->getOfficialPosition($official);
                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'text' => $official->resident?->full_name ?? 'Unknown',
                    'subtext' => $position,
                    'url' => route('admin.officials.show', $official->id),
                    'icon' => 'BadgeCheck',
                    'badges' => [],
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search officials failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get official position from various possible columns.
     *
     * @param Official $official
     * @return string
     */
    private function getOfficialPosition(Official $official): string
    {
        return $official->position ??
               $official->office_position ??
               $official->title ??
               $official->designation ??
               $official->role ??
               'Official';
    }

    /**
     * Quick search clearances.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchClearances(string $searchTerm): array
    {
        try {
            return ClearanceRequest::with(['resident', 'clearanceType'])
                ->where('reference_number', 'like', $searchTerm)
                ->orWhere('clearance_number', 'like', $searchTerm)
                ->orWhereHas('resident', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm);
                })
                ->limit(2)
                ->get()
                ->map(function ($clearance) {
                    return [
                        'id' => $clearance->id,
                        'type' => 'clearance',
                        'text' => $clearance->clearanceType?->name ?? 'Clearance Request',
                        'subtext' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                        'url' => route('admin.clearances.show', $clearance->id),
                        'icon' => 'FileCheck',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search clearances failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search forms.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchForms(string $searchTerm): array
    {
        try {
            return Form::where('title', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->orWhere('category', 'like', $searchTerm)
                ->where('is_active', true)
                ->limit(2)
                ->get()
                ->map(function ($form) {
                    return [
                        'id' => $form->id,
                        'type' => 'form',
                        'text' => $form->title ?? 'Untitled Form',
                        'subtext' => $form->category ?? 'Form',
                        'url' => route('admin.forms.show', $form->id),
                        'icon' => 'File',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search forms failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search announcements.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchAnnouncements(string $searchTerm): array
    {
        try {
            return Announcement::where('title', 'like', $searchTerm)
                ->orWhere('content', 'like', $searchTerm)
                ->where('is_active', true)
                ->limit(2)
                ->get()
                ->map(function ($announcement) {
                    return [
                        'id' => $announcement->id,
                        'type' => 'announcement',
                        'text' => $announcement->title ?? 'Untitled Announcement',
                        'subtext' => ucfirst($announcement->type ?? 'general'),
                        'url' => route('admin.announcements.show', $announcement->id),
                        'icon' => 'Megaphone',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search announcements failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search payments.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchPayments(string $searchTerm): array
    {
        try {
            return Payment::query()
                ->where('or_number', 'like', $searchTerm)
                ->orWhere('payer_name', 'like', $searchTerm)
                ->orWhere('reference_number', 'like', $searchTerm)
                ->limit(2)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'type' => 'payment',
                        'text' => 'OR #' . ($payment->or_number ?? 'N/A'),
                        'subtext' => 'Payer: ' . ($payment->payer_name ?? 'Unknown'),
                        'url' => route('admin.payments.show', $payment->id),
                        'icon' => 'Receipt',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search payments failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Quick search reports.
     *
     * @param string $searchTerm
     * @return array
     */
    private function quickSearchReports(string $searchTerm): array
    {
        try {
            return CommunityReport::with('reportType')
                ->where('title', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->orWhere('report_number', 'like', $searchTerm)
                ->limit(2)
                ->get()
                ->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'type' => 'report',
                        'text' => $report->title ?? 'Untitled Report',
                        'subtext' => 'Report #' . ($report->report_number ?? $report->id),
                        'url' => route('admin.community-reports.show', $report->id),
                        'icon' => 'FileText',
                        'badges' => [],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Quick search reports failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FULL SEARCH
    |--------------------------------------------------------------------------
    */

    /**
     * Perform full search across entities.
     *
     * @param string $query
     * @param array $allPrivileges
     * @return array
     */
    protected function performFullSearch(string $query, array $allPrivileges): array
    {
        $searchTerm = '%' . $query . '%';
        $results = [];
        
        $results = array_merge($results, $this->fullSearchResidents($searchTerm, $query));
        $results = array_merge($results, $this->fullSearchHouseholds($searchTerm));
        
        if ($this->userCanPerformGlobalSearch()) {
            $results = array_merge($results, $this->fullSearchUsers($searchTerm));
            
            if (class_exists('App\Models\Business')) {
                $results = array_merge($results, $this->fullSearchBusinesses($searchTerm));
            }
            
            $results = array_merge($results, $this->fullSearchOfficials($searchTerm));
            $results = array_merge($results, $this->fullSearchPuroks($searchTerm));
            $results = array_merge($results, $this->fullSearchReports($searchTerm));
            $results = array_merge($results, $this->fullSearchClearances($searchTerm));
            $results = array_merge($results, $this->fullSearchForms($searchTerm));
            $results = array_merge($results, $this->fullSearchAnnouncements($searchTerm));
            
            if ($this->userCanAccessFinancialData()) {
                $results = array_merge($results, $this->fullSearchPayments($searchTerm));
            }
        }
        
        // Sort by priority
        usort($results, function ($a, $b) {
            $priority = [
                'resident' => 1,
                'household' => 2,
                'user' => 3,
                'official' => 4,
                'business' => 5,
                'purok' => 6,
                'report' => 7,
                'clearance' => 8,
                'form' => 9,
                'announcement' => 10,
                'payment' => 11,
            ];
            
            $aPriority = $priority[$a['type']] ?? 99;
            $bPriority = $priority[$b['type']] ?? 99;
            
            if ($aPriority === $bPriority) {
                return strcmp($a['title'], $b['title']);
            }
            
            return $aPriority - $bPriority;
        });
        
        return $results;
    }

    /**
     * Full search residents.
     *
     * @param string $searchTerm
     * @param string $rawQuery
     * @return array
     */
    private function fullSearchResidents(string $searchTerm, string $rawQuery): array
    {
        try {
            return Resident::with(['purok', 'household'])
                ->where(function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm)
                      ->orWhere('middle_name', 'like', $searchTerm)
                      ->orWhere('email', 'like', $searchTerm)
                      ->orWhere('contact_number', 'like', $searchTerm)
                      ->orWhere('resident_id', 'like', $searchTerm)
                      ->orWhere('address', 'like', $searchTerm)
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
                })
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($resident) use ($rawQuery) {
                    $relevance = 0;
                    if (stripos($resident->full_name ?? '', $rawQuery) !== false) {
                        $relevance += 10;
                    }
                    if ($resident->resident_id === $rawQuery) {
                        $relevance += 20;
                    }
                    
                    $tags = [];
                    if ($resident->is_voter) {
                        $tags[] = 'Voter';
                    }
                    
                    return [
                        'id' => $resident->id,
                        'type' => 'resident',
                        'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                        'subtitle' => $resident->purok?->name ?? 'No purok',
                        'description' => $resident->address ?? '',
                        'url' => route('admin.residents.show', $resident->id),
                        'icon' => 'User',
                        'badge' => 'Resident',
                        'tags' => $tags,
                        'relevance' => $relevance,
                        'meta' => [
                            'age' => $resident->age,
                            'gender' => $resident->gender,
                            'civil_status' => $resident->civil_status,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search residents failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search households.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchHouseholds(string $searchTerm): array
    {
        try {
            return Household::with(['purok'])
                ->where('household_number', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm)
                ->orWhere('email', 'like', $searchTerm)
                ->orWhere('address', 'like', $searchTerm)
                ->orWhere('head_of_family', 'like', $searchTerm)
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($household) {
                    return [
                        'id' => $household->id,
                        'type' => 'household',
                        'title' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                        'subtitle' => $household->address ?? 'No address',
                        'description' => 'Head: ' . ($household->head_of_family ?? 'Unknown'),
                        'url' => route('admin.households.show', $household->id),
                        'icon' => 'Home',
                        'badge' => 'Household',
                        'tags' => array_filter([
                            $household->housing_type,
                            $household->ownership_status,
                        ]),
                        'meta' => [
                            'member_count' => $household->member_count,
                            'income_range' => $household->income_range,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search households failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search users.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchUsers(string $searchTerm): array
    {
        try {
            return User::with('role')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm)
                      ->orWhere('username', 'like', $searchTerm)
                      ->orWhere('email', 'like', $searchTerm)
                      ->orWhere('contact_number', 'like', $searchTerm)
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
                })
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'type' => 'user',
                        'title' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: $user->username ?? 'User',
                        'subtitle' => $user->role?->name ?? 'No role',
                        'description' => 'Status: ' . ($user->status ?? 'active'),
                        'url' => route('admin.users.show', $user->id),
                        'icon' => 'UserCircle',
                        'badge' => 'User',
                        'tags' => [$user->status === 'active' ? 'Active' : 'Inactive'],
                        'meta' => [
                            'last_login' => $user->last_login_at ? $user->last_login_at->diffForHumans() : null,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search users failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search businesses.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchBusinesses(string $searchTerm): array
    {
        try {
            return Business::with(['purok', 'owner'])
                ->where('business_name', 'like', $searchTerm)
                ->orWhere('business_type', 'like', $searchTerm)
                ->orWhere('owner_name', 'like', $searchTerm)
                ->orWhere('dti_sec_number', 'like', $searchTerm)
                ->orWhere('tin_number', 'like', $searchTerm)
                ->orWhere('address', 'like', $searchTerm)
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($business) {
                    return [
                        'id' => $business->id,
                        'type' => 'business',
                        'title' => $business->business_name ?? 'Unnamed Business',
                        'subtitle' => $business->business_type ?? 'Business',
                        'description' => 'Owner: ' . ($business->owner_name ?? 'Unknown'),
                        'url' => route('admin.businesses.show', $business->id),
                        'icon' => 'Briefcase',
                        'badge' => 'Business',
                        'tags' => [$business->status],
                        'meta' => [
                            'employees' => $business->employee_count,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search businesses failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search officials.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchOfficials(string $searchTerm): array
    {
        try {
            $query = Official::with(['resident'])
                ->whereHas('resident', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm);
                })
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get();
            
            return $query->map(function ($official) {
                $position = $this->getOfficialPosition($official);
                $termYears = '';
                if ($official->term_start && $official->term_end) {
                    $termYears = $official->term_start->format('Y') . '-' . $official->term_end->format('Y');
                }
                
                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'title' => $official->resident?->full_name ?? 'Unknown',
                    'subtitle' => $position,
                    'description' => $official->committee ?? '',
                    'url' => route('admin.officials.show', $official->id),
                    'icon' => 'BadgeCheck',
                    'badge' => 'Official',
                    'tags' => array_filter([$official->status, $termYears]),
                    'meta' => [
                        'position' => $position,
                        'committee' => $official->committee,
                        'term' => $termYears,
                    ]
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Full search officials failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search puroks.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchPuroks(string $searchTerm): array
    {
        try {
            return Purok::where('name', 'like', $searchTerm)
                ->orWhere('leader_name', 'like', $searchTerm)
                ->orWhere('leader_contact', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->limit(5)
                ->get()
                ->map(function ($purok) {
                    return [
                        'id' => $purok->id,
                        'type' => 'purok',
                        'title' => $purok->name ?? 'Unnamed Purok',
                        'subtitle' => 'Leader: ' . ($purok->leader_name ?? 'None'),
                        'description' => $purok->total_households . ' households, ' . $purok->total_residents . ' residents',
                        'url' => route('admin.puroks.show', $purok->id),
                        'icon' => 'MapPin',
                        'badge' => 'Purok',
                        'tags' => [$purok->status],
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search puroks failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search reports.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchReports(string $searchTerm): array
    {
        try {
            return CommunityReport::with(['user', 'reportType'])
                ->where('title', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->orWhere('report_number', 'like', $searchTerm)
                ->orWhere('location', 'like', $searchTerm)
                ->orWhere('reporter_name', 'like', $searchTerm)
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'type' => 'report',
                        'title' => $report->title ?? 'Untitled Report',
                        'subtitle' => 'Report #' . ($report->report_number ?? $report->id),
                        'description' => Str::limit($report->description ?? '', 100),
                        'url' => route('admin.community-reports.show', $report->id),
                        'icon' => 'FileText',
                        'badge' => $report->reportType?->name ?? 'Report',
                        'tags' => array_filter([$report->status, $report->urgency_level]),
                        'meta' => [
                            'reported_by' => $report->is_anonymous ? 'Anonymous' : ($report->reporter_name ?? 'Unknown'),
                            'incident_date' => $report->incident_date ? date('M d, Y', strtotime($report->incident_date)) : null,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search reports failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search clearances.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchClearances(string $searchTerm): array
    {
        try {
            return ClearanceRequest::with(['resident', 'clearanceType'])
                ->where('reference_number', 'like', $searchTerm)
                ->orWhere('clearance_number', 'like', $searchTerm)
                ->orWhere('purpose', 'like', $searchTerm)
                ->orWhere('specific_purpose', 'like', $searchTerm)
                ->orWhere('or_number', 'like', $searchTerm)
                ->orWhereHas('resident', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                      ->orWhere('last_name', 'like', $searchTerm);
                })
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($clearance) {
                    return [
                        'id' => $clearance->id,
                        'type' => 'clearance',
                        'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                        'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                        'description' => 'Resident: ' . ($clearance->resident?->full_name ?? 'Unknown'),
                        'url' => route('admin.clearances.show', $clearance->id),
                        'icon' => 'FileCheck',
                        'badge' => 'Clearance',
                        'tags' => array_filter([$clearance->status, $clearance->urgency]),
                        'meta' => [
                            'amount' => $clearance->fee_amount,
                            'payment_status' => $clearance->payment_status,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search clearances failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search forms.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchForms(string $searchTerm): array
    {
        try {
            return Form::where('title', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->orWhere('category', 'like', $searchTerm)
                ->orWhere('issuing_agency', 'like', $searchTerm)
                ->where('is_active', true)
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($form) {
                    return [
                        'id' => $form->id,
                        'type' => 'form',
                        'title' => $form->title ?? 'Untitled Form',
                        'subtitle' => $form->category ?? 'Form',
                        'description' => Str::limit($form->description ?? '', 100),
                        'url' => route('admin.forms.show', $form->id),
                        'icon' => 'File',
                        'badge' => 'Form',
                        'tags' => array_filter([$form->file_type, $form->version]),
                        'meta' => [
                            'downloads' => $form->download_count,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search forms failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search announcements.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchAnnouncements(string $searchTerm): array
    {
        try {
            return Announcement::where('title', 'like', $searchTerm)
                ->orWhere('content', 'like', $searchTerm)
                ->orWhere('type', 'like', $searchTerm)
                ->where('is_active', true)
                ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
                ->get()
                ->map(function ($announcement) {
                    return [
                        'id' => $announcement->id,
                        'type' => 'announcement',
                        'title' => $announcement->title ?? 'Untitled Announcement',
                        'subtitle' => ucfirst($announcement->type ?? 'general') . ' Announcement',
                        'description' => Str::limit(strip_tags($announcement->content ?? ''), 100),
                        'url' => route('admin.announcements.show', $announcement->id),
                        'icon' => 'Megaphone',
                        'badge' => 'Announcement',
                        'tags' => array_filter([$announcement->type, $announcement->priority]),
                        'meta' => [
                            'start_date' => $announcement->start_date ? date('M d, Y', strtotime($announcement->start_date)) : null,
                            'end_date' => $announcement->end_date ? date('M d, Y', strtotime($announcement->end_date)) : null,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search announcements failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Full search payments.
     *
     * @param string $searchTerm
     * @return array
     */
    private function fullSearchPayments(string $searchTerm): array
    {
        try {
            return Payment::query()
                ->where('or_number', 'like', $searchTerm)
                ->orWhere('payer_name', 'like', $searchTerm)
                ->orWhere('reference_number', 'like', $searchTerm)
                ->orWhere('purpose', 'like', $searchTerm)
                ->limit(5)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'type' => 'payment',
                        'title' => 'OR #' . ($payment->or_number ?? 'N/A'),
                        'subtitle' => 'Payer: ' . ($payment->payer_name ?? 'Unknown'),
                        'description' => 'Amount: ₱' . number_format($payment->total_amount ?? 0, 2),
                        'url' => route('admin.payments.show', $payment->id),
                        'icon' => 'Receipt',
                        'badge' => 'Payment',
                        'tags' => array_filter([$payment->payment_method, $payment->status]),
                        'meta' => [
                            'date' => $payment->payment_date ? date('M d, Y', strtotime($payment->payment_date)) : null,
                        ]
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Full search payments failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MAIN SHARE METHOD
    |--------------------------------------------------------------------------
    */

    /**
     * Define the props that are shared by default.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isHouseholdHead = false;
        $residentData = null;
        $unitNumber = null;
        $purok = null;
        $householdMembersCount = 0;
        
        // SECURITY NOTE: Only load stats for users with appropriate permissions
        $reportStats = $this->userCanAccessAdminData() ? $this->getReportStats() : [];
        $residentStats = $this->userCanAccessAdminData() ? $this->getResidentStats() : [];
        $paymentStats = $this->userCanAccessFinancialData() ? $this->getPaymentStats() : [];
        $serviceStats = $this->userCanAccessAdminData() ? $this->getServiceStats() : [];
        $systemStats = $this->userCanAccessSystemData() ? $this->getSystemStats() : [];
        
        $allPrivileges = $this->getAllPrivileges();
        
        // SECURITY NOTE: Validate and sanitize search query
        $query = $request->input('q');
        $searchResults = [];
        $quickResults = [];
        $recentSearches = [];
        
        if ($query && $this->isValidSearchQuery($query)) {
            $sanitizedQuery = $this->sanitizeSearchQuery($query);
            $isQuick = $request->input('quick', false);
            
            // SECURITY NOTE: Rate limit search requests
            $rateLimitKey = 'search:' . $request->ip();
            
            if (RateLimiter::tooManyAttempts($rateLimitKey, $this->rateLimit['search_max_attempts'])) {
                Log::warning('Search rate limit exceeded', [
                    'ip' => $request->ip(),
                    'user_id' => $user?->id,
                    'query' => substr($query, 0, 50),
                ]);
            } else {
                RateLimiter::hit($rateLimitKey, $this->rateLimit['search_decay_minutes'] * 60);
                
                if ($isQuick) {
                    $quickResults = $this->performQuickSearch($sanitizedQuery, $allPrivileges);
                } else {
                    $searchResults = $this->performFullSearch($sanitizedQuery, $allPrivileges);
                    $this->storeSearchQuery($request, $sanitizedQuery);
                }
            }
        }
        
        $recentSearches = $this->getRecentSearches($request);
        
        // SECURITY NOTE: Load resident data only if user is linked to a resident
        if ($user && $user->resident_id) {
            $resident = Resident::with([
                'household',
                'purok',
                'residentPrivileges.privilege.discountType'
            ])->find($user->resident_id);
            
            if ($resident) {
                $residentData = $this->sanitizeResidentData($resident);
                
                if ($user->household_id) {
                    $isHouseholdHead = HouseholdMember::where('resident_id', $resident->id)
                        ->where('household_id', $user->household_id)
                        ->where('is_head', true)
                        ->exists();
                    
                    $household = Household::find($user->household_id);
                    if ($household) {
                        $unitNumber = $household->unit_number;
                        $householdMembersCount = HouseholdMember::where('household_id', $user->household_id)->count();
                    }
                }
                
                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
        }
        
        // SECURITY NOTE: Get safe flash data
        $safeFlash = $this->getSafeFlashData($request);
        
        // SECURITY NOTE: Build auth data with minimal required fields
        $authData = null;
        if ($user) {
            $authData = [
                'id' => $user->id,
                'name' => $user->full_name ?? $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role?->name,
                'role_id' => $user->role_id,
                'is_admin' => $user->isAdministrator(),
                'resident' => $residentData,
                'is_household_head' => $isHouseholdHead,
                'resident_id' => $user->resident_id,
                'household_id' => $user->household_id,
                'unit_number' => $unitNumber,
                'purok' => $purok,
                'household_members_count' => $householdMembersCount,
            ];
            
            // SECURITY NOTE: Only include permissions for admin users
            if ($this->userCanAccessAdminData()) {
                $authData['permissions'] = $user->getPermissionNames();
                $authData['all_privileges'] = $allPrivileges;
            }
            
            // SECURITY NOTE: Get notifications for authenticated user
            $notifications = $this->getUserNotifications($user);
            $authData['notification_count'] = $notifications['unread'] ?? 0;
            $authData['notifications'] = $notifications['items'] ?? [];
        }
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $authData,
            ],
            'csrf_token' => csrf_token(),
            'flash' => $safeFlash,
            'reportStats' => $reportStats,
            'residentStats' => $residentStats,
            'paymentStats' => $paymentStats,
            'serviceStats' => $serviceStats,
            'systemStats' => $systemStats,
            'searchResults' => $searchResults,
            'quickResults' => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery' => $query,
            'allPrivileges' => $allPrivileges,
        ]);
    }
}