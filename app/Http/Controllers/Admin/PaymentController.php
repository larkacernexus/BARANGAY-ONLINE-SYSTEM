<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $query = Payment::query()
            ->with('resident')
            ->latest();
        
        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('resident', function ($q2) use ($search) {
                      $q2->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Status filter
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        // Type filter
        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }
        
        $payments = $query->paginate(20)->withQueryString();
        
        $stats = $this->getPaymentStats();
        
        $paymentTypes = Payment::selectRaw('type, COUNT(*) as count, SUM(amount) as total')
            ->whereBetween('payment_date', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->where('status', 'paid')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => $item->count,
                    'amount' => '₱' . number_format($item->total, 2)
                ];
            });
        
        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'paymentTypes' => $paymentTypes,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }
    
    /**
     * Get payment statistics
     */
    private function getPaymentStats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        $totalCollected = Payment::where('status', 'paid')->sum('amount');
        $monthlyCollected = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid')
            ->sum('amount');
        
        $pendingPayments = Payment::where('status', 'pending')->count();
        $pendingAmount = Payment::where('status', 'pending')->sum('amount');
        
        $overduePayments = Payment::where('due_date', '<', now())
            ->where('status', 'pending')
            ->count();
        $overdueAmount = Payment::where('due_date', '<', now())
            ->where('status', 'pending')
            ->sum('amount');
        
        $monthlyTarget = 300000; // ₱300,000
        $targetProgress = $monthlyTarget > 0 ? ($monthlyCollected / $monthlyTarget) * 100 : 0;
        
        return [
            [
                'label' => 'Total Collected',
                'value' => '₱' . number_format($totalCollected, 2),
                'change' => '+12% from last month'
            ],
            [
                'label' => 'Pending Payments',
                'value' => '₱' . number_format($pendingAmount, 2),
                'change' => $pendingPayments . ' payments pending'
            ],
            [
                'label' => 'Overdue',
                'value' => '₱' . number_format($overdueAmount, 2),
                'change' => $overduePayments . ' payments overdue'
            ],
            [
                'label' => 'This Month',
                'value' => '₱' . number_format($monthlyCollected, 2),
                'change' => round($targetProgress, 1) . '% of target'
            ],
        ];
    }
    
    /**
     * API endpoint for payment statistics
     */
    public function stats()
    {
        return response()->json($this->getPaymentStats());
    }
    
    /**
     * API endpoint for recent payments
     */
    public function recent()
    {
        $recentPayments = Payment::with('resident')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'resident_name' => $payment->resident->full_name ?? 'Unknown',
                    'type' => $payment->type,
                    'amount' => '₱' . number_format($payment->amount, 2),
                    'date' => $payment->payment_date,
                    'status' => $payment->status,
                ];
            });
        
        return response()->json($recentPayments);
    }
    
    /**
     * Show the form for creating a new payment.
     */
    public function create()
    {
        $residents = Resident::select(['id', 'first_name', 'last_name', 'middle_name'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                ];
            });
        
        $paymentTypes = [
            'Business Tax',
            'Real Property Tax',
            'Clearance Fee',
            'Certificate Fee',
            'Space Rental',
            'Other Fee'
        ];
        
        $paymentMethods = [
            'Cash', 'Check', 'Bank Transfer', 'GCash', 'Maya', 'Other'
        ];
        
        return Inertia::render('Payments/Create', [
            'residents' => $residents,
            'paymentTypes' => $paymentTypes,
            'paymentMethods' => $paymentMethods,
        ]);
    }
    
    /**
     * Store a newly created payment in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|exists:residents,id',
            'type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'due_date' => 'nullable|date',
            'period_from' => 'nullable|date',
            'period_to' => 'nullable|date',
            'receipt_number' => 'nullable|string|max:50|unique:payments',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'status' => 'required|in:pending,paid,overdue,cancelled',
            'remarks' => 'nullable|string',
            'collecting_officer' => 'required|string|max:200',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Generate receipt number if not provided
        $receiptNumber = $request->receipt_number;
        if (!$receiptNumber) {
            $lastPayment = Payment::orderBy('id', 'desc')->first();
            $lastNumber = $lastPayment ? (int) str_replace('RCPT-', '', $lastPayment->receipt_number) : 0;
            $receiptNumber = 'RCPT-' . date('Y') . '-' . str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        }
        
        // Determine status based on dates
        $status = $request->status;
        if ($status === 'pending' && $request->due_date && Carbon::parse($request->due_date)->lt(now())) {
            $status = 'overdue';
        }
        
        $payment = Payment::create([
            'resident_id' => $request->resident_id,
            'type' => $request->type,
            'description' => $request->description,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'due_date' => $request->due_date,
            'period_from' => $request->period_from,
            'period_to' => $request->period_to,
            'receipt_number' => $receiptNumber,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'status' => $status,
            'remarks' => $request->remarks,
            'collecting_officer' => $request->collecting_officer,
        ]);
        
        return redirect()->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully!');
    }
    
    /**
     * Display the specified payment.
     */
    public function show(Payment $payment)
    {
        $payment->load('resident');
        
        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }
    
    /**
     * Show the form for editing the specified payment.
     */
    public function edit(Payment $payment)
    {
        $residents = Resident::select(['id', 'first_name', 'last_name', 'middle_name'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                ];
            });
        
        $paymentTypes = [
            'Business Tax',
            'Real Property Tax',
            'Clearance Fee',
            'Certificate Fee',
            'Space Rental',
            'Other Fee'
        ];
        
        $paymentMethods = [
            'Cash', 'Check', 'Bank Transfer', 'GCash', 'Maya', 'Other'
        ];
        
        $statuses = ['pending', 'paid', 'overdue', 'cancelled'];
        
        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'residents' => $residents,
            'paymentTypes' => $paymentTypes,
            'paymentMethods' => $paymentMethods,
            'statuses' => $statuses,
        ]);
    }
    
    /**
     * Update the specified payment in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|exists:residents,id',
            'type' => 'required|string|max:100',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'due_date' => 'nullable|date',
            'period_from' => 'nullable|date',
            'period_to' => 'nullable|date',
            'receipt_number' => 'required|string|max:50|unique:payments,receipt_number,' . $payment->id,
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'status' => 'required|in:pending,paid,overdue,cancelled',
            'remarks' => 'nullable|string',
            'collecting_officer' => 'required|string|max:200',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Determine status based on dates
        $status = $request->status;
        if ($status === 'pending' && $request->due_date && Carbon::parse($request->due_date)->lt(now())) {
            $status = 'overdue';
        }
        
        $payment->update(array_merge($request->all(), ['status' => $status]));
        
        return redirect()->route('payments.show', $payment)
            ->with('success', 'Payment updated successfully!');
    }
    
    /**
     * Remove the specified payment from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();
        
        return redirect()->route('payments.index')
            ->with('success', 'Payment deleted successfully!');
    }
    
    /**
     * Generate receipt for payment
     */
    public function receipt(Payment $payment)
    {
        $payment->load('resident');
        
        // Logic to generate PDF receipt
        // You can use DomPDF, MPDF, or TCPDF
        
        return Inertia::render('Payments/Receipt', [
            'payment' => $payment,
        ]);
    }
    
    /**
     * Export payments
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = Payment::query()->with('resident');
        
        if ($type !== 'all') {
            $query->where('type', $type);
        }
        
        if ($startDate) {
            $query->where('payment_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('payment_date', '<=', $endDate);
        }
        
        $payments = $query->get();
        
        // Export logic here
        
        return response()->streamDownload(function () use ($payments) {
            // CSV/Excel export logic
        }, 'payments-export-' . date('Y-m-d') . '.csv');
    }
    
    /**
     * Generate report
     */
    public function report($type)
    {
        $reportData = [];
        
        switch ($type) {
            case 'monthly':
                $reportData = $this->generateMonthlyReport();
                break;
            case 'annual':
                $reportData = $this->generateAnnualReport();
                break;
            case 'tax-types':
                $reportData = $this->generateTaxTypeReport();
                break;
        }
        
        return Inertia::render('Payments/Report', [
            'reportType' => $type,
            'reportData' => $reportData,
        ]);
    }
    
    private function generateMonthlyReport()
    {
        // Generate monthly report logic
        return [];
    }
    
    private function generateAnnualReport()
    {
        // Generate annual report logic
        return [];
    }
    
    private function generateTaxTypeReport()
    {
        // Generate tax type report logic
        return [];
    }
}