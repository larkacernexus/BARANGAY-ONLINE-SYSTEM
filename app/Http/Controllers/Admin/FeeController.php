<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Business;
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
use Illuminate\Database\Eloquent\Builder;

class FeeController extends Controller
{
    /**
     * Display list of fees
     */
    public function index(Request $request)
    {
        try {
            Log::info('FeeController@index accessed', [
                'user_id' => Auth::id(),
                'filters' => $request->all()
            ]);

            // Build query with eager loading
            $query = Fee::query()
                ->with([
                    'feeType:id,name,code,document_category_id,is_discountable',
                    'paymentItems.payment' => function ($query) {
                        $query->select('id', 'payment_date', 'total_amount', 'or_number', 'status');
                    }
                ])
                ->latest();

            // Apply filters
            $this->applyFilters($query, $request);

            // Get paginated results
            $perPage = $request->get('per_page', 20);
            $fees = $query->paginate($perPage)
                ->withQueryString()
                ->through(fn($fee) => $this->formatFeeForDisplay($fee));

            // Get filter options
            $filterOptions = $this->getFilterOptions();

            Log::info('FeeController@index completed', [
                'fee_count' => $fees->total()
            ]);

            return Inertia::render('admin/Fees/Index', [
                'fees' => $fees,
                'filters' => $request->only([
                    'search', 'status', 'category', 'purok', 
                    'payer_type', 'from_date', 'to_date', 'min_amount', 'max_amount'
                ]),
                ...$filterOptions,
                'quickStats' => $this->getQuickStats(),
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fees. Please try again.');
        }
    }

    /**
     * Send reminders for fees due soon
     */
    public function sendDueReminders(Request $request)
    {
        try {
            Log::info('FeeController@sendDueReminders started');

            $validated = $request->validate([
                'days' => 'nullable|integer|min:0|max:30',
                'fee_ids' => 'nullable|array',
                'fee_ids.*' => 'exists:fees,id'
            ]);

            $days = (int) ($validated['days'] ?? 7);
            $feeIds = $validated['fee_ids'] ?? null;

            $fees = $this->getFeesForReminders($days, $feeIds);
            $results = $this->sendReminders($fees);

            $message = "Sent {$results['sent']} reminders successfully. Skipped {$results['skipped']} fees.";

            if (!$request->wantsJson()) {
                return redirect()->back()->with('flash', [
                    'message' => $message,
                    'type' => 'success'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                ...$results
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send fee reminders', ['error' => $e->getMessage()]);

            $errorMessage = 'Failed to send reminders: ' . $e->getMessage();

            if (!$request->wantsJson()) {
                return redirect()->back()->with('flash', [
                    'message' => $errorMessage,
                    'type' => 'error'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 500);
        }
    }

    /**
     * Send reminder for a single fee
     */
    public function sendSingleReminder($id)
    {
        try {
            Log::info('FeeController@sendSingleReminder started', ['fee_id' => $id]);

            $fee = Fee::with('payer')->findOrFail($id);
            
            $validationError = $this->validateFeeForReminder($fee);
            if ($validationError) {
                return $this->handleReminderError($validationError);
            }

            $user = $this->getNotifiableUserForFee($fee);
            
            if (!$user) {
                return $this->handleReminderError('No user found to send notification to.');
            }

            if (!$user->email) {
                return $this->handleReminderError('User has no email address.');
            }

            $daysUntilDue = (int) now()->diffInDays($fee->due_date, false);
            $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));

            Log::info('Single fee reminder sent', ['fee_id' => $id, 'user_id' => $user->id]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Reminder sent successfully.',
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

            return back()->with('success', 'Reminder sent successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to send single reminder', ['fee_id' => $id, 'error' => $e->getMessage()]);
            return $this->handleReminderError('Failed to send reminder: ' . $e->getMessage());
        }
    }

    /**
     * Get due statistics
     */
    public function getDueStats(Request $request)
    {
        try {
            $days = (int) $request->input('days', 7);
            
            $stats = [
                'total_due' => $this->countDueFees(now(), now()->addDays($days)),
                'due_today' => $this->countDueFees(now(), now()),
                'due_tomorrow' => $this->countDueFees(now()->addDay(), now()->addDay()),
                'due_this_week' => $this->countDueFees(now(), now()->addDays(7)),
                'overdue' => $this->countOverdueFees(),
            ];

            return Inertia::render('admin/Fees/Index', ['dueStats' => $stats]);

        } catch (\Exception $e) {
            Log::error('Failed to get due stats', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to fetch due statistics');
        }
    }

    /**
     * Get reminder history for a fee
     */
    public function getReminderHistory($id)
    {
        try {
            $fee = Fee::findOrFail($id);

            $reminders = DB::table('notifications')
                ->where('type', 'App\Notifications\FeeDueReminderNotification')
                ->where('data', 'like', '%"fee_id":' . $id . '%')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($notification) => $this->formatReminderHistory($notification));

            if (request()->wantsJson()) {
                return response()->json(['success' => true, 'data' => $reminders]);
            }

            return back()->with('reminders', $reminders);

        } catch (\Exception $e) {
            Log::error('Failed to get reminder history', ['fee_id' => $id, 'error' => $e->getMessage()]);
            return $this->handleError('Failed to fetch reminder history');
        }
    }

    /**
     * Get quick statistics (API)
     */
    public function quickStats(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $stats = $this->getPeriodStats($period);
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('FeeController@quickStats error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch statistics'], 500);
        }
    }

    /**
     * Get status chart data
     */
    public function statusChartData()
    {
        try {
            $data = Fee::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');
            return response()->json($this->buildStatusChartData($data));
        } catch (\Exception $e) {
            Log::error('FeeController@statusChartData error', ['error' => $e->getMessage()]);
            return response()->json(['labels' => [], 'datasets' => [[]]], 500);
        }
    }

    /**
     * Get monthly collection chart data
     */
    public function monthlyCollectionChart()
    {
        try {
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

            return response()->json($this->buildMonthlyChartData($data));
        } catch (\Exception $e) {
            Log::error('FeeController@monthlyCollectionChart error', ['error' => $e->getMessage()]);
            return response()->json(['labels' => [], 'datasets' => [[]]], 500);
        }
    }

    /**
     * Display dashboard
     */
    public function dashboard()
    {
        try {
            $stats = $this->getDashboardStats();
            $recentFees = Fee::with('feeType')->latest()->limit(10)->get();
            $monthlyCollections = $this->getMonthlyCollections();
            $feesByCategory = $this->getFeesByCategory();

            return Inertia::render('admin/Fees/Dashboard', [
                'stats' => $stats,
                'recentFees' => $recentFees,
                'monthlyCollections' => $monthlyCollections,
                'feesByCategory' => $feesByCategory,
            ]);
        } catch (\Exception $e) {
            Log::error('FeeController@dashboard error', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load dashboard.');
        }
    }

    /**
     * Display outstanding fees
     */
    public function outstanding(Request $request)
    {
        try {
            $filters = $request->only(['search', 'status', 'purok']);
            
            $query = Fee::with('feeType')
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->orderBy('due_date');

            $this->applyOutstandingFilters($query, $filters);

            $fees = $query->paginate(20)->withQueryString();
            $stats = $this->getOutstandingStats();
            $puroks = $this->getDistinctPuroks();

            return Inertia::render('admin/Fees/Outstanding', [
                'fees' => $fees,
                'stats' => $stats,
                'puroks' => $puroks,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            Log::error('FeeController@outstanding error', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to load outstanding fees.');
        }
    }

    /**
     * Export fees
     */
    public function export(Request $request)
    {
        try {
            $query = Fee::query()->with('feeType')->latest();
            $this->applyFilters($query, $request);

            $fees = $query->get();
            $fileName = 'fees_export_' . now()->format('Y-m-d_H-i-s') . '.csv';

            return $this->generateCsvExport($fees, $fileName);
        } catch (\Exception $e) {
            Log::error('Fee export failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to export fees.');
        }
    }

    /**
     * Perform bulk actions on fees
     */
    public function bulkAction(Request $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'action' => 'required|in:issue,mark_paid,cancel,delete,send_reminders',
                'fee_ids' => 'required|array',
                'fee_ids.*' => 'exists:fees,id',
            ]);

            $results = $this->processBulkAction($validated['action'], $validated['fee_ids']);
            DB::commit();

            $message = $validated['action'] === 'send_reminders'
                ? "{$results['count']} reminders sent successfully."
                : "{$results['count']} fees updated successfully.";

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk action failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to perform bulk action.');
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply filters to query
     */
    private function applyFilters(Builder $query, Request $request): void
    {
        // Search filter
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('payer_name', 'like', "%{$search}%")
                    ->orWhere('or_number', 'like', "%{$search}%")
                    ->orWhere('certificate_number', 'like', "%{$search}%")
                    ->orWhere('fee_code', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('purok', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Category filter
        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('feeType', fn($q) => $q->where('document_category_id', $request->category));
        }

        // Purok filter
        if ($request->filled('purok') && $request->purok !== 'all') {
            $query->where('purok', $request->purok);
        }

        // ✅ FIXED: Payer Type filter - convert frontend value to database value
        if ($request->filled('payer_type') && $request->payer_type !== 'all') {
            $payerTypeValue = $this->normalizePayerTypeForDatabase($request->payer_type);
            $query->where('payer_type', $payerTypeValue);
        }

        // Date range filter (created_at)
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Amount range filter (min/max)
        if ($request->filled('min_amount')) {
            $query->where('total_amount', '>=', (float) $request->min_amount);
        }
        if ($request->filled('max_amount')) {
            $query->where('total_amount', '<=', (float) $request->max_amount);
        }

        // Amount range preset
        if ($request->filled('amount_range')) {
            $this->applyAmountRangeFilter($query, $request->amount_range);
        }

        // Due date range filter
        if ($request->filled('due_date_range')) {
            $this->applyDueDateRangeFilter($query, $request->due_date_range);
        }
    }

    /**
     * Normalize payer type from frontend value to database value
     */
    private function normalizePayerTypeForDatabase(string $payerType): string
    {
        $mapping = [
            'resident' => 'App\Models\Resident',
            'household' => 'App\Models\Household',
            'business' => 'App\Models\Business',
            'visitor' => 'App\Models\Visitor',
            'other' => 'App\Models\Other',
        ];
        
        return $mapping[strtolower($payerType)] ?? $payerType;
    }

    /**
     * Apply amount range filter
     */
    private function applyAmountRangeFilter(Builder $query, string $range): void
    {
        switch ($range) {
            case '0-100':
                $query->whereBetween('total_amount', [0, 100]);
                break;
            case '101-500':
                $query->whereBetween('total_amount', [101, 500]);
                break;
            case '501-1000':
                $query->whereBetween('total_amount', [501, 1000]);
                break;
            case '1001-5000':
                $query->whereBetween('total_amount', [1001, 5000]);
                break;
            case '5000+':
                $query->where('total_amount', '>=', 5000);
                break;
        }
    }

    /**
     * Apply due date range filter
     */
    private function applyDueDateRangeFilter(Builder $query, string $range): void
    {
        $today = Carbon::today();
        
        switch ($range) {
            case 'overdue':
                $query->where('due_date', '<', $today)
                      ->whereNotIn('status', ['paid', 'cancelled', 'waived']);
                break;
            case 'due_today':
                $query->whereDate('due_date', $today);
                break;
            case 'due_this_week':
                $query->whereBetween('due_date', [$today, $today->copy()->endOfWeek()]);
                break;
            case 'due_next_week':
                $query->whereBetween('due_date', [$today->copy()->startOfWeek()->addWeek(), $today->copy()->endOfWeek()->addWeek()]);
                break;
            case 'due_this_month':
                $query->whereBetween('due_date', [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()]);
                break;
        }
    }

    /**
     * Format fee for display
     */
    private function formatFeeForDisplay(Fee $fee): array
    {
        $payerTypeLabel = $this->getPayerTypeLabel($fee->payer_type);
        
        return [
            'id' => $fee->id,
            'fee_code' => $fee->fee_code,
            'payer_name' => $fee->payer_name,
            'payer_type' => $payerTypeLabel,
            'payer_type_raw' => $fee->payer_type,
            'status' => $fee->status,
            'total_amount' => $fee->total_amount,
            'amount_paid' => $fee->amount_paid,
            'balance' => $fee->balance,
            'issue_date' => $fee->issue_date,
            'due_date' => $fee->due_date,
            'or_number' => $fee->or_number,
            'purok' => $fee->purok,
            'contact_number' => $fee->contact_number,
            'certificate_number' => $fee->certificate_number,
            'fee_type' => $fee->feeType ? [
                'id' => $fee->feeType->id,
                'name' => $fee->feeType->name,
                'code' => $fee->feeType->code,
                'document_category_id' => $fee->feeType->document_category_id,
            ] : null,
            'formatted_issue_date' => $fee->issue_date ? Carbon::parse($fee->issue_date)->format('M d, Y') : 'N/A',
            'formatted_due_date' => $fee->due_date ? Carbon::parse($fee->due_date)->format('M d, Y') : 'N/A',
            'formatted_created_at' => Carbon::parse($fee->created_at)->format('M d, Y h:i A'),
            'is_overdue' => $fee->status === 'overdue',
            'days_overdue' => $fee->status === 'overdue' && $fee->due_date ? Carbon::parse($fee->due_date)->diffInDays(now()) : 0,
            'payer_type_icon' => $this->getPayerTypeIcon($fee->payer_type),
            'formatted_total_amount' => '₱' . number_format($fee->total_amount, 2),
            'formatted_amount_paid' => '₱' . number_format($fee->amount_paid, 2),
            'formatted_balance' => '₱' . number_format($fee->balance, 2),
            'created_at' => $fee->created_at,
        ];
    }

    /**
     * Get payer type label for frontend
     */
    private function getPayerTypeLabel(string $payerType): string
    {
        $mapping = [
            'App\Models\Resident' => 'resident',
            'App\Models\Household' => 'household',
            'App\Models\Business' => 'business',
            'App\Models\Visitor' => 'visitor',
            'App\Models\Other' => 'other',
        ];
        
        return $mapping[$payerType] ?? 'other';
    }

    /**
     * Get filter options for the index page
     */
    private function getFilterOptions(): array
    {
        return [
            'statuses' => [
                'pending' => 'Pending',
                'issued' => 'Issued',
                'partially_paid' => 'Partially Paid',
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'cancelled' => 'Cancelled',
                'waived' => 'Waived',
                'written_off' => 'Written Off',
            ],
            'categories' => DocumentCategory::active()
                ->ordered()
                ->pluck('name', 'id')
                ->toArray(),
            'payerTypes' => [
                'resident' => 'Resident',
                'business' => 'Business',
                'household' => 'Household',
                'visitor' => 'Visitor',
                'other' => 'Other',
            ],
            'puroks' => Fee::whereNotNull('purok')
                ->distinct('purok')
                ->pluck('purok')
                ->filter()
                ->sort()
                ->values(),
            'stats' => $this->getStatistics(),
        ];
    }

    /**
     * Get quick stats for the index page
     */
    private function getQuickStats(): array
    {
        $stats = $this->getStatistics();
        
        return [
            'all' => $stats['total'],
            'pending' => $stats['status_counts']['pending'],
            'issued' => $stats['status_counts']['issued'],
            'overdue' => $stats['status_counts']['overdue'],
            'paid' => $stats['status_counts']['paid'],
        ];
    }

    /**
     * Get statistics
     */
    private function getStatistics(): array
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
        ];
    }

    /**
     * Get payer type icon
     */
    private function getPayerTypeIcon($payerType): string
    {
        $type = is_string($payerType) ? $payerType : '';
        
        if (str_contains($type, 'Resident')) return 'user';
        if (str_contains($type, 'Business')) return 'building';
        if (str_contains($type, 'Household')) return 'home';
        
        return match ($type) {
            'resident' => 'user',
            'business' => 'building',
            'household' => 'home',
            default => 'user',
        };
    }

    /**
     * Get fees for reminders
     */
    private function getFeesForReminders(int $days, ?array $feeIds = null)
    {
        $query = Fee::with('payer');
        $query->whereNotIn('status', ['paid', 'cancelled', 'waived']);

        if ($feeIds) {
            $query->whereIn('id', $feeIds);
        } elseif ($days === 0) {
            $query->whereDate('due_date', '<', now());
        } else {
            $query->whereDate('due_date', '<=', now()->addDays($days))
                  ->whereDate('due_date', '>=', now());
        }

        return $query->get();
    }

    /**
     * Send reminders to fees
     */
    private function sendReminders($fees): array
    {
        $sent = 0;
        $skipped = 0;

        foreach ($fees as $fee) {
            $user = $this->getNotifiableUserForFee($fee);
            
            if ($user && $user->email) {
                $daysUntilDue = (int) now()->diffInDays($fee->due_date, false);
                $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));
                $sent++;
            } else {
                $skipped++;
            }
        }

        return ['sent' => $sent, 'skipped' => $skipped, 'total' => $sent + $skipped];
    }

    /**
     * Get notifiable user for a fee
     */
    private function getNotifiableUserForFee(Fee $fee): ?User
    {
        $payer = $fee->payer;
        
        if (!$payer) return null;

        if ($payer instanceof Resident) {
            return $this->findUserForResident($payer);
        }

        if ($payer instanceof Household) {
            return $this->findUserForHousehold($payer);
        }

        if ($payer instanceof Business) {
            return $this->findUserForBusiness($payer);
        }

        return null;
    }

    /**
     * Find user for a resident
     */
    private function findUserForResident(Resident $resident): ?User
    {
        $householdMember = HouseholdMember::where('resident_id', $resident->id)->first();
        
        if ($householdMember) {
            $user = User::where('household_id', $householdMember->household_id)
                ->where('current_resident_id', $resident->id)
                ->first();

            if ($user) return $user;

            if ($householdMember->is_head) {
                $user = User::where('household_id', $householdMember->household_id)
                    ->whereHas('role', fn($q) => $q->where('name', 'Household Head'))
                    ->first();
                if ($user) return $user;
            }

            $user = User::where('household_id', $householdMember->household_id)->first();
            if ($user) return $user;
        }

        return User::where('current_resident_id', $resident->id)->first();
    }

    /**
     * Find user for a household
     */
    private function findUserForHousehold(Household $household): ?User
    {
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();

        if ($headMember && $headMember->resident) {
            return $this->findUserForResident($headMember->resident);
        }

        return User::where('household_id', $household->id)->first();
    }

    /**
     * Find user for a business
     */
    private function findUserForBusiness(Business $business): ?User
    {
        if ($business->contact_person_id) return User::find($business->contact_person_id);
        if ($business->owner_id) return User::find($business->owner_id);
        return null;
    }

    /**
     * Validate if fee can receive reminder
     */
    private function validateFeeForReminder(Fee $fee): ?string
    {
        if (in_array($fee->status, ['paid', 'cancelled', 'waived'])) {
            return 'Cannot send reminder for paid, cancelled, or waived fees.';
        }
        return null;
    }

    /**
     * Handle reminder error response
     */
    private function handleReminderError(string $message)
    {
        if (request()->wantsJson()) {
            return response()->json(['success' => false, 'message' => $message], 400);
        }
        return back()->with('error', $message);
    }

    /**
     * Count due fees in date range
     */
    private function countDueFees($startDate, $endDate): int
    {
        return Fee::whereBetween('due_date', [$startDate, $endDate])
            ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
            ->count();
    }

    /**
     * Count overdue fees
     */
    private function countOverdueFees(): int
    {
        return Fee::whereDate('due_date', '<', now())
            ->whereNotIn('status', ['paid', 'cancelled', 'waived'])
            ->count();
    }

    /**
     * Format reminder history item
     */
    private function formatReminderHistory($notification): array
    {
        $data = json_decode($notification->data, true);
        
        return [
            'id' => $notification->id,
            'sent_at' => Carbon::parse($notification->created_at)->format('M d, Y h:i A'),
            'read_at' => $notification->read_at ? Carbon::parse($notification->read_at)->format('M d, Y h:i A') : null,
            'days_until_due' => $data['days_until_due'] ?? null,
            'is_read' => !is_null($notification->read_at),
            'fee_code' => $data['fee_code'] ?? null,
            'payer_name' => $data['payer_name'] ?? null
        ];
    }

    /**
     * Handle error response
     */
    private function handleError(string $message)
    {
        if (request()->wantsJson()) {
            return response()->json(['success' => false, 'message' => $message], 500);
        }
        return back()->with('error', $message);
    }

    /**
     * Get statistics for a period
     */
    private function getPeriodStats(string $period): array
    {
        $query = Fee::query();

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->year);
                break;
        }

        return [
            'count' => $query->count(),
            'total_amount' => $query->sum('total_amount'),
            'collected' => $query->where('status', 'paid')->sum('amount_paid'),
            'pending' => $query->whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
        ];
    }

    /**
     * Build status chart data
     */
    private function buildStatusChartData($data): array
    {
        $statuses = ['pending', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled', 'waived'];
        $colors = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f87171', '#9ca3af', '#c084fc'];

        $labels = [];
        $values = [];

        foreach ($statuses as $index => $status) {
            $labels[] = ucfirst(str_replace('_', ' ', $status));
            $values[] = $data[$status] ?? 0;
        }

        return [
            'labels' => $labels,
            'datasets' => [['label' => 'Number of Fees', 'data' => $values, 'backgroundColor' => $colors]]
        ];
    }

    /**
     * Build monthly chart data
     */
    private function buildMonthlyChartData($data): array
    {
        $labels = [];
        $totals = [];
        $collected = [];

        foreach ($data as $item) {
            $date = Carbon::create($item->year, $item->month, 1);
            $labels[] = $date->format('M Y');
            $totals[] = $item->total;
            $collected[] = $item->collected;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Total Amount', 'data' => $totals, 'borderColor' => '#60a5fa', 'backgroundColor' => 'rgba(96, 165, 250, 0.1)'],
                ['label' => 'Amount Collected', 'data' => $collected, 'borderColor' => '#34d399', 'backgroundColor' => 'rgba(52, 211, 153, 0.1)']
            ]
        ];
    }

    /**
     * Get dashboard statistics
     */
    private function getDashboardStats(): array
    {
        return [
            'total_fees' => Fee::count(),
            'today_fees' => Fee::whereDate('created_at', today())->count(),
            'total_collected' => Fee::where('status', 'paid')->sum('amount_paid'),
            'pending_collection' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            'overdue_fees' => Fee::where('status', 'overdue')->count(),
            'due_soon_count' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])->whereNotIn('status', ['paid', 'cancelled', 'waived'])->count(),
            'due_soon_amount' => Fee::whereBetween('due_date', [now(), now()->addDays(7)])->whereNotIn('status', ['paid', 'cancelled', 'waived'])->sum('balance')
        ];
    }

