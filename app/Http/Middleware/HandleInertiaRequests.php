<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
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
        
        // Handle search queries - this runs on EVERY request
        $searchResults = [];
        $quickResults = [];
        $recentSearches = [];
        
        $query = $request->input('q');
        $isQuick = $request->input('quick', false);
        
        // If there's a search query, perform search
        if ($query && strlen($query) >= 2) {
            if ($isQuick) {
                // Quick search for dropdown
                $quickResults = $this->performQuickSearch($query);
            } else {
                // Full search for search page
                $searchResults = $this->performFullSearch($query);
                // Store in session for recent searches
                $this->storeSearchQuery($request, $query);
            }
        }
        
        // Get recent searches from session
        $recentSearches = $this->getRecentSearches($request);
        
        if ($user) {
            // Get resident directly using resident_id from users table
            $resident = Resident::with(['household', 'purok'])
                ->where('id', $user->resident_id)
                ->first();
            
            if ($resident) {
                $residentId = $resident->id;
                
                $residentData = [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'middle_name' => $resident->middle_name,
                    'last_name' => $resident->last_name,
                    'suffix' => $resident->suffix,
                    'avatar' => $resident->avatar,
                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
                    'gender' => $resident->gender,
                    'marital_status' => $resident->marital_status,
                    'phone_number' => $resident->phone_number,
                    'email' => $resident->email,
                ];
                
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
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->full_name ?? $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_id' => $user->role_id,
                    'is_admin' => $user->isAdministrator(),
                    'permissions' => $user->getPermissionNames(),
                    // Resident information
                    'resident' => $residentData,
                    'is_household_head' => $isHouseholdHead,
                    'resident_id' => $user->resident_id,
                    'household_id' => $user->household_id,
                    'unit_number' => $unitNumber,
                    'purok' => $purok,
                    'household_members_count' => $householdMembersCount,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            // Search results - available on EVERY page
            'searchResults' => $searchResults,
            'quickResults' => $quickResults,
            'recentSearches' => $recentSearches,
            'currentQuery' => $query,
        ]);
    }

 protected function performQuickSearch($query)
{
    $searchTerm = '%' . $query . '%';
    $results = [];

    // Search Residents
    $residents = Resident::with('purok')
        ->where('first_name', 'like', $searchTerm)
        ->orWhere('last_name', 'like', $searchTerm)
        ->orWhere('middle_name', 'like', $searchTerm)
        ->orWhere('email', 'like', $searchTerm)
        ->orWhere('contact_number', 'like', $searchTerm)
        ->orWhere('resident_id', 'like', $searchTerm)
        ->orWhere('senior_id_number', 'like', $searchTerm)
        ->orWhere('pwd_id_number', 'like', $searchTerm)
        ->orWhere('solo_parent_id_number', 'like', $searchTerm)
        ->orWhere('indigent_id_number', 'like', $searchTerm)
        ->orWhere('address', 'like', $searchTerm)
        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
        ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm])
        ->limit(3)
        ->get()
        ->map(function($resident) {
            return [
                'id' => $resident->id,
                'type' => 'resident',
                'text' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                'subtext' => $resident->purok?->name ?? 'No purok',
                'url' => route('residents.show', $resident->id),
                'icon' => 'User'
            ];
        })->toArray();

    // Search Households
    $households = Household::with('purok')
        ->where('household_number', 'like', $searchTerm)
        ->orWhere('contact_number', 'like', $searchTerm)
        ->orWhere('email', 'like', $searchTerm)
        ->orWhere('address', 'like', $searchTerm)
        ->orWhere('head_of_family', 'like', $searchTerm)
        ->limit(2)
        ->get()
        ->map(function($household) {
            return [
                'id' => $household->id,
                'type' => 'household',
                'text' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                'subtext' => $household->address ?? 'No address',
                'url' => route('households.show', $household->id),
                'icon' => 'Home'
            ];
        })->toArray();

    // Search Businesses
    if (class_exists('App\Models\Business')) {
        $businesses = Business::with('purok')
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
                    'url' => route('businesses.show', $business->id),
                    'icon' => 'Briefcase'
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
                'url' => route('puroks.show', $purok->id),
                'icon' => 'MapPin'
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
                'url' => route('users.show', $user->id),
                'icon' => 'UserCircle'
            ];
        })->toArray();

    // Search Officials
    $officials = Official::with('resident')
        ->whereHas('resident', function ($q) use ($searchTerm) {
            $q->where('first_name', 'like', $searchTerm)
              ->orWhere('last_name', 'like', $searchTerm)
              ->orWhere('middle_name', 'like', $searchTerm);
        })
        ->orWhere('position', 'like', $searchTerm)
        ->orWhere('committee', 'like', $searchTerm)
        ->limit(2)
        ->get()
        ->map(function($official) {
            return [
                'id' => $official->id,
                'type' => 'official',
                'text' => $official->resident?->full_name ?? 'Unknown',
                'subtext' => $official->position ?? 'Official',
                'url' => route('officials.show', $official->id),
                'icon' => 'BadgeCheck'
            ];
        })->toArray();

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
                'url' => route('clearances.show', $clearance->id),
                'icon' => 'FileCheck'
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
                'url' => route('forms.show', $form->id),
                'icon' => 'File'
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
                'url' => route('announcements.show', $announcement->id),
                'icon' => 'Megaphone'
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
                'icon' => 'Receipt'
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
                'url' => route('community-reports.show', $report->id),
                'icon' => 'FileText'
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
    
    // If there are results, show them. If not, return empty array (which shows "No results found")
    // But at least now it's accurate because we searched everything
    return array_slice($results, 0, 8);
}
    /**
     * Perform full search for search page
     */
    protected function performFullSearch($query)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        // 1. Search Residents (most important)
        $results = array_merge($results, $this->searchResidents($searchTerm, $query));

        // 2. Search Households
        $results = array_merge($results, $this->searchHouseholds($searchTerm));

        // 3. Search Users (system users)
        $results = array_merge($results, $this->searchUsers($searchTerm));

        // 4. Search Businesses
        if (class_exists('App\Models\Business')) {
            $results = array_merge($results, $this->searchBusinesses($searchTerm));
        }

        // 5. Search Officials
        $results = array_merge($results, $this->searchOfficials($searchTerm));

        // 6. Search Puroks
        $results = array_merge($results, $this->searchPuroks($searchTerm));

        // 7. Search Community Reports/Blotters
        $results = array_merge($results, $this->searchCommunityReports($searchTerm));

        // 8. Search Clearance Requests
        $results = array_merge($results, $this->searchClearanceRequests($searchTerm));

        // 9. Search Forms/Documents
        $results = array_merge($results, $this->searchForms($searchTerm));

        // 10. Search Announcements
        $results = array_merge($results, $this->searchAnnouncements($searchTerm));

        // 11. Search Payments (limited)
        $results = array_merge($results, $this->searchPayments($searchTerm));

        // Sort results by relevance
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

    protected function searchResidents($searchTerm, $rawQuery)
    {
        $residents = Resident::with(['purok', 'household'])
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('middle_name', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('resident_id', 'like', $searchTerm)
            ->orWhere('senior_id_number', 'like', $searchTerm)
            ->orWhere('pwd_id_number', 'like', $searchTerm)
            ->orWhere('solo_parent_id_number', 'like', $searchTerm)
            ->orWhere('indigent_id_number', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->limit(20)
            ->get()
            ->map(function ($resident) use ($rawQuery) {
                // Calculate relevance score
                $relevance = 0;
                if (str_contains(strtolower($resident->full_name ?? ''), strtolower($rawQuery))) {
                    $relevance += 10;
                }
                if ($resident->resident_id === $rawQuery) {
                    $relevance += 20;
                }

                // Get discount tags
                $tags = [];
                if ($resident->is_senior) $tags[] = 'Senior';
                if ($resident->is_pwd) $tags[] = 'PWD';
                if ($resident->is_solo_parent) $tags[] = 'Solo Parent';
                if ($resident->is_indigent) $tags[] = 'Indigent';
                if ($resident->is_voter) $tags[] = 'Voter';

                return [
                    'id' => $resident->id,
                    'type' => 'resident',
                    'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                    'subtitle' => $resident->email ?? $resident->contact_number ?? 'No contact info',
                    'description' => $resident->purok?->name ?? 'No purok',
                    'url' => route('residents.show', $resident->id),
                    'icon' => 'User',
                    'badge' => 'Resident',
                    'tags' => array_filter($tags),
                    'relevance' => $relevance,
                    'meta' => [
                        'age' => $resident->age,
                        'gender' => $resident->gender,
                        'civil_status' => $resident->civil_status,
                    ]
                ];
            })
            ->toArray();

        return $residents;
    }

    protected function searchHouseholds($searchTerm)
    {
        $households = Household::with(['purok'])
            ->where('household_number', 'like', $searchTerm)
            ->orWhere('contact_number', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->orWhere('head_of_family', 'like', $searchTerm)
            ->limit(10)
            ->get()
            ->map(function ($household) {
                return [
                    'id' => $household->id,
                    'type' => 'household',
                    'title' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                    'subtitle' => $household->address ?? 'No address',
                    'description' => 'Head: ' . ($household->head_of_family ?? 'Unknown') . ' | Members: ' . $household->member_count,
                    'url' => route('households.show', $household->id),
                    'icon' => 'Home',
                    'badge' => 'Household',
                    'tags' => array_filter([
                        $household->housing_type,
                        $household->ownership_status,
                        $household->electricity ? 'With Electricity' : null,
                        $household->internet ? 'With Internet' : null,
                    ]),
                    'meta' => [
                        'member_count' => $household->member_count,
                        'income_range' => $household->income_range,
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
                    'url' => route('users.show', $user->id),
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
                    'url' => route('businesses.show', $business->id),
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

    protected function searchOfficials($searchTerm)
    {
        $officials = Official::with(['resident', 'position'])
            ->whereHas('resident', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm)
                  ->orWhere('middle_name', 'like', $searchTerm);
            })
            ->orWhere('position', 'like', $searchTerm)
            ->orWhere('committee', 'like', $searchTerm)
            ->limit(10)
            ->get()
            ->map(function ($official) {
                $termYears = '';
                if ($official->term_start && $official->term_end) {
                    $termYears = $official->term_start->format('Y') . '-' . $official->term_end->format('Y');
                }

                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'title' => $official->resident?->full_name ?? 'Unknown',
                    'subtitle' => $official->position ?? 'No position',
                    'description' => $official->committee ?? 'No committee',
                    'url' => route('officials.show', $official->id),
                    'icon' => 'BadgeCheck',
                    'badge' => 'Official',
                    'tags' => array_filter([$official->status, $termYears]),
                ];
            })
            ->toArray();

        return $officials;
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
                    'url' => route('puroks.show', $purok->id),
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
                    'url' => route('community-reports.show', $report->id),
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
                    'url' => route('clearances.show', $clearance->id),
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
                    'url' => route('forms.show', $form->id),
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
                    'url' => route('announcements.show', $announcement->id),
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
                // Try to get the recorded by user if relationship exists
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

    /**
     * Store search query in session for recent searches
     */
    protected function storeSearchQuery(Request $request, $query)
    {
        $recentSearches = $request->session()->get('recent_searches', []);
        
        // Add new query to beginning, remove if exists
        $recentSearches = array_filter($recentSearches, function($item) use ($query) {
            return $item !== $query;
        });
        array_unshift($recentSearches, $query);
        
        // Keep only last 10 searches
        $recentSearches = array_slice($recentSearches, 0, 10);
        
        $request->session()->put('recent_searches', $recentSearches);
    }

    /**
     * Get recent searches from session
     */
    protected function getRecentSearches(Request $request)
    {
        return $request->session()->get('recent_searches', []);
    }
}