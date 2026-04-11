<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
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
use App\Helpers\NotificationHelper;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Get all active privileges with their discount types - DYNAMIC FROM DATABASE
     * ✅ FIXED: Verification fields now come from DiscountType, not Privilege
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges_with_discounts', 3600, function () {
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
                        'verification_document' => $discountType?->verification_document,
                        'validity_days' => $discountType?->validity_days ?? 0,
                        'priority' => $discountType?->priority ?? 100,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get resident's active privileges with discount info
     * ✅ FIXED: Get discount percentage from DiscountType using 'percentage'
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
                $discountType = $privilege?->discountType;
                
                return [
                    'id' => $rp->id,
                    'privilege_id' => $privilege?->id,
                    'code' => $privilege?->code,
                    'name' => $privilege?->name,
                    'id_number' => $rp->id_number,
                    'discount_percentage' => $rp->discount_percentage ?? $discountType?->percentage ?? 0,
                    'discount_type_id' => $discountType?->id,
                    'discount_type_code' => $discountType?->code,
                    'discount_type_name' => $discountType?->name,
                    'requires_id_number' => $discountType?->requires_id_number ?? false,
                    'requires_verification' => $discountType?->requires_verification ?? false,
                    'verification_document' => $discountType?->verification_document,
                    'validity_days' => $discountType?->validity_days ?? 0,
                    'verified_at' => $rp->verified_at?->toISOString(),
                    'expires_at' => $rp->expires_at?->toISOString(),
                ];
            })
            ->values()
            ->toArray();
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $isHouseholdHead = false;
        $residentData = null;
        $unitNumber = null;
        $purok = null;
        $residentId = null;
        $householdMembersCount = 0;
        
        // Get all privileges for frontend
        $allPrivileges = $this->getAllPrivileges();
        
        // Handle search queries
        $searchResults = [];
        $quickResults = [];
        $recentSearches = [];
        
        // ============ NOTIFICATION DATA ============
        $notifications = [];
        $unreadNotificationCount = 0;

        $query = $request->input('q');
        $isQuick = $request->input('quick', false);
        
        // If there's a search query, perform search
        if ($query && strlen($query) >= 2) {
            if ($isQuick) {
                $quickResults = $this->performQuickSearch($query, $allPrivileges);
            } else {
                $searchResults = $this->performFullSearch($query, $allPrivileges);
                $this->storeSearchQuery($request, $query);
            }
        }
        
        // Get recent searches from session
        $recentSearches = $this->getRecentSearches($request);
        
        if ($user) {
            // Get resident with privileges and discount types
            $resident = Resident::with([
                'household',
                'purok',
                'residentPrivileges.privilege.discountType'
            ])->where('id', $user->resident_id)->first();
            
            if ($resident) {
                $residentId = $resident->id;
                
                // Get resident's active privileges with discount info
                $activePrivileges = $this->getResidentPrivileges($resident);
                
                // DYNAMIC privilege flags (from discount type codes)
                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                    $privilegeFlags["has_{$code}_privilege"] = true;
                    $privilegeFlags["{$code}_id_number"] = $priv['id_number'];
                    $privilegeFlags["{$code}_discount_percentage"] = $priv['discount_percentage'];
                }
                
                $residentData = array_merge([
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'middle_name' => $resident->middle_name,
                    'last_name' => $resident->last_name,
                    'suffix' => $resident->suffix,
                    'avatar' => $resident->avatar,
                    'birth_date' => $resident->birth_date ? date('Y-m-d', strtotime($resident->birth_date)) : null,
                    'gender' => $resident->gender,
                    'marital_status' => $resident->marital_status,
                    'phone_number' => $resident->phone_number,
                    'email' => $resident->email,
                    
                    // DYNAMIC privilege data with discount info
                    'privileges' => $activePrivileges,
                    'privileges_count' => count($activePrivileges),
                    'has_privileges' => count($activePrivileges) > 0,
                ], $privilegeFlags);
                
                // Check if resident is household head
                if ($user->household_id) {
                    $isHouseholdHead = HouseholdMember::where('resident_id', $resident->id)
                        ->where('household_id', $user->household_id)
                        ->where('is_head', true)
                        ->exists();
                    
                    // Get unit number from household
                    $household = Household::find($user->household_id);
                    if ($household) {
                        $unitNumber = $household->unit_number;
                        
                        // Get household members count
                        $householdMembersCount = HouseholdMember::where('household_id', $user->household_id)->count();
                    }
                }
                
                // Get purok
                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
        }
        
        // ============ FLASH DATA HANDLING ============
        $flashData = [];
        
        // Get all flash keys from session
        $flashKeys = $request->session()->get('_flash', []);
        
        // Handle both array and object formats
        if (is_array($flashKeys)) {
            foreach ($flashKeys as $key) {
                if (is_string($key) || is_int($key)) {
                    $value = $request->session()->get($key);
                    if (!is_null($value)) {
                        $flashData[$key] = $value;
                    }
                }
            }
        }
        
        // Also get specific flash values directly
        $specificFlash = [
            'qrCodeSvg' => $request->session()->get('qrCodeSvg'),
            'manualSetupKey' => $request->session()->get('manualSetupKey'),
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            'warning' => $request->session()->get('warning'),
            'info' => $request->session()->get('info'),
            'recoveryCodes' => $request->session()->get('recoveryCodes'),
        ];
        
        // Filter out null values
        $specificFlash = array_filter($specificFlash, function($value) {
            return !is_null($value);
        });
        
        // Merge all flash data
        $finalFlash = array_merge($flashData, $specificFlash);
        
        // Also add directly to props for easier access
        $qrCodeSvg = $request->session()->get('qrCodeSvg');
        $manualSetupKey = $request->session()->get('manualSetupKey');
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->full_name ?? $user->name,
                    'username' => $user->username, 
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_id' => $user->role_id,
                    'is_admin' => $user->isAdministrator(),
                    'permissions' => $user->getPermissionNames(),
                    // Resident information with privileges
                    'resident' => $residentData,
                    'is_household_head' => $isHouseholdHead,
                    'resident_id' => $user->resident_id,
                    'household_id' => $user->household_id,
                    'unit_number' => $unitNumber,
                    'purok' => $purok,
                    'household_members_count' => $householdMembersCount,
                    // ============ NOTIFICATION DATA ============
                    'notification_count' => $unreadNotificationCount,
                    'notifications' => $notifications,
                    // ===========================================
                    // ALL PRIVILEGES FOR REFERENCE (with discount type info)
                    'all_privileges' => $allPrivileges,
                ] : null,
            ],
            // COMPLETE FLASH DATA
            'flash' => $finalFlash,
            // DIRECT PROPS FOR 2FA DATA
            'qrCodeSvg' => $qrCodeSvg,
            'manualSetupKey' => $manualSetupKey,
            // ============ GLOBAL NOTIFICATION DATA ============
            'notifications' => [
                'items' => $notifications,
                'unreadCount' => $unreadNotificationCount,
            ],
            // ==================================================
            // Search results
            'searchResults' => $searchResults,
            'quickResults' => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery' => $query,
            // ALL PRIVILEGES GLOBALLY (with discount info)
            'allPrivileges' => $allPrivileges,
        ]);
    }

    protected function performQuickSearch($query, array $allPrivileges)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        // Search Residents with privileges and discount types
        $residents = Resident::with(['purok', 'residentPrivileges.privilege.discountType'])
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('middle_name', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('resident_id', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->limit(3)
            ->get()
            ->map(function($resident) use ($allPrivileges) {
                // Get active privileges with discount info
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountType = $privilege?->discountType;
                        return [
                            'code' => $privilege?->code,
                            'name' => $privilege?->name,
                            'discount_percentage' => $discountType?->percentage ?? 0,
                        ];
                    })
                    ->values()
                    ->toArray();

                // DYNAMIC privilege icons for display
                $privilegeIcons = [];
                foreach ($activePrivileges as $priv) {
                    $privilegeIcons[] = $this->getPrivilegeIcon($priv['code']);
                }

                return [
                    'id' => $resident->id,
                    'type' => 'resident',
                    'text' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                    'subtext' => $resident->purok?->name ?? 'No purok',
                    'url' => route('admin.residents.show', $resident->id),
                    'icon' => 'User',
                    'badges' => $privilegeIcons,
                    'privileges' => $activePrivileges,
                ];
            })->toArray();

        // Search Households
        $households = Household::with(['purok', 'householdMembers.resident.residentPrivileges.privilege.discountType'])
            ->where('household_number', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhere('head_of_family', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($household) use ($allPrivileges) {
                // Check if head has privileges
                $headHasPrivileges = false;
                $headMember = $household->householdMembers->where('is_head', true)->first();
                if ($headMember && $headMember->resident) {
                    $headHasPrivileges = $headMember->resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->isNotEmpty();
                }

                return [
                    'id' => $household->id,
                    'type' => 'household',
                    'text' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                    'subtext' => $household->address ?? 'No address',
                    'url' => route('admin.households.show', $household->id),
                    'icon' => 'Home',
                    'badges' => $headHasPrivileges ? ['🏠✨'] : [],
                ];
            })->toArray();

        // Search Businesses
        if (class_exists('App\Models\Business')) {
            $businesses = Business::with(['purok', 'owner'])
                ->where('business_name', 'like', $searchTerm)
                ->orWhere('owner_name', 'like', $searchTerm)
                ->orWhere('business_type', 'like', $searchTerm)
                ->orWhere('dti_sec_number', 'like', $searchTerm)
                ->orWhere('tin_number', 'like', $searchTerm)
                ->orWhere('mayors_permit_number', 'like', $searchTerm)
                ->orWhere('address', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm)
                ->limit(2)
                ->get()
                ->map(function($business) {
                    return [
                        'id' => $business->id,
                        'type' => 'business',
                        'text' => $business->business_name ?? 'Unnamed Business',
                        'subtext' => $business->business_type ?? 'Business',
                        'url' => route('admin.businesses.show', $business->id),
                        'icon' => 'Briefcase',
                        'badges' => [],
                    ];
                })->toArray();
        } else {
            $businesses = [];
        }

        // Search Puroks
        $puroks = Purok::where('name', 'like', $searchTerm)
            ->orWhere('leader_name', 'like', $searchTerm)
            ->orWhere('description', 'like', $searchTerm)
            ->limit(1)
            ->get()
            ->map(function($purok) {
                return [
                    'id' => $purok->id,
                    'type' => 'purok',
                    'text' => $purok->name,
                    'subtext' => 'Leader: ' . ($purok->leader_name ?? 'None'),
                    'url' => route('admin.puroks.show', $purok->id),
                    'icon' => 'MapPin',
                    'badges' => [],
                ];
            })->toArray();

        // Search Users
        $users = User::with('role')
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('username', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'text' => ($user->first_name ?? '') . ' ' . ($user->last_name ?? '') ?: $user->username ?? 'User',
                    'subtext' => $user->email ?? 'No email',
                    'url' => route('admin.users.show', $user->id),
                    'icon' => 'UserCircle',
                    'badges' => [],
                ];
            })->toArray();

        // Search Officials - FIXED: Use dynamic column checking
        $officials = $this->searchOfficialsQuick($searchTerm);
        
        // Search Clearance Requests
        $clearances = ClearanceRequest::with(['resident', 'clearanceType'])
            ->where('reference_number', 'like', $searchTerm)
            ->orWhere('clearance_number', 'like', $searchTerm)
            ->orWhere('purpose', 'like', $searchTerm)
            ->orWhere('specific_purpose', 'like', $searchTerm)
            ->orWhere('or_number', 'like', $searchTerm)
            ->orWhereHas('resident', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm);
            })
            ->limit(2)
            ->get()
            ->map(function($clearance) {
                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'text' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtext' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'url' => route('admin.clearances.show', $clearance->id),
                    'icon' => 'FileCheck',
                    'badges' => [],
                ];
            })->toArray();

        // Search Forms
        $forms = Form::where('title', 'like', $searchTerm)
            ->orWhere('description', 'like', $searchTerm)
            ->orWhere('category', 'like', $searchTerm)
            ->where('is_active', true)
            ->limit(2)
            ->get()
            ->map(function($form) {
                return [
                    'id' => $form->id,
                    'type' => 'form',
                    'text' => $form->title ?? 'Untitled Form',
                    'subtext' => $form->category ?? 'Form',
                    'url' => route('admin.forms.show', $form->id),
                    'icon' => 'File',
                    'badges' => [],
                ];
            })->toArray();

        // Search Announcements
        $announcements = Announcement::where('title', 'like', $searchTerm)
            ->orWhere('content', 'like', $searchTerm)
            ->orWhere('type', 'like', $searchTerm)
            ->where('is_active', true)
            ->limit(2)
            ->get()
            ->map(function($announcement) {
                return [
                    'id' => $announcement->id,
                    'type' => 'announcement',
                    'text' => $announcement->title ?? 'Untitled Announcement',
                    'subtext' => ucfirst($announcement->type ?? 'general'),
                    'url' => route('admin.announcements.show', $announcement->id),
                    'icon' => 'Megaphone',
                    'badges' => [],
                ];
            })->toArray();

        // Search Payments
        $payments = Payment::query()
            ->where('or_number', 'like', $searchTerm)
            ->orWhere('payer_name', 'like', $searchTerm)
            ->orWhere('reference_number', 'like', $searchTerm)
            ->orWhere('purpose', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'text' => 'OR #' . ($payment->or_number ?? 'N/A'),
                    'subtext' => 'Payer: ' . ($payment->payer_name ?? 'Unknown'),
                    'url' => route('admin.payments.show', $payment->id),
                    'icon' => 'Receipt',
                    'badges' => [],
                ];
            })->toArray();

        // Search Community Reports
        $reports = CommunityReport::with('reportType')
            ->where('title', 'like', $searchTerm)
            ->orWhere('description', 'like', $searchTerm)
            ->orWhere('report_number', 'like', $searchTerm)
            ->orWhere('location', 'like', $searchTerm)
            ->orWhere('reporter_name', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($report) {
                return [
                    'id' => $report->id,
                    'type' => 'report',
                    'text' => $report->title ?? 'Untitled Report',
                    'subtext' => 'Report #' . ($report->report_number ?? $report->id),
                    'url' => route('admin.community-reports.show', $report->id),
                    'icon' => 'FileText',
                    'badges' => [],
                ];
            })->toArray();

        // Merge all results
        $results = array_merge(
            $residents, 
            $households, 
            $businesses, 
            $puroks, 
            $users, 
            $officials,
            $clearances,
            $forms,
            $announcements,
            $payments,
            $reports
        );
        
        return array_slice($results, 0, 8);
    }

    /**
     * Quick search for officials with safe column checking
     */
    private function searchOfficialsQuick($searchTerm)
    {
        try {
            $query = Official::with(['resident'])
                ->where(function($q) use ($searchTerm) {
                    // Search by related resident
                    $q->whereHas('resident', function($q) use ($searchTerm) {
                        $q->where('first_name', 'like', $searchTerm)
                          ->orWhere('last_name', 'like', $searchTerm)
                          ->orWhere('middle_name', 'like', $searchTerm);
                    });
                    
                    // Safe search by position/office columns
                    if (Schema::hasColumn('officials', 'position')) {
                        $q->orWhere('position', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'office_position')) {
                        $q->orWhere('office_position', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'title')) {
                        $q->orWhere('title', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'designation')) {
                        $q->orWhere('designation', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'role')) {
                        $q->orWhere('role', 'like', $searchTerm);
                    }
                    
                    // Search by committee
                    if (Schema::hasColumn('officials', 'committee')) {
                        $q->orWhere('committee', 'like', $searchTerm);
                    }
                })
                ->limit(2)
                ->get();
            
            return $query->map(function($official) {
                // Get position from available column
                $position = $official->position ?? 
                           $official->office_position ?? 
                           $official->title ?? 
                           $official->designation ?? 
                           $official->role ?? 
                           'Official';
                
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
            Log::warning('Error in quick officials search: ' . $e->getMessage());
            return [];
        }
    }

    protected function performFullSearch($query, array $allPrivileges)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        $results = array_merge($results, $this->searchResidents($searchTerm, $query, $allPrivileges));
        $results = array_merge($results, $this->searchHouseholds($searchTerm, $allPrivileges));
        $results = array_merge($results, $this->searchUsers($searchTerm));

        if (class_exists('App\Models\Business')) {
            $results = array_merge($results, $this->searchBusinesses($searchTerm));
        }

        $results = array_merge($results, $this->searchOfficialsFull($searchTerm));
        $results = array_merge($results, $this->searchPuroks($searchTerm));
        $results = array_merge($results, $this->searchCommunityReports($searchTerm));
        $results = array_merge($results, $this->searchClearanceRequests($searchTerm));
        $results = array_merge($results, $this->searchForms($searchTerm));
        $results = array_merge($results, $this->searchAnnouncements($searchTerm));
        $results = array_merge($results, $this->searchPayments($searchTerm));

        usort($results, function($a, $b) {
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
     * Full search for officials with safe column checking
     */
    private function searchOfficialsFull($searchTerm)
    {
        try {
            $query = Official::with(['resident'])
                ->where(function($q) use ($searchTerm) {
                    // Search by related resident
                    $q->whereHas('resident', function($q) use ($searchTerm) {
                        $q->where('first_name', 'like', $searchTerm)
                          ->orWhere('last_name', 'like', $searchTerm)
                          ->orWhere('middle_name', 'like', $searchTerm);
                    });
                    
                    // Safe search by position/office columns
                    if (Schema::hasColumn('officials', 'position')) {
                        $q->orWhere('position', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'office_position')) {
                        $q->orWhere('office_position', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'title')) {
                        $q->orWhere('title', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'designation')) {
                        $q->orWhere('designation', 'like', $searchTerm);
                    }
                    if (Schema::hasColumn('officials', 'role')) {
                        $q->orWhere('role', 'like', $searchTerm);
                    }
                    
                    // Search by committee
                    if (Schema::hasColumn('officials', 'committee')) {
                        $q->orWhere('committee', 'like', $searchTerm);
                    }
                })
                ->limit(10)
                ->get();
            
            return $query->map(function($official) {
                $termYears = '';
                if ($official->term_start && $official->term_end) {
                    $termYears = $official->term_start->format('Y') . '-' . $official->term_end->format('Y');
                }
                
                // Get position from available column
                $position = $official->position ?? 
                           $official->office_position ?? 
                           $official->title ?? 
                           $official->designation ?? 
                           $official->role ?? 
                           'No position';
                
                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'title' => $official->resident?->full_name ?? 'Unknown',
                    'subtitle' => $position,
                    'description' => $official->committee ?? 'No committee',
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
            Log::warning('Error in full officials search: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get icon for privilege code
     */
    private function getPrivilegeIcon(string $code): string
    {
        $icons = [
            'SENIOR' => '👴',
            'SC' => '👴',
            'PWD' => '♿',
            'SOLO_PARENT' => '👨‍👧',
            'SP' => '👨‍👧',
            'INDIGENT' => '🏠',
            'IND' => '🏠',
            'VETERAN' => '🎖️',
            'STUDENT' => '📚',
            'BHW' => '🏥',
            'TANOD' => '👮',
            '4PS' => '📦',
            'IP' => '🌿',
            'FRM' => '🌾',
            'FSH' => '🎣',
            'OFW' => '✈️',
            'UNE' => '💼',
        ];
        
        return $icons[$code] ?? '🎫';
    }

    /**
     * Search residents with privilege data
     */
    protected function searchResidents($searchTerm, $rawQuery, array $allPrivileges)
    {
        $residents = Resident::with(['purok', 'household', 'residentPrivileges.privilege.discountType'])
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('middle_name', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('resident_id', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->limit(20)
            ->get()
            ->map(function ($resident) use ($rawQuery, $allPrivileges) {
                $relevance = 0;
                if (str_contains(strtolower($resident->full_name ?? ''), strtolower($rawQuery))) {
                    $relevance += 10;
                }
                if ($resident->resident_id === $rawQuery) {
                    $relevance += 20;
                }

                // Get active privileges with discount info
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountType = $privilege?->discountType;
                        return [
                            'code' => $privilege?->code,
                            'name' => $privilege?->name,
                            'discount_percentage' => $discountType?->percentage ?? 0,
                        ];
                    })
                    ->values()
                    ->toArray();

                // DYNAMIC privilege tags
                $privilegeTags = [];
                foreach ($activePrivileges as $priv) {
                    $privilegeTags[] = $priv['name'];
                }

                // Also check for legacy fields for backward compatibility
                $legacyTags = [];
                if ($resident->is_voter) $legacyTags[] = 'Voter';

                $tags = array_merge($privilegeTags, $legacyTags);

                return [
                    'id' => $resident->id,
                    'type' => 'resident',
                    'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                    'subtitle' => $resident->email ?? $resident->contact_number ?? 'No contact info',
                    'description' => $resident->purok?->name ?? 'No purok',
                    'url' => route('admin.residents.show', $resident->id),
                    'icon' => 'User',
                    'badge' => 'Resident',
                    'tags' => array_filter($tags),
                    'relevance' => $relevance,
                    'meta' => [
                        'age' => $resident->age,
                        'gender' => $resident->gender,
                        'civil_status' => $resident->civil_status,
                        'privileges' => $activePrivileges,
                        'privileges_count' => count($activePrivileges),
                    ]
                ];
            })
            ->toArray();

        return $residents;
    }

    /**
     * Search households with privilege info
     */
    protected function searchHouseholds($searchTerm, array $allPrivileges)
    {
        $households = Household::with([
            'purok',
            'householdMembers' => function ($query) {
                $query->where('is_head', true)->with('resident.residentPrivileges.privilege.discountType');
            }
        ])
            ->where('household_number', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhere('head_of_family', 'like', $searchTerm)
            ->limit(10)
            ->get()
            ->map(function ($household) use ($allPrivileges) {
                // Check if head has privileges
                $headPrivileges = [];
                $headMember = $household->householdMembers->where('is_head', true)->first();
                
                if ($headMember && $headMember->resident) {
                    $headPrivileges = $headMember->resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) {
                            $privilege = $rp->privilege;
                            return $privilege?->name;
                        })
                        ->values()
                        ->toArray();
                }

                $tags = $headPrivileges;

                return [
                    'id' => $household->id,
                    'type' => 'household',
                    'title' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                    'subtitle' => $household->address ?? 'No address',
                    'description' => 'Head: ' . ($household->head_of_family ?? 'Unknown') . ' | Members: ' . $household->member_count,
                    'url' => route('admin.households.show', $household->id),
                    'icon' => 'Home',
                    'badge' => 'Household',
                    'tags' => array_filter(array_merge([
                        $household->housing_type,
                        $household->ownership_status,
                        $household->electricity ? 'With Electricity' : null,
                        $household->internet ? 'With Internet' : null,
                    ], $tags)),
                    'meta' => [
                        'member_count' => $household->member_count,
                        'income_range' => $household->income_range,
                        'head_privileges' => $headPrivileges,
                    ]
                ];
            })
            ->toArray();

        return $households;
    }

    protected function searchUsers($searchTerm)
    {
        $users = User::with('role')
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('username', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'title' => ($user->first_name ?? '') . ' ' . ($user->last_name ?? '') ?: $user->username ?? 'User',
                    'subtitle' => $user->email ?? 'No email',
                    'description' => 'Role: ' . ($user->role?->name ?? 'No role') . ' | Status: ' . $user->status,
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

        return $users;
    }

    protected function searchBusinesses($searchTerm)
    {
        $businesses = Business::with(['purok', 'owner'])
            ->where('business_name', 'like', $searchTerm)
            ->orWhere('business_type', 'like', $searchTerm)
            ->orWhere('owner_name', 'like', $searchTerm)
            ->orWhere('dti_sec_number', 'like', $searchTerm)
            ->orWhere('tin_number', 'like', $searchTerm)
            ->orWhere('mayors_permit_number', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->limit(10)
            ->get()
            ->map(function ($business) {
                return [
                    'id' => $business->id,
                    'type' => 'business',
                    'title' => $business->business_name ?? 'Unnamed Business',
                    'subtitle' => $business->business_type ?? 'Business',
                    'description' => 'Owner: ' . ($business->owner_name ?? 'Unknown') . ' | ' . ($business->address ?? 'No address'),
                    'url' => route('admin.businesses.show', $business->id),
                    'icon' => 'Briefcase',
                    'badge' => 'Business',
                    'tags' => [$business->status],
                    'meta' => [
                        'employees' => $business->employee_count,
                        'capital' => $business->capital_amount ? '₱' . number_format($business->capital_amount, 2) : null,
                    ]
                ];
            })
            ->toArray();

        return $businesses;
    }

    protected function searchPuroks($searchTerm)
    {
        $puroks = Purok::where('name', 'like', $searchTerm)
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

        return $puroks;
    }

    protected function searchCommunityReports($searchTerm)
    {
        $reports = CommunityReport::with(['user', 'reportType'])
            ->where('title', 'like', $searchTerm)
            ->orWhere('description', 'like', $searchTerm)
            ->orWhere('report_number', 'like', $searchTerm)
            ->orWhere('location', 'like', $searchTerm)
            ->orWhere('reporter_name', 'like', $searchTerm)
            ->limit(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'type' => 'report',
                    'title' => $report->title ?? 'Untitled Report',
                    'subtitle' => 'Report #' . ($report->report_number ?? $report->id),
                    'description' => $report->description ?? '',
                    'url' => route('admin.community-reports.show', $report->id),
                    'icon' => 'FileText',
                    'badge' => $report->reportType?->name ?? 'Report',
                    'tags' => array_filter([$report->status, $report->urgency_level ? $report->urgency_level . ' urgency' : null]),
                    'meta' => [
                        'reported_by' => $report->is_anonymous ? 'Anonymous' : ($report->reporter_name ?? 'Unknown'),
                        'incident_date' => $report->incident_date ? date('M d, Y', strtotime($report->incident_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $reports;
    }

    protected function searchClearanceRequests($searchTerm)
    {
        $clearances = ClearanceRequest::with(['resident', 'clearanceType'])
            ->where('reference_number', 'like', $searchTerm)
            ->orWhere('clearance_number', 'like', $searchTerm)
            ->orWhere('purpose', 'like', $searchTerm)
            ->orWhere('specific_purpose', 'like', $searchTerm)
            ->orWhere('or_number', 'like', $searchTerm)
            ->orWhereHas('resident', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm);
            })
            ->limit(10)
            ->get()
            ->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'description' => 'Resident: ' . ($clearance->resident?->full_name ?? 'Unknown') . ' | Purpose: ' . ($clearance->purpose ?? 'N/A'),
                    'url' => route('admin.clearances.show', $clearance->id),
                    'icon' => 'FileCheck',
                    'badge' => 'Clearance',
                    'tags' => array_filter([$clearance->status, $clearance->urgency]),
                    'meta' => [
                        'amount' => $clearance->fee_amount ? '₱' . number_format($clearance->fee_amount, 2) : null,
                        'payment_status' => $clearance->payment_status,
                    ]
                ];
            })
            ->toArray();

        return $clearances;
    }

    protected function searchForms($searchTerm)
    {
        $forms = Form::where('title', 'like', $searchTerm)
            ->orWhere('description', 'like', $searchTerm)
            ->orWhere('category', 'like', $searchTerm)
            ->orWhere('issuing_agency', 'like', $searchTerm)
            ->where('is_active', true)
            ->limit(10)
            ->get()
            ->map(function ($form) {
                return [
                    'id' => $form->id,
                    'type' => 'form',
                    'title' => $form->title ?? 'Untitled Form',
                    'subtitle' => $form->category ?? 'Form',
                    'description' => $form->description ?? '',
                    'url' => route('admin.forms.show', $form->id),
                    'icon' => 'File',
                    'badge' => 'Form',
                    'tags' => array_filter([$form->file_type, $form->version ? 'v' . $form->version : null]),
                    'meta' => [
                        'downloads' => $form->download_count,
                        'size' => $form->file_size ? round($form->file_size / 1024, 2) . ' KB' : null,
                    ]
                ];
            })
            ->toArray();

        return $forms;
    }

    protected function searchAnnouncements($searchTerm)
    {
        $announcements = Announcement::where('title', 'like', $searchTerm)
            ->orWhere('content', 'like', $searchTerm)
            ->orWhere('type', 'like', $searchTerm)
            ->where('is_active', true)
            ->limit(10)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'type' => 'announcement',
                    'title' => $announcement->title ?? 'Untitled Announcement',
                    'subtitle' => ucfirst($announcement->type ?? 'general') . ' Announcement',
                    'description' => $announcement->content ? substr(strip_tags($announcement->content), 0, 100) . '...' : '',
                    'url' => route('admin.announcements.show', $announcement->id),
                    'icon' => 'Megaphone',
                    'badge' => 'Announcement',
                    'tags' => array_filter([$announcement->type, $announcement->priority ? 'Priority ' . $announcement->priority : null]),
                    'meta' => [
                        'start_date' => $announcement->start_date ? date('M d, Y', strtotime($announcement->start_date)) : null,
                        'end_date' => $announcement->end_date ? date('M d, Y', strtotime($announcement->end_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $announcements;
    }

    protected function searchPayments($searchTerm)
    {
        $payments = Payment::query()
            ->where('or_number', 'like', $searchTerm)
            ->orWhere('payer_name', 'like', $searchTerm)
            ->orWhere('reference_number', 'like', $searchTerm)
            ->orWhere('purpose', 'like', $searchTerm)
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                $recordedByName = null;
                if (method_exists($payment, 'recordedBy') || method_exists($payment, 'recorder')) {
                    try {
                        $recordedByName = $payment->recordedBy?->name ?? $payment->recorder?->name;
                    } catch (\Exception $e) {
                        $recordedByName = null;
                    }
                }

                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'title' => 'OR #' . ($payment->or_number ?? 'N/A'),
                    'subtitle' => 'Payer: ' . ($payment->payer_name ?? 'Unknown'),
                    'description' => 'Amount: ₱' . number_format($payment->total_amount ?? 0, 2) . ' | ' . ($payment->purpose ?? ''),
                    'url' => route('admin.payments.show', $payment->id),
                    'icon' => 'Receipt',
                    'badge' => 'Payment',
                    'tags' => array_filter([$payment->payment_method, $payment->status]),
                    'meta' => [
                        'date' => $payment->payment_date ? date('M d, Y', strtotime($payment->payment_date)) : null,
                        'recorded_by' => $recordedByName,
                    ]
                ];
            })
            ->toArray();

        return $payments;
    }

    protected function storeSearchQuery(Request $request, $query)
    {
        $recentSearches = $request->session()->get('recent_searches', []);
        
        $recentSearches = array_filter($recentSearches, function($item) use ($query) {
            return $item !== $query;
        });
        array_unshift($recentSearches, $query);
        
        $recentSearches = array_slice($recentSearches, 0, 10);
        
        $request->session()->put('recent_searches', $recentSearches);
    }

    protected function getRecentSearches(Request $request)
    {
        return $request->session()->get('recent_searches', []);
    }
}