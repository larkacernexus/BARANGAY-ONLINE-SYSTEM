<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Inertia\Inertia;

class ClearanceEditController extends Controller
{
    public function edit(ClearanceRequest $clearance)
    {
        $clearance->load(['clearanceType', 'contactPurok', 'payment']);
        
        // Load payer based on type
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => fn($q) => $q->with(['householdMembers.resident', 'purok'])]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => fn($q) => $q->with(['owner', 'purok'])]);
        }

        $clearanceTypes = ClearanceType::active()
            ->orderBy('name')
            ->get()
            ->map(fn($type) => [
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
                'is_online_only' => $type->is_online_only,
                'is_discountable' => (bool) $type->is_discountable,
                'purpose_options' => $type->purpose_options,
            ]);

        $formattedClearance = $this->formatClearance($clearance);
        
        $purposeOptions = $this->getPurposeOptions($clearance);

        return Inertia::render('admin/Clearances/Edit', [
            'clearance' => $formattedClearance,
            'clearanceTypes' => $clearanceTypes,
            'purposeOptions' => $purposeOptions,
        ]);
    }

    private function formatClearance($clearance)
    {
        return [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
            'payer_type' => $clearance->payer_type,
            'payer_id' => $clearance->payer_id,
            'payer_name' => $clearance->payer_name,
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
            'payment_status' => $clearance->payment_status,
            'amount_paid' => (float) $clearance->amount_paid,
            'balance' => (float) $clearance->balance,
            'clearance_type' => $clearance->clearanceType ? [
                'id' => $clearance->clearanceType->id,
                'name' => $clearance->clearanceType->name,
                'code' => $clearance->clearanceType->code,
                'fee' => (float) $clearance->clearanceType->fee,
                'requires_payment' => $clearance->clearanceType->requires_payment,
                'requires_approval' => $clearance->clearanceType->requires_approval,
                'is_discountable' => (bool) $clearance->clearanceType->is_discountable,
            ] : null,
            'status_display' => $clearance->status_display,
            'payment_status_display' => $clearance->payment_status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
            'is_fully_paid' => $clearance->is_fully_paid,
        ];
    }

    private function getPurposeOptions($clearance)
    {
        $purposeOptions = [];
        if ($clearance->clearanceType && $clearance->clearanceType->purpose_options) {
            $purposeOptions = is_array($clearance->clearanceType->purpose_options) 
                ? $clearance->clearanceType->purpose_options
                : array_map('trim', explode(',', $clearance->clearanceType->purpose_options));
        }
        return $purposeOptions;
    }
}