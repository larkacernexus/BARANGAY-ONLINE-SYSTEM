<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceUpdateController extends Controller
{
    use ClearanceNotificationTrait;

    public function __invoke(Request $request, ClearanceRequest $clearance)
    {
        // Store old status for notification
        $oldStatus = $clearance->status;
        
        // Define validation rules based on status
        $rules = $this->getValidationRules($clearance);
        
        $request->validate($rules);

        // Determine which fields can be updated
        $editableFields = $this->getEditableFields($clearance);

        // Get changed fields for audit log
        $changed = $this->getChangedFields($clearance, $request, $editableFields);

        // Handle fee amount change
        if (isset($changed['fee_amount'])) {
            $this->handleFeeChange($clearance);
        }

        // Log the activity
        if (!empty($changed)) {
            $this->logActivity($clearance, $changed, $request);
        }

        // Update the clearance
        $clearance->update($request->only($editableFields));

        // Send notification if status changed
        if ($oldStatus !== $clearance->status) {
            $this->sendClearanceStatusNotification($clearance, $oldStatus, $clearance->status);
        }

        return redirect()->route('clearances.show', $clearance)
            ->with('success', 'Clearance request updated successfully.');
    }

    protected function getValidationRules(ClearanceRequest $clearance): array
    {
        $rules = [
            'purpose' => 'required|string|max:255',
            'specific_purpose' => 'nullable|string|max:500',
            'needed_date' => 'required|date|after_or_equal:today',
            'additional_requirements' => 'nullable|string|max:1000',
            'remarks' => 'nullable|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
        ];

        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $rules['fee_amount'] = 'required|numeric|min:0';
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
        } elseif (in_array($clearance->status, ['issued', 'rejected', 'cancelled', 'expired'])) {
            $rules = ['admin_notes' => 'nullable|string|max:1000'];
        }

        return $rules;
    }

    protected function getEditableFields(ClearanceRequest $clearance): array
    {
        $editableFields = ['admin_notes']; // Always editable
        
        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'clearance_type_id',
                'urgency',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        }

        return $editableFields;
    }

    protected function getChangedFields(ClearanceRequest $clearance, Request $request, array $editableFields): array
    {
        $original = $clearance->toArray();
        $changed = [];
        
        foreach ($editableFields as $field) {
            $oldValue = $original[$field] ?? null;
            $newValue = $request->input($field);
            
            // Format dates for comparison
            if (in_array($field, ['needed_date', 'issue_date', 'valid_until'])) {
                if ($oldValue instanceof \DateTimeInterface) {
                    $oldValue = $oldValue->format('Y-m-d');
                }
            }
            
            if ($oldValue != $newValue) {
                $changed[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $changed;
    }

    protected function handleFeeChange(ClearanceRequest $clearance): void
    {
        $clearance->balance = $clearance->fee_amount - $clearance->amount_paid;
        
        if ($clearance->balance <= 0) {
            $clearance->payment_status = 'paid';
        } elseif ($clearance->amount_paid > 0) {
            $clearance->payment_status = 'partially_paid';
        }
    }

    protected function logActivity(ClearanceRequest $clearance, array $changed, Request $request): void
    {
        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties([
                'changes' => $changed,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->event('updated')
            ->log('Clearance request was updated');
    }
}