<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Resident;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;

class ClearanceController extends Controller
{
    /**
     * Display a listing of clearance requests.
     */
    public function index(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['resident', 'clearanceType', 'issuingOfficer'])
            ->latest();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('clearance_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhereHas('resident', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)"), 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Type filter
        if ($type = $request->input('type')) {
            $query->where('clearance_type_id', $type);
        }

        // Get paginated results with formatted data
        $clearances = $query->paginate(20)->through(function ($clearance) {
            return array_merge(
                $clearance->toArray(),
                [
                    'resident' => $clearance->resident ? [
                        'id' => $clearance->resident->id,
                        'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
                        'first_name' => $clearance->resident->first_name,
                        'last_name' => $clearance->resident->last_name,
                        'address' => $clearance->resident->address,
                    ] : null,
                    'clearance_type' => $clearance->clearanceType ? [
                        'id' => $clearance->clearanceType->id,
                        'name' => $clearance->clearanceType->name,
                        'code' => $clearance->clearanceType->code,
                        'fee' => (float) $clearance->clearanceType->fee,
                        'processing_days' => $clearance->clearanceType->processing_days,
                        'validity_days' => $clearance->clearanceType->validity_days,
                    ] : null,
                    'status_display' => $clearance->status_display,
                    'urgency_display' => $clearance->urgency_display,
                    'formatted_fee' => $clearance->formatted_fee,
                    'is_valid' => $clearance->is_valid,
                    'days_remaining' => $clearance->days_remaining,
                    'created_at' => $clearance->created_at->toDateTimeString(),
                    'updated_at' => $clearance->updated_at->toDateTimeString(),
                    'issue_date' => $clearance->issue_date?->toDateString(),
                    'valid_until' => $clearance->valid_until?->toDateString(),
                ]
            );
        });

        // Get stats
        $stats = [
            'totalIssued' => ClearanceRequest::where('status', 'issued')->count(),
            'issuedThisMonth' => ClearanceRequest::where('status', 'issued')
                ->whereMonth('issue_date', now()->month)
                ->whereYear('issue_date', now()->year)
                ->count(),
            'pending' => ClearanceRequest::where('status', 'pending')->count(),
            'pendingToday' => ClearanceRequest::where('status', 'pending')
                ->whereDate('created_at', today())
                ->count(),
            'expiringSoon' => ClearanceRequest::where('status', 'issued')
                ->where('valid_until', '<=', now()->addDays(30))
                ->where('valid_until', '>', now())
                ->count(),
            'totalRevenue' => (float) ClearanceRequest::where('status', 'issued')
                ->sum('fee_amount'),
        ];

        // Get active clearance types with counts
        $clearanceTypes = ClearanceType::active()
            ->withCount(['clearanceRequests'])
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'fee' => (float) $type->fee,
                    'formatted_fee' => $type->formatted_fee,
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'is_active' => (bool) $type->is_active,
                    'description' => $type->description,
                    'document_types_count' => $type->document_types_count,
                    'required_document_types_count' => $type->required_document_types_count,
                    'total_requests' => $type->clearance_requests_count,
                ];
            });

        // Status options for filter
        $statusOptions = [
            ['value' => 'pending', 'label' => 'Pending Review'],
            ['value' => 'pending_payment', 'label' => 'Pending Payment'],
            ['value' => 'processing', 'label' => 'Under Processing'],
            ['value' => 'approved', 'label' => 'Approved'],
            ['value' => 'issued', 'label' => 'Issued'],
            ['value' => 'rejected', 'label' => 'Rejected'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
            ['value' => 'expired', 'label' => 'Expired'],
        ];

        return Inertia::render('admin/Clearances/Index', [
            'clearances' => $clearances,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['search', 'status', 'type']),
            'statusOptions' => $statusOptions,
        ]);
    }
    
    public function show(ClearanceRequest $clearance)
{
    // First, let's validate the relationships based on your actual schema
    $clearance->load([
        'resident' => function ($query) {
            $query->select(['id', 'first_name', 'middle_name', 'last_name', 'suffix', 
                           'address', 'contact_number', 'email', 'birth_date', 
                           'gender', 'civil_status', 'occupation', 'photo_path']);
        },
        'clearanceType' => function ($query) {
            $query->select(['id', 'name', 'code', 'description', 'fee', 
                           'processing_days', 'validity_days', 'is_active', 
                           'requires_payment', 'requires_approval', 'is_online_only',
                           'eligibility_criteria', 'purpose_options']);
        },
        'documents' => function ($query) {
            $query->select(['id', 'clearance_request_id', 'file_path', 'file_name', 
                           'original_name', 'file_size', 'file_type', 'mime_type',
                           'description', 'is_verified', 'document_type_id',
                           'created_at', 'updated_at'])
                  ->orderBy('created_at', 'desc');
        },
       'paymentItem.payment' => function ($query) {
    // CORRECTED: Based on your actual payments table structure
    $query->select([
        'id', 
        'or_number', // Main receipt number
        'reference_number', // Additional reference
        'total_amount', 
        'status', 
        'payment_method', 
        'payment_date', 
        'subtotal',
        'surcharge',
        'penalty',
        'discount',
        'discount_type',
        'payer_name',
        'payer_type',
        'remarks',
        'purpose',
        'is_cleared',
        'collection_type',
        'created_at', 
        'updated_at'
    ]);
}
    ]);

    // Log the view for audit trail
    activity()
        ->performedOn($clearance)
        ->causedBy(auth()->user())
        ->withProperties(['ip' => request()->ip(), 'user_agent' => request()->userAgent()])
        ->log('viewed_clearance_details');

    // Get activity logs with proper query
    $activityLogs = Activity::where(function ($query) use ($clearance) {
            $query->where('subject_type', ClearanceRequest::class)
                  ->where('subject_id', $clearance->id);
        })
        ->orWhere(function ($query) use ($clearance) {
            $query->where('log_name', 'clearance')
                  ->where('properties->clearance_id', $clearance->id);
        })
        ->with(['causer' => function ($query) {
            $query->select(['id', 'first_name', 'last_name', 'email']);
        }])
        ->latest()
        ->take(50)
        ->get()
        ->map(function ($log) {
            $user = $log->causer;
            $initials = 'SYS';
            
            if ($user) {
                $firstName = $user->first_name ?? '';
                $lastName = $user->last_name ?? '';
                $name = trim($firstName . ' ' . $lastName);
                $initials = ($firstName && $lastName) 
                    ? strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1))
                    : 'US';
            }
            
            return [
                'id' => $log->id,
                'description' => $log->description,
                'event' => $log->event,
                'properties' => $log->properties,
                'created_at' => $log->created_at->toDateTimeString(),
                'formatted_date' => $log->created_at->format('M d, Y h:i A'),
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                    'email' => $user->email,
                    'photo_path' => null,
                    'initials' => $initials,
                ] : [
                    'name' => 'System',
                    'initials' => 'SYS',
                ],
                'icon' => $this->getActivityIcon($log->event),
                'color' => $this->getActivityColor($log->event),
            ];
        });

    // Check permissions with policy methods
    $user = auth()->user();
    $canEdit = $user->can('update', $clearance);
    $canDelete = $user->can('delete', $clearance);
    $canProcess = $user->can('process', $clearance);
    $canIssue = $user->can('issue', $clearance);
    $canApprove = $user->can('approve', $clearance);
    $canPrint = $user->can('print', $clearance);
    $canVerifyPayment = $user->can('verify-payment', $clearance);
    $canAssignOfficer = $user->can('assign-officer', $clearance);
    $canViewDocuments = $user->can('view-documents', $clearance);
    $canUploadDocuments = $user->can('upload-documents', $clearance);

    // Format payment details with null-safe checks
    $paymentDetails = null;
    $paymentItemDetails = null;
    
    if ($clearance->paymentItem && $clearance->paymentItem->payment) {
        $payment = $clearance->paymentItem->payment;
        $paymentDetails = [
        'id' => $payment->id,
        'amount' => (float) $payment->total_amount,
        'formatted_amount' => '₱' . number_format($payment->total_amount, 2),
        'status' => $payment->status,
        'status_display' => $this->getPaymentStatusDisplay($payment->status),
        'payment_method' => $payment->payment_method ?? null,
        'payment_method_display' => $payment->payment_method ? 
            ucwords(str_replace('_', ' ', $payment->payment_method)) : null,
        // Both fields exist in your table
        'or_number' => $payment->or_number, // Required field (NOT NULL)
        'reference_number' => $payment->reference_number ?? null, // Optional field
        'payment_date' => $payment->payment_date?->toDateTimeString(),
        'paid_at' => $payment->payment_date?->toDateTimeString(), // Alias for frontend
        'formatted_paid_at' => $payment->payment_date?->format('F j, Y \a\t g:i A'),
        'formatted_payment_date' => $payment->payment_date?->format('F j, Y \a\t g:i A'),
        'created_at' => $payment->created_at?->toDateTimeString(),
        'updated_at' => $payment->updated_at?->toDateTimeString(),
        'remarks' => $payment->remarks ?? null,
        'purpose' => $payment->purpose ?? null,
        'payer_name' => $payment->payer_name ?? null,
        'payer_type' => $payment->payer_type ?? null,
        'subtotal' => (float) $payment->subtotal,
        'surcharge' => (float) $payment->surcharge,
        'penalty' => (float) $payment->penalty,
        'discount' => (float) $payment->discount,
        'discount_type' => $payment->discount_type ?? null,
        'is_cleared' => (bool) $payment->is_cleared,
        'collection_type' => $payment->collection_type ?? 'manual',
    ];
        
         $paymentItemDetails = [
        'id' => $clearance->paymentItem->id,
        'payment_id' => $clearance->paymentItem->payment_id,
        'clearance_request_id' => $clearance->paymentItem->clearance_request_id,
        'amount' => (float) $clearance->paymentItem->total_amount,
        'description' => $clearance->paymentItem->description ?? 'Clearance Fee',
        'fee_name' => $clearance->paymentItem->fee_name ?? null,
        'fee_code' => $clearance->paymentItem->fee_code ?? null,
        'base_amount' => (float) $clearance->paymentItem->base_amount,
        'surcharge' => (float) $clearance->paymentItem->surcharge,
        'penalty' => (float) $clearance->paymentItem->penalty,
        'category' => $clearance->paymentItem->category ?? null,
        'created_at' => $clearance->paymentItem->created_at?->toDateTimeString(),
    ];
    }

    // Format documents based on your actual schema
    $documents = $clearance->documents ? $clearance->documents->map(function ($doc) {
        // Generate URLs based on file_path
        $fileUrl = $doc->file_path ? Storage::url($doc->file_path) : null;
        $thumbnailUrl = null;
        
        // Check if it's an image for thumbnail
        if ($doc->mime_type && str_starts_with($doc->mime_type, 'image/')) {
            $thumbnailUrl = $fileUrl;
        }
        
        // Determine document name - use description or original_name or file_name
        $documentName = $doc->description ?? $doc->original_name ?? $doc->file_name ?? 'Document';
        
        return [
            'id' => $doc->id,
            'name' => $documentName,
            'document_type_id' => $doc->document_type_id,
            'description' => $doc->description,
            'is_verified' => (bool) $doc->is_verified,
            'file_path' => $doc->file_path,
            'file_name' => $doc->file_name,
            'original_name' => $doc->original_name,
            'file_size' => (int) $doc->file_size,
            'formatted_file_size' => $this->formatFileSize($doc->file_size),
            'file_type' => $doc->file_type,
            'mime_type' => $doc->mime_type,
            'url' => $fileUrl,
            'thumbnail_url' => $thumbnailUrl,
            'uploaded_at' => $doc->created_at?->toDateTimeString(),
            'formatted_uploaded_at' => $doc->created_at?->format('M d, Y h:i A'),
            'verified_at' => null,
            'formatted_verified_at' => null,
            'is_image' => $doc->mime_type && str_starts_with($doc->mime_type, 'image/'),
            'is_pdf' => $doc->mime_type === 'application/pdf',
            'extension' => $doc->file_type ?? pathinfo($doc->file_name ?? '', PATHINFO_EXTENSION),
        ];
    })->toArray() : [];

    // Calculate document statistics
    $documentStats = [
        'total' => count($documents),
        'verified' => collect($documents)->where('is_verified', true)->count(),
        'pending' => collect($documents)->where('is_verified', false)->count(),
    ];

    // Parse requirements_met from JSON if needed
    $requirementsMet = [];
    if ($clearance->requirements_met) {
        try {
            $requirementsMet = is_array($clearance->requirements_met) 
                ? $clearance->requirements_met 
                : json_decode($clearance->requirements_met, true);
        } catch (\Exception $e) {
            $requirementsMet = [];
        }
    }

    // Format clearance data
    $formattedClearance = [
        // Basic Information
        'id' => $clearance->id,
        'resident_id' => $clearance->resident_id,
        'clearance_type_id' => $clearance->clearance_type_id,
        'reference_number' => $clearance->reference_number,
        'clearance_number' => $clearance->clearance_number,
        'purpose' => $clearance->purpose,
        'specific_purpose' => $clearance->specific_purpose,
        'urgency' => $clearance->urgency,
        'fee_amount' => (float) $clearance->fee_amount,
        'needed_date' => $clearance->needed_date?->toDateString(),
        'formatted_needed_date' => $clearance->needed_date?->format('F d, Y'),
        'additional_requirements' => $clearance->additional_requirements,
        'admin_notes' => $clearance->admin_notes,
        'remarks' => $clearance->remarks,
        'cancellation_reason' => $clearance->cancellation_reason,
        
        // Status Information
        'status' => $clearance->status,
        'status_display' => ucfirst(str_replace('_', ' ', $clearance->status)),
        'urgency_display' => ucfirst($clearance->urgency),
        
        // Dates
        'issue_date' => $clearance->issue_date?->toDateString(),
        'formatted_issue_date' => $clearance->issue_date?->format('F d, Y'),
        'valid_until' => $clearance->valid_until?->toDateString(),
        'formatted_valid_until' => $clearance->valid_until?->format('F d, Y'),
        'created_at' => $clearance->created_at->toDateTimeString(),
        'formatted_created_at' => $clearance->created_at->format('F d, Y h:i A'),
        'updated_at' => $clearance->updated_at->toDateTimeString(),
        'formatted_updated_at' => $clearance->updated_at->format('F d, Y h:i A'),
        'processed_at' => $clearance->processed_at?->toDateTimeString(),
        'formatted_processed_at' => $clearance->processed_at?->format('F d, Y h:i A'),
        
        // Officer Information
        'issuing_officer_name' => $clearance->issuing_officer_name,
        'processed_by' => $clearance->processed_by,
        'issuing_officer_id' => $clearance->issuing_officer_id,
        'requested_by_user_id' => $clearance->requested_by_user_id,
        
        // Requirements
        'requirements_met' => $requirementsMet,
        
        // Relationships
        'resident' => $clearance->resident ? [
            'id' => $clearance->resident->id,
            'full_name' => trim(
                $clearance->resident->first_name . ' ' . 
                ($clearance->resident->middle_name ? $clearance->resident->middle_name[0] . '. ' : '') . 
                $clearance->resident->last_name . 
                ($clearance->resident->suffix ? ' ' . $clearance->resident->suffix : '')
            ),
            'first_name' => $clearance->resident->first_name,
            'middle_name' => $clearance->resident->middle_name,
            'last_name' => $clearance->resident->last_name,
            'suffix' => $clearance->resident->suffix,
            'address' => $clearance->resident->address,
            'contact_number' => $clearance->resident->contact_number,
            'email' => $clearance->resident->email,
            'birth_date' => $clearance->resident->birth_date?->toDateString(),
            'formatted_birth_date' => $clearance->resident->birth_date?->format('F d, Y'),
            'age' => $clearance->resident->birth_date ? 
                $clearance->resident->birth_date->diffInYears(now()) : null,
            'gender' => $clearance->resident->gender,
            'gender_display' => $clearance->resident->gender ? 
                ucfirst($clearance->resident->gender) : null,
            'civil_status' => $clearance->resident->civil_status,
            'civil_status_display' => $clearance->resident->civil_status ? 
                ucfirst($clearance->resident->civil_status) : null,
            'occupation' => $clearance->resident->occupation,
            'photo_path' => $clearance->resident->photo_path ? 
                Storage::url($clearance->resident->photo_path) : null,
            'initials' => strtoupper(
                substr($clearance->resident->first_name ?? '', 0, 1) . 
                substr($clearance->resident->last_name ?? '', 0, 1)
            ),
        ] : null,
        
        'clearance_type' => $clearance->clearanceType ? [
            'id' => $clearance->clearanceType->id,
            'name' => $clearance->clearanceType->name,
            'code' => $clearance->clearanceType->code,
            'description' => $clearance->clearanceType->description,
            'fee' => (float) $clearance->clearanceType->fee,
            'processing_days' => $clearance->clearanceType->processing_days,
            'validity_days' => $clearance->clearanceType->validity_days,
            'is_active' => (bool) $clearance->clearanceType->is_active,
            'requires_payment' => (bool) $clearance->clearanceType->requires_payment,
            'requires_approval' => (bool) $clearance->clearanceType->requires_approval,
            'is_online_only' => (bool) $clearance->clearanceType->is_online_only,
            'eligibility_criteria' => $clearance->clearanceType->eligibility_criteria,
            'purpose_options' => $clearance->clearanceType->purpose_options,
            'formatted_fee' => '₱' . number_format($clearance->clearanceType->fee, 2),
        ] : null,
        
        // Documents
        'documents' => $documents,
        'document_stats' => $documentStats,
        
        // Payment information
        'payment' => $paymentDetails,
        'payment_item' => $paymentItemDetails,
        
        // Formatted values
        'formatted_fee' => '₱' . number_format($clearance->fee_amount, 2),
        
        // Calculated fields
        'is_payment_required' => $clearance->clearanceType?->requires_payment ?? false,
        'is_payment_pending' => $clearance->status === 'pending_payment',
        'is_payment_paid' => $paymentDetails && $paymentDetails['status'] === 'completed', // Note: your table shows 'completed' not 'paid'
        'days_since_created' => $clearance->created_at->diffInDays(now()),
        'days_until_needed' => $clearance->needed_date ? 
            max(0, now()->diffInDays($clearance->needed_date, false)) : null,
        
        // Estimated completion date based on processing days
        'estimated_completion_date' => $clearance->clearanceType?->processing_days ? 
            $clearance->created_at->addDays($clearance->clearanceType->processing_days)->toDateString() : null,
        'formatted_estimated_completion_date' => $clearance->clearanceType?->processing_days ? 
            $clearance->created_at->addDays($clearance->clearanceType->processing_days)->format('F d, Y') : null,
    ];

    return Inertia::render('admin/Clearances/Show', [
        'clearance' => $formattedClearance,
        'activityLogs' => $activityLogs,
        'permissions' => [
            'canEdit' => $canEdit,
            'canDelete' => $canDelete,
            'canProcess' => $canProcess,
            'canIssue' => $canIssue,
            'canApprove' => $canApprove,
            'canPrint' => $canPrint,
            'canVerifyPayment' => $canVerifyPayment,
            'canAssignOfficer' => $canAssignOfficer,
            'canViewDocuments' => $canViewDocuments,
            'canUploadDocuments' => $canUploadDocuments,
        ],
        'config' => [
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
            'max_file_size' => config('filesystems.max_upload_size', 5242880),
            'allowed_file_types' => config('filesystems.allowed_types', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']),
            'date_format' => config('app.date_format', 'F d, Y'),
            'time_format' => config('app.time_format', 'h:i A'),
        ],
        'meta' => [
            'title' => "Clearance Request: {$clearance->reference_number}",
            'description' => "View details for clearance request {$clearance->reference_number}",
        ],
    ]);
}
    private function getUrgencyColor($urgency): string
    {
        $colors = [
            'normal' => 'success',
            'rush' => 'warning',
            'express' => 'danger',
        ];
        
        return $colors[$urgency] ?? 'secondary';
    }

    private function formatFileSize($bytes): string
    {
        if ($bytes == 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    // Helper methods for the controller
    private function getActivityIcon($event): string
    {
        $icons = [
            'created' => 'add',
            'updated' => 'edit',
            'deleted' => 'delete',
            'viewed' => 'visibility',
            'approved' => 'check_circle',
            'rejected' => 'cancel',
            'issued' => 'description',
            'payment' => 'payment',
            'verified' => 'verified',
        ];
        
        return $icons[$event] ?? 'info';
    }

    private function getActivityColor($event): string
    {
        $colors = [
            'created' => 'success',
            'updated' => 'info',
            'deleted' => 'error',
            'viewed' => 'info',
            'approved' => 'success',
            'rejected' => 'error',
            'issued' => 'success',
            'payment' => 'info',
            'verified' => 'success',
        ];
        
        return $colors[$event] ?? 'default';
    }

    private function getStatusColor(string $status): string
    {
        $colors = [
            'pending' => 'amber',
            'pending_payment' => 'orange',
            'processing' => 'blue',
            'approved' => 'green',
            'issued' => 'green',
            'rejected' => 'red',
            'cancelled' => 'gray',
            'expired' => 'gray',
        ];
        
        return $colors[$status] ?? 'gray';
    }

    private function getPaymentStatusDisplay(string $status): string
    {
        $display = [
            'pending' => 'Pending',
            'paid' => 'Paid',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
            'cancelled' => 'Cancelled',
        ];
        
        return $display[$status] ?? ucfirst($status);
    }

    private function getValidityStatus($clearance): ?array
    {
        if ($clearance->status !== 'issued' || !$clearance->valid_until) {
            return null;
        }
        
        $today = now();
        $validUntil = $clearance->valid_until;
        $diffDays = $today->diffInDays($validUntil, false);
        
        if ($diffDays > 0) {
            return [
                'text' => "Valid for {$diffDays} day" . ($diffDays !== 1 ? 's' : ''),
                'color' => 'green',
                'icon' => 'check-circle',
                'days_remaining' => $diffDays,
            ];
        } elseif ($diffDays === 0) {
            return [
                'text' => 'Expires today',
                'color' => 'orange',
                'icon' => 'alert-circle',
                'days_remaining' => 0,
            ];
        } else {
            $daysExpired = abs($diffDays);
            return [
                'text' => "Expired {$daysExpired} day" . ($daysExpired !== 1 ? 's' : '') . " ago",
                'color' => 'red',
                'icon' => 'x-circle',
                'days_expired' => $daysExpired,
            ];
        }
    }

    private function getNextActions($clearance, $user): array
    {
        $actions = [];
        
        switch ($clearance->status) {
            case 'pending':
                if ($user->can('process', $clearance)) {
                    $actions[] = ['action' => 'process', 'label' => 'Start Processing', 'icon' => 'play'];
                }
                if ($clearance->clearanceType?->requires_payment) {
                    $actions[] = ['action' => 'request_payment', 'label' => 'Request Payment', 'icon' => 'dollar-sign'];
                }
                break;
                
            case 'pending_payment':
                if ($user->can('verify-payment', $clearance)) {
                    $actions[] = ['action' => 'verify_payment', 'label' => 'Verify Payment', 'icon' => 'check-circle'];
                }
                break;
                
            case 'processing':
                if ($user->can('approve', $clearance)) {
                    $actions[] = ['action' => 'approve', 'label' => 'Approve Request', 'icon' => 'check'];
                }
                if ($user->can('assign-officer', $clearance) && !$clearance->assignedOfficer) {
                    $actions[] = ['action' => 'assign_officer', 'label' => 'Assign Officer', 'icon' => 'user-plus'];
                }
                break;
                
            case 'approved':
                if ($user->can('issue', $clearance)) {
                    $actions[] = ['action' => 'issue', 'label' => 'Issue Certificate', 'icon' => 'shield'];
                }
                break;
                
            case 'issued':
                if ($user->can('print', $clearance)) {
                    $actions[] = ['action' => 'print', 'label' => 'Print Certificate', 'icon' => 'printer'];
                }
                if ($user->can('download', $clearance)) {
                    $actions[] = ['action' => 'download', 'label' => 'Download PDF', 'icon' => 'download'];
                }
                break;
        }
        
        return $actions;
    }

    public function edit(ClearanceRequest $clearance)
    {
        // Get active clearance types
        $clearanceTypes = ClearanceType::active()
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => (float) $type->fee,
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'formatted_fee' => $type->formatted_fee,
                    'requires_payment' => $type->requires_payment,
                    'requires_approval' => $type->requires_approval,
                    'is_online_only' => $type->is_online_only,
                    'requirements' => $type->documentRequirements()->get()->map(function ($req) {
                        return $req->name;
                    })->toArray(),
                    'purpose_options' => $type->purpose_options,
                ];
            });

        // Load necessary relationships
        $clearance->load(['resident', 'clearanceType']);

        // Format the data for Inertia
        $formattedClearance = [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
            'purpose' => $clearance->purpose,
            'specific_purpose' => $clearance->specific_purpose,
            'clearance_type_id' => $clearance->clearance_type_id,
            'urgency' => $clearance->urgency,
            'fee_amount' => (float) $clearance->fee_amount,
            'needed_date' => $clearance->needed_date?->toDateString(),
            'additional_requirements' => $clearance->additional_requirements,
            'admin_notes' => $clearance->admin_notes,
            'remarks' => $clearance->remarks,
            'status' => $clearance->status,
            'issue_date' => $clearance->issue_date?->toDateString(),
            'valid_until' => $clearance->valid_until?->toDateString(),
            'created_at' => $clearance->created_at->toDateTimeString(),
            'updated_at' => $clearance->updated_at->toDateTimeString(),
            'resident' => $clearance->resident ? [
                'id' => $clearance->resident->id,
                'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
                'address' => $clearance->resident->address,
                'contact_number' => $clearance->resident->contact_number,
                'email' => $clearance->resident->email,
                'birth_date' => $clearance->resident->birth_date?->toDateString(),
                'gender' => $clearance->resident->gender,
                'civil_status' => $clearance->resident->civil_status,
                'occupation' => $clearance->resident->occupation,
                'photo_path' => $clearance->resident->photo_path,
            ] : null,
            'clearance_type' => $clearance->clearanceType ? [
                'id' => $clearance->clearanceType->id,
                'name' => $clearance->clearanceType->name,
                'code' => $clearance->clearanceType->code,
                'description' => $clearance->clearanceType->description,
                'fee' => (float) $clearance->clearanceType->fee,
                'processing_days' => $clearance->clearanceType->processing_days,
                'validity_days' => $clearance->clearanceType->validity_days,
                'requires_payment' => $clearance->clearanceType->requires_payment,
                'requires_approval' => $clearance->clearanceType->requires_approval,
                'is_online_only' => $clearance->clearanceType->is_online_only,
            ] : null,
            'status_display' => $clearance->status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
        ];

        // Get purpose options from clearance type
        $purposeOptions = [];
        if ($clearance->clearanceType && $clearance->clearanceType->purpose_options) {
            $purposeOptions = explode(',', $clearance->clearanceType->purpose_options);
            $purposeOptions = array_map('trim', $purposeOptions);
        }

        return Inertia::render('admin/Clearances/Edit', [
            'clearance' => $formattedClearance,
            'clearanceTypes' => $clearanceTypes,
            'purposeOptions' => $purposeOptions,
        ]);
    }

    public function update(Request $request, ClearanceRequest $clearance)
    {
        // Define validation rules based on status
        $rules = [
            'purpose' => 'required|string|max:255',
            'specific_purpose' => 'nullable|string|max:500',
            'needed_date' => 'required|date|after_or_equal:today',
            'additional_requirements' => 'nullable|string|max:1000',
            'remarks' => 'nullable|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
        ];

        // Add rules based on status
        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $rules['fee_amount'] = 'required|numeric|min:0';
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
        } elseif (in_array($clearance->status, ['issued', 'rejected', 'cancelled', 'expired'])) {
            // Only admin notes can be updated for these statuses
            $rules = ['admin_notes' => 'nullable|string|max:1000'];
        } else {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        }
        
        $request->validate($rules);

        // Determine which fields can be updated based on status
        $editableFields = ['admin_notes']; // Always editable
        
        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'clearance_type_id',
                'urgency',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        }

        // Get changed fields for audit log
        $original = $clearance->toArray();
        $changed = [];
        
        foreach ($editableFields as $field) {
            $oldValue = $original[$field] ?? null;
            $newValue = $request->input($field);
            
            // Format dates for comparison
            if (in_array($field, ['needed_date', 'issue_date', 'valid_until'])) {
                if ($oldValue instanceof \DateTimeInterface) {
                    $oldValue = $oldValue->format('Y-m-d');
                }
                if ($newValue instanceof \DateTimeInterface) {
                    $newValue = $newValue->format('Y-m-d');
                }
            }
            
            // Compare values
            if ($oldValue != $newValue) {
                $changed[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        // Log the activity
        if (!empty($changed)) {
            activity()
                ->performedOn($clearance)
                ->causedBy(auth()->user())
                ->withProperties([
                    'changes' => $changed,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('updated')
                ->log('Clearance request was updated');
        }

        // Update the clearance
        $clearance->update($request->only($editableFields));

        return redirect()->route('clearances.show', $clearance)
            ->with('success', 'Clearance request updated successfully.');
    }

    /**
     * Get clearance statistics
     */
    private function getClearanceStats()
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        
        $totalIssued = ClearanceRequest::where('status', 'issued')->count();
        $pendingReview = ClearanceRequest::where('status', 'pending')->count();
        $inProcessing = ClearanceRequest::where('status', 'processing')->count();
        $pendingPayment = ClearanceRequest::where('status', 'pending_payment')->count();
        
        $expiringSoon = ClearanceRequest::where('valid_until', '>=', $now)
            ->where('valid_until', '<=', $now->addDays(30))
            ->where('status', 'issued')
            ->count();
        
        $issuedLast30Days = ClearanceRequest::where('status', 'issued')
            ->where('issue_date', '>=', $thirtyDaysAgo)
            ->count();
        
        $issuedToday = ClearanceRequest::where('status', 'issued')
            ->whereDate('issue_date', today())
            ->count();
        
        $totalRevenue = ClearanceRequest::where('status', 'issued')
            ->where('issue_date', '>=', $thirtyDaysAgo)
            ->sum('fee_amount');
        
        return [
            [
                'label' => 'Total Issued',
                'value' => $totalIssued,
                'change' => $issuedLast30Days > 0 ? "+{$issuedLast30Days} last 30 days" : 'No recent activity',
                'icon' => 'FileText',
                'color' => 'blue'
            ],
            [
                'label' => 'Pending Review',
                'value' => $pendingReview,
                'change' => $pendingReview > 0 ? 'Needs attention' : 'All clear',
                'icon' => 'Clock',
                'color' => 'amber'
            ],
            [
                'label' => 'In Processing',
                'value' => $inProcessing,
                'change' => $inProcessing > 0 ? 'Currently being processed' : 'No active processing',
                'icon' => 'RefreshCw',
                'color' => 'purple'
            ],
            [
                'label' => 'Pending Payment',
                'value' => $pendingPayment,
                'change' => $pendingPayment > 0 ? 'Awaiting payment' : 'No pending payments',
                'icon' => 'CreditCard',
                'color' => 'yellow'
            ],
            [
                'label' => 'Today\'s Issued',
                'value' => $issuedToday,
                'change' => $issuedToday > 0 ? 'Issued today' : 'None today',
                'icon' => 'Calendar',
                'color' => 'green'
            ],
            [
                'label' => 'Expiring Soon',
                'value' => $expiringSoon,
                'change' => $expiringSoon > 0 ? 'Within 30 days' : 'None expiring',
                'icon' => 'AlertCircle',
                'color' => 'orange'
            ],
        ];
    }
    
    /**
     * Show the form for creating a new clearance request.
     */
    public function create()
    {
        $residents = Resident::with('purok')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'address', 'contact_number', 'purok_id'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'address' => $resident->address,
                    'contact_number' => $resident->contact_number,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'purok_id' => $resident->purok_id,
                ];
            });
        
        // Get active clearance types
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => (float) $type->fee,
                    'formatted_fee' => $type->formatted_fee,
                    'processing_days' => (int) $type->processing_days,
                    'validity_days' => (int) $type->validity_days,
                    'requires_payment' => (bool) $type->requires_payment,
                    'requires_approval' => (bool) $type->requires_approval,
                    'is_online_only' => (bool) $type->is_online_only,
                    'requirements' => $type->requirements ?? [],
                    'purpose_options' => $type->purpose_options ? 
                        array_map('trim', explode(',', $type->purpose_options)) : 
                        ['Employment', 'Business Registration', 'Travel', 'School Requirement', 'Government Transaction', 'Loan Application', 'Other'],
                ];
            });
        
        // Default purpose options
        $defaultPurposeOptions = [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];
        
        return Inertia::render('admin/Clearances/Create', [
            'residents' => $residents,
            'clearanceTypes' => $clearanceTypes,
            'activeClearanceTypes' => $clearanceTypes,
            'purposeOptions' => $defaultPurposeOptions,
        ]);
    }
    
    /**
     * Store a newly created clearance request in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|exists:residents,id',
            'clearance_type_id' => 'required|exists:clearance_types,id',
            'purpose' => 'required|string|max:500',
            'specific_purpose' => 'nullable|string|max:500',
            'urgency' => 'required|in:normal,rush,express',
            'needed_date' => 'required|date',
            'additional_requirements' => 'nullable|string',
            'fee_amount' => 'nullable|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Get clearance type
        $clearanceType = ClearanceType::find($request->clearance_type_id);
        
        // Get resident
        $resident = Resident::find($request->resident_id);
        
        // Calculate fee if not provided
        $feeAmount = $request->fee_amount;
        if ($clearanceType && $feeAmount === null) {
            $feeAmount = $clearanceType->fee ?? 0;
        }
        
        // Adjust fee based on urgency
        if ($request->urgency === 'rush') {
            $feeAmount *= 1.5; // 50% surcharge for rush
        } elseif ($request->urgency === 'express') {
            $feeAmount *= 2.0; // 100% surcharge for express
        }
        
        // Round to 2 decimal places
        $feeAmount = round($feeAmount, 2);
        
        // Determine initial status
        $status = 'pending';
        if ($clearanceType && $clearanceType->requires_payment && $feeAmount > 0) {
            $status = 'pending_payment';
        }
        
        // Get the user ID associated with the resident
        $requestedByUserId = null;
        if ($resident && $resident->user) {
            $requestedByUserId = $resident->user->id;
        }
        
        // Get current admin
        $admin = auth()->user();
        
        $clearanceRequest = ClearanceRequest::create([
            'resident_id' => $request->resident_id,
            'clearance_type_id' => $request->clearance_type_id,
            'purpose' => $request->purpose,
            'specific_purpose' => $request->specific_purpose,
            'urgency' => $request->urgency,
            'needed_date' => $request->needed_date,
            'additional_requirements' => $request->additional_requirements,
            'fee_amount' => $feeAmount,
            'status' => $status,
            // These are the correct field names from your database:
            'issuing_officer_id' => $admin->id, // Store the user ID
            'issuing_officer_name' => $admin->name, // Store the name for display
            'requested_by_user_id' => $requestedByUserId, // Resident's user ID, not admin's
            'processed_by' => $admin->id, // Admin who created it
            'processed_at' => now(), // Admin processed it immediately
        ]);
        
        return redirect()->route('clearances.index')
            ->with('success', 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number);
    }
    
    /**
     * Remove the specified clearance request from storage.
     */
    public function destroy(ClearanceRequest $clearance)
    {
        $referenceNumber = $clearance->reference_number;
        $clearance->delete();
        
        return redirect()->route('clearances.index')
            ->with('success', "Clearance request {$referenceNumber} deleted successfully!");
    }
    
    /**
     * Print clearance
     */
    public function print(ClearanceRequest $clearance)
    {
        $clearance->load(['resident', 'clearanceType']);
        
        return Inertia::render('admin/clearances/Print', [
            'clearance' => [
                ...$clearance->toArray(),
                'formatted_fee' => $clearance->formatted_fee,
                'status_display' => $clearance->status_display,
                'urgency_display' => $clearance->urgency_display,
            ],
        ]);
    }
    
    /**
     * Mark request as processing
     */
    public function markAsProcessing(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->isPending() && !$clearance->isProcessing()) {
            return redirect()->back()
                ->with('error', 'Only pending requests can be marked as processing.');
        }
        
        $clearance->markAsProcessing();
        
        return redirect()->back()
            ->with('success', 'Clearance request marked as processing!');
    }
    
    /**
     * Approve clearance request
     */
    public function approve(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->canBeProcessed()) {
            return redirect()->back()
                ->with('error', 'Request cannot be approved at this stage.');
        }
        
        $validator = Validator::make($request->all(), [
            'issuing_officer' => 'required|string|max:200',
            'valid_until' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        $clearance->approve(
            $request->issuing_officer,
            $request->valid_until
        );
        
        return redirect()->back()
            ->with('success', 'Clearance request approved successfully!');
    }
    
    /**
     * Issue clearance (final step)
     */
    public function issue(Request $request, ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved requests can be issued.');
        }
        
        $clearance->issue($request->issuing_officer);
        
        return redirect()->back()
            ->with('success', 'Clearance issued successfully! Clearance number: ' . $clearance->clearance_number);
    }
    
    /**
     * Reject clearance request
     */
    public function reject(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->canBeProcessed()) {
            return redirect()->back()
                ->with('error', 'Request cannot be rejected at this stage.');
        }
        
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);
        
        $clearance->reject($request->rejection_reason);
        
        return redirect()->back()
            ->with('success', 'Clearance request rejected successfully!');
    }
    
    /**
     * Cancel clearance request
     */
    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        try {
            $clearance->cancel($request->cancellation_reason, false); // false = cancelled by admin
            return redirect()->back()
                ->with('success', 'Clearance request cancelled successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
    
    /**
     * Mark as pending payment
     */
    public function markAsPendingPayment(Request $request, ClearanceRequest $clearance)
    {
        $clearance->markAsPendingPayment();
        
        return redirect()->back()
            ->with('success', 'Clearance request marked as pending payment!');
    }
    
    /**
     * Bulk actions on clearance requests
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,mark_processing,mark_payment,delete,export',
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);
        
        $clearances = ClearanceRequest::whereIn('id', $request->ids)->get();
        
        switch ($request->action) {
            case 'approve':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->canBeProcessed()) {
                        $clearance->approve(auth()->user()->name);
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) approved successfully.";
                break;
                
            case 'reject':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->canBeProcessed()) {
                        $clearance->reject('Bulk rejected by administrator', auth()->id());
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) rejected successfully.";
                break;
                
            case 'mark_processing':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->isPending() || $clearance->isProcessing()) {
                        $clearance->markAsProcessing(auth()->id());
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) marked as processing.";
                break;
                
            case 'mark_payment':
                $count = $clearances->whereIn('status', ['pending', 'processing'])->count();
                ClearanceRequest::whereIn('id', $request->ids)
                    ->whereIn('status', ['pending', 'processing'])
                    ->update(['status' => 'pending_payment']);
                $message = "{$count} clearance request(s) marked as pending payment.";
                break;
                
            case 'delete':
                $count = $clearances->count();
                ClearanceRequest::whereIn('id', $request->ids)->delete();
                $message = "{$count} clearance request(s) deleted successfully.";
                break;
                
            case 'export':
                return $this->export($request);
        }
        
        return redirect()->back()->with('success', $message);
    }
    
    /**
     * API endpoint for clearance statistics
     */
    public function stats()
    {
        return response()->json($this->getClearanceStats());
    }
    
    /**
     * Get clearance types API
     */
    public function types()
    {
        $types = ClearanceType::where('is_active', true)
            ->withCount(['clearanceRequests' => function ($query) {
                $query->where('status', 'issued');
            }])
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'count' => $type->clearance_requests_count,
                    'fee' => $type->formatted_fee,
                ];
            });
        
        return response()->json($types);
    }
    
    /**
     * Export clearances to CSV/Excel
     */
    public function export(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['resident', 'clearanceType'])
            ->latest();
        
        // Apply filters if any
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('clearance_type_id', $request->input('type'));
        }
        
        $clearances = $query->get();
        
        // CSV headers
        $headers = [
            'Reference Number',
            'Clearance Number',
            'Resident Name',
            'Clearance Type',
            'Purpose',
            'Urgency',
            'Status',
            'Issue Date',
            'Valid Until',
            'Fee Amount',
            'Issuing Officer',
            'Requested Date',
            'Needed Date',
            'Remarks',
        ];
        
        // CSV content
        $csvContent = implode(',', $headers) . "\n";
        
        foreach ($clearances as $clearance) {
            $row = [
                $clearance->reference_number,
                $clearance->clearance_number ?? 'N/A',
                $clearance->resident ? $clearance->resident->full_name : 'N/A',
                $clearance->clearanceType ? $clearance->clearanceType->name : 'N/A',
                $clearance->purpose,
                $clearance->urgency_display,
                $clearance->status_display,
                $clearance->issue_date ? $clearance->issue_date->format('Y-m-d') : 'N/A',
                $clearance->valid_until ? $clearance->valid_until->format('Y-m-d') : 'N/A',
                $clearance->fee_amount,
                $clearance->issuing_officer ?? 'N/A',
                $clearance->created_at->format('Y-m-d H:i:s'),
                $clearance->needed_date ? $clearance->needed_date->format('Y-m-d') : 'N/A',
                str_replace(',', ';', $clearance->remarks ?? ''),
            ];
            
            $csvContent .= implode(',', $row) . "\n";
        }
        
        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="clearance_requests_' . date('Y-m-d') . '.csv"');
    }
    
    /**
     * Show documents for a clearance request
     */
    public function documents(ClearanceRequest $clearance)
    {
        $clearance->load(['documents.documentType']);
        
        return Inertia::render('admin/clearances/Documents', [
            'clearance' => $clearance,
            'documents' => $clearance->documents,
        ]);
    }
    
    /**
     * Get clearance requests that need attention (dashboard widget)
     */
    public function getAttentionNeeded()
    {
        $pending = ClearanceRequest::pending()
            ->with(['resident', 'clearanceType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        $expiring = ClearanceRequest::where('status', 'issued')
            ->where('valid_until', '<=', now()->addDays(7))
            ->with(['resident', 'clearanceType'])
            ->orderBy('valid_until', 'asc')
            ->limit(10)
            ->get();
        
        return response()->json([
            'pending' => $pending,
            'expiring' => $expiring,
        ]);
    }
}