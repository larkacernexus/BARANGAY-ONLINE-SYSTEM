<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use App\Models\Clearance;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ClearanceController extends Controller
{
    /**
     * Display a listing of clearances.
     */
    public function index(Request $request)
    {
        $query = Clearance::query()
            ->with('resident')
            ->latest();
        
        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('clearance_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
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
        
        $clearances = $query->paginate(20)->withQueryString();
        
        $stats = $this->getClearanceStats();
        
        $clearanceTypes = Clearance::selectRaw('type, COUNT(*) as count')
            ->whereYear('issue_date', Carbon::now()->year)
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $fees = [
                    'Business Clearance' => 200,
                    'Residency' => 100,
                    'Good Moral' => 150,
                    'Barangay ID' => 50,
                    'Indigency' => 50,
                    'Non-Derogatory' => 100,
                ];
                
                return [
                    'type' => $item->type,
                    'count' => $item->count,
                    'fee' => '₱' . ($fees[$item->type] ?? 100)
                ];
            });
        
        return Inertia::render('Clearances/Index', [
            'clearances' => $clearances,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }
    
    /**
     * Get clearance statistics
     */
    private function getClearanceStats()
    {
        $totalIssued = Clearance::where('status', 'issued')->count();
        $pendingApproval = Clearance::where('status', 'pending')->count();
        
        $expiringSoon = Clearance::where('valid_until', '>=', now())
            ->where('valid_until', '<=', now()->addDays(30))
            ->where('status', 'issued')
            ->count();
        
        $rejectedThisMonth = Clearance::where('status', 'rejected')
            ->whereMonth('created_at', now()->month)
            ->count();
        
        $issuedToday = Clearance::where('status', 'issued')
            ->whereDate('issue_date', today())
            ->count();
        
        return [
            [
                'label' => 'Total Issued',
                'value' => $totalIssued,
                'change' => '+12 this month'
            ],
            [
                'label' => 'Pending Approval',
                'value' => $pendingApproval,
                'change' => '3 new today'
            ],
            [
                'label' => 'Expiring Soon',
                'value' => $expiringSoon,
                'change' => 'Within 30 days'
            ],
            [
                'label' => 'Rejected',
                'value' => $rejectedThisMonth,
                'change' => 'This month'
            ],
        ];
    }
    
    /**
     * API endpoint for clearance statistics
     */
    public function stats()
    {
        return response()->json($this->getClearanceStats());
    }
    
    /**
     * Show the form for creating a new clearance.
     */
    public function create()
    {
        $residents = Resident::select(['id', 'first_name', 'last_name', 'middle_name', 'address'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'address' => $resident->address,
                ];
            });
        
        $clearanceTypes = [
            'Business Clearance',
            'Residency Certificate',
            'Good Moral Character',
            'Certificate of Indigency',
            'Non-Derogatory Record',
            'Barangay ID',
            'Other'
        ];
        
        $requirements = [
            'Valid ID presented',
            'Community tax certificate (cedula)',
            'Proof of residency',
            'Payment receipt (if applicable)',
            'No pending barangay cases'
        ];
        
        return Inertia::render('Clearances/Create', [
            'residents' => $residents,
            'clearanceTypes' => $clearanceTypes,
            'requirements' => $requirements,
        ]);
    }
    
    /**
     * Store a newly created clearance in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|exists:residents,id',
            'type' => 'required|string|max:100',
            'purpose' => 'required|string',
            'issue_date' => 'required|date',
            'valid_until' => 'required|date|after:issue_date',
            'clearance_number' => 'nullable|string|max:50|unique:clearances',
            'fee_amount' => 'nullable|numeric|min:0',
            'requirements_met' => 'nullable|array',
            'remarks' => 'nullable|string',
            'issuing_officer' => 'required|string|max:200',
            'status' => 'required|in:pending,issued,rejected,expired',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Generate clearance number if not provided
        $clearanceNumber = $request->clearance_number;
        if (!$clearanceNumber) {
            $lastClearance = Clearance::orderBy('id', 'desc')->first();
            $lastNumber = $lastClearance ? (int) str_replace('CLR-', '', $lastClearance->clearance_number) : 0;
            $clearanceNumber = 'CLR-' . date('Y') . '-' . str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        }
        
        // Determine status based on dates
        $status = $request->status;
        if ($status === 'issued' && Carbon::parse($request->valid_until)->lt(now())) {
            $status = 'expired';
        }
        
        $clearance = Clearance::create([
            'resident_id' => $request->resident_id,
            'type' => $request->type,
            'purpose' => $request->purpose,
            'issue_date' => $request->issue_date,
            'valid_until' => $request->valid_until,
            'clearance_number' => $clearanceNumber,
            'fee_amount' => $request->fee_amount,
            'requirements_met' => $request->requirements_met ? json_encode($request->requirements_met) : null,
            'remarks' => $request->remarks,
            'issuing_officer' => $request->issuing_officer,
            'status' => $status,
        ]);
        
        // If fee is paid, create a payment record
        if ($request->fee_amount > 0 && $request->has('payment_received') && $request->boolean('payment_received')) {
            // Create payment record logic here
        }
        
        return redirect()->route('clearances.show', $clearance)
            ->with('success', 'Clearance created successfully!');
    }
    
    /**
     * Display the specified clearance.
     */
    public function show(Clearance $clearance)
    {
        $clearance->load('resident');
        
        return Inertia::render('Clearances/Show', [
            'clearance' => $clearance,
        ]);
    }
    
    /**
     * Show the form for editing the specified clearance.
     */
    public function edit(Clearance $clearance)
    {
        $residents = Resident::select(['id', 'first_name', 'last_name', 'middle_name', 'address'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'address' => $resident->address,
                ];
            });
        
        $clearanceTypes = [
            'Business Clearance',
            'Residency Certificate',
            'Good Moral Character',
            'Certificate of Indigency',
            'Non-Derogatory Record',
            'Barangay ID',
            'Other'
        ];
        
        $statuses = ['pending', 'issued', 'rejected', 'expired'];
        
        $requirements = [
            'Valid ID presented',
            'Community tax certificate (cedula)',
            'Proof of residency',
            'Payment receipt (if applicable)',
            'No pending barangay cases'
        ];
        
        return Inertia::render('Clearances/Edit', [
            'clearance' => $clearance,
            'residents' => $residents,
            'clearanceTypes' => $clearanceTypes,
            'statuses' => $statuses,
            'requirements' => $requirements,
        ]);
    }
    
    /**
     * Update the specified clearance in storage.
     */
    public function update(Request $request, Clearance $clearance)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|exists:residents,id',
            'type' => 'required|string|max:100',
            'purpose' => 'required|string',
            'issue_date' => 'required|date',
            'valid_until' => 'required|date|after:issue_date',
            'clearance_number' => 'required|string|max:50|unique:clearances,clearance_number,' . $clearance->id,
            'fee_amount' => 'nullable|numeric|min:0',
            'requirements_met' => 'nullable|array',
            'remarks' => 'nullable|string',
            'issuing_officer' => 'required|string|max:200',
            'status' => 'required|in:pending,issued,rejected,expired',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Determine status based on dates
        $status = $request->status;
        if ($status === 'issued' && Carbon::parse($request->valid_until)->lt(now())) {
            $status = 'expired';
        }
        
        $clearance->update(array_merge($request->all(), [
            'requirements_met' => $request->requirements_met ? json_encode($request->requirements_met) : null,
            'status' => $status,
        ]));
        
        return redirect()->route('clearances.show', $clearance)
            ->with('success', 'Clearance updated successfully!');
    }
    
    /**
     * Remove the specified clearance from storage.
     */
    public function destroy(Clearance $clearance)
    {
        $clearance->delete();
        
        return redirect()->route('clearances.index')
            ->with('success', 'Clearance deleted successfully!');
    }
    
    /**
     * Print clearance
     */
    public function print(Clearance $clearance)
    {
        $clearance->load('resident');
        
        // Logic to generate PDF clearance certificate
        // You can use DomPDF, MPDF, or TCPDF
        
        return Inertia::render('Clearances/Print', [
            'clearance' => $clearance,
        ]);
    }
    
    /**
     * Approve clearance
     */
    public function approve(Request $request, Clearance $clearance)
    {
        if ($clearance->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending clearances can be approved.');
        }
        
        $clearance->update([
            'status' => 'issued',
            'issue_date' => now(),
            'issuing_officer' => auth()->user()->name ?? 'Barangay Captain',
            'valid_until' => now()->addMonths(3), // Default 3 months validity
        ]);
        
        return redirect()->back()
            ->with('success', 'Clearance approved successfully!');
    }
    
    /**
     * Reject clearance
     */
    public function reject(Request $request, Clearance $clearance)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);
        
        if ($clearance->status !== 'pending') {
            return redirect()->back()
                ->with('error', 'Only pending clearances can be rejected.');
        }
        
        $clearance->update([
            'status' => 'rejected',
            'remarks' => $request->rejection_reason,
        ]);
        
        return redirect()->back()
            ->with('success', 'Clearance rejected successfully!');
    }
    
    /**
     * Get clearance types
     */
    public function types()
    {
        $types = Clearance::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->type,
                    'count' => $item->count,
                ];
            });
        
        return response()->json($types);
    }
}