<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\PaymentDiscount;
use App\Models\DiscountRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FeePaymentController extends Controller
{
    // Record payment for fee
    public function recordPayment(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeePaymentController@recordPayment started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_balance' => $fee->balance,
                'current_status' => $fee->status
            ]);

            // Check if fee is already paid
            if ($fee->status === 'paid') {
                Log::warning('Payment recording attempted on already paid fee', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

                return back()->with('error', 'Fee is already paid.');
            }

            $validated = $request->validate([
                'payment_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
                'payment_date' => 'required|date',
                'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
                'reference_number' => 'nullable|string|max:255',
                'or_number' => 'nullable|string|max:50|unique:payments,or_number',
                'remarks' => 'nullable|string',
                'discounts' => 'nullable|array',
                'discounts.*.rule_id' => 'required|exists:discount_rules,id',
                'discounts.*.amount' => 'required|numeric|min:0',
                'discounts.*.id_number' => 'nullable|string',
            ]);

            // Calculate total discount
            $totalDiscount = 0;
            if (!empty($validated['discounts'])) {
                $totalDiscount = collect($validated['discounts'])->sum('amount');
            }

            // Create payment record
            $payment = new Payment();
            $payment->or_number = $validated['or_number'] ?? Payment::generateOrNumber();
            $payment->reference_number = $validated['reference_number'] ?? null;
            $payment->payment_date = $validated['payment_date'];
            $payment->payment_method = $validated['payment_method'];
            $payment->total_amount = $validated['payment_amount'];
            $payment->subtotal = $validated['payment_amount'] + $totalDiscount; // Original amount before discount
            $payment->recorded_by = auth()->id();
            $payment->status = 'completed';
            $payment->remarks = $validated['remarks'] ?? null;
            $payment->payer_type = $fee->payer_type;
            $payment->payer_id = $fee->payer_type === 'resident' ? $fee->resident_id :
                ($fee->payer_type === 'household' ? $fee->household_id : null);
            $payment->payer_name = $fee->payer_name;
            $payment->contact_number = $fee->contact_number;
            $payment->address = $fee->address;
            $payment->purok = $fee->purok;
            $payment->save();

            // Create payment item
            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $validated['payment_amount'];
            $paymentItem->description = "Payment for fee {$fee->fee_code}";
            $paymentItem->save();

            // Apply discounts if any
            if (!empty($validated['discounts'])) {
                foreach ($validated['discounts'] as $discountData) {
                    $discountRule = DiscountRule::find($discountData['rule_id']);
                    
                    $paymentDiscount = new PaymentDiscount();
                    $paymentDiscount->payment_id = $payment->id;
                    $paymentDiscount->discount_rule_id = $discountData['rule_id'];
                    $paymentDiscount->discount_amount = $discountData['amount'];
                    $paymentDiscount->verified_by = auth()->id();
                    $paymentDiscount->verified_at = now();
                    $paymentDiscount->id_presented = !empty($discountData['id_number']);
                    $paymentDiscount->id_number = $discountData['id_number'] ?? null;
                    $paymentDiscount->remarks = "Applied to fee {$fee->fee_code}";
                    $paymentDiscount->save();

                    Log::info('Discount applied to payment', [
                        'payment_id' => $payment->id,
                        'discount_rule' => $discountRule->name ?? 'Unknown',
                        'amount' => $discountData['amount']
                    ]);
                }
            }

            // Apply payment to fee
            $fee->applyPayment(
                $validated['payment_amount'],
                $payment->id,
                [
                    'or_number' => $payment->or_number,
                    'collected_by' => auth()->id(),
                ]
            );

            DB::commit();

            Log::info('Payment recorded successfully', [
                'fee_id' => $fee->id,
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'payment_amount' => $validated['payment_amount'],
                'discounts_applied' => count($validated['discounts'] ?? []),
                'new_balance' => $fee->balance,
                'new_status' => $fee->status
            ]);

            return redirect()->route('admin.fees.show', $fee)
                ->with('success', 'Payment of ₱' . number_format($validated['payment_amount'], 2) . ' recorded successfully. OR#: ' . $payment->or_number);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment recording failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to record payment. Please try again.');
        }
    }

    // Get available discounts for a fee
    public function getAvailableDiscounts(Fee $fee)
    {
        try {
            Log::info('FeePaymentController@getAvailableDiscounts accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id
            ]);

            // Check if fee type is discountable
            if (!$fee->feeType || !$fee->feeType->is_discountable) {
                return response()->json([
                    'discountable' => false,
                    'message' => 'This fee type is not discountable',
                    'discounts' => []
                ]);
            }

            // Get applicable discounts based on payer
            $applicableDiscounts = [];
            
            if ($fee->payer_type === 'resident' && $fee->resident) {
                $resident = $fee->resident;
                
                // Get all active discount rules
                $discountRules = DiscountRule::active()
                    ->orderBy('priority')
                    ->get();
                
                foreach ($discountRules as $rule) {
                    if ($rule->isApplicableToResident($resident)) {
                        $applicableDiscounts[] = [
                            'id' => $rule->id,
                            'code' => $rule->code,
                            'name' => $rule->name,
                            'discount_type' => $rule->discount_type,
                            'value_type' => $rule->value_type,
                            'discount_value' => $rule->discount_value,
                            'formatted_value' => $rule->formatted_value,
                            'maximum_discount_amount' => $rule->maximum_discount_amount,
                            'minimum_purchase_amount' => $rule->minimum_purchase_amount,
                            'priority' => $rule->priority,
                            'stackable' => $rule->stackable,
                            'requires_verification' => $rule->requires_verification,
                            'verification_document' => $rule->verification_document,
                            'estimated_amount' => $rule->calculateDiscount($fee->balance),
                        ];
                    }
                }
            }

            return response()->json([
                'discountable' => true,
                'fee_balance' => $fee->balance,
                'discounts' => $applicableDiscounts
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get available discounts', [
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load discounts'
            ], 500);
        }
    }

    // Waive fee
    public function waive(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeePaymentController@waive started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_balance' => $fee->balance,
                'waiver_amount' => $request->waiver_amount
            ]);

            $request->validate([
                'reason' => 'required|string|max:500',
                'waiver_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
            ]);

            // Create payment record for waiver
            $payment = new Payment();
            $payment->or_number = 'WAIVER-' . date('YmdHis');
            $payment->reference_number = 'WAIVER-' . date('YmdHis');
            $payment->payment_date = now();
            $payment->payment_method = 'waiver';
            $payment->total_amount = $request->waiver_amount;
            $payment->subtotal = $request->waiver_amount;
            $payment->recorded_by = auth()->id();
            $payment->status = 'completed';
            $payment->remarks = "Waiver: {$request->reason}";
            $payment->payer_type = $fee->payer_type;
            $payment->payer_id = $fee->payer_type === 'resident' ? $fee->resident_id :
                ($fee->payer_type === 'household' ? $fee->household_id : null);
            $payment->payer_name = $fee->payer_name;
            $payment->contact_number = $fee->contact_number;
            $payment->address = $fee->address;
            $payment->purok = $fee->purok;
            $payment->save();

            // Create payment item
            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $request->waiver_amount;
            $paymentItem->description = "Waiver: {$request->reason}";
            $paymentItem->save();

            // Update fee
            $fee->applyPayment($request->waiver_amount, $payment->id);
            $fee->waiver_reason = $request->reason;
            $fee->status = 'waived';
            $fee->save();

            DB::commit();

            Log::info('Fee waived successfully', [
                'fee_id' => $fee->id,
                'waiver_amount' => $request->waiver_amount,
                'reason' => $request->reason,
                'new_status' => $fee->status
            ]);

            return back()->with('success', 'Fee balance of ₱' . number_format($request->waiver_amount, 2) . ' waived successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee waiver failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to waive fee. Please try again.');
        }
    }

    // Bulk actions
    public function bulkAction(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeePaymentController@bulkAction started', [
                'user_id' => Auth::id(),
                'action' => $request->action,
                'fee_ids_count' => count($request->fee_ids ?? [])
            ]);

            $request->validate([
                'action' => 'required|in:issue,mark_paid,cancel,delete',
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
                }
            }

            DB::commit();

            Log::info('Bulk action completed', [
                'action' => $request->action,
                'successful_count' => $count,
                'processed_fees' => $processedFees
            ]);

            return back()->with('success', "{$count} fees updated successfully.");

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
}