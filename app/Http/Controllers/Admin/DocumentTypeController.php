<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DocumentTypeController extends Controller
{
    // Common document types template (keep as is)
    const COMMON_DOCUMENT_TYPES = [
        'barangay_clearance' => [
            'code' => 'BARANGAY_CLEARANCE',
            'name' => 'Barangay Clearance',
            'description' => 'General clearance for barangay residents',
            'accepted_formats' => ['pdf', 'jpeg', 'jpg', 'png'],
            'max_file_size' => 2048, // 2MB in KB
            'sort_order' => 1,
            'is_required' => true,
            'category_id' => 1, // Legal/Administrative
        ],
        // ... rest of your common types
    ];

    public function index(Request $request)
    {
        $query = DocumentType::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $isActive = $request->status === 'active';
                $query->where('is_active', $isActive);
            })
            ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                $query->where('document_category_id', $request->category);
            })
            ->when($request->required && $request->required !== 'all', function ($query) use ($request) {
                $isRequired = $request->required === 'required';
                $query->where('is_required', $isRequired);
            })
            ->orderBy('sort_order')
            ->orderBy('name');

        $documentTypes = $query->get();

        // Get categories for filter - REMOVE sort_order from here
        $categories = DocumentCategory::where('is_active', true)
            ->orderBy('name') // Only order by name, DocumentCategory doesn't have sort_order
            ->get(['id', 'name', 'slug']);

        // Calculate stats
        $stats = [
            'total' => DocumentType::count(),
            'active' => DocumentType::where('is_active', true)->count(),
            'required' => DocumentType::where('is_required', true)->count(),
            'optional' => DocumentType::where('is_required', false)->count(),
            'max_file_size_mb' => DocumentType::max('max_file_size') ?
                round(DocumentType::max('max_file_size') / 1024, 2) : 0,
            'has_formats' => DocumentType::whereNotNull('accepted_formats')
                ->whereRaw('JSON_LENGTH(accepted_formats) > 0')
                ->count(),
        ];

        return Inertia::render('admin/Documents/DocumentTypes/Index', [
            'documentTypes' => $documentTypes,
            'filters' => $request->only(['search', 'status', 'category', 'required']),
            'stats' => $stats,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        // Get active categories for dropdown - REMOVE sort_order from here
        $categories = DocumentCategory::where('is_active', true)
            ->orderBy('name') // Only order by name
            ->get();

        // Common file formats for selection
        $commonFormats = [
            'pdf' => 'PDF Document',
            'doc' => 'Microsoft Word',
            'docx' => 'Microsoft Word',
            'xls' => 'Microsoft Excel',
            'xlsx' => 'Microsoft Excel',
            'jpeg' => 'JPEG Image',
            'jpg' => 'JPG Image',
            'png' => 'PNG Image',
            'gif' => 'GIF Image',
            'txt' => 'Text File',
            'csv' => 'CSV File',
            'zip' => 'ZIP Archive',
            'rar' => 'RAR Archive',
        ];

        // Common document types for quick selection
        $commonTypes = array_values(self::COMMON_DOCUMENT_TYPES);

        return Inertia::render('admin/Documents/DocumentTypes/Create', [
            'categories' => $categories,
            'commonFormats' => $commonFormats,
            'commonTypes' => $commonTypes,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Document Type Store Request Received', [
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:document_types,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'document_category_id' => 'required|exists:document_categories,id',

                // Boolean flags
                'is_required' => 'boolean',
                'is_active' => 'boolean',

                // File specifications
                'accepted_formats' => 'nullable|array',
                'accepted_formats.*' => 'string|in:pdf,doc,docx,xls,xlsx,jpeg,jpg,png,gif,txt,csv,zip,rar',
                'max_file_size' => 'required|integer|min:1|max:10240', // Max 10MB in KB
                'sort_order' => 'required|integer|min:0',
            ]);

            // Set default values
            $validated['is_required'] = $validated['is_required'] ?? false;
            $validated['is_active'] = $validated['is_active'] ?? true;

            // Convert file size from MB to KB if needed
            if ($validated['max_file_size'] < 100) { // Assuming if less than 100, it's in MB
                $validated['max_file_size'] = $validated['max_file_size'] * 1024; // Convert MB to KB
            }

            // Encode accepted formats to JSON
            if (isset($validated['accepted_formats'])) {
                $validated['accepted_formats'] = json_encode($validated['accepted_formats']);
            } else {
                $validated['accepted_formats'] = json_encode([]);
            }

            Log::info('Creating DocumentType with data:', ['document_type_data' => $validated]);

            // Create the document type
            $documentType = DocumentType::create($validated);

            Log::info('DocumentType created successfully', [
                'document_type_id' => $documentType->id,
                'document_type_code' => $documentType->code,
                'document_type_name' => $documentType->name,
            ]);

            return redirect()->route('document-types.index')
                ->with('success', 'Document type created successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in document type store method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while creating the document type: ' . $e->getMessage());
        }
    }

    public function show(DocumentType $documentType)
    {
        $documentType->load(['category', 'clearanceRequirements.clearanceType']);

        // Get clearance types that require this document
        $requiredClearanceTypes = $documentType->requiredByClearanceTypes()
            ->withCount([
                'documentRequirements' => function ($query) use ($documentType) {
                    $query->where('document_type_id', $documentType->id);
                }
            ])
            ->get();

        // Get recent applications using this document type
        $recentApplications = $documentType->clearanceRequirements()
            ->with(['clearanceType', 'documentType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Decode accepted formats for display
        $documentType->accepted_formats = json_decode($documentType->accepted_formats, true) ?: [];

        return Inertia::render('admin/Documents/DocumentTypes/Show', [
            'documentType' => $documentType,
            'requiredClearanceTypes' => $requiredClearanceTypes,
            'recentApplications' => $recentApplications,
            'max_file_size_mb' => $documentType->max_file_size ?
                round($documentType->max_file_size / 1024, 2) : 0,
        ]);
    }

    public function edit(DocumentType $documentType)
    {
        $documentType->load('category');

        // Decode accepted formats for editing
        $documentType->accepted_formats = json_decode($documentType->accepted_formats, true) ?: [];

        // Convert file size to MB for display
        $documentType->max_file_size_mb = $documentType->max_file_size ?
            round($documentType->max_file_size / 1024, 2) : 0;

        // Get active categories for dropdown - REMOVE sort_order from here
        $categories = DocumentCategory::where('is_active', true)
            ->orderBy('name') // Only order by name
            ->get();

        // Common file formats for selection
        $commonFormats = [
            'pdf' => 'PDF Document',
            'doc' => 'Microsoft Word',
            'docx' => 'Microsoft Word',
            'xls' => 'Microsoft Excel',
            'xlsx' => 'Microsoft Excel',
            'jpeg' => 'JPEG Image',
            'jpg' => 'JPG Image',
            'png' => 'PNG Image',
            'gif' => 'GIF Image',
            'txt' => 'Text File',
            'csv' => 'CSV File',
            'zip' => 'ZIP Archive',
            'rar' => 'RAR Archive',
        ];

        return Inertia::render('admin/Documents/DocumentTypes/Edit', [
            'documentType' => $documentType,
            'categories' => $categories,
            'commonFormats' => $commonFormats,
        ]);
    }

    public function update(Request $request, DocumentType $documentType)
    {
        Log::info('Document Type Update Request Received', [
            'document_type_id' => $documentType->id,
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:document_types,code,' . $documentType->id,
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'document_category_id' => 'required|exists:document_categories,id',

                // Boolean flags
                'is_required' => 'boolean',
                'is_active' => 'boolean',

                // File specifications
                'accepted_formats' => 'nullable|array',
                'accepted_formats.*' => 'string|in:pdf,doc,docx,xls,xlsx,jpeg,jpg,png,gif,txt,csv,zip,rar',
                'max_file_size' => 'required|integer|min:1|max:10240', // Max 10MB in KB
                'sort_order' => 'required|integer|min:0',
            ]);

            // Set default values for booleans
            $validated['is_required'] = $validated['is_required'] ?? $documentType->is_required;
            $validated['is_active'] = $validated['is_active'] ?? $documentType->is_active;

            // Convert file size from MB to KB if needed
            if ($validated['max_file_size'] < 100) { // Assuming if less than 100, it's in MB
                $validated['max_file_size'] = $validated['max_file_size'] * 1024; // Convert MB to KB
            }

            // Encode accepted formats to JSON
            if (isset($validated['accepted_formats'])) {
                $validated['accepted_formats'] = json_encode($validated['accepted_formats']);
            } else {
                $validated['accepted_formats'] = json_encode([]);
            }

            // Update the document type
            $documentType->update($validated);

            Log::info('DocumentType updated successfully', [
                'document_type_id' => $documentType->id,
                'document_type_code' => $documentType->code,
                'document_type_name' => $documentType->name,
            ]);

            return redirect()->route('document-types.index')
                ->with('success', 'Document type updated successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'document_type_id' => $documentType->id,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in document type update method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'document_type_id' => $documentType->id,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while updating the document type: ' . $e->getMessage());
        }
    }

    public function destroy(DocumentType $documentType)
    {
        // Check if document type is in use
        if ($documentType->clearanceRequirements()->exists()) {
            return back()->with('error', 'Cannot delete document type that is in use. There are existing clearance requirements using this type.');
        }

        $documentType->delete();

        return redirect()->route('document-types.index')
            ->with('success', 'Document type deleted successfully.');
    }

    public function toggleStatus(DocumentType $documentType)
    {
        $documentType->update(['is_active' => !$documentType->is_active]);

        $status = $documentType->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Document type {$status} successfully.");
    }

    public function toggleRequired(DocumentType $documentType)
    {
        $documentType->update(['is_required' => !$documentType->is_required]);

        $status = $documentType->is_required ? 'marked as required' : 'marked as optional';

        return back()->with('success', "Document type {$status} successfully.");
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete,toggle_required',
            'document_type_ids' => 'required|array',
            'document_type_ids.*' => 'exists:document_types,id',
        ]);

        $count = 0;

        foreach ($request->document_type_ids as $documentTypeId) {
            $documentType = DocumentType::find($documentTypeId);

            switch ($request->action) {
                case 'activate':
                    $documentType->update(['is_active' => true]);
                    $count++;
                    break;

                case 'deactivate':
                    $documentType->update(['is_active' => false]);
                    $count++;
                    break;

                case 'toggle_required':
                    $documentType->update(['is_required' => !$documentType->is_required]);
                    $count++;
                    break;

                case 'delete':
                    // Check if document type is in use
                    if (!$documentType->clearanceRequirements()->exists()) {
                        $documentType->delete();
                        $count++;
                    }
                    break;
            }
        }

        return back()->with('success', "{$count} document types updated successfully.");
    }

    public function bulkDuplicate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:document_types,id',
        ]);

        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($request->ids as $documentTypeId) {
                $original = DocumentType::find($documentTypeId);

                // Create duplicate
                $duplicate = $original->replicate();
                $duplicate->code = $original->code . '_COPY_' . time();
                $duplicate->name = $original->name . ' (Copy)';
                $duplicate->save();

                $count++;
            }

            DB::commit();

            return back()->with('success', "{$count} document types duplicated successfully.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in bulk duplicate:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to duplicate document types: ' . $e->getMessage());
        }
    }

    public function duplicate(DocumentType $documentType)
    {
        DB::beginTransaction();
        try {
            $duplicate = $documentType->replicate();
            $duplicate->code = $documentType->code . '_COPY_' . time();
            $duplicate->name = $documentType->name . ' (Copy)';
            $duplicate->save();

            DB::commit();

            return back()->with('success', 'Document type duplicated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in duplicate:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to duplicate document type: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $query = DocumentType::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $isActive = $request->status === 'active';
                $query->where('is_active', $isActive);
            })
            ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                $query->where('document_category_id', $request->category);
            })
            ->when($request->required && $request->required !== 'all', function ($query) use ($request) {
                $isRequired = $request->required === 'required';
                $query->where('is_required', $isRequired);
            })
            ->orderBy('sort_order')
            ->orderBy('name');

        $documentTypes = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=document_types_export_' . date('Y-m-d') . '.csv',
        ];

        $callback = function () use ($documentTypes) {
            $file = fopen('php://output', 'w');

            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");

            // Headers
            fputcsv($file, [
                'ID',
                'Code',
                'Name',
                'Description',
                'Category',
                'Required',
                'Active',
                'Accepted Formats',
                'Max File Size (MB)',
                'Sort Order',
                'Created At',
                'Updated At'
            ]);

            // Data
            foreach ($documentTypes as $type) {
                $acceptedFormats = json_decode($type->accepted_formats, true) ?: [];
                $maxFileSizeMB = $type->max_file_size ? round($type->max_file_size / 1024, 2) : 0;

                fputcsv($file, [
                    $type->id,
                    $type->code,
                    $type->name,
                    $type->description ?? '',
                    $type->category ? $type->category->name : 'Uncategorized',
                    $type->is_required ? 'Yes' : 'No',
                    $type->is_active ? 'Yes' : 'No',
                    implode(', ', $acceptedFormats),
                    $maxFileSizeMB,
                    $type->sort_order,
                    $type->created_at->format('Y-m-d H:i:s'),
                    $type->updated_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Quick create from common type
     */
    public function createFromCommonType(Request $request)
    {
        $typeCode = $request->input('type_code');

        if (!isset(self::COMMON_DOCUMENT_TYPES[$typeCode])) {
            return back()->with('error', 'Invalid document type selected.');
        }

        $commonType = self::COMMON_DOCUMENT_TYPES[$typeCode];

        // Check if category exists
        $category = DocumentCategory::find($commonType['category_id']);
        if (!$category) {
            return back()->with('error', 'Category not found. Please create categories first.');
        }

        // Check if already exists
        if (DocumentType::where('code', $commonType['code'])->exists()) {
            return back()->with('error', 'This document type already exists.');
        }

        // Create the document type
        $documentType = DocumentType::create([
            'code' => $commonType['code'],
            'name' => $commonType['name'],
            'description' => $commonType['description'],
            'document_category_id' => $commonType['category_id'],
            'accepted_formats' => json_encode($commonType['accepted_formats']),
            'max_file_size' => $commonType['max_file_size'],
            'sort_order' => $commonType['sort_order'],
            'is_required' => $commonType['is_required'],
            'is_active' => true,
        ]);

        return redirect()->route('document-types.edit', $documentType)
            ->with('success', 'Document type created from template. You can now customize it.');
    }
}