    /**
     * Get monthly collections data
     */
    private function getMonthlyCollections()
    {
        return Fee::select(DB::raw('MONTH(payment_date) as month, YEAR(payment_date) as year, SUM(amount_paid) as total'))
            ->where('status', 'paid')
            ->whereYear('payment_date', now()->year)
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    }

    /**
     * Get fees by category
     */
    private function getFeesByCategory()
    {
        return Fee::select('fee_types.document_category_id', DB::raw('COUNT(fees.id) as count, SUM(fees.total_amount) as total'))
            ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
            ->groupBy('fee_types.document_category_id')
            ->get();
    }

    /**
     * Apply outstanding filters
     */
    private function applyOutstandingFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('fee_code', 'like', "%{$search}%")->orWhere('payer_name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'overdue') {
                $query->where('due_date', '<', Carbon::today());
            } elseif ($filters['status'] === 'pending') {
                $query->where('due_date', '>=', Carbon::today());
            }
        }

        if (!empty($filters['purok'])) {
            $query->where('purok', $filters['purok']);
        }
    }

    /**
     * Get outstanding statistics
     */
    private function getOutstandingStats(): array
    {
        $overdueFees = Fee::where('balance', '>', 0)
            ->where('due_date', '<', Carbon::today())
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->get();

        $totalOutstanding = Fee::where('balance', '>', 0)->whereIn('status', ['pending', 'issued', 'partially_paid'])->sum('balance');
        $overdueCount = Fee::where('balance', '>', 0)->where('due_date', '<', Carbon::today())->whereIn('status', ['pending', 'issued', 'partially_paid'])->count();
        $pendingCount = Fee::where('balance', '>', 0)->where('due_date', '>=', Carbon::today())->whereIn('status', ['pending', 'issued', 'partially_paid'])->count();
        $averageDaysOverdue = $overdueFees->count() > 0 ? $overdueFees->avg(fn($fee) => Carbon::parse($fee->due_date)->diffInDays(Carbon::today())) : 0;

        return [
            'totalOutstanding' => $totalOutstanding,
            'overdueCount' => $overdueCount,
            'pendingCount' => $pendingCount,
            'averageDaysOverdue' => round($averageDaysOverdue, 1),
        ];
    }

    /**
     * Get distinct puroks
     */
    private function getDistinctPuroks()
    {
        return Fee::whereNotNull('purok')->distinct()->pluck('purok')->sort()->values();
    }

    /**
     * Generate CSV export
     */
    private function generateCsvExport($fees, string $fileName)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        $callback = function () use ($fees) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'ID', 'Fee Code', 'Fee Type', 'Payer Name', 'Payer Type', 'Contact Number',
                'Purok', 'Issue Date', 'Due Date', 'Total Amount', 'Amount Paid', 'Balance',
                'Status', 'OR Number', 'Certificate Number', 'Created At'
            ]);

            foreach ($fees as $fee) {
                fputcsv($file, [
                    $fee->id, $fee->fee_code, $fee->feeType->name ?? 'N/A', $fee->payer_name,
                    $fee->payer_type, $fee->contact_number, $fee->purok, $fee->issue_date,
                    $fee->due_date, $fee->total_amount, $fee->amount_paid, $fee->balance,
                    $fee->status, $fee->or_number, $fee->certificate_number, $fee->created_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Process bulk action
     */
    private function processBulkAction(string $action, array $feeIds): array
    {
        $count = 0;

        foreach ($feeIds as $feeId) {
            $fee = Fee::find($feeId);
            if (!$fee) continue;

            $success = match ($action) {
                'issue' => $this->bulkIssue($fee),
                'mark_paid' => $this->bulkMarkPaid($fee),
                'cancel' => $this->bulkCancel($fee),
                'delete' => $this->bulkDelete($fee),
                'send_reminders' => $this->bulkSendReminder($fee),
                default => false
            };

            if ($success) $count++;
        }

        return ['count' => $count];
    }

    /**
     * Bulk issue fee
     */
    private function bulkIssue(Fee $fee): bool
    {
        if ($fee->status === 'pending') return $fee->update(['status' => 'issued']);
        return false;
    }

    /**
     * Bulk mark fee as paid
     */
    private function bulkMarkPaid(Fee $fee): bool
    {
        if (in_array($fee->status, ['issued', 'partially_paid', 'overdue'])) {
            $fee->applyPayment($fee->balance, null, ['payment_date' => now(), 'payment_method' => 'cash', 'collected_by' => auth()->id()]);
            return true;
        }
        return false;
    }

    /**
     * Bulk cancel fee
     */
    private function bulkCancel(Fee $fee): bool
    {
        if (in_array($fee->status, ['pending', 'issued'])) {
            return $fee->update(['status' => 'cancelled', 'cancelled_by' => auth()->id(), 'cancelled_at' => now()]);
        }
        return false;
    }

    /**
     * Bulk delete fee
     */
    private function bulkDelete(Fee $fee): bool
    {
        if ($fee->status === 'pending') return $fee->delete();
        return false;
    }

    /**
     * Bulk send reminder
     */
    private function bulkSendReminder(Fee $fee): bool
    {
        $user = $this->getNotifiableUserForFee($fee);
        if ($user && $user->email && !in_array($fee->status, ['paid', 'cancelled', 'waived'])) {
            $daysUntilDue = (int) now()->diffInDays($fee->due_date, false);
            $user->notify(new FeeDueReminderNotification($fee, $daysUntilDue));
            return true;
        }
        return false;
    }
}