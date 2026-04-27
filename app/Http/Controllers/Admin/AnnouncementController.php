<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Role;
use App\Models\Purok;
use App\Models\Household;
use App\Models\Business;
use App\Models\User;
use App\Models\AnnouncementAttachment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    /**
     * Allowed per page options
     */
    protected const ALLOWED_PER_PAGE = ['15', '30', '50', '100', '500', 'all'];
    
    /**
     * Default per page value
     */
    protected const DEFAULT_PER_PAGE = 15;

    /**
     * Display a listing of announcements.
     */
    public function index(Request $request)
    {
        $query = Announcement::query()->with(['creator', 'updater']);
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhereHas('creator', function ($userQ) use ($search) {
                      $userQ->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('audience_type') && $request->audience_type !== 'all') {
            $query->where('audience_type', $request->audience_type);
        }
        
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', (int) $request->priority);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'active':
                    $query->published();
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'expired':
                    $query->expired();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
            }
        }
        
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        
        // Dynamic per page
        $perPage = $this->getPerPage($request);
        
        $announcements = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'type' => $announcement->type,
                    'type_label' => $announcement->type_label,
                    'priority' => $announcement->priority,
                    'priority_label' => $announcement->priority_label,
                    'is_active' => $announcement->is_active,
                    'audience_type' => $announcement->audience_type,
                    'audience_summary' => $announcement->audience_summary,
                    'estimated_reach' => $announcement->estimated_reach,
                    'start_date' => $announcement->start_date,
                    'end_date' => $announcement->end_date,
                    'formatted_date_range' => $announcement->formatted_date_range,
                    'created_at' => $announcement->created_at,
                    'updated_at' => $announcement->updated_at,
                    'status' => $announcement->status,
                    'status_label' => $announcement->status_label,
                    'status_color' => $announcement->status_color,
                    'is_currently_active' => $announcement->isCurrentlyActive(),
                    'has_attachments' => $announcement->attachments()->exists(),
                    'attachments_count' => $announcement->attachments()->count(),
                    'creator' => $announcement->creator ? [
                        'id' => $announcement->creator->id,
                        'name' => $announcement->creator->full_name,
                    ] : null,
                ];
            });
        
        $stats = [
            'total' => Announcement::count(),
            'active' => Announcement::published()->count(),
            'expired' => Announcement::expired()->count(),
            'upcoming' => Announcement::upcoming()->count(),
            'inactive' => Announcement::where('is_active', false)->count(),
            'by_audience' => [
                'all' => Announcement::where('audience_type', 'all')->count(),
                'roles' => Announcement::where('audience_type', 'roles')->count(),
                'puroks' => Announcement::where('audience_type', 'puroks')->count(),
                'households' => Announcement::where('audience_type', 'households')->count(),
                'household_members' => Announcement::where('audience_type', 'household_members')->count(),
                'businesses' => Announcement::where('audience_type', 'businesses')->count(),
                'specific_users' => Announcement::where('audience_type', 'specific_users')->count(),
            ],
            'with_attachments' => Announcement::has('attachments')->count(),
            'total_attachments' => AnnouncementAttachment::count(),
            'total_attachments_size' => AnnouncementAttachment::sum('file_size'),
        ];
        
        return Inertia::render('admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only([
                'search', 'type', 'audience_type', 'priority', 'status', 
                'from_date', 'to_date', 'per_page'
            ]),
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
            'audience_types' => Announcement::getAudienceTypes(),
            'status_options' => Announcement::getStatusOptions(),
            'stats' => $stats,
        ]);
    }

    /**
     * Get the per page value from request
     */
    private function getPerPage(Request $request): int
    {
        $perPage = $request->input('per_page', self::DEFAULT_PER_PAGE);
        
        // Handle 'all' option
        if ($perPage === 'all') {
            return Announcement::count() ?: self::DEFAULT_PER_PAGE;
        }
        
        // Validate that per_page is in allowed values
        if (in_array($perPage, self::ALLOWED_PER_PAGE)) {
            return (int) $perPage;
        }
        
        // Return default if invalid value
        return self::DEFAULT_PER_PAGE;
    }
    /**
     * Show the form for creating a new announcement.
     * Only loads small datasets (roles, puroks). Households, businesses, and users
     * are fetched via AJAX search to improve page load performance.
     */
    public function create()
    {
        $roles = Role::orderBy('name')->get(['id', 'name']);
        $puroks = Purok::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('admin/Announcements/Create', [
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
            'audience_types' => Announcement::getAudienceTypes(),
            'roles' => $roles,
            'puroks' => $puroks,
            'households' => [],  // Fetched via AJAX: /admin/announcements/search-households
            'businesses' => [],  // Fetched via AJAX: /admin/announcements/search-businesses
            'users' => [],       // Fetched via AJAX: /admin/announcements/search-users
            'maxFileSize' => config('announcements.max_file_size', 10),
            'allowedFileTypes' => config('announcements.allowed_file_types', [
                'image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.ppt', '.pptx'
            ]),
            'templates' => [
                [
                    'title' => 'Barangay Assembly',
                    'content' => 'Barangay Assembly will be held on [DATE] at [TIME] at the Barangay Hall. All residents are invited to attend.',
                    'type' => 'event',
                    'priority' => 2,
                ],
                [
                    'title' => 'Medical Mission',
                    'content' => 'Free medical mission with dental check-up, blood pressure monitoring, and medicine distribution.',
                    'type' => 'event',
                    'priority' => 3,
                ],
                [
                    'title' => 'Clean-Up Drive',
                    'content' => 'Community clean-up drive. Meet at the Barangay Hall at 7 AM. Please bring your own gloves and trash bags.',
                    'type' => 'general',
                    'priority' => 1,
                ],
                [
                    'title' => 'Water Interruption Notice',
                    'content' => 'Please be advised that there will be water interruption on [DATE] from [TIME] to [TIME] due to pipeline maintenance.',
                    'type' => 'maintenance',
                    'priority' => 3,
                ],
            ],
        ]);
    }
    
    /**
     * Search households via AJAX for announcement audience selection.
     */
    public function searchHouseholds(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Household::with('purok')
            ->select(['id', 'household_number', 'purok_id', 'address'])
            ->orderBy('household_number');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('purok', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($household) {
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'address' => $household->address,
                'purok' => $household->purok ? [
                    'id' => $household->purok->id,
                    'name' => $household->purok->name,
                ] : null,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
    
    /**
     * Search businesses via AJAX for announcement audience selection.
     */
    public function searchBusinesses(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Business::select(['id', 'business_name', 'owner_name', 'owner_id'])
            ->orderBy('business_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($business) {
            return [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'owner_name' => $business->owner_name,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
    
    /**
     * Search users via AJAX for announcement audience selection.
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = User::with(['role', 'household'])
            ->select(['id', 'first_name', 'last_name', 'email', 'role_id', 'household_id'])
            ->orderBy('first_name')
            ->orderBy('last_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
    
    /**
     * Store a newly created announcement with optional attachments.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,important,event,maintenance,other',
            'priority' => 'required|integer|min:0|max:4',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'end_time' => 'nullable|date_format:H:i',
            'audience_type' => 'required|in:all,roles,puroks,households,household_members,businesses,specific_users',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'exists:roles,id',
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
            'target_households' => 'nullable|array',
            'target_households.*' => 'exists:households,id',
            'target_businesses' => 'nullable|array',
            'target_businesses.*' => 'exists:businesses,id',
            'target_users' => 'nullable|array',
            'target_users.*' => 'exists:users,id',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);
        
        $validated['created_by'] = Auth::id();
        
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }
        
        foreach (['target_roles', 'target_puroks', 'target_households', 'target_businesses', 'target_users'] as $field) {
            if (empty($validated[$field])) {
                $validated[$field] = null;
            }
        }
        
        DB::beginTransaction();
        
        try {
            $announcement = Announcement::create($validated);
            
            if ($request->hasFile('attachments') && !empty($request->file('attachments'))) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('announcements/' . date('Y/m'), 'public');
                    
                    $announcement->attachments()->create([
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'created_by' => Auth::id(),
                    ]);
                }
            }
            
            if ($announcement->is_active) {
                $notificationCount = $announcement->notifyTargetAudience('created');
                $message = "Announcement created successfully. Notifications sent to {$notificationCount} users.";
            } else {
                $message = "Announcement created successfully as draft.";
            }
            
            DB::commit();
            
            return redirect()->route('admin.announcements.show', $announcement->id)
                ->with('success', $message);
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create announcement: ' . $e->getMessage());
        }
    }
    
    /**
     * Display the specified announcement with attachments.
     */
    public function show(Announcement $announcement)
    {
        $announcement->load(['creator', 'updater', 'attachments' => function($q) {
            $q->orderBy('created_at', 'desc');
        }]);
        
        $audienceDetails = [];
        
        switch ($announcement->audience_type) {
            case 'roles':
                $audienceDetails['roles'] = Role::whereIn('id', $announcement->target_roles ?? [])->get();
                break;
            case 'puroks':
                $audienceDetails['puroks'] = Purok::whereIn('id', $announcement->target_puroks ?? [])->get();
                break;
            case 'households':
            case 'household_members':
                $audienceDetails['households'] = Household::whereIn('id', $announcement->target_households ?? [])
                    ->with('purok')->get();
                break;
            case 'businesses':
                $audienceDetails['businesses'] = Business::whereIn('id', $announcement->target_businesses ?? [])->get();
                break;
            case 'specific_users':
                $audienceDetails['users'] = User::whereIn('id', $announcement->target_users ?? [])
                    ->with(['role', 'household'])->get();
                break;
        }
        
        $notificationStats = $announcement->getNotificationStats();
        
        return Inertia::render('admin/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'type' => $announcement->type,
                'type_label' => $announcement->type_label,
                'priority' => $announcement->priority,
                'priority_label' => $announcement->priority_label,
                'is_active' => $announcement->is_active,
                'audience_type' => $announcement->audience_type,
                'audience_type_label' => Announcement::getAudienceTypes()[$announcement->audience_type] ?? $announcement->audience_type,
                'audience_summary' => $announcement->audience_summary,
                'estimated_reach' => $announcement->estimated_reach,
                'target_roles' => $announcement->target_roles,
                'target_puroks' => $announcement->target_puroks,
                'target_households' => $announcement->target_households,
                'target_businesses' => $announcement->target_businesses,
                'target_users' => $announcement->target_users,
                'start_date' => $announcement->start_date,
                'start_time' => $announcement->start_time?->format('H:i'),
                'end_date' => $announcement->end_date,
                'end_time' => $announcement->end_time?->format('H:i'),
                'formatted_date_range' => $announcement->formatted_date_range,
                'created_at' => $announcement->created_at,
                'updated_at' => $announcement->updated_at,
                'status' => $announcement->status,
                'status_label' => $announcement->status_label,
                'status_color' => $announcement->status_color,
                'is_currently_active' => $announcement->isCurrentlyActive(),
                'has_attachments' => $announcement->attachments->isNotEmpty(),
                'attachments' => $announcement->attachments->map(function($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_path' => $attachment->file_path,
                        'file_name' => $attachment->file_name,
                        'original_name' => $attachment->original_name ?? $attachment->file_name,
                        'file_size' => $attachment->file_size,
                        'formatted_size' => $attachment->formatted_size,
                        'mime_type' => $attachment->mime_type,
                        'is_image' => $attachment->is_image,
                        'created_at' => $attachment->created_at,
                        'created_by' => $attachment->creator?->full_name,
                    ];
                }),
                'attachments_count' => $announcement->attachments->count(),
                'creator' => $announcement->creator ? [
                    'id' => $announcement->creator->id,
                    'name' => $announcement->creator->full_name,
                    'email' => $announcement->creator->email,
                ] : null,
                'notification_stats' => $notificationStats,
            ],
            'audience_details' => $audienceDetails,
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
            'audience_types' => Announcement::getAudienceTypes(),
        ]);
    }
    
    /**
     * Show the form for editing the announcement.
     */
    public function edit(Announcement $announcement)
    {
        $announcement->load('attachments');
        
        $roles = Role::orderBy('name')->get(['id', 'name']);
        $puroks = Purok::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('admin/Announcements/Edit', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'type' => $announcement->type,
                'priority' => $announcement->priority,
                'is_active' => $announcement->is_active,
                'audience_type' => $announcement->audience_type,
                'target_roles' => $announcement->target_roles ?? [],
                'target_puroks' => $announcement->target_puroks ?? [],
                'target_households' => $announcement->target_households ?? [],
                'target_businesses' => $announcement->target_businesses ?? [],
                'target_users' => $announcement->target_users ?? [],
                'start_date' => $announcement->start_date?->format('Y-m-d'),
                'start_time' => $announcement->start_time?->format('H:i'),
                'end_date' => $announcement->end_date?->format('Y-m-d'),
                'end_time' => $announcement->end_time?->format('H:i'),
                'has_attachments' => $announcement->attachments->isNotEmpty(),
                'attachments' => $announcement->attachments->map(function($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_path' => $attachment->file_path,
                        'file_name' => $attachment->file_name,
                        'original_name' => $attachment->original_name ?? $attachment->file_name,
                        'file_size' => $attachment->file_size,
                        'formatted_size' => $attachment->formatted_size,
                        'mime_type' => $attachment->mime_type,
                        'is_image' => $attachment->is_image,
                    ];
                }),
            ],
            'types' => Announcement::getTypes(),
            'priorities' => Announcement::getPriorityOptions(),
            'audience_types' => Announcement::getAudienceTypes(),
            'roles' => $roles,
            'puroks' => $puroks,
            'households' => [],  // Fetched via AJAX
            'businesses' => [],  // Fetched via AJAX
            'users' => [],       // Fetched via AJAX
            'maxFileSize' => config('announcements.max_file_size', 10),
            'allowedFileTypes' => config('announcements.allowed_file_types', [
                'image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'
            ]),
        ]);
    }
    
    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:general,important,event,maintenance,other',
            'priority' => 'required|integer|min:0|max:4',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'end_time' => 'nullable|date_format:H:i',
            'audience_type' => 'required|in:all,roles,puroks,households,household_members,businesses,specific_users',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'exists:roles,id',
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
            'target_households' => 'nullable|array',
            'target_households.*' => 'exists:households,id',
            'target_businesses' => 'nullable|array',
            'target_businesses.*' => 'exists:businesses,id',
            'target_users' => 'nullable|array',
            'target_users.*' => 'exists:users,id',
            'new_attachments' => 'nullable|array',
            'new_attachments.*' => 'file|max:10240',
            'keep_attachments' => 'nullable|array',
            'keep_attachments.*' => 'exists:announcement_attachments,id',
        ]);
        
        $validated['updated_by'] = Auth::id();
        
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $announcement->is_active;
        }
        
        foreach (['target_roles', 'target_puroks', 'target_households', 'target_businesses', 'target_users'] as $field) {
            if (empty($validated[$field])) {
                $validated[$field] = null;
            }
        }
        
        $wasInactive = !$announcement->is_active;
        $audienceChanged = $announcement->audience_type !== $validated['audience_type'] ||
                           $announcement->target_roles != ($validated['target_roles'] ?? null) ||
                           $announcement->target_puroks != ($validated['target_puroks'] ?? null) ||
                           $announcement->target_households != ($validated['target_households'] ?? null) ||
                           $announcement->target_businesses != ($validated['target_businesses'] ?? null) ||
                           $announcement->target_users != ($validated['target_users'] ?? null);
        
        DB::beginTransaction();
        
        try {
            $announcement->update($validated);
            
            if ($request->has('keep_attachments')) {
                $keepIds = $validated['keep_attachments'] ?? [];
                $toDelete = $announcement->attachments()->whereNotIn('id', $keepIds)->get();
                    
                foreach ($toDelete as $attachment) {
                    Storage::disk('public')->delete($attachment->file_path);
                    $attachment->delete();
                }
            }
            
            if ($request->hasFile('new_attachments') && !empty($request->file('new_attachments'))) {
                foreach ($request->file('new_attachments') as $file) {
                    $path = $file->store('announcements/' . date('Y/m'), 'public');
                    
                    $announcement->attachments()->create([
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'created_by' => Auth::id(),
                    ]);
                }
            }
            
            if (($wasInactive && $announcement->is_active) || ($audienceChanged && $announcement->is_active)) {
                $notificationCount = $announcement->notifyTargetAudience('updated');
            }
            
            DB::commit();
            
            return redirect()->route('admin.announcements.show', $announcement->id)
                ->with('success', 'Announcement updated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update announcement: ' . $e->getMessage());
        }
    }
    
    /**
     * Remove the specified announcement and its attachments.
     */
    public function destroy(Announcement $announcement)
    {
        DB::beginTransaction();
        
        try {
            foreach ($announcement->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
            }
            
            $announcement->attachments()->delete();
            $announcement->delete();
            
            DB::commit();
            
            return redirect()->route('admin.announcements.index')
                ->with('success', 'Announcement deleted successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete announcement: ' . $e->getMessage());
        }
    }
    
    /**
     * Download attachment.
     */
    public function downloadAttachment(AnnouncementAttachment $attachment)
    {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return back()->with('error', 'File not found.');
        }
        
        return Storage::disk('public')->download(
            $attachment->file_path, 
            $attachment->original_name ?? $attachment->file_name
        );
    }
    
    /**
     * Delete attachment.
     */
    public function deleteAttachment(AnnouncementAttachment $attachment)
    {
        $announcementId = $attachment->announcement_id;
        
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();
        
        return redirect()->route('admin.announcements.edit', $announcementId)
            ->with('success', 'Attachment deleted successfully.');
    }
    
    /**
     * Send notifications for an announcement.
     */
    public function sendNotifications(Announcement $announcement)
    {
        if (!$announcement->is_active) {
            return back()->with('warning', 'Cannot send notifications for inactive announcement.');
        }
        
        $count = $announcement->notifyTargetAudience('published');
        
        return back()->with('success', "Notifications sent to {$count} target users.");
    }
    
    /**
     * Resend notifications as reminder.
     */
    public function resendNotifications(Announcement $announcement)
    {
        if (!$announcement->is_active) {
            return back()->with('warning', 'Cannot send notifications for inactive announcement.');
        }
        
        $count = $announcement->notifyTargetAudience('reminder');
        
        return back()->with('success', "Reminder notifications sent to {$count} target users.");
    }
    
    /**
     * Get notification statistics.
     */
    public function notificationStats(Announcement $announcement)
    {
        return response()->json($announcement->getNotificationStats());
    }
    
    /**
     * Toggle announcement status.
     */
    public function toggleStatus(Announcement $announcement)
    {
        $newStatus = !$announcement->is_active;
        
        DB::beginTransaction();
        
        try {
            $announcement->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id(),
            ]);
            
            if ($newStatus) {
                $notificationCount = $announcement->notifyTargetAudience('published');
                $message = 'Announcement activated and notifications sent to ' . $notificationCount . ' users.';
            } else {
                $message = 'Announcement deactivated successfully.';
            }
            
            DB::commit();
            
            return back()->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to toggle status: ' . $e->getMessage());
        }
    }
    
    /**
     * Duplicate announcement.
     */
    public function duplicate(Announcement $announcement)
    {
        DB::beginTransaction();
        
        try {
            $newAnnouncement = $announcement->replicate();
            $newAnnouncement->title = $announcement->title . ' (Copy)';
            $newAnnouncement->created_by = Auth::id();
            $newAnnouncement->updated_by = null;
            $newAnnouncement->created_at = now();
            $newAnnouncement->updated_at = now();
            $newAnnouncement->is_active = false;
            $newAnnouncement->save();
            
            foreach ($announcement->attachments as $attachment) {
                $newPath = 'announcements/' . date('Y/m') . '/' . uniqid() . '_' . $attachment->file_name;
                
                if (Storage::disk('public')->exists($attachment->file_path)) {
                    Storage::disk('public')->copy($attachment->file_path, $newPath);
                    
                    $newAnnouncement->attachments()->create([
                        'file_path' => $newPath,
                        'file_name' => $attachment->file_name,
                        'original_name' => $attachment->original_name,
                        'file_size' => $attachment->file_size,
                        'mime_type' => $attachment->mime_type,
                        'created_by' => Auth::id(),
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('admin.announcements.edit', $newAnnouncement->id)
                ->with('success', 'Announcement duplicated successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to duplicate announcement: ' . $e->getMessage());
        }
    }
    
    /**
     * Get audience options for API.
     */
    public function getAudienceOptions(Request $request)
    {
        $type = $request->get('type');
        
        switch ($type) {
            case 'roles':
                return Role::orderBy('name')->get(['id', 'name']);
            case 'puroks':
                return Purok::orderBy('name')->get(['id', 'name']);
            case 'households':
            case 'household_members':
                return Household::with('purok')->orderBy('household_number')
                    ->get(['id', 'household_number', 'purok_id', 'address']);
            case 'businesses':
                return Business::orderBy('business_name')
                    ->get(['id', 'business_name', 'owner_name']);
            case 'specific_users':
                return User::with(['role', 'household'])->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name', 'email', 'role_id', 'household_id']);
            default:
                return [];
        }
    }
    
    /**
     * Export announcements.
     */
    public function export(Request $request)
    {
        $query = Announcement::query()->with(['creator']);
        
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('audience_type') && $request->audience_type !== 'all') {
            $query->where('audience_type', $request->audience_type);
        }
        
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', (int) $request->priority);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'active': $query->published(); break;
                case 'inactive': $query->where('is_active', false); break;
                case 'expired': $query->expired(); break;
                case 'upcoming': $query->upcoming(); break;
            }
        }
        
        $announcements = $query->orderBy('created_at', 'desc')->get();
        
        $filename = 'announcements-' . now()->format('Y-m-d-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];
        
        $callback = function() use ($announcements) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, [
                'ID', 'Title', 'Type', 'Priority', 'Audience Type', 'Audience Summary',
                'Estimated Reach', 'Status', 'Start Date', 'End Date', 'Has Attachments',
                'Attachments Count', 'Created By', 'Created At', 'Notification Stats (Read/Total)'
            ]);
            
            foreach ($announcements as $announcement) {
                $stats = $announcement->getNotificationStats();
                
                fputcsv($file, [
                    $announcement->id,
                    $announcement->title,
                    $announcement->type_label,
                    $announcement->priority_label,
                    Announcement::getAudienceTypes()[$announcement->audience_type] ?? $announcement->audience_type,
                    $announcement->audience_summary,
                    $announcement->estimated_reach,
                    $announcement->status_label,
                    $announcement->start_date?->format('Y-m-d H:i'),
                    $announcement->end_date?->format('Y-m-d H:i'),
                    $announcement->attachments()->exists() ? 'Yes' : 'No',
                    $announcement->attachments()->count(),
                    $announcement->creator?->full_name ?? 'System',
                    $announcement->created_at->format('Y-m-d H:i:s'),
                    $stats['read_count'] . '/' . $stats['notifications_sent'],
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}