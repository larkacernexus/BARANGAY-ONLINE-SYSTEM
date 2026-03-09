<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\User;
use App\Models\Household;
use App\Notifications\FormUploadedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FormController extends Controller
{
    // List all forms (for admin)
    public function index(Request $request)
    {
        $query = Form::with('creator')
            ->latest();

        // Search filter
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Agency filter
        if ($request->has('agency')) {
            $query->byAgency($request->agency);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Featured filter
        if ($request->has('featured')) {
            $query->where('is_featured', $request->featured === 'true');
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $forms = $query->paginate(20);

        // Get stats for dashboard
        $stats = [
            'total' => Form::count(),
            'active' => Form::where('is_active', true)->count(),
            'featured' => Form::where('is_featured', true)->count(),
            'downloads' => Form::sum('download_count'),
            'views' => Form::sum('view_count'),
            'categories_count' => Form::distinct('category')->count(),
            'agencies_count' => Form::distinct('issuing_agency')->count(),
            'today_downloads' => Form::whereDate('updated_at', Carbon::today())->sum('download_count'),
            'today_views' => Form::whereDate('updated_at', Carbon::today())->sum('view_count'),
        ];

        return inertia('admin/Forms/Index', [
            'forms' => $forms,
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
            'filters' => $request->only(['search', 'category', 'agency', 'status', 'featured', 'from_date', 'to_date']),
            'stats' => $stats,
        ]);
    }

    // Show single form details
    public function show(Form $form)
    {
        $form->load('creator');
        
        // Track view (with session-based prevention)
        $viewKey = 'form_viewed_' . $form->id . '_' . auth()->id();
        if (!session()->has($viewKey)) {
            $form->increment('view_count');
            $form->update([
                'last_viewed_at' => now(),
                'last_viewed_by' => auth()->id(),
            ]);
            session([$viewKey => now()->addMinutes(15)]);
        }

        // Get related forms (same category or agency)
        $relatedForms = Form::where('id', '!=', $form->id)
            ->where(function($query) use ($form) {
                $query->where('category', $form->category)
                    ->orWhere('issuing_agency', $form->issuing_agency);
            })
            ->where('is_active', true)
            ->limit(5)
            ->get();

        // Calculate statistics
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        $downloadStats = [
            'today' => $this->getFormDownloadsForPeriod($form, $today, now()),
            'this_week' => $this->getFormDownloadsForPeriod($form, $weekStart, now()),
            'this_month' => $this->getFormDownloadsForPeriod($form, $monthStart, now()),
            'total' => $form->download_count,
        ];

        $viewStats = [
            'today' => $this->getFormViewsForPeriod($form, $today, now()),
            'this_week' => $this->getFormViewsForPeriod($form, $weekStart, now()),
            'this_month' => $this->getFormViewsForPeriod($form, $monthStart, now()),
            'total' => $form->view_count,
        ];

        // Get last download/user info
        $lastDownloadedBy = $form->last_downloaded_by ? User::find($form->last_downloaded_by) : null;
        $lastViewedBy = $form->last_viewed_by ? User::find($form->last_viewed_by) : null;

        // Add additional fields expected by frontend
        $formData = array_merge($form->toArray(), [
            'mime_type' => $form->file_type,
            'is_featured' => $form->is_featured ?? false,
            'is_public' => $form->is_public ?? true,
            'requires_login' => $form->requires_login ?? false,
            'tags' => $form->tags ?? [],
            'last_downloaded_at' => $form->last_downloaded_at,
            'last_downloaded_by' => $lastDownloadedBy,
            'last_viewed_at' => $form->last_viewed_at,
            'last_viewed_by' => $lastViewedBy,
        ]);

        return inertia('admin/Forms/Show', [
            'form' => $formData,
            'relatedForms' => $relatedForms,
            'download_stats' => $downloadStats,
            'view_stats' => $viewStats,
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
        ]);
    }

    // Show create form
    public function create()
    {
        return inertia('admin/Forms/Create', [
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
        ]);
    }

    /**
     * Get all household users (heads and members with accounts)
     */
    private function getAllHouseholdUsers(): \Illuminate\Support\Collection
    {
        // Get household heads with user accounts
        $householdHeads = User::whereHas('role', function($query) {
            $query->where('name', 'Household Head');
        })->where('status', 'active')->get();
        
        // Also get household members who might have user accounts
        $householdMembers = User::whereHas('role', function($query) {
            $query->where('name', 'Household Member');
        })->where('status', 'active')->get();
        
        // Also get any users with household_id (fallback)
        $householdUsers = User::whereNotNull('household_id')
            ->where('status', 'active')
            ->get();
        
        // Merge all collections and remove duplicates
        return $householdHeads
            ->merge($householdMembers)
            ->merge($householdUsers)
            ->unique('id');
    }

    /**
     * Get all active households with user accounts
     */
    private function getAllHouseholdsWithUsers(): \Illuminate\Support\Collection
    {
        return Household::with('user')
            ->whereHas('user', function($query) {
                $query->where('status', 'active');
            })
            ->where('status', 'active')
            ->get();
    }

    /**
     * Send form notifications to all households
     */
    private function sendFormNotifications(Form $form, string $action = 'uploaded'): void
    {
        try {
            Log::info('Sending form notifications to households', [
                'form_id' => $form->id,
                'form_title' => $form->title,
                'action' => $action
            ]);

            // Get all household users
            $householdUsers = $this->getAllHouseholdUsers();
            
            $notification = new FormUploadedNotification($form, $action);
            
            $sentCount = 0;
            $householdIds = [];
            
            foreach ($householdUsers as $user) {
                $user->notify($notification);
                $sentCount++;
                
                if ($user->household_id) {
                    $householdIds[] = $user->household_id;
                }
                
                Log::info('Form notification sent to household user', [
                    'user_id' => $user->id,
                    'user_name' => $user->name ?? 'Unknown',
                    'household_id' => $user->household_id,
                    'role' => $user->role?->name ?? 'No Role'
                ]);
            }

            // Also notify admins
            $admins = User::whereHas('role', function($query) {
                $query->whereIn('name', ['admin', 'super-admin', 'secretary', 'treasurer']);
            })->where('status', 'active')->get();

            foreach ($admins as $admin) {
                $admin->notify($notification);
                $sentCount++;
                
                Log::info('Form notification sent to admin', [
                    'admin_id' => $admin->id,
                    'admin_name' => $admin->name,
                    'role' => $admin->role?->name ?? 'No Role'
                ]);
            }

            // Get households that were notified
            $uniqueHouseholds = array_unique($householdIds);
            
            // Also notify households without user accounts? (Optional)
            // You could send emails or SMS here if needed

            Log::info('Form notifications completed successfully', [
                'form_id' => $form->id,
                'form_title' => $form->title,
                'households_notified' => count($uniqueHouseholds),
                'household_users_notified' => $householdUsers->count(),
                'admins_notified' => $admins->count(),
                'total_notifications_sent' => $sentCount,
                'household_ids' => $uniqueHouseholds
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send form notifications', [
                'form_id' => $form->id,
                'form_title' => $form->title ?? 'Unknown',
                'action' => $action,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Store new form
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
            'category' => 'nullable|string|max:100',
            'issuing_agency' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_public' => 'boolean',
            'requires_login' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        // Handle file upload
        $file = $request->file('file');
        $filePath = $file->store('forms', 'public');
        
        // Generate slug
        $slug = Str::slug($validated['title']);
        $counter = 1;
        while (Form::where('slug', $slug)->exists()) {
            $slug = Str::slug($validated['title']) . '-' . $counter;
            $counter++;
        }

        // Determine MIME type
        $mimeType = $file->getMimeType();
        
        // Create form
        $form = Form::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_type' => $mimeType,
            'issuing_agency' => $validated['issuing_agency'] ?? null,
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_public' => $validated['is_public'] ?? true,
            'requires_login' => $validated['requires_login'] ?? false,
            'tags' => $validated['tags'] ?? [],
            'view_count' => 0,
            'download_count' => 0,
            'created_by' => auth()->id(),
        ]);

        // ========== SEND NOTIFICATIONS TO ALL HOUSEHOLDS ==========
        $this->sendFormNotifications($form, 'uploaded');

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form uploaded successfully and notifications sent to all households.');
    }

    // Show edit form
    public function edit(Form $form)
    {
        return inertia('admin/Forms/Edit', [
            'form' => $form->load('creator'),
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
        ]);
    }

    /**
     * Update form
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'issuing_agency' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_public' => 'boolean',
            'requires_login' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        // Determine action type
        $action = 'updated';
        
        // Handle file update if provided
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('forms', 'public');
            
            // Delete old file
            Storage::disk('public')->delete($form->file_path);
            
            // Update file info
            $form->file_path = $filePath;
            $form->file_name = $file->getClientOriginalName();
            $form->file_size = $file->getSize();
            $form->file_type = $file->getMimeType();
            
            $action = 'updated_with_new_file';
        }

        // Update other fields
        $form->title = $validated['title'];
        $form->description = $validated['description'] ?? null;
        $form->category = $validated['category'] ?? null;
        $form->issuing_agency = $validated['issuing_agency'] ?? null;
        $form->is_active = $validated['is_active'] ?? true;
        $form->is_featured = $validated['is_featured'] ?? false;
        $form->is_public = $validated['is_public'] ?? true;
        $form->requires_login = $validated['requires_login'] ?? false;
        $form->tags = $validated['tags'] ?? [];

        // Update slug if title changed
        if ($form->isDirty('title')) {
            $slug = Str::slug($validated['title']);
            $counter = 1;
            while (Form::where('slug', $slug)->where('id', '!=', $form->id)->exists()) {
                $slug = Str::slug($validated['title']) . '-' . $counter;
                $counter++;
            }
            $form->slug = $slug;
        }

        $form->save();

        // ========== SEND NOTIFICATIONS ABOUT FORM UPDATE ==========
        // Only send if form is active
        if ($form->is_active) {
            $this->sendFormNotifications($form, $action);
        }

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form updated successfully and notifications sent to all households.');
    }

    /**
     * Download form - Enhanced version
     */
    public function download(Form $form)
    {
        // Check if form is active
        if (!$form->is_active && !auth()->user()->isAdmin()) {
            abort(404, 'This form is not currently available.');
        }

        // Check if login is required
        if ($form->requires_login && !auth()->check()) {
            return redirect()->route('login')->with('error', 'Please login to download this form.');
        }

        // Check if file exists
        $filePath = storage_path('app/public/' . $form->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found on server.');
        }

        // Increment download count
        $form->increment('download_count');
        
        // Update last download info
        $form->update([
            'last_downloaded_at' => now(),
            'last_downloaded_by' => auth()->id(),
        ]);

        // Get file information
        $fileName = $form->file_name;
        $fileSize = filesize($filePath);
        $fileMime = $form->file_type;

        // Determine if it's a direct download or should open in browser
        $shouldOpenInBrowser = request()->query('preview', false) || 
                               in_array($fileMime, [
                                   'application/pdf', 
                                   'image/jpeg', 
                                   'image/png', 
                                   'image/gif',
                                   'image/webp',
                                   'image/svg+xml'
                               ]);

        // Get download disposition
        $disposition = $shouldOpenInBrowser ? 'inline' : 'attachment';

        // If it's a preview request, serve the file directly
        if (request()->query('preview', false)) {
            return response()->file($filePath, [
                'Content-Type' => $fileMime,
                'Content-Disposition' => 'inline',
            ]);
        }

        // Prepare response for download
        $response = response()->download($filePath, $fileName, [
            'Content-Type' => $fileMime,
            'Content-Length' => $fileSize,
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
            'Cache-Control' => 'private, max-age=3600',
            'X-Form-ID' => $form->id,
            'X-Download-Count' => $form->download_count,
            'Access-Control-Expose-Headers' => 'X-Form-ID, X-Download-Count',
        ]);

        // Set cache headers for public forms
        if ($form->is_public && !$form->requires_login) {
            $response->headers->set('Cache-Control', 'public, max-age=3600');
        }

        // If requested to open in new tab via frontend or JSON request
        if (request()->expectsJson() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Download initiated',
                'data' => [
                    'download_url' => url('/storage/' . $form->file_path),
                    'direct_download_url' => route('admin.forms.download', $form),
                    'file_name' => $fileName,
                    'file_size' => $fileSize,
                    'formatted_file_size' => $form->formatted_file_size,
                    'form_title' => $form->title,
                    'download_count' => $form->download_count,
                ]
            ]);
        }

        return $response;
    }

    /**
     * Toggle form status
     */
    public function toggleStatus(Form $form)
    {
        $oldStatus = $form->is_active;
        
        $form->update([
            'is_active' => !$form->is_active
        ]);

        $message = $form->is_active 
            ? 'Form activated successfully.' 
            : 'Form deactivated successfully.';

        // Send notification if activated
        if ($form->is_active && !$oldStatus) {
            $this->sendFormNotifications($form, 'activated');
        }

        return back()->with('success', $message);
    }

    /**
     * Toggle form featured status
     */
    public function toggleFeatured(Form $form)
    {
        $wasFeatured = $form->is_featured;
        
        $form->update([
            'is_featured' => !$form->is_featured
        ]);

        $message = $form->is_featured 
            ? 'Form marked as featured successfully.' 
            : 'Form removed from featured list.';

        // ========== SEND NOTIFICATION IF FEATURED ==========
        if ($form->is_featured && !$wasFeatured) {
            $this->sendFormNotifications($form, 'featured');
        }

        return back()->with('success', $message);
    }

    /**
     * Toggle form public status
     */
    public function togglePublic(Form $form)
    {
        $form->update([
            'is_public' => !$form->is_public
        ]);

        $message = $form->is_public 
            ? 'Form is now publicly accessible.' 
            : 'Form access is now restricted.';

        return back()->with('success', $message);
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate,feature,unfeature,make_public,make_private',
            'form_ids' => 'required|array',
            'form_ids.*' => 'exists:forms,id',
        ]);

        $forms = Form::whereIn('id', $request->form_ids)->get();
        $count = count($forms);

        switch ($request->action) {
            case 'delete':
                foreach ($forms as $form) {
                    Storage::disk('public')->delete($form->file_path);
                    $form->delete();
                }
                $message = $count . ' form(s) deleted successfully.';
                break;
                
            case 'activate':
                Form::whereIn('id', $request->form_ids)->update(['is_active' => true]);
                // Send notifications for activated forms
                foreach ($forms as $form) {
                    if (!$form->is_active) {
                        $this->sendFormNotifications($form, 'activated');
                    }
                }
                $message = $count . ' form(s) activated successfully.';
                break;
                
            case 'deactivate':
                Form::whereIn('id', $request->form_ids)->update(['is_active' => false]);
                $message = $count . ' form(s) deactivated successfully.';
                break;
                
            case 'feature':
                Form::whereIn('id', $request->form_ids)->update(['is_featured' => true]);
                // Send notifications for featured forms
                foreach ($forms as $form) {
                    if (!$form->is_featured) {
                        $this->sendFormNotifications($form, 'featured');
                    }
                }
                $message = $count . ' form(s) featured successfully.';
                break;
                
            case 'unfeature':
                Form::whereIn('id', $request->form_ids)->update(['is_featured' => false]);
                $message = $count . ' form(s) unfeatured successfully.';
                break;
                
            case 'make_public':
                Form::whereIn('id', $request->form_ids)->update(['is_public' => true]);
                $message = $count . ' form(s) made public successfully.';
                break;
                
            case 'make_private':
                Form::whereIn('id', $request->form_ids)->update(['is_public' => false]);
                $message = $count . ' form(s) made private successfully.';
                break;
                
            default:
                return back()->with('error', 'Invalid action.');
        }

        return back()->with('success', $message);
    }

    /**
     * Delete form
     */
    public function destroy(Form $form)
    {
        // Delete file from storage
        Storage::disk('public')->delete($form->file_path);
        
        // Delete form
        $form->delete();

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form deleted successfully.');
    }

    /**
     * Get statistics API
     */
    public function getStats(Form $form)
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        $downloadStats = [
            'today' => $this->getFormDownloadsForPeriod($form, $today, now()),
            'this_week' => $this->getFormDownloadsForPeriod($form, $weekStart, now()),
            'this_month' => $this->getFormDownloadsForPeriod($form, $monthStart, now()),
            'total' => $form->download_count,
        ];

        $viewStats = [
            'today' => $this->getFormViewsForPeriod($form, $today, now()),
            'this_week' => $this->getFormViewsForPeriod($form, $weekStart, now()),
            'this_month' => $this->getFormViewsForPeriod($form, $monthStart, now()),
            'total' => $form->view_count,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'download_stats' => $downloadStats,
                'view_stats' => $viewStats,
                'form' => $form->load(['creator']),
            ]
        ]);
    }

    /**
     * Export forms to CSV
     */
    public function export(Request $request)
    {
        $request->validate([
            'form_ids' => 'required|array',
            'form_ids.*' => 'exists:forms,id',
        ]);

        $forms = Form::with('creator')
            ->whereIn('id', $request->form_ids)
            ->get();

        $csvData = [];
        $headers = [
            'ID',
            'Title',
            'Description',
            'Category',
            'Agency',
            'File Name',
            'File Size',
            'File Type',
            'Views',
            'Downloads',
            'Status',
            'Featured',
            'Public',
            'Requires Login',
            'Created At',
            'Updated At',
            'Created By',
        ];

        foreach ($forms as $form) {
            $csvData[] = [
                $form->id,
                $form->title,
                $form->description,
                $form->category,
                $form->issuing_agency,
                $form->file_name,
                $form->formatted_file_size,
                $form->file_type,
                $form->view_count,
                $form->download_count,
                $form->is_active ? 'Active' : 'Inactive',
                $form->is_featured ? 'Yes' : 'No',
                $form->is_public ? 'Yes' : 'No',
                $form->requires_login ? 'Yes' : 'No',
                $form->created_at->format('Y-m-d H:i:s'),
                $form->updated_at->format('Y-m-d H:i:s'),
                $form->creator->name ?? 'Unknown',
            ];
        }

        $filename = 'forms_export_' . date('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($headers, $csvData) {
            $output = fopen('php://output', 'w');
            fputcsv($output, $headers);
            
            foreach ($csvData as $row) {
                fputcsv($output, $row);
            }
            
            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Helper method to simulate download stats for a period
     */
    private function getFormDownloadsForPeriod(Form $form, $startDate, $endDate)
    {
        // In a real application, you would query a downloads log table
        $formAgeInDays = $form->created_at->diffInDays(now());
        if ($formAgeInDays === 0) return 0;
        
        $daysInPeriod = $startDate->diffInDays($endDate) + 1;
        $percentageOfPeriod = min(1, $daysInPeriod / $formAgeInDays);
        
        return round($form->download_count * $percentageOfPeriod);
    }

    /**
     * Helper method to simulate view stats for a period
     */
    private function getFormViewsForPeriod(Form $form, $startDate, $endDate)
    {
        $formAgeInDays = $form->created_at->diffInDays(now());
        if ($formAgeInDays === 0) return 0;
        
        $daysInPeriod = $startDate->diffInDays($endDate) + 1;
        $percentageOfPeriod = min(1, $daysInPeriod / $formAgeInDays);
        
        return round($form->view_count * $percentageOfPeriod);
    }

    /**
     * Preview form file (for inline viewing)
     */
    public function preview(Form $form)
    {
        // Check if form is active
        if (!$form->is_active && !auth()->user()->isAdmin()) {
            abort(404, 'This form is not currently available.');
        }

        // Check if file exists
        $filePath = storage_path('app/public/' . $form->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found on server.');
        }

        // Check if file type can be previewed
        $previewableTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'text/plain',
            'text/html',
        ];

        if (!in_array($form->file_type, $previewableTypes)) {
            abort(400, 'This file type cannot be previewed in the browser.');
        }

        // Serve file for preview
        return response()->file($filePath, [
            'Content-Type' => $form->file_type,
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    /**
     * Get notification statistics
     */
    public function getNotificationStats()
    {
        $totalHouseholds = Household::where('status', 'active')->count();
        $householdsWithUsers = Household::whereHas('user', function($query) {
            $query->where('status', 'active');
        })->count();
        
        $householdUsers = $this->getAllHouseholdUsers()->count();
        $admins = User::whereHas('role', function($query) {
            $query->whereIn('name', ['admin', 'super-admin', 'secretary', 'treasurer']);
        })->where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_households' => $totalHouseholds,
                'households_with_users' => $householdsWithUsers,
                'household_users' => $householdUsers,
                'admins' => $admins,
                'total_potential_recipients' => $householdUsers + $admins,
            ]
        ]);
    }
}