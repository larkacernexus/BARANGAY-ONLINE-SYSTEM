<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\CommunityReport;
use App\Models\ClearanceRequest;
use App\Models\Announcement;
use App\Models\Payment;
use App\Models\Business;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    protected $resident;
    protected $residentId;
    protected $householdId;
    protected $householdMemberIds;
    protected $allPrivileges;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            
            if ($user && $user->resident_id) {
                $this->residentId = $user->resident_id;
                $this->resident = Resident::with(['residentPrivileges.privilege'])->find($this->residentId);
                
                // Get user's household ID
                $this->householdId = $user->household_id;
                
                // Get all household member IDs (including self)
                if ($this->householdId) {
                    $this->householdMemberIds = HouseholdMember::where('household_id', $this->householdId)
                        ->pluck('resident_id')
                        ->toArray();
                } else {
                    $this->householdMemberIds = [$this->residentId];
                }
            }
            
            // Get all active privileges for reference
            $this->allPrivileges = Cache::remember('all_active_privileges', 3600, function () {
                return Privilege::where('is_active', true)
                    ->get(['id', 'name', 'code', 'description'])
                    ->keyBy('code')
                    ->toArray();
            });
            
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = $request->get('q');
        $isQuick = $request->get('quick', false);
        
        // If it's a quick search request, return only quickResults as JSON
        if ($isQuick) {
            if (!$query || strlen($query) < 2) {
                return response()->json(['quickResults' => []]);
            }
            
            $quickResults = $this->performQuickSearch($query);
            
            return response()->json(['quickResults' => $quickResults]);
        }

        // Regular search (full page)
        if (!$query || strlen($query) < 2) {
            return Inertia::render('resident/Search/Index', [
                'query' => $query ?? '',
                'results' => [],
                'recentSearches' => $this->getRecentSearches($request),
                'allPrivileges' => $this->allPrivileges,
            ]);
        }

        $results = $this->performSearch($query);
        
        // Store search query for recent searches
        $this->storeSearchQuery($request, $query);
        
        return Inertia::render('resident/Search/Index', [
            'query' => $query,
            'results' => $results,
            'recentSearches' => $this->getRecentSearches($request),
            'allPrivileges' => $this->allPrivileges,
        ]);
    }

    protected function performQuickSearch($query)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        // Quick search - only data related to the resident
        // 1. Search own resident profile
        $residentResults = $this->searchResidents($searchTerm, $query, true);
        $results = array_merge($results, array_slice($residentResults, 0, 2));

        // 2. Search household members
        $householdResults = $this->searchHouseholdMembers($searchTerm, true);
        $results = array_merge($results, array_slice($householdResults, 0, 2));

        // 3. Search own clearance requests
        $clearanceResults = $this->searchClearanceRequests($searchTerm, true);
        $results = array_merge($results, array_slice($clearanceResults, 0, 2));

        // 4. Search own community reports
        $reportResults = $this->searchCommunityReports($searchTerm, true);
        $results = array_merge($results, array_slice($reportResults, 0, 2));

        // 5. Search own payments
        $paymentResults = $this->searchPayments($searchTerm, true);
        $results = array_merge($results, array_slice($paymentResults, 0, 2));

        // 6. Search announcements (always visible to all residents)
        $announcementResults = $this->searchAnnouncements($searchTerm, true);
        $results = array_merge($results, array_slice($announcementResults, 0, 2));

        return array_slice($results, 0, 8);
    }

    protected function performSearch($query)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        // 1. Search own resident profile
        $results = array_merge($results, $this->searchResidents($searchTerm, $query));

        // 2. Search household members (family members)
        $results = array_merge($results, $this->searchHouseholdMembers($searchTerm));

        // 3. Search own clearance requests
        $results = array_merge($results, $this->searchClearanceRequests($searchTerm));

        // 4. Search own community reports/blotters
        $results = array_merge($results, $this->searchCommunityReports($searchTerm));

        // 5. Search own payments
        $results = array_merge($results, $this->searchPayments($searchTerm));

        // 6. Search announcements (always visible to all residents)
        $results = array_merge($results, $this->searchAnnouncements($searchTerm));

        // 7. Search businesses (if your resident portal shows businesses)
        if (class_exists('App\Models\Business')) {
            $results = array_merge($results, $this->searchBusinesses($searchTerm));
        }

        // Sort results by relevance
        usort($results, function($a, $b) {
            $priority = [
                'resident' => 1,        // Own profile
                'household' => 2,        // Family members
                'clearance' => 3,         // Own clearance requests
                'report' => 4,             // Own reports
                'payment' => 5,             // Own payments
                'announcement' => 6,      // Announcements
                'business' => 7,           // Businesses
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
     * Get resident's active privileges
     */
    protected function getResidentPrivileges($resident)
    {
        if (!$resident || !$resident->residentPrivileges) {
            return [];
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
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get privilege tags for display
     */
    protected function getPrivilegeTags($privileges)
    {
        $tags = [];
        foreach ($privileges as $priv) {
            $tags[] = $priv['name'];
        }
        return $tags;
    }

    protected function searchResidents($searchTerm, $rawQuery, $quick = false)
    {
        // Only return the logged-in resident's own profile
        $resident = Resident::with(['purok', 'household', 'residentPrivileges.privilege'])
            ->where('id', $this->residentId)
            ->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm)
                  ->orWhere('middle_name', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm)
                  ->orWhere('contact_number', 'like', $searchTerm)
                  ->orWhere('resident_id', 'like', $searchTerm)
                  ->orWhere('address', 'like', $searchTerm);
            })
            ->first();

        if (!$resident) {
            return [];
        }

        // Get resident's privileges
        $privileges = $this->getResidentPrivileges($resident);
        
        // Create tags from privileges
        $tags = $this->getPrivilegeTags($privileges);
        
        // Add voter tag if applicable
        if ($resident->is_voter) {
            $tags[] = 'Voter';
        }

        // Calculate relevance score
        $relevance = 0;
        if (str_contains(strtolower($resident->full_name ?? ''), strtolower($rawQuery))) {
            $relevance += 10;
        }
        if ($resident->resident_id === $rawQuery) {
            $relevance += 20;
        }

        $url = '#';
        if (Route::has('resident.profile.show')) {
            $url = route('resident.profile.show');
        }

        return [[
            'id' => $resident->id,
            'type' => 'resident',
            'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
            'subtitle' => 'My Profile',
            'description' => $resident->purok?->name ?? 'No purok',
            'url' => $url,
            'icon' => 'User',
            'badge' => 'My Profile',
            'tags' => array_filter($tags),
            'relevance' => $relevance,
            'meta' => [
                'age' => $resident->age,
                'gender' => $resident->gender,
                'civil_status' => $resident->civil_status,
                'privileges' => $privileges,
                'privileges_count' => count($privileges),
            ]
        ]];
    }

    protected function searchHouseholdMembers($searchTerm, $quick = false)
    {
        if (!$this->householdId || empty($this->householdMemberIds)) {
            return [];
        }

        $query = Resident::with(['purok', 'residentPrivileges.privilege'])
            ->whereIn('id', $this->householdMemberIds)
            ->where('id', '!=', $this->residentId) // Exclude self
            ->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm)
                  ->orWhere('middle_name', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm)
                  ->orWhere('contact_number', 'like', $searchTerm)
                  ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm]);
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($quick) {
            $query->limit(5);
        } else {
            $query->limit(20);
        }

        $members = $query->get()
            ->map(function ($member) {
                $isHead = HouseholdMember::where('household_id', $this->householdId)
                    ->where('resident_id', $member->id)
                    ->where('is_head', true)
                    ->exists();

                // Get member's privileges
                $privileges = $this->getResidentPrivileges($member);
                
                // Create tags from privileges
                $tags = $this->getPrivilegeTags($privileges);
                
                // Add age/gender tags
                if ($member->age) {
                    $tags[] = $member->age . ' yrs old';
                }
                if ($member->gender) {
                    $tags[] = ucfirst($member->gender);
                }
                if ($member->civil_status) {
                    $tags[] = ucfirst($member->civil_status);
                }
                if ($member->occupation) {
                    $tags[] = $member->occupation;
                }

                $url = '#';
                if (Route::has('resident.household.members.show')) {
                    $url = route('resident.household.members.show', $member->id);
                }

                return [
                    'id' => $member->id,
                    'type' => 'household',
                    'title' => $member->full_name ?? $member->first_name . ' ' . $member->last_name,
                    'subtitle' => $isHead ? 'Head of Family' : 'Family Member',
                    'description' => $member->purok?->name ?? 'No purok',
                    'url' => $url,
                    'icon' => 'Users',
                    'badge' => 'Family Member',
                    'tags' => array_filter($tags),
                    'meta' => [
                        'relationship' => $this->getRelationshipToHead($member->id),
                        'occupation' => $member->occupation,
                        'privileges' => $privileges,
                        'privileges_count' => count($privileges),
                    ]
                ];
            })
            ->toArray();

        return $members;
    }

    protected function searchClearanceRequests($searchTerm, $quick = false)
    {
        $query = ClearanceRequest::with(['clearanceType'])
            ->where('resident_id', $this->residentId)
            ->where(function($q) use ($searchTerm) {
                $q->where('reference_number', 'like', $searchTerm)
                  ->orWhere('clearance_number', 'like', $searchTerm)
                  ->orWhere('purpose', 'like', $searchTerm)
                  ->orWhere('specific_purpose', 'like', $searchTerm)
                  ->orWhere('or_number', 'like', $searchTerm);
            })
            ->orderBy('created_at', 'desc');

        if ($quick) {
            $query->limit(3);
        } else {
            $query->limit(10);
        }

        $clearances = $query->get()
            ->map(function ($clearance) {
                $url = '#';
                if (Route::has('resident.clearances.show')) {
                    $url = route('resident.clearances.show', $clearance->id);
                }

                $tags = [$clearance->status];
                if ($clearance->urgency) {
                    $tags[] = ucfirst($clearance->urgency);
                }

                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'description' => 'Purpose: ' . ($clearance->purpose ?? 'N/A'),
                    'url' => $url,
                    'icon' => 'FileCheck',
                    'badge' => 'My Clearance',
                    'tags' => array_filter($tags),
                    'meta' => [
                        'amount' => $clearance->fee_amount ? '₱' . number_format($clearance->fee_amount, 2) : null,
                        'payment_status' => $clearance->payment_status,
                        'date' => $clearance->created_at ? $clearance->created_at->format('M d, Y') : null,
                    ]
                ];
            })
            ->toArray();

        return $clearances;
    }

    protected function searchCommunityReports($searchTerm, $quick = false)
    {
        $query = CommunityReport::with(['reportType'])
            ->where('reporter_id', $this->residentId)
            ->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm)
                  ->orWhere('report_number', 'like', $searchTerm)
                  ->orWhere('location', 'like', $searchTerm);
            })
            ->orderBy('created_at', 'desc');

        if ($quick) {
            $query->limit(3);
        } else {
            $query->limit(10);
        }

        $reports = $query->get()
            ->map(function ($report) {
                $url = '#';
                if (Route::has('resident.community-reports.show')) {
                    $url = route('resident.community-reports.show', $report->id);
                }

                $tags = [$report->status];
                if ($report->urgency_level) {
                    $tags[] = ucfirst($report->urgency_level) . ' urgency';
                }

                return [
                    'id' => $report->id,
                    'type' => 'report',
                    'title' => $report->title ?? 'Untitled Report',
                    'subtitle' => 'Report #' . ($report->report_number ?? $report->id),
                    'description' => $report->description ?? '',
                    'url' => $url,
                    'icon' => 'FileText',
                    'badge' => 'My Report',
                    'tags' => array_filter($tags),
                    'meta' => [
                        'incident_date' => $report->incident_date ? date('M d, Y', strtotime($report->incident_date)) : null,
                        'location' => $report->location,
                    ]
                ];
            })
            ->toArray();

        return $reports;
    }

    protected function searchPayments($searchTerm, $quick = false)
    {
        $query = Payment::query()
            ->where('resident_id', $this->residentId)
            ->where(function($q) use ($searchTerm) {
                $q->where('or_number', 'like', $searchTerm)
                  ->orWhere('reference_number', 'like', $searchTerm)
                  ->orWhere('purpose', 'like', $searchTerm);
            })
            ->orderBy('payment_date', 'desc');

        if ($quick) {
            $query->limit(3);
        } else {
            $query->limit(10);
        }

        $payments = $query->get()
            ->map(function ($payment) {
                $url = '#';
                if (Route::has('resident.payments.show')) {
                    $url = route('resident.payments.show', $payment->id);
                }

                return [
                    'id' => $payment->id,
                    'type' => 'payment',
                    'title' => 'OR #' . ($payment->or_number ?? 'N/A'),
                    'subtitle' => 'Amount: ₱' . number_format($payment->total_amount ?? 0, 2),
                    'description' => $payment->purpose ?? '',
                    'url' => $url,
                    'icon' => 'Receipt',
                    'badge' => 'My Payment',
                    'tags' => array_filter([$payment->payment_method, $payment->status]),
                    'meta' => [
                        'date' => $payment->payment_date ? date('M d, Y', strtotime($payment->payment_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $payments;
    }

    protected function searchAnnouncements($searchTerm, $quick = false)
    {
        $query = Announcement::where('title', 'like', '%' . $searchTerm . '%')
            ->orWhere('content', 'like', '%' . $searchTerm . '%')
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('target_audience')
                  ->orWhere('target_audience', 'all')
                  ->orWhere('target_audience', 'residents');
            })
            ->orderBy('created_at', 'desc');

        if ($quick) {
            $query->limit(3);
        } else {
            $query->limit(10);
        }

        $announcements = $query->get()
            ->map(function ($announcement) {
                $url = '#';
                if (Route::has('resident.announcements.show')) {
                    $url = route('resident.announcements.show', $announcement->id);
                }

                $tags = [$announcement->type];
                if ($announcement->priority) {
                    $tags[] = 'Priority ' . $announcement->priority;
                }

                return [
                    'id' => $announcement->id,
                    'type' => 'announcement',
                    'title' => $announcement->title ?? 'Untitled Announcement',
                    'subtitle' => ucfirst($announcement->type ?? 'general') . ' Announcement',
                    'description' => $announcement->content ? substr(strip_tags($announcement->content), 0, 100) . '...' : '',
                    'url' => $url,
                    'icon' => 'Megaphone',
                    'badge' => 'Announcement',
                    'tags' => array_filter($tags),
                    'meta' => [
                        'posted_date' => $announcement->created_at ? $announcement->created_at->format('M d, Y') : null,
                    ]
                ];
            })
            ->toArray();

        return $announcements;
    }

protected function searchBusinesses($searchTerm)
{
    // Only show businesses if the resident has a business or if businesses are publicly viewable
    $businesses = Business::with(['purok'])
        ->where(function($q) use ($searchTerm) {
            $q->where('business_name', 'like', '%' . $searchTerm . '%')
              ->orWhere('business_type', 'like', '%' . $searchTerm . '%')
              ->orWhere('owner_name', 'like', '%' . $searchTerm . '%');
        })
        ->where('status', 'active')
        ->limit(10)
        ->get()
        ->map(function ($business) {
            $url = '#';
            if (Route::has('resident.businesses.show')) {
                $url = route('resident.businesses.show', $business->id);
            }

            return [
                'id' => $business->id,
                'type' => 'business',
                'title' => $business->business_name ?? 'Unnamed Business',
                'subtitle' => $business->business_type ?? 'Business',
                'description' => 'Owner: ' . ($business->owner_name ?? 'Unknown'),
                'url' => $url,
                'icon' => 'Briefcase',
                'badge' => 'Business',
                'tags' => [$business->status],
                'meta' => [
                    'location' => $business->address,
                ]
            ];
        })
        ->toArray();

    return $businesses;
}

    protected function getRelationshipToHead($memberId)
    {
        if (!$this->householdId) {
            return null;
        }

        $member = HouseholdMember::where('household_id', $this->householdId)
            ->where('resident_id', $memberId)
            ->first();

        return $member->relationship_to_head ?? 'Member';
    }

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

    protected function getRecentSearches(Request $request)
    {
        return $request->session()->get('recent_searches', []);
    }
}