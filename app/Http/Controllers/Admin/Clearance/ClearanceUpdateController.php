<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ClearanceUpdateController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function update(Request $request, ClearanceRequest $clearance)
    {
        $oldStatus = $clearance->status;
        
        $rules = $this->getValidationRules($clearance);
        $request->validate($rules);

        $editableFields = $this->getEditableFields($clearance->status);
        $changed = $this->getChangedFields($clearance, $request, $editableFields);

        // If fee amount changed, update balance
        if (isset($changed['fee_amount'])) {
            $clearance->balance = $clearance->fee_amount - $clearance->amount_paid;
            
            if ($clearance->balance <= 0) {
                $clearance->payment_status = 'paid';
            } elseif ($clearance->amount_paid > 0) {
                $clearance->payment_status = 'partially_paid';
            }
        }

        // Log activity
        if (!empty($changed)) {
            activity()
                ->performedOn($clearance)
                ->causedBy(auth()->user())
                ->withProperties([
                    'changes' => $changed,
                    'ip_address' => $request->ip(),
                ])
                ->event('updated')
                ->log('Clearance request was updated');
        }

        $clearance->update($request->only($editableFields));

        // Send notification if status changed
        if ($oldStatus !== $clearance->status) {
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, $clearance->status);
        }

        return redirect()->route('admin.clearances.show', $clearance)
            ->with('success', 'Clearance request updated successfully.');
    }

    private function getValidationRules($clearance)
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
        } else {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        }

        return $rules;
    }

    private function getEditableFields($status)
    {
        $editableFields = ['admin_notes'];
        
        if (in_array($status, ['pending', 'pending_payment'])) {
            $editableFields = array_merge($editableFields, [
                'purpose', 'specific_purpose', 'clearance_type_id', 'urgency',
                'needed_date', 'additional_requirements', 'fee_amount', 'remarks',
            ]);
        } elseif (in_array($status, ['processing', 'approved'])) {
            $editableFields = array_merge($editableFields, [
                'purpose', 'specific_purpose', 'needed_date',
                'additional_requirements', 'fee_amount', 'remarks',
            ]);
        }

        return $editableFields;
    }

    private function getChangedFields($clearance, $request, $editableFields)
    {
        $original = $clearance->toArray();
        $changed = [];
        
        foreach ($editableFields as $field) {
            $oldValue = $original[$field] ?? null;
            $newValue = $request->input($field);
            
            if (in_array($field, ['needed_date', 'issue_date', 'valid_until'])) {
                if ($oldValue instanceof \DateTimeInterface) {
                    $oldValue = $oldValue->format('Y-m-d');
                }
                if ($newValue instanceof \DateTimeInterface) {
                    $newValue = $newValue->format('Y-m-d');
                }
            }
            
            if ($oldValue != $newValue) {
                $changed[$field] = ['old' => $oldValue, 'new' => $newValue];
            }
        }

        return $changed;
    }
}