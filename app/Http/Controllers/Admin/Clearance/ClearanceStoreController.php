<?php

namespace App\Http\Controllers\Admin\Clearance;

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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class ClearanceStoreController extends BaseClearanceController
{
    protected ClearanceNotificationController $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function store(Request $request)
    {
        try {
            Log::info('ClearanceStoreController@store started', [
                'request_data' => $request->except(['_token'])
            ]);

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
                
                if (empty($payerId)) {
                    $validator->errors()->add('payer_id', 'Please select a payer.');
                    return;
                }
                
                $exists = match ($payerType) {
                    'resident' => Resident::where('id', $payerId)->exists(),
                    'household' => Household::where('id', $payerId)->exists(),
                    'business' => Business::where('id', $payerId)->exists(),
                    default => false,
                };
                
                if (!$exists) {
                    $validator->errors()->add('payer_id', "Selected {$payerType} does not exist.");
                }
            });
            
            if ($validator->fails()) {
                Log::warning('ClearanceStoreController validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return redirect()->back()->withErrors($validator)->withInput();
            }
            
            DB::beginTransaction();

            $clearanceType = ClearanceType::findOrFail($request->clearance_type_id);
            $payer = $this->getPayer($request->payer_type, (int) $request->payer_id);
            
            if (!$payer) {
                throw new \Exception("Payer not found: {$request->payer_type} ID {$request->payer_id}");
            }
            
            $residentId = $this->getResidentId($request, $payer);
            $contactInfo = $this->getContactInfoFromPayer($payer, $request->payer_type);
            $feeAmount = $this->calculateFee($request, $clearanceType);
            $referenceNumber = $this->generateReferenceNumber();
            
            $statusData = $this->determineInitialStatus($clearanceType, $feeAmount);
            
            /** @var User|null $admin */
            $admin = Auth::user();
            
            if (!$admin) {
                throw new \Exception('Authenticated user not found.');
            }
            
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

            $this->logCreationActivity($clearanceRequest, $clearanceType, $feeAmount, $statusData, $admin);

            DB::commit();

            Log::info('ClearanceStoreController@store completed', [
                'clearance_id' => $clearanceRequest->id,
                'reference_number' => $referenceNumber,
                'fee_amount' => $feeAmount,
                'proceed_to_payment' => $request->input('proceed_to_payment', false)
            ]);

            // Send notifications
            if (method_exists($this->notificationController, 'sendCreatedNotifications')) {
                $this->notificationController->sendCreatedNotifications($clearanceRequest, $payer, $request->payer_type);
            }

            return $this->handleRedirect($clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $request);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('ClearanceStoreController@store error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create clearance request: ' . $e->getMessage()]);
        }
    }

    private function getResidentId(Request $request, $payer): ?int
    {
        return match ($request->payer_type) {
            'resident' => (int) $request->payer_id,
            'household' => $this->getHouseholdHeadResidentId($payer),
            'business' => $payer->owner_id ?? null,
            default => null,
        };
    }

    private function getHouseholdHeadResidentId(Household $household): ?int
    {
        $headMember = $household->householdMembers()
            ->where('is_head', true)
            ->first();
            
        return $headMember ? (int) $headMember->resident_id : null;
    }

    private function calculateFee(Request $request, ClearanceType $clearanceType): float
    {
        $feeAmount = $request->fee_amount ?? $clearanceType->fee ?? 0;
        
        if ($feeAmount > 0) {
            $feeAmount = match ($request->urgency) {
                'rush' => $feeAmount * 1.5,
                'express' => $feeAmount * 2.0,
                default => $feeAmount,
            };
        }
        
        return round($feeAmount, 2);
    }

    private function determineInitialStatus(ClearanceType $clearanceType, float $feeAmount): array
    {
        $status = 'pending';
        $paymentStatus = 'unpaid';
        $balance = $feeAmount;

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

        return [
            'status' => $status,
            'payment_status' => $paymentStatus,
            'balance' => $balance,
        ];
    }

    private function logCreationActivity(
        ClearanceRequest $clearanceRequest,
        ClearanceType $clearanceType,
        float $feeAmount,
        array $statusData,
        User $admin
    ): void {
        $eventName = $feeAmount == 0 && $statusData['status'] === 'processing' 
            ? 'auto_processed' 
            : 'created';
            
        $description = $feeAmount == 0 && $statusData['status'] === 'processing'
            ? 'Clearance request auto-processed (no payment required)'
            : 'Clearance request created';

        activity()
            ->performedOn($clearanceRequest)
            ->causedBy($admin)
            ->withProperties([
                'clearance_type' => $clearanceType->name,
                'fee' => $feeAmount,
                'payer_type' => $clearanceRequest->payer_type,
                'payer_id' => $clearanceRequest->payer_id,
                'status' => $statusData['status'],
                'payment_status' => $statusData['payment_status'],
            ])
            ->event($eventName)
            ->log($description);
    }

    private function handleRedirect(
        ClearanceRequest $clearanceRequest,
        ClearanceType $clearanceType,
        array $contactInfo,
        float $feeAmount,
        Request $request
    ) {
        $proceedToPayment = $request->input('proceed_to_payment', false);
        
        Log::info('ClearanceStoreController@handleRedirect', [
            'clearance_id' => $clearanceRequest->id,
            'fee_amount' => $feeAmount,
            'proceed_to_payment' => $proceedToPayment
        ]);

        // Case 1: User clicked "Create & Pay" button (fee > 0)
        if ($feeAmount > 0 && $proceedToPayment) {
            return $this->redirectToPayment($clearanceRequest, $clearanceType, $contactInfo, $feeAmount, $request);
        }
        
        // Case 2: No fee required - stay on show page with success message
        if ($feeAmount == 0) {
            $message = $clearanceRequest->status === 'processing'
                ? 'Clearance request created and auto-processed successfully! No payment required. Reference number: ' . $clearanceRequest->reference_number
                : 'Clearance request created successfully! No payment required, pending review. Reference number: ' . $clearanceRequest->reference_number;
            
            return redirect()->route('admin.clearances.show', $clearanceRequest->id)
                ->with('success', $message);
        }

        // Case 3: Fee required but user clicked "Create Request" (not "Create & Pay")
        $message = 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number . 
                   '. Payment of ₱' . number_format($feeAmount, 2) . ' is required.';
        
        return redirect()->route('admin.clearances.show', $clearanceRequest->id)
            ->with('warning', $message);
    }

    private function redirectToPayment(
        ClearanceRequest $clearanceRequest,
        ClearanceType $clearanceType,
        array $contactInfo,
        float $feeAmount,
        Request $request
    ) {
        $params = http_build_query([
            'clearance_request_id' => $clearanceRequest->id,
            'clearance_type_id' => $clearanceRequest->clearance_type_id,
            'payer_type' => $request->payer_type,
            'payer_id' => $request->payer_id,
            'payer_name' => $contactInfo['name'],
            'contact_number' => $contactInfo['contact_number'] ?? '',
            'address' => $contactInfo['address'] ?? '',
            'purok' => $contactInfo['purok'] ?? '',
            'purpose' => $clearanceType->name . ' Clearance',
            'fee_amount' => $feeAmount,
            'from_clearance' => 'true',
            'clearance_created' => 'true',
            'clearance_type' => $clearanceType->name,
        ]);
        
        // Check for available payment routes
        $paymentRoute = $this->findPaymentRoute();
        
        if ($paymentRoute) {
            Log::info('Redirecting to payment page', [
                'route' => $paymentRoute,
                'clearance_id' => $clearanceRequest->id
            ]);
            
            return redirect()->to(route($paymentRoute) . '?' . $params);
        }
        
        // No payment route found - redirect to show page with warning
        Log::warning('No payment route found, redirecting to show page', [
            'clearance_id' => $clearanceRequest->id
        ]);
        
        $message = 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number . 
                   '. Payment of ₱' . number_format($feeAmount, 2) . ' is required. ' .
                   'Please process payment from the request details page.';
        
        return redirect()->route('admin.clearances.show', $clearanceRequest->id)
            ->with('warning', $message);
    }

    private function findPaymentRoute(): ?string
    {
        $possibleRoutes = [
            'admin.payments.create',
            'payments.create',
            'admin.payment.create',
            'payment.create',
            'admin.fees.create',
            'fees.create',
        ];
        
        foreach ($possibleRoutes as $routeName) {
            if (Route::has($routeName)) {
                return $routeName;
            }
        }
        
        return null;
    }
}