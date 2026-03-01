<?php
// app/Http/Controllers/Resident/ReceiptController.php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResidentReceiptController extends Controller
{
    /**
     * Display receipts for the authenticated household head
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Verify user is a household head
        if (!$user->household_id) {
            return redirect()->route('residentdashboard')
                ->with('error', 'You do not have access to receipts.');
        }

        $household = Household::with(['purok', 'residents'])->find($user->household_id);
        
        // Get all receipts for this household through payments
        $query = Receipt::with(['payment', 'issuer'])
            ->where('payer_name', 'like', "%{$household->current_head_name}%")
            ->orWhereHas('payment', function($q) use ($household) {
                $q->where('payer_type', 'household')
                  ->where('payer_id', $household->id);
            })
            ->orWhereHas('payment', function($q) use ($household) {
                $q->where('payer_type', 'resident')
                  ->whereIn('payer_id', $household->residents->pluck('id'));
            })
            ->latest('issued_date');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhere('or_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('issued_date', '>=', Carbon::parse($request->date_from));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('issued_date', '<=', Carbon::parse($request->date_to));
        }

        if ($request->filled('receipt_type')) {
            $query->where('receipt_type', $request->receipt_type);
        }

        $receipts = $query->paginate(15)
            ->through(fn($receipt) => $this->formatResidentReceipt($receipt));

        // Get statistics for this household
        $stats = $this->getHouseholdReceiptStats($household);

        return Inertia::render('resident/Receipts/Index', [
            'receipts' => $receipts,
            'household' => [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'head_name' => $household->current_head_name,
                'address' => $household->full_address,
                'contact_number' => $household->contact_number,
                'email' => $household->email,
                'member_count' => $household->member_count,
                'has_user_account' => $household->has_user_account,
            ],
            'filters' => $request->only(['search', 'date_from', 'date_to', 'receipt_type']),
            'stats' => $stats,
            'receiptTypes' => [
                ['value' => 'official', 'label' => 'Official Receipts'],
                ['value' => 'clearance', 'label' => 'Clearance Receipts'],
                ['value' => 'fee', 'label' => 'Fee Receipts'],
            ],
        ]);
    }

    /**
     * Show a specific receipt
     */
    public function show(Receipt $receipt)
    {
        $user = Auth::user();
        
        // Verify ownership
        if (!$this->verifyReceiptOwnership($receipt, $user)) {
            return redirect()->route(route: 'receipts.index')
                ->with('error', 'You do not have access to this receipt.');
        }

        $receipt->load(['payment.items', 'issuer']);

        return Inertia::render('resident/Receipts/Show', [
            'receipt' => $this->formatResidentReceipt($receipt),
        ]);
    }

    /**
     * Download receipt as PDF
     */
    public function download(Receipt $receipt)
    {
        $user = Auth::user();
        
        // Verify ownership
        if (!$this->verifyReceiptOwnership($receipt, $user)) {
            return redirect()->route('receipts.index')
                ->with('error', 'You do not have access to this receipt.');
        }

        $receipt->load(['payment.items', 'issuer']);
        
        // Increment print count
        $receipt->increment('printed_count');
        $receipt->update(['last_printed_at' => now()]);

        // Return PDF download
        return Inertia::render('resident/Receipts/Print', [
            'receipt' => $this->formatResidentReceipt($receipt),
            'barangay' => [
                'name' => 'Barangay San Vicente',
                'address' => 'San Vicente, City of San Fernando, La Union',
                'logo' => '/images/barangay-logo.png',
                'captain' => 'Hon. Juan Dela Cruz',
                'treasurer' => 'Maria Santos',
            ],
            'forDownload' => true,
        ]);
    }

    /**
     * Format receipt for resident view
     */
    private function formatResidentReceipt(Receipt $receipt)
    {
        return [
            'id' => $receipt->id,
            'receipt_number' => $receipt->receipt_number,
            'or_number' => $receipt->or_number,
            'receipt_type' => $receipt->receipt_type,
            'receipt_type_label' => $receipt->receipt_type_label,
            'payer_name' => $receipt->payer_name,
            
            // Financials
            'total_amount' => (float) $receipt->total_amount,
            'amount_paid' => (float) $receipt->amount_paid,
            'change_due' => (float) $receipt->change_due,
            'formatted_total' => $receipt->formatted_total,
            'formatted_amount_paid' => $receipt->formatted_amount_paid,
            'formatted_change' => $receipt->formatted_change,
            
            // Payment details
            'payment_method' => $receipt->payment_method_label,
            'payment_date' => $receipt->payment_date?->format('M d, Y'),
            'formatted_payment_date' => $receipt->payment_date?->format('F j, Y g:i A'),
            
            // Issuance
            'issued_date' => $receipt->issued_date->format('M d, Y'),
            'formatted_issued_date' => $receipt->issued_date->format('F j, Y g:i A'),
            'issued_by' => $receipt->issuer?->name ?? 'System',
            
            // Items summary
            'items_count' => count($receipt->fee_breakdown ?? []),
            'items' => collect($receipt->fee_breakdown ?? [])->map(function($item) {
                return [
                    'name' => $item['fee_name'] ?? 'Fee',
                    'amount' => '₱' . number_format($item['total_amount'] ?? $item['base_amount'] ?? 0, 2),
                    'category' => $item['category'] ?? 'general',
                ];
            }),
            
            // Discounts
            'has_discount' => ($receipt->discount ?? 0) > 0,
            'discount_amount' => (float) ($receipt->discount ?? 0),
            'formatted_discount' => $receipt->formatted_discount ?? '₱0.00',
            
            // Status
            'status' => $receipt->status,
            'status_badge' => $receipt->status_badge,
            
            // Metadata
            'notes' => $receipt->notes,
            'created_at' => $receipt->created_at->format('M d, Y'),
        ];
    }

    /**
     * Get receipt statistics for household
     */
    private function getHouseholdReceiptStats(Household $household)
    {
        $residentIds = $household->residents->pluck('id');
        
        $totalReceipts = Receipt::where('payer_name', 'like', "%{$household->current_head_name}%")
            ->orWhereHas('payment', function($q) use ($household, $residentIds) {
                $q->where(function($query) use ($household, $residentIds) {
                    $query->where('payer_type', 'household')
                          ->where('payer_id', $household->id)
                          ->orWhere(function($sub) use ($residentIds) {
                              $sub->where('payer_type', 'resident')
                                  ->whereIn('payer_id', $residentIds);
                          });
                });
            });

        $thisMonth = Carbon::now()->startOfMonth();
        
        return [
            'total_count' => $totalReceipts->count(),
            'total_amount' => '₱' . number_format($totalReceipts->sum('total_amount'), 2),
            'this_month_count' => $totalReceipts->clone()
                ->whereDate('issued_date', '>=', $thisMonth)
                ->count(),
            'this_month_amount' => '₱' . number_format(
                $totalReceipts->clone()
                    ->whereDate('issued_date', '>=', $thisMonth)
                    ->sum('total_amount'), 
                2
            ),
            'latest_receipt' => $totalReceipts->clone()
                ->latest('issued_date')
                ->first()?->receipt_number,
            'clearance_count' => $totalReceipts->clone()
                ->where('receipt_type', 'clearance')
                ->count(),
            'fee_count' => $totalReceipts->clone()
                ->where('receipt_type', 'fee')
                ->count(),
            'official_count' => $totalReceipts->clone()
                ->where('receipt_type', 'official')
                ->count(),
        ];
    }

    /**
     * Verify receipt ownership
     */
    private function verifyReceiptOwnership(Receipt $receipt, $user): bool
    {
        if (!$user->household_id) {
            return false;
        }

        $household = Household::with('residents')->find($user->household_id);
        
        // Check by payer name (household head)
        if (stripos($receipt->payer_name, $household->current_head_name) !== false) {
            return true;
        }

        // Check by payment records
        if ($receipt->payment) {
            // Check household payment
            if ($receipt->payment->payer_type === 'household' && 
                $receipt->payment->payer_id === $household->id) {
                return true;
            }
            
            // Check resident payment (any household member)
            if ($receipt->payment->payer_type === 'resident' && 
                $household->residents->contains('id', $receipt->payment->payer_id)) {
                return true;
            }
        }

        return false;
    }
}