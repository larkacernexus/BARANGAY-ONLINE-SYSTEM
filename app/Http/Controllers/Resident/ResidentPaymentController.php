<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResidentPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $resident = $user->resident;
        
        // Check if user has a resident profile
        if (!$resident) {
            return Inertia::render('resident/Payments/Index', [
                'payments' => $this->emptyPagination(),
                'stats' => $this->emptyStats(),
                'paymentMethods' => [],
                'hasProfile' => false,
                'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'payment_method']),
            ]);
        }
        
        // Get the household head's household
        $household = $resident->household;
        
        // Start building query
        $query = Payment::where(function($query) use ($resident, $household) {
                // Payments for the resident
                $query->where('payer_type', 'resident')
                      ->where('payer_id', $resident->id);
                
                // Payments for the household (if household exists)
                if ($household) {
                    $query->orWhere(function($q) use ($household) {
                        $q->where('payer_type', 'household')
                          ->where('payer_id', $household->id);
                    });
                }
            })
            ->with(['resident', 'household', 'items']);
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
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
            // Handle export logic here
            return $this->exportPayments($query->get());
        }
        
        // Get paginated results with formatted data
        $payments = $query->latest('payment_date')
            ->paginate(10)
            ->through(function ($payment) {
                return $this->formatPaymentForFrontend($payment);
            });
        
        // Calculate statistics
        $stats = $this->calculateStats($resident, $household);
        
        // Get payment methods used
        $paymentMethods = $this->getPaymentMethods($resident, $household);
        
        return Inertia::render('resident/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'paymentMethods' => $paymentMethods,
            'hasProfile' => true,
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
                    'item_name' => $item->item_name,
                    'description' => $item->description,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total' => (float) $item->total,
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
    
    private function calculateStats($resident, $household)
    {
        // Get payments for resident
        $residentPayments = Payment::where('payer_type', 'resident')
            ->where('payer_id', $resident->id);
        
        // Get payments for household (if exists)
        $householdPayments = $household ? 
            Payment::where('payer_type', 'household')
                ->where('payer_id', $household->id) : null;
        
        $totalPayments = $residentPayments->count();
        $pendingPayments = $residentPayments->whereIn('status', ['pending', 'overdue'])->count();
        $totalPaid = $residentPayments->where('status', 'completed')->sum('total_amount');
        $balanceDue = $residentPayments->whereIn('status', ['pending', 'overdue'])->sum('total_amount');
        
        // Add household payments if they exist
        if ($householdPayments) {
            $totalPayments += $householdPayments->count();
            $pendingPayments += $householdPayments->whereIn('status', ['pending', 'overdue'])->count();
            $totalPaid += $householdPayments->where('status', 'completed')->sum('total_amount');
            $balanceDue += $householdPayments->whereIn('status', ['pending', 'overdue'])->sum('total_amount');
        }
        
        return [
            'total_payments' => $totalPayments,
            'pending_payments' => $pendingPayments,
            'total_paid' => (float) $totalPaid,
            'balance_due' => (float) $balanceDue,
        ];
    }
    
    private function getPaymentMethods($resident, $household)
    {
        // Get payment methods from resident payments
        $residentMethods = Payment::where('payer_type', 'resident')
            ->where('payer_id', $resident->id)
            ->whereNotNull('payment_method')
            ->select('payment_method')
            ->distinct()
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->payment_method,
                    'display_name' => ucfirst($item->payment_method),
                ];
            });
        
        // Get payment methods from household payments (if household exists)
        $householdMethods = $household ?
            Payment::where('payer_type', 'household')
                ->where('payer_id', $household->id)
                ->whereNotNull('payment_method')
                ->select('payment_method')
                ->distinct()
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->payment_method,
                        'display_name' => ucfirst($item->payment_method),
                    ];
                }) : collect([]);
        
        // Combine and deduplicate
        $allMethods = $residentMethods->concat($householdMethods)
            ->unique('type')
            ->values()
            ->all();
        
        // Format display names properly
        return array_map(function($method) {
            $displayName = $method['display_name'];
            if ($method['type'] === 'gcash') {
                $displayName = 'GCash';
            } elseif ($method['type'] === 'maya') {
                $displayName = 'Maya';
            } elseif ($method['type'] === 'online') {
                $displayName = 'Online Payment';
            }
            
            return [
                'type' => $method['type'],
                'display_name' => $displayName,
            ];
        }, $allMethods);
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
        $resident = auth()->user()->resident;
        
        if (!$resident) {
            return redirect()->route('resident.profile.create')
                ->with('error', 'Please complete your resident profile before making payments.');
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
        
        return Inertia::render('Resident/Payments/Pay', [
            'paymentTypes' => $paymentTypes,
            'certificateTypes' => $certificateTypes,
            'resident' => $resident,
            'residentDetails' => [
                'id' => $resident->id,
                'name' => $resident->full_name ?? $resident->name,
                'address' => $resident->address,
                'contact_number' => $resident->contact_number,
                'household_number' => $resident->household_number,
                'purok' => $resident->purok,
            ],
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_type_id' => 'nullable|exists:payment_types,id',
            'certificate_type' => 'nullable|string|in:residency,indigency,clearance,cedula,business,other',
            'purpose' => 'required|string|max:500',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
            'remarks' => 'nullable|string|max:500',
            'period_covered' => 'nullable|string|max:255',
        ]);
        
        $resident = auth()->user()->residentProfile;
        
        if (!$resident) {
            return back()->with('error', 'Please complete your resident profile first.');
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
            'payer_type' => 'resident',
            'payer_id' => $resident->id,
            'payer_name' => $resident->full_name ?? $resident->name,
            'contact_number' => $resident->contact_number,
            'address' => $resident->address,
            'household_number' => $resident->household_number,
            'purok' => $resident->purok,
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
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
            abort(403, 'You are not authorized to view this payment.');
        }
        
        $payment->load(['items', 'resident']);
        
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
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
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
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
            abort(403, 'You are not authorized to cancel this payment.');
        }
        
        // Check if payment can be cancelled
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Cannot cancel payment. Payment is already ' . $payment->status . '.');
        }
        
        $payment->update([
            'status' => 'cancelled',
            'remarks' => $request->input('reason', 'Cancelled by resident') . '. ' . ($payment->remarks ?? ''),
        ]);
        
        return redirect()->route('resident.payments.index')
            ->with('success', 'Payment has been cancelled.');
    }
    
    public function receipt(Payment $payment)
    {
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
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
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
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
        $resident = auth()->user()->residentProfile;
        
        // Check if payment belongs to authenticated resident
        if ($payment->payer_type !== 'resident' || $payment->payer_id !== $resident->id) {
            abort(403, 'You are not authorized to access this payment.');
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
}