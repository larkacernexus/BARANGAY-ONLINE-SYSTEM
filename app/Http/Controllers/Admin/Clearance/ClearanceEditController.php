<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Inertia\Inertia;

class ClearanceEditController extends Controller
{
    public function __invoke(ClearanceRequest $clearance)
    {
        // Load necessary relationships
        $this->loadRelationships($clearance);
        
        // Get active clearance types
        $clearanceTypes = $this->getClearanceTypes();

        // Format the data for Inertia
        $formattedClearance = $this->formatClearance($clearance);

        // Get purpose options
        $purposeOptions = $this->getPurposeOptions($clearance);

        return Inertia::render('admin/Clearances/Edit', [
            'clearance' => $formattedClearance,
            'clearanceTypes' => $clearanceTypes,
            'purposeOptions' => $purposeOptions,
        ]);
    }

    protected function loadRelationships(ClearanceRequest $clearance): void
    {
        $clearance->load(['clearanceType', 'contactPurok', 'payment']);
        
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => function ($query) {
                $query->with(['householdMembers.resident', 'purok']);
            }]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => function ($query) {
                $query->with(['owner', 'purok']);
            }]);
        }
    }

    protected function getClearanceTypes(): array
    {
        return ClearanceType::active()
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => (float) $type->fee,
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'formatted_fee' => $type->formatted_fee,
                    'requires_payment' => $type->requires_payment,
                    'requires_approval' => $type->requires_approval,
                    'is_discountable' => (bool) $type->is_discountable,
                    'requirements' => $type->documentRequirements()->get()->map(fn($req) => $req->name)->toArray(),
                    'purpose_options' => $type->purpose_options,
                ];
            })->toArray();
    }

    protected function formatClearance(ClearanceRequest $clearance): array
    {
        return [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
            'payer_type' => $clearance->payer_type,
            'payer_id' => $clearance->payer_id,
            'payer_display' => $clearance->payer_display,
            'resident_id' => $clearance->resident_id,
            'contact_name' => $clearance->contact_name,
            'contact_number' => $clearance->contact_number,
            'contact_address' => $clearance->contact_address,
            'contact_purok' => $clearance->contactPurok?->name,
            'contact_purok_id' => $clearance->contact_purok_id,
            'contact_email' => $clearance->contact_email,
            'purpose' => $clearance->purpose,
            'specific_purpose' => $clearance->specific_purpose,
            'clearance_type_id' => $clearance->clearance_type_id,
            'urgency' => $clearance->urgency,
            'fee_amount' => (float) $clearance->fee_amount,
            'needed_date' => $clearance->needed_date?->toDateString(),
            'additional_requirements' => $clearance->additional_requirements,
            'admin_notes' => $clearance->admin_notes,
            'remarks' => $clearance->remarks,
            'status' => $clearance->status,
            'issue_date' => $clearance->issue_date?->toDateString(),
            'valid_until' => $clearance->valid_until?->toDateString(),
            'payment_id' => $clearance->payment_id,
            'payment_status' => $clearance->payment_status,
            'amount_paid' => (float) $clearance->amount_paid,
            'balance' => (float) $clearance->balance,
            'status_display' => $clearance->status_display,
            'payment_status_display' => $clearance->payment_status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
            'is_fully_paid' => $clearance->is_fully_paid,
            'clearance_type' => $clearance->clearanceType ? [
                'id' => $clearance->clearanceType->id,
                'name' => $clearance->clearanceType->name,
                'requires_payment' => $clearance->clearanceType->requires_payment,
                'is_discountable' => (bool) $clearance->clearanceType->is_discountable,
            ] : null,
        ];
    }

    protected function getPurposeOptions(ClearanceRequest $clearance): array
    {
        if ($clearance->clearanceType && $clearance->clearanceType->purpose_options) {
            return is_array($clearance->clearanceType->purpose_options) 
                ? $clearance->clearanceType->purpose_options
                : array_map('trim', explode(',', $clearance->clearanceType->purpose_options));
        }
        
        return [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];
    }
}