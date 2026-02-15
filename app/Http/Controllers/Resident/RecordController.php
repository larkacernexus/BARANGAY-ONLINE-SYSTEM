<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Resident;
use App\Models\ResidentDocument;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;


class RecordController extends Controller
{
    /**
     * Display a listing of the documents.
     */
    public function index(Request $request)
    {
        Log::info('=== ACCESSING MY RECORDS INDEX ===', [
            'user_id' => auth()->id(),
            'filters' => $request->all()
        ]);
        
        $user = auth()->user();
        
        // Get the household associated with the authenticated user
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            Log::warning('User not associated with any household', ['user_id' => $user->id]);
            return Inertia::render('resident/Records/Index', [
                'documents' => ['data' => [], 'total' => 0],
                'categories' => [],
                'filters' => $request->only(['category', 'search', 'resident']),
                'householdResidents' => [],
                'currentResident' => null,
                'household' => null,
                'storageStats' => $this->getStorageStats([]),
                'error' => 'Your account is not associated with any household.'
            ]);
        }
        
        // Get all residents belonging to this household
        $residents = Resident::where('household_id', $household->id)->get();
        
        if ($residents->isEmpty()) {
            Log::warning('No residents found in household', ['household_id' => $household->id]);
            return Inertia::render('resident/Records/Index', [
                'documents' => ['data' => [], 'total' => 0],
                'categories' => [],
                'filters' => $request->only(['category', 'search', 'resident']),
                'householdResidents' => [],
                'currentResident' => null,
                'household' => $household,
                'storageStats' => $this->getStorageStats([]),
                'error' => 'No residents found in your household.'
            ]);
        }
        
        // Get resident IDs for querying documents
        $residentIds = $residents->pluck('id');
        
        Log::info('Household and residents', [
            'household_id' => $household->id,
            'resident_ids' => $residentIds->toArray(),
            'resident_count' => $residents->count()
        ]);
        
        // =============================================
        // STEP 1: Get ALL documents for this household (unfiltered)
        // =============================================
        $allHouseholdDocuments = ResidentDocument::whereIn('resident_id', $residentIds)->get();
        $totalAllDocuments = $allHouseholdDocuments->count();
        
        Log::info('ALL household documents (unfiltered)', [
            'total_documents' => $totalAllDocuments,
            'document_ids' => $allHouseholdDocuments->pluck('id')->toArray()
        ]);
        
