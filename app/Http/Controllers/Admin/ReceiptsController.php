<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Receipt;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReceiptsController extends Controller
{
    /**
     * Display a listing of receipts
     */
    public function index(Request $request)
    {
        // Get search and filter parameters
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        // Build query
        $query = Receipt::with(['payment.fee', 'issuedBy'])
            ->orderBy('created_at', 'desc');
        
        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('payment.fee', function ($q) use ($search) {
                      $q->where('fee_code', 'like', "%{$search}%")
                        ->orWhereHas('resident', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('household', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                  });
            });
        }
        
        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        
        // Apply date filter
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }
        
        // Paginate results
        $receipts = $query->paginate(15)->withQueryString();
        
        // Calculate stats
        $stats = [
            'totalReceipts' => Receipt::count(),
            'totalAmount' => Receipt::where('status', 'issued')->sum('amount'),
            'todayIssued' => Receipt::whereDate('created_at', Carbon::today())->count(),
            'voided' => Receipt::where('status', 'voided')->count(),
        ];
        
        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new receipt
     */
    public function create()
    {
        // Get payments that don't have receipts yet
        $paymentsWithoutReceipts = Payment::whereDoesntHave('receipt')
            ->with(['fee', 'fee.resident', 'fee.household'])
            ->where('status', 'completed')
            ->latest()
            ->limit(10)
            ->get();
        
        // Get next receipt number
        $lastReceipt = Receipt::orderBy('id', 'desc')->first();
        $nextReceiptNumber = $this->generateReceiptNumber($lastReceipt);
        
        return Inertia::render('Receipts/Create', [
            'payments' => $paymentsWithoutReceipts,
            'nextReceiptNumber' => $nextReceiptNumber,
        ]);
    }
    
    /**
     * Generate receipt number
     */
    private function generateReceiptNumber($lastReceipt)
    {
        $year = date('Y');
        $month = date('m');
        
        if ($lastReceipt && strpos($lastReceipt->receipt_number, "OR-{$year}-") === 0) {
            $lastNumber = (int) substr($lastReceipt->receipt_number, -3);
            $nextNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '001';
        }
        
        return "OR-{$year}-{$nextNumber}";
    }
}