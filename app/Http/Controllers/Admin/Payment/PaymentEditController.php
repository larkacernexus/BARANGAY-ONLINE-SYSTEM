<?php
// app/Http/Controllers/Admin/Payment/PaymentEditController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Household;
use App\Models\FeeType;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentEditController extends BasePaymentController
{
    /**
     * Show the form for editing the specified payment.
     */
    public function edit(Payment $payment)
    {
        if ($payment->status === 'cancelled') {
            return redirect()->route('admin.payments.show', $payment->id)
                ->with('error', 'Cannot edit a cancelled payment.');
        }

        $payment->load('items');

        $residents = $this->getResidentsForEdit();
        $households = $this->getHouseholdsForEdit();
        $fees = $this->getFeeTypesForEdit();
        $discountTypes = $this->getDiscountTypes();
        $clearanceTypesForSelect = $this->getClearanceTypesForSelect();
        $clearanceTypesDetails = $this->getClearanceTypesDetails();

        return Inertia::render('admin/Payments/Edit', [
            'payment' => $payment,
            'residents' => $residents,
            'households' => $households,
            'fees' => $fees,
            'discountTypes' => $discountTypes,
            'clearanceTypes' => $clearanceTypesForSelect,
            'clearanceTypesDetails' => $clearanceTypesDetails,
            'hasClearanceTypes' => $clearanceTypesDetails->count() > 0,
        ]);
    }

    /**
     * Update the specified payment in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        $this->logPaymentActivity('UPDATE', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
        ]);

        if ($payment->status === 'cancelled') {
            return back()->withErrors(['error' => 'Cannot update a cancelled payment.']);
        }

        $validated = $request->validate([
            'payer_type' => 'required|in:resident,household,business,other',
            'payer_id' => 'required',
            'payer_name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'household_number' => 'nullable|string|max:50',
            'purok' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'period_covered' => 'nullable|string|max:100',
            'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
            'subtotal' => 'required|numeric|min:0',
            'surcharge' => 'required|numeric|min:0',
            'penalty' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'discount_type' => 'nullable|string|max:100',
            'total_amount' => 'required|numeric|min:0',
            'purpose' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
            'is_cleared' => 'boolean',
            'validity_date' => 'nullable|date',
            'collection_type' => 'required|in:manual,system',
            'method_details' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $oldValues = $payment->getOriginal();

            $payment->update([
                'payer_type' => $validated['payer_type'],
                'payer_id' => $validated['payer_id'],
                'payer_name' => $validated['payer_name'],
                'contact_number' => $validated['contact_number'],
                'address' => $validated['address'],
                'household_number' => $validated['household_number'],
                'purok' => $validated['purok'],
                'payment_date' => $validated['payment_date'],
                'period_covered' => $validated['period_covered'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'subtotal' => floatval($validated['subtotal']),
                'surcharge' => floatval($validated['surcharge']),
                'penalty' => floatval($validated['penalty']),
                'discount' => floatval($validated['discount']),
                'discount_type' => $validated['discount_type'] ?? null,
                'total_amount' => floatval($validated['total_amount']),
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'] ?? null,
                'is_cleared' => $validated['is_cleared'] ?? false,
                'validity_date' => $validated['validity_date'],
                'collection_type' => $validated['collection_type'],
                'method_details' => $validated['method_details'] ?? null,
            ]);

            if ($request->has('items')) {
                $this->updatePaymentItems($payment, $request->input('items'));
            }

            DB::commit();

            $this->logPaymentActivity('UPDATE_SUCCESS', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Payment updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();

            $this->logPaymentActivity('UPDATE_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to update payment. Please try again. Error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Cancel the specified payment.
     */
    public function cancel(Payment $payment)
    {
        if ($payment->status === 'cancelled') {
            return back()->with('error', 'Payment is already cancelled.');
        }

        $this->logPaymentActivity('CANCEL', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
        ]);

        DB::beginTransaction();

        try {
            $this->cancelClearanceRequests($payment);

            $payment->update([
                'status' => 'cancelled',
                'remarks' => ($payment->remarks ? $payment->remarks . "\n\n" : '') .
                            'Cancelled on ' . now()->format('Y-m-d H:i:s') . ' by ' . Auth::user()->name,
            ]);

            DB::commit();

            $this->logPaymentActivity('CANCEL_SUCCESS', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Payment cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            $this->logPaymentActivity('CANCEL_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to cancel payment. Please try again.'
            ]);
        }
    }

    /**
     * Mark payment as refunded.
     */
    public function refund(Request $request, Payment $payment)
    {
        $request->validate([
            'refund_reason' => 'required|string|max:500',
        ]);

        $this->logPaymentActivity('REFUND', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'refund_reason' => $request->refund_reason,
        ]);

        DB::beginTransaction();

        try {
            $this->cancelClearanceRequests($payment, $request->refund_reason);

            $payment->update([
                'status' => 'refunded',
                'remarks' => ($payment->remarks ? $payment->remarks . "\n\n" : '') .
                            'Refunded on ' . now()->format('Y-m-d H:i:s') .
                            ' by ' . Auth::user()->name .
                            '. Reason: ' . $request->refund_reason,
            ]);

            DB::commit();

            $this->logPaymentActivity('REFUND_SUCCESS', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Payment marked as refunded.');

        } catch (\Exception $e) {
            DB::rollBack();

            $this->logPaymentActivity('REFUND_ERROR', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to refund payment. Please try again.'
            ]);
        }
    }

    /**
     * Update payment items
     */
    private function updatePaymentItems(Payment $payment, array $items): void
    {
        $oldItemsCount = $payment->items()->count();
        $payment->items()->delete();

        foreach ($items as $item) {
            $paymentItemData = [
                'payment_id' => $payment->id,
                'fee_id' => null,
                'clearance_request_id' => null,
                'fee_name' => $item['fee_name'],
                'fee_code' => $item['fee_code'],
                'description' => $item['description'],
                'base_amount' => floatval($item['base_amount']),
                'surcharge' => floatval($item['surcharge']),
                'penalty' => floatval($item['penalty']),
                'total_amount' => floatval($item['total_amount']),
                'category' => $item['category'],
                'period_covered' => $item['period_covered'],
                'months_late' => $item['months_late'],
            ];

            if (($item['metadata']['is_clearance_fee'] ?? false) || ($item['item_type'] ?? 'fee') === 'clearance') {
                $clearanceRequestId = $item['metadata']['clearance_request_id'] ?? null;
                $metadata = [
                    'is_clearance_fee' => true,
                    'clearance_request_id' => $clearanceRequestId,
                ];

                $paymentItemData['fee_metadata'] = json_encode($metadata);
                $paymentItemData['clearance_request_id'] = $clearanceRequestId;

                if ($clearanceRequestId) {
                    $clearanceRequest = \App\Models\ClearanceRequest::find($clearanceRequestId);
                    if ($clearanceRequest) {
                        $clearanceRequest->update([
                            'fee_amount' => $item['total_amount'],
                            'payment_id' => $payment->id,
                        ]);
                    }
                }
            } elseif (!empty($item['fee_id']) && is_numeric($item['fee_id'])) {
                $paymentItemData['fee_id'] = $item['fee_id'];

                $feeType = FeeType::find($item['fee_id']);
                if ($feeType) {
                    $metadata = $item['metadata'] ?? [];
                    $metadata['original_amount'] = $feeType->base_amount;
                    $metadata['surcharge_rate'] = $feeType->surcharge_percentage;
                    $metadata['penalty_rate'] = $feeType->penalty_percentage;
                    $metadata['validity_days'] = $feeType->validity_days;
                    $metadata['frequency'] = $feeType->frequency;

                    $paymentItemData['fee_metadata'] = json_encode($metadata);
                }
            }

            \App\Models\PaymentItem::create($paymentItemData);
        }

        $this->logPaymentActivity('UPDATE_ITEMS', [
            'payment_id' => $payment->id,
            'old_items_count' => $oldItemsCount,
            'new_items_count' => count($items),
        ]);
    }

    /**
     * Cancel clearance requests associated with payment
     */
    private function cancelClearanceRequests(Payment $payment, ?string $reason = null): void
    {
        $clearanceItems = $payment->items()
            ->whereNotNull('clearance_request_id')
            ->get();

        foreach ($clearanceItems as $item) {
            $clearanceRequest = \App\Models\ClearanceRequest::find($item->clearance_request_id);
            if ($clearanceRequest && in_array($clearanceRequest->status, ['pending_payment', 'processing'])) {
                $cancellationReason = $reason 
                    ? 'Payment refunded: ' . $payment->or_number . ' - ' . $reason
                    : 'Payment cancelled: ' . $payment->or_number;

                $clearanceRequest->update([
                    'status' => 'cancelled',
                    'cancellation_reason' => $cancellationReason,
                    'payment_id' => null,
                ]);
            }
        }
    }

    /**
     * Get residents for edit form
     */
    private function getResidentsForEdit()
    {
        return Resident::with(['household' => function ($query) {
                $query->select('id', 'household_number', 'purok_id');
            }, 'household.purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'address', 'household_id'])
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'contact_number' => $resident->contact_number,
                    'address' => $resident->address,
                    'household_number' => $resident->household ? $resident->household->household_number : null,
                    'purok' => $resident->household && $resident->household->purok
                        ? $resident->household->purok->name
                        : null,
                ];
            });
    }

    /**
     * Get households for edit form
     */
    private function getHouseholdsForEdit()
    {
        return Household::with(['purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->withCount(['householdMembers as members_count'])
            ->orderBy('head_of_family', 'asc')
            ->get(['id', 'head_of_family', 'contact_number', 'address', 'household_number', 'purok_id'])
            ->map(function ($household) {
                return [
                    'id' => $household->id,
                    'head_name' => $household->head_of_family,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'household_number' => $household->household_number,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'family_members' => $household->members_count,
                ];
            });
    }

    /**
     * Get fee types for edit form
     */
    private function getFeeTypesForEdit()
    {
        return FeeType::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($feeType) {
                return [
                    'id' => $feeType->id,
                    'name' => $feeType->name,
                    'code' => $feeType->code,
                    'description' => $feeType->description,
                    'base_amount' => floatval($feeType->base_amount),
                    'category' => $feeType->category,
                    'frequency' => $feeType->frequency,
                    'has_surcharge' => (bool) $feeType->has_surcharge,
                    'surcharge_rate' => floatval($feeType->surcharge_percentage ?? 0),
                    'has_penalty' => (bool) $feeType->has_penalty,
                    'penalty_rate' => floatval($feeType->penalty_percentage ?? 0),
                    'validity_days' => $feeType->validity_days,
                    'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
                ];
            });
    }

    /**
     * Get discount types
     */
    private function getDiscountTypes(): array
    {
        return [
            'senior_citizen' => 'Senior Citizen (20%)',
            'pwd' => 'Person with Disability (20%)',
            'solo_parent' => 'Solo Parent (15%)',
            'indigent' => 'Indigent (50%)',
            'veteran' => 'Veteran (100%)',
            'government_employee' => 'Government Employee (10%)',
            'promo' => 'Promotional Discount',
        ];
    }

    /**
     * Get clearance types for select dropdown
     */
    private function getClearanceTypesForSelect(): array
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($type) {
                $code = $type->code ?? strtoupper(str_replace(' ', '_', $type->name));
                return [$code => $type->name];
            })
            ->toArray();
    }

   /**
 * Get clearance types details
 */
