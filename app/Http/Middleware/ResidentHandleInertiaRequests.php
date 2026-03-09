<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
use App\Helpers\NotificationHelper;

class ResidentHandleInertiaRequests extends Middleware
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
        $householdMembers = [];
        $householdData = null;
        
        // Notification data
        $notifications = [];
        $unreadNotificationCount = 0;
        
        // Handle search queries
        $searchResults = [];
        $quickResults = [];
        $recentSearches = [];
        
        $query = $request->input('q');
        $isQuick = $request->input('quick', false);
        
        if ($query && strlen($query) >= 2 && $user && $user->resident_id) {
            if ($isQuick) {
                $quickResults = $this->performResidentQuickSearch($query, $user->resident_id);
            } else {
                $searchResults = $this->performResidentFullSearch($query, $user->resident_id);
                $this->storeSearchQuery($request, $query);
            }
        }
        
        $recentSearches = $this->getRecentSearches($request);
        
        if ($user) {
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
                    'is_senior' => $resident->is_senior,
                    'is_pwd' => $resident->is_pwd,
                    'is_solo_parent' => $resident->is_solo_parent,
                    'is_indigent' => $resident->is_indigent,
                    'is_voter' => $resident->is_voter,
                    'occupation' => $resident->occupation,
                ];
                
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
                        
                        $householdMembers = HouseholdMember::with(['resident'])
                            ->where('household_id', $user->household_id)
                            ->get()
                            ->map(function ($member) {
                                $resident = $member->resident;
                                if (!$resident) {
                                    return null;
                                }
                                
                                return [
                                    'id' => $member->id,
                                    'resident_id' => $resident->id,
                                    'first_name' => $resident->first_name,
                                    'middle_name' => $resident->middle_name,
                                    'last_name' => $resident->last_name,
                                    'suffix' => $resident->suffix,
                                    'full_name' => $resident->full_name,
                                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
                                    'age' => $resident->age,
                                    'gender' => $resident->gender,
                                    'civil_status' => $resident->civil_status,
                                    'contact_number' => $resident->contact_number,
                                    'email' => $resident->email,
                                    'occupation' => $resident->occupation,
                                    'education' => $resident->education,
                                    'religion' => $resident->religion,
                                    'is_head' => $member->is_head,
                                    'relationship_to_head' => $member->relationship_to_head,
                                    'is_senior' => $resident->is_senior,
                                    'is_pwd' => $resident->is_pwd,
                                    'is_solo_parent' => $resident->is_solo_parent,
                                    'is_indigent' => $resident->is_indigent,
                                    'is_voter' => $resident->is_voter,
                                    'avatar' => $resident->avatar,
                                    'has_special_classification' => $resident->has_special_classification,
                                    'discount_eligibilities' => $resident->discount_eligibility_list,
                                ];
                            })
                            ->filter()
                            ->values()
                            ->toArray();
                        
                        $householdMembersCount = count($householdMembers);
                        
                        $householdData = [
                            'id' => $household->id,
                            'household_number' => $household->household_number,
                            'contact_number' => $household->contact_number,
                            'email' => $household->email,
                            'address' => $household->address,
                            'full_address' => $household->full_address,
                            'purok' => $household->purok?->name,
                            'purok_id' => $household->purok_id,
                            'member_count' => $household->member_count,
                            'income_range' => $household->income_range,
                            'housing_type' => $household->housing_type,
                            'ownership_status' => $household->ownership_status,
                            'water_source' => $household->water_source,
                            'has_electricity' => $household->has_electricity,
                            'has_internet' => $household->has_internet,
                            'has_vehicle' => $household->has_vehicle,
                        ];
                    }
                }
                
                if ($resident->purok) {
                    $purok = $resident->purok->name;
                }
            }
            
            // ========== FIXED: PROPER NOTIFICATION HANDLING WITH CORRECT LINKS ==========
            $rawNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            // Format each notification using NotificationHelper
            $notifications = $rawNotifications->map(function ($notification) use ($user) {
                // Use the helper to properly format the notification
                $formatted = NotificationHelper::formatNotification($notification, $user);
                
                // Get the notification data
                $notificationData = $formatted->data ?? [];
                
                // Determine the correct link - PRIORITY ORDER:
                // 1. Check for link in data
                // 2. Check for action_url in data
                // 3. Check for url in formatted
                // 4. Check if it's admin link and convert to portal
                // 5. Default to '#'
                $link = $notificationData['link'] 
                    ?? $notificationData['action_url'] 
                    ?? $formatted->url 
                    ?? '#';
                
                // Convert admin links to portal links for residents
                if (str_starts_with($link, '/admin/')) {
                    $link = str_replace('/admin/', '/portal/', $link);
                    Log::debug('Converted admin link to portal link', [
                        'original' => $notificationData['link'] ?? null,
                        'converted' => $link
                    ]);
                }
                
                // Also create action_url for compatibility
                $actionUrl = $notificationData['action_url'] 
                    ?? $notificationData['link'] 
                    ?? $formatted->url 
                    ?? '#';
                    
                if (str_starts_with($actionUrl, '/admin/')) {
                    $actionUrl = str_replace('/admin/', '/portal/', $actionUrl);
                }
                
                return [
                    'id' => $formatted->id,
                    'type' => $formatted->type,
                    'data' => $notificationData,
                    'read_at' => $formatted->read_at,
                    'created_at' => $formatted->created_at,
                    'created_at_diff' => $formatted->created_at_diff ?? $formatted->created_at->diffForHumans(),
                    
                    // Fields from NotificationHelper formatting
                    'title' => $formatted->title ?? 'Notification',
                    'message' => $formatted->message ?? 'New notification',
                    'url' => $formatted->url ?? '#',
                    
                    // ✅ FIXED: Use our properly determined links
                    'link' => $link,
                    'action_url' => $actionUrl,
                    
                    // Type flags
                    'is_announcement' => $formatted->is_announcement ?? false,
                    'is_fee_notification' => $formatted->is_fee_notification ?? false,
                    'is_clearance_notification' => $formatted->is_clearance_notification ?? false,
                    
                    // Resident data
                    'resident_name' => $formatted->resident_name ?? null,
                    'resident_id' => $formatted->resident_id ?? null,
                    
                    // Clearance data
                    'reference_number' => $formatted->reference_number ?? null,
                    'clearance_type' => $formatted->clearance_type ?? null,
                    'clearance_id' => $formatted->clearance_id ?? null,
                    'purpose' => $formatted->purpose ?? null,
                    
                    // Fee/Payment data
                    'fee_amount' => $formatted->fee_amount ?? null,
                    'formatted_amount' => $formatted->formatted_amount ?? null,
                    'fee_id' => $formatted->fee_id ?? null,
                    'fee_code' => $formatted->fee_code ?? null,
                    'fee_type' => $formatted->fee_type ?? null,
                    'payment_id' => $formatted->payment_id ?? null,
                    
                    // Status
                    'status' => $formatted->status ?? null,
                    
                    // Announcement specific fields
                    'priority' => $formatted->priority ?? null,
                    'priority_label' => $formatted->priority_label ?? null,
                    'priority_color' => $formatted->priority_color ?? null,
                    'type_label' => $formatted->type_label ?? null,
                    'type_icon' => $formatted->type_icon ?? null,
                    'type_color' => $formatted->type_color ?? null,
                    'audience_summary' => $formatted->audience_summary ?? null,
                    'estimated_reach' => $formatted->estimated_reach ?? null,
                    'formatted_date_range' => $formatted->formatted_date_range ?? null,
                    'time_range' => $formatted->time_range ?? null,
                    'created_by' => $formatted->created_by ?? null,
                    'formatted_created' => $formatted->formatted_created ?? null,
                    'is_active' => $formatted->is_active ?? true,
                    'is_currently_active' => $formatted->is_currently_active ?? true,
                ];
            })->toArray();

            $unreadNotificationCount = NotificationHelper::getUnreadCount($user);

            Log::info('User notifications fetched with NotificationHelper', [
                'user_id' => $user->id,
                'notification_count' => count($notifications),
                'unread_count' => $unreadNotificationCount,
                'has_announcements' => collect($notifications)->contains('is_announcement', true),
                'sample_link' => count($notifications) > 0 ? $notifications[0]['link'] ?? 'none' : 'none'
            ]);
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
                ] : null,
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
        ]);
    }

    // ========== SEARCH METHODS (keep all your existing search methods) ==========
    
    protected function performResidentQuickSearch($query, $residentId)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        $results = array_merge($results, $this->searchSelfResident($searchTerm, $residentId));
        $results = array_merge($results, $this->searchHouseholdMembers($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnClearances($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnBusinesses($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnPayments($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnReports($searchTerm, $residentId));

        return array_slice($results, 0, 8);
    }

    protected function performResidentFullSearch($query, $residentId)
    {
        $searchTerm = '%' . $query . '%';
        $results = [];

        $results = array_merge($results, $this->searchSelfResident($searchTerm, $residentId));
        $results = array_merge($results, $this->searchHouseholdMembers($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnHousehold($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnClearances($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnBusinesses($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnPayments($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnReports($searchTerm, $residentId));
        $results = array_merge($results, $this->searchOwnDocuments($searchTerm, $residentId));

        usort($results, function($a, $b) {
            $priority = [
                'self' => 1,
                'household_member' => 2,
                'household' => 3,
                'clearance' => 4,
                'business' => 5,
                'payment' => 6,
                'report' => 7,
                'document' => 8,
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

    protected function searchSelfResident($searchTerm, $residentId)
    {
        $resident = Resident::with(['purok', 'household'])
            ->where('id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm)
                    ->orWhere('middle_name', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm)
                    ->orWhere('contact_number', 'like', $searchTerm)
                    ->orWhere('resident_id', 'like', $searchTerm)
                    ->orWhere('address', 'like', $searchTerm)
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
                    ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm]);
            })
            ->get();

        return $resident->map(function ($resident) {
            $tags = [];
            if ($resident->is_senior) $tags[] = 'Senior';
            if ($resident->is_pwd) $tags[] = 'PWD';
            if ($resident->is_solo_parent) $tags[] = 'Solo Parent';
            if ($resident->is_indigent) $tags[] = 'Indigent';
            if ($resident->is_voter) $tags[] = 'Voter';

            return [
                'id' => $resident->id,
                'type' => 'self',
                'title' => 'My Profile',
                'subtitle' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                'description' => $resident->email ?? $resident->contact_number ?? 'No contact info',
                'url' => route('residents.show', $resident->id),
                'icon' => 'User',
                'badge' => 'You',
                'tags' => array_filter($tags),
                'meta' => [
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'civil_status' => $resident->civil_status,
                    'purok' => $resident->purok?->name ?? 'No purok',
                ]
            ];
        })->toArray();
    }

    protected function searchHouseholdMembers($searchTerm, $residentId)
    {
        $resident = Resident::find($residentId);
        if (!$resident || !$resident->household_id) {
            return [];
        }

        $householdMembers = HouseholdMember::with(['resident'])
            ->where('household_id', $resident->household_id)
            ->whereHas('resident', function($q) use ($searchTerm, $residentId) {
                $q->where('id', '!=', $residentId)
                    ->where(function($query) use ($searchTerm) {
                        $query->where('first_name', 'like', $searchTerm)
                            ->orWhere('last_name', 'like', $searchTerm)
                            ->orWhere('middle_name', 'like', $searchTerm)
                            ->orWhere('email', 'like', $searchTerm)
                            ->orWhere('contact_number', 'like', $searchTerm)
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$searchTerm])
                            ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?", [$searchTerm]);
                    });
            })
            ->get();

        return $householdMembers->map(function ($member) {
            $resident = $member->resident;
            $relationship = $member->is_head ? 'Head of Household' : $member->relationship_to_head;
            
            return [
                'id' => $resident->id,
                'type' => 'household_member',
                'title' => $resident->full_name ?? $resident->first_name . ' ' . $resident->last_name,
                'subtitle' => 'Household Member',
                'description' => $relationship . ' | ' . ($resident->contact_number ?? 'No contact'),
                'url' => route('residents.show', $resident->id),
                'icon' => 'Users',
                'badge' => 'Family Member',
                'tags' => array_filter([
                    $member->is_head ? 'Head' : null,
                    $resident->is_senior ? 'Senior' : null,
                ]),
                'meta' => [
                    'relationship' => $relationship,
                    'age' => $resident->age,
                ]
            ];
        })->toArray();
    }

    protected function searchOwnHousehold($searchTerm, $residentId)
    {
        $resident = Resident::find($residentId);
        if (!$resident || !$resident->household_id) {
            return [];
        }

        $household = Household::with(['purok'])
            ->where('id', $resident->household_id)
            ->where(function($query) use ($searchTerm) {
                $query->where('household_number', 'like', $searchTerm)
                    ->orWhere('contact_number', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm)
                    ->orWhere('address', 'like', $searchTerm)
                    ->orWhere('head_of_family', 'like', $searchTerm);
            })
            ->get();

        return $household->map(function ($household) {
            return [
                'id' => $household->id,
                'type' => 'household',
                'title' => 'My Household',
                'subtitle' => 'Household ' . ($household->household_number ?? '#' . $household->id),
                'description' => $household->address ?? 'No address',
                'url' => route('households.show', $household->id),
                'icon' => 'Home',
                'badge' => 'Household',
                'tags' => array_filter([
                    $household->housing_type,
                    $household->ownership_status,
                ]),
                'meta' => [
                    'member_count' => $household->member_count,
                    'head' => $household->head_of_family ?? 'Unknown',
                ]
            ];
        })->toArray();
    }

    protected function searchOwnClearances($searchTerm, $residentId)
    {
        $clearances = ClearanceRequest::with(['clearanceType'])
            ->where('resident_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('reference_number', 'like', $searchTerm)
                    ->orWhere('clearance_number', 'like', $searchTerm)
                    ->orWhere('purpose', 'like', $searchTerm)
                    ->orWhere('specific_purpose', 'like', $searchTerm)
                    ->orWhere('or_number', 'like', $searchTerm);
            })
            ->limit(10)
            ->get()
            ->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'type' => 'clearance',
                    'title' => $clearance->clearanceType?->name ?? 'Clearance Request',
                    'subtitle' => 'Ref: ' . ($clearance->reference_number ?? 'N/A'),
                    'description' => 'Status: ' . ucfirst($clearance->status) . ' | Purpose: ' . ($clearance->purpose ?? 'N/A'),
                    'url' => route('clearances.show', $clearance->id),
                    'icon' => 'FileCheck',
                    'badge' => 'My Clearance',
                    'tags' => array_filter([$clearance->status, $clearance->payment_status]),
                    'meta' => [
                        'date' => $clearance->created_at?->format('M d, Y'),
                        'amount' => $clearance->fee_amount ? '₱' . number_format($clearance->fee_amount, 2) : null,
                    ]
                ];
            })
            ->toArray();

        return $clearances;
    }

    protected function searchOwnBusinesses($searchTerm, $residentId)
    {
        if (!class_exists('App\Models\Business')) {
            return [];
        }

        $businesses = Business::with(['purok'])
            ->where('owner_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('business_name', 'like', $searchTerm)
                    ->orWhere('business_type', 'like', $searchTerm)
                    ->orWhere('dti_sec_number', 'like', $searchTerm)
                    ->orWhere('mayors_permit_number', 'like', $searchTerm)
                    ->orWhere('address', 'like', $searchTerm);
            })
            ->limit(5)
            ->get()
            ->map(function ($business) {
                return [
                    'id' => $business->id,
                    'type' => 'business',
                    'title' => 'My Business: ' . ($business->business_name ?? 'Unnamed'),
                    'subtitle' => $business->business_type ?? 'Business',
                    'description' => $business->address ?? 'No address',
                    'url' => route('businesses.show', $business->id),
                    'icon' => 'Briefcase',
                    'badge' => 'My Business',
                    'tags' => [$business->status],
                    'meta' => [
                        'permit_expiry' => $business->permit_expiry_date ? date('M d, Y', strtotime($business->permit_expiry_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $businesses;
    }

   protected function searchOwnPayments($searchTerm, $residentId)
{
    $payments = Payment::where('payer_type', 'resident')
        ->where('payer_id', $residentId)
        ->where(function($query) use ($searchTerm) {
            $query->where('or_number', 'like', $searchTerm)
                ->orWhere('reference_number', 'like', $searchTerm)
                ->orWhere('purpose', 'like', $searchTerm);
        })
        ->limit(5)
        ->get()
        ->map(function ($payment) {
            return [
                'id' => $payment->id,
                'type' => 'payment',
                'title' => 'Payment: OR #' . ($payment->or_number ?? 'N/A'),
                'subtitle' => 'Amount: ₱' . number_format($payment->total_amount ?? 0, 2),
                'description' => $payment->purpose ?? '',
                'url' => route('resident.payments.show', $payment->id),
                'icon' => 'Receipt',
                'badge' => 'My Payment',
                'tags' => [$payment->payment_method, $payment->status],
                'meta' => [
                    'date' => $payment->payment_date ? date('M d, Y', strtotime($payment->payment_date)) : null,
                ]
            ];
        })
        ->toArray();

    return $payments;
}

    protected function searchOwnReports($searchTerm, $residentId)
    {
        $reports = CommunityReport::with(['reportType'])
            ->where(function($query) use ($residentId, $searchTerm) {
                $resident = Resident::find($residentId);
                if ($resident && $resident->user_id) {
                    $query->where('user_id', $resident->user_id);
                } else {
                    $query->where('reporter_name', 'like', '%' . $resident->first_name . '%')
                        ->where('reporter_name', 'like', '%' . $resident->last_name . '%')
                        ->where('is_anonymous', false);
                }
            })
            ->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm)
                    ->orWhere('report_number', 'like', $searchTerm)
                    ->orWhere('location', 'like', $searchTerm);
            })
            ->limit(5)
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
                    'badge' => 'My Report',
                    'tags' => array_filter([$report->status, $report->urgency_level]),
                    'meta' => [
                        'date' => $report->incident_date ? date('M d, Y', strtotime($report->incident_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $reports;
    }

    protected function searchOwnDocuments($searchTerm, $residentId)
    {
        if (!class_exists('App\Models\ResidentDocument')) {
            return [];
        }

        $documents = ResidentDocument::with(['documentCategory'])
            ->where('resident_id', $residentId)
            ->where(function($query) use ($searchTerm) {
                $query->where('name', 'like', $searchTerm)
                    ->orWhere('reference_number', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm);
            })
            ->limit(5)
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'type' => 'document',
                    'title' => $document->name ?? 'Document',
                    'subtitle' => $document->documentCategory?->name ?? 'Document',
                    'description' => $document->description ?? '',
                    'url' => route('resident-documents.show', $document->id),
                    'icon' => 'File',
                    'badge' => 'My Document',
                    'tags' => array_filter([$document->status]),
                    'meta' => [
                        'size' => $document->file_size_human,
                        'expiry' => $document->expiry_date ? date('M d, Y', strtotime($document->expiry_date)) : null,
                    ]
                ];
            })
            ->toArray();

        return $documents;
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