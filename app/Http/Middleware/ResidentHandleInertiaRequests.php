<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;
use App\Models\Business;
use App\Models\ResidentDocument;
use App\Models\Purok;
use App\Models\User;
use App\Models\Official;
use App\Models\CommunityReport;
use App\Models\ClearanceRequest;
use App\Models\Form;
use App\Models\Announcement;
use App\Models\Payment;
use App\Models\Privilege;
use App\Helpers\NotificationHelper;

class ResidentHandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    
    /*
    |--------------------------------------------------------------------------
    | SECURITY CONFIGURATION
    |--------------------------------------------------------------------------
    */
    
    /**
     * Maximum search query length to prevent DoS attacks.
     */
    protected const MAX_SEARCH_LENGTH = 100;
    
    /**
     * Minimum search query length.
     */
    protected const MIN_SEARCH_LENGTH = 2;
    
    /**
     * Maximum results per entity type.
     */
    protected const MAX_SEARCH_RESULTS_PER_TYPE = 10;
    
    /**
     * Sensitive resident fields that should never be exposed.
     */
    protected array $sensitiveResidentFields = [
        'sss_number',
        'tin_number',
        'philhealth_number',
        'password',
        'remember_token',
    ];

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /*
    |--------------------------------------------------------------------------
    | PRIVILEGE METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * Get all active privileges - DYNAMIC FROM DATABASE
     * SECURITY NOTE: Cached to reduce database load
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges_resident', 300, function () {
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
                        ] : null,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get resident's active privileges
     * SECURITY NOTE: Only returns data for the authenticated resident
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
            $daysUntilExpiry = now()->diffInDays($residentPrivilege->expires_at, false);
            
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
     * Get privilege icon for display
     */
    private function getPrivilegeIcon(string $code): string
    {
        $icons = [
            'SC' => '👴', 'OSP' => '👴', 'PWD' => '♿',
            'SP' => '👨‍👧', 'SOLO_PARENT' => '👨‍👧',
            'IND' => '🏠', 'INDIGENT' => '🏠',
            '4PS' => '📦', 'IP' => '🌿',
            'FRM' => '🌾', 'FSH' => '🎣',
            'OFW' => '✈️', 'SCH' => '📚',
            'STUDENT' => '📚', 'UNE' => '💼',
            'VETERAN' => '🎖️',
        ];
        
        return $icons[$code] ?? '🎫';
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH VALIDATION AND SANITIZATION
    |--------------------------------------------------------------------------
    */

    /**
     * Validate search query format and length.
     * SECURITY NOTE: Prevents SQL injection and DoS attacks
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
            Log::warning('Suspicious search query rejected in resident portal', [
                'user_id' => Auth::id(),
                'ip' => request()->ip(),
            ]);
            return false;
        }
        
        return true;
    }

    /**
     * Sanitize search query for safe use in LIKE clauses.
     * SECURITY NOTE: Escapes special characters to prevent SQL injection
     *
     * @param string $query
     * @return string
     */
    private function sanitizeSearchQuery(string $query): string
    {
        $sanitized = trim($query);
        // Escape MySQL LIKE special characters
        $sanitized = addcslashes($sanitized, '%_\\');
        return $sanitized;
    }

    /*
    |--------------------------------------------------------------------------
    | MAIN SHARE METHOD
    |--------------------------------------------------------------------------
    */

    public function share(Request $request): array
    {
        $user = $request->user();
        $isHouseholdHead = false;
        $residentData = null;
        $unitNumber = null;
        $purok = null;
        $residentId = null;
        $householdMembersCount = 0;
        $householdMembers = [];
        $householdData = null;
        
        // Get all privileges for frontend
        $allPrivileges = $this->getAllPrivileges();
        
        // Notification data
        $notifications = [];
        $unreadNotificationCount = 0;
        
        // SECURITY NOTE: Validate and sanitize search query
        $query = $request->input('q');
        $searchResults = [];
        $quickResults = [];
        $recentSearches = [];
        
        if ($query && $this->isValidSearchQuery($query)) {
            $sanitizedQuery = $this->sanitizeSearchQuery($query);
            $isQuick = $request->input('quick', false);
            
            // SECURITY NOTE: Rate limit search requests
            $rateLimitKey = 'resident_search:' . $request->ip();
            
            if (RateLimiter::tooManyAttempts($rateLimitKey, 30)) {
                Log::warning('Resident search rate limit exceeded', [
                    'ip' => $request->ip(),
                    'user_id' => $user?->id,
                ]);
            } else {
                RateLimiter::hit($rateLimitKey, 60);
                
                if ($user && $user->resident_id) {
                    if ($isQuick) {
                        $quickResults = $this->performResidentQuickSearch($sanitizedQuery, $user->resident_id, $allPrivileges);
                    } else {
                        $searchResults = $this->performResidentFullSearch($sanitizedQuery, $user->resident_id, $allPrivileges);
                        $this->storeSearchQuery($request, $sanitizedQuery);
                    }
                }
            }
        }
        
        $recentSearches = $this->getRecentSearches($request);
        
        if ($user) {
            $resident = Resident::with([
                'household', 
                'purok',
                'residentPrivileges.privilege.discountType'
            ])->where('id', $user->resident_id)->first();
            
            if ($resident) {
                $residentId = $resident->id;
                
                // Get resident's active privileges
                $activePrivileges = $this->getResidentPrivileges($resident);
                
                // Build privilege flags
                $privilegeFlags = [];
                $privilegeIcons = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                    $privilegeFlags["has_{$code}"] = true;
                    $privilegeFlags["{$code}_id_number"] = $priv['id_number'];
                    $privilegeIcons[] = [
                        'code' => $priv['code'],
                        'icon' => $this->getPrivilegeIcon($priv['code']),
                        'name' => $priv['name'],
                        'discount_percentage' => $priv['discount_percentage'],
                    ];
                }
                
                // SECURITY NOTE: Sanitize resident data - only include necessary fields
                $residentData = array_merge([
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'middle_name' => $resident->middle_name,
                    'last_name' => $resident->last_name,
                    'suffix' => $resident->suffix,
                    'avatar' => $resident->avatar,
                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
                    'gender' => $resident->gender,
                    'is_voter' => $resident->is_voter,
                    
                    // Privilege data
                    'privileges' => $activePrivileges,
                    'privileges_count' => count($activePrivileges),
                    'has_privileges' => count($activePrivileges) > 0,
                    'privilege_icons' => $privilegeIcons,
                ], $privilegeFlags);
                
                if ($user->household_id) {
                    $isHouseholdHead = HouseholdMember::where('resident_id', $resident->id)
                        ->where('household_id', $user->household_id)
                        ->where('is_head', true)
                        ->exists();
                    
                    $household = Household::with(['purok'])
                        ->where('id', $user->household_id)
                        ->first();
                        
                    if ($household) {
                        $unitNumber = $household->unit_number ?? $household->household_number;
                        
                        // SECURITY NOTE: Only load minimal member data for frontend
                        $householdMembers = HouseholdMember::with(['resident.residentPrivileges.privilege.discountType'])
                            ->where('household_id', $user->household_id)
                            ->get()
                            ->map(function ($member) {
                                $resident = $member->resident;
                                if (!$resident) {
                                    return null;
                                }
                                
                                // Get member's active privileges (minimal data)
                                $memberPrivileges = $resident->residentPrivileges
                                    ?->filter(fn($rp) => $rp->isActive())
                                    ->map(function ($rp) {
                                        $privilege = $rp->privilege;
                                        return [
                                            'code' => $privilege->code,
                                            'name' => $privilege->name,
                                            'icon' => $this->getPrivilegeIcon($privilege->code),
                                            'discount_percentage' => (float) ($rp->discount_percentage ?? $privilege->discountType?->percentage ?? 0),
                                        ];
                                    })
                                    ->values()
                                    ->toArray() ?? [];
                                
                                $privilegeFlags = [];
                                foreach ($memberPrivileges as $priv) {
                                    $privilegeFlags["is_" . strtolower($priv['code'])] = true;
                                }
                                
                                // SECURITY NOTE: Return only necessary fields
                                return array_merge([
                                    'id' => $member->id,
                                    'resident_id' => $resident->id,
                                    'first_name' => $resident->first_name,
                                    'last_name' => $resident->last_name,
                                    'full_name' => $resident->full_name,
                                    'age' => $resident->age,
                                    'gender' => $resident->gender,
                                    'is_head' => $member->is_head,
                                    'relationship_to_head' => $member->relationship_to_head,
                                    'privileges' => $memberPrivileges,
                                    'has_privileges' => count($memberPrivileges) > 0,
                                ], $privilegeFlags);
                            })
                            ->filter()
                            ->values()
                            ->toArray();
                        
                        $householdMembersCount = count($householdMembers);
                        
                        // SECURITY NOTE: Only include necessary household fields
                        $householdData = [
                            'id' => $household->id,
                            'household_number' => $household->household_number,
                            'address' => $household->address,
                            'purok' => $household->purok?->name,
                            'member_count' => $household->member_count,
                        ];
                    }
                }
                
                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
            
            // SECURITY NOTE: Get notifications for authenticated user
            try {
                $rawNotifications = $user->notifications()
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get();
                
                $notifications = $rawNotifications->map(function ($notification) use ($user) {
                    $formatted = NotificationHelper::formatNotification($notification, $user);
                    
                    $notificationData = $formatted->data ?? [];
                    
                    // SECURITY NOTE: Convert admin links to portal links
                    $link = $notificationData['link'] ?? $formatted->url ?? '#';
                    if (str_starts_with($link, '/admin/')) {
                        $link = str_replace('/admin/', '/portal/', $link);
                    }
                    
                    $actionUrl = $notificationData['action_url'] ?? $notificationData['link'] ?? $formatted->url ?? '#';
                    if (str_starts_with($actionUrl, '/admin/')) {
                        $actionUrl = str_replace('/admin/', '/portal/', $actionUrl);
                    }
                    
                    // SECURITY NOTE: Return only necessary notification fields
                    return [
                        'id' => $formatted->id,
                        'type' => $formatted->type,
                        'data' => $notificationData,
                        'read_at' => $formatted->read_at,
                        'created_at_diff' => $formatted->created_at->diffForHumans(),
                        'title' => $formatted->title ?? 'Notification',
                        'message' => $formatted->message ?? 'New notification',
                        'link' => $link,
                        'action_url' => $actionUrl,
                        'is_announcement' => $formatted->is_announcement ?? false,
                        'is_fee_notification' => $formatted->is_fee_notification ?? false,
                        'is_clearance_notification' => $formatted->is_clearance_notification ?? false,
                        'status' => $formatted->status ?? null,
                        'type_icon' => $formatted->type_icon ?? null,
                        'type_color' => $formatted->type_color ?? null,
                    ];
                })->toArray();

                $unreadNotificationCount = NotificationHelper::getUnreadCount($user);
            } catch (\Exception $e) {
                // SECURITY NOTE: Log error but don't expose details to user
                Log::error('Failed to fetch resident notifications', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                $notifications = [];
                $unreadNotificationCount = 0;
            }
        }
        
        // SECURITY NOTE: Build auth data with minimal required fields
        $authData = null;
        if ($user) {
            $authData = [
                'id' => $user->id,
                'name' => $user->full_name ?? $user->name,
                'email' => $user->email,
                'role' => $user->role?->name,
                'resident' => $residentData,
                'is_household_head' => $isHouseholdHead,
                'resident_id' => $user->resident_id,
                'household_id' => $user->household_id,
                'unit_number' => $unitNumber,
                'purok' => $purok,
                'household_members_count' => $householdMembersCount,
                'household_members' => $householdMembers,
                'household' => $householdData,
                'notifications' => $notifications,
                'unread_notifications_count' => $unreadNotificationCount,
            ];
            
            // SECURITY NOTE: is_admin flag only for actual admins
            if ($user->isAdministrator()) {
                $authData['is_admin'] = true;
            }
        }
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $authData,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'searchResults' => $searchResults,
            'quickResults' => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery' => $query,
            'allPrivileges' => $allPrivileges,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH METHODS
    |--------------------------------------------------------------------------
    */

    /**
     * SECURITY NOTE: All search methods use parameterized queries and validate ownership
     */
    public function performResidentQuickSearch($query, $residentId, array $allPrivileges)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        $results = array_merge($results, $this->searchSelfResident($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchHouseholdMembers($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnClearances($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnPayments($searchTerm, $residentId, $allPrivileges));

        return array_slice($results, 0, 8);
    }

    public function performResidentFullSearch($query, $residentId, array $allPrivileges)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        $results = array_merge($results, $this->searchSelfResident($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchHouseholdMembers($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnClearances($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnBusinesses($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnPayments($searchTerm, $residentId, $allPrivileges));
        $results = array_merge($results, $this->searchOwnReports($searchTerm, $residentId, $allPrivileges));

        usort($results, function($a, $b) {
            $priority = [
                'self' => 1,
                'household_member' => 2,
                'clearance' => 3,
                'business' => 4,
                'payment' => 5,
                'report' => 6,
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

    public function searchSelfResident($searchTerm, $residentId, array $allPrivileges)
    {
        $resident = Resident::with(['purok', 'residentPrivileges.privilege.discountType'])
            ->where('id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm)
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
            })
            ->get();

        return $resident->map(function ($resident) use ($allPrivileges) {
            $activePrivileges = $resident->residentPrivileges
                ->filter(fn($rp) => $rp->isActive())
                ->map(function ($rp) {
                    $privilege = $rp->privilege;
                    return [
                        'code' => $privilege->code,
                        'name' => $privilege->name,
                        'icon' => $this->getPrivilegeIcon($privilege->code),
                    ];
                })
                ->values()
                ->toArray();

            $tags = array_map(fn($priv) => $priv['icon'] . ' ' . $priv['name'], $activePrivileges);

            return [
                'id' => $resident->id,
                'type' => 'self',
                'title' => 'My Profile',
                'subtitle' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                'url' => route('resident.profile.show'),
                'icon' => 'User',
                'badge' => 'You',
                'tags' => $tags,
            ];
        })->toArray();
    }

    public function searchHouseholdMembers($searchTerm, $residentId, array $allPrivileges)
    {
        $resident = Resident::find($residentId);
        if (!$resident || !$resident->household_id) {
            return [];
        }

        $householdMembers = HouseholdMember::with(['resident.residentPrivileges.privilege'])
            ->where('household_id', $resident->household_id)
            ->whereHas('resident', function($q) use ($searchTerm, $residentId) {
                $q->where('id', '!=', $residentId)
                    ->where(function($query) use ($searchTerm) {
                        $query->where('first_name', 'like', $searchTerm)
                            ->orWhere('last_name', 'like', $searchTerm)
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
                    });
            })
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get();

        return $householdMembers->map(function ($member) {
            $resident = $member->resident;
            
            $activePrivileges = $resident->residentPrivileges
                ->filter(fn($rp) => $rp->isActive())
                ->map(fn($rp) => $this->getPrivilegeIcon($rp->privilege->code))
                ->values()
                ->toArray();
            
            return [
                'id' => $resident->id,
                'type' => 'household_member',
                'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                'subtitle' => $member->is_head ? 'Head of Household' : $member->relationship_to_head,
                'url' => route('resident.profile.show') . '?tab=members',
                'icon' => 'Users',
                'badge' => 'Family Member',
                'tags' => $activePrivileges,
            ];
        })->toArray();
    }

    public function searchOwnClearances($searchTerm, $residentId, array $allPrivileges)
    {
        return ClearanceRequest::with(['clearanceType'])
            ->where('resident_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('reference_number', 'like', $searchTerm)
                    ->orWhere('clearance_number', 'like', $searchTerm)
                    ->orWhere('purpose', 'like', $searchTerm);
            })
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'description' => 'Status: ' . ucfirst($clearance->status),
                    'url' => route('portal.my.clearances.show', $clearance->id),
                    'icon' => 'FileCheck',
                    'badge' => 'My Clearance',
                    'tags' => [$clearance->status],
                ];
            })
            ->toArray();
    }

    public function searchOwnBusinesses($searchTerm, $residentId, array $allPrivileges)
    {
        if (!class_exists('App\Models\Business')) {
            return [];
        }

        return Business::with(['purok'])
            ->where('owner_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('business_name', 'like', $searchTerm)
                    ->orWhere('business_type', 'like', $searchTerm);
            })
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(function ($business) {
                return [
                    'id' => $business->id,
                    'type' => 'business',
                    'title' => $business->business_name ?? 'Unnamed Business',
                    'subtitle' => $business->business_type ?? 'Business',
                    'url' => route('portal.my.businesses.show', $business->id),
                    'icon' => 'Briefcase',
                    'badge' => 'My Business',
                    'tags' => [$business->status],
                ];
            })
            ->toArray();
    }

    public function searchOwnPayments($searchTerm, $residentId, array $allPrivileges)
    {
        return Payment::where('payer_type', 'resident')
            ->where('payer_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('or_number', 'like', $searchTerm)
                    ->orWhere('reference_number', 'like', $searchTerm);
            })
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'title' => 'OR #' . ($payment->or_number ?? 'N/A'),
                    'subtitle' => 'Amount: ₱' . number_format($payment->total_amount ?? 0, 2),
                    'url' => route('portal.my.payments.show', $payment->id),
                    'icon' => 'Receipt',
                    'badge' => 'My Payment',
                    'tags' => [$payment->status],
                ];
            })
            ->toArray();
    }

    public function searchOwnReports($searchTerm, $residentId, array $allPrivileges)
    {
        $resident = Resident::find($residentId);
        if (!$resident) {
            return [];
        }

        return CommunityReport::with(['reportType'])
            ->where(function($query) use ($resident, $searchTerm) {
                if ($resident->user_id) {
                    $query->where('user_id', $resident->user_id);
                } else {
                    $query->where('reporter_name', 'like', '%' . $resident->first_name . '%')
                        ->where('is_anonymous', false);
                }
            })
            ->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('report_number', 'like', $searchTerm);
            })
            ->limit(self::MAX_SEARCH_RESULTS_PER_TYPE)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'type' => 'report',
                    'title' => $report->title ?? 'Untitled Report',
                    'subtitle' => 'Report #' . ($report->report_number ?? $report->id),
                    'url' => route('portal.community-reports.show', $report->id),
                    'icon' => 'FileText',
                    'badge' => 'My Report',
                    'tags' => [$report->status],
                ];
            })
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH HISTORY MANAGEMENT
    |--------------------------------------------------------------------------
    */

    protected function storeSearchQuery(Request $request, $query): void
    {
        $query = substr($query, 0, 50);
        
        $recentSearches = $request->session()->get('recent_searches', []);
        
        $recentSearches = array_values(array_filter($recentSearches, fn($item) => $item !== $query));
        array_unshift($recentSearches, $query);
        
        $recentSearches = array_slice($recentSearches, 0, 5);
        
        $request->session()->put('recent_searches', $recentSearches);
    }

    protected function getRecentSearches(Request $request): array
    {
        return $request->session()->get('recent_searches', []);
    }
}