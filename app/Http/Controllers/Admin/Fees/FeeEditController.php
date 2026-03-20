<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Purok;
use App\Models\DocumentCategory;
use App\Models\DiscountRule;
use App\Models\Privilege;
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

                return redirect()->route('admin.fees.show', $fee->id)
                    ->with('error', 'Only pending or issued fees can be edited.');
            }

            // Load relationships
            $fee->load(['feeType', 'feeDiscounts']);
            
            // Get the actual payer model (Resident or Household)
            $payer = null;
            $payerPrivileges = [];
            
            if ($fee->payer_type === 'App\\Models\\Resident' && $fee->payer_id) {
                $payer = Resident::find($fee->payer_id);
            } elseif ($fee->payer_type === 'App\\Models\\Household' && $fee->payer_id) {
                $payer = Household::find($fee->payer_id);
            }

            // Get all fee types with their relationships
            $feeTypes = FeeType::with('documentCategory')
                ->active()
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
                        'surcharge_description' => $type->surcharge_description,
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                        'penalty_description' => $type->penalty_description,
                        'description' => $type->description,
                        'validity_days' => $type->validity_days,
                        'document_category_id' => $type->document_category_id,
                        'document_category' => $type->document_category ? [
                            'id' => $type->document_category->id,
                            'name' => $type->document_category->name,
                            // Remove 'code' if it doesn't exist
                        ] : null,
                        'requirements' => $type->requirements,
                    ];
                });

            // Get all residents
            $residents = Resident::select(['id', 'first_name', 'last_name', 'middle_name', 'address', 'contact_number'])
                ->orderBy('last_name')
                ->get()
                ->map(function ($resident) {
                    // Build full name
                    $fullName = trim("{$resident->first_name} {$resident->middle_name} {$resident->last_name}");
                    
                    return [
                        'id' => (string) $resident->id,
                        'full_name' => $fullName,
                        'address' => $resident->address,
                        'contact_number' => $resident->contact_number,
                        'privileges' => [],
                    ];
                });

            // Get all households
            $households = Household::select(['id', 'household_number', 'head_of_family', 'address', 'contact_number', 'member_count'])
                ->orderBy('household_number')
                ->get()
                ->map(function ($household) {
                    return [
                        'id' => (string) $household->id,
                        'name' => $household->head_of_family ?? $household->household_number,
                        'head_of_family' => $household->head_of_family,
                        'household_number' => $household->household_number,
                        'address' => $household->address,
                        'contact_number' => $household->contact_number,
                        'member_count' => $household->member_count,
                        'head_privileges' => [],
                    ];
                });

            // Get puroks
            $puroks = [];
            try {
                // Check if Purok model exists and has the right columns
                $puroks = Purok::orderBy('name')->pluck('name')->toArray();
            } catch (\Exception $e) {
                Log::warning('Could not load puroks', ['error' => $e->getMessage()]);
                // Provide default puroks
                $puroks = ['1', '2', '3', '4', '5', '6', '7'];
            }

            // Get document categories - WITHOUT the 'code' column
            $documentCategories = [];
            try {
                // Try to get just id and name first
                $documentCategories = DocumentCategory::select(['id', 'name'])
                    ->orderBy('name')
                    ->get();
            } catch (\Exception $e) {
                Log::warning('Could not load document categories', ['error' => $e->getMessage()]);
                
                // If that fails, try without selecting specific columns
                try {
                    $documentCategories = DocumentCategory::orderBy('name')->get();
                } catch (\Exception $e2) {
                    Log::error('Failed to load document categories', ['error' => $e2->getMessage()]);
                    $documentCategories = [];
                }
            }

            // Get discount rules
            $discountRules = [];
            try {
                $discountRules = DiscountRule::where('is_active', true)
                    ->get()
                    ->map(function ($rule) {
                        return [
                            'id' => $rule->id,
                            'name' => $rule->name,
                            'discount_type' => $rule->discount_type,
                            'discount_value' => (float) $rule->discount_value,
                            'value_type' => $rule->value_type,
                            'applicable_fee_types' => $rule->applicable_fee_types,
                            'verification_document' => $rule->verification_document,
                            'description' => $rule->description,
                        ];
                    });
            } catch (\Exception $e) {
                Log::warning('Could not load discount rules', ['error' => $e->getMessage()]);
            }

            // Get all privileges
            $allPrivileges = [];
            try {
                $allPrivileges = Privilege::select(['id', 'code', 'name', 'description'])
                    ->orderBy('name')
                    ->get();
            } catch (\Exception $e) {
                Log::warning('Could not load privileges', ['error' => $e->getMessage()]);
            }

            // Transform fee data for the form
            $metadata = $fee->metadata ?? [];
            
            // Determine payer type string for the form
            $payerType = 'other';
            if ($fee->payer_type === 'App\\Models\\Resident') {
                $payerType = 'resident';
            } elseif ($fee->payer_type === 'App\\Models\\Household') {
                $payerType = 'household';
            } elseif ($fee->payer_type === 'business' || isset($metadata['business_type'])) {
                $payerType = 'business';
            }

            // Build full name for display
            $payerFullName = $fee->payer_name;
            if ($payer && $fee->payer_type === 'App\\Models\\Resident') {
                $payerFullName = trim("{$payer->first_name} {$payer->middle_name} {$payer->last_name}");
            } elseif ($payer && $fee->payer_type === 'App\\Models\\Household') {
                $payerFullName = $payer->head_of_family ?? $payer->household_number;
            }

            $feeData = [
                'id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'certificate_number' => $fee->certificate_number,
                'or_number' => $fee->or_number,
                'fee_type_id' => (string) $fee->fee_type_id,
                'payer_type' => $payerType,
                'resident_id' => $fee->payer_type === 'App\\Models\\Resident' ? (string) $fee->payer_id : '',
                'household_id' => $fee->payer_type === 'App\\Models\\Household' ? (string) $fee->payer_id : '',
                'business_name' => $payerType === 'business' ? $fee->payer_name : '',
                'payer_name' => $payerFullName,
                'contact_number' => $fee->contact_number ?? '',
                'address' => $fee->address ?? '',
                'purok' => $fee->purok ?? '',
                'zone' => $fee->zone ?? '',
                'billing_period' => $fee->billing_period ?? '',
                'period_start' => $fee->period_start ? $fee->period_start->format('Y-m-d') : '',
                'period_end' => $fee->period_end ? $fee->period_end->format('Y-m-d') : '',
                'issue_date' => $fee->issue_date ? $fee->issue_date->format('Y-m-d') : now()->format('Y-m-d'),
                'due_date' => $fee->due_date ? $fee->due_date->format('Y-m-d') : now()->addDays(30)->format('Y-m-d'),
                'valid_from' => $fee->valid_from ? $fee->valid_from->format('Y-m-d') : '',
                'valid_until' => $fee->valid_until ? $fee->valid_until->format('Y-m-d') : '',
                'base_amount' => (float) $fee->base_amount,
                'surcharge_amount' => (float) $fee->surcharge_amount,
                'penalty_amount' => (float) $fee->penalty_amount,
                'discount_amount' => (float) $fee->discount_amount,
                'total_amount' => (float) $fee->total_amount,
                'amount_paid' => (float) $fee->amount_paid,
                'balance' => (float) $fee->balance,
                'purpose' => $metadata['purpose'] ?? '',
                'property_description' => $metadata['property_description'] ?? '',
                'business_type' => $metadata['business_type'] ?? '',
                'area' => (float) ($metadata['area'] ?? 0),
                'remarks' => $fee->remarks ?? '',
                'requirements_submitted' => $fee->requirements_submitted ?? [],
                'ph_legal_compliance_notes' => $metadata['ph_legal_compliance_notes'] ?? '',
                'status' => $fee->status,
                'created_at' => $fee->created_at ? $fee->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $fee->updated_at ? $fee->updated_at->format('Y-m-d H:i:s') : null,
            ];

            return Inertia::render('admin/Fees/Edit', [
                'fee' => $feeData,
                'payer' => $payer ? [
                    'id' => $payer->id,
                    'type' => $fee->payer_type === 'App\\Models\\Resident' ? 'resident' : 'household',
                    'full_name' => $payerFullName,
                    'address' => $payer->address,
                    'contact_number' => $payer->contact_number,
                    'privileges' => $payerPrivileges
                ] : null,
                'feeTypes' => $feeTypes,
                'residents' => $residents,
                'households' => $households,
                'discountRules' => $discountRules,
                'puroks' => $puroks,
                'documentCategories' => $documentCategories,
                'allPrivileges' => $allPrivileges,
                'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : (object)[],
            ]);

        } catch (\Exception $e) {
            Log::error('FeeEditController@edit error', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.fees.index')
                ->with('error', 'Failed to load fee edit form. Please try again.');
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
                'valid_from' => 'nullable|date',
                'valid_until' => 'nullable|date|after_or_equal:valid_from',
                'base_amount' => 'required|numeric|min:0',
                'surcharge_amount' => 'nullable|numeric|min:0',
                'penalty_amount' => 'nullable|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
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

            // Set payer_type and payer_id based on selection
            $payerTypeMap = [
                'resident' => 'App\\Models\\Resident',
                'household' => 'App\\Models\\Household',
                'business' => 'business',
                'visitor' => 'visitor',
                'other' => 'other',
            ];

            $updateData = [
                'fee_type_id' => $validated['fee_type_id'],
                'fee_code' => $feeType->code,
                'payer_type' => $payerTypeMap[$validated['payer_type']],
                'payer_name' => $validated['payer_name'],
                'contact_number' => $validated['contact_number'],
                'address' => $validated['address'],
                'purok' => $validated['purok'],
                'zone' => $validated['zone'],
                'billing_period' => $validated['billing_period'],
                'period_start' => $validated['period_start'],
                'period_end' => $validated['period_end'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'valid_from' => $validated['valid_from'] ?? null,
                'valid_until' => $validated['valid_until'] ?? null,
                'base_amount' => $validated['base_amount'],
                'surcharge_amount' => $validated['surcharge_amount'] ?? 0,
                'penalty_amount' => $validated['penalty_amount'] ?? 0,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'total_amount' => $validated['total_amount'],
                'remarks' => $validated['remarks'],
                'updated_by' => auth()->id(),
            ];

            // Set payer_id based on type
            if ($validated['payer_type'] === 'resident' && !empty($validated['resident_id'])) {
                $updateData['payer_id'] = $validated['resident_id'];
            } elseif ($validated['payer_type'] === 'household' && !empty($validated['household_id'])) {
                $updateData['payer_id'] = $validated['household_id'];
            } else {
                $updateData['payer_id'] = null;
            }

            // Handle metadata (JSON field)
            $metadata = $fee->metadata ?? [];
            if (!empty($validated['purpose'])) {
                $metadata['purpose'] = $validated['purpose'];
            }
            if (!empty($validated['property_description'])) {
                $metadata['property_description'] = $validated['property_description'];
            }
            if (!empty($validated['business_type'])) {
                $metadata['business_type'] = $validated['business_type'];
            }
            if (!empty($validated['area'])) {
                $metadata['area'] = $validated['area'];
            }
            
            if (!empty($metadata)) {
                $updateData['metadata'] = $metadata;
            }

            // Handle requirements_submitted (JSON array)
            if (isset($validated['requirements_submitted'])) {
                $updateData['requirements_submitted'] = $validated['requirements_submitted'];
            }

            // Recalculate balance if total amount changed
            if ($validated['total_amount'] != $fee->total_amount) {
                $updateData['balance'] = $validated['total_amount'] - $fee->amount_paid;
                Log::debug('Fee total amount changed, recalculating balance', [
                    'old_total' => $fee->total_amount,
                    'new_total' => $validated['total_amount'],
                    'new_balance' => $updateData['balance']
                ]);
            }

            $fee->update($updateData);

            // Update status based on new balance
            $fee->updateStatus();

            DB::commit();

            Log::info('Fee updated successfully', [
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'changes' => $changes ?? [],
                'new_status' => $fee->status
            ]);

            return redirect()->route('admin.fees.show', $fee->id)
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

    // Cancel fee
    public function cancel(Request $request, Fee $fee)
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
                'remarks' => ($fee->remarks ? $fee->remarks . "\n" : '') . "Cancelled: " . $request->reason,
            ]);

            DB::commit();

            Log::info('Fee cancelled successfully', [
                'fee_id' => $fee->id,
                'reason' => $request->reason,
                'cancelled_by' => auth()->id()
            ]);

            return redirect()->route('admin.fees.show', $fee->id)
                ->with('success', 'Fee cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee cancellation failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to cancel fee. Please try again.');
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

            // Check if fee has payments
            if (method_exists($fee, 'hasPayments') && $fee->hasPayments()) {
                Log::warning('Fee delete attempted on fee with payments', [
                    'fee_id' => $fee->id
                ]);
                return back()->with('error', 'Cannot delete fee with existing payments.');
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

            return redirect()->route('admin.fees.index')
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
}