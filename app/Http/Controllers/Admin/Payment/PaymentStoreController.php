<?php
// app/Http/Controllers/Admin/Payment/PaymentStoreController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Payment;
use App\Models\Fee;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\User;
use App\Models\HouseholdMember;
use App\Models\ClearanceRequest;
use App\Models\PaymentDiscount;
use App\Models\DiscountRule;
use App\Models\Receipt;
use App\Notifications\PaymentProcessedNotification;
use App\Notifications\PaymentReceiptNotification;
use App\Notifications\ClearancePaymentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentStoreController extends BasePaymentController
{
    /**
     * Store a newly created payment in storage.
     */
    public function store(Request $request)
    {
        $this->logPaymentActivity('STORE_REQUEST', [
            'items_count' => count($request->input('items', [])),
        ]);

        // Normalize payer_type
        $normalizedRequest = $this->normalizePayerType($request);
        
        // Validate request
        $validated = $this->validatePaymentRequest($normalizedRequest);

        // Recalculate total amount
        $validated = $this->recalculateTotals($validated);

        // Generate OR number if needed
        $validated['or_number'] = $this->processOrNumber($validated);

        // Validate and process items
        $processedItems = $this->processPaymentItems($validated['items']);

        $feeIdsToUpdate = $processedItems['fee_ids'];
        $clearanceIdsToUpdate = $processedItems['clearance_ids'];
        $validated['items'] = $processedItems['items'];

        $this->logPaymentActivity('STORE_VALIDATED', [
            'total_items' => count($validated['items']),
            'fee_ids' => $feeIdsToUpdate,
            'clearance_ids' => $clearanceIdsToUpdate,
        ]);

        DB::beginTransaction();

        try {
            // Create payment record
            $payment = $this->createPayment($validated);

            // Fetch related records
            $outstandingFees = $this->fetchOutstandingFees($validated, $feeIdsToUpdate);
            $clearanceRequests = $this->fetchClearanceRequests($clearanceIdsToUpdate);

            // Calculate discount distribution
            $itemDiscountAmounts = $this->calculateDiscountDistribution($validated['items'], $validated['discount']);

            // Create payment items and update related records
            $processedItemsResult = $this->createPaymentItems(
                $payment, 
                $validated['items'], 
                $outstandingFees, 
                $clearanceRequests,
                $itemDiscountAmounts,
                $validated
            );

            // Process discounts
            $this->processDiscounts($payment, $validated);

            DB::commit();

            // Create receipt
            $receipt = $this->createReceipt($payment);

            // ========== SEND NOTIFICATIONS AFTER SUCCESSFUL COMMIT ==========
            $this->sendPaymentNotifications($payment, $processedItemsResult, $validated, $receipt);

            // Reload payment with relationships
            $payment->load(['items', 'discounts.rule', 'receipt']);

            $this->logPaymentActivity('STORE_SUCCESS', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'total_amount' => $payment->total_amount,
                'discount' => $payment->discount,
                'amount_paid' => $payment->amount_paid,
                'status' => $payment->status,
                'processed_items' => $processedItemsResult,
            ]);

            // Redirect with success message
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment recorded successfully! Receipt: ' . $payment->or_number,
                    'payment' => $payment
                ]);
            }

            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Payment recorded successfully! Receipt: ' . $payment->or_number);

        } catch (\Exception $e) {
            DB::rollBack();
            
            $this->logPaymentActivity('STORE_ERROR', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to record payment: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to record payment: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Normalize payer_type in request
     */
    private function normalizePayerType(Request $request): Request
    {
        $requestData = $request->all();
        
        $payerTypeMap = [
            'App\\Models\\Resident' => 'resident',
            'App\\Models\\Household' => 'household',
            'App\\Models\\Business' => 'business',
            'resident' => 'resident',
            'household' => 'household',
            'business' => 'business',
            'other' => 'other',
        ];
        
        $originalPayerType = $request->input('payer_type');
        $normalizedPayerType = $payerTypeMap[$originalPayerType] ?? 'other';
        
        $requestData['payer_type'] = $normalizedPayerType;
        
        $this->logPaymentActivity('STORE_NORMALIZE', [
            'original' => $originalPayerType,
            'normalized' => $normalizedPayerType,
        ]);

        return new Request($requestData);
    }

    /**
     * Validate payment request
     */
    private function validatePaymentRequest(Request $request): array
    {
        return $request->validate([
            'payer_type' => 'required|in:resident,household,business,other',
            'payer_id' => 'required',
            'payer_name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'household_number' => 'nullable|string|max:50',
            'purok' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'period_covered' => 'nullable|string|max:100',
            'or_number' => 'nullable|string|max:100',
            'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
            'subtotal' => 'required|numeric|min:0',
            'surcharge' => 'required|numeric|min:0',
            'penalty' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'purpose' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
            'is_cleared' => 'boolean',
            'validity_date' => 'nullable|date',
            'collection_type' => 'required|in:manual,system',
            'method_details' => 'nullable|array',
            'items' => 'required|array|min:1',
            'verification_id_number' => 'nullable|string',
            'verification_remarks' => 'nullable|string',
            'discount_code' => 'nullable|string',
            'discount_type' => 'nullable|string',
            'discounts' => 'nullable|array',
            'discounts.*.discount_rule_id' => 'nullable|exists:discount_rules,id',
            'discounts.*.discount_type' => 'required_with:discounts|string',
            'discounts.*.discount_amount' => 'required_with:discounts|numeric|min:0',
            'discounts.*.id_number' => 'nullable|string',
            'discounts.*.id_presented' => 'boolean',
        ]);
    }

    /**
     * Recalculate totals to ensure accuracy
     */
    private function recalculateTotals(array $validated): array
    {
        $calculatedTotal = $validated['subtotal'] + $validated['surcharge'] + $validated['penalty'];
        
        if (abs($calculatedTotal - $validated['total_amount']) > 0.01) {
            $this->logPaymentActivity('STORE_TOTAL_MISMATCH', [
                'provided_total' => $validated['total_amount'],
                'calculated_total' => $calculatedTotal,
            ]);
            $validated['total_amount'] = $calculatedTotal;
        }

        return $validated;
    }

    /**
     * Process OR number
     */
    private function processOrNumber(array $validated): string
    {
        $orNumber = $validated['or_number'] ?? $this->generateOrNumber(); // Using parent method
        
        if (Payment::where('or_number', $orNumber)->exists()) {
            $this->logPaymentActivity('STORE_OR_EXISTS', ['existing_or' => $orNumber]);
            $orNumber = $this->generateOrNumber(); // Using parent method
        }
        
        return $orNumber;
    }

    /**
     * Process payment items
     */
    private function processPaymentItems(array $items): array
    {
        $validatedItems = [];
        $feeIdsToUpdate = [];
        $clearanceIdsToUpdate = [];

        foreach ($items as $index => $item) {
            $itemData = validator($item, [
                'item_type' => 'nullable|in:fee,clearance',
                'fee_id' => 'nullable',
                'fee_type_id' => 'nullable',
                'outstanding_fee_id' => 'nullable',
                'clearance_request_id' => 'nullable',
                'fee_name' => 'required|string|max:255',
                'fee_code' => 'required|string|max:50',
                'description' => 'nullable|string|max:500',
                'base_amount' => 'required|numeric|min:0',
                'surcharge' => 'required|numeric|min:0',
                'penalty' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'category' => 'required|string|max:50',
                'period_covered' => 'nullable|string|max:100',
                'months_late' => 'nullable|integer|min:0',
                'metadata' => 'nullable|array',
            ])->validate();

            // Track fee IDs
            $feeId = $this->extractFeeId($itemData);
            if ($feeId && is_numeric($feeId)) {
                $feeIdsToUpdate[] = $feeId;
            }

            // Track clearance IDs
            $clearanceId = $this->extractClearanceId($itemData);
            if ($clearanceId) {
                $clearanceIdsToUpdate[] = $clearanceId;
            }

            // Determine if this is a clearance item
            $isClearance = !empty($itemData['clearance_request_id']) || 
                          ($itemData['metadata']['is_clearance_fee'] ?? false) || 
                          $itemData['category'] === 'clearance' ||
                          (is_string($itemData['outstanding_fee_id'] ?? null) && 
                           strpos($itemData['outstanding_fee_id'] ?? '', 'clearance-') === 0);

            $validatedItems[] = [
                'item_type' => $isClearance ? 'clearance' : 'fee',
                'fee_id' => $feeId,
                'fee_type_id' => $itemData['fee_type_id'] ?? null,
                'outstanding_fee_id' => $itemData['outstanding_fee_id'] ?? null,
                'clearance_request_id' => $itemData['clearance_request_id'] ?? $clearanceId,
                'fee_name' => $itemData['fee_name'],
                'fee_code' => $itemData['fee_code'],
                'description' => $itemData['description'] ?? null,
                'base_amount' => floatval($itemData['base_amount']),
                'surcharge' => floatval($itemData['surcharge']),
                'penalty' => floatval($itemData['penalty']),
                'total_amount' => floatval($itemData['total_amount']),
                'category' => $itemData['category'],
                'period_covered' => $itemData['period_covered'] ?? null,
                'months_late' => $itemData['months_late'] ?? 0,
                'metadata' => $itemData['metadata'] ?? [],
                'is_clearance' => $isClearance,
            ];
        }

        return [
            'items' => $validatedItems,
            'fee_ids' => array_unique($feeIdsToUpdate),
            'clearance_ids' => array_unique($clearanceIdsToUpdate),
        ];
    }

    /**
     * Extract fee ID from item data
     */
    private function extractFeeId(array $itemData)
    {
        if (!empty($itemData['outstanding_fee_id'])) {
            return $itemData['outstanding_fee_id'];
        } elseif (!empty($itemData['fee_id'])) {
            return $itemData['fee_id'];
        }
        return null;
    }

    /**
     * Extract clearance ID from item data
     */
    private function extractClearanceId(array $itemData)
    {
        if (!empty($itemData['clearance_request_id'])) {
            return $itemData['clearance_request_id'];
        }
        
        if (!empty($itemData['metadata']['clearance_request_id'])) {
            return $itemData['metadata']['clearance_request_id'];
        }
        
        if (!empty($itemData['outstanding_fee_id']) && is_string($itemData['outstanding_fee_id']) && 
            strpos($itemData['outstanding_fee_id'], 'clearance-') === 0) {
            return str_replace('clearance-', '', $itemData['outstanding_fee_id']);
        }
        
        return null;
    }

    /**
     * Create payment record
     */
    private function createPayment(array $validated): Payment
    {
        $amountDue = $validated['total_amount'] - $validated['discount'];
        
        $status = 'completed';
        if ($validated['amount_paid'] <= 0) {
            $status = 'pending';
        } elseif ($validated['amount_paid'] < $amountDue - 0.01) {
            $status = 'partially_paid';
        }

        $recordedBy = Auth::id() ?? 1;

        $paymentData = [
            'status' => $status,
            'collection_type' => $validated['collection_type'] ?? 'manual',
            'or_number' => $validated['or_number'],
            'payer_type' => $validated['payer_type'],
            'payer_id' => $validated['payer_id'],
            'payer_name' => $validated['payer_name'],
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'household_number' => $validated['household_number'] ?? null,
            'purok' => $validated['purok'] ?? null,
            'payment_date' => $validated['payment_date'],
            'period_covered' => $validated['period_covered'] ?? null,
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'subtotal' => floatval($validated['subtotal']),
            'surcharge' => floatval($validated['surcharge']),
            'penalty' => floatval($validated['penalty']),
            'discount' => floatval($validated['discount']),
            'amount_paid' => floatval($validated['amount_paid']),
            'total_amount' => floatval($validated['total_amount']),
            'purpose' => $validated['purpose'],
            'remarks' => $validated['remarks'] ?? null,
            'is_cleared' => $validated['is_cleared'] ?? false,
            'validity_date' => $validated['validity_date'] ?? null,
            'method_details' => !empty($validated['method_details']) ? json_encode($validated['method_details']) : null,
            'recorded_by' => $recordedBy,
            'discount_code' => $validated['discount_code'] ?? null,
            'discount_type' => $validated['discount_type'] ?? null,
        ];

        $payment = Payment::create($paymentData);

        $this->logPaymentActivity('STORE_PAYMENT_CREATED', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'status' => $status,
        ]);

        return $payment;
    }

    /**
     * Fetch outstanding fees
     */
    private function fetchOutstandingFees(array $validated, array $feeIdsToUpdate)
    {
        if (empty($feeIdsToUpdate)) {
            return collect();
        }

        $payerModelClass = $this->getPayerModelClass($validated['payer_type']); // Using parent method

        return Fee::where('payer_type', $payerModelClass)
            ->where('payer_id', $validated['payer_id'])
            ->whereIn('id', $feeIdsToUpdate)
            ->get()
            ->keyBy('id');
    }

    /**
     * Fetch clearance requests
     */
    private function fetchClearanceRequests(array $clearanceIdsToUpdate)
    {
        if (empty($clearanceIdsToUpdate)) {
            return collect();
        }

        return ClearanceRequest::whereIn('id', $clearanceIdsToUpdate)
            ->get()
            ->keyBy('id');
    }

    /**
     * Calculate discount distribution across items
     */
    private function calculateDiscountDistribution(array $items, float $totalDiscount): array
    {
        $itemDiscountAmounts = [];
        $totalBaseAmount = array_sum(array_column($items, 'base_amount'));

        if ($totalDiscount > 0 && $totalBaseAmount > 0) {
            foreach ($items as $index => $item) {
                $itemBaseAmount = floatval($item['base_amount']);
                $itemProportion = $itemBaseAmount / $totalBaseAmount;
                $itemDiscountAmounts[$index] = $totalDiscount * $itemProportion;
            }
        }

        return $itemDiscountAmounts;
    }

    /**
     * Create payment items and update related records
     */
    private function createPaymentItems(
        Payment $payment, 
        array $items, 
        $outstandingFees, 
        $clearanceRequests,
        array $itemDiscountAmounts,
        array $validated
    ): array {
        $feeIdsPaid = [];
        $clearanceIdsPaid = [];
        $processedItems = [
            'clearance' => [],
            'fees' => [],
        ];

        $totalBaseAmount = array_sum(array_column($items, 'base_amount'));
        $recordedBy = Auth::id() ?? 1;
        $recordedByName = Auth::user()->name ?? 'System';

        foreach ($items as $index => $item) {
            $itemDiscountAmount = $itemDiscountAmounts[$index] ?? 0;

            $paymentItemData = [
                'payment_id' => $payment->id,
                'fee_name' => $item['fee_name'],
                'fee_code' => $item['fee_code'],
                'description' => $item['description'] ?? null,
                'base_amount' => $item['base_amount'],
                'surcharge' => $item['surcharge'],
                'penalty' => $item['penalty'],
                'total_amount' => $item['total_amount'],
                'category' => $item['category'],
                'period_covered' => $item['period_covered'] ?? null,
                'months_late' => $item['months_late'] ?? 0,
                'fee_metadata' => json_encode($item['metadata'] ?? []),
                'discount_amount' => $itemDiscountAmount,
                'discount_type' => $validated['discount_type'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Build discount breakdown
            $itemDiscountBreakdown = $this->buildDiscountBreakdown($validated, $item, $totalBaseAmount);
            $paymentItemData['discount_breakdown'] = json_encode($itemDiscountBreakdown);

            // Handle clearance request
            if (!empty($item['clearance_request_id']) && isset($clearanceRequests[$item['clearance_request_id']])) {
                $result = $this->updateClearanceRequest(
                    $clearanceRequests[$item['clearance_request_id']],
                    $payment,
                    $validated,
                    $recordedBy,
                    $recordedByName
                );
                $clearanceIdsPaid[] = $item['clearance_request_id'];
                $processedItems['clearance'][] = $result;
                $paymentItemData['clearance_request_id'] = $item['clearance_request_id'];
            }

            // Handle fee
            if (!$item['is_clearance'] && !empty($item['fee_id']) && isset($outstandingFees[$item['fee_id']])) {
                $result = $this->updateFee(
                    $outstandingFees[$item['fee_id']],
                    $payment,
                    $validated,
                    $itemDiscountAmount,
                    $recordedBy
                );
                $feeIdsPaid[] = $item['fee_id'];
                $processedItems['fees'][] = $result;
                $paymentItemData['fee_id'] = $item['fee_id'];
            }

            DB::table('payment_items')->insert($paymentItemData);
        }

        return $processedItems;
    }

    /**
     * Build discount breakdown for an item
     */
    private function buildDiscountBreakdown(array $validated, array $item, float $totalBaseAmount): array
    {
        $breakdown = [];

        if (!empty($validated['discounts'])) {
            foreach ($validated['discounts'] as $discount) {
                $itemBaseAmount = floatval($item['base_amount']);
                $discountProportion = $itemBaseAmount / $totalBaseAmount;
                $allocatedDiscountAmount = $discount['discount_amount'] * $discountProportion;

                $breakdown[] = [
                    'discount_rule_id' => $discount['discount_rule_id'] ?? null,
                    'discount_type' => $discount['discount_type'],
                    'discount_amount' => $allocatedDiscountAmount,
                    'id_number' => $discount['id_number'] ?? null,
                    'id_presented' => $discount['id_presented'] ?? false,
                ];
            }
        }

        return $breakdown;
    }

    /**
     * Update clearance request after payment
     */
    private function updateClearanceRequest(
        $clearanceRequest, 
        Payment $payment, 
        array $validated, 
        int $recordedBy, 
        string $recordedByName
    ): array {
        $oldAmountPaid = $clearanceRequest->amount_paid ?? 0;
        $oldBalance = $clearanceRequest->balance ?? $clearanceRequest->fee_amount;
        $oldStatus = $clearanceRequest->status;
        $oldPaymentStatus = $clearanceRequest->payment_status;

        $actualAmountPaid = $validated['amount_paid'];
        $newAmountPaid = $oldAmountPaid + $actualAmountPaid;
        $newBalance = max(0, ($clearanceRequest->fee_amount ?? 0) - $newAmountPaid);

        $paymentStatus = 'unpaid';
        if ($newAmountPaid > 0 && $newBalance <= 0) {
            $paymentStatus = 'paid';
        } elseif ($newAmountPaid > 0) {
            $paymentStatus = 'partially_paid';
        }

        $newRequestStatus = $clearanceRequest->status;
        if ($paymentStatus === 'paid') {
            $newRequestStatus = 'paid';
        } elseif ($paymentStatus === 'partially_paid') {
            $newRequestStatus = 'pending_payment';
        }

        $clearanceRequest->update([
            'payment_id' => $payment->id,
            'payment_status' => $paymentStatus,
            'amount_paid' => $newAmountPaid,
            'balance' => $newBalance,
            'payment_date' => $validated['payment_date'],
            'or_number' => $payment->or_number,
            'status' => $newRequestStatus,
            'issuing_officer_id' => $recordedBy,
            'issuing_officer_name' => $recordedByName,
            'processed_at' => $paymentStatus === 'paid' ? now() : $clearanceRequest->processed_at,
            'processed_by' => $paymentStatus === 'paid' ? $recordedBy : $clearanceRequest->processed_by,
        ]);

        return [
            'id' => $clearanceRequest->id,
            'reference' => $clearanceRequest->reference_number,
            'old_amount_paid' => $oldAmountPaid,
            'new_amount_paid' => $newAmountPaid,
            'old_balance' => $oldBalance,
            'new_balance' => $newBalance,
            'old_status' => $oldStatus,
            'new_status' => $newRequestStatus,
            'old_payment_status' => $oldPaymentStatus,
            'new_payment_status' => $paymentStatus,
            'amount_allocated' => $actualAmountPaid,
            'is_fully_paid' => $paymentStatus === 'paid',
        ];
    }

    /**
     * Update fee after payment
     */
    private function updateFee($fee, Payment $payment, array $validated, float $itemDiscountAmount, int $recordedBy): array
    {
        $oldAmountPaid = $fee->amount_paid ?? 0;
        $oldBalance = $fee->balance ?? $fee->total_amount;
        $oldStatus = $fee->status;
        $oldDiscountAmount = $fee->discount_amount ?? 0;

        $actualAmountPaid = $validated['amount_paid'];
        $newAmountPaid = $oldAmountPaid + $actualAmountPaid;
        $newDiscountAmount = $oldDiscountAmount + $itemDiscountAmount;
        $totalSettledValue = $newAmountPaid + $newDiscountAmount;
        $newBalance = max(0, $fee->total_amount - $totalSettledValue);

        $newStatus = $fee->status;
        if ($totalSettledValue >= $fee->total_amount - 0.01) {
            $newStatus = 'paid';
        } elseif ($totalSettledValue > 0) {
            $newStatus = 'partially_paid';
        }

        $fee->update([
            'balance' => $newBalance,
            'amount_paid' => $newAmountPaid,
            'discount_amount' => $newDiscountAmount,
            'status' => $newStatus,
            'last_payment_date' => $validated['payment_date'],
            'last_payment_or' => $payment->or_number,
            'payment_id' => $payment->id,
            'collected_by' => $recordedBy,
            'updated_by' => $recordedBy,
            'or_number' => $payment->or_number,
        ]);

        return [
            'id' => $fee->id,
            'code' => $fee->fee_code,
            'old_amount_paid' => $oldAmountPaid,
            'new_amount_paid' => $newAmountPaid,
            'old_balance' => $oldBalance,
            'new_balance' => $newBalance,
            'old_discount_amount' => $oldDiscountAmount,
            'new_discount_amount' => $newDiscountAmount,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'amount_allocated' => $actualAmountPaid,
            'discount_allocated' => $itemDiscountAmount,
            'total_settled_value' => $totalSettledValue,
            'total_amount' => $fee->total_amount,
            'is_fully_paid' => $totalSettledValue >= $fee->total_amount - 0.01,
        ];
    }

    /**
     * Process discounts
     */
    private function processDiscounts(Payment $payment, array $validated): void
    {
        $recordedBy = Auth::id() ?? 1;

        // Multiple discounts
        if (!empty($validated['discounts'])) {
            foreach ($validated['discounts'] as $discountIndex => $discount) {
                $discountData = [
                    'payment_id' => $payment->id,
                    'discount_rule_id' => $discount['discount_rule_id'] ?? null,
                    'discount_amount' => $discount['discount_amount'],
                    'discount_type' => $discount['discount_type'],
                    'id_number' => $discount['id_number'] ?? null,
                    'id_presented' => $discount['id_presented'] ?? false,
                    'verified_by' => $recordedBy,
                    'verified_at' => now(),
                    'remarks' => $validated['verification_remarks'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                PaymentDiscount::create($discountData);
            }
        }
        // Single discount (backward compatibility)
        elseif (!empty($validated['discount_code']) && !empty($validated['verification_id_number'])) {
            $discountRule = DiscountRule::where('code', $validated['discount_code'])->first();

            if ($discountRule) {
                PaymentDiscount::create([
                    'payment_id' => $payment->id,
                    'discount_rule_id' => $discountRule->id,
                    'discount_amount' => $validated['discount'],
                    'discount_type' => $validated['discount_type'] ?? $discountRule->code,
                    'verified_by' => $recordedBy,
                    'verified_at' => now(),
                    'id_presented' => true,
                    'id_number' => $validated['verification_id_number'],
                    'remarks' => $validated['verification_remarks'] ?? null,
                ]);
            }
        }
    }

    /**
     * Create receipt for payment
     */
    private function createReceipt(Payment $payment): ?Receipt
    {
        if (!in_array($payment->status, ['completed', 'partially_paid'])) {
            return null;
        }

        try {
            $receiptType = 'official';
            if (str_contains(strtolower($payment->purpose ?? ''), 'clearance')) {
                $receiptType = 'clearance';
            } elseif (str_contains(strtolower($payment->purpose ?? ''), 'certificate')) {
                $receiptType = 'certificate';
            } elseif ($payment->items()->where('category', 'fee')->exists()) {
                $receiptType = 'fee';
            }

            $clearanceRequest = $payment->items()
                ->whereNotNull('clearance_request_id')
                ->first()?->clearanceRequest;

            $fee = $payment->items()
                ->whereNotNull('fee_id')
                ->first()?->fee;

            $receipt = \App\Models\Receipt::createFromPayment($payment, $receiptType);

            if ($clearanceRequest) {
                $receipt->receiptable()->associate($clearanceRequest);
            } elseif ($fee) {
                $receipt->receiptable()->associate($fee);
            }

            $receipt->metadata = array_merge($receipt->metadata ?? [], [
                'created_from' => 'payment_creation',
                'created_at' => now()->toIso8601String(),
                'recorded_by' => Auth::id(),
                'recorded_by_name' => Auth::user()->name ?? 'System',
            ]);
            $receipt->save();

            $this->logPaymentActivity('RECEIPT_CREATED', [
                'payment_id' => $payment->id,
                'receipt_id' => $receipt->id,
                'receipt_number' => $receipt->receipt_number,
            ]);

            return $receipt;

        } catch (\Exception $e) {
            $this->logPaymentActivity('RECEIPT_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * ========== NOTIFICATION METHODS ==========
     */

    /**
     * Send notifications after payment is processed
     */
    protected function sendPaymentNotifications(Payment $payment, array $processedItems, array $validated, ?Receipt $receipt): void
    {
        try {
            $this->logPaymentActivity('NOTIFICATION_START', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'payer_type' => $payment->payer_type,
                'payer_id' => $payment->payer_id,
            ]);

            // Get users to notify (including the payer)
            $usersToNotify = $this->getUsersToNotify($payment);
            
            // ALWAYS try to get the payer user directly
            $payerUser = $this->getPayerUser($payment);
            if ($payerUser && !$usersToNotify->contains('id', $payerUser->id)) {
                $usersToNotify->push($payerUser);
                $this->logPaymentActivity('NOTIFICATION_ADDED_PAYER', [
                    'user_id' => $payerUser->id,
                    'user_name' => $payerUser->name,
                ]);
            }

            if ($usersToNotify->isEmpty()) {
                $this->logPaymentActivity('NOTIFICATION_NO_USERS', [
                    'payment_id' => $payment->id,
                ]);
                return;
            }

            // Log users being notified
            foreach ($usersToNotify as $user) {
                $this->logPaymentActivity('NOTIFICATION_USER', [
                    'user_id' => $user->id,
                    'user_name' => $user->name ?? $user->full_name,
                    'user_email' => $user->email,
                    'is_payer' => $this->isUserPayer($user, $payment),
                ]);
            }

            // Prepare notification data
            $items = $payment->items->map(function($item) {
                return [
                    'fee_name' => $item->fee_name,
                    'fee_code' => $item->fee_code,
                    'category' => $item->category,
                    'base_amount' => $item->base_amount,
                    'surcharge' => $item->surcharge,
                    'penalty' => $item->penalty,
                    'discount_amount' => $item->discount_amount,
                    'total_amount' => $item->total_amount,
                ];
            })->toArray();

            $action = match($payment->status) {
                'completed' => 'completed',
                'partially_paid' => 'partially_paid',
                'pending' => 'pending',
                'refunded' => 'refunded',
                'cancelled' => 'cancelled',
                default => 'processed',
            };

            // Send Payment Processed Notification to all users
            foreach ($usersToNotify as $user) {
                $user->notify(new PaymentProcessedNotification(
                    $payment,
                    $action,
                    $items,
                    $receipt
                ));
                
                $this->logPaymentActivity('NOTIFICATION_SENT_PAYMENT', [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'action' => $action,
                ]);
            }

            // Send Receipt Notification if receipt exists
            if ($receipt) {
                foreach ($usersToNotify as $user) {
                    $user->notify(new PaymentReceiptNotification($payment, $receipt));
                    
                    $this->logPaymentActivity('NOTIFICATION_SENT_RECEIPT', [
                        'user_id' => $user->id,
                        'receipt_id' => $receipt->id,
                        'receipt_number' => $receipt->receipt_number,
                    ]);
                }
            }

            // Send Clearance Payment Notifications - FIXED PARAMETER ORDER
            if (!empty($processedItems['clearance'])) {
                foreach ($processedItems['clearance'] as $clearanceData) {
                    $clearanceRequest = ClearanceRequest::with(['clearanceType', 'resident'])
                        ->find($clearanceData['id']);
                    
                    if ($clearanceRequest) {
                        $clearanceAction = $clearanceData['is_fully_paid'] ? 'fully_paid' : 'partially_paid';
                        
                        foreach ($usersToNotify as $user) {
                            // FIXED: ClearanceRequest first, then Payment (correct order)
                            $user->notify(new ClearancePaymentNotification(
                                $clearanceRequest,  // First: ClearanceRequest
                                $payment,           // Second: Payment
                                $clearanceAction    // Third: action
                            ));
                            
                            $this->logPaymentActivity('NOTIFICATION_SENT_CLEARANCE', [
                                'user_id' => $user->id,
                                'clearance_id' => $clearanceRequest->id,
                                'action' => $clearanceAction,
                            ]);
                        }
                        
                        // Also notify the resident directly if not already in the list
                        if ($clearanceRequest->resident_id) {
                            $residentUser = User::where('resident_id', $clearanceRequest->resident_id)
                                ->where('status', 'active')
                                ->first();
                            
                            if ($residentUser && !$usersToNotify->contains('id', $residentUser->id)) {
                                // FIXED: Same fix here
                                $residentUser->notify(new ClearancePaymentNotification(
                                    $clearanceRequest,  // First: ClearanceRequest
                                    $payment,           // Second: Payment
                                    $clearanceAction    // Third: action
                                ));
                                
                                $this->logPaymentActivity('NOTIFICATION_SENT_RESIDENT', [
                                    'user_id' => $residentUser->id,
                                    'resident_id' => $clearanceRequest->resident_id,
                                ]);
                            }
                        }
                    }
                }
            }

            $this->logPaymentActivity('NOTIFICATION_COMPLETE', [
                'payment_id' => $payment->id,
                'users_notified' => $usersToNotify->count(),
            ]);

        } catch (\Exception $e) {
            $this->logPaymentActivity('NOTIFICATION_ERROR', [
                'payment_id' => $payment->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Get the direct user account for the payer
     */
    protected function getPayerUser(Payment $payment): ?User
    {
        $this->logPaymentActivity('GET_PAYER_USER', [
            'payer_type' => $payment->payer_type,
            'payer_id' => $payment->payer_id,
        ]);

        // Case 1: Payer is a Resident
        if ($payment->payer_type === 'resident' && $payment->payer_id) {
            $user = User::where('resident_id', $payment->payer_id)
                ->where('status', 'active')
                ->first();
            
            if ($user) {
                $this->logPaymentActivity('FOUND_RESIDENT_USER', [
                    'user_id' => $user->id,
                ]);
                return $user;
            }
        }
        
        // Case 2: Payer is a Household
        elseif ($payment->payer_type === 'household' && $payment->payer_id) {
            // Find household head user
            $headUser = User::where('household_id', $payment->payer_id)
                ->where('status', 'active')
                ->first();
            
            if ($headUser) {
                $this->logPaymentActivity('FOUND_HOUSEHOLD_HEAD_USER', [
                    'user_id' => $headUser->id,
                ]);
                return $headUser;
            }
            
            // Alternative: Find head member
            $headMember = HouseholdMember::with('resident')
                ->where('household_id', $payment->payer_id)
                ->where('is_head', true)
                ->first();
            
            if ($headMember && $headMember->resident) {
                $userFromResident = User::where('resident_id', $headMember->resident_id)
                    ->where('status', 'active')
                    ->first();
                
                if ($userFromResident) {
                    $this->logPaymentActivity('FOUND_HEAD_MEMBER_USER', [
                        'user_id' => $userFromResident->id,
                    ]);
                    return $userFromResident;
                }
            }
        }
        
        // Case 3: Payer is a Business
        elseif ($payment->payer_type === 'business' && $payment->payer_id) {
            $business = Business::with('owner')->find($payment->payer_id);
            
            if ($business && $business->owner_id) {
                $ownerUser = User::where('resident_id', $business->owner_id)
                    ->where('status', 'active')
                    ->first();
                
                if ($ownerUser) {
                    $this->logPaymentActivity('FOUND_BUSINESS_OWNER_USER', [
                        'user_id' => $ownerUser->id,
                    ]);
                    return $ownerUser;
                }
            }
        }

        $this->logPaymentActivity('NO_PAYER_USER_FOUND', [
            'payer_type' => $payment->payer_type,
            'payer_id' => $payment->payer_id,
        ]);

        return null;
    }

    /**
     * Check if a user is the payer
     */
    protected function isUserPayer(User $user, Payment $payment): bool
    {
        if ($payment->payer_type === 'resident' && $payment->payer_id) {
            return $user->resident_id == $payment->payer_id;
        }
        
        if ($payment->payer_type === 'household' && $payment->payer_id) {
            return $user->household_id == $payment->payer_id;
        }
        
        if ($payment->payer_type === 'business' && $payment->payer_id) {
            $business = Business::find($payment->payer_id);
            return $business && $business->owner_id && $user->resident_id == $business->owner_id;
        }
        
        return false;
    }

    /**
     * Get users to notify for a payment (including household members)
     */
    protected function getUsersToNotify(Payment $payment): \Illuminate\Support\Collection
    {
        $usersToNotify = collect();
        $householdId = null;

        $this->logPaymentActivity('NOTIFICATION_FIND_USERS', [
            'payer_type' => $payment->payer_type,
            'payer_id' => $payment->payer_id,
        ]);

        // Case 1: Payer is a Resident
        if ($payment->payer_type === 'resident' && $payment->payer_id) {
            $resident = Resident::with('household')->find($payment->payer_id);
            
            if ($resident) {
                if ($resident->household_id) {
                    $householdId = $resident->household_id;
                }
                
                // Direct user account
                $directUser = User::where('resident_id', $payment->payer_id)
                    ->where('status', 'active')
                    ->first();
                
                if ($directUser) {
                    $usersToNotify->push($directUser);
                    $this->logPaymentActivity('NOTIFICATION_FOUND_DIRECT_USER', [
                        'user_id' => $directUser->id,
                    ]);
                }
            }
        }
        
        // Case 2: Payer is a Household
        elseif ($payment->payer_type === 'household' && $payment->payer_id) {
            $householdId = $payment->payer_id;
        }
        
        // Case 3: Payer is a Business
        elseif ($payment->payer_type === 'business' && $payment->payer_id) {
            $business = Business::with('owner')->find($payment->payer_id);
            
            if ($business && $business->owner_id) {
                $ownerUser = User::where('resident_id', $business->owner_id)
                    ->where('status', 'active')
                    ->first();
                
                if ($ownerUser) {
                    $usersToNotify->push($ownerUser);
                    $this->logPaymentActivity('NOTIFICATION_FOUND_BUSINESS_OWNER', [
                        'user_id' => $ownerUser->id,
                    ]);
                }
            }
        }

        // Find household head user and other household members
        if ($householdId) {
            // Get all users linked to this household
            $householdUsers = User::where('household_id', $householdId)
                ->where('status', 'active')
                ->get();
            
            foreach ($householdUsers as $householdUser) {
                if (!$usersToNotify->contains('id', $householdUser->id)) {
                    $usersToNotify->push($householdUser);
                    $this->logPaymentActivity('NOTIFICATION_FOUND_HOUSEHOLD_USER', [
                        'user_id' => $householdUser->id,
                    ]);
                }
            }

            // If no users found with household_id, try finding by household members
            if ($householdUsers->isEmpty()) {
                $householdMembers = HouseholdMember::with('resident')
                    ->where('household_id', $householdId)
                    ->get();
                
                foreach ($householdMembers as $member) {
                    if ($member->resident) {
                        $userFromResident = User::where('resident_id', $member->resident_id)
                            ->where('status', 'active')
                            ->first();
                        
                        if ($userFromResident && !$usersToNotify->contains('id', $userFromResident->id)) {
                            $usersToNotify->push($userFromResident);
                            $this->logPaymentActivity('NOTIFICATION_FOUND_MEMBER_USER', [
                                'user_id' => $userFromResident->id,
                                'resident_id' => $member->resident_id,
                            ]);
                        }
                    }
                }
            }
        }

        return $usersToNotify->unique('id');
    }

    /**
     * Send payment confirmation manually
     */
    public function sendPaymentConfirmation(Payment $payment)
    {
        try {
            $this->logPaymentActivity('MANUAL_NOTIFICATION_START', [
                'payment_id' => $payment->id,
            ]);

            // Get users to notify (including payer)
            $usersToNotify = $this->getUsersToNotify($payment);
            
            // Always try to include the payer
            $payerUser = $this->getPayerUser($payment);
            if ($payerUser && !$usersToNotify->contains('id', $payerUser->id)) {
                $usersToNotify->push($payerUser);
            }
            
            if ($usersToNotify->isEmpty()) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No users found to notify'
                    ]);
                }
                return back()->withErrors(['error' => 'No users found to notify']);
            }

            $items = $payment->items->map(function($item) {
                return [
                    'fee_name' => $item->fee_name,
                    'fee_code' => $item->fee_code,
                    'category' => $item->category,
                    'total_amount' => $item->total_amount,
                ];
            })->toArray();

            foreach ($usersToNotify as $user) {
                $user->notify(new PaymentProcessedNotification(
                    $payment,
                    'confirmed',
                    $items,
                    $payment->receipt
                ));
            }

            $this->logPaymentActivity('MANUAL_NOTIFICATION_SUCCESS', [
                'payment_id' => $payment->id,
                'users_count' => $usersToNotify->count(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment confirmation sent successfully',
                    'users_notified' => $usersToNotify->count()
                ]);
            }

            return back()->with('success', 'Payment confirmation sent to ' . $usersToNotify->count() . ' user(s).');

        } catch (\Exception $e) {
            $this->logPaymentActivity('MANUAL_NOTIFICATION_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send payment confirmation: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to send payment confirmation: ' . $e->getMessage()]);
        }
    }

    /**
     * Resend payment receipt
     */
    public function resendReceipt(Payment $payment)
    {
        try {
            $this->logPaymentActivity('RESEND_RECEIPT_START', [
                'payment_id' => $payment->id,
            ]);

            if (!$payment->receipt) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No receipt found for this payment.'
                    ], 404);
                }
                return back()->withErrors(['error' => 'No receipt found for this payment.']);
            }

            // Get users to notify (including payer)
            $usersToNotify = $this->getUsersToNotify($payment);
            
            // Always try to include the payer
            $payerUser = $this->getPayerUser($payment);
            if ($payerUser && !$usersToNotify->contains('id', $payerUser->id)) {
                $usersToNotify->push($payerUser);
            }
            
            if ($usersToNotify->isEmpty()) {
                if (request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No users found to notify.'
                    ], 404);
                }
                return back()->withErrors(['error' => 'No users found to notify.']);
            }

            foreach ($usersToNotify as $user) {
                $user->notify(new PaymentReceiptNotification($payment, $payment->receipt));
            }

            $this->logPaymentActivity('RESEND_RECEIPT_SUCCESS', [
                'payment_id' => $payment->id,
                'receipt_id' => $payment->receipt->id,
                'users_notified' => $usersToNotify->count(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Receipt resent successfully to ' . $usersToNotify->count() . ' user(s).',
                    'users_notified' => $usersToNotify->count()
                ]);
            }

            return back()->with('success', 'Receipt resent successfully to ' . $usersToNotify->count() . ' user(s).');

        } catch (\Exception $e) {
            $this->logPaymentActivity('RESEND_RECEIPT_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to resend receipt: ' . $e->getMessage()
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to resend receipt: ' . $e->getMessage()]);
        }
    }

    /**
     * Override logPaymentActivity to maintain parent visibility
     * This method is already defined in BasePaymentController as protected
     * So we don't need to redeclare it
     */
}