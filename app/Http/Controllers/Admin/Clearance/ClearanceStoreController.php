<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClearanceStoreController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function store(Request $request)
    {
        try {
            Log::info('ClearanceStoreController@store started');

            $validator = Validator::make($request->all(), [
                'payer_type' => 'required|in:resident,household,business',
                'payer_id' => 'required',
                'clearance_type_id' => 'required|exists:clearance_types,id',
                'purpose' => 'required|string|max:500',
                'specific_purpose' => 'nullable|string|max:500',
                'urgency' => 'required|in:normal,rush,express',
                'needed_date' => 'required|date|after_or_equal:today',
                'additional_requirements' => 'nullable|string',
                'fee_amount' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string',
                'proceed_to_payment' => 'nullable|boolean',
            ]);
            
            $validator->after(function ($validator) use ($request) {
                $payerType = $request->payer_type;
                $payerId = $request->payer_id;
                
                if ($payerType === 'resident' && !Resident::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected resident does not exist.');
                } elseif ($payerType === 'household' && !Household::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected household does not exist.');
                } elseif ($payerType === 'business' && !Business::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected business does not exist.');
                }
            });
            
            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            }
            
            DB::beginTransaction();

            $clearanceType = ClearanceType::find($request->clearance_type_id);
            $payer = $this->getPayer($request->payer_type, $request->payer_id);
            
            $residentId = $this->getResidentId($request, $payer);
            $contactInfo = $this->getContactInfoFromPayer($payer, $request->payer_type);
            $feeAmount = $this->calculateFee($request, $clearanceType);
            $referenceNumber = $this->generateReferenceNumber();
            
            $statusData = $this->determineInitialStatus($clearanceType, $feeAmount);
            
            $admin = auth()->user();
            $requestedByUserId = $this->getRequestedByUserId($payer, $request->payer_type);

            $clearanceRequest = ClearanceRequest::create([
                'payer_type' => $request->payer_type,
                'payer_id' => $request->payer_id,
                'resident_id' => $residentId,
                'contact_name' => $contactInfo['name'],
                'contact_number' => $contactInfo['contact_number'],
                'contact_address' => $contactInfo['address'],
                'contact_purok_id' => $contactInfo['purok_id'],
                'contact_email' => $contactInfo['email'],
                'clearance_type_id' => $request->clearance_type_id,
                'reference_number' => $referenceNumber,
                'purpose' => $request->purpose,
                'specific_purpose' => $request->specific_purpose,
                'urgency' => $request->urgency,
                'needed_date' => $request->needed_date,
                'additional_requirements' => $request->additional_requirements,
                'fee_amount' => $feeAmount,
                'status' => $statusData['status'],
                'remarks' => $request->remarks,
                'payment_status' => $statusData['payment_status'],
                'amount_paid' => 0,
                'balance' => $statusData['balance'],
                'issuing_officer_id' => $admin->id,
                'issuing_officer_name' => $admin->name,
                'requested_by_user_id' => $requestedByUserId,
                'processed_by' => $admin->id,
                'processed_at' => now(),
            ]);

            $this->logCreationActivity($clearanceRequest, $clearanceType, $feeAmount, $statusData);

            DB::commit();

            // Send notifications
            $this->notificationController->sendCreatedNotifications($clearanceRequest, $payer, $request->payer_type);

            return $this->handleRedirect($clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $request);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('ClearanceStoreController@store error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create clearance request. Please try again.']);
        }
    }

    private function getResidentId($request, $payer)
    {
        if ($request->payer_type === 'resident') {
            return $request->payer_id;
        } elseif ($request->payer_type === 'household' && $payer) {
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->first();
            return $headMember ? $headMember->resident_id : null;
        } elseif ($request->payer_type === 'business' && $payer && $payer->owner_id) {
            return $payer->owner_id;
        }
        return null;
    }

    private function calculateFee($request, $clearanceType)
    {
        $feeAmount = $request->fee_amount ?? $clearanceType->fee ?? 0;
        
        if ($feeAmount > 0) {
            if ($request->urgency === 'rush') {
                $feeAmount *= 1.5;
            } elseif ($request->urgency === 'express') {
                $feeAmount *= 2.0;
            }
        }
        
        return round($feeAmount, 2);
    }

    private function determineInitialStatus($clearanceType, $feeAmount)
    {
        $status = 'pending';
        $paymentStatus = 'unpaid';
        $balance = $feeAmount;

        if ($clearanceType) {
            if ($feeAmount > 0 && $clearanceType->requires_payment) {
                $status = 'pending_payment';
            } elseif ($feeAmount == 0) {
                $paymentStatus = 'paid';
                $balance = 0;
                $status = $clearanceType->requires_approval ? 'pending' : 'processing';
            } elseif ($feeAmount > 0 && !$clearanceType->requires_payment) {
                $paymentStatus = 'paid';
                $balance = 0;
                $status = 'processing';
            }
        }

        return [
            'status' => $status,
            'payment_status' => $paymentStatus,
            'balance' => $balance,
        ];
    }

    private function logCreationActivity($clearanceRequest, $clearanceType, $feeAmount, $statusData)
    {
        activity()
            ->performedOn($clearanceRequest)
            ->causedBy(auth()->user())
            ->withProperties([
                'clearance_type' => $clearanceType->name,
                'fee' => $feeAmount,
                'payer_type' => $clearanceRequest->payer_type,
                'payer_id' => $clearanceRequest->payer_id,
                'status' => $statusData['status'],
                'payment_status' => $statusData['payment_status'],
            ])
            ->event($feeAmount == 0 && $statusData['status'] === 'processing' ? 'auto_processed' : 'created')
            ->log($feeAmount == 0 && $statusData['status'] === 'processing' 
                ? 'Clearance request auto-processed (no payment required)' 
                : 'Clearance request created');
    }

    private function handleRedirect($clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $request)
    {
        if ($feeAmount > 0 && $request->input('proceed_to_payment', false)) {
            $params = http_build_query([
                'clearance_request_id' => $clearanceRequest->id,
                'clearance_type_id' => $clearanceRequest->clearance_type_id,
                'payer_type' => $request->payer_type,
                'payer_id' => $request->payer_id,
                'payer_name' => $contactInfo['name'],
                'contact_number' => $contactInfo['contact_number'],
                'address' => $contactInfo['address'],
                'purok' => $contactInfo['purok'],
                'purpose' => $clearanceType->name . ' Clearance',
                'fee_amount' => $feeAmount,
            ]);
            
            return redirect()->route('payments.create') . '?' . $params;
        }
        
        if ($feeAmount == 0) {
            $message = $clearanceRequest->status === 'processing'
                ? 'Clearance request created and auto-processed successfully! No payment required. Reference number: ' . $clearanceRequest->reference_number
                : 'Clearance request created successfully! No payment required, pending review. Reference number: ' . $clearanceRequest->reference_number;
            
            return redirect()->route('admin.clearances.show', $clearanceRequest->id)
                ->with('success', $message);
        }

        return redirect()->route('admin.clearances.show', $clearanceRequest->id)
            ->with('success', 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number);
    }
}