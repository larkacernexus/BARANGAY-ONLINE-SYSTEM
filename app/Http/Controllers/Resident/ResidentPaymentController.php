<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class ResidentPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get the household associated with the authenticated user from household_id field
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            return Inertia::render('resident/Payments/Index', [
                'payments' => $this->emptyPagination(),
                'stats' => $this->emptyStats(),
                'paymentMethods' => [],
                'hasProfile' => false,
                'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'payment_method']),
                'error' => 'Your account is not associated with any household. Please contact the barangay administrator.'
            ]);
        }
        
        // Get all residents belonging to this household
        $residents = Resident::where('household_id', $household->id)->get();
        
        if ($residents->isEmpty()) {
            return Inertia::render('resident/Payments/Index', [
                'payments' => $this->emptyPagination(),
                'stats' => $this->emptyStats(),
                'paymentMethods' => [],
                'hasProfile' => false,
                'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'payment_method']),
                'error' => 'No residents found in your household. Please contact the barangay administrator.'
            ]);
        }
        
        // Get resident IDs for querying payments
        $residentIds = $residents->pluck('id');
        
        // Start building query - include payments for ALL residents in the household AND the household itself
        $query = Payment::where(function($query) use ($residentIds, $household) {
                // Payments for individual residents in the household
                $query->where(function($q) use ($residentIds) {
                    $q->where('payer_type', 'resident')
                      ->whereIn('payer_id', $residentIds);
                });
                
                // Payments for the household itself
                $query->orWhere(function($q) use ($household) {
                    $q->where('payer_type', 'household')
                      ->where('payer_id', $household->id);
                });
            })
            ->with(['resident', 'household', 'items']);
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply payment method filter
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }
        
        // Apply date filter
        if ($request->filled('start_date')) {
            $query->whereDate('payment_date', '>=', $request->start_date);
        }
        
        if ($request->filled('end_date')) {
            $query->whereDate('payment_date', '<=', $request->end_date);
        }
        
        // Apply export logic
        if ($request->has('export')) {
            return $this->exportPayments($query->get());
        }
        
       // Get paginated results with formatted data
        $payments = $query->latest('payment_date')
            ->paginate(10)
            ->through(function ($payment) use ($residents, $household, $user) {
                $formatted = $this->formatPaymentForFrontend($payment);
                
                // Add context about who paid
                if ($payment->payer_type === 'resident') {
                    $resident = $residents->firstWhere('id', $payment->payer_id);
                    $formatted['paid_by'] = 'resident';
                    $formatted['resident_name'] = $resident ? $resident->full_name : 'Unknown Resident';
                    $formatted['relationship'] = 'Personal Payment';
                    // Check if the current user's resident is the payer
                    $formatted['is_self'] = $user->current_resident_id == $payment->payer_id;
                } else {
                    // Household payment
                    $formatted['paid_by'] = 'household';
                    $formatted['relationship'] = 'Household Payment';
                    $formatted['is_self'] = true; // Head manages household payments
                }
                
                return $formatted;
            });
        
        // Calculate statistics
        $stats = $this->calculateStats($residentIds, $household);
        
        // Get payment methods used
        $paymentMethods = $this->getPaymentMethods($residentIds, $household);
        
        // Get the head resident (for display)
        $headResident = $this->getHeadResident($household);
        
        return Inertia::render('resident/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'paymentMethods' => $paymentMethods,
            'hasProfile' => true,
            'householdResidents' => $residents,
            'currentResident' => $headResident ?? $residents->first(),
            'household' => $household,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'payment_method']),
        ]);
    }
    
    /**
     * Display the specified payment with all details
     */
   public function show(Payment $payment)
{
    $user = auth()->user();
    $household = $user->household_id ? Household::find($user->household_id) : null;
    
    if (!$household) {
        abort(403, 'You are not authorized to view this payment.');
    }
    
    // Check if payment belongs to this household or its residents
    $authorized = $this->checkPaymentAuthorization($payment, $household);
    
    if (!$authorized) {
        abort(403, 'You are not authorized to view this payment.');
    }
    
    // Load relationships - FIXED: Remove 'audit_log' and load 'activities' instead
    $payment->load([
        'items', 
        'resident', 
        'household',
        'discounts.rule',
        'discounts.verifier',
        'recorder'
    ]);
    
    // Load activities for audit log using Spatie Activitylog
    // The activities are stored in the 'activity_log' table with 'log_name' = 'payments'
    $activities = \Spatie\Activitylog\Models\Activity::where('subject_type', Payment::class)
        ->where('subject_id', $payment->id)
        ->orWhere(function($query) use ($payment) {
            $query->where('log_name', 'payments')
                  ->where('subject_id', $payment->id);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    
    // Get related payments (same payer)
    $relatedPayments = Payment::where(function($query) use ($payment) {
            $query->where('payer_type', $payment->payer_type)
                  ->where('payer_id', $payment->payer_id);
        })
        ->where('id', '!=', $payment->id)
        ->latest('payment_date')
        ->limit(5)
        ->get();
        
    $payment->setRelation('related_payments', $relatedPayments);
    
    // Format payment for frontend
    $formattedPayment = $this->formatPaymentForFrontend($payment, $activities);
    
    // Determine permissions
    $canEdit = $payment->status === 'pending';
    $canDelete = $payment->status === 'pending';
    $canPrint = in_array($payment->status, ['completed', 'paid']);
    $canDownload = in_array($payment->status, ['completed', 'paid']);
    $canVerify = false; // Residents cannot verify payments
    $canRefund = false; // Residents cannot refund payments
    $canAddNote = false; // Disabled since notes relationship doesn't exist
    $canUploadAttachment = false; // Disabled
    
    // Determine if payment can be paid online
    $canPayOnline = in_array($payment->payment_method, ['gcash', 'maya', 'online', 'bank']) 
        && $payment->status === 'pending';
    
    return Inertia::render('resident/Payments/Show', [
        'payment' => $formattedPayment,
        'canEdit' => $canEdit,
        'canDelete' => $canDelete,
        'canPrint' => $canPrint,
        'canDownload' => $canDownload,
        'canVerify' => $canVerify,
        'canRefund' => $canRefund,
        'canAddNote' => $canAddNote,
        'canUploadAttachment' => $canUploadAttachment,
        'canPayOnline' => $canPayOnline,
        'paymentMethods' => [
            'cash' => 'Cash',
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank' => 'Bank Transfer',
            'check' => 'Check',
            'online' => 'Online Payment',
        ],
    ]);
}

    /**
     * Generate and download PDF receipt
     */
    public function downloadReceipt(Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            abort(403, 'You are not authorized to download this receipt.');
        }
        
        // Check if payment is completed or paid
        if (!in_array($payment->status, ['completed', 'paid'])) {
            return back()->with('error', 'Receipt is only available for completed payments.');
        }
        
        // Load relationships
        $payment->load(['items', 'resident', 'household']);
        
        // Format data for receipt
        $receiptData = $this->generateReceiptData($payment);
        
        // Generate PDF
        $pdf = Pdf::loadView('pdfs.payment-receipt', [
            'receipt' => $receiptData,
            'payment' => $payment,
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'contact' => '(072) 123-4567',
                'email' => 'info@barangay.gov.ph',
                'logo' => public_path('images/barangay-logo.png'),
            ]
        ]);
        
        // Set paper size and orientation
        $pdf->setPaper('A4', 'portrait');
        
        // Download PDF
        return $pdf->download('receipt-' . $payment->or_number . '.pdf');
    }
    
    /**
     * Generate and stream PDF receipt for viewing
     */
    public function viewReceipt(Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            abort(403, 'You are not authorized to view this receipt.');
        }
        
        // Check if payment is completed or paid
        if (!in_array($payment->status, ['completed', 'paid'])) {
            return back()->with('error', 'Receipt is only available for completed payments.');
        }
        
        // Load relationships
        $payment->load(['items', 'resident', 'household']);
        
        // Format data for receipt
        $receiptData = $this->generateReceiptData($payment);
        
        // Generate PDF
        $pdf = Pdf::loadView('pdfs.payment-receipt', [
            'receipt' => $receiptData,
            'payment' => $payment,
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'contact' => '(072) 123-4567',
                'email' => 'info@barangay.gov.ph',
                'logo' => public_path('images/barangay-logo.png'),
            ]
        ]);
        
        // Set paper size and orientation
        $pdf->setPaper('A4', 'portrait');
        
        // Stream PDF in browser
        return $pdf->stream('receipt-' . $payment->or_number . '.pdf');
    }
    
    /**
     * Save receipt to user's downloads/records
     */
    public function saveReceipt(Request $request, Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }
        
        // Validate request
        $validated = $request->validate([
            'receipt_number' => 'required|string',
            'or_number' => 'required|string',
            'receipt_type' => 'required|string',
            'payer_name' => 'required|string',
            'payer_address' => 'nullable|string',
            'subtotal' => 'required|numeric',
            'surcharge' => 'required|numeric',
            'penalty' => 'required|numeric',
            'discount' => 'required|numeric',
            'total_amount' => 'required|numeric',
            'amount_paid' => 'required|numeric',
            'change_due' => 'required|numeric',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'payment_date' => 'required|string',
            'issued_date' => 'required|string',
            'issued_by' => 'required|string',
            'fee_breakdown' => 'required|array',
            'notes' => 'nullable|string',
        ]);
        
        // Generate PDF and save to storage
        $pdf = Pdf::loadView('pdfs.payment-receipt', [
            'receipt' => $validated,
            'payment' => $payment,
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'contact' => '(072) 123-4567',
                'email' => 'info@barangay.gov.ph',
            ]
        ]);
        
        $filename = 'receipts/' . $payment->or_number . '_' . time() . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());
        
        // Update payment with receipt path (make sure this column exists)
        $payment->update([
            'receipt_path' => $filename,
            'receipt_generated_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Receipt saved successfully!',
            'receipt_url' => Storage::url($filename),
        ]);
    }
    
    /**
     * Generate receipt data from payment
     */
    private function generateReceiptData(Payment $payment)
    {
        $subtotal = (float) $payment->subtotal;
        $surcharge = (float) $payment->surcharge;
        $penalty = (float) $payment->penalty;
        $discount = (float) $payment->discount;
        $totalAmount = (float) $payment->total_amount;
        $amountPaid = in_array($payment->status, ['completed', 'paid']) ? $totalAmount : 0;
        $changeDue = $amountPaid - $totalAmount;
        
        // Generate fee breakdown from payment items
        $feeBreakdown = $payment->items->map(function ($item) {
            return [
                'fee_name' => $item->fee_name ?? $item->item_name ?? 'Payment Item',
                'fee_code' => $item->fee_code ?? null,
                'base_amount' => (float) ($item->base_amount ?? $item->unit_price ?? 0),
                'total_amount' => (float) ($item->total_amount ?? $item->total ?? 0),
            ];
        })->toArray();
        
        // If no items, create a single item from the payment purpose
        if (empty($feeBreakdown)) {
            $feeBreakdown[] = [
                'fee_name' => $payment->purpose ?? 'Payment',
                'fee_code' => $payment->certificate_type,
                'base_amount' => $subtotal,
                'total_amount' => $subtotal,
            ];
        }
        
        // Get payer details
        $payerName = $payment->payer_name;
        $payerAddress = $payment->address;
        
        if ($payment->payer_type === 'resident' && $payment->resident) {
            $payerName = $payment->resident->full_name ?? $payment->resident->name ?? $payerName;
            $payerAddress = $payment->resident->address ?? $payerAddress;
        } elseif ($payment->payer_type === 'household' && $payment->household) {
            $payerName = $payment->household->head_of_family ?? $payment->household->name ?? $payerName;
            $payerAddress = $payment->household->address ?? $payerAddress;
        }
        
        return [
            'id' => $payment->id,
            'receipt_number' => 'RCP-' . $payment->or_number . '-' . now()->format('Y'),
            'or_number' => $payment->or_number,
            'receipt_type' => $payment->collection_type ?? 'payment',
            'receipt_type_label' => $this->getReceiptTypeLabel($payment->collection_type),
            'payer_name' => $payerName,
            'payer_address' => $payerAddress,
            'subtotal' => $subtotal,
            'surcharge' => $surcharge,
            'penalty' => $penalty,
            'discount' => $discount,
            'total_amount' => $totalAmount,
            'amount_paid' => $amountPaid,
            'change_due' => $changeDue,
            'formatted_subtotal' => '₱' . number_format($subtotal, 2),
            'formatted_surcharge' => '₱' . number_format($surcharge, 2),
            'formatted_penalty' => '₱' . number_format($penalty, 2),
            'formatted_discount' => '₱' . number_format($discount, 2),
            'formatted_total' => '₱' . number_format($totalAmount, 2),
            'formatted_amount_paid' => '₱' . number_format($amountPaid, 2),
            'formatted_change' => '₱' . number_format($changeDue, 2),
            'payment_method' => $payment->payment_method,
            'payment_method_label' => $this->getPaymentMethodLabel($payment->payment_method),
            'reference_number' => $payment->reference_number,
            'formatted_payment_date' => $payment->payment_date ? $payment->payment_date->format('F d, Y h:i A') : now()->format('F d, Y h:i A'),
            'formatted_issued_date' => now()->format('F d, Y h:i A'),
            'issued_by' => auth()->user()->name ?? 'System',
            'fee_breakdown' => $feeBreakdown,
            'notes' => $payment->remarks ?? null,
            'payment_id' => $payment->id,
        ];
    }
    
    /**
     * Get receipt type label
     */
    private function getReceiptTypeLabel($type)
    {
        $labels = [
            'regular' => 'OFFICIAL RECEIPT',
            'clearance' => 'CLEARANCE RECEIPT',
            'certificate' => 'CERTIFICATE RECEIPT',
            'business' => 'BUSINESS PERMIT RECEIPT',
            'online' => 'ONLINE PAYMENT RECEIPT',
        ];
        
        return $labels[$type] ?? 'OFFICIAL RECEIPT';
    }
    
    /**
     * Get payment method label
     */
    private function getPaymentMethodLabel($method)
    {
        $labels = [
            'cash' => 'Cash',
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank' => 'Bank Transfer',
            'check' => 'Check',
            'online' => 'Online Payment',
            'card' => 'Credit/Debit Card',
        ];
        
        return $labels[$method] ?? ucfirst($method);
    }
    
    public function create()
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account is not associated with any household.');
        }
        
        // Get all residents in the household
        $residents = Resident::where('household_id', $household->id)->get();
        
        if ($residents->isEmpty()) {
            return redirect()->route('dashboard')
                ->with('error', 'No residents found in your household.');
        }
        
        // Get available payment types
        $paymentTypes = PaymentType::where('is_active', true)->get();
        
        $certificateTypes = [
            'residency' => 'Certificate of Residency',
            'indigency' => 'Certificate of Indigency',
            'clearance' => 'Barangay Clearance',
            'cedula' => 'Cedula',
            'business' => 'Business Permit',
        ];
        
        // Get head resident
        $headResident = $this->getHeadResident($household);
        
        return Inertia::render('resident/Payments/Pay', [
            'paymentTypes' => $paymentTypes,
            'certificateTypes' => $certificateTypes,
            'household' => $household,
            'householdResidents' => $residents,
            'currentResident' => $headResident ?? $residents->first(),
            'payerTypes' => [
                ['value' => 'resident', 'label' => 'Individual Resident'],
                ['value' => 'household', 'label' => 'Entire Household'],
            ],
        ]);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            return back()->with('error', 'Your account is not associated with any household.');
        }
        
        $validated = $request->validate([
            'payer_type' => 'required|in:resident,household',
            'payer_id' => 'required',
            'payment_type_id' => 'nullable|exists:payment_types,id',
            'certificate_type' => 'nullable|string|in:residency,indigency,clearance,cedula,business,other',
            'purpose' => 'required|string|max:500',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks' => 'nullable|string|max:500',
            'period_covered' => 'nullable|string|max:255',
        ]);
        
        // Validate payer_id based on payer_type
        if ($validated['payer_type'] === 'resident') {
            $resident = Resident::where('id', $validated['payer_id'])
                ->where('household_id', $household->id)
                ->first();
            
            if (!$resident) {
                return back()->with('error', 'Selected resident is not in your household.');
            }
            
            $payerName = $resident->full_name;
            $contactNumber = $resident->contact_number;
            $address = $resident->address;
            $householdNumber = $resident->household_number;
            $purok = $resident->purok;
            
        } else {
            // Payer is household
            if ($validated['payer_id'] != $household->id) {
                return back()->with('error', 'Invalid household selected.');
            }
            
            $payerName = $household->head_of_family ?? $household->name ?? 'Household #' . $household->household_number;
            $contactNumber = $household->contact_number;
            $address = $household->address;
            $householdNumber = $household->household_number;
            $purok = $household->purok->name ?? 'N/A';
        }
        
        // Calculate subtotal (base amount)
        $subtotal = $validated['amount'];
        $surcharge = 0;
        $penalty = 0;
        $discount = 0;
        $totalAmount = $subtotal;
        
        // Generate OR number
        $orNumber = 'OR-' . date('Ymd') . '-' . str_pad(Payment::count() + 1, 4, '0', STR_PAD_LEFT);
        
        // Create payment record
        $payment = Payment::create([
            'or_number' => $orNumber,
            'payer_type' => $validated['payer_type'],
            'payer_id' => $validated['payer_id'],
            'payer_name' => $payerName,
            'contact_number' => $contactNumber,
            'address' => $address,
            'household_number' => $householdNumber,
            'purok' => $purok,
            'payment_date' => now(),
            'period_covered' => $validated['period_covered'] ?? null,
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'subtotal' => $subtotal,
            'surcharge' => $surcharge,
            'penalty' => $penalty,
            'discount' => $discount,
            'total_amount' => $totalAmount,
            'purpose' => $validated['purpose'],
            'certificate_type' => $validated['certificate_type'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
            'is_cleared' => false,
            'collection_type' => 'online',
            'status' => 'pending',
            'method_details' => [
                'reference' => $validated['reference_number'] ?? null,
                'method' => $validated['payment_method'],
                'timestamp' => now()->toISOString(),
            ],
            'recorded_by' => auth()->id(),
        ]);
        
        // Add payment item if payment_type_id is provided
        if (isset($validated['payment_type_id'])) {
            $paymentType = PaymentType::find($validated['payment_type_id']);
            
            $payment->items()->create([
                'item_type' => 'fee',
                'item_name' => $paymentType->name,
                'description' => $paymentType->description ?? null,
                'quantity' => 1,
                'unit_price' => $subtotal,
                'total' => $subtotal,
                'fee_code' => $paymentType->code ?? null,
                'fee_name' => $paymentType->name,
            ]);
        }
        
        return redirect()->route('resident.payments.show', $payment)
            ->with('success', 'Payment request created successfully. Please complete the payment process.');
    }
    
    public function updatePaymentMethod(Request $request, Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            abort(403, 'You are not authorized to update this payment.');
        }
        
        // Check if payment is still pending
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Cannot update payment method. Payment is already ' . $payment->status . '.');
        }
        
        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
        ]);
        
        $oldMethod = $payment->payment_method;
        
        $payment->update([
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'method_details' => array_merge($payment->method_details ?? [], [
                'reference' => $validated['reference_number'] ?? null,
                'method_updated_at' => now()->toISOString(),
                'old_method' => $oldMethod,
            ])
        ]);
        
        return back()->with('success', 'Payment method updated successfully.');
    }
    
    public function cancel(Request $request, Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            abort(403, 'You are not authorized to cancel this payment.');
        }
        
        // Check if payment can be cancelled
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Cannot cancel payment. Payment is already ' . $payment->status . '.');
        }
        
        $reason = $request->input('reason', 'Cancelled by household head');
        
        $payment->update([
            'status' => 'cancelled',
            'remarks' => $reason . '. ' . ($payment->remarks ?? ''),
        ]);
        
        return redirect()->route('resident.payments.index')
            ->with('success', 'Payment has been cancelled.');
    }
    
    public function receipt(Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            abort(403, 'You are not authorized to view this receipt.');
        }
        
        if ($payment->status !== 'completed') {
            return back()->with('error', 'Receipt is only available for completed payments.');
        }
        
        $payment->load(['items', 'resident', 'household']);
        $formattedPayment = $this->formatPaymentForFrontend($payment);
        
        return Inertia::render('resident/Payments/Receipt', [
            'payment' => $formattedPayment,
        ]);
    }
    
    public function verify(Request $request, Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }
        
        $request->validate([
            'transaction_id' => 'required|string|max:100',
            'payment_proof' => 'nullable|image|max:2048',
        ]);
        
        $payment->update([
            'status' => 'completed',
            'is_cleared' => true,
            'reference_number' => $request->transaction_id,
            'method_details' => array_merge($payment->method_details ?? [], [
                'transaction_id' => $request->transaction_id,
                'verified_at' => now()->toISOString(),
                'verified_by' => 'auto_system',
            ])
        ]);
        
        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment-proofs', 'public');
            $payment->update([
                'method_details' => array_merge($payment->method_details ?? [], [
                    'proof_path' => $path,
                    'proof_uploaded_at' => now()->toISOString(),
                ])
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully!',
            'payment' => $this->formatPaymentForFrontend($payment->fresh()),
        ]);
    }
    
    public function getPaymentLink(Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        // Check authorization
        $authorized = $this->checkPaymentAuthorization($payment, $household);
        
        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.',
            ], 403);
        }
        
        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Payment is already ' . $payment->status,
            ]);
        }
        
        // Generate payment link based on method
        $paymentLink = '#';
        $instructions = '';
        
        switch ($payment->payment_method) {
            case 'gcash':
                $paymentLink = 'https://gcash.com/pay/' . $payment->or_number;
                $instructions = 'Open GCash app and scan the QR code or send payment to GCash number: 0917-123-4567';
                break;
            case 'maya':
                $paymentLink = 'https://maya.ph/pay/' . $payment->or_number;
                $instructions = 'Open Maya app and scan the QR code or send payment to Maya number: 0917-123-4567';
                break;
            case 'bank':
                $paymentLink = '#';
                $instructions = 'Bank: BPI, Account Name: Barangay San Vicente, Account Number: 1234-5678-90';
                break;
            default:
                $instructions = 'Please proceed with your selected payment method.';
        }
        
        // Generate QR code (simplified - in production use a proper QR code library)
        $qrCode = 'data:image/svg+xml;base64,' . base64_encode('
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#fff"/>
                <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
                    Payment QR Code
                </text>
                <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10">
                    OR #' . $payment->or_number . '
                </text>
            </svg>
        ');
        
        return response()->json([
            'success' => true,
            'payment_link' => $paymentLink,
            'qr_code' => $qrCode,
            'instructions' => $instructions,
        ]);
    }
    
    /**
     * Format payment for frontend
     */
   private function formatPaymentForFrontend(Payment $payment, $activities = null)
{
    // Get payer details based on payer_type
    $payerDetails = [];
    
    if ($payment->payer_type === 'resident' && $payment->resident) {
        // Get active privileges
        $activePrivileges = $payment->resident->residentPrivileges
            ?->filter(function ($rp) {
                return $rp->isActive();
            })
            ->map(function ($rp) {
                $privilege = $rp->privilege;
                $discountType = $privilege?->discountType;
                return [
                    'code' => $privilege?->code,
                    'name' => $privilege?->name,
                    'id_number' => $rp->id_number,
                    'discount_percentage' => $discountType?->percentage ?? 0,
                ];
            })
            ->values()
            ->toArray() ?? [];

        // DYNAMIC privilege flags
        $privilegeFlags = [];
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"] = true;
        }

        $payerDetails = array_merge([
            'id' => $payment->resident->id,
            'name' => $payment->resident->full_name ?? $payment->resident->name ?? 'Unknown',
            'first_name' => $payment->resident->first_name,
            'last_name' => $payment->resident->last_name,
            'middle_name' => $payment->resident->middle_name,
            'suffix' => $payment->resident->suffix,
            'contact_number' => $payment->resident->contact_number,
            'email' => $payment->resident->email,
            'address' => $payment->resident->address,
            'household_number' => $payment->resident->household_number,
            'purok' => $payment->resident->purok,
            'profile_photo' => $payment->resident->profile_photo,
            'privileges' => $activePrivileges,
            'privileges_count' => count($activePrivileges),
            'has_privileges' => count($activePrivileges) > 0,
        ], $privilegeFlags);
    } elseif ($payment->payer_type === 'household' && $payment->household) {
        $payerDetails = [
            'id' => $payment->household->id,
            'name' => $payment->household->head_of_family ?? $payment->household->name ?? 'N/A',
            'contact_number' => $payment->household->contact_number,
            'address' => $payment->household->address,
            'household_number' => $payment->household->household_number,
            'purok' => $payment->household->purok,
        ];
    }
    
    // Get certificate type display name
    $certificateTypeDisplay = null;
    if ($payment->certificate_type) {
        $certificateTypes = [
            'residency' => 'Certificate of Residency',
            'indigency' => 'Certificate of Indigency',
            'clearance' => 'Barangay Clearance',
            'cedula' => 'Cedula',
            'business' => 'Business Permit',
        ];
        $certificateTypeDisplay = $certificateTypes[$payment->certificate_type] ?? ucfirst($payment->certificate_type);
    }
    
    // Get payment method display name
    $paymentMethodDisplay = $this->getPaymentMethodLabel($payment->payment_method);
    
    // Get collection type display name
    $collectionTypeDisplay = $this->getReceiptTypeLabel($payment->collection_type);
    
    // Format amounts
    $formatAmount = function($amount) {
        return '₱' . number_format($amount, 2);
    };
    
    // Format audit log from activities
    $auditLog = [];
    if ($activities && $activities->count() > 0) {
        $auditLog = $activities->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->event ?? 'updated',
                'description' => $log->description,
                'created_at' => $log->created_at?->toISOString(),
                'formatted_date' => $log->created_at ? $log->created_at->format('M d, Y h:i A') : 'N/A',
                'created_by' => $log->causer ? [
                    'id' => $log->causer->id,
                    'name' => $log->causer->name ?? 'System',
                    'role' => $log->causer->role?->name ?? 'System',
                ] : null,
                'metadata' => $log->properties?->toArray() ?? [],
            ];
        })->toArray();
    } else {
        // Create a basic audit log entry if no activities exist
        $auditLog = [
            [
                'id' => 1,
                'action' => 'created',
                'description' => 'Payment was created',
                'created_at' => $payment->created_at?->toISOString(),
                'formatted_date' => $payment->created_at ? $payment->created_at->format('M d, Y h:i A') : 'N/A',
                'created_by' => $payment->recorder ? [
                    'id' => $payment->recorder->id,
                    'name' => $payment->recorder->name ?? 'System',
                    'role' => $payment->recorder->role?->name ?? 'Admin',
                ] : null,
                'metadata' => [],
            ]
        ];
        
        // Add completed status change if payment is completed
        if ($payment->status === 'completed') {
            $auditLog[] = [
                'id' => 2,
                'action' => 'status_changed',
                'description' => 'Payment status changed to completed',
                'created_at' => $payment->updated_at?->toISOString(),
                'formatted_date' => $payment->updated_at ? $payment->updated_at->format('M d, Y h:i A') : 'N/A',
                'created_by' => $payment->recorder ? [
                    'id' => $payment->recorder->id,
                    'name' => $payment->recorder->name ?? 'System',
                    'role' => $payment->recorder->role?->name ?? 'Admin',
                ] : null,
                'metadata' => [],
            ];
        }
    }
    
    // Format notes (if any - using remarks as notes for now)
    $notes = [];
    if ($payment->remarks) {
        $notes[] = [
            'id' => 1,
            'content' => $payment->remarks,
            'is_public' => true,
            'user_name' => $payment->recorder?->name ?? 'System',
            'created_at' => $payment->created_at?->toISOString(),
            'formatted_date' => $payment->created_at ? $payment->created_at->format('M d, Y h:i A') : 'N/A',
        ];
    }
    
    // Format attachments (if any)
    $attachments = [];
    
    // Format items
    $items = $payment->items->map(function ($item) use ($formatAmount) {
        return [
            'id' => $item->id,
            'item_name' => $item->item_name ?? $item->fee_name ?? 'N/A',
            'description' => $item->description,
            'quantity' => (int) ($item->quantity ?? 1),
            'unit_price' => (float) ($item->unit_price ?? $item->base_amount ?? 0),
            'total' => (float) ($item->total ?? $item->total_amount ?? 0),
            'formatted_unit_price' => $formatAmount($item->unit_price ?? $item->base_amount ?? 0),
            'formatted_total' => $formatAmount($item->total ?? $item->total_amount ?? 0),
            'fee_code' => $item->fee_code,
            'fee_name' => $item->fee_name,
            'category' => $item->category,
            'period_covered' => $item->period_covered,
        ];
    })->toArray();
    
    // Format related payments
    $relatedPayments = $payment->related_payments ? $payment->related_payments->map(function ($related) use ($formatAmount) {
        return [
            'id' => $related->id,
            'or_number' => $related->or_number,
            'purpose' => $related->purpose,
            'total_amount' => (float) $related->total_amount,
            'formatted_total' => $formatAmount($related->total_amount),
            'payment_date' => $related->payment_date ? $related->payment_date->toISOString() : null,
            'formatted_date' => $related->payment_date ? $related->payment_date->format('M d, Y') : 'N/A',
            'status' => $related->status,
            'payment_method' => $related->payment_method,
        ];
    })->toArray() : [];
    
    return [
        'id' => $payment->id,
        'or_number' => $payment->or_number,
        'reference_number' => $payment->reference_number,
        'purpose' => $payment->purpose,
        'subtotal' => (float) $payment->subtotal,
        'surcharge' => (float) $payment->surcharge,
        'penalty' => (float) $payment->penalty,
        'discount' => (float) $payment->discount,
        'total_amount' => (float) $payment->total_amount,
        'payment_date' => $payment->payment_date ? $payment->payment_date->toISOString() : null,
        'due_date' => $payment->due_date ? $payment->due_date->toISOString() : null,
        'status' => $payment->status,
        'payment_method' => $payment->payment_method,
        'payment_method_display' => $paymentMethodDisplay,
        'is_cleared' => (bool) $payment->is_cleared,
        'certificate_type' => $payment->certificate_type,
        'certificate_type_display' => $certificateTypeDisplay,
        'collection_type' => $payment->collection_type,
        'collection_type_display' => $collectionTypeDisplay,
        'remarks' => $payment->remarks,
        'payer_type' => $payment->payer_type,
        'payer_id' => $payment->payer_id,
        'formatted_total' => $formatAmount($payment->total_amount),
        'formatted_date' => $payment->payment_date ? $payment->payment_date->format('M d, Y') : 'N/A',
        'formatted_subtotal' => $formatAmount($payment->subtotal),
        'formatted_surcharge' => $formatAmount($payment->surcharge),
        'formatted_penalty' => $formatAmount($payment->penalty),
        'formatted_discount' => $formatAmount($payment->discount),
        'payer_details' => $payerDetails,
        'items' => $items,
        'related_payments' => $relatedPayments,
        'metadata' => $payment->method_details,
        'tags' => $payment->tags ? explode(',', $payment->tags) : [],
        'created_at' => $payment->created_at ? $payment->created_at->toISOString() : null,
        'updated_at' => $payment->updated_at ? $payment->updated_at->toISOString() : null,
        'created_by' => $payment->recorded_by ? [
            'id' => $payment->recorded_by,
            'name' => $payment->recorder?->name ?? 'System',
            'role' => 'system',
        ] : null,
        // Add these for the tabs
        'audit_log' => $auditLog,
        'notes' => $notes,
        'attachments' => $attachments,
        'discounts' => $payment->discounts,
        'discounts_summary' => $payment->discounts_summary,
        'amount_due' => $payment->amount_due,
        'formatted_amount_due' => $formatAmount($payment->amount_due),
        'balance' => $payment->balance,
        'formatted_balance' => $formatAmount($payment->balance),
        'change_due' => $payment->change_due,
        'formatted_change_due' => $formatAmount($payment->change_due),
        'payment_status' => $payment->payment_status,
        'is_fully_paid' => $payment->is_fully_paid,
    ];
}
    
    private function emptyPagination()
    {
        return [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => 0,
            'from' => 0,
            'to' => 0,
        ];
    }
    
    private function emptyStats()
    {
        return [
            'total_payments' => 0,
            'pending_payments' => 0,
            'total_paid' => 0,
            'balance_due' => 0,
        ];
    }
    
    private function calculateStats($residentIds, $household)
    {
        // Combined query for all payments
        $allPayments = Payment::where(function($q) use ($residentIds, $household) {
            $q->where('payer_type', 'resident')
              ->whereIn('payer_id', $residentIds);
            
            $q->orWhere('payer_type', 'household')
              ->where('payer_id', $household->id);
        });
        
        return [
            'total_payments' => $allPayments->count(),
            'total_amount' => $allPayments->sum('total_amount'),
            'resident_payments' => Payment::where('payer_type', 'resident')
                ->whereIn('payer_id', $residentIds)->count(),
            'household_payments' => Payment::where('payer_type', 'household')
                ->where('payer_id', $household->id)->count(),
            'resident_amount' => Payment::where('payer_type', 'resident')
                ->whereIn('payer_id', $residentIds)->sum('total_amount'),
            'household_amount' => Payment::where('payer_type', 'household')
                ->where('payer_id', $household->id)->sum('total_amount'),
            'completed_payments' => $allPayments->where('status', 'completed')->count(),
            'pending_payments' => $allPayments->where('status', 'pending')->count(),
            'cancelled_payments' => $allPayments->where('status', 'cancelled')->count(),
        ];
    }
    
    private function getPaymentMethods($residentIds, $household)
    {
        $query = Payment::where(function($q) use ($residentIds, $household) {
            $q->where('payer_type', 'resident')
              ->whereIn('payer_id', $residentIds);
            
            $q->orWhere('payer_type', 'household')
              ->where('payer_id', $household->id);
        });
        
        return $query->select('payment_method')
            ->distinct()
            ->pluck('payment_method')
            ->filter()
            ->map(function($method) {
                return [
                    'value' => $method,
                    'label' => $this->getPaymentMethodLabel($method)
                ];
            })
            ->values();
    }
    
    private function exportPayments($payments)
    {
        // Export logic here
        return response()->json([
            'message' => 'Export feature not yet implemented'
        ]);
    }
    
    /**
     * Check if the authenticated user is authorized to access this payment
     */
    private function checkPaymentAuthorization(Payment $payment, $household)
    {
        if (!$household) {
            return false;
        }
        
        if ($payment->payer_type === 'household' && $payment->payer_id === $household->id) {
            return true;
        }
        
        if ($payment->payer_type === 'resident') {
            return Resident::where('id', $payment->payer_id)
                ->where('household_id', $household->id)
                ->exists();
        }
        
        return false;
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