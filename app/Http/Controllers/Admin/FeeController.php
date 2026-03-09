<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Business;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\PaymentDiscount;
use App\Models\DiscountRule;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\DocumentCategory;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use App\Notifications\FeeDueReminderNotification;

class FeeController extends Controller
{
    // Display list of fees (from route: fees.index)
    public function index(Request $request)
    {
        try {
            Log::info('FeeController@index accessed', [
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'filters' => $request->all()
            ]);

            // Build query WITHOUT problematic eager loading
            $query = Fee::query()
                ->with([
                    'feeType:id,name,code,document_category_id,is_discountable',
                    'paymentItems.payment:id,payment_date,total_amount,or_number,status'
                ])
                ->latest();

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('payer_name', 'like', "%{$search}%")
                        ->orWhere('or_number', 'like', "%{$search}%")
                        ->orWhere('certificate_number', 'like', "%{$search}%")
                        ->orWhere('fee_code', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhere('purok', 'like', "%{$search}%");
                });

                Log::debug('Fee search applied', ['search_term' => $search]);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
                Log::debug('Fee status filter applied', ['status' => $request->status]);
            }

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->whereHas('feeType', function ($q) use ($request) {
                    $q->where('document_category_id', $request->category);
                });
                Log::debug('Fee category filter applied', ['category' => $request->category]);
            }

            // Filter by purok
            if ($request->has('purok') && $request->purok) {
                $query->where('purok', $request->purok);
                Log::debug('Fee purok filter applied', ['purok' => $request->purok]);
            }

            // Filter by payer type
            if ($request->has('payer_type') && $request->payer_type) {
                $query->where('payer_type', $request->payer_type);
                Log::debug('Fee payer type filter applied', ['payer_type' => $request->payer_type]);
            }

            // Filter by date range
            if ($request->has('from_date') && $request->from_date) {
                $query->whereDate('issue_date', '>=', $request->from_date);
                Log::debug('Fee from_date filter applied', ['from_date' => $request->from_date]);
            }

            if ($request->has('to_date') && $request->to_date) {
                $query->whereDate('issue_date', '<=', $request->to_date);
                Log::debug('Fee to_date filter applied', ['to_date' => $request->to_date]);
            }

            // Filter by amount range
            if ($request->has('min_amount')) {
                $query->where('total_amount', '>=', $request->min_amount);
                Log::debug('Fee min_amount filter applied', ['min_amount' => $request->min_amount]);
            }

            if ($request->has('max_amount')) {
                $query->where('total_amount', '<=', $request->max_amount);
                Log::debug('Fee max_amount filter applied', ['max_amount' => $request->max_amount]);
            }

            // Get paginated results
            $perPage = $request->get('per_page', 20);
            $fees = $query->paginate($perPage)
                ->withQueryString()
                ->through(function ($fee) {
                    // Format fee data for frontend
                    $fee->formatted_issue_date = Carbon::parse($fee->issue_date)->format('M d, Y');
                    $fee->formatted_due_date = Carbon::parse($fee->due_date)->format('M d, Y');
                    $fee->formatted_created_at = Carbon::parse($fee->created_at)->format('M d, Y h:i A');

                    // Calculate days overdue
                    $fee->is_overdue = $fee->status === 'overdue';
                    $fee->days_overdue = $fee->is_overdue
                        ? Carbon::parse($fee->due_date)->diffInDays(now())
                        : 0;

                    // Add payer type icon class
                    $fee->payer_type_icon = $this->getPayerTypeIcon($fee->payer_type);

                    // Format amounts with currency
                    $fee->formatted_total_amount = '₱' . number_format($fee->total_amount, 2);
                    $fee->formatted_amount_paid = '₱' . number_format($fee->amount_paid, 2);
                    $fee->formatted_balance = '₱' . number_format($fee->balance, 2);

                    // Get payer details safely (using the data already in the fee record)
                    $fee->payer_details = $this->getPayerDetails($fee);

                    // Include IDs for polymorphic relationships
                    $fee->resident_id = $fee->payer_type === 'resident' ? $fee->payer_id : null;
                    $fee->household_id = $fee->payer_type === 'household' ? $fee->payer_id : null;

                    return $fee;
                });

            // Get statistics
            $stats = $this->getStatistics();

            // Get unique puroks from fees
            $puroks = Fee::whereNotNull('purok')
                ->distinct('purok')
                ->pluck('purok')
                ->filter()
                ->sort()
                ->values();

            // Status options
            $statuses = [
                'pending' => 'Pending',
                'issued' => 'Issued',
                'partially_paid' => 'Partially Paid',
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'cancelled' => 'Cancelled',
                'waived' => 'Waived',
                'written_off' => 'Written Off',
            ];

            // Category options
            $categories = DocumentCategory::active()
                ->ordered()
                ->get(['id', 'name'])
                ->pluck('name', 'id')
                ->toArray();

            // Payer type options
            $payerTypes = [
                'resident' => 'Resident',
                'business' => 'Business',
                'household' => 'Household',
                'visitor' => 'Visitor',
                'other' => 'Other',
            ];

            Log::info('FeeController@index completed successfully', [
                'fee_count' => $fees->total(),
                'total_records' => $stats['total']
            ]);

            return Inertia::render('admin/Fees/Index', [
                'fees' => $fees,
                'filters' => $request->only([
                    'search',
                    'status',
                    'category',
                    'purok',
                    'payer_type',
                    'from_date',
                    'to_date',
                    'min_amount',
                    'max_amount'
                ]),
                'statuses' => $statuses,
                'categories' => $categories,
                'payerTypes' => $payerTypes,
                'puroks' => $puroks,
                'stats' => $stats,

                // For quick filters
                'quickStats' => [
                    'all' => $stats['total'],
                    'pending' => $stats['status_counts']['pending'],
                    'issued' => $stats['status_counts']['issued'],
                    'overdue' => $stats['status_counts']['overdue'],
                    'paid' => $stats['status_counts']['paid'],
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@index error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fees. Please try again.');
        }
    }

    /**
     * Send reminders for fees that are due soon.
     */
    public function sendDueReminders(Request $request)
    {
        try {
            Log::info('FeeController@sendDueReminders started', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            $request->validate([
                'days' => 'nullable|integer|min:0|max:30',
                'fee_ids' => 'nullable|array',
                'fee_ids.*' => 'exists:fees,id'
            ]);

            $days = (int) $request->input('days', 7);
            $feeIds = $request->input('fee_ids');

            // Build query with eager loading of payer relationship
            $query = Fee::with('payer');
            $query->whereNotIn('status', ['paid', 'cancelled', 'waived']);

            if ($feeIds) {
                $query->whereIn('id', $feeIds);
            } else {
                // For "Overdue" option (days = 0)
                if ($days === 0) {
                    $query->whereDate('due_date', '<', now());
                } 
                // For future due dates
                else {
                    $dueDate = now()->addDays($days);
                    $query->whereDate('due_date', '<=', $dueDate)
                          ->whereDate('due_date', '>=', now());
                }
            }

            $fees = $query->get();
            
            $sentCount = 0;
            $skippedCount = 0;
            $processedFees = [];

            foreach ($fees as $fee) {
                // Get the user who should receive this notification
                $user = $this->getNotifiableUserForFee($fee);
                
                if ($user && $user->email) {
                    $daysUntilDue = $days === 0 ? -1 : (int) now()->diffInDays($fee->due_date, false);
                    
                    // Send notification to the ACTUAL USER
                    $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));
                    
                    $sentCount++;
                    $processedFees[] = [
                        'fee_id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'payer_name' => $fee->payer_name,
                        'payer_type' => $fee->payer_type,
                        'payer_id' => $fee->payer_id,
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'due_date' => $fee->due_date->format('Y-m-d'),
                        'days_until_due' => $daysUntilDue,
                        'status' => $daysUntilDue < 0 ? 'overdue' : 'upcoming'
                    ];
                    
                    Log::info('Fee reminder sent to user', [
                        'fee_id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'payer_name' => $fee->payer_name,
                        'payer_type' => $fee->payer_type,
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'due_date' => $fee->due_date->format('Y-m-d'),
                        'days_until_due' => $daysUntilDue
                    ]);
                } else {
                    $skippedCount++;
                    Log::warning('No notifiable user found for fee', [
                        'fee_id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'payer_name' => $fee->payer_name,
                        'payer_type' => $fee->payer_type,
                        'payer_id' => $fee->payer_id
                    ]);
                }
            }

            Log::info('Fee reminders completed', [
                'total_fees_processed' => $fees->count(),
                'sent_count' => $sentCount,
                'skipped_count' => $skippedCount,
                'processed_fees' => $processedFees
            ]);

            $message = "Sent {$sentCount} reminders to users successfully. Skipped {$skippedCount} fees.";

            // For Inertia requests
            if (!$request->wantsJson()) {
                return redirect()->back()->with('flash', [
                    'message' => $message,
                    'type' => 'success'
                ]);
            }

            // For API requests
            return response()->json([
                'success' => true,
                'message' => $message,
                'sent_count' => $sentCount,
                'skipped_count' => $skippedCount,
                'processed_fees' => $processedFees
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send fee reminders', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (!$request->wantsJson()) {
                return redirect()->back()->with('flash', [
                    'message' => 'Failed to send reminders: ' . $e->getMessage(),
                    'type' => 'error'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to send reminders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send reminder for a single fee.
     */
    public function sendSingleReminder($id)
    {
        try {
            Log::info('FeeController@sendSingleReminder started', [
                'user_id' => Auth::id(),
                'fee_id' => $id
            ]);

            $fee = Fee::with('payer')->findOrFail($id);
            
            // Get the user who should receive this notification
            $user = $this->getNotifiableUserForFee($fee);

            if (!$user) {
                Log::warning('Cannot send reminder - no notifiable user found', [
                    'fee_id' => $id
                ]);

                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No user found to send notification to.'
                    ], 400);
                }

                return back()->with('error', 'No user found to send notification to.');
            }

            if (!isset($user->email) || empty($user->email)) {
                Log::warning('Cannot send reminder - user has no email', [
                    'fee_id' => $id,
                    'user_id' => $user->id
                ]);

                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'User has no email address.'
                    ], 400);
                }

                return back()->with('error', 'User has no email address.');
            }

            if (in_array($fee->status, ['paid', 'cancelled', 'waived'])) {
                Log::warning('Cannot send reminder - fee is already paid/cancelled/waived', [
                    'fee_id' => $id,
                    'status' => $fee->status
                ]);

                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot send reminder for paid, cancelled, or waived fees.'
                    ], 400);
                }

                return back()->with('error', 'Cannot send reminder for paid, cancelled, or waived fees.');
            }

            $daysUntilDue = (int) now()->diffInDays($fee->due_date, false);
            
            // Send notification to the ACTUAL USER
            $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));

            Log::info('Single fee reminder sent to user', [
                'fee_id' => $id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'days_until_due' => $daysUntilDue
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Reminder sent to user successfully.',
                    'data' => [
                        'fee_id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'payer_name' => $fee->payer_name,
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'days_until_due' => $daysUntilDue
                    ]
                ]);
            }

            return back()->with('success', 'Reminder sent to user successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to send single reminder', [
                'user_id' => Auth::id(),
                'fee_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send reminder: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Failed to send reminder: ' . $e->getMessage());
        }
    }

    /**
     * Helper method to get the user who should receive notifications for a fee
     */
    private function getNotifiableUserForFee(Fee $fee)
    {
        // Step 1: Get the payer (Resident, Business, Household, etc.)
        $payer = $fee->payer;
        
        if (!$payer) {
            Log::warning('No payer found for fee', [
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code
            ]);
            return null;
        }

        Log::debug('Looking for notifiable user', [
            'fee_id' => $fee->id,
            'payer_type' => get_class($payer),
            'payer_id' => $payer->id
        ]);

        // Step 2: If payer is a Resident, find their associated User account
        if ($payer instanceof Resident) {
            return $this->findUserForResident($payer);
        }

        // Step 3: If payer is a Household, find the head of household's user
        if ($payer instanceof Household) {
            return $this->findUserForHousehold($payer);
        }

        // Step 4: If payer is a Business, find the contact person's user
        if ($payer instanceof Business) {
            return $this->findUserForBusiness($payer);
        }

        return null;
    }

    /**
     * Find user for a Resident payer
     */
    private function findUserForResident(Resident $resident)
    {
        // Find the household member record for this resident
        $householdMember = HouseholdMember::where('resident_id', $resident->id)->first();
        
        if ($householdMember) {
            // First try: Find user with exact current_resident_id match
            $user = User::where('household_id', $householdMember->household_id)
                ->where('current_resident_id', $resident->id)
                ->first();
            
            if ($user) {
                Log::info('Found user with exact resident match', [
                    'resident_id' => $resident->id,
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                return $user;
            }

            // Second try: If resident is the household head, find the main household user
            if ($householdMember->is_head) {
                $user = User::where('household_id', $householdMember->household_id)
                    ->where('role_id', function($query) {
                        // Assuming role_id for Household Head is stored somewhere
                        // You may need to adjust this based on your roles
                        $query->select('id')->from('roles')->where('name', 'Household Head');
                    })
                    ->first();
                
                if ($user) {
                    Log::info('Found household head user', [
                        'resident_id' => $resident->id,
                        'user_id' => $user->id
                    ]);
                    return $user;
                }
            }

            // Third try: Any user in the household
            $user = User::where('household_id', $householdMember->household_id)->first();
            
            if ($user) {
                Log::info('Found any household user', [
                    'resident_id' => $resident->id,
                    'user_id' => $user->id
                ]);
                return $user;
            }
        }

        // If no household member found, check if resident has direct user relation
        $user = User::where('current_resident_id', $resident->id)->first();
        
        if ($user) {
            Log::info('Found direct user for resident', [
                'resident_id' => $resident->id,
                'user_id' => $user->id
            ]);
            return $user;
        }

        return null;
    }

    /**
     * Find user for a Household payer
     */
    private function findUserForHousehold(Household $household)
    {
        // Find the head of household
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();

        if ($headMember) {
            // Find user associated with the head resident
            return $this->findUserForResident($headMember->resident);
        }

        // If no head found, try any user in the household
        $user = User::where('household_id', $household->id)->first();
        
        if ($user) {
            Log::info('Found user for household', [
                'household_id' => $household->id,
                'user_id' => $user->id
            ]);
            return $user;
        }

        return null;
    }

    /**
     * Find user for a Business payer
     */
    private function findUserForBusiness(Business $business)
    {
        // Check if business has a contact person
        if (isset($business->contact_person_id)) {
            $user = User::find($business->contact_person_id);
            if ($user) {
                Log::info('Found contact person for business', [
                    'business_id' => $business->id,
                    'user_id' => $user->id
                ]);
                return $user;
            }
        }

        // Check if business has an owner/representative user
        if (isset($business->owner_id)) {
            $user = User::find($business->owner_id);
            if ($user) {
                Log::info('Found owner for business', [
                    'business_id' => $business->id,
                    'user_id' => $user->id
                ]);
                return $user;
            }
        }

        return null;
    }

 /**
 * Get statistics about fees due soon.
 */
public function getDueStats(Request $request)
{
    try {
        Log::debug('FeeController@getDueStats called', [
            'user_id' => Auth::id(),
            'request_data' => $request->all()
        ]);

        $days = (int) $request->input('days', 7);
        
        $stats = [
            'total_due' => Fee::whereDate('due_date', '<=', now()->addDays($days))
                              ->whereDate('due_date', '>=', now())
                              ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                              ->count(),
            'due_today' => Fee::whereDate('due_date', now())
                              ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                              ->count(),
            'due_tomorrow' => Fee::whereDate('due_date', now()->addDay())
                                ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                                ->count(),
            'due_this_week' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])
                                  ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                                  ->count(),
            'overdue' => Fee::whereDate('due_date', '<', now())
                           ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                           ->count(),
        ];

        Log::info('Due stats retrieved successfully', [
            'days' => $days,
            'stats' => $stats
        ]);

        // Return ONLY the dueStats data as Inertia response
        return Inertia::render('admin/Fees/Index', [
            'dueStats' => $stats,
            'flash' => session('flash')
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to get due stats', [
            'user_id' => Auth::id(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->with('error', 'Failed to fetch due statistics');
    }
}
    /**
     * Get reminder history for a fee.
     */
    public function getReminderHistory($id)
    {
        try {
            Log::debug('FeeController@getReminderHistory called', [
                'user_id' => Auth::id(),
                'fee_id' => $id
            ]);

            $fee = Fee::findOrFail($id);

            // Get notification history for this fee from the notifications table
            $reminders = DB::table('notifications')
                ->where('type', 'App\Notifications\FeeDueReminderNotification')
                ->where('data', 'like', '%"fee_id":' . $id . '%')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    $data = json_decode($notification->data, true);
                    return [
                        'id' => $notification->id,
                        'notifiable_id' => $notification->notifiable_id,
                        'sent_at' => Carbon::parse($notification->created_at)->format('M d, Y h:i A'),
                        'read_at' => $notification->read_at ? Carbon::parse($notification->read_at)->format('M d, Y h:i A') : null,
                        'days_until_due' => $data['days_until_due'] ?? null,
                        'status' => $data['status'] ?? 'unknown',
                        'is_read' => !is_null($notification->read_at),
                        'fee_code' => $data['fee_code'] ?? null,
                        'payer_name' => $data['payer_name'] ?? null
                    ];
                });

            Log::info('Reminder history retrieved', [
                'fee_id' => $id,
                'reminder_count' => $reminders->count()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => $reminders
                ]);
            }

            return back()->with('reminders', $reminders);

        } catch (\Exception $e) {
            Log::error('Failed to get reminder history', [
                'user_id' => Auth::id(),
                'fee_id' => $id,
                'error' => $e->getMessage()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch reminder history'
                ], 500);
            }

            return back()->with('error', 'Failed to fetch reminder history');
        }
    }

    // Quick stats (from route: fees.quickStats)
    public function quickStats(Request $request)
    {
        try {
            $period = $request->get('period', 'today');

            Log::debug('FeeController@quickStats called', [
                'period' => $period,
                'user_id' => Auth::id()
            ]);

            $query = Fee::query();

            switch ($period) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'week':
                    $query->whereBetween('created_at', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ]);
                    break;
                case 'month':
                    $query->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year);
                    break;
                case 'year':
                    $query->whereYear('created_at', now()->year);
                    break;
            }

            $stats = [
                'count' => $query->count(),
                'total_amount' => $query->sum('total_amount'),
                'collected' => $query->where('status', 'paid')->sum('amount_paid'),
                'pending' => $query->whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            ];

            Log::info('FeeController@quickStats completed', [
                'period' => $period,
                'stats' => $stats
            ]);

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('FeeController@quickStats error', [
                'user_id' => Auth::id(),
                'period' => $period ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    // Status chart data (from route: fees.statusChart)
    public function statusChartData()
    {
        try {
            Log::debug('FeeController@statusChartData called', ['user_id' => Auth::id()]);

            $data = Fee::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            $chartData = [
                'labels' => [],
                'datasets' => [
                    [
                        'label' => 'Number of Fees',
                        'data' => [],
                        'backgroundColor' => [
                            '#fbbf24', // pending - yellow
                            '#60a5fa', // issued - blue
                            '#a78bfa', // partially_paid - purple
                            '#34d399', // paid - green
                            '#f87171', // overdue - red
                            '#9ca3af', // cancelled - gray
                            '#c084fc', // waived - purple
                        ]
                    ]
                ]
            ];

            $statuses = [
                'pending',
                'issued',
                'partially_paid',
                'paid',
                'overdue',
                'cancelled',
                'waived'
            ];

            foreach ($statuses as $status) {
                $chartData['labels'][] = ucfirst(str_replace('_', ' ', $status));
                $chartData['datasets'][0]['data'][] = $data[$status]->count ?? 0;
            }

            Log::info('FeeController@statusChartData completed', [
                'total_records' => array_sum($chartData['datasets'][0]['data'])
            ]);

            return response()->json($chartData);

        } catch (\Exception $e) {
            Log::error('FeeController@statusChartData error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'labels' => [],
                'datasets' => [[]]
            ], 500);
        }
    }

    // Monthly collection chart (from route: fees.monthlyCollectionChart)
    public function monthlyCollectionChart()
    {
        try {
            Log::debug('FeeController@monthlyCollectionChart called', ['user_id' => Auth::id()]);

            $data = Fee::selectRaw('
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    SUM(total_amount) as total,
                    SUM(amount_paid) as collected
                ')
                ->where('status', 'paid')
                ->whereYear('created_at', '>=', now()->subYear()->year)
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            $labels = [];
            $totals = [];
            $collected = [];

            foreach ($data as $item) {
                $date = Carbon::create($item->year, $item->month, 1);
                $labels[] = $date->format('M Y');
                $totals[] = $item->total;
                $collected[] = $item->collected;
            }

            Log::info('FeeController@monthlyCollectionChart completed', [
                'data_points' => count($labels)
            ]);

            return response()->json([
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Total Amount',
                        'data' => $totals,
                        'borderColor' => '#60a5fa',
                        'backgroundColor' => 'rgba(96, 165, 250, 0.1)',
                    ],
                    [
                        'label' => 'Amount Collected',
                        'data' => $collected,
                        'borderColor' => '#34d399',
                        'backgroundColor' => 'rgba(52, 211, 153, 0.1)',
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@monthlyCollectionChart error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'labels' => [],
                'datasets' => [[]]
            ], 500);
        }
    }

    // Dashboard (from route: fees.dashboard)
    public function dashboard()
    {
        try {
            Log::debug('FeeController@dashboard accessed', ['user_id' => Auth::id()]);

            $today = now()->toDateString();

            $stats = [
                'total_fees' => Fee::count(),
                'today_fees' => Fee::whereDate('created_at', $today)->count(),
                'total_collected' => Fee::where('status', 'paid')->sum('amount_paid'),
                'pending_collection' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
                'overdue_fees' => Fee::where('status', 'overdue')->count(),
                'due_soon_count' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])
                                      ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                                      ->count(),
                'due_soon_amount' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])
                                       ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                                       ->sum('balance')
            ];

            $recentFees = Fee::with(['feeType'])
                ->latest()
                ->limit(10)
                ->get();

            $monthlyCollections = Fee::select(
                DB::raw('MONTH(payment_date) as month'),
                DB::raw('YEAR(payment_date) as year'),
                DB::raw('SUM(amount_paid) as total')
            )
                ->where('status', 'paid')
                ->whereYear('payment_date', now()->year)
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            $feesByCategory = Fee::select(
                'fee_types.document_category_id',
                DB::raw('COUNT(fees.id) as count'),
                DB::raw('SUM(fees.total_amount) as total')
            )
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.document_category_id')
                ->get();

            Log::info('Fee dashboard data loaded', [
                'stats' => $stats,
                'recent_fees_count' => $recentFees->count()
            ]);

            return Inertia::render('admin/Fees/Dashboard', [
                'stats' => $stats,
                'recentFees' => $recentFees,
                'monthlyCollections' => $monthlyCollections,
                'feesByCategory' => $feesByCategory,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@dashboard error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load dashboard. Please try again.');
        }
    }

    // Outstanding fees (from route: fees.outstanding)
    public function outstanding(Request $request)
    {
        try {
            Log::info('FeeController@outstanding accessed', [
                'user_id' => Auth::id(),
                'filters' => $request->all()
            ]);

            $search = $request->input('search', '');
            $status = $request->input('status', 'overdue');
            $purok = $request->input('purok', '');

            $query = Fee::with(['feeType'])
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->orderBy('due_date');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('fee_code', 'like', "%{$search}%")
                        ->orWhere('payer_name', 'like', "%{$search}%");
                });
            }

            if ($status === 'overdue') {
                $query->where('due_date', '<', Carbon::today());
            } elseif ($status === 'pending') {
                $query->where('due_date', '>=', Carbon::today());
            }

            if ($purok) {
                $query->where('purok', $purok);
            }

            $fees = $query->paginate(20)->withQueryString();

            $totalOutstanding = Fee::where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->sum('balance');

            $overdueCount = Fee::where('balance', '>', 0)
                ->where('due_date', '<', Carbon::today())
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->count();

            $pendingCount = Fee::where('balance', '>', 0)
                ->where('due_date', '>=', Carbon::today())
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->count();

            $overdueFees = Fee::where('balance', '>', 0)
                ->where('due_date', '<', Carbon::today())
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->get();

            $averageDaysOverdue = $overdueFees->count() > 0
                ? $overdueFees->avg(function ($fee) {
                    return Carbon::parse($fee->due_date)->diffInDays(Carbon::today());
                })
                : 0;

            $puroks = Fee::whereNotNull('purok')
                ->distinct()
                ->pluck('purok')
                ->sort()
                ->values();

            Log::info('Outstanding fees report generated', [
                'total_outstanding' => $totalOutstanding,
                'overdue_count' => $overdueCount,
                'pending_count' => $pendingCount,
                'average_days_overdue' => $averageDaysOverdue,
                'filtered_count' => $fees->total()
            ]);

            return Inertia::render('admin/Fees/Outstanding', [
                'fees' => $fees,
                'stats' => [
                    'totalOutstanding' => $totalOutstanding,
                    'overdueCount' => $overdueCount,
                    'pendingCount' => $pendingCount,
                    'averageDaysOverdue' => round($averageDaysOverdue, 1),
                ],
                'puroks' => $puroks,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'purok' => $purok,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@outstanding error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load outstanding fees. Please try again.');
        }
    }

    // Export fees (from route: fees.export)
    public function export(Request $request)
    {
        try {
            Log::info('FeeController@export started', [
                'user_id' => Auth::id(),
                'export_filters' => $request->all()
            ]);

            $query = Fee::query()
                ->with(['feeType'])
                ->latest();

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('payer_name', 'like', "%{$search}%")
                        ->orWhere('or_number', 'like', "%{$search}%")
                        ->orWhere('certificate_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category) {
                $query->whereHas('feeType', function ($q) use ($request) {
                    $q->where('document_category_id', $request->category);
                });
            }

            if ($request->has('from_date') && $request->from_date) {
                $query->whereDate('issue_date', '>=', $request->from_date);
            }

            if ($request->has('to_date') && $request->to_date) {
                $query->whereDate('issue_date', '<=', $request->to_date);
            }

            $fees = $query->get();

            $fileName = 'fees_export_' . date('Y-m-d_H-i-s') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ];

            Log::info('Fee export completed', [
                'record_count' => $fees->count(),
                'filename' => $fileName
            ]);

            $callback = function () use ($fees) {
                $file = fopen('php://output', 'w');
                fwrite($file, "\xEF\xBB\xBF");

                fputcsv($file, [
                    'ID',
                    'Fee Code',
                    'Fee Type',
                    'Document Category ID',
                    'Payer Name',
                    'Payer Type',
                    'Contact Number',
                    'Purok',
                    'Issue Date',
                    'Due Date',
                    'Base Amount',
                    'Surcharge',
                    'Penalty',
                    'Discount',
                    'Total Amount',
                    'Amount Paid',
                    'Balance',
                    'Status',
                    'OR Number',
                    'Certificate Number',
                    'User ID',
                    'Created At'
                ]);

                foreach ($fees as $fee) {
                    fputcsv($file, [
                        $fee->id,
                        $fee->fee_code,
                        $fee->feeType->name ?? 'N/A',
                        $fee->feeType->document_category_id ?? 'N/A',
                        $fee->payer_name,
                        $fee->payer_type,
                        $fee->contact_number,
                        $fee->purok,
                        $fee->issue_date,
                        $fee->due_date,
                        $fee->base_amount,
                        $fee->surcharge_amount,
                        $fee->penalty_amount,
                        $fee->discount_amount,
                        $fee->total_amount,
                        $fee->amount_paid,
                        $fee->balance,
                        $fee->status,
                        $fee->or_number,
                        $fee->certificate_number,
                        $fee->user_id,
                        $fee->created_at,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Fee export failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to export fees. Please try again.');
        }
    }

    // Bulk action (from route: fees.bulk-action)
    public function bulkAction(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@bulkAction started', [
                'user_id' => Auth::id(),
                'action' => $request->action,
                'fee_ids_count' => count($request->fee_ids ?? [])
            ]);

            $request->validate([
                'action' => 'required|in:issue,mark_paid,cancel,delete,send_reminders',
                'fee_ids' => 'required|array',
                'fee_ids.*' => 'exists:fees,id',
            ]);

            $count = 0;
            $processedFees = [];

            foreach ($request->fee_ids as $feeId) {
                $fee = Fee::find($feeId);

                switch ($request->action) {
                    case 'issue':
                        if ($fee->status === 'pending') {
                            $fee->update(['status' => 'issued']);
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'issued'];
                        }
                        break;

                    case 'mark_paid':
                        if (in_array($fee->status, ['issued', 'partially_paid', 'overdue'])) {
                            $fee->applyPayment($fee->balance, null, [
                                'payment_date' => now(),
                                'payment_method' => 'cash',
                                'collected_by' => auth()->id(),
                            ]);
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'marked_paid', 'amount' => $fee->balance];
                        }
                        break;

                    case 'cancel':
                        if (in_array($fee->status, ['pending', 'issued'])) {
                            $fee->update([
                                'status' => 'cancelled',
                                'cancelled_by' => auth()->id(),
                                'cancelled_at' => now(),
                            ]);
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'cancelled'];
                        }
                        break;

                    case 'delete':
                        if ($fee->status === 'pending') {
                            $fee->delete();
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'deleted'];
                        }
                        break;

                    case 'send_reminders':
                        // Get the user for this fee
                        $user = $this->getNotifiableUserForFee($fee);
                        
                        if ($user && $user->email && !in_array($fee->status, ['paid', 'cancelled', 'waived'])) {
                            $daysUntilDue = (int) now()->diffInDays($fee->due_date, false);
                            $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));
                            $count++;
                            $processedFees[] = [
                                'id' => $fee->id, 
                                'action' => 'reminder_sent',
                                'user_id' => $user->id,
                                'days_until_due' => $daysUntilDue
                            ];
                        }
                        break;
                }
            }

            DB::commit();

            Log::info('Bulk action completed', [
                'action' => $request->action,
                'successful_count' => $count,
                'processed_fees' => $processedFees
            ]);

            $message = $request->action === 'send_reminders' 
                ? "{$count} reminders sent successfully."
                : "{$count} fees updated successfully.";

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bulk action failed', [
                'user_id' => Auth::id(),
                'action' => $request->action ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to perform bulk action. Please try again.');
        }
    }

    // Helper method to get payer details
    private function getPayerDetails($fee)
    {
        // Return basic payer info from the fee record itself
        $details = [
            'name' => $fee->payer_name,
            'contact' => $fee->contact_number,
            'purok' => $fee->purok,
            'address' => $fee->address,
            'type' => $fee->payer_type,
        ];

        // Try to get additional details from the related model if possible
        if ($fee->payer_id && $fee->payer_type) {
            try {
                $modelClass = $this->normalizeModelClass($fee->payer_type);

                if (class_exists($modelClass)) {
                    $payerModel = $modelClass::find($fee->payer_id);
                    if ($payerModel) {
                        if ($modelClass === Resident::class) {
                            $details['full_name'] = ($payerModel->first_name ?? '') . ' ' . ($payerModel->last_name ?? '');
                            $details['first_name'] = $payerModel->first_name ?? '';
                            $details['last_name'] = $payerModel->last_name ?? '';
                            $details['middle_name'] = $payerModel->middle_name ?? '';
                            $details['is_senior'] = $payerModel->is_senior ?? false;
                            $details['is_pwd'] = $payerModel->is_pwd ?? false;
                            $details['is_solo_parent'] = $payerModel->is_solo_parent ?? false;
                            $details['is_indigent'] = $payerModel->is_indigent ?? false;
                            
                            // Add household information
                            $householdMember = HouseholdMember::where('resident_id', $payerModel->id)->first();
                            if ($householdMember) {
                                $details['household_id'] = $householdMember->household_id;
                                $details['is_household_head'] = $householdMember->is_head;
                                
                                // Find associated user
                                $user = User::where('household_id', $householdMember->household_id)
                                    ->where('current_resident_id', $payerModel->id)
                                    ->first();
                                if ($user) {
                                    $details['user_id'] = $user->id;
                                    $details['user_email'] = $user->email;
                                }
                            }
                        } elseif ($modelClass === Household::class) {
                            $details['head_of_family'] = $payerModel->head_of_family ?? '';
                            $details['household_number'] = $payerModel->household_number ?? '';
                        } elseif ($modelClass === Business::class) {
                            $details['business_name'] = $payerModel->name ?? '';
                            $details['owner'] = $payerModel->owner_name ?? '';
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to load detailed payer info', [
                    'fee_id' => $fee->id,
                    'payer_type' => $fee->payer_type,
                    'payer_id' => $fee->payer_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $details;
    }

    // Helper to normalize model class names
    private function normalizeModelClass($className)
    {
        if (empty($className)) {
            return null;
        }

        if (class_exists($className)) {
            return $className;
        }

        $modelMap = [
            'resident' => Resident::class,
            'Resident' => Resident::class,
            'household' => Household::class,
            'Household' => Household::class,
            'business' => 'App\Models\Business',
            'Business' => 'App\Models\Business',
            'visitor' => 'App\Models\Visitor',
            'Visitor' => 'App\Models\Visitor',
        ];

        return $modelMap[$className] ?? $className;
    }

    // Helper method to get payer type icon
    private function getPayerTypeIcon($payerType)
    {
        $icons = [
            'resident' => 'user',
            'business' => 'building',
            'household' => 'home',
            'visitor' => 'user',
            'other' => 'user',
        ];

        return $icons[$payerType] ?? 'user';
    }

    // Helper method to get statistics
    private function getStatistics()
    {
        return [
            'total' => Fee::count(),
            'total_amount' => Fee::sum('total_amount'),
            'total_collected' => Fee::sum('amount_paid'),
            'collected' => Fee::where('status', 'paid')->sum('amount_paid'),
            'pending' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            'overdue_count' => Fee::where('status', 'overdue')->count(),
            'due_soon_count' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])
                                  ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
                                  ->count(),

            'today_count' => Fee::whereDate('created_at', today())->count(),
            'today_amount' => Fee::whereDate('created_at', today())->sum('total_amount'),
            'today_collected' => Fee::whereDate('created_at', today())->sum('amount_paid'),
            
            'this_month_count' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'this_month_amount' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            'this_month_collected' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_paid'),

            'status_counts' => [
                'pending' => Fee::where('status', 'pending')->count(),
                'issued' => Fee::where('status', 'issued')->count(),
                'partially_paid' => Fee::where('status', 'partially_paid')->count(),
                'paid' => Fee::where('status', 'paid')->count(),
                'overdue' => Fee::where('status', 'overdue')->count(),
                'cancelled' => Fee::where('status', 'cancelled')->count(),
                'waived' => Fee::where('status', 'waived')->count(),
            ],

            'category_totals' => Fee::selectRaw('fee_types.document_category_id, COUNT(fees.id) as count, SUM(fees.total_amount) as total_amount, SUM(fees.amount_paid) as total_collected')
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.document_category_id')
                ->get()
                ->keyBy('document_category_id')
                ->toArray(),
        ];
    }

    // Helper method to get status label
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Pending',
            'issued' => 'Issued',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'waived' => 'Waived',
            'written_off' => 'Written Off',
        ];

        return $labels[$status] ?? ucfirst($status);
    }
}