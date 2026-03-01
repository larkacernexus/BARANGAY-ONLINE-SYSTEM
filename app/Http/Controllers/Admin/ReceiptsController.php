<?php
// app/Http/Controllers/Admin/ReceiptsController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReceiptsController extends Controller
{
    /**
     * Display a listing of receipts
     */
    public function index(Request $request)
    {
        // Get filter parameters
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $paymentMethod = $request->input('payment_method', '');
        $receiptType = $request->input('receipt_type', '');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $perPage = $request->input('per_page', 15);
        
        // Build query with eager loading
        $query = Receipt::with(['payment', 'issuer', 'voider'])
            ->latest('issued_date');
        
        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhere('or_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($status) {
            if ($status === 'voided') {
                $query->where('is_voided', true);
            } elseif ($status === 'paid') {
                $query->where('is_voided', false)
                      ->whereRaw('amount_paid >= total_amount - 0.01');
            } elseif ($status === 'partial') {
                $query->where('is_voided', false)
                      ->whereRaw('amount_paid < total_amount - 0.01')
                      ->where('amount_paid', '>', 0);
            }
        }
        
        // Apply payment method filter
        if ($paymentMethod) {
            $query->where('payment_method', $paymentMethod);
        }
        
        // Apply receipt type filter
        if ($receiptType) {
            $query->where('receipt_type', $receiptType);
        }
        
        // Apply date filters
        if ($dateFrom) {
            $query->whereDate('issued_date', '>=', Carbon::parse($dateFrom));
        }
        if ($dateTo) {
            $query->whereDate('issued_date', '<=', Carbon::parse($dateTo));
        }
        
        // Paginate results
        $receipts = $query->paginate($perPage)
            ->through(fn($receipt) => $this->formatReceipt($receipt));
        
        // Calculate statistics
        $stats = $this->getStatistics();
        
        // Get recent clearance requests without receipts
        $pendingClearances = collect(); // Default empty collection
        
        try {
            $pendingClearances = ClearanceRequest::with(['resident', 'clearanceType'])
                ->where('status', 'approved')
                ->whereDoesntHave('payment', function($q) {
                    $q->whereHas('receipt');
                })
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($clearance) {
                    // Safely access properties with null checks
                    $residentName = 'Unknown';
                    if ($clearance->resident) {
                        $residentName = $clearance->resident->full_name ?? 
                                       $clearance->resident->first_name . ' ' . $clearance->resident->last_name ?? 
                                       'Resident';
                    }
                    
                    $clearanceTypeName = $clearance->clearanceType->name ?? 'Clearance';
                    $feeAmount = $clearance->clearanceType->fee_amount ?? 0;
                    
                    return [
                        'id' => $clearance->id,
                        'control_number' => $clearance->control_number ?? 'N/A',
                        'resident_name' => $residentName,
                        'clearance_type' => $clearanceTypeName,
                        'fee' => $feeAmount,
                        'formatted_fee' => '₱' . number_format($feeAmount, 2),
                    ];
                });
        } catch (\Exception $e) {
            Log::error('Error fetching pending clearances: ' . $e->getMessage());
        }
        
        return Inertia::render('admin/Receipts/Index', [
            'receipts' => $receipts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'receipt_type' => $receiptType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'per_page' => $perPage,
            ],
            'stats' => $stats,
            'pendingClearances' => $pendingClearances,
            'filterOptions' => [
                'payment_methods' => [
                    ['value' => 'cash', 'label' => 'Cash'],
                    ['value' => 'gcash', 'label' => 'GCash'],
                    ['value' => 'maya', 'label' => 'Maya'],
                    ['value' => 'bank', 'label' => 'Bank Transfer'],
                    ['value' => 'check', 'label' => 'Check'],
                ],
                'receipt_types' => [
                    ['value' => 'official', 'label' => 'Official Receipt'],
                    ['value' => 'clearance', 'label' => 'Clearance Receipt'],
                    ['value' => 'certificate', 'label' => 'Certificate Receipt'],
                    ['value' => 'fee', 'label' => 'Fee Receipt'],
                ],
                'status_options' => [
                    ['value' => 'paid', 'label' => 'Paid'],
                    ['value' => 'partial', 'label' => 'Partial'],
                    ['value' => 'voided', 'label' => 'Voided'],
                ],
            ],
        ]);
    }

    /**
     * Show the form for creating a new receipt
     */
    public function create(Request $request)
    {
        $paymentId = $request->query('payment_id');
        $payment = null;
        
        if ($paymentId) {
            $payment = Payment::with(['items', 'discounts.rule', 'resident', 'household', 'recorder'])
                ->findOrFail($paymentId);
            
            // Check if receipt already exists
            $existingReceipt = Receipt::where('payment_id', $payment->id)->first();
            if ($existingReceipt) {
                return redirect()->route('admin.receipts.show', $existingReceipt->id)
                    ->with('info', 'A receipt already exists for this payment.');
            }
        }
        
        // Get payments that don't have receipts yet
        $paymentsWithoutReceipts = Payment::with(['items', 'resident', 'household'])
            ->whereDoesntHave('receipt')
            ->whereIn('status', ['completed', 'partially_paid'])
            ->latest('payment_date')
            ->limit(20)
            ->get()
            ->map(function($payment) {
                $amountDue = $payment->total_amount - $payment->discount;
                return [
                    'id' => $payment->id,
                    'or_number' => $payment->or_number,
                    'payer_name' => $payment->payer_name,
                    'payer_type' => $payment->payer_type,
                    'total_amount' => $amountDue,
                    'formatted_amount' => '₱' . number_format($amountDue, 2),
                    'amount_paid' => $payment->amount_paid,
                    'formatted_paid' => '₱' . number_format($payment->amount_paid, 2),
                    'payment_method' => $payment->payment_method_display ?? $payment->payment_method,
                    'payment_date' => $payment->formatted_date,
                    'status' => $payment->status_display ?? $payment->status,
                ];
            });
        
        // Get next receipt number
        $nextReceiptNumber = Receipt::generateReceiptNumber();
        
        return Inertia::render('admin/receipts/Create', [
            'payments' => $paymentsWithoutReceipts,
            'selectedPayment' => $payment ? $this->formatPaymentForReceipt($payment) : null,
            'nextReceiptNumber' => $nextReceiptNumber,
            'receiptTypes' => [
                ['value' => 'official', 'label' => 'Official Receipt'],
                ['value' => 'clearance', 'label' => 'Clearance Receipt'],
                ['value' => 'certificate', 'label' => 'Certificate Receipt'],
                ['value' => 'fee', 'label' => 'Fee Receipt'],
            ],
        ]);
    }

    /**
     * Store a newly created receipt
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'receipt_type' => 'required|in:official,clearance,certificate,fee',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $payment = Payment::with(['items', 'discounts.rule'])->findOrFail($validated['payment_id']);
            
            // Check if receipt already exists
            $existingReceipt = Receipt::where('payment_id', $payment->id)->first();
            if ($existingReceipt) {
                return back()->withErrors(['payment_id' => 'A receipt already exists for this payment.']);
            }

            // Create receipt from payment
            $receipt = Receipt::createFromPayment($payment, $validated['receipt_type']);
            
            if (!empty($validated['notes'])) {
                $receipt->notes = $validated['notes'];
                $receipt->save();
            }

            DB::commit();

            return redirect()->route('admin.receipts.show', $receipt->id)
                ->with('success', 'Receipt generated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create receipt: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to generate receipt. Please try again.']);
        }
    }

    /**
     * Generate receipt from payment
     */
    public function generateFromPayment(Request $request, Payment $payment)
    {
        // Check if receipt already exists
        $existingReceipt = Receipt::where('payment_id', $payment->id)->first();
        if ($existingReceipt) {
            return redirect()->route('admin.receipts.show', $existingReceipt->id)
                ->with('info', 'Receipt already exists for this payment.');
        }

        try {
            DB::beginTransaction();
            
            $receipt = Receipt::createFromPayment($payment, $request->input('receipt_type', 'official'));
            
            DB::commit();

            return redirect()->route('admin.receipts.show', $receipt->id)
                ->with('success', 'Receipt generated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to generate receipt: ' . $e->getMessage());
            
            return back()->with('error', 'Failed to generate receipt. Please try again.');
        }
    }

    /**
     * Generate receipt from clearance request
     */
    public function generateFromClearance(Request $request, ClearanceRequest $clearance)
    {
        // Check if clearance has payment
        if (!$clearance->payment) {
            return back()->with('error', 'Clearance request has no associated payment.');
        }

        return $this->generateFromPayment($request, $clearance->payment);
    }

    /**
     * Show receipt
     */
    public function show(Receipt $receipt)
    {
        $receipt->load([
            'payment.items', 
            'payment.discounts.rule', 
            'issuer', 
            'voider'
        ]);
        
        // Load clearance request through polymorphic relationship if needed
        $clearanceData = null;
        
        if ($receipt->receiptable_type === 'App\\Models\\ClearanceRequest' && $receipt->receiptable) {
            $clearance = $receipt->receiptable;
            $clearance->load(['resident', 'clearanceType']);
            
            $clearanceData = [
                'id' => $clearance->id,
                'control_number' => $clearance->control_number,
                'resident_name' => $clearance->resident->full_name ?? $clearance->resident->name ?? 'Unknown',
                'clearance_type' => $clearance->clearanceType->name ?? 'Clearance',
                'purpose' => $clearance->purpose,
                'issued_date' => $clearance->issued_date?->format('M d, Y'),
                'valid_until' => $clearance->valid_until?->format('M d, Y'),
            ];
        }
        
        return Inertia::render('admin/Receipts/Show', [
            'receipt' => $this->formatReceipt($receipt),
            'clearance' => $clearanceData,
        ]);
    }

    /**
     * Print receipt
     */
    public function print(Receipt $receipt)
    {
        $receipt->load(['payment.items', 'issuer']);
        
        // Load clearance request through polymorphic if needed
        if ($receipt->receiptable_type === 'App\\Models\\ClearanceRequest') {
            $receipt->load('receiptable.resident');
        }

        $receipt->markAsPrinted();

        return Inertia::render('admin/Receipts/Print', [
            'receipt' => $this->formatReceipt($receipt),
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'logo' => '/images/barangay-logo.png',
                'captain' => 'Hon. Juan Dela Cruz',
                'treasurer' => 'Maria Santos',
            ],
        ]);
    }

    /**
     * Void receipt
     */
    public function void(Request $request, Receipt $receipt)
    {
        $validated = $request->validate([
            'void_reason' => 'required|string|min:10|max:500',
        ]);

        if ($receipt->is_voided) {
            return back()->with('error', 'Receipt is already voided.');
        }

        try {
            $receipt->void($validated['void_reason']);
            
            return back()->with('success', 'Receipt voided successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to void receipt: ' . $e->getMessage());
            
            return back()->with('error', 'Failed to void receipt. Please try again.');
        }
    }

    /**
     * Get statistics
     */
    private function getStatistics()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        $totalReceipts = Receipt::count();
        $totalAmount = Receipt::where('is_voided', false)->sum('total_amount');
        
        $todayStats = [
            'count' => Receipt::whereDate('issued_date', $today)->count(),
            'amount' => Receipt::whereDate('issued_date', $today)->where('is_voided', false)->sum('total_amount'),
        ];
        
        $thisMonthStats = [
            'count' => Receipt::whereDate('issued_date', '>=', $thisMonth)->count(),
            'amount' => Receipt::whereDate('issued_date', '>=', $thisMonth)->where('is_voided', false)->sum('total_amount'),
        ];
        
        // Payment method breakdown
        $byMethod = Receipt::where('is_voided', false)
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function($item) {
                return [
                    'method' => $item->payment_method,
                    'method_label' => $this->getPaymentMethodLabel($item->payment_method),
                    'count' => $item->count,
                    'total' => $item->total,
                    'formatted_total' => '₱' . number_format($item->total, 2),
                ];
            });
        
        // Receipt type breakdown
        $byType = Receipt::where('is_voided', false)
            ->select('receipt_type', DB::raw('count(*) as count'))
            ->groupBy('receipt_type')
            ->get()
            ->map(function($item) {
                return [
                    'type' => $item->receipt_type,
                    'type_label' => $this->getReceiptTypeLabel($item->receipt_type),
                    'count' => $item->count,
                ];
            });
        
        return [
            'total' => [
                'count' => $totalReceipts,
                'amount' => $totalAmount,
                'formatted_amount' => '₱' . number_format($totalAmount, 2),
            ],
            'today' => [
                'count' => $todayStats['count'],
                'amount' => $todayStats['amount'],
                'formatted_amount' => '₱' . number_format($todayStats['amount'], 2),
            ],
            'this_month' => [
                'count' => $thisMonthStats['count'],
                'amount' => $thisMonthStats['amount'],
                'formatted_amount' => '₱' . number_format($thisMonthStats['amount'], 2),
            ],
            'voided' => Receipt::where('is_voided', true)->count(),
            'by_method' => $byMethod,
            'by_type' => $byType,
        ];
    }

    /**
     * Format receipt for API response - CRITICAL FIX for "toFixed is not a function" error
     */
    private function formatReceipt(Receipt $receipt)
    {
        // Get receipt data as array
        $data = $receipt->toArray();
        
        // Ensure numeric values are actually numbers, not strings
        $numericFields = [
            'subtotal', 'surcharge', 'penalty', 'discount', 
            'total_amount', 'amount_paid', 'change_due', 'printed_count'
        ];
        
        foreach ($numericFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = (float) $data[$field];
            }
        }
        
        // Format fee_breakdown items to ensure all amounts are numbers
        $feeBreakdown = [];
        if ($receipt->fee_breakdown && is_array($receipt->fee_breakdown)) {
            foreach ($receipt->fee_breakdown as $fee) {
                $formattedFee = $fee;
                $feeNumericFields = ['base_amount', 'surcharge', 'penalty', 'discount', 'total_amount'];
                foreach ($feeNumericFields as $field) {
                    if (isset($fee[$field])) {
                        $formattedFee[$field] = (float) $fee[$field];
                    }
                }
                $feeBreakdown[] = $formattedFee;
            }
        }
        
        // Format discount_breakdown items
        $discountBreakdown = [];
        if ($receipt->discount_breakdown && is_array($receipt->discount_breakdown)) {
            foreach ($receipt->discount_breakdown as $discount) {
                $formattedDiscount = $discount;
                if (isset($discount['discount_amount'])) {
                    $formattedDiscount['discount_amount'] = (float) $discount['discount_amount'];
                }
                $discountBreakdown[] = $formattedDiscount;
            }
        }
        
        return [
            'id' => $receipt->id,
            'receipt_number' => $receipt->receipt_number,
            'payment_id' => $receipt->payment_id,
            'clearance_request_id' => $receipt->clearance_request_id,
            'or_number' => $receipt->or_number,
            'receipt_type' => $receipt->receipt_type,
            'receipt_type_label' => $receipt->receipt_type_label,
            'payer_name' => $receipt->payer_name,
            'payer_address' => $receipt->payer_address,
            
            // Financial breakdown - ensure these are numbers
            'subtotal' => (float) $receipt->subtotal,
            'surcharge' => (float) $receipt->surcharge,
            'penalty' => (float) $receipt->penalty,
            'discount' => (float) $receipt->discount,
            'total_amount' => (float) $receipt->total_amount,
            'amount_paid' => (float) $receipt->amount_paid,
            'change_due' => (float) $receipt->change_due,
            
            // Formatted financials
            'formatted_subtotal' => '₱' . number_format($receipt->subtotal ?? 0, 2),
            'formatted_surcharge' => '₱' . number_format($receipt->surcharge ?? 0, 2),
            'formatted_penalty' => '₱' . number_format($receipt->penalty ?? 0, 2),
            'formatted_discount' => '₱' . number_format($receipt->discount ?? 0, 2),
            'formatted_total' => '₱' . number_format($receipt->total_amount ?? 0, 2),
            'formatted_amount_paid' => '₱' . number_format($receipt->amount_paid ?? 0, 2),
            'formatted_change' => '₱' . number_format($receipt->change_due ?? 0, 2),
            
            // Payment details
            'payment_method' => $receipt->payment_method,
            'payment_method_label' => $receipt->payment_method_label,
            'reference_number' => $receipt->reference_number,
            'payment_date' => $receipt->payment_date?->format('Y-m-d H:i:s'),
            'formatted_payment_date' => $receipt->payment_date?->format('M d, Y h:i A'),
            
            // Issuance details
            'issued_date' => $receipt->issued_date->format('Y-m-d H:i:s'),
            'formatted_issued_date' => $receipt->issued_date->format('M d, Y h:i A'),
            'issued_by' => $receipt->issuer?->name ?? 'System',
            'issued_by_id' => $receipt->issued_by,
            
            // Status
            'is_voided' => $receipt->is_voided,
            'status' => $receipt->status,
            'status_badge' => $receipt->status_badge,
            
            // Void details
            'void_reason' => $receipt->void_reason,
            'voided_by' => $receipt->voider?->name,
            'voided_at' => $receipt->voided_at?->format('M d, Y h:i A'),
            
            // Printing
            'printed_count' => (int) $receipt->printed_count,
            'last_printed_at' => $receipt->last_printed_at?->format('M d, Y h:i A'),
            
            // Breakdowns - with properly formatted numbers
            'fee_breakdown' => $feeBreakdown,
            'discount_breakdown' => $discountBreakdown,
            
            // Notes
            'notes' => $receipt->notes,
            
            // Timestamps
            'created_at' => $receipt->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $receipt->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format payment for receipt creation
     */
    private function formatPaymentForReceipt(Payment $payment)
    {
        $amountDue = $payment->total_amount - $payment->discount;
        
        // Format items with proper number casting
        $items = [];
        foreach ($payment->items as $item) {
            $items[] = [
                'id' => $item->id,
                'name' => $item->fee_name,
                'code' => $item->fee_code,
                'description' => $item->description,
                'category' => $item->category,
                'base_amount' => (float) $item->base_amount,
                'surcharge' => (float) $item->surcharge,
                'penalty' => (float) $item->penalty,
                'discount' => (float) $item->discount,
                'total_amount' => (float) $item->total_amount,
                'formatted_amount' => '₱' . number_format($item->base_amount ?? 0, 2),
                'formatted_total' => '₱' . number_format($item->total_amount ?? 0, 2),
                'clearance_request_id' => $item->clearance_request_id,
            ];
        }
        
        return [
            'id' => $payment->id,
            'or_number' => $payment->or_number,
            'payer_name' => $payment->payer_name,
            'payer_type' => $payment->payer_type,
            'address' => $payment->address,
            'contact_number' => $payment->contact_number,
            'payment_date' => $payment->payment_date->format('M d, Y h:i A'),
            'subtotal' => (float) $payment->subtotal,
            'surcharge' => (float) $payment->surcharge,
            'penalty' => (float) $payment->penalty,
            'discount' => (float) $payment->discount,
            'total_amount' => (float) $payment->total_amount,
            'amount_due' => (float) $amountDue,
            'amount_paid' => (float) $payment->amount_paid,
            'change_due' => (float) $payment->change_due,
            'payment_method' => $payment->payment_method_display ?? $payment->payment_method,
            'reference_number' => $payment->reference_number,
            'status' => $payment->status_display ?? $payment->status,
            'is_fully_paid' => $payment->amount_paid >= $amountDue - 0.01,
            'formatted' => [
                'subtotal' => '₱' . number_format($payment->subtotal ?? 0, 2),
                'surcharge' => '₱' . number_format($payment->surcharge ?? 0, 2),
                'penalty' => '₱' . number_format($payment->penalty ?? 0, 2),
                'discount' => '₱' . number_format($payment->discount ?? 0, 2),
                'total' => '₱' . number_format($payment->total_amount ?? 0, 2),
                'amount_due' => '₱' . number_format($amountDue, 2),
                'amount_paid' => '₱' . number_format($payment->amount_paid ?? 0, 2),
                'change' => '₱' . number_format($payment->change_due ?? 0, 2),
            ],
            'items' => $items,
            'discounts' => $payment->discounts_summary ?? [],
            'payer_details' => $payment->payer_details,
            'recorded_by' => $payment->recorded_by_user_name,
        ];
    }

    /**
     * Get payment method label
     */
    private function getPaymentMethodLabel($method)
    {
        $methods = [
            'cash' => 'Cash',
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank' => 'Bank Transfer',
            'check' => 'Check',
        ];

        return $methods[$method] ?? ucfirst($method);
    }

    /**
     * Get receipt type label
     */
    private function getReceiptTypeLabel($type)
    {
        $types = [
            'official' => 'Official Receipt',
            'clearance' => 'Clearance Receipt',
            'certificate' => 'Certificate Receipt',
            'fee' => 'Fee Receipt',
        ];

        return $types[$type] ?? ucfirst($type);
    }

    /**
     * Send receipt via email
     */
    public function sendEmail(Request $request, Receipt $receipt)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        try {
            // Here you would implement email sending logic
            $receipt->markEmailSent();
            
            Log::info('Receipt email sent', [
                'receipt_id' => $receipt->id,
                'receipt_number' => $receipt->receipt_number,
                'email' => $validated['email'],
            ]);
            
            return back()->with('success', 'Receipt sent via email successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to send receipt email: ' . $e->getMessage());
            return back()->with('error', 'Failed to send email. Please try again.');
        }
    }

    /**
     * Send receipt via SMS
     */
    public function sendSms(Request $request, Receipt $receipt)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:15',
        ]);

        try {
            // Here you would implement SMS sending logic
            $receipt->markSmsSent();
            
            Log::info('Receipt SMS sent', [
                'receipt_id' => $receipt->id,
                'receipt_number' => $receipt->receipt_number,
                'phone' => $validated['phone'],
            ]);
            
            return back()->with('success', 'Receipt sent via SMS successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to send receipt SMS: ' . $e->getMessage());
            return back()->with('error', 'Failed to send SMS. Please try again.');
        }
    }

    /**
     * Download receipt as PDF
     */
    public function download(Receipt $receipt)
    {
        $receipt->load(['payment.items', 'issuer']);
        
        // For now, redirect to print view with download parameter
        return Inertia::render('admin/receipts/Print', [
            'receipt' => $this->formatReceipt($receipt),
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'logo' => '/images/barangay-logo.png',
                'captain' => 'Hon. Juan Dela Cruz',
                'treasurer' => 'Maria Santos',
            ],
            'printSettings' => [
                'show_header' => true,
                'show_footer' => true,
                'show_signatures' => true,
                'copy_type' => 'original',
                'paper_size' => 'a4',
                'download' => true,
            ],
        ]);
    }
}