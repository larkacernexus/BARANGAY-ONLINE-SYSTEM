<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;
use App\Models\Business;
use App\Models\CommunityReport;
use App\Models\ClearanceRequest;
use App\Models\Payment;
use App\Models\Privilege;
use App\Models\User;
use App\Helpers\NotificationHelper;

class ResidentHandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    private const MAX_SEARCH_LENGTH = 100;
    private const MIN_SEARCH_LENGTH = 2;
    private const MAX_SEARCH_RESULTS_PER_TYPE = 10;
    private const MAX_QUICK_SEARCH_RESULTS = 8;

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    // ----------------------------------------------------------------
    // PRIVILEGES
    // ----------------------------------------------------------------

    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges_resident', 300, function () {
            return Privilege::with('discountType')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
                ->map(fn ($privilege) => [
                    'id'                         => $privilege->id,
                    'name'                       => $privilege->name,
                    'code'                       => $privilege->code,
                    'description'                => $privilege->description,
                    'discount_type_id'           => $privilege->discount_type_id,
                    'default_discount_percentage' => (float) ($privilege->discountType?->percentage ?? 0),
                    'discount_type'              => $privilege->discountType ? [
                        'id'                   => $privilege->discountType->id,
                        'code'                 => $privilege->discountType->code,
                        'name'                 => $privilege->discountType->name,
                        'percentage'           => (float) $privilege->discountType->percentage,
                        'requires_id_number'   => (bool) $privilege->discountType->requires_id_number,
                        'requires_verification' => (bool) $privilege->discountType->requires_verification,
                    ] : null,
                ])
                ->toArray();
        });
    }

    private function getResidentPrivileges(Resident $resident): array
    {
        if (!$resident->relationLoaded('residentPrivileges')) {
            $resident->load('residentPrivileges.privilege.discountType');
        }

        return $resident->residentPrivileges
            ->filter(fn ($rp) => $rp->isActive())
            ->map(function ($rp) {
                $privilege         = $rp->privilege;
                $discountPercentage = $rp->discount_percentage
                    ?? $privilege->discountType?->percentage
                    ?? 0;

                return [
                    'id'                  => $rp->id,
                    'privilege_id'        => $privilege->id,
                    'code'                => $privilege->code,
                    'name'                => $privilege->name,
                    'id_number'           => $rp->id_number,
                    'discount_percentage' => (float) $discountPercentage,
                    'verified_at'         => $rp->verified_at?->toISOString(),
                    'expires_at'          => $rp->expires_at?->toISOString(),
                    'status'              => $this->privilegeStatus($rp),
                    'discount_type'       => $privilege->discountType ? [
                        'id'         => $privilege->discountType->id,
                        'code'       => $privilege->discountType->code,
                        'name'       => $privilege->discountType->name,
                        'percentage' => (float) $privilege->discountType->percentage,
                    ] : null,
                ];
            })
            ->values()
            ->toArray();
    }

    private function privilegeStatus($rp): string
    {
        if (!$rp->verified_at) {
            return 'pending';
        }

        if ($rp->expires_at && now()->diffInDays($rp->expires_at, false) <= 0) {
            return 'expired';
        }

        if ($rp->expires_at && now()->diffInDays($rp->expires_at, false) <= 30) {
            return 'expiring_soon';
        }

        return 'active';
    }

    private function privilegeIcon(string $code): string
    {
        return match ($code) {
            'SC', 'OSP'    => '👴',
            'PWD'           => '♿',
            'SP', 'SOLO_PARENT' => '👨‍👧',
            'IND', 'INDIGENT'   => '🏠',
            '4PS'           => '📦',
            'IP'            => '🌿',
            'FRM'           => '🌾',
            'FSH'           => '🎣',
            'OFW'           => '✈️',
            'SCH', 'STUDENT' => '📚',
            'UNE'           => '💼',
            'VETERAN'       => '🎖️',
            default         => '🎫',
        };
    }

    // ----------------------------------------------------------------
    // SEARCH VALIDATION
    // ----------------------------------------------------------------

    private function isValidSearchQuery(mixed $query): bool
    {
        if (!is_string($query)) {
            return false;
        }

        $length = mb_strlen($query);

        if ($length < self::MIN_SEARCH_LENGTH || $length > self::MAX_SEARCH_LENGTH) {
            return false;
        }

        if (preg_match('/[<>"\'%;()]/', $query)
            && !preg_match('/^[a-zA-Z0-9\s\-_.@]+$/', $query)) {
            return false;
        }

        return true;
    }

    private function sanitizeSearchQuery(string $query): string
    {
        return addcslashes(trim($query), '%_\\');
    }

    // ----------------------------------------------------------------
    // SHARE
    // ----------------------------------------------------------------

    public function share(Request $request): array
    {
        $user = $request->user();

        $allPrivileges = $this->getAllPrivileges();

        [
            'searchResults'  => $searchResults,
            'quickResults'   => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery'   => $query,
        ] = $this->search($request);

        $authData = $user ? $this->buildAuthData($user, $allPrivileges) : null;

        return array_merge(parent::share($request), [
            'auth'          => ['user' => $authData],
            'flash'         => fn () => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
            ],
            'searchResults'  => $searchResults,
            'quickResults'   => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery'   => $query,
            'allPrivileges'  => $allPrivileges,
        ]);
    }

    // ----------------------------------------------------------------
    // AUTH DATA
    // ----------------------------------------------------------------

    private function buildAuthData(User $user, array $allPrivileges): array
    {
        $residentData   = null;
        $isHouseholdHead = false;
        $unitNumber      = null;
        $purok           = null;
        $householdMembersCount = 0;
        $householdMembers      = [];
        $householdData         = null;

        if ($user->resident_id) {
            $resident = Resident::with([
                'household',
                'purok',
                'residentPrivileges.privilege.discountType',
            ])->find($user->resident_id);

            if ($resident) {
                $residentData = $this->buildResidentData($resident);

                if ($user->household_id) {
                    $isHouseholdHead = HouseholdMember::query()
                        ->where('resident_id', $resident->id)
                        ->where('household_id', $user->household_id)
                        ->where('is_head', true)
                        ->exists();

                    $household = Household::with('purok')->find($user->household_id);

                    if ($household) {
                        $unitNumber = $household->unit_number ?? $household->household_number;

                        $householdMembers = HouseholdMember::with('resident.residentPrivileges.privilege.discountType')
                            ->where('household_id', $user->household_id)
                            ->get()
                            ->map(fn ($member) => $this->formatHouseholdMember($member))
                            ->filter()
                            ->values()
                            ->toArray();

                        $householdMembersCount = count($householdMembers);

                        $householdData = [
                            'id'               => $household->id,
                            'household_number' => $household->household_number,
                            'address'          => $household->address,
                            'purok'            => $household->purok?->name,
                            'member_count'     => $household->member_count,
                        ];
                    }
                }

                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
        }

        $notifications         = $this->getNotifications($user);
        $unreadNotificationCount = $notifications['unread'];

        $data = [
            'id'                        => $user->id,
            'name'                      => $user->full_name ?? $user->name,
            'email'                     => $user->email,
            'role'                      => $user->role?->name,
            'resident'                  => $residentData,
            'is_household_head'         => $isHouseholdHead,
            'resident_id'               => $user->resident_id,
            'household_id'              => $user->household_id,
            'unit_number'               => $unitNumber,
            'purok'                     => $purok,
            'household_members_count'   => $householdMembersCount,
            'household_members'         => $householdMembers,
            'household'                 => $householdData,
            'notifications'             => $notifications['items'],
            'unread_notifications_count' => $unreadNotificationCount,
        ];

        if ($user->isAdministrator()) {
            $data['is_admin'] = true;
        }

        return $data;
    }

    private function buildResidentData(Resident $resident): array
    {
        $activePrivileges = $this->getResidentPrivileges($resident);

        $privilegeFlags  = [];
        $privilegeIcons  = [];

        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"]          = true;
            $privilegeFlags["has_{$code}"]          = true;
            $privilegeFlags["{$code}_id_number"]    = $priv['id_number'];
            $privilegeIcons[] = [
                'code'                => $priv['code'],
                'icon'                => $this->privilegeIcon($priv['code']),
                'name'                => $priv['name'],
                'discount_percentage' => $priv['discount_percentage'],
            ];
        }

        return array_merge([
            'id'               => $resident->id,
            'first_name'       => $resident->first_name,
            'middle_name'      => $resident->middle_name,
            'last_name'        => $resident->last_name,
            'suffix'           => $resident->suffix,
            'avatar'           => $resident->avatar,
            'birth_date'       => $resident->birth_date?->format('Y-m-d'),
            'gender'           => $resident->gender,
            'is_voter'         => $resident->is_voter,
            'privileges'       => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges'   => count($activePrivileges) > 0,
            'privilege_icons'  => $privilegeIcons,
        ], $privilegeFlags);
    }

    private function formatHouseholdMember($member): ?array
    {
        $resident = $member->resident;
        if (!$resident) {
            return null;
        }

        $memberPrivileges = $resident->residentPrivileges
            ?->filter(fn ($rp) => $rp->isActive())
            ->map(function ($rp) {
                $privilege = $rp->privilege;
                return [
                    'code'                => $privilege->code,
                    'name'                => $privilege->name,
                    'icon'                => $this->privilegeIcon($privilege->code),
                    'discount_percentage' => (float) ($rp->discount_percentage
                        ?? $privilege->discountType?->percentage
                        ?? 0),
                ];
            })
            ->values()
            ->toArray() ?? [];

        $privilegeFlags = [];
        foreach ($memberPrivileges as $priv) {
            $privilegeFlags['is_' . strtolower($priv['code'])] = true;
        }

        return array_merge([
            'id'                   => $member->id,
            'resident_id'          => $resident->id,
            'first_name'           => $resident->first_name,
            'last_name'            => $resident->last_name,
            'full_name'            => $resident->full_name,
            'age'                  => $resident->age,
            'gender'               => $resident->gender,
            'is_head'              => $member->is_head,
            'relationship_to_head' => $member->relationship_to_head,
            'privileges'           => $memberPrivileges,
            'has_privileges'       => count($memberPrivileges) > 0,
        ], $privilegeFlags);
    }

    // ----------------------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------------------

    private function getNotifications(User $user): array
    {
        $raw = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $items = $raw->map(function ($notification) use ($user) {
            $formatted = NotificationHelper::formatNotification($notification, $user);
            $data      = $formatted->data ?? [];

            $link = $data['link'] ?? $formatted->url ?? '#';
            if (str_starts_with($link, '/admin/')) {
                $link = str_replace('/admin/', '/portal/', $link);
            }

            $actionUrl = $data['action_url'] ?? $data['link'] ?? $formatted->url ?? '#';
            if (str_starts_with($actionUrl, '/admin/')) {
                $actionUrl = str_replace('/admin/', '/portal/', $actionUrl);
            }

            return [
                'id'                       => $formatted->id,
                'type'                     => $formatted->type,
                'data'                     => $data,
                'read_at'                  => $formatted->read_at,
                'created_at_diff'          => $formatted->created_at->diffForHumans(),
                'title'                    => $formatted->title ?? 'Notification',
                'message'                  => $formatted->message ?? 'New notification',
                'link'                     => $link,
                'action_url'               => $actionUrl,
                'is_announcement'          => $formatted->is_announcement ?? false,
                'is_fee_notification'      => $formatted->is_fee_notification ?? false,
                'is_clearance_notification' => $formatted->is_clearance_notification ?? false,
                'status'                   => $formatted->status ?? null,
                'type_icon'                => $formatted->type_icon ?? null,
                'type_color'               => $formatted->type_color ?? null,
            ];
        })->toArray();

        return [
            'unread' => NotificationHelper::getUnreadCount($user),
            'items'  => $items,
        ];
    }

    // ----------------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------------

    private function search(Request $request): array
    {
        $query = $request->input('q');

        $searchResults  = [];
        $quickResults   = [];
        $recentSearches = $this->getRecentSearches($request);

        if ($query && $this->isValidSearchQuery($query)) {
            $sanitized    = $this->sanitizeSearchQuery($query);
            $rateLimitKey = 'resident_search:' . $request->ip();

            if (!RateLimiter::tooManyAttempts($rateLimitKey, 30)) {
                RateLimiter::hit($rateLimitKey, 60);

                $user = $request->user();

                if ($user && $user->resident_id) {
                    if ($request->input('quick', false)) {
                        $quickResults = $this->quickSearch($sanitized, $user->resident_id);
                    } else {
                        $searchResults = $this->fullSearch($sanitized, $user->resident_id);
                        $this->storeSearchQuery($request, $sanitized);
                    }
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

    private function quickSearch(string $query, int $residentId): array
    {
        $term = '%' . $query . '%';

        return array_slice(array_merge(
            $this->searchSelf($term, $residentId),
            $this->searchHouseholdMembers($term, $residentId),
            $this->searchClearances($term, $residentId),
            $this->searchPayments($term, $residentId),
        ), 0, self::MAX_QUICK_SEARCH_RESULTS);
    }

    private function fullSearch(string $query, int $residentId): array
    {
        $term = '%' . $query . '%';

        $results = array_merge(
            $this->searchSelf($term, $residentId),
            $this->searchHouseholdMembers($term, $residentId),
            $this->searchClearances($term, $residentId),
            $this->searchBusinesses($term, $residentId),
            $this->searchPayments($term, $residentId),
            $this->searchReports($term, $residentId),
        );

        usort($results, fn ($a, $b) => ($a['_sort'] ?? 99) <=> ($b['_sort'] ?? 99));

        return $results;
    }

    private function searchSelf(string $term, int $residentId): array
    {
        $resident = Resident::with('purok', 'residentPrivileges.privilege.discountType')
            ->where('id', $residentId)
            ->where(fn ($q) => $q->where('first_name', 'like', $term)
                                 ->orWhere('last_name', 'like', $term)
                                 ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$term]))
            ->first();

        if (!$resident) {
            return [];
        }

        $tags = $resident->residentPrivileges
            ->filter(fn ($rp) => $rp->isActive())
            ->map(fn ($rp) => $this->privilegeIcon($rp->privilege->code) . ' ' . $rp->privilege->name)
            ->values()
            ->toArray();

        return [[
            'id'       => $resident->id,
            'type'     => 'self',
            'title'    => 'My Profile',
            'subtitle' => $resident->full_name,
            'url'      => route('resident.profile.show'),
            'icon'     => 'User',
            'badge'    => 'You',
            'tags'     => $tags,
            '_sort'    => 1,
        ]];
    }

    private function searchHouseholdMembers(string $term, int $residentId): array
    {
        $resident = Resident::find($residentId);
        if (!$resident?->household_id) {
            return [];
        }

        return HouseholdMember::with('resident.residentPrivileges.privilege')
            ->where('household_id', $resident->household_id)
            ->whereHas('resident', fn ($q) => $q->where('id', '!=', $residentId)
                ->where(fn ($q2) => $q2->where('first_name', 'like', $term)
                                      ->orWhere('last_name', 'like', $term)
                                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$term])))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(function ($member) {
                $r = $member->resident;
                $icons = $r->residentPrivileges
                    ->filter(fn ($rp) => $rp->isActive())
                    ->map(fn ($rp) => $this->privilegeIcon($rp->privilege->code))
                    ->values()
                    ->toArray();

                return [
                    'id'       => $r->id,
                    'type'     => 'household_member',
                    'title'    => $r->full_name,
                    'subtitle' => $member->is_head ? 'Head of Household' : $member->relationship_to_head,
                    'url'      => route('resident.profile.show') . '?tab=members',
                    'icon'     => 'Users',
                    'badge'    => 'Family Member',
                    'tags'     => $icons,
                    '_sort'    => 2,
                ];
            })
            ->toArray();
    }

    private function searchClearances(string $term, int $residentId): array
    {
        return ClearanceRequest::with('clearanceType')
            ->where('resident_id', $residentId)
            ->where(fn ($q) => $q->where('reference_number', 'like', $term)
                                 ->orWhere('clearance_number', 'like', $term)
                                 ->orWhere('purpose', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($c) => [
                'id'       => $c->id,
                'type'     => 'clearance',
                'title'    => $c->clearanceType?->name ?? 'Clearance Request',
                'subtitle' => 'Ref: ' . ($c->reference_number ?? 'N/A'),
                'url'      => route('portal.my.clearances.show', $c->id),
                'icon'     => 'FileCheck',
                'badge'    => 'My Clearance',
                'tags'     => [$c->status],
                '_sort'    => 3,
            ])
            ->toArray();
    }

    private function searchBusinesses(string $term, int $residentId): array
    {
        if (!class_exists(Business::class)) {
            return [];
        }

        return Business::with('purok')
            ->where('owner_id', $residentId)
            ->where(fn ($q) => $q->where('business_name', 'like', $term)
                                 ->orWhere('business_type', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($b) => [
                'id'       => $b->id,
                'type'     => 'business',
                'title'    => $b->business_name ?? 'Unnamed Business',
                'subtitle' => $b->business_type ?? 'Business',
                'url'      => route('portal.my.businesses.show', $b->id),
                'icon'     => 'Briefcase',
                'badge'    => 'My Business',
                'tags'     => [$b->status],
                '_sort'    => 4,
            ])
            ->toArray();
    }

    private function searchPayments(string $term, int $residentId): array
    {
        return Payment::where('payer_type', 'resident')
            ->where('payer_id', $residentId)
            ->where(fn ($q) => $q->where('or_number', 'like', $term)
                                 ->orWhere('reference_number', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($p) => [
                'id'       => $p->id,
                'type'     => 'payment',
                'title'    => 'OR #' . ($p->or_number ?? 'N/A'),
                'subtitle' => 'Amount: ₱' . number_format($p->total_amount ?? 0, 2),
                'url'      => route('portal.my.payments.show', $p->id),
                'icon'     => 'Receipt',
                'badge'    => 'My Payment',
                'tags'     => [$p->status],
                '_sort'    => 5,
            ])
            ->toArray();
    }

    private function searchReports(string $term, int $residentId): array
    {
        $resident = Resident::find($residentId);
        if (!$resident) {
            return [];
        }

        return CommunityReport::with('reportType')
            ->where(function ($q) use ($resident) {
                if ($resident->user_id) {
                    $q->where('user_id', $resident->user_id);
                } else {
                    $q->where('reporter_name', 'like', '%' . $resident->first_name . '%')
                      ->where('is_anonymous', false);
                }
            })
            ->where(fn ($q) => $q->where('title', 'like', $term)
                                 ->orWhere('report_number', 'like', $term))
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(fn ($r) => [
                'id'       => $r->id,
                'type'     => 'report',
                'title'    => $r->title ?? 'Untitled Report',
                'subtitle' => 'Report #' . ($r->report_number ?? $r->id),
                'url'      => route('portal.community-reports.show', $r->id),
                'icon'     => 'FileText',
                'badge'    => 'My Report',
                'tags'     => [$r->status],
                '_sort'    => 6,
            ])
            ->toArray();
    }

    // ----------------------------------------------------------------
    // SEARCH HISTORY
    // ----------------------------------------------------------------

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
}