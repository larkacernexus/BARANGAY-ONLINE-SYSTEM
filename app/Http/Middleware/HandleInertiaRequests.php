<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
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
use Illuminate\Notifications\DatabaseNotification;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    private const MAX_SEARCH_LENGTH = 100;
    private const MIN_SEARCH_LENGTH = 2;
    private const MAX_SEARCH_RESULTS_PER_TYPE = 10;
    private const MAX_QUICK_SEARCH_RESULTS = 8;

    private array $cacheTtl = [
        'privileges'    => 300,
        'report_stats'  => 60,
        'resident_stats'=> 120,
        'payment_stats' => 60,
        'service_stats' => 120,
        'system_stats'  => 300,
    ];

    private array $rateLimit = [
        'search_max_attempts'  => 30,
        'search_decay_minutes' => 1,
    ];

    /*
    |--------------------------------------------------------------------------
    | INERTIA
    |--------------------------------------------------------------------------
    */

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /*
    |--------------------------------------------------------------------------
    | SHARED PROPS (ENTRY POINT)
    |--------------------------------------------------------------------------
    */

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth'          => ['user' => $this->buildAuthData($user)],
            'flash'         => $this->getSafeFlashData($request),
            ...$this->getStatsForUser(),
            ...$this->getSearchData($request),
            'allPrivileges' => $this->getAllPrivileges(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZATION
    |--------------------------------------------------------------------------
    */

    private function userCanAccessAdminData(): bool
    {
        $user = Auth::user();
        if (! $user) {
            return false;
        }

        return $user->isAdministrator()
            || $user->hasPermission('view-admin-dashboard')
            || ($user->role && ($user->role->is_system_role ?? false));
    }

    private function userCanAccessFinancialData(): bool
    {
        $user = Auth::user();
        if (! $user) {
            return false;
        }

        $financialRoles = ['Barangay Treasurer', 'Treasury Officer', 'Administrator'];

        return $user->isAdministrator()
            || $user->hasPermission('view-financial-data')
            || in_array($user->role?->name ?? '', $financialRoles, true);
    }

    private function userCanAccessSystemData(): bool
    {
        $user = Auth::user();
        if (! $user) {
            return false;
        }

        return $user->isAdministrator()
            || $user->hasPermission('manage-system');
    }

    private function userCanPerformGlobalSearch(): bool
    {
        return $this->userCanAccessAdminData();
    }

    /*
    |--------------------------------------------------------------------------
    | AUTH DATA
    |--------------------------------------------------------------------------
    */

    private function buildAuthData(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $residentData = $this->buildResidentData($user);

        $auth = [
            'id'                     => $user->id,
            'name'                   => $user->full_name ?? $user->name,
            'username'               => $user->username,
            'email'                  => $user->email,
            'role'                   => $user->role?->name,
            'role_id'                => $user->role_id,
            'is_admin'               => $user->isAdministrator(),
            'resident'               => $residentData,
            'is_household_head'      => $residentData['is_household_head'] ?? false,
            'resident_id'            => $user->resident_id,
            'household_id'           => $user->household_id,
            'unit_number'            => $residentData['unit_number'] ?? null,
            'purok'                  => $residentData['purok'] ?? null,
            'household_members_count'=> $residentData['household_members_count'] ?? 0,
        ];

        if ($this->userCanAccessAdminData()) {
            $auth['permissions']    = $user->getPermissionNames();
            $auth['all_privileges'] = $this->getAllPrivileges();
        }

        $notifications = $this->getUserNotifications($user);
        $auth['notification_count'] = $notifications['unread'];
        $auth['notifications']      = $notifications['items'];

        return $auth;
    }

    private function buildResidentData(User $user): ?array
    {
        if (! $user->resident_id) {
            return null;
        }

        $resident = Resident::with([
            'household',
            'purok',
            'residentPrivileges.privilege.discountType',
        ])->find($user->resident_id);

        if (! $resident) {
            return null;
        }

        $data = $this->sanitizeResidentData($resident);

        if ($user->household_id) {
            $data['is_household_head'] = HouseholdMember::query()
                ->where('resident_id', $resident->id)
                ->where('household_id', $user->household_id)
                ->where('is_head', true)
                ->exists();

            $household = Household::find($user->household_id);
            if ($household) {
                $data['unit_number']             = $household->unit_number;
                $data['household_members_count'] = HouseholdMember::query()
                    ->where('household_id', $user->household_id)
                    ->count();
            }
        }

        if ($resident->purok) {
            $data['purok'] = $resident->purok->name;
        }

        return $data;
    }

    private function sanitizeResidentData(Resident $resident): array
    {
        $privileges      = $this->getResidentPrivileges($resident);
        $privilegeFlags  = [];

        foreach ($privileges as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"]                  = true;
            $privilegeFlags["has_{$code}_privilege"]       = true;
            $privilegeFlags["{$code}_discount_percentage"] = $priv['discount_percentage'];
        }

        $data = [
            'id'               => $resident->id,
            'first_name'       => $resident->first_name,
            'middle_name'      => $resident->middle_name,
            'last_name'        => $resident->last_name,
            'suffix'           => $resident->suffix,
            'avatar'           => $resident->avatar,
            'gender'           => $resident->gender,
            'privileges'       => $privileges,
            'privileges_count' => count($privileges),
            'has_privileges'   => count($privileges) > 0,
        ];

        if ($this->userCanAccessAdminData()) {
            $data['birth_date']     = $resident->birth_date
                ? date('Y-m-d', strtotime($resident->birth_date))
                : null;
            $data['marital_status'] = $resident->marital_status;
            $data['phone_number']   = $resident->phone_number;
            $data['email']          = $resident->email;
        }

        return array_merge($data, $privilegeFlags);
    }

    private function getResidentPrivileges(Resident $resident): array
    {
        $user = Auth::user();
        if (! $user) {
            return [];
        }

        if ($user->resident_id !== $resident->id && ! $this->userCanAccessAdminData()) {
            return [];
        }

        if (! $resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege.discountType');
        }

        return $resident->residentPrivileges
            ->filter(fn ($rp) => $rp->isActive())
            ->map(function ($rp) {
                $privilege    = $rp->privilege;
                $discountType = $privilege?->discountType;

                return [
                    'id'                       => $rp->id,
                    'privilege_id'             => $privilege?->id,
                    'code'                     => $privilege?->code,
                    'name'                     => $privilege?->name,
                    'id_number'                => $this->userCanAccessAdminData()
                        ? $rp->id_number
                        : null,
                    'discount_percentage'      => $rp->discount_percentage
                        ?? $discountType?->percentage
                        ?? 0,
                    'discount_type_id'         => $discountType?->id,
                    'discount_type_code'       => $discountType?->code,
                    'discount_type_name'       => $discountType?->name,
                    'verified_at'              => $rp->verified_at?->toISOString(),
                    'expires_at'               => $rp->expires_at?->toISOString(),
                ];
            })
            ->values()
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | STATISTICS (LAZY-LOADED + AUTHORIZED)
    |--------------------------------------------------------------------------
    */

    private function getStatsForUser(): array
    {
        return [
            'reportStats'   => $this->userCanAccessAdminData()
                ? $this->getReportStats()
                : [],
            'residentStats' => $this->userCanAccessAdminData()
                ? $this->getResidentStats()
                : [],
            'paymentStats'  => $this->userCanAccessFinancialData()
                ? $this->getPaymentStats()
                : [],
            'serviceStats'  => $this->userCanAccessAdminData()
                ? $this->getServiceStats()
                : [],
            'systemStats'   => $this->userCanAccessSystemData()
                ? $this->getSystemStats()
                : [],
        ];
    }

    private function getReportStats(): array
    {
        if (! Schema::hasTable('community_reports')) {
            return $this->emptyReportStats();
        }

        return Cache::remember('sidebar_report_stats', $this->cacheTtl['report_stats'], function () {
            return [
                'total'              => CommunityReport::count(),
                'pending'            => CommunityReport::where('status', 'pending')->count(),
                'today'              => CommunityReport::whereDate('created_at', today())->count(),
                'under_review'       => CommunityReport::where('status', 'under_review')->count(),
                'resolved'           => CommunityReport::where('status', 'resolved')->count(),
                'rejected'           => CommunityReport::where('status', 'rejected')->count(),
                'high_priority'      => CommunityReport::query()
                    ->where(function ($q) {
                        $q->whereIn('priority', ['high', 'critical'])
                          ->orWhere('urgency_level', 'high');
                    })->count(),
                'pending_clearances' => ClearanceRequest::where('status', 'pending')->count(),
            ];
        });
    }

    private function emptyReportStats(): array
    {
        return [
            'total'              => 0,
            'pending'            => 0,
            'today'              => 0,
            'under_review'       => 0,
            'resolved'           => 0,
            'rejected'           => 0,
            'high_priority'      => 0,
            'pending_clearances' => 0,
        ];
    }

    private function getResidentStats(): array
    {
        if (! Schema::hasTable('residents')) {
            return $this->emptyResidentStats();
        }

        return Cache::remember('sidebar_resident_stats', $this->cacheTtl['resident_stats'], function () {
            return [
                'total'      => Resident::count(),
                'active'     => Resident::where('status', 'active')->count(),
                'inactive'   => Resident::where('status', 'inactive')->count(),
                'households' => Household::count(),
                'businesses' => class_exists(Business::class) && Schema::hasTable('businesses')
                    ? Business::count()
                    : 0,
                'voters'     => Resident::where('is_voter', true)->count(),
            ];
        });
    }

    private function emptyResidentStats(): array
    {
        return [
            'total'      => 0,
            'active'     => 0,
            'inactive'   => 0,
            'households' => 0,
            'businesses' => 0,
            'voters'     => 0,
        ];
    }

    private function getPaymentStats(): array
    {
        if (! Schema::hasTable('payments')) {
            return $this->emptyPaymentStats();
        }

        return Cache::remember('sidebar_payment_stats', $this->cacheTtl['payment_stats'], function () {
            return [
                'total_fees'          => class_exists(Fee::class) && Schema::hasTable('fees')
                    ? Fee::count()
                    : 0,
                'total_payments'      => Payment::count(),
                'pending_payments'     => Payment::where('status', 'pending')->count(),
                'total_revenue'        => (float) Payment::where('status', 'completed')
                    ->sum('total_amount'),
                'today_collections'    => (float) Payment::where('status', 'completed')
                    ->whereDate('payment_date', today())
                    ->sum('total_amount'),
                'monthly_collections'  => (float) Payment::where('status', 'completed')
                    ->whereYear('payment_date', now()->year)
                    ->whereMonth('payment_date', now()->month)
                    ->sum('total_amount'),
            ];
        });
    }

    private function emptyPaymentStats(): array
    {
        return [
            'total_fees'          => 0,
            'total_payments'      => 0,
            'pending_payments'     => 0,
            'total_revenue'        => 0,
            'today_collections'    => 0,
            'monthly_collections'  => 0,
        ];
    }

    private function getServiceStats(): array
    {
        return Cache::remember('sidebar_service_stats', $this->cacheTtl['service_stats'], function () {
            return [
                'total_forms'            => Schema::hasTable('forms')
                    ? Form::where('is_active', true)->count()
                    : 0,
                'total_privileges'       => Schema::hasTable('privileges')
                    ? Privilege::where('is_active', true)->count()
                    : 0,
                'active_announcements'   => Schema::hasTable('announcements')
                    ? Announcement::where('is_active', true)
                        ->where(function ($q) {
                            $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                        })->count()
                    : 0,
                'total_clearances'       => Schema::hasTable('clearance_requests')
                    ? ClearanceRequest::count()
                    : 0,
                'pending_clearances'     => Schema::hasTable('clearance_requests')
                    ? ClearanceRequest::where('status', 'pending')->count()
                    : 0,
                'approved_clearances'    => Schema::hasTable('clearance_requests')
                    ? ClearanceRequest::where('status', 'approved')->count()
                    : 0,
            ];
        });
    }

    private function getSystemStats(): array
    {
        return Cache::remember('sidebar_system_stats', $this->cacheTtl['system_stats'], function () {
            return [
                'total_users'    => User::count(),
                'total_roles'    => Schema::hasTable('roles')
                    ? \App\Models\Role::count()
                    : 0,
                'total_puroks'   => Purok::count(),
                'total_officials'=> Official::where('status', 'active')->count(),
            ];
        });
    }

    /*
    |--------------------------------------------------------------------------
    | PRIVILEGES
    |--------------------------------------------------------------------------
    */

    private function getAllPrivileges(): array
    {
        if (! $this->userCanAccessAdminData()) {
            return [];
        }

        if (! Schema::hasTable('privileges')) {
            return [];
        }

        return Cache::remember('all_active_privileges_with_discounts', $this->cacheTtl['privileges'], function () {
            return Privilege::with('discountType')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
                ->map(fn ($p) => [
                    'id'                         => $p->id,
                    'name'                       => $p->name,
                    'code'                       => $p->code,
                    'description'                => $p->description,
                    'discount_type_id'           => $p->discount_type_id,
                    'discount_type_code'         => $p->discountType?->code,
                    'discount_type_name'         => $p->discountType?->name,
                    'default_discount_percentage'=> $p->discountType?->percentage ?? 0,
                ])
                ->toArray();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    private function getUserNotifications(User $user): array
    {
        if (! Schema::hasTable('notifications')) {
            return ['unread' => 0, 'items' => []];
        }

        $unreadCount = Cache::remember(
            "user_notifications_unread:{$user->id}",
            30,
            fn () => DatabaseNotification::query()
                ->where('notifiable_type', User::class)
                ->where('notifiable_id', $user->id)
                ->whereNull('read_at')
                ->count()
        );

        $items = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($n) => [
                'id'             => $n->id,
                'type'           => str_replace('Notification', '', class_basename($n->type)),
                'data'           => $n->data,
                'read_at'        => $n->read_at?->diffForHumans(),
                'is_read'        => ! is_null($n->read_at),
                'created_at'     => $n->created_at->diffForHumans(),
                'created_at_raw' => $n->created_at->toISOString(),
            ])
            ->toArray();

        return [
            'unread' => $unreadCount,
            'items'  => $items,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | FLASH DATA
    |--------------------------------------------------------------------------
    */

    private function getSafeFlashData(Request $request): array
    {
        $flash = [];

        foreach (['success', 'error', 'warning', 'info'] as $key) {
            if ($request->session()->has($key)) {
                $flash[$key] = strip_tags((string) $request->session()->get($key));
            }
        }

        return $flash;
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    private function getSearchData(Request $request): array
    {
        $query = $request->input('q');

        $searchResults  = [];
        $quickResults   = [];
        $recentSearches = $this->getRecentSearches($request);

        if ($query && $this->isValidSearchQuery($query)) {
            $sanitized    = $this->sanitizeSearchQuery($query);
            $rateLimitKey = 'search:' . $request->ip();

            if (! RateLimiter::tooManyAttempts($rateLimitKey, $this->rateLimit['search_max_attempts'])) {
                RateLimiter::hit($rateLimitKey, $this->rateLimit['search_decay_minutes'] * 60);

                if ($request->input('quick', false)) {
                    $quickResults = $this->performQuickSearch($sanitized);
                } else {
                    $searchResults = $this->performFullSearch($sanitized, $query);
                    $this->storeSearchQuery($request, $sanitized);
                }
            }
        }

        return [
            'searchResults'  => $searchResults,
            'quickResults'   => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery'   => $query,
        ];
    }

    private function isValidSearchQuery(mixed $query): bool
    {
        if (! is_string($query)) {
            return false;
        }

        $length = mb_strlen($query);

        if ($length < self::MIN_SEARCH_LENGTH || $length > self::MAX_SEARCH_LENGTH) {
            return false;
        }

        // Reject suspicious patterns outright
        if (preg_match('/[<>"\'%;()]/', $query)
            && ! preg_match('/^[a-zA-Z0-9\s\-_.@]+$/', $query)) {
            return false;
        }

        return true;
    }

    private function sanitizeSearchQuery(string $query): string
    {
        // Escape only LIKE wildcards; no HTML encoding needed for Inertia props
        return addcslashes(trim($query), '%_\\');
    }

    private function storeSearchQuery(Request $request, string $query): void
    {
        $recent = $request->session()->get('recent_searches', []);
        $recent = array_values(array_filter($recent, fn ($item) => $item !== $query));
        array_unshift($recent, $query);
        $request->session()->put('recent_searches', array_slice($recent, 0, 5));
    }

    private function getRecentSearches(Request $request): array
    {
        return $request->session()->get('recent_searches', []);
    }

    /*
    |--------------------------------------------------------------------------
    | QUICK-SEARCH
    |--------------------------------------------------------------------------
    */

    private function performQuickSearch(string $query): array
    {
        $term    = '%' . $query . '%';
        $results = $this->quickSearchResidents($term);

        if (! $this->userCanPerformGlobalSearch()) {
            return array_slice($results, 0, self::MAX_QUICK_SEARCH_RESULTS);
        }

        $results = array_merge(
            $results,
            $this->quickSearchHouseholds($term),
            $this->quickSearchBusinesses($term),
            $this->quickSearchPuroks($term),
            $this->quickSearchUsers($term),
            $this->quickSearchOfficials($term),
            $this->quickSearchClearances($term),
            $this->quickSearchForms($term),
            $this->quickSearchAnnouncements($term),
            $this->quickSearchReports($term),
        );

        if ($this->userCanAccessFinancialData()) {
            $results = array_merge($results, $this->quickSearchPayments($term));
        }

        return array_slice($results, 0, self::MAX_QUICK_SEARCH_RESULTS);
    }

    private function quickSearchResidents(string $term): array
    {
        if (! Schema::hasTable('residents')) return [];

        return Resident::with('purok')
            ->where(fn ($q) => $q->where('first_name', 'like', $term)
                                 ->orWhere('last_name', 'like', $term))
            ->limit(3)
            ->get()
            ->map(fn ($r) => [
                'id'      => $r->id,
                'type'    => 'resident',
                'text'    => $r->full_name,
                'subtext' => $r->purok?->name ?? 'No purok',
                'url'     => route('admin.residents.show', $r->id),
            ])
            ->toArray();
    }

    private function quickSearchHouseholds(string $term): array
    {
        if (! Schema::hasTable('households')) return [];

        return Household::with('purok')
            ->where('household_number', 'like', $term)
            ->limit(2)
            ->get()
            ->map(fn ($h) => [
                'id'      => $h->id,
                'type'    => 'household',
                'text'    => 'Household ' . ($h->household_number ?? '#' . $h->id),
                'subtext' => $h->address ?? 'No address',
                'url'     => route('admin.households.show', $h->id),
            ])
            ->toArray();
    }

    private function quickSearchBusinesses(string $term): array
    {
        if (! class_exists(Business::class) || ! Schema::hasTable('businesses')) return [];

        return Business::with('purok')
            ->where('business_name', 'like', $term)
            ->limit(2)
            ->get()
            ->map(fn ($b) => [
                'id'      => $b->id,
                'type'    => 'business',
                'text'    => $b->business_name,
                'subtext' => $b->business_type ?? 'Business',
                'url'     => route('admin.businesses.show', $b->id),
            ])
            ->toArray();
    }

    private function quickSearchPuroks(string $term): array
    {
        if (! Schema::hasTable('puroks')) return [];

        return Purok::where('name', 'like', $term)
            ->limit(1)
            ->get()
            ->map(fn ($p) => [
                'id'   => $p->id,
                'type' => 'purok',
                'text' => $p->name,
                'url'  => route('admin.puroks.show', $p->id),
            ])
            ->toArray();
    }

    private function quickSearchUsers(string $term): array
    {
        if (! Schema::hasTable('users')) return [];

        return User::with('role')
            ->where(fn ($q) => $q->where('first_name', 'like', $term)
                                 ->orWhere('last_name', 'like', $term))
            ->limit(2)
            ->get()
            ->map(fn ($u) => [
                'id'      => $u->id,
                'type'    => 'user',
                'text'    => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
                'subtext' => $u->role?->name ?? 'No role',
                'url'     => route('admin.users.show', $u->id),
            ])
            ->toArray();
    }

    private function quickSearchOfficials(string $term): array
    {
        if (! Schema::hasTable('officials')) return [];

        return Official::with('resident')
            ->whereHas('resident', fn ($q) => $q->where('first_name', 'like', $term)
                                                 ->orWhere('last_name', 'like', $term))
            ->limit(2)
            ->get()
            ->map(fn ($o) => [
                'id'   => $o->id,
                'type' => 'official',
                'text' => $o->resident?->full_name ?? 'Unknown',
                'url'  => route('admin.officials.show', $o->id),
            ])
            ->toArray();
    }

    private function quickSearchClearances(string $term): array
    {
        if (! Schema::hasTable('clearance_requests')) return [];

        return ClearanceRequest::with('resident')
            ->where('reference_number', 'like', $term)
            ->limit(2)
            ->get()
            ->map(fn ($c) => [
                'id'   => $c->id,
                'type' => 'clearance',
                'text' => $c->clearanceType?->name ?? 'Clearance',
                'url'  => route('admin.clearances.show', $c->id),
            ])
            ->toArray();
    }

    private function quickSearchForms(string $term): array
    {
        if (! Schema::hasTable('forms')) return [];

        return Form::where('title', 'like', $term)
            ->where('is_active', true)
            ->limit(2)
            ->get()
            ->map(fn ($f) => [
                'id'   => $f->id,
                'type' => 'form',
                'text' => $f->title,
                'url'  => route('admin.forms.show', $f->id),
            ])
            ->toArray();
    }

    private function quickSearchAnnouncements(string $term): array
    {
        if (! Schema::hasTable('announcements')) return [];

        return Announcement::where('title', 'like', $term)
            ->where('is_active', true)
            ->limit(2)
            ->get()
            ->map(fn ($a) => [
                'id'   => $a->id,
                'type' => 'announcement',
                'text' => $a->title,
                'url'  => route('admin.announcements.show', $a->id),
            ])
            ->toArray();
    }

    private function quickSearchPayments(string $term): array
    {
        if (! Schema::hasTable('payments')) return [];

        return Payment::query()
            ->where('or_number', 'like', $term)
            ->limit(2)
            ->get()
            ->map(fn ($p) => [
                'id'   => $p->id,
                'type' => 'payment',
                'text' => 'OR #' . ($p->or_number ?? 'N/A'),
                'url'  => route('admin.payments.show', $p->id),
            ])
            ->toArray();
    }

    private function quickSearchReports(string $term): array
    {
        if (! Schema::hasTable('community_reports')) return [];

        return CommunityReport::with('reportType')
            ->where('title', 'like', $term)
            ->limit(2)
            ->get()
            ->map(fn ($r) => [
                'id'   => $r->id,
                'type' => 'report',
                'text' => $r->title ?? 'Untitled Report',
                'url'  => route('admin.community-reports.show', $r->id),
            ])
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | FULL-SEARCH
    |--------------------------------------------------------------------------
    */

    private function performFullSearch(string $sanitized, string $raw): array
    {
        $term    = '%' . $sanitized . '%';
        $results = array_merge(
            $this->fullSearchResidents($term, $raw),
            $this->fullSearchHouseholds($term),
        );

        if (! $this->userCanPerformGlobalSearch()) {
            usort($results, fn ($a, $b) => ($b['relevance'] ?? 0) <=> ($a['relevance'] ?? 0));
            return $results;
        }

        $results = array_merge(
            $results,
            $this->fullSearchUsers($term),
            $this->fullSearchBusinesses($term),
            $this->fullSearchOfficials($term),
            $this->fullSearchPuroks($term),
            $this->fullSearchReports($term),
            $this->fullSearchClearances($term),
            $this->fullSearchForms($term),
            $this->fullSearchAnnouncements($term),
        );

        if ($this->userCanAccessFinancialData()) {
            $results = array_merge($results, $this->fullSearchPayments($term));
        }

        usort($results, fn ($a, $b) => ($b['relevance'] ?? 0) <=> ($a['relevance'] ?? 0));

        return $results;
    }

    private function fullSearchResidents(string $term, string $raw): array
    {
        if (! Schema::hasTable('residents')) return [];

        return Resident::with(['purok', 'household'])
            ->where(fn ($q) => $q->where('first_name', 'like', $term)
                                 ->orWhere('last_name', 'like', $term)
                                 ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$term]))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($r) => [
                'id'          => $r->id,
                'type'        => 'resident',
                'title'       => $r->full_name,
                'subtitle'    => $r->purok?->name ?? 'No purok',
                'description' => $r->address ?? '',
                'url'         => route('admin.residents.show', $r->id),
                'relevance'   => (stripos($r->full_name ?? '', $raw) !== false ? 10 : 0)
                               + ($r->resident_id === $raw ? 20 : 0),
            ])
            ->toArray();
    }

    private function fullSearchHouseholds(string $term): array
    {
        if (! Schema::hasTable('households')) return [];

        return Household::with('purok')
            ->where('household_number', 'like', $term)
            ->orWhere('address', 'like', $term)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($h) => [
                'id'        => $h->id,
                'type'      => 'household',
                'title'     => 'Household ' . ($h->household_number ?? '#' . $h->id),
                'subtitle'  => $h->address ?? 'No address',
                'url'       => route('admin.households.show', $h->id),
                'relevance' => 5,
            ])
            ->toArray();
    }

    private function fullSearchUsers(string $term): array
    {
        if (! Schema::hasTable('users')) return [];

        return User::with('role')
            ->where(fn ($q) => $q->where('first_name', 'like', $term)
                                 ->orWhere('last_name', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($u) => [
                'id'        => $u->id,
                'type'      => 'user',
                'title'     => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
                'subtitle'  => $u->role?->name ?? 'No role',
                'url'       => route('admin.users.show', $u->id),
                'relevance' => 4,
            ])
            ->toArray();
    }

    private function fullSearchBusinesses(string $term): array
    {
        if (! class_exists(Business::class) || ! Schema::hasTable('businesses')) return [];

        return Business::with('purok')
            ->where('business_name', 'like', $term)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($b) => [
                'id'        => $b->id,
                'type'      => 'business',
                'title'     => $b->business_name,
                'subtitle'  => $b->business_type ?? 'Business',
                'url'       => route('admin.businesses.show', $b->id),
                'relevance' => 3,
            ])
            ->toArray();
    }

    private function fullSearchOfficials(string $term): array
    {
        if (! Schema::hasTable('officials')) return [];

        return Official::with('resident')
            ->whereHas('resident', fn ($q) => $q->where('first_name', 'like', $term)
                                                 ->orWhere('last_name', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($o) => [
                'id'        => $o->id,
                'type'      => 'official',
                'title'     => $o->resident?->full_name ?? 'Unknown',
                'url'       => route('admin.officials.show', $o->id),
                'relevance' => 3,
            ])
            ->toArray();
    }

    private function fullSearchPuroks(string $term): array
    {
        if (! Schema::hasTable('puroks')) return [];

        return Purok::where('name', 'like', $term)
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id'        => $p->id,
                'type'      => 'purok',
                'title'     => $p->name,
                'url'       => route('admin.puroks.show', $p->id),
                'relevance' => 2,
            ])
            ->toArray();
    }

    private function fullSearchReports(string $term): array
    {
        if (! Schema::hasTable('community_reports')) return [];

        return CommunityReport::with('reportType')
            ->where('title', 'like', $term)
            ->orWhere('report_number', 'like', $term)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($r) => [
                'id'        => $r->id,
                'type'      => 'report',
                'title'     => $r->title ?? 'Untitled Report',
                'subtitle'  => 'Report #' . ($r->report_number ?? $r->id),
                'url'       => route('admin.community-reports.show', $r->id),
                'relevance' => 1,
            ])
            ->toArray();
    }

    private function fullSearchClearances(string $term): array
    {
        if (! Schema::hasTable('clearance_requests')) return [];

        return ClearanceRequest::with('resident')
            ->where('reference_number', 'like', $term)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($c) => [
                'id'        => $c->id,
                'type'      => 'clearance',
                'title'     => $c->clearanceType?->name ?? 'Clearance',
                'url'       => route('admin.clearances.show', $c->id),
                'relevance' => 1,
            ])
            ->toArray();
    }

    private function fullSearchForms(string $term): array
    {
        if (! Schema::hasTable('forms')) return [];

        return Form::where('title', 'like', $term)
            ->where('is_active', true)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($f) => [
                'id'        => $f->id,
                'type'      => 'form',
                'title'     => $f->title,
                'url'       => route('admin.forms.show', $f->id),
                'relevance' => 1,
            ])
            ->toArray();
    }

    private function fullSearchAnnouncements(string $term): array
    {
        if (! Schema::hasTable('announcements')) return [];

        return Announcement::where('title', 'like', $term)
            ->where('is_active', true)
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($a) => [
                'id'        => $a->id,
                'type'      => 'announcement',
                'title'     => $a->title,
                'url'       => route('admin.announcements.show', $a->id),
                'relevance' => 1,
            ])
            ->toArray();
    }

    private function fullSearchPayments(string $term): array
    {
        if (! Schema::hasTable('payments')) return [];

        return Payment::query()
            ->where('or_number', 'like', $term)
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id'        => $p->id,
                'type'      => 'payment',
                'title'     => 'OR #' . ($p->or_number ?? 'N/A'),
                'url'       => route('admin.payments.show', $p->id),
                'relevance' => 1,
            ])
            ->toArray();
    }
}