private function getClearanceTypesDetails()
{
    return ClearanceType::where('is_active', true)
        ->orderBy('name')
        ->get()
        ->map(function ($type) {
            // Handle eligibility_criteria - could be array or JSON string
            $eligibilityCriteria = [];
            if (is_array($type->eligibility_criteria)) {
                $eligibilityCriteria = $type->eligibility_criteria;
            } elseif (is_string($type->eligibility_criteria) && !empty($type->eligibility_criteria)) {
                $decoded = json_decode($type->eligibility_criteria, true);
                $eligibilityCriteria = is_array($decoded) ? $decoded : [];
            }
            
            // Handle purpose_options - could be array or comma-separated string
            $purposeOptions = [];
            if (is_array($type->purpose_options)) {
                $purposeOptions = $type->purpose_options;
            } elseif (is_string($type->purpose_options) && !empty($type->purpose_options)) {
                $purposeOptions = explode(', ', $type->purpose_options);
            }
            
            return [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code ?? strtoupper(str_replace(' ', '_', $type->name)),
                'description' => $type->description,
                'fee' => floatval($type->fee),
                'formatted_fee' => '₱' . number_format($type->fee, 2),
                'processing_days' => $type->processing_days,
                'validity_days' => $type->validity_days,
                'requires_payment' => (bool) $type->requires_payment,
                'requires_approval' => (bool) $type->requires_approval,
                'is_online_only' => (bool) $type->is_online_only,
                'eligibility_criteria' => $eligibilityCriteria,
                'purpose_options' => $purposeOptions,
            ];
        });
}
}