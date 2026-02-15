<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use App\Models\DocumentCategory;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FeeCreateController extends Controller
{
    // Show create form
    public function create(Request $request)
    {
        try {
            Log::info('FeeCreateController@create accessed', [
                'user_id' => Auth::id(),
                'request_params' => $request->all()
            ]);

            $resident = null;
            $household = null;
            $feeToDuplicate = null;

            // Check if we're duplicating from an existing fee
            if ($request->has('duplicate_from')) {
                $feeToDuplicate = Fee::with(['feeType', 'resident', 'household'])->find($request->duplicate_from);

                if ($feeToDuplicate) {
                    // Set pre-selected resident/household based on the duplicated fee
                    if ($feeToDuplicate->payer_type === 'resident' && $feeToDuplicate->resident) {
                        $resident = $feeToDuplicate->resident;
                    } elseif ($feeToDuplicate->payer_type === 'household' && $feeToDuplicate->household) {
                        $household = $feeToDuplicate->household;
                    }

                    Log::info('Fee duplication requested', [
                        'original_fee_id' => $feeToDuplicate->id,
                        'original_fee_code' => $feeToDuplicate->fee_code
                    ]);
                }
            }

            if ($request->has('resident_id')) {
                $resident = Resident::with('purok')->find($request->resident_id);
                Log::debug('Preselected resident', ['resident_id' => $request->resident_id]);
            }

            if ($request->has('household_id')) {
                $household = Household::with(['purok', 'householdMembers.resident'])->find($request->household_id);
                Log::debug('Preselected household', ['household_id' => $request->household_id]);
            }

            // Prepare initial data for form
            $initialData = [];
            if ($feeToDuplicate) {
                $initialData = $this->prepareDuplicateData($feeToDuplicate);
            }

            // Get fee types with document category only - REMOVED individual discount fields
            $feeTypes = FeeType::with(['documentCategory'])
                ->active()
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'short_name' => $type->short_name,
                        'document_category_id' => $type->document_category_id,
                        'document_category' => $type->documentCategory ? [
                            'id' => $type->documentCategory->id,
                            'name' => $type->documentCategory->name,
                            'slug' => $type->documentCategory->slug,
                            'icon' => $type->documentCategory->icon,
                            'color' => $type->documentCategory->color,
                            'description' => $type->documentCategory->description,
                            'order' => $type->documentCategory->order,
                        ] : null,
                        'base_amount' => (float) $type->base_amount,
                        'amount_type' => $type->amount_type,
                        'computation_formula' => $type->computation_formula,
                        'unit' => $type->unit,
                        // REMOVED: Individual discount fields
                        // 'has_senior_discount', etc.
                        
                        // SIMPLIFIED: Just a flag
                        'is_discountable' => (bool) $type->is_discountable,
                        
                        // Surcharge fields
                        'has_surcharge' => (bool) $type->has_surcharge,
                        'surcharge_percentage' => (float) $type->surcharge_percentage,
                        'surcharge_fixed' => (float) $type->surcharge_fixed,
                        // Penalty fields
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                        // Other fields
                        'frequency' => $type->frequency,
                        'validity_days' => $type->validity_days,
                        'applicable_to' => $type->applicable_to,
                        'applicable_puroks' => $type->applicable_puroks ?? [],
                        'requirements' => $type->requirements ?? [],
                        'effective_date' => $type->effective_date,
                        'expiry_date' => $type->expiry_date,
                        'is_mandatory' => (bool) $type->is_mandatory,
                        'auto_generate' => (bool) $type->auto_generate,
                        'due_day' => $type->due_day,
                        'sort_order' => $type->sort_order,
                        'description' => $type->description,
                        'notes' => $type->notes,
                    ];
                });

            // Get residents for bulk selection
            $residents = Resident::with('purok')
                ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id', 'contact_number', 'birth_date', 'is_pwd', 'is_senior', 'is_solo_parent', 'is_indigent'])
                ->orderBy('last_name')
                ->get()
                ->map(function ($resident) {
                    $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                    $isSenior = $resident->is_senior || $age >= 60;

                    return [
                        'id' => $resident->id,
                        'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
                        'full_name' => $resident->full_name,
                        'purok' => $resident->purok ? $resident->purok->name : null,
                        'contact_number' => $resident->contact_number,
                        'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                        'age' => $age,
                        'is_senior' => (bool) $isSenior,
                        'is_pwd' => (bool) $resident->is_pwd,
                        'is_solo_parent' => (bool) $resident->is_solo_parent,
                        'is_indigent' => (bool) $resident->is_indigent,
                        'senior_id_number' => $resident->senior_id_number,
                        'pwd_id_number' => $resident->pwd_id_number,
                        'solo_parent_id_number' => $resident->solo_parent_id_number,
                        'indigent_id_number' => $resident->indigent_id_number,
                        'has_special_classification' => $isSenior || $resident->is_pwd || $resident->is_solo_parent || $resident->is_indigent,
                    ];
                });

            // Get households for bulk selection
            $households = Household::with([
                'purok',
                'householdMembers' => function ($query) {
                    $query->where('is_head', true)->with('resident');
                }
            ])
                ->select(['id', 'household_number', 'purok_id', 'contact_number'])
                ->orderBy('household_number')
                ->get()
                ->map(function ($household) {
                    $headMember = $household->householdMembers->first();
                    $headName = $headMember && $headMember->resident
                        ? trim("{$headMember->resident->first_name} {$headMember->resident->last_name}")
                        : null;

                    return [
                        'id' => $household->id,
                        'household_number' => $household->household_number,
                        'name' => $headName ?? 'Household #' . $household->household_number,
                        'purok' => $household->purok ? $household->purok->name : null,
                        'contact_number' => $household->contact_number,
                        'head_resident_name' => $headName,
                    ];
                });

            // Prepare preselected data
            $preselectedResidentData = null;
            if ($resident) {
                $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                $isSenior = $resident->is_senior || $age >= 60;

                $preselectedResidentData = [
                    'id' => $resident->id,
                    'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
                    'full_name' => $resident->full_name,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'contact_number' => $resident->contact_number,
                    'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                    'age' => $age,
                    'is_senior' => (bool) $isSenior,
                    'is_pwd' => (bool) $resident->is_pwd,
                    'is_solo_parent' => (bool) $resident->is_solo_parent,
                    'is_indigent' => (bool) $resident->is_indigent,
                    'senior_id_number' => $resident->senior_id_number,
                    'pwd_id_number' => $resident->pwd_id_number,
                    'solo_parent_id_number' => $resident->solo_parent_id_number,
                    'indigent_id_number' => $resident->indigent_id_number,
                ];
            }

            $preselectedHouseholdData = null;
            if ($household) {
                $household->load([
                    'householdMembers' => function ($query) {
                        $query->where('is_head', true)->with('resident');
                    }
                ]);

                $headMember = $household->householdMembers->first();
                $headName = $headMember && $headMember->resident
                    ? trim("{$headMember->resident->first_name} {$headMember->resident->last_name}")
                    : null;

                $preselectedHouseholdData = [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'name' => $headName ?? 'Household #' . $household->household_number,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'contact_number' => $household->contact_number,
                ];
            }

            return Inertia::render('admin/Fees/Create', [
                'feeTypes' => $feeTypes,
                'residents' => $residents,
                'households' => $households,
                'preselectedResident' => $preselectedResidentData,
                'preselectedHousehold' => $preselectedHouseholdData,
                'puroks' => \App\Models\Purok::pluck('name')->filter()->values(),
                'documentCategories' => DocumentCategory::active()->ordered()->get(),
                'initialData' => $initialData,
                'duplicateFrom' => $feeToDuplicate ? [
                    'id' => $feeToDuplicate->id,
                    'fee_code' => $feeToDuplicate->fee_code,
                    'fee_type_name' => $feeToDuplicate->feeType->name ?? 'Unknown',
                ] : null,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeCreateController@create error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fee creation form. Please try again.');
        }
    }

    // Prepare duplicate data helper
    private function prepareDuplicateData(Fee $fee)
    {
        return [
            'fee_type_id' => $fee->fee_type_id,
            'payer_type' => $fee->payer_type,
            'payer_id' => $fee->payer_id,
            'payer_name' => $fee->payer_name,
            'contact_number' => $fee->contact_number,
            'address' => $fee->address,
            'purok' => $fee->purok,
            'zone' => $fee->zone,
            'purpose' => $fee->purpose,
            'issue_date' => $fee->issue_date ? Carbon::parse($fee->issue_date)->format('Y-m-d') : null,
            'due_date' => $fee->due_date ? Carbon::parse($fee->due_date)->format('Y-m-d') : null,
            'base_amount' => (float) $fee->base_amount,
            'surcharge_amount' => (float) $fee->surcharge_amount,
            'penalty_amount' => (float) $fee->penalty_amount,
            'discount_amount' => (float) $fee->total_discounts, // This still exists in fee model
            'total_amount' => (float) $fee->total_amount,
            'valid_from' => $fee->valid_from ? Carbon::parse($fee->valid_from)->format('Y-m-d') : null,
            'valid_until' => $fee->valid_until ? Carbon::parse($fee->valid_until)->format('Y-m-d') : null,
            'property_description' => $fee->property_description,
            'business_type' => $fee->business_type,
            'area' => $fee->area,
            'billing_period' => $fee->billing_period,
            'period_start' => $fee->period_start ? Carbon::parse($fee->period_start)->format('Y-m-d') : null,
            'period_end' => $fee->period_end ? Carbon::parse($fee->period_end)->format('Y-m-d') : null,
            'computation_details' => $fee->computation_details,
            'requirements_submitted' => $fee->requirements_submitted,
            'remarks' => $fee->remarks,
            'waiver_reason' => $fee->waiver_reason,
        ];
    }
}