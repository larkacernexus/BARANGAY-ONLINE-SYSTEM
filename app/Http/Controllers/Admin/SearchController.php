<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\User;
use App\Models\Business;
use App\Models\Purok;
use App\Models\Official;
use App\Models\CommunityReport;
use App\Models\ClearanceRequest;
use App\Models\Form;
use App\Models\Announcement;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class SearchController extends Controller
{
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
            
            // Return JSON response for quick search
            return response()->json(['quickResults' => $quickResults]);
        }

        // Regular search (full page)
        if (!$query || strlen($query) < 2) {
            return Inertia::render('admin/Search/Index', [
                'query' => $query ?? '',
                'results' => [],
                'recentSearches' => $this->getRecentSearches($request)
            ]);
        }

        $results = $this->performSearch($query);
        
        // Store search query for recent searches
        $this->storeSearchQuery($request, $query);
        
        return Inertia::render('admin/Search/Index', [
            'query' => $query,
            'results' => $results,
            'recentSearches' => $this->getRecentSearches($request)
        ]);
    }

    protected function performQuickSearch($query)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        // Quick search - top 3 from most important tables
        $residents = Resident::with('purok')
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('middle_name', 'like', $searchTerm)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
            ->limit(3)
            ->get()
            ->map(function($r) {
                $url = '#';
                if (Route::has('admin.residents.show')) {
                    $url = route('admin.residents.show', $r->id);
                }

                return [
                    'id' => $r->id,
                    'type' => 'resident',
                    'text' => $r->full_name ?? $r->first_name . ' ' . $r->last_name,
                    'subtext' => $r->purok?->name ?? 'No purok',
                    'url' => $url,
                    'icon' => 'User'
                ];
            })->toArray();

        $households = Household::with('purok')
            ->where('household_number', 'like', $searchTerm)
            ->orWhere('head_of_family', 'like', $searchTerm)
            ->orWhere('address', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($h) {
                $url = '#';
                if (Route::has('admin.households.show')) {
                    $url = route('admin.households.show', $h->id);
                }

                return [
                    'id' => $h->id,
                    'type' => 'household',
                    'text' => 'Household ' . ($h->household_number ?? '#' . $h->id),
                    'subtext' => $h->address ?? 'No address',
                    'url' => $url,
                    'icon' => 'Home'
                ];
            })->toArray();

        $businesses = Business::with('purok')
            ->where('business_name', 'like', $searchTerm)
            ->orWhere('owner_name', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($b) {
                $url = '#';
                if (Route::has('admin.businesses.show')) {
                    $url = route('admin.businesses.show', $b->id);
                }

                return [
                    'id' => $b->id,
                    'type' => 'business',
                    'text' => $b->business_name ?? 'Unnamed Business',
                    'subtext' => $b->business_type ?? 'Business',
                    'url' => $url,
                    'icon' => 'Briefcase'
                ];
            })->toArray();

        $puroks = Purok::where('name', 'like', $searchTerm)
            ->limit(1)
            ->get()
            ->map(function($p) {
                $url = '#';
                if (Route::has('admin.puroks.show')) {
                    $url = route('admin.puroks.show', $p->id);
                }

                return [
                    'id' => $p->id,
                    'type' => 'purok',
                    'text' => $p->name,
                    'subtext' => 'Purok',
                    'url' => $url,
                    'icon' => 'MapPin'
                ];
            })->toArray();

        // Search Users for quick results
        $users = User::with('role')
            ->where('first_name', 'like', $searchTerm)
            ->orWhere('last_name', 'like', $searchTerm)
            ->orWhere('username', 'like', $searchTerm)
            ->orWhere('email', 'like', $searchTerm)
            ->limit(2)
            ->get()
            ->map(function($user) {
                $url = '#';
                if (Route::has('admin.users.show')) {
                    $url = route('admin.users.show', $user->id);
                }

                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'text' => $user->first_name . ' ' . $user->last_name ?? $user->username ?? 'User',
                    'subtext' => $user->email ?? 'No email',
                    'url' => $url,
                    'icon' => 'UserCircle'
                ];
            })->toArray();

        // Search Officials for quick results
        $officials = Official::with('resident')
            ->whereHas('resident', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                  ->orWhere('last_name', 'like', $searchTerm);
            })
            ->limit(2)
            ->get()
            ->map(function($official) {
                $url = '#';
                if (Route::has('admin.officials.show')) {
                    $url = route('admin.officials.show', $official->id);
                }

                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'text' => $official->resident?->full_name ?? 'Unknown',
                    'subtext' => $official->position ?? 'Official',
                    'url' => $url,
                    'icon' => 'BadgeCheck'
                ];
            })->toArray();

        return array_merge($residents, $households, $businesses, $puroks, $users, $officials);
    }

    protected function performSearch($query)
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

                // Check if route exists
                $url = '#';
                if (Route::has('admin.residents.show')) {
                    $url = route('admin.residents.show', $resident->id);
                }

                return [
                    'id' => $resident->id,
                    'type' => 'resident',
                    'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                    'subtitle' => $resident->email ?? $resident->contact_number ?? 'No contact info',
                    'description' => $resident->purok?->name ?? 'No purok',
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.households.show')) {
                    $url = route('admin.households.show', $household->id);
                }

                return [
                    'id' => $household->id,
                    'type' => 'household',
                    'title' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                    'subtitle' => $household->address ?? 'No address',
                    'description' => 'Head: ' . ($household->head_of_family ?? 'Unknown') . ' | Members: ' . $household->member_count,
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.users.show')) {
                    $url = route('admin.users.show', $user->id);
                }

                return [
                    'id' => $user->id,
                    'type' => 'user',
                    'title' => ($user->first_name ?? '') . ' ' . ($user->last_name ?? '') ?: $user->username ?? 'User',
                    'subtitle' => $user->email ?? 'No email',
                    'description' => 'Role: ' . ($user->role?->name ?? 'No role') . ' | Status: ' . $user->status,
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.businesses.show')) {
                    $url = route('admin.businesses.show', $business->id);
                }

                return [
                    'id' => $business->id,
                    'type' => 'business',
                    'title' => $business->business_name ?? 'Unnamed Business',
                    'subtitle' => $business->business_type ?? 'Business',
                    'description' => 'Owner: ' . ($business->owner_name ?? 'Unknown') . ' | ' . ($business->address ?? 'No address'),
                    'url' => $url,
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

                $url = '#';
                if (Route::has('admin.officials.show')) {
                    $url = route('admin.officials.show', $official->id);
                }
                
                return [
                    'id' => $official->id,
                    'type' => 'official',
                    'title' => $official->resident?->full_name ?? 'Unknown',
                    'subtitle' => $official->position ?? 'No position',
                    'description' => $official->committee ?? 'No committee',
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.puroks.show')) {
                    $url = route('admin.puroks.show', $purok->id);
                }

                return [
                    'id' => $purok->id,
                    'type' => 'purok',
                    'title' => $purok->name ?? 'Unnamed Purok',
                    'subtitle' => 'Leader: ' . ($purok->leader_name ?? 'None'),
                    'description' => $purok->total_households . ' households, ' . $purok->total_residents . ' residents',
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.community-reports.show')) {
                    $url = route('admin.community-reports.show', $report->id);
                }

                return [
                    'id' => $report->id,
                    'type' => 'report',
                    'title' => $report->title ?? 'Untitled Report',
                    'subtitle' => 'Report #' . ($report->report_number ?? $report->id),
                    'description' => $report->description ?? '',
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.clearance-requests.show')) {
                    $url = route('admin.clearance-requests.show', $clearance->id);
                }

                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'description' => 'Resident: ' . ($clearance->resident?->full_name ?? 'Unknown') . ' | Purpose: ' . ($clearance->purpose ?? 'N/A'),
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.forms.show')) {
                    $url = route('admin.forms.show', $form->id);
                }

                return [
                    'id' => $form->id,
                    'type' => 'form',
                    'title' => $form->title ?? 'Untitled Form',
                    'subtitle' => $form->category ?? 'Form',
                    'description' => $form->description ?? '',
                    'url' => $url,
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
                $url = '#';
                if (Route::has('admin.announcements.show')) {
                    $url = route('admin.announcements.show', $announcement->id);
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
                $url = '#';
                if (Route::has('admin.payments.show')) {
                    $url = route('admin.payments.show', $payment->id);
                }

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
                    'url' => $url,
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