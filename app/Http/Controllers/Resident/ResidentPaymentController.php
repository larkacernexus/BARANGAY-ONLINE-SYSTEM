<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
    
    private function formatPaymentForFrontend(Payment $payment)
    {
        // Get payer details based on payer_type
        $payerDetails = [];
        
        if ($payment->payer_type === 'resident' && $payment->resident) {
            $payerDetails = [
                'name' => $payment->resident->full_name ?? $payment->resident->name ?? 'N/A',
                'contact_number' => $payment->resident->contact_number ?? 'N/A',
                'address' => $payment->resident->address ?? 'N/A',
                'household_number' => $payment->resident->household_number ?? 'N/A',
                'purok' => $payment->resident->purok ?? 'N/A',
            ];
        } elseif ($payment->payer_type === 'household' && $payment->household) {
            $payerDetails = [
                'name' => $payment->household->head_of_family ?? $payment->household->name ?? 'N/A',
                'contact_number' => $payment->household->contact_number ?? 'N/A',
                'address' => $payment->household->address ?? 'N/A',
                'household_number' => $payment->household->household_number ?? 'N/A',
                'purok' => $payment->household->purok->name ?? 'N/A',
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
        $paymentMethodDisplay = ucfirst($payment->payment_method ?? 'Unknown');
        if ($payment->payment_method === 'gcash') {
            $paymentMethodDisplay = 'GCash';
        } elseif ($payment->payment_method === 'maya') {
            $paymentMethodDisplay = 'Maya';
        }
        
        // Get collection type display name
        $collectionTypeDisplay = ucfirst($payment->collection_type ?? 'regular');
        
        // Format amounts
        $formatAmount = function($amount) {
            return number_format($amount, 2);
        };
        
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
            'payment_date' => $payment->payment_date ? $payment->payment_date->toDateString() : null,
            'due_date' => $payment->due_date ? $payment->due_date->toDateString() : null,
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
            'formatted_total' => '₱' . $formatAmount($payment->total_amount),
            'formatted_date' => $payment->payment_date ? $payment->payment_date->format('M d, Y') : 'N/A',
            'formatted_subtotal' => '₱' . $formatAmount($payment->subtotal),
            'formatted_surcharge' => '₱' . $formatAmount($payment->surcharge),
            'formatted_penalty' => '₱' . $formatAmount($payment->penalty),
            'formatted_discount' => '₱' . $formatAmount($payment->discount),
            'payer_details' => $payerDetails,
            'items' => $payment->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name ?? $item->fee_name ?? 'N/A',
                    'description' => $item->description ?? 'N/A',
                    'quantity' => (int) ($item->quantity ?? 1),
                    'unit_price' => (float) ($item->unit_price ?? $item->base_amount ?? 0),
                    'total' => (float) ($item->total ?? $item->total_amount ?? 0),
                ];
            })->toArray(),
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
                $displayNames = [
                    'cash' => 'Cash',
                    'gcash' => 'GCash',
                    'maya' => 'Maya',
                    'bank' => 'Bank Transfer',
                    'check' => 'Check',
                    'online' => 'Online Payment',
                ];
                return [
                    'value' => $method,
                    'label' => $displayNames[$method] ?? ucfirst($method)
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
        
        return Inertia::render('Resident/Payments/Pay', [
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
            ]);
        }
        
        return redirect()->route('resident.payments.show', $payment)
            ->with('success', 'Payment request created successfully. Please complete the payment process.');
    }
    
    public function show(Payment $payment)
    {
        $user = auth()->user();
        $household = $user->household_id ? Household::find($user->household_id) : null;
        
        if (!$household) {
            abort(403, 'You are not authorized to view this payment.');
        }
        
        // Check if payment belongs to this household or its residents
        $authorized = false;
        
        if ($payment->payer_type === 'household' && $payment->payer_id === $household->id) {
            $authorized = true;
        } elseif ($payment->payer_type === 'resident') {
            $resident = Resident::where('id', $payment->payer_id)
                ->where('household_id', $household->id)
                ->exists();
            $authorized = $resident;
        }
        
        if (!$authorized) {
            abort(403, 'You are not authorized to view this payment.');
        }
        
        $payment->load(['items', 'resident', 'household']);
        
        // Format payment for frontend
        $formattedPayment = $this->formatPaymentForFrontend($payment);
        
        // Determine if payment can be paid online
        $canPayOnline = in_array($payment->payment_method, ['gcash', 'maya', 'online', 'bank']) 
            && $payment->status === 'pending';
        
        return Inertia::render('Resident/Payments/Show', [
            'payment' => $formattedPayment,
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
        
        $payment->update([
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'method_details' => array_merge($payment->method_details ?? [], [
                'reference' => $validated['reference_number'] ?? null,
                'method_updated_at' => now()->toISOString(),
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
        
        $payment->update([
            'status' => 'cancelled',
            'remarks' => $request->input('reason', 'Cancelled by household head') . '. ' . ($payment->remarks ?? ''),
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
        
        $formattedPayment = $this->formatPaymentForFrontend($payment);
        
        return Inertia::render('Resident/Payments/Receipt', [
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
        
        $paymentLink = '#';
        
        $qrCode = 'data:image/svg+xml;base64,' . base64_encode('
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#fff"/>
                <text x="100" y="100" text-anchor="middle">Payment QR Code</text>
            </svg>
        ');
        
        return response()->json([
            'success' => true,
            'payment_link' => $paymentLink,
            'qr_code' => $qrCode,
            'instructions' => [
                'gcash' => 'Send payment to GCash number: 0917-XXX-XXXX',
                'maya' => 'Send payment to Maya number: 0917-XXX-XXXX',
                'bank' => 'Bank: BPI, Account: 1234-5678-90',
            ][$payment->payment_method] ?? 'Please proceed with your selected payment method.',
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