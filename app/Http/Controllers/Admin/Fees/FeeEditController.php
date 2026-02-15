<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FeeEditController extends Controller
{
    // Show edit form
    public function edit(Fee $fee)
    {
        try {
            Log::info('FeeEditController@edit accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status
            ]);

            // Check if fee can be edited
            if (!in_array($fee->status, ['pending', 'issued'])) {
                Log::warning('Fee edit attempted on non-editable status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status,
                    'allowed_statuses' => ['pending', 'issued']
                ]);

                return redirect()->route('fees.show', $fee)
                    ->with('error', 'Only pending or issued fees can be edited.');
            }

            $fee->load(['feeType', 'resident', 'household']);

            // Get fee types with simplified fields
            $feeTypes = FeeType::active()
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'base_amount' => (float) $type->base_amount,
                        'is_discountable' => (bool) $type->is_discountable,
                        'has_surcharge' => (bool) $type->has_surcharge,
                        'surcharge_percentage' => (float) $type->surcharge_percentage,
                        'surcharge_fixed' => (float) $type->surcharge_fixed,
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                    ];
                });

            return Inertia::render('admin/Fees/Edit', [
                'fee' => $fee,
                'feeTypes' => $feeTypes,
                'residents' => Resident::with('purok')
                    ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id'])
                    ->orderBy('last_name')
                    ->get()
                    ->map(function ($resident) {
                        return [
                            'id' => $resident->id,
                            'name' => trim("{$resident->first_name} {$resident->middle_name} {$resident->last_name}"),
                            'purok' => $resident->purok ? $resident->purok->name : null,
                        ];
                    }),
                'households' => Household::select(['id', 'household_number', 'head_of_family', 'purok'])
                    ->orderBy('household_number')
                    ->get()
                    ->map(function ($household) {
                        return [
                            'id' => $household->id,
                            'name' => $household->head_of_family ?? $household->household_number,
                            'purok' => $household->purok,
                        ];
                    }),
            ]);

        } catch (\Exception $e) {
            Log::error('FeeEditController@edit error', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to load fee edit form. Please try again.');
        }
    }

    // Update fee
    public function update(Request $request, Fee $fee)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeEditController@update started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'original_status' => $fee->status
            ]);

            // Can only update pending or issued fees
            if (!in_array($fee->status, ['pending', 'issued'])) {
                Log::warning('Fee update attempted on non-editable status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

                return back()->with('error', 'Only pending or issued fees can be updated.');
            }

            $validated = $request->validate([
                'fee_type_id' => 'required|exists:fee_types,id',
                'payer_type' => 'required|in:resident,business,household,visitor,other',
                'resident_id' => 'nullable|required_if:payer_type,resident|exists:residents,id',
                'household_id' => 'nullable|required_if:payer_type,household|exists:households,id',
                'business_name' => 'nullable|required_if:payer_type,business|string|max:255',
                'payer_name' => 'required|string|max:255',
                'contact_number' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'purok' => 'nullable|string|max:50',
                'zone' => 'nullable|string|max:50',
                'billing_period' => 'nullable|string|max:100',
                'period_start' => 'nullable|date',
                'period_end' => 'nullable|date|after_or_equal:period_start',
                'issue_date' => 'required|date',
                'due_date' => 'required|date|after_or_equal:issue_date',
                'base_amount' => 'required|numeric|min:0',
                'surcharge_amount' => 'nullable|numeric|min:0',
                'penalty_amount' => 'nullable|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0', // Keep this as it's stored in fee
                'total_amount' => 'required|numeric|min:0',
                'purpose' => 'nullable|string',
                'property_description' => 'nullable|string',
                'business_type' => 'nullable|string',
                'area' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string',
                'requirements_submitted' => 'nullable|array',
            ]);

            // Get fee type
            $feeType = FeeType::find($validated['fee_type_id']);

            // Update fee code
            $validated['fee_code'] = $feeType->code;

            // Recalculate balance if total amount changed
            if ($validated['total_amount'] != $fee->total_amount) {
                $validated['balance'] = $validated['total_amount'] - $fee->amount_paid;
                Log::debug('Fee total amount changed, recalculating balance', [
                    'old_total' => $fee->total_amount,
                    'new_total' => $validated['total_amount'],
                    'new_balance' => $validated['balance']
                ]);
            }

            // Update updated_by
            $validated['updated_by'] = auth()->id();

            // Convert arrays to JSON
            if (isset($validated['requirements_submitted'])) {
                $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
            }

            // Capture changes before update
            $changes = [];
            foreach ($validated as $key => $value) {
                if ($fee->$key != $value) {
                    $changes[$key] = [
                        'from' => $fee->$key,
                        'to' => $value
                    ];
                }
            }

            $fee->update($validated);

            // Update status based on new balance
            $fee->updateStatus();

            DB::commit();

            Log::info('Fee updated successfully', [
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'changes' => $changes,
                'new_status' => $fee->status
            ]);

            return redirect()->route('fees.show', $fee)
                ->with('success', 'Fee updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee update failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to update fee. Please try again.');
        }
    }

    // Delete fee
    public function destroy(Fee $fee)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeEditController@destroy started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status
            ]);

            // Can only delete pending fees
            if ($fee->status !== 'pending') {
                Log::warning('Fee delete attempted on non-pending status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

                return back()->with('error', 'Only pending fees can be deleted.');
            }

            // Capture fee details before deletion
            $feeDetails = [
                'id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'payer_name' => $fee->payer_name,
                'total_amount' => $fee->total_amount,
                'created_at' => $fee->created_at
            ];

            $fee->delete();

            DB::commit();

            Log::info('Fee deleted successfully', $feeDetails);

            return redirect()->route('fees.index')
                ->with('success', 'Fee deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee deletion failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to delete fee. Please try again.');
        }
    }

    // Cancel fee
    public function cancel(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeEditController@cancel started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status,
                'reason_provided' => !empty($request->reason)
            ]);

            $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $fee->update([
                'status' => 'cancelled',
                'cancelled_by' => auth()->id(),
                'cancelled_at' => now(),
                'waiver_reason' => $request->reason,
            ]);

            DB::commit();

            Log::info('Fee cancelled successfully', [
                'fee_id' => $fee->id,
                'reason' => $request->reason,
                'cancelled_by' => auth()->id()
            ]);

            return back()->with('success', 'Fee cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee cancellation failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to cancel fee. Please try again.');
        }
    }
}