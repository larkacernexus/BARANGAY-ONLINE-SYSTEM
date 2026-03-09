<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceStoreController extends Controller
{
    use ClearanceNotificationTrait;

    public function __invoke(Request $request)
    {
        try {
            Log::info('ClearanceStoreController started', [
                'user_id' => auth()->id(),
                'request_data' => $request->except(['_token'])
            ]);

            $validator = Validator::make($request->all(), [
                'payer_type' => 'required|in:resident,household,business',
                'payer_id' => 'required',
                'resident_id' => 'nullable|exists:residents,id',
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
            
            // Validate payer exists
            $validator->after(function ($validator) use ($request) {
                $this->validatePayerExists($validator, $request);
            });
            
            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }
            
            DB::beginTransaction();

            // Get clearance type
            $clearanceType = ClearanceType::find($request->clearance_type_id);
            
            // Get payer information
            $payer = $this->getPayer($request->payer_type, $request->payer_id);
            
            // Set resident_id
            $residentId = $this->determineResidentId($request, $payer);
            
            // Get contact information
            $contactInfo = $this->getContactInfoFromPayer($payer, $request->payer_type);
            
            // Calculate fee
            $feeAmount = $this->calculateFee($request, $clearanceType);
            
            // Generate reference number
            $referenceNumber = $this->generateReferenceNumber();
            
            // Determine status and payment status
            [$status, $paymentStatus, $balance] = $this->determineInitialStatus($clearanceType, $feeAmount);
            
            // Get admin info
            $admin = auth()->user();
            
            // Get requested by user ID
            $requestedByUserId = $this->getRequestedByUserId($payer, $request->payer_type);
            
            // Create the clearance request
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
                'status' => $status,
                'remarks' => $request->remarks,
                'payment_status' => $paymentStatus,
                'amount_paid' => 0,
                'balance' => $balance,
                'issuing_officer_id' => $admin->id,
                'issuing_officer_name' => $admin->name,
                'requested_by_user_id' => $requestedByUserId,
                'processed_by' => $admin->id,
                'processed_at' => now(),
            ]);

            DB::commit();

            // Send notifications
            $this->sendClearanceCreatedNotifications($clearanceRequest, $payer, $request->payer_type);

            // Handle redirect
            return $this->handleRedirect($request, $clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $status);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('ClearanceStoreController error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create clearance request. Please try again.']);
        }
    }

    protected function validatePayerExists($validator, $request)
    {
        $payerType = $request->payer_type;
        $payerId = $request->payer_id;
        
        if ($payerType === 'resident' && !Resident::where('id', $payerId)->exists()) {
            $validator->errors()->add('payer_id', 'Selected resident does not exist.');
        } elseif ($payerType === 'household' && !Household::where('id', $payerId)->exists()) {
            $validator->errors()->add('payer_id', 'Selected household does not exist.');
        } elseif ($payerType === 'business' && !Business::where('id', $payerId)->exists()) {
            $validator->errors()->add('payer_id', 'Selected business does not exist.');
        }
    }

    protected function determineResidentId($request, $payer)
    {
        if ($request->payer_type === 'resident') {
            return $request->payer_id;
        } elseif ($request->payer_type === 'household' && $payer) {
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->first();
            return $headMember?->resident_id;
        } elseif ($request->payer_type === 'business' && $payer && $payer->owner_id) {
            return $payer->owner_id;
        }
        
        return $request->resident_id;
    }

    protected function calculateFee($request, $clearanceType)
    {
        $feeAmount = $request->fee_amount;
        
        if ($clearanceType && ($feeAmount === null || $feeAmount === 0)) {
            $feeAmount = $clearanceType->fee ?? 0;
        }
        
        // Apply urgency surcharge
        if ($feeAmount > 0) {
            if ($request->urgency === 'rush') {
                $feeAmount *= 1.5;
            } elseif ($request->urgency === 'express') {
                $feeAmount *= 2.0;
            }
        }
        
        return round($feeAmount, 2);
    }

    protected function determineInitialStatus($clearanceType, $feeAmount)
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
                
                if ($clearanceType->requires_approval) {
                    $status = 'pending';
                } else {
                    $status = 'processing';
                }
            } elseif ($feeAmount > 0 && !$clearanceType->requires_payment) {
                $paymentStatus = 'paid';
                $balance = 0;
                $status = 'processing';
            }
        }
        
        return [$status, $paymentStatus, $balance];
    }

    protected function getContactInfoFromPayer($payer, string $type): array
    {
        $contactInfo = [
            'name' => null,
            'contact_number' => null,
            'address' => null,
            'purok_id' => null,
            'purok' => null,
            'email' => null,
        ];

        if (!$payer) {
            return $contactInfo;
        }

        if ($type === 'resident') {
            $contactInfo['name'] = $payer->full_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
            $contactInfo['email'] = $payer->email;
        } elseif ($type === 'household') {
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->with('resident')
                ->first();
                
            if ($headMember && $headMember->resident) {
                $contactInfo['name'] = $headMember->resident->full_name;
                $contactInfo['contact_number'] = $headMember->resident->contact_number ?? $payer->contact_number;
                $contactInfo['email'] = $headMember->resident->email ?? $payer->email;
            } else {
                $contactInfo['name'] = 'Household ' . $payer->household_number;
                $contactInfo['contact_number'] = $payer->contact_number;
                $contactInfo['email'] = $payer->email;
            }
            
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
        } elseif ($type === 'business') {
            $contactInfo['name'] = $payer->business_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok_name;
            
            if ($payer->owner_id && $payer->owner) {
                $contactInfo['email'] = $payer->owner->email;
            }
        }

        return $contactInfo;
    }

    protected function getRequestedByUserId($payer, string $type): ?int
    {
        if (!$payer) {
            return null;
        }

        if ($type === 'resident') {
            $user = User::where('resident_id', $payer->id)
                ->orWhere('current_resident_id', $payer->id)
                ->where('status', 'active')
                ->first();
            return $user?->id;
        }
        
        if ($type === 'household' && $payer) {
            if ($payer->user && $payer->user->status === 'active') {
                return $payer->user->id;
            }
            
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->with('resident')
                ->first();
                
            if ($headMember && $headMember->resident) {
                $user = User::where('resident_id', $headMember->resident_id)
                    ->orWhere('current_resident_id', $headMember->resident_id)
                    ->where('status', 'active')
                    ->first();
                return $user?->id;
            }
        }
        
        if ($type === 'business' && $payer && $payer->owner_id) {
            $user = User::where('resident_id', $payer->owner_id)
                ->orWhere('current_resident_id', $payer->owner_id)
                ->where('status', 'active')
                ->first();
            return $user?->id;
        }
        
        return null;
    }

    protected function generateReferenceNumber(): string
    {
        $prefix = 'CLR-' . date('Ymd') . '-';
        $lastRequest = ClearanceRequest::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    protected function handleRedirect($request, $clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $status)
    {
        // Handle payment redirect
        if ($feeAmount > 0 && $request->input('proceed_to_payment', false)) {
            $clearanceRequest->load(['clearanceType']);
            
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
        
        // Zero-fee redirects
        if ($feeAmount == 0) {
            if ($status === 'processing') {
                return redirect()->route('clearances.show', $clearanceRequest->id)
                    ->with('success', 'Clearance request created and auto-processed successfully! No payment required. Reference number: ' . $clearanceRequest->reference_number);
            } else {
                return redirect()->route('clearances.show', $clearanceRequest->id)
                    ->with('success', 'Clearance request created successfully! No payment required, pending review. Reference number: ' . $clearanceRequest->reference_number);
            }
        }

        // Default redirect
        return redirect()->route('clearances.show', $clearanceRequest->id)
            ->with('success', 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number);
    }
}