        // =============================================
        // STEP 2: Get FILTERED documents for pagination
        // =============================================
        $query = ResidentDocument::with(['category', 'resident', 'documentType'])
            ->whereIn('resident_id', $residentIds);
        
        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%");
            });
        }
        
        // Filter by category ID
        if ($request->has('category') && $request->category !== 'all') {
            $categoryId = (int)$request->category;
            Log::info('Applying category filter', ['category_id' => $categoryId]);
            $query->where('document_category_id', $categoryId);
        }
        
        if ($request->has('resident') && $request->resident !== 'all') {
            $residentId = (int)$request->resident;
            if (in_array($residentId, $residentIds->toArray())) {
                $query->where('resident_id', $residentId);
            }
        }
        
        // Order and paginate FILTERED results
        $query->latest();
        $documents = $query->paginate(12);
        
        Log::info('FILTERED documents (paginated)', [
            'total' => $documents->total(),
            'current_page' => $documents->currentPage(),
            'per_page' => $documents->perPage(),
            'data_count' => $documents->count(),
            'has_data' => $documents->count() > 0,
            'filters_applied' => $request->only(['category', 'search', 'resident'])
        ]);
        
        // =============================================
        // STEP 3: Get document categories with counts from ALL documents
        // =============================================
        $categories = DocumentCategory::where('is_active', true)
            ->orderBy('order')
            ->get();
        
        // Calculate category counts from ALL documents (not filtered)
        $categoryCounts = [];
        foreach ($categories as $category) {
            $count = $allHouseholdDocuments
                ->where('document_category_id', $category->id)
                ->count();
            
            $categoryCounts[$category->id] = $count;
            
            Log::info('Category count (from ALL documents)', [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'count' => $count
            ]);
        }
        
        // Add count to each category - ALWAYS use counts from ALL documents
        $categories = $categories->map(function($category) use ($categoryCounts) {
            $category->count = $categoryCounts[$category->id] ?? 0;
            return $category;
        });
        
        // =============================================
        // STEP 4: Get storage statistics from ALL documents
        // =============================================
        $storageStats = $this->getStorageStats($allHouseholdDocuments);
        
        // Get the head resident
        $headResident = $this->getHeadResident($household);
        
        Log::info('=== FINAL DATA ===', [
            'household_id' => $household->id,
            'total_all_documents' => $totalAllDocuments,
            'filtered_documents_total' => $documents->total(),
            'categories_total_counts' => $categories->pluck('count', 'name')->toArray(),
            'storage_stats_count' => $storageStats['document_count'],
            'filters_applied' => $request->only(['category', 'search', 'resident'])
        ]);
        
        return Inertia::render('resident/Records/Index', [
            'documents' => $documents,  // Filtered & paginated
            'categories' => $categories, // With counts from ALL documents
            'storageStats' => $storageStats, // From ALL documents
            'filters' => $request->only(['category', 'search', 'resident']),
            'householdResidents' => $residents,
            'currentResident' => $headResident ?? $residents->first(),
            'household' => $household,
        ]);
    }
    
    /**
     * Display the specified document.
     */
   public function show($id)
{
    Log::info('Showing document details', [
        'document_id' => $id, 
        'user_id' => auth()->id(),
        'session_id' => session()->getId()
    ]);
    
    $user = auth()->user();
    $household = $user->household_id ? Household::find($user->household_id) : null;
    
    if (!$household) {
        Log::error('User not associated with any household', ['user_id' => $user->id]);
        abort(403, 'You are not associated with any household.');
    }
    
    // Get all residents in the household
    $residentIds = Resident::where('household_id', $household->id)->pluck('id');
    
    // Get the document with all necessary relationships
    $document = ResidentDocument::with([
        'category', 
        'resident', 
        'documentType',
        'uploadedBy'
    ])->whereIn('resident_id', $residentIds)
      ->findOrFail($id);
    
    // Session keys for password-protected documents
    $sessionAccessKey = "document_access_{$id}";
    $sessionTimeKey = "document_access_time_{$id}";
    $hasAccess = session()->get($sessionAccessKey, false);
    $accessTime = session()->get($sessionTimeKey);
    
    Log::debug('Session check for document', [
        'document_id' => $id,
        'session_access_key' => $sessionAccessKey,
        'session_time_key' => $sessionTimeKey,
        'has_access_session' => $hasAccess,
        'access_time_session' => $accessTime,
        'session_id' => session()->getId(),
    ]);
    
    // Check if document requires password
    if ($document->requires_password && !empty($document->password)) {
        // Check if access is still valid (30 minutes access)
        $accessValid = false;
        if ($hasAccess && $accessTime) {
            try {
                $expiryTime = Carbon::parse($accessTime);
                $accessValid = now()->lt($expiryTime);
                Log::debug('Access validity check', [
                    'expiry_time' => $expiryTime->toDateTimeString(),
                    'current_time' => now()->toDateTimeString(),
                    'is_valid' => $accessValid,
                ]);
            } catch (\Exception $e) {
                Log::error('Error parsing access time', [
                    'error' => $e->getMessage(),
                    'access_time' => $accessTime,
                ]);
                $accessValid = false;
            }
        }
        
        if (!$accessValid) {
            // Clear any expired session data
            if ($accessTime) {
                try {
                    $expiryTime = Carbon::parse($accessTime);
                    if (now()->gt($expiryTime)) {
                        session()->forget([$sessionAccessKey, $sessionTimeKey]);
                        Log::info('Cleared expired session data', [
                            'document_id' => $id,
                            'expired_time' => $accessTime,
                            'current_time' => now()->toDateTimeString(),
                        ]);
                    }
                } catch (\Exception $e) {
                    session()->forget([$sessionAccessKey, $sessionTimeKey]);
                    Log::error('Error checking expiry time, cleared session', [
                        'error' => $e->getMessage(),
                        'access_time' => $accessTime,
                    ]);
                }
            }
            
            // User doesn't have access or access expired - show password form
            Log::info('Password required for document access', [
                'document_id' => $id,
                'user_id' => $user->id,
                'has_session_access' => $hasAccess,
                'session_expired' => !$accessValid,
                'access_time' => $accessTime,
                'current_time' => now()->toDateTimeString(),
            ]);
            
            // Send minimal data for password form
            $minimalDocumentData = [
                'id' => $document->id,
                'name' => $document->name,
                'requires_password' => $document->requires_password,
                'reference_number' => $document->reference_number,
                'category' => $document->category ? [
                    'id' => $document->category->id,
                    'name' => $document->category->name,
                ] : null,
            ];
            
            // Prepare session debug data
            $debugData = [
                'has_access' => $hasAccess,
                'expiry_time' => $accessTime,
                'session_id' => session()->getId(),
                'created_at' => $accessTime ? Carbon::parse($accessTime)->subMinutes(30)->toDateTimeString() : null,
                'current_time' => now()->toDateTimeString(),
                'expiry_timestamp' => $accessTime ? Carbon::parse($accessTime)->timestamp : null,
            ];
            
            return Inertia::render('resident/Records/Show', [
                'document' => $minimalDocumentData,
                'relatedDocuments' => [],
                'canDownload' => false,
                'canDelete' => false,
                'needsPassword' => true,
                'error' => $hasAccess ? 'Your access has expired. Please enter the password again.' : null,
                'sessionData' => $debugData,
                'debugMode' => config('app.debug'),
            ]);
        }
        
        Log::info('User has valid session access', [
            'document_id' => $id,
            'access_valid_until' => $accessTime,
            'minutes_remaining' => Carbon::parse($accessTime)->diffInMinutes(now()),
        ]);
    }
    
    // User has access, continue with normal show logic
    $document->incrementViewCount();
    
    // Get related documents (same category)
    $relatedDocuments = ResidentDocument::with('category')
        ->select([
            'id', 
            'name', 
            'file_extension', 
            'file_size',
            'created_at',
            'document_category_id',
            'requires_password',
        ])
        ->where('document_category_id', $document->document_category_id)
        ->where('id', '!=', $document->id)
        ->whereIn('resident_id', $residentIds)
        ->limit(5)
        ->get()
        ->map(function($doc) {
            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'file_extension' => $doc->file_extension,
                'file_size_human' => $this->formatBytes($doc->file_size),
                'created_at' => $doc->created_at,
                'category' => $doc->category ? [
                    'name' => $doc->category->name,
                ] : null,
                'requires_password' => $doc->requires_password,
            ];
        });
    
    // Determine document status
    $status = $document->status;
    if (empty($status)) {
        if ($document->expiry_date && now()->gt($document->expiry_date)) {
            $status = 'expired';
        } else {
            $status = 'active';
        }
    }
    
    // Parse security options if they exist
    $securityOptions = [];
    if (!empty($document->security_options)) {
        try {
            if (is_string($document->security_options)) {
                $decoded = json_decode($document->security_options, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $securityOptions = $decoded;
                }
            } elseif (is_array($document->security_options)) {
                $securityOptions = $document->security_options;
            }
        } catch (\Exception $e) {
            Log::warning('Error parsing document security options', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'security_options_raw' => $document->security_options,
            ]);
        }
    }
    
    // Parse tags if they exist
    $tags = [];
    if (!empty($document->tags)) {
        try {
            if (is_string($document->tags)) {
                $decoded = json_decode($document->tags, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $tags = $decoded;
                }
            } elseif (is_array($document->tags)) {
                $tags = $document->tags;
            }
        } catch (\Exception $e) {
            Log::warning('Error parsing document tags', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'tags_raw' => $document->tags,
            ]);
        }
    }
    
    // Parse metadata if it exists
    $metadata = [];
    if (!empty($document->metadata)) {
        try {
            if (is_string($document->metadata)) {
                $decoded = json_decode($document->metadata, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $metadata = $decoded;
                }
            } elseif (is_array($document->metadata)) {
                $metadata = $document->metadata;
            }
        } catch (\Exception $e) {
            Log::warning('Error parsing document metadata', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'metadata_raw' => $document->metadata,
            ]);
        }
    }
    
    // Generate preview URL if it's a PDF
    $previewUrl = null;
    if (in_array(strtolower($document->file_extension), ['pdf']) || 
        str_contains($document->mime_type, 'pdf')) {
        $previewUrl = route('my.records.preview', ['id' => $document->id]);
    }
    
    // Prepare document data for frontend
    $documentData = [
        'id' => $document->id,
        'name' => $document->name,
        'file_name' => $document->file_name,
        'file_path' => $document->file_path,
        'file_extension' => $document->file_extension,
        'file_size' => $document->file_size,
        'file_size_human' => $this->formatBytes($document->file_size),
        'mime_type' => $document->mime_type,
        'description' => $document->description,
        'reference_number' => $document->reference_number,
        'issue_date' => $document->issue_date ? $document->issue_date->toDateString() : null,
        'expiry_date' => $document->expiry_date ? $document->expiry_date->toDateString() : null,
        'view_count' => $document->view_count,
        'download_count' => $document->download_count,
        'is_public' => $document->is_public,
        'requires_password' => $document->requires_password,
        'status' => $status,
        'created_at' => $document->created_at ? $document->created_at->toDateTimeString() : null,
        'updated_at' => $document->updated_at ? $document->updated_at->toDateTimeString() : null,
        'deleted_at' => $document->deleted_at ? $document->deleted_at->toDateTimeString() : null,
        'resident' => $document->resident ? [
            'id' => $document->resident->id,
            'first_name' => $document->resident->first_name,
            'last_name' => $document->resident->last_name,
        ] : null,
        'category' => $document->category ? [
            'id' => $document->category->id,
            'name' => $document->category->name,
            'icon' => $document->category->icon,
            'color' => $document->category->color,
        ] : null,
        'document_type' => $document->documentType ? [
            'id' => $document->documentType->id,
            'name' => $document->documentType->name,
            'code' => $document->documentType->code,
        ] : null,
        'tags' => $tags,
        'metadata' => $metadata,
        'uploaded_by' => $document->uploaded_by,
        'uploaded_at' => $document->uploaded_at ? $document->uploaded_at->toDateTimeString() : null,
        'uploaded_by_user' => $document->uploadedBy ? [
            'id' => $document->uploadedBy->id,
            'name' => $document->uploadedBy->name,
            'email' => $document->uploadedBy->email,
        ] : null,
        'preview_url' => $previewUrl,
        'security_options' => $securityOptions,
    ];
    
    // Prepare session debug data
    $debugData = [
        'has_access' => $hasAccess,
        'expiry_time' => $accessTime,
        'session_id' => session()->getId(),
        'created_at' => $accessTime ? Carbon::parse($accessTime)->subMinutes(30)->toDateTimeString() : null,
        'current_time' => now()->toDateTimeString(),
        'expiry_timestamp' => $accessTime ? Carbon::parse($accessTime)->timestamp : null,
    ];
    
    // Check permissions for download and delete
    $canDownload = true;
    $canDelete = true;
    
    // Check download restrictions from security options
    if (isset($securityOptions['restrict_download']) && $securityOptions['restrict_download']) {
        $canDownload = false;
    }
    
    // Check if user can delete (only if they uploaded it or have admin role)
    if ($document->uploaded_by !== $user->id && !$user->hasRole('admin')) {
        $canDelete = false;
    }
    
    Log::info('Document loaded for show page', [
        'document_id' => $id,
        'status' => $status,
        'related_count' => $relatedDocuments->count(),
        'session_expiry' => $accessTime,
        'tags_count' => count($tags),
        'can_download' => $canDownload,
        'can_delete' => $canDelete,
        'has_preview' => !empty($previewUrl),
    ]);
    
    return Inertia::render('resident/Records/Show', [
        'document' => $documentData,
        'relatedDocuments' => $relatedDocuments,
        'canDownload' => $canDownload,
        'canDelete' => $canDelete,
        'needsPassword' => false,
        'sessionExpiry' => $accessTime,
        'sessionData' => $debugData,
        'debugMode' => config('app.debug'),
    ]);
}

// Add this method to the controller class
private function formatBytes($bytes, $decimals = 2)
{
    if ($bytes == 0) {
        return '0 Bytes';
    }
    
    $k = 1024;
    $dm = $decimals < 0 ? 0 : $decimals;
    $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    $i = floor(log($bytes) / log($k));
    
    return number_format($bytes / pow($k, $i), $dm) . ' ' . $sizes[$i];
}

    public function extendSession($id)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Check if user has current access
        $sessionAccessKey = "document_access_{$id}";
        $sessionTimeKey = "document_access_time_{$id}";
        
        $hasAccess = session()->get($sessionAccessKey, false);
        $accessTime = session()->get($sessionTimeKey);
        
        if (!$hasAccess || !$accessTime || now()->gt($accessTime)) {
            return response()->json([
                'error' => 'No valid session to extend',
                'has_access' => $hasAccess,
                'expired' => $accessTime && now()->gt($accessTime),
            ], 403);
        }
        
        // Extend session by 15 minutes
        $newExpiryTime = now()->addMinutes(15);
        session()->put($sessionTimeKey, $newExpiryTime);
        
        Log::info('Extended document session', [
            'document_id' => $id,
            'user_id' => $user->id,
            'old_expiry' => $accessTime,
            'new_expiry' => $newExpiryTime,
            'extended_by_minutes' => 15,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Session extended by 15 minutes',
            'new_expiry_time' => $newExpiryTime->toDateTimeString(),
            'expires_in_minutes' => now()->diffInMinutes($newExpiryTime),
        ]);
    }
    
    public function requestAccess(Request $request, $id)
    {
        Log::info('Requesting access to document', [
            'document_id' => $id,
            'user_id' => auth()->id()
        ]);
        
        try {
            $request->validate([
                'password' => 'required|string',
            ]);
            
            $user = auth()->user();
            $household = $user->household_id ? Household::find($user->household_id) : null;
            
            if (!$household) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not associated with any household.'
                ], 403);
            }
            
            // Get all residents in the household
            $residentIds = Resident::where('household_id', $household->id)->pluck('id');
            
            $document = ResidentDocument::whereIn('resident_id', $residentIds)
                ->findOrFail($id);
            
            // If document doesn't require password, just return success
            if (!$document->requires_password || is_null($document->password)) {
                return response()->json([
                    'success' => true,
                    'redirect' => route('my.records.show', $id)
                ]);
            }
            
            // Verify password
            if (Hash::check($request->password, $document->password)) {
                // Store in session that user has access to this document
                session()->put("document_access_{$id}", true);
                session()->put("document_access_time_{$id}", now()->addMinutes(30));
                
                return response()->json([
                    'success' => true,
                    'redirect' => route('my.records.show', $id)
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password.'
            ], 401);
            
        } catch (\Exception $e) {
            Log::error('Access request failed', [
                'error' => $e->getMessage(),
                'document_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.'
            ], 500);
        }
    }
    
    public function verifyPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string'
        ]);
        
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        if (!$document->requires_password || is_null($document->password)) {
            return redirect()->route('my.records.show', $id);
        }
        
        // Verify password (assuming passwords are hashed)
        if (Hash::check($request->password, $document->password)) {
            // Grant access for 30 minutes
            session()->put("document_access_{$id}", true);
            session()->put("document_access_time_{$id}", now()->addMinutes(30));
            
            Log::info('Password verified successfully', [
                'document_id' => $id,
                'user_id' => $user->id,
                'access_valid_until' => now()->addMinutes(30)->toDateTimeString(),
            ]);
            
            return redirect()->route('my.records.show', $id);
        }
        
        Log::warning('Failed password attempt', [
            'document_id' => $id,
            'user_id' => $user->id
        ]);
        
        return back()->withErrors([
            'password' => 'Invalid password. Please try again.'
        ]);
    }
    
    public function view($id)
    {
        Log::info('Viewing document via view method', ['document_id' => $id, 'user_id' => auth()->id()]);
        
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            Log::error('User not associated with any household', ['user_id' => $user->id]);
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::with(['category', 'resident', 'documentType'])
            ->whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Increment view count
        $document->incrementViewCount();
        
        // Get related documents (same category)
        $relatedDocuments = ResidentDocument::with('category')
            ->where('document_category_id', $document->document_category_id)
            ->where('id', '!=', $document->id)
            ->whereIn('resident_id', $residentIds)
            ->limit(4)
            ->get();
        
        Log::info('Document viewed via view method', [
            'document_id' => $id,
            'resident_id' => $document->resident_id,
            'view_count' => $document->view_count
        ]);
        
        // Render the view page
        return Inertia::render('resident/Records/View', [
            'document' => $document,
            'relatedDocuments' => $relatedDocuments,
            'canDownload' => true,
            'canDelete' => true,
        ]);
    }
    
    /**
     * Show the form for creating a new document.
     */
    public function create()
    {
        Log::info('Accessing document create form', ['user_id' => auth()->id()]);
        
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            Log::warning('User not associated with any household', ['user_id' => $user->id]);
            return redirect()->route('my.records.index')
                ->with('error', 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residents = Resident::where('household_id', $household->id)->get();
        
        // Get active document categories with their document types
        $categories = DocumentCategory::where('is_active', true)
            ->with(['documentTypes' => function($query) {
                $query->where('is_active', true)
                      ->orderBy('sort_order');
            }])
            ->orderBy('order')
            ->get();
        
        // Get all active document types for dropdown or other uses
        $documentTypes = DocumentType::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        Log::info('Document create form loaded', [
            'household_id' => $household->id,
            'resident_count' => $residents->count(),
            'category_count' => $categories->count()
        ]);
        
        return Inertia::render('resident/Records/Create', [
            'categories' => $categories,
            'documentTypes' => $documentTypes,
            'residents' => $residents,
            'maxFileSize' => config('app.max_file_size', 10), // MB
            'allowedTypes' => config('app.allowed_file_types', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']),
        ]);
    }
    
    /**
     * Store a newly created document.
     */
public function store(Request $request)
{
    Log::info('=== STARTING DOCUMENT UPLOAD ===', [
        'user_id' => auth()->id(),
        'request_has_tags' => $request->has('tags'),
        'request_has_metadata' => $request->has('metadata'),
    ]);
    
    try {
        // Log raw request data for debugging
        Log::info('Raw request data (before validation):', [
            'resident_id' => $request->resident_id,
            'document_type_id' => $request->document_type_id,
            'name' => $request->name,
            'tags_raw' => $request->tags,
            'metadata_raw' => $request->metadata,
            'tags_type' => gettype($request->tags),
            'metadata_type' => gettype($request->metadata),
            'reference_number_from_request' => $request->reference_number ?? 'NOT SET',
            'all_request_keys' => array_keys($request->all()),
        ]);

        // First validate all non-JSON fields
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'document_type_id' => 'required|exists:document_types,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:issue_date',
            'is_public' => 'boolean',
            'requires_password' => 'boolean',
            'password' => 'nullable|string|min:4|required_if:requires_password,true',
            'confirm_password' => 'required_with:password|same:password',
            'reference_number' => 'nullable|string',
            'tags' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        Log::info('Basic validation passed', [
            'resident_id' => $request->resident_id,
            'reference_number_present' => $request->has('reference_number') ? 'YES: ' . $request->reference_number : 'NO'
        ]);

        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;

        if (!$household) {
            Log::error('User not associated with any household', ['user_id' => $user->id]);
            return redirect()->back()
                ->with('error', 'You are not associated with any household.');
        }

        // Check if resident belongs to user's household
        $resident = Resident::findOrFail($request->resident_id);
        if ($resident->household_id !== $household->id) {
            Log::warning('Unauthorized document upload attempt', [
                'user_id' => $user->id,
                'resident_id' => $request->resident_id,
                'resident_household' => $resident->household_id,
                'user_household' => $household->id
            ]);
            return redirect()->back()
                ->with('error', 'You can only upload documents for residents in your household.');
        }

        // Get document type for validation
        $documentType = DocumentType::findOrFail($request->document_type_id);
        
        Log::info('Document type found', [
            'document_type_id' => $documentType->id,
            'category_id' => $documentType->document_category_id,
            'accepted_formats' => $documentType->accepted_formats,
        ]);
        
        // Handle file upload
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        
        Log::info('File details', [
            'original_name' => $originalName,
            'extension' => $extension,
            'mime_type' => $mimeType,
            'size' => $size,
            'size_mb' => round($size / 1024 / 1024, 2) . ' MB'
        ]);

        // Validate file type against document type's accepted formats
        $maxSize = $documentType->max_file_size ?: (config('app.max_file_size', 10) * 1024); // Convert MB to KB
        
        Log::info('File size limits', [
            'file_size_kb' => round($size / 1024, 2),
            'max_size_kb' => $maxSize,
            'max_size_mb' => round($maxSize / 1024, 2)
        ]);

        if ($size > ($maxSize * 1024)) {
            Log::warning('File size exceeds limit', [
                'file_size' => $size,
                'max_size' => $maxSize * 1024,
                'file_size_mb' => round($size / 1024 / 1024, 2),
                'max_size_mb' => round($maxSize / 1024, 2)
            ]);
            return redirect()->back()
                ->with('error', "File size exceeds maximum limit of {$maxSize}KB.");
        }

        // Validate file format
        $isValidFormat = false;
        if ($documentType->accepted_formats && count($documentType->accepted_formats) > 0) {
            $allowedFormats = $documentType->accepted_formats;
            
            $lowerExtension = strtolower($extension);
            
            foreach ($allowedFormats as $format) {
                // Check if format is a MIME type (contains '/')
                if (strpos($format, '/') !== false) {
                    // It's a MIME type - check if it matches
                    if ($mimeType === $format) {
                        $isValidFormat = true;
                        break;
                    }
                } else {
                    // It's already an extension - check directly
                    if ($lowerExtension === strtolower($format)) {
                        $isValidFormat = true;
                        break;
                    }
                }
            }
        } else {
            // Fallback to global allowed types
            $allowedTypes = config('app.allowed_file_types', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif']);
            $isValidFormat = in_array(strtolower($extension), $allowedTypes);
        }
        
        if (!$isValidFormat) {
            Log::warning('Invalid file format', [
                'extension' => $extension,
                'mime_type' => $mimeType,
                'document_type_accepted_formats' => $documentType->accepted_formats
            ]);
            
            return redirect()->back()
                ->with('error', 'File type not allowed for this document type.');
        }

        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $extension;
        $folder = 'resident-documents/' . $resident->id;
        
        Log::info('Storing file', [
            'filename' => $filename,
            'folder' => $folder
        ]);
        
        // Create directory if it doesn't exist
        Storage::disk('public')->makeDirectory($folder);
        
        $path = $file->storeAs($folder, $filename, 'public');

        Log::info('File stored successfully', [
            'path' => $path,
            'full_path' => Storage::disk('public')->path($path)
        ]);

        // Process tags and metadata - NOW THEY ARE ALREADY ARRAYS
        $tags = [];
        if ($request->has('tags') && !empty($request->tags)) {
            // Clean and validate tags (already an array)
            $tags = array_filter(array_map(function($tag) {
                $cleanTag = trim($tag);
                return strlen($cleanTag) > 0 ? $cleanTag : null;
            }, $request->tags));
            
            Log::info('Tags processed successfully', [
                'tags_count' => count($tags),
                'tags_sample' => array_slice($tags, 0, 5)
            ]);
        }

        $metadata = [];
        if ($request->has('metadata') && !empty($request->metadata)) {
            // Already an array - just use it as is
            $metadata = $request->metadata;
            
            Log::info('Metadata processed successfully', [
                'metadata_count' => count($metadata),
                'metadata_keys' => array_keys($metadata)
            ]);
        }
        
        Log::info('Processed data:', [
            'tags_final' => $tags,
            'metadata_final' => $metadata,
        ]);

        // Generate a unique reference number
        $referenceNumber = $request->reference_number;
        
        if (empty($referenceNumber)) {
            // If no reference number provided, generate one
            $referenceNumber = 'DOC-' . time() . '-' . Str::random(6);
            Log::info('Generated new reference number:', ['reference_number' => $referenceNumber]);
        } else {
            // Check if the provided reference number already exists
            $counter = 1;
            $originalReferenceNumber = $referenceNumber;
            
            while (ResidentDocument::where('reference_number', $referenceNumber)->exists()) {
                Log::warning('Reference number already exists, generating alternative', [
                    'original' => $originalReferenceNumber,
                    'attempt' => $counter,
                    'current' => $referenceNumber
                ]);
                
                $referenceNumber = $originalReferenceNumber . '-' . $counter;
                $counter++;
                
                if ($counter > 100) {
                    // Safety break
                    $referenceNumber = $originalReferenceNumber . '-' . time() . '-' . Str::random(4);
                    break;
                }
            }
            
            if ($counter > 1) {
                Log::info('Using alternative reference number:', [
                    'original' => $originalReferenceNumber,
                    'final' => $referenceNumber
                ]);
            }
        }

        // Prepare document data
        $documentData = [
            'resident_id' => $request->resident_id,
            'document_type_id' => $request->document_type_id,
            'document_category_id' => $documentType->document_category_id,
            'name' => $request->name ?: $originalName,
            'file_name' => $originalName,
            'file_path' => $path,
            'file_extension' => $extension,
            'file_size' => $size,
            'file_size_human' => $this->formatBytes($size),
            'mime_type' => $mimeType,
            'reference_number' => $referenceNumber, // Use the unique reference number
            'description' => $request->description,
            'issue_date' => $request->issue_date,
            'expiry_date' => $request->expiry_date,
            'is_public' => $request->boolean('is_public', false),
            'requires_password' => $request->boolean('requires_password', false),
            'password' => $request->requires_password ? bcrypt($request->password) : null,
            'status' => 'active',
            'uploaded_by' => $user->id,
            'uploaded_at' => now(),
        ];
        
        // Add array fields
        if (!empty($tags)) {
            $documentData['tags'] = $tags;
        }
        
        if (!empty($metadata)) {
            $documentData['metadata'] = $metadata;
        }
        
        Log::info('Creating document with final data:', [
            'data_keys' => array_keys($documentData),
            'has_tags' => isset($documentData['tags']),
            'has_metadata' => isset($documentData['metadata']),
            'tags_count' => isset($documentData['tags']) ? count($documentData['tags']) : 0,
            'metadata_count' => isset($documentData['metadata']) ? count($documentData['metadata']) : 0,
            'reference_number_in_data' => $documentData['reference_number'],
        ]);

        // Try to create the document
        try {
            $document = ResidentDocument::create($documentData);
            
            Log::info('Document created successfully!', [
                'document_id' => $document->id,
                'reference_number' => $document->reference_number,
                'created_at' => $document->created_at
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create document record', [
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Delete the uploaded file since document creation failed
            Storage::disk('public')->delete($path);
            
            // Try without array fields to see if that's the issue
            unset($documentData['tags'], $documentData['metadata']);
            Log::info('Retrying without tags and metadata...', ['data_keys' => array_keys($documentData)]);
            
            try {
                $document = ResidentDocument::create($documentData);
                Log::info('Document created without tags/metadata!', [
                    'document_id' => $document->id
                ]);
            } catch (\Exception $retryError) {
                Log::error('Failed even without tags/metadata', [
                    'error' => $retryError->getMessage()
                ]);
                throw $retryError;
            }
        }
        
        Log::info('=== UPLOAD COMPLETE ===', [
            'document_id' => $document->id,
            'file_path' => $document->file_path,
            'file_size' => $document->file_size_human,
            'tags_count' => $document->tags ? count($document->tags) : 0,
            'metadata_count' => $document->metadata ? count($document->metadata) : 0,
            'reference_number_final' => $document->reference_number,
            'route' => route('my.records.show', $document->id)
        ]);
        
        return redirect()->route('my.records.show', $document->id)
            ->with('success', 'Document uploaded successfully!');
            
    } catch (ValidationException $e) {
        Log::error('Validation failed', [
            'errors' => $e->errors(),
            'user_id' => auth()->id()
        ]);
        throw $e;
        
    } catch (\Exception $e) {
        Log::error('Document upload failed with exception', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'user_id' => auth()->id(),
            'resident_id' => $request->resident_id ?? 'unknown',
            'file_uploaded' => isset($path) ? $path : 'none'
        ]);
        
        // Clean up uploaded file if it exists
        if (isset($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            Log::info('Cleaned up uploaded file after error', ['path' => $path]);
        }
        
        return redirect()->back()
            ->with('error', 'Failed to upload document. ' . $e->getMessage());
    }
}

/**
 * Format bytes to human readable format.
 */

    
    /**
     * Download the specified document.
     */
    public function download($id)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Check password protection for downloads too
        if ($document->requires_password && !empty($document->password)) {
            $sessionAccessKey = "document_access_{$id}";
            $sessionTimeKey = "document_access_time_{$id}";
            
            $hasAccess = session()->get($sessionAccessKey, false);
            $accessTime = session()->get($sessionTimeKey);
            
            // Check if access is still valid
            $accessValid = false;
            if ($hasAccess && $accessTime) {
                try {
                    $expiryTime = Carbon::parse($accessTime);
                    $accessValid = now()->lt($expiryTime);
                } catch (\Exception $e) {
                    Log::error('Error parsing access time for download', [
                        'error' => $e->getMessage(),
                        'access_time' => $accessTime,
                    ]);
                    $accessValid = false;
                }
            }
            
            if (!$accessValid) {
                Log::warning('Unauthorized download attempt (no valid session)', [
                    'document_id' => $id,
                    'user_id' => $user->id,
                    'has_access' => $hasAccess,
                    'access_time' => $accessTime,
                    'is_expired' => $accessTime && now()->gt(Carbon::parse($accessTime)),
                ]);
                
                abort(403, 'Your access has expired. Please re-enter the password.');
            }
        }
        
        // Increment download count
        $document->incrementDownloadCount();
        
        // Get the file path
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            Log::error('Document file not found for download', [
                'document_id' => $id,
                'file_path' => $document->file_path,
                'storage_path' => $filePath,
            ]);
            
            abort(404, 'Document file not found.');
        }
        
        Log::info('Document downloaded successfully', [
            'document_id' => $id,
            'user_id' => $user->id,
            'file_name' => $document->file_name,
            'download_count' => $document->download_count,
        ]);
        
        // Return file download with proper headers
        return response()->download(
            $filePath,
            $document->file_name,
            [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'attachment; filename="' . $document->file_name . '"',
            ]
        );
    }
    
    /**
     * Delete the specified document.
     */
    public function destroy($id)
    {
        Log::info('Deleting document', ['document_id' => $id, 'user_id' => auth()->id()]);
        
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            Log::error('User not associated with any household', ['user_id' => $user->id]);
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Delete the file
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
            Log::info('File deleted from storage', [
                'file_path' => $document->file_path,
                'document_id' => $id
            ]);
        } else {
            Log::warning('File not found in storage', [
                'file_path' => $document->file_path,
                'document_id' => $id
            ]);
        }
        
        // Delete the record
        $document->delete();
        
        Log::info('Document record deleted', [
            'document_id' => $id,
            'resident_id' => $document->resident_id
        ]);
        
        return redirect()->route('my.records.index')
            ->with('success', 'Document deleted successfully!');
    }
    
    /**
     * Export all documents (zip file)
     */
    public function export()
    {
        Log::info('Exporting documents', ['user_id' => auth()->id()]);
        
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            Log::error('User not associated with any household', ['user_id' => $user->id]);
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $documents = ResidentDocument::whereIn('resident_id', $residentIds)->get();
        
        if ($documents->isEmpty()) {
            Log::warning('No documents to export', ['household_id' => $household->id]);
            return redirect()->route('my.records.index')
                ->with('error', 'No documents to export.');
        }
        
        Log::info('Starting export process', [
            'document_count' => $documents->count(),
            'household_id' => $household->id
        ]);
        
        // Create a zip file
        $zipFileName = 'documents-export-' . time() . '.zip';
        $zipPath = storage_path('app/public/exports/' . $zipFileName);
        
        // Ensure directory exists
        if (!file_exists(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
            Log::info('Created export directory', ['path' => dirname($zipPath)]);
        }
        
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE) === TRUE) {
            $addedFiles = 0;
            foreach ($documents as $document) {
                $filePath = storage_path('app/public/' . $document->file_path);
                if (file_exists($filePath)) {
                    // Add file to zip with folder structure
                    $zip->addFile($filePath, 
                        'documents/' . 
                        $document->resident->first_name . '_' . $document->resident->last_name . '/' . 
                        $document->file_name
                    );
                    $addedFiles++;
                } else {
                    Log::warning('File not found during export', [
                        'document_id' => $document->id,
                        'file_path' => $document->file_path
                    ]);
                }
            }
            $zip->close();
            
            Log::info('Export completed successfully', [
                'zip_file' => $zipFileName,
                'added_files' => $addedFiles,
                'total_files' => $documents->count()
            ]);
            
            // Return the zip file for download
            return response()->download($zipPath)->deleteFileAfterSend(true);
        } else {
            Log::error('Failed to create export zip file', ['zip_path' => $zipPath]);
            return redirect()->route('my.records.index')
                ->with('error', 'Failed to create export file.');
        }
    }
    
    /**
     * Calculate storage statistics.
     */
    private function getStorageStats($documents)
    {
        // Check if $documents is a collection or array
        if (is_array($documents)) {
            // Convert array to collection
            $documents = collect($documents);
        }
        
        // If empty collection or array, return default stats
        if ($documents->isEmpty()) {
            return [
                'used' => '0 MB',
                'limit' => '100 MB',
                'available' => '100 MB',
                'percentage' => 0,
                'document_count' => 0,
            ];
        }
        
        $totalSize = $documents->sum('file_size');
        $documentCount = $documents->count();
        
        // Convert to MB
        $usedMB = round($totalSize / 1024 / 1024, 2);
        $limitMB = 100; // Default limit
        $availableMB = max(0, $limitMB - $usedMB);
        $percentage = $limitMB > 0 ? round(($usedMB / $limitMB) * 100, 2) : 0;
        
        return [
            'used' => $usedMB . ' MB',
            'limit' => $limitMB . ' MB',
            'available' => $availableMB . ' MB',
            'percentage' => $percentage,
            'document_count' => $documentCount,
        ];
    }
    
    /**
     * Format bytes to human readable format.
     */
   public function preview($id)
{
    $user = auth()->user();
    $household = $user->household_id ? Household::find($user->household_id) : null;
    
    if (!$household) {
        abort(403, 'You are not associated with any household.');
    }
    
    $residentIds = Resident::where('household_id', $household->id)->pluck('id');
    
    $document = ResidentDocument::whereIn('resident_id', $residentIds)->findOrFail($id);
    
    // Check password access if required
    if ($document->requires_password && !empty($document->password)) {
        $sessionAccessKey = "document_access_{$id}";
        $sessionTimeKey = "document_access_time_{$id}";
        $hasAccess = session()->get($sessionAccessKey, false);
        $accessTime = session()->get($sessionTimeKey);
        
        $accessValid = false;
        if ($hasAccess && $accessTime) {
            try {
                $expiryTime = Carbon::parse($accessTime);
                $accessValid = now()->lt($expiryTime);
            } catch (\Exception $e) {
                $accessValid = false;
            }
        }
        
        if (!$accessValid) {
            abort(403, 'Access denied. Please enter password first.');
        }
    }
    
    // Check if file exists
    $filePath = storage_path('app/public/' . $document->file_path);
    
    if (!file_exists($filePath)) {
        abort(404, 'File not found.');
    }
    
    // Check if it's a PDF
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimeType = mime_content_type($filePath);
    
    if ($extension !== 'pdf' && !str_contains($mimeType, 'pdf')) {
        abort(400, 'Preview is only available for PDF files.');
    }
    
    // Return PDF as inline
    return response()->file($filePath, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $document->file_name . '"'
    ]);
}
    
    /**
     * Get the head resident of a household
     */
    private function getHeadResident(Household $household)
    {
        // First try to find through household members with is_head = true
        $headMember = \App\Models\HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();
            
        if ($headMember && $headMember->resident) {
            return $headMember->resident;
        }
        
        // If no head found in household members, check residents table
        return Resident::where('household_id', $household->id)
            ->first();
    }
}