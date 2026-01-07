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

class RecordController extends Controller
{
    /**
     * Display a listing of the documents.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get the household associated with the authenticated user
        $household = Household::where('user_id', $user->id)->first();
        
        if (!$household) {
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
        
        // Query for documents
        $query = ResidentDocument::with(['category', 'resident'])
            ->whereIn('resident_id', $residentIds)
            ->latest();
        
        // Apply filters
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('reference_number', 'like', "%{$request->search}%")
                  ->orWhere('file_name', 'like', "%{$request->search}%");
            });
        }
        
        if ($request->has('category') && $request->category !== 'all') {
            $category = DocumentCategory::where('slug', $request->category)->first();
            if ($category) {
                $query->where('document_category_id', $category->id);
            }
        }
        
        if ($request->has('resident') && $request->resident !== 'all') {
            if (in_array($request->resident, $residentIds->toArray())) {
                $query->where('resident_id', $request->resident);
            }
        }
        
        $documents = $query->paginate(12);
        
        // Get document categories
        $categories = DocumentCategory::where('is_active', true)->get();
        
        // Get all documents for storage stats calculation
        $allDocuments = ResidentDocument::whereIn('resident_id', $residentIds)->get();
        
        // Get storage statistics
        $storageStats = $this->getStorageStats($allDocuments);
        
        // Get the head resident
        $headResident = $residents->firstWhere('id', $household->head_resident_id);
        
        return Inertia::render('resident/Records/Index', [
            'documents' => $documents,
            'categories' => $categories,
            'storageStats' => $storageStats,
            'filters' => $request->only(['category', 'search', 'resident']),
            'householdResidents' => $residents,
            'currentResident' => $headResident ?? $residents->first(),
            'household' => $household,
        ]);
    }
    
    /**
     * Display the specified document.
     */
    public function show(Request $request, $id)
    {
        $user = auth()->user();
        $household = Household::where('user_id', $user->id)->first();
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::with(['category', 'resident'])
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
        
        return Inertia::render('resident/Records/Show', [
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
    $user = auth()->user();
    $household = Household::where('user_id', $user->id)->first();
    
    if (!$household) {
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
    $request->validate([
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
        'reference_number' => 'nullable|string|unique:resident_documents,reference_number',
    ]);

    $user = auth()->user();
    $household = Household::where('user_id', $user->id)->first();

    if (!$household) {
        return redirect()->back()
            ->with('error', 'You are not associated with any household.');
    }

    // Check if resident belongs to user's household
    $resident = Resident::findOrFail($request->resident_id);
    if ($resident->household_id !== $household->id) {
        return redirect()->back()
            ->with('error', 'You can only upload documents for residents in your household.');
    }

    // Get document type for validation
    $documentType = DocumentType::findOrFail($request->document_type_id);
    
    try {
        // Handle file upload
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Validate file type against document type's accepted formats
        if ($documentType->accepted_formats) {
            $allowedFormats = $documentType->accepted_formats;
            if (!in_array(strtolower($extension), $allowedFormats)) {
                return redirect()->back()
                    ->with('error', 'File type not allowed for this document type. Allowed formats: ' . implode(', ', $allowedFormats));
            }
        } else {
            // Fallback to global allowed types
            $allowedTypes = config('app.allowed_file_types', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']);
            if (!in_array(strtolower($extension), $allowedTypes)) {
                return redirect()->back()
                    ->with('error', 'File type not allowed. Allowed types: ' . implode(', ', $allowedTypes));
            }
        }

        // Validate file size against document type's max file size or global
        $maxSize = $documentType->max_file_size ?: (config('app.max_file_size', 10) * 1024); // Convert MB to KB
        if ($size > ($maxSize * 1024)) { // Convert KB to bytes
            return redirect()->back()
                ->with('error', 'File size exceeds maximum limit of ' . ($maxSize / 1024) . 'MB');
        }

        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $extension;
        $folder = 'resident-documents/' . $resident->id;
        $path = $file->storeAs($folder, $filename, 'public');

        // Create document
        $document = ResidentDocument::create([
            'resident_id' => $request->resident_id,
            'document_type_id' => $request->document_type_id,
            'document_category_id' => $documentType->document_category_id,
            'name' => $request->name ?: $documentType->name, // Use custom name or fallback to document type name
            'file_name' => $originalName,
            'file_path' => $path,
            'file_extension' => $extension,
            'file_size' => $size,
            'file_size_human' => $this->formatBytes($size),
            'mime_type' => $mimeType,
            'reference_number' => $request->reference_number,
            'description' => $request->description,
            'issue_date' => $request->issue_date,
            'expiry_date' => $request->expiry_date,
            'is_public' => $request->boolean('is_public', false),
            'requires_password' => $request->boolean('requires_password', false),
            'password' => $request->requires_password ? bcrypt($request->password) : null,
            'status' => 'active',
        ]);

        // Generate reference number if not provided
        if (!$document->reference_number) {
            $document->reference_number = 'DOC-' . str_pad($document->id, 6, '0', STR_PAD_LEFT);
            $document->save();
        }

        return redirect()->route('my.records.show', $document->id)
            ->with('success', 'Document uploaded successfully!');

    } catch (\Exception $e) {
        // Log the error
        \Log::error('Document upload failed: ' . $e->getMessage());
        
        return redirect()->back()
            ->with('error', 'Failed to upload document. Please try again.');
    }
}



    
    /**
     * Download the specified document.
     */
    public function download($id)
    {
        $user = auth()->user();
        $household = Household::where('user_id', $user->id)->first();
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Check if document requires password
        if ($document->requires_password) {
            abort(403, 'This document requires a password.');
        }
        
        // Increment download count
        $document->incrementDownloadCount();
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }
        
        return response()->download($filePath, $document->file_name);
    }
    
    /**
     * Delete the specified document.
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $household = Household::where('user_id', $user->id)->first();
        
        if (!$household) {
            abort(403, 'You are not associated with any household.');
        }
        
        // Get all residents in the household
        $residentIds = Resident::where('household_id', $household->id)->pluck('id');
        
        $document = ResidentDocument::whereIn('resident_id', $residentIds)
            ->findOrFail($id);
        
        // Delete the file
        Storage::disk('public')->delete($document->file_path);
        
        // Delete the record
        $document->delete();
        
        return redirect()->route('my.records.index')
            ->with('success', 'Document deleted successfully!');
    }
    
    /**
     * Calculate storage statistics.
     */
    private function getStorageStats($documents)
    {
        $totalSize = $documents->sum('file_size');
        $limit = 100 * 1024 * 1024; // 100 MB limit
        
        return [
            'used' => $this->formatBytes($totalSize),
            'limit' => $this->formatBytes($limit),
            'available' => $this->formatBytes(max(0, $limit - $totalSize)),
            'percentage' => $limit > 0 ? min(100, round(($totalSize / $limit) * 100)) : 0,
            'document_count' => $documents->count(),
        ];
    }
    
    /**
     * Format bytes to human readable format.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}