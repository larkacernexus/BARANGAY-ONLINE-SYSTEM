<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Household;
use App\Models\Purok;
use App\Models\Privilege;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\ResidentDocument;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResidentShowController extends BaseResidentController
{
    public function show(Resident $resident)
    {
        Log::info('Viewing resident details', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->first_name . ' ' . $resident->last_name,
            'user_id' => auth()->id(),
        ]);
        
        // Load resident with relationships
        $resident->load([
            'purok',
            'residentPrivileges.privilege.discountType',
            'householdMemberships.household.purok',
            'householdMemberships.household.householdMembers.resident.purok',
            'householdMemberships.household.householdMembers.resident.residentPrivileges',
        ]);
        
        $residentData = $this->formatResidentData($resident);
        $householdData = $this->getHouseholdData($resident);
        $householdMembership = $this->getHouseholdMembership($resident);
        $relatedHouseholdMembers = $this->getRelatedHouseholdMembers($resident);
        
        // Get all households for the dropdown (excluding current household if any)
        $households = $this->getAllHouseholds($resident);
        
        // Get all puroks for new household creation
        $puroks = Purok::orderBy('name')->get(['id', 'name']);

        // Get available privileges for this resident (not yet assigned)
        $assignedPrivilegeIds = $resident->residentPrivileges->pluck('privilege_id')->toArray();
        $availablePrivileges = Privilege::with('discountType')
            ->where('is_active', true)
            ->when(!empty($assignedPrivilegeIds), function($query) use ($assignedPrivilegeIds) {
                return $query->whereNotIn('id', $assignedPrivilegeIds);
            })
            ->orderBy('name')
            ->get()
            ->map(function($privilege) {
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'description' => $privilege->description,
                    'is_active' => $privilege->is_active,
                    'default_discount_percentage' => $privilege->default_discount_percentage,
                    'requires_id_number' => $privilege->requires_id_number,
                    'requires_verification' => $privilege->requires_verification,
                    'validity_years' => $privilege->validity_years,
                    'discount_type' => $privilege->discount_type ? [
                        'id' => $privilege->discount_type->id,
                        'name' => $privilege->discount_type->name,
                        'code' => $privilege->discount_type->code,
                    ] : null,
                ];
            });
        
        // Get fees for this resident
        $fees = $this->getResidentFees($resident);
        
        // Get payments for this resident
        $payments = $this->getResidentPayments($resident);
        
        // Get clearances for this resident
        $clearances = $this->getResidentClearances($resident);
        
        // Get documents for this resident
        $documents = $this->getResidentDocuments($resident);
        
        // Get activity logs for this resident
        $activities = $this->getResidentActivities($resident);

        Log::info('Resident data summary', [
            'resident_id' => $resident->id,
            'fees_count' => count($fees),
            'payments_count' => count($payments),
            'clearances_count' => count($clearances),
            'documents_count' => count($documents),
            'activities_count' => count($activities),
        ]);

        return Inertia::render('admin/Residents/Show', [
            'resident' => $residentData,
            'household' => $householdData,
            'household_membership' => $householdMembership,
            'related_household_members' => $relatedHouseholdMembers,
            'households' => $households,
            'puroks' => $puroks,
            'available_privileges' => $availablePrivileges,
            'fees' => $fees,
            'payments' => $payments,
            'clearances' => $clearances,
            'documents' => $documents,
            'activities' => $activities,
        ]);
    }

    /**
     * Get fees for this resident
     */
    private function getResidentFees(Resident $resident): array
    {
        // Try both possible payer_type values
        $fees = Fee::where(function($query) use ($resident) {
                $query->where('payer_type', 'resident')
                      ->orWhere('payer_type', 'App\Models\Resident');
            })
            ->where('payer_id', $resident->id)
            ->with(['feeType', 'paymentItems.payment'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        Log::info('Resident fees query', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->full_name,
            'fees_found' => $fees->count(),
            'fee_ids' => $fees->pluck('id')->toArray()
        ]);
        
        return $fees->map(function($fee) {
            $totalAmount = floatval($fee->total_amount ?? 0);
            $amountPaid = floatval($fee->amount_paid ?? 0);
            $balance = floatval($fee->balance ?? 0);
            
            return [
                'id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'or_number' => $fee->or_number,
                'fee_type' => $fee->feeType ? [
                    'id' => $fee->feeType->id,
                    'name' => $fee->feeType->name,
                    'code' => $fee->feeType->code,
                ] : null,
                'total_amount' => $totalAmount,
                'amount_paid' => $amountPaid,
                'balance' => $balance,
                'status' => $fee->status,
                'issue_date' => $fee->issue_date?->toISOString(),
                'due_date' => $fee->due_date?->toISOString(),
                'description' => $fee->metadata['description'] ?? null,
                'formatted_total' => '₱' . number_format($totalAmount, 2),
                'formatted_paid' => '₱' . number_format($amountPaid, 2),
                'formatted_balance' => '₱' . number_format($balance, 2),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get payments for this resident
     */
    private function getResidentPayments(Resident $resident): array
    {
        // Try both possible payer_type values
        $payments = Payment::where(function($query) use ($resident) {
                $query->where('payer_type', 'resident')
                      ->orWhere('payer_type', 'App\Models\Resident');
            })
            ->where('payer_id', $resident->id)
            ->with(['recorder'])
            ->orderBy('payment_date', 'desc')
            ->get();
        
        Log::info('Resident payments query', [
            'resident_id' => $resident->id,
            'resident_name' => $resident->full_name,
            'payments_found' => $payments->count(),
            'payment_ids' => $payments->pluck('id')->toArray(),
            'payment_or_numbers' => $payments->pluck('or_number')->toArray()
        ]);
        
        return $payments->map(function($payment) {
            $totalAmount = floatval($payment->total_amount ?? 0);
            $amountPaid = floatval($payment->amount_paid ?? 0);
            $subtotal = floatval($payment->subtotal ?? 0);
            $surcharge = floatval($payment->surcharge ?? 0);
            $penalty = floatval($payment->penalty ?? 0);
            $discount = floatval($payment->discount ?? 0);
            
            return [
                'id' => $payment->id,
                'or_number' => $payment->or_number,
                'total_amount' => $totalAmount,
                'amount_paid' => $amountPaid,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date?->toISOString(),
                'status' => $payment->status,
                'payer_name' => $payment->payer_name,
                'purpose' => $payment->purpose ?? 'N/A',
                'subtotal' => $subtotal,
                'surcharge' => $surcharge,
                'penalty' => $penalty,
                'discount' => $discount,
                'formatted_total' => '₱' . number_format($totalAmount, 2),
                'formatted_amount_paid' => '₱' . number_format($amountPaid, 2),
                'formatted_subtotal' => '₱' . number_format($subtotal, 2),
                'formatted_surcharge' => $surcharge > 0 ? 'Surcharge: ₱' . number_format($surcharge, 2) : null,
                'formatted_penalty' => $penalty > 0 ? 'Penalty: ₱' . number_format($penalty, 2) : null,
                'formatted_discount' => $discount > 0 ? 'Discount: ₱' . number_format($discount, 2) : null,
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get clearances for this resident
     */
    private function getResidentClearances(Resident $resident): array
    {
        $clearances = ClearanceRequest::where('resident_id', $resident->id)
            ->with(['clearanceType'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        Log::info('Resident clearances query', [
            'resident_id' => $resident->id,
            'clearances_found' => $clearances->count(),
            'clearance_ids' => $clearances->pluck('id')->toArray()
        ]);
        
        return $clearances->map(function($clearance) {
            return [
                'id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'clearance_type' => $clearance->clearanceType ? [
                    'id' => $clearance->clearanceType->id,
                    'name' => $clearance->clearanceType->name,
                    'code' => $clearance->clearanceType->code,
                ] : null,
                'status' => $clearance->status,
                'purpose' => $clearance->purpose,
                'request_date' => $clearance->created_at?->toISOString(),
                'release_date' => $clearance->released_at?->toISOString(),
                'expiry_date' => $clearance->expires_at?->toISOString(),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get documents for this resident
     */
    private function getResidentDocuments(Resident $resident): array
    {
        $documents = ResidentDocument::where('resident_id', $resident->id)
            ->with(['category', 'documentType', 'uploadedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        Log::info('Resident documents query', [
            'resident_id' => $resident->id,
            'documents_found' => $documents->count(),
            'document_ids' => $documents->pluck('id')->toArray()
        ]);
        
        return $documents->map(function($doc) {
            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'file_name' => $doc->file_name,
                'file_extension' => $doc->file_extension,
                'file_size_human' => $doc->file_size_human,
                'description' => $doc->description,
                'reference_number' => $doc->reference_number,
                'issue_date' => $doc->issue_date?->toISOString(),
                'expiry_date' => $doc->expiry_date?->toISOString(),
                'tags' => $doc->tags,
                'status' => $doc->status,
                'uploaded_at' => $doc->uploaded_at?->toISOString(),
                'view_count' => $doc->view_count,
                'download_count' => $doc->download_count,
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get activity logs for this resident
     */
    private function getResidentActivities(Resident $resident): array
    {
        $activities = Activity::where('subject_type', Resident::class)
            ->where('subject_id', $resident->id)
            ->orWhere(function($query) use ($resident) {
                $query->where('causer_type', Resident::class)
                      ->where('causer_id', $resident->id);
            })
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();
        
        Log::info('Resident activities query', [
            'resident_id' => $resident->id,
            'activities_found' => $activities->count()
        ]);
        
        return $activities->map(function($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at->toISOString(),
                'subject_type' => class_basename($activity->subject_type),
            ];
        })
        ->values()
        ->toArray();
    }

    private function formatResidentData($resident): array
    {
        return [
            'id' => $resident->id,
            'resident_id' => $resident->resident_id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'full_name' => $resident->full_name,
            'birth_date' => $resident->birth_date?->toISOString(),
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'address' => $resident->address,
            'purok_id' => $resident->purok_id,
            'purok_name' => $resident->purok?->name,
            'household_id' => $resident->household_id,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'place_of_birth' => $resident->place_of_birth,
            'remarks' => $resident->remarks,
            'status' => $resident->status,
            'photo_url' => $resident->photo_url,
            'privileges' => $resident->residentPrivileges
                ->map(fn($rp) => $this->formatPrivilegeForFrontend($rp))
                ->values()
                ->toArray(),
            'privileges_count' => $resident->residentPrivileges->count(),
            'active_privileges_count' => $resident->residentPrivileges->filter(fn($rp) => $rp->isActive())->count(),
            'created_at' => $resident->created_at->toISOString(),
            'updated_at' => $resident->updated_at->toISOString(),
        ];
    }

    /**
     * Format privilege data specifically for the frontend Show page
     */
    private function formatPrivilegeForFrontend($residentPrivilege): array
    {
        $baseData = $this->formatPrivilege($residentPrivilege);
        $privilege = $residentPrivilege->privilege;
        
        return [
            'id' => $baseData['id'],
            'resident_id' => $residentPrivilege->resident_id,
            'privilege_id' => $baseData['privilege_id'],
            'id_number' => $baseData['id_number'],
            'issued_date' => $residentPrivilege->created_at?->toISOString(),
            'expiry_date' => $residentPrivilege->expires_at?->toISOString(),
            'verified_at' => $baseData['verified_at'],
            'verified_by' => $residentPrivilege->verified_by,
            'status' => $baseData['status'],
            'remarks' => $baseData['remarks'],
            'created_at' => $residentPrivilege->created_at->toISOString(),
            'updated_at' => $residentPrivilege->updated_at->toISOString(),
            
            'privilege' => [
                'id' => $privilege->id,
                'name' => $privilege->name,
                'code' => $privilege->code,
                'description' => $privilege->description,
                'is_active' => (bool) $privilege->is_active,
                'discount_type_id' => $privilege->discount_type_id,
                'default_discount_percentage' => $privilege->default_discount_percentage,
                'requires_id_number' => (bool) $privilege->requires_id_number,
                'requires_verification' => (bool) $privilege->requires_verification,
                'validity_years' => $privilege->validity_years,
                'discount_type' => $privilege->discount_type ? [
                    'id' => $privilege->discount_type->id,
                    'name' => $privilege->discount_type->name,
                    'code' => $privilege->discount_type->code,
                ] : null,
            ],
            
            'discount_percentage' => $baseData['discount_percentage'],
            'discount_type_name' => $privilege->discount_type?->name ?? 'Discount',
            'discount_code' => $privilege->discount_type?->code ?? $privilege->code,
            'privilege_name' => $privilege->name,
            'privilege_code' => $privilege->code,
            'privilege_description' => $privilege->description,
        ];
    }

    private function getHouseholdData($resident)
    {
        if (!$resident->householdMemberships()->exists()) {
            return null;
        }

        $membership = $resident->householdMemberships()->first();
        $household = $membership->household;

        if (!$household) {
            return null;
        }

        $headMember = $household->householdMembers()->where('is_head', true)->first();
        $headResident = $headMember ? $headMember->resident : null;

        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'address' => $household->address,
            'purok' => $household->purok?->name,
            'purok_id' => $household->purok_id,
            'member_count' => $household->member_count,
            'income_range' => $household->income_range,
            'housing_type' => $household->housing_type,
            'ownership_status' => $household->ownership_status,
            'water_source' => $household->water_source,
            'electricity' => (bool) $household->electricity,
            'internet' => (bool) $household->internet,
            'vehicle' => (bool) $household->vehicle,
            'remarks' => $household->remarks,
            'status' => $household->status,
            'head_resident' => $headResident ? $this->formatHeadResident($headResident) : null,
        ];
    }

    private function formatHeadResident($resident): array
    {
        return [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'age' => (int) $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'photo_url' => $resident->photo_url,
        ];
    }

    private function getHouseholdMembership($resident)
    {
        $membership = $resident->householdMemberships()->first();
        
        if (!$membership) {
            return null;
        }

        return [
            'id' => $membership->id,
            'household_id' => $membership->household_id,
            'relationship_to_head' => $membership->relationship_to_head,
            'is_head' => (bool) $membership->is_head,
        ];
    }

    private function getRelatedHouseholdMembers($resident)
    {
        $membership = $resident->householdMemberships()->first();
        
        if (!$membership || !$membership->household) {
            return [];
        }

        return $membership->household->householdMembers
            ->filter(fn($m) => $m->resident_id !== $resident->id)
            ->map(function($member) {
                return [
                    'id' => $member->id,
                    'resident_id' => $member->resident_id,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => (bool) $member->is_head,
                    'resident' => [
                        'id' => $member->resident->id,
                        'first_name' => $member->resident->first_name,
                        'last_name' => $member->resident->last_name,
                        'middle_name' => $member->resident->middle_name,
                        'age' => (int) $member->resident->age,
                        'gender' => $member->resident->gender,
                        'civil_status' => $member->resident->civil_status,
                        'contact_number' => $member->resident->contact_number,
                        'purok' => $member->resident->purok?->name,
                        'purok_id' => $member->resident->purok_id,
                        'photo_url' => $member->resident->photo_url,
                    ]
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get all households for the dropdown, excluding the current household if any
     */
    private function getAllHouseholds($resident)
    {
        $currentHouseholdId = $resident->household_id;
        
        return Household::with(['householdMembers.resident'])
            ->when($currentHouseholdId, function($query) use ($currentHouseholdId) {
                return $query->where('id', '!=', $currentHouseholdId);
            })
            ->orderBy('household_number')
            ->get()
            ->map(function($household) {
                $headMember = $household->householdMembers->where('is_head', true)->first();
                $headName = $headMember && $headMember->resident 
                    ? $headMember->resident->full_name 
                    : 'No Head';

                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName,
                    'head_resident_id' => $headMember ? $headMember->resident_id : null,
                    'has_head' => !is_null($headMember),
                    'head_name' => $headName,
                    'member_count' => $household->member_count,
                    'address' => $household->address,
                    'purok' => $household->purok?->name,
                ];
            });
    }
}