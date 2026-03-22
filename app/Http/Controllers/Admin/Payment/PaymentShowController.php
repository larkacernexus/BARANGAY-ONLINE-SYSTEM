<?php
// app/Http/Controllers/Admin/Payment/PaymentShowController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\Fee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentShowController extends BasePaymentController
{
    /**
     * Display the specified payment.
     */
    public function show(Payment $payment)
    {
        $payment->load([
            'items',
            'recorder',
            'items.clearanceRequest.clearanceType',
            'items.fee.feeType',
            'items.clearanceRequest.resident.household',
            'items.clearanceRequest.documents',
            'items.clearanceRequest.issuingOfficer',
            'items.clearanceRequest.processedBy',
            'discounts.rule',
            'discounts.verifier',
            'activities' // Load activity logs
        ]);

        $clearanceRequests = $this->getClearanceRequestsForPayment($payment);
        $fees = $this->getFeesForPayment($payment);
        $payer = $this->getPayerDetails($payment);
        $relatedPayments = $this->getRelatedPayments($payment);
        $paymentBreakdown = $this->calculatePaymentBreakdown($payment);
        $discountDetails = $this->getDiscountDetails($payment);
        $history = $this->getPaymentHistory($payment); // Add history

        $this->enrichPaymentWithFormattedData($payment);

        return Inertia::render('admin/Payments/Show', [
            'payment' => $payment,
            'clearanceRequests' => $clearanceRequests,
            'fees' => $fees,
            'payer' => $payer,
            'relatedPayments' => $relatedPayments,
            'paymentBreakdown' => $paymentBreakdown,
            'discountDetails' => $discountDetails,
            'history' => $history, // Add history to props
            'isClearancePayment' => $payment->items()->whereNotNull('clearance_request_id')->exists(),
            'isFeePayment' => $payment->items()->whereNotNull('fee_id')->exists(),
            'hasClearanceRequests' => $clearanceRequests->isNotEmpty(),
            'hasFees' => $fees->isNotEmpty(),
        ]);
    }

    /**
     * Get payment history/activity logs
     */
    private function getPaymentHistory(Payment $payment): array
    {
        $history = [];

        // Add creation event
        $history[] = [
            'id' => $payment->id . '_created',
            'payment_id' => $payment->id,
            'action' => 'created',
            'status' => $payment->status,
            'description' => "Payment #{$payment->or_number} was created",
            'user' => $payment->recorder ? [
                'id' => $payment->recorder->id,
                'name' => $payment->recorder->name ?? $payment->recorder->first_name . ' ' . $payment->recorder->last_name,
                'email' => $payment->recorder->email ?? null,
            ] : null,
            'created_at' => $payment->created_at,
            'formatted_created_at' => $payment->formatted_created_at ?? $payment->created_at->format('F j, Y g:i A'),
        ];

        // Add status change events from activities
        if ($payment->relationLoaded('activities') && $payment->activities->count() > 0) {
            foreach ($payment->activities as $activity) {
                $action = $this->mapActivityToAction($activity);
                $changes = $this->extractChangesFromActivity($activity);
                
                $history[] = [
                    'id' => $activity->id,
                    'payment_id' => $payment->id,
                    'action' => $action,
                    'status' => $this->extractStatusFromActivity($activity),
                    'description' => $activity->description ?? $this->getActivityDescription($activity),
                    'changes' => $changes,
                    'metadata' => $this->extractMetadataFromActivity($activity),
                    'user' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name ?? $activity->causer->first_name . ' ' . $activity->causer->last_name,
                        'email' => $activity->causer->email ?? null,
                    ] : null,
                    'created_at' => $activity->created_at,
                    'formatted_created_at' => $activity->created_at->format('F j, Y g:i A'),
                ];
            }
        }

        // Add void event if payment is voided
        if ($payment->status === 'voided') {
            $history[] = [
                'id' => $payment->id . '_voided',
                'payment_id' => $payment->id,
                'action' => 'voided',
                'status' => 'voided',
                'description' => "Payment #{$payment->or_number} was voided",
                'metadata' => [
                    'reason' => $payment->remarks ?? 'No reason provided',
                ],
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name ?? auth()->user()->first_name . ' ' . auth()->user()->last_name,
                    'email' => auth()->user()->email ?? null,
                ] : null,
                'created_at' => $payment->updated_at,
                'formatted_created_at' => $payment->formatted_updated_at ?? $payment->updated_at->format('F j, Y g:i A'),
            ];
        }

        // Sort by created_at descending (most recent first)
        usort($history, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return $history;
    }

    /**
     * Map activity log event to action type
     */
    private function mapActivityToAction($activity): string
    {
        $event = $activity->event ?? $activity->log_name ?? 'updated';
        
        switch ($event) {
            case 'created':
                return 'created';
            case 'updated':
                return 'updated';
            case 'status_changed':
                return 'status_changed';
            case 'voided':
                return 'voided';
            case 'refunded':
                return 'refunded';
            default:
                return 'updated';
        }
    }

    /**
     * Extract status from activity if available
     */
    private function extractStatusFromActivity($activity): ?string
    {
        $properties = $activity->properties ?? [];
        $newValues = $properties['new'] ?? $properties['attributes'] ?? [];
        
        if (isset($newValues['status'])) {
            return $newValues['status'];
        }
        
        return null;
    }

    /**
     * Extract changes from activity
     */
    private function extractChangesFromActivity($activity): ?array
    {
        $properties = $activity->properties ?? [];
        $oldValues = $properties['old'] ?? [];
        $newValues = $properties['new'] ?? $properties['attributes'] ?? [];
        
        $changes = [];
        $trackedFields = ['status', 'total_amount', 'discount', 'payment_method', 'reference_number'];
        
        foreach ($trackedFields as $field) {
            if (isset($oldValues[$field]) && isset($newValues[$field]) && $oldValues[$field] != $newValues[$field]) {
                $changes[$field] = [
                    'old' => $oldValues[$field],
                    'new' => $newValues[$field],
                ];
            }
        }
        
        return !empty($changes) ? $changes : null;
    }

    /**
     * Extract metadata from activity
     */
    private function extractMetadataFromActivity($activity): ?array
    {
        $properties = $activity->properties ?? [];
        $metadata = [];
        
        if (isset($properties['reference_number'])) {
            $metadata['reference_number'] = $properties['reference_number'];
        }
        
        if (isset($properties['payment_method'])) {
            $metadata['payment_method'] = $properties['payment_method'];
        }
        
        if (isset($properties['reason'])) {
            $metadata['reason'] = $properties['reason'];
        }
        
        if (isset($properties['ip_address'])) {
            $metadata['ip_address'] = $properties['ip_address'];
        }
        
        return !empty($metadata) ? $metadata : null;
    }

    /**
     * Get activity description
     */
    private function getActivityDescription($activity): string
    {
        $properties = $activity->properties ?? [];
        $oldValues = $properties['old'] ?? [];
        $newValues = $properties['new'] ?? $properties['attributes'] ?? [];
        
        if (isset($oldValues['status']) && isset($newValues['status'])) {
            return "Status changed from {$oldValues['status']} to {$newValues['status']}";
        }
        
        if (isset($oldValues['total_amount']) && isset($newValues['total_amount'])) {
            $oldAmount = '₱' . number_format($oldValues['total_amount'], 2);
            $newAmount = '₱' . number_format($newValues['total_amount'], 2);
            return "Amount updated from {$oldAmount} to {$newAmount}";
        }
        
        return $activity->description ?? 'Payment updated';
    }

    /**
     * Get clearance requests for this payment
     */
    private function getClearanceRequestsForPayment(Payment $payment)
    {
        return $payment->items()
            ->whereNotNull('clearance_request_id')
            ->with([
                'clearanceRequest.clearanceType',
                'clearanceRequest.resident.household',
                'clearanceRequest.issuingOfficer',
                'clearanceRequest.processedBy',
                'clearanceRequest.documents'
            ])
            ->get()
            ->pluck('clearanceRequest')
            ->filter()
            ->map(function ($request) {
                if ($request->needed_date) {
                    $request->formatted_needed_date = $request->needed_date->format('F j, Y');
                }
                if ($request->issue_date) {
                    $request->formatted_issue_date = $request->issue_date->format('F j, Y');
                }
                if ($request->valid_until) {
                    $request->formatted_valid_until = $request->valid_until->format('F j, Y');
                    $request->days_remaining = $request->valid_until->diffInDays(now(), false);
                    $request->is_valid = $request->valid_until->isFuture();
                }
                if ($request->created_at) {
                    $request->formatted_created_at = $request->created_at->format('F j, Y g:i A');
                }
                if ($request->processed_at) {
                    $request->formatted_processed_at = $request->processed_at->format('F j, Y g:i A');
                }

                return $request;
            });
    }

    /**
     * Get fees for this payment
     */
    private function getFeesForPayment(Payment $payment)
    {
        return $payment->items()
            ->whereNotNull('fee_id')
            ->with([
                'fee.feeType',
                'fee.payer',
                'fee.issuedBy',
                'fee.collectedBy',
                'fee.createdBy',
            ])
            ->get()
            ->pluck('fee')
            ->filter()
            ->map(function ($fee) {
                if ($fee->payer && $fee->payer_type === 'App\Models\Resident' && method_exists($fee->payer, 'household')) {
                    $fee->payer->load('household');
                }

                if ($fee->issue_date) {
                    $fee->formatted_issue_date = $fee->issue_date->format('F j, Y');
                }
                if ($fee->due_date) {
                    $fee->formatted_due_date = $fee->due_date->format('F j, Y');
                    $fee->is_overdue = $fee->due_date->isPast() && $fee->status !== 'paid' && $fee->status !== 'cancelled';
                    $fee->days_overdue = $fee->is_overdue ? now()->diffInDays($fee->due_date) : 0;
                }
                if ($fee->period_start) {
                    $fee->formatted_period_start = $fee->period_start->format('F j, Y');
                }
                if ($fee->period_end) {
                    $fee->formatted_period_end = $fee->period_end->format('F j, Y');
                }
                if ($fee->valid_from) {
                    $fee->formatted_valid_from = $fee->valid_from->format('F j, Y');
                }
                if ($fee->valid_until) {
                    $fee->formatted_valid_until = $fee->valid_until->format('F j, Y');
                }

                $fee->payment_percentage = $fee->total_amount > 0 ? ($fee->amount_paid / $fee->total_amount) * 100 : 0;

                return $fee;
            });
    }

    /**
     * Get payer details
     */
    private function getPayerDetails(Payment $payment)
    {
        if ($payment->payer_type === 'resident') {
            $payment->load(['resident.household']);
            $payerDetails = $payment->resident;

            if (!$payerDetails) {
                return null;
            }

            return [
                'id' => $payerDetails->id,
                'name' => $payment->payer_name,
                'type' => $payment->payer_type,
                'contact_number' => $payerDetails->contact_number ?? $payment->contact_number,
                'email' => $payerDetails->email ?? null,
                'address' => $payerDetails->address ?? $payment->address,
                'household_number' => $payerDetails->household?->household_number ?? null,
                'purok' => $payerDetails->purok?->name ?? $payerDetails->household?->purok?->name ?? $payment->purok,
                'household' => $payerDetails->household ? [
                    'id' => $payerDetails->household->id,
                    'household_number' => $payerDetails->household->household_number,
                    'purok' => $payerDetails->household->purok?->name,
                ] : null,
                'members' => null,
            ];
        } elseif ($payment->payer_type === 'household') {
            $payment->load(['household.members.resident']);
            $payerDetails = $payment->household;

            if (!$payerDetails) {
                return null;
            }

            return [
                'id' => $payerDetails->id,
                'name' => $payment->payer_name,
                'type' => $payment->payer_type,
                'contact_number' => $payerDetails->contact_number ?? $payment->contact_number,
                'email' => $payerDetails->email ?? null,
                'address' => $payerDetails->address ?? $payment->address,
                'household_number' => $payerDetails->household_number,
                'purok' => $payerDetails->purok?->name ?? $payment->purok,
                'household' => [
                    'id' => $payerDetails->id,
                    'household_number' => $payerDetails->household_number,
                    'purok' => $payerDetails->purok?->name,
                ],
                'members' => $payerDetails->members?->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->resident?->name ?? 'Unknown',
                        'relationship' => $member->relationship,
                        'resident' => $member->resident ? [
                            'id' => $member->resident->id,
                            'name' => $member->resident->name,
                        ] : null,
                    ];
                })->toArray(),
            ];
        }

        return null;
    }

    /**
     * Get related payments for the same payer
     */
    private function getRelatedPayments(Payment $payment)
    {
        return Payment::where('payer_type', $payment->payer_type)
            ->where('payer_id', $payment->payer_id)
            ->where('id', '!=', $payment->id)
            ->with(['recorder'])
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($relatedPayment) {
                $relatedPayment->formatted_date = $relatedPayment->payment_date->format('F j, Y');
                $relatedPayment->formatted_total = '₱' . number_format($relatedPayment->total_amount, 2);
                $relatedPayment->status_display = ucfirst($relatedPayment->status);
                return $relatedPayment;
            });
    }

    /**
     * Calculate payment breakdown
     */
    private function calculatePaymentBreakdown(Payment $payment): array
    {
        $subtotal = is_numeric($payment->subtotal) ? (float) $payment->subtotal : 0;
        $surcharge = is_numeric($payment->surcharge) ? (float) $payment->surcharge : 0;
        $penalty = is_numeric($payment->penalty) ? (float) $payment->penalty : 0;
        $discount = is_numeric($payment->discount) ? (float) $payment->discount : 0;

        $correctedTotal = $subtotal + $surcharge + $penalty - $discount;

        return [
            'subtotal' => $subtotal,
            'formatted_subtotal' => '₱' . number_format($subtotal, 2),
            'surcharge' => $surcharge,
            'formatted_surcharge' => '₱' . number_format($surcharge, 2),
            'penalty' => $penalty,
            'formatted_penalty' => '₱' . number_format($penalty, 2),
            'discount' => $discount,
            'formatted_discount' => '₱' . number_format($discount, 2),
            'total' => $correctedTotal,
            'formatted_total' => '₱' . number_format($correctedTotal, 2),
        ];
    }

    /**
     * Get discount details
     */
    private function getDiscountDetails(Payment $payment): array
    {
        $discountDetails = [];

        if ($payment->relationLoaded('discounts') && $payment->discounts->count() > 0) {
            $discountDetails = $payment->discounts->map(function ($discount) {
                $typeLabel = 'Discount';

                if ($discount->rule) {
                    if ($discount->rule->code === 'SENIOR') {
                        $typeLabel = 'Senior Citizen';
                    } elseif ($discount->rule->code === 'PWD') {
                        $typeLabel = 'PWD';
                    } elseif ($discount->rule->code === 'SOLO_PARENT') {
                        $typeLabel = 'Solo Parent';
                    } elseif ($discount->rule->code === 'INDIGENT') {
                        $typeLabel = 'Indigent';
                    } else {
                        $typeLabel = $discount->rule->name ?? $discount->rule->discount_type ?? 'Discount';
                    }
                } elseif ($discount->discount_type) {
                    $typeLabel = $discount->discount_type;
                }

                return [
                    'id' => $discount->id,
                    'type' => $typeLabel,
                    'code' => $discount->rule->code ?? $discount->discount_code ?? null,
                    'amount' => (float) $discount->discount_amount,
                    'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                    'id_number' => $discount->id_number,
                    'verified_by' => $discount->verifier->name ?? null,
                    'verified_at' => $discount->verified_at ? $discount->verified_at->format('M d, Y h:i A') : null,
                    'id_presented' => $discount->id_presented,
                ];
            })->toArray();
        } elseif ($payment->discount > 0 && $payment->discount_type) {
            $discountDetails[] = [
                'id' => null,
                'type' => $payment->discount_type,
                'code' => $payment->discount_code,
                'amount' => (float) $payment->discount,
                'formatted_amount' => '₱' . number_format($payment->discount, 2),
                'id_number' => null,
                'verified_by' => null,
                'verified_at' => null,
                'id_presented' => false,
            ];
        }

        return $discountDetails;
    }

    /**
     * Enrich payment with formatted data
     */
    private function enrichPaymentWithFormattedData(Payment $payment): void
    {
        $payment->formatted_date = $payment->payment_date->format('F j, Y');
        $payment->formatted_created_at = $payment->created_at->format('F j, Y g:i A');
        $payment->formatted_updated_at = $payment->updated_at->format('F j, Y g:i A');

        if ($payment->validity_date) {
            $payment->formatted_validity_date = $payment->validity_date->format('F j, Y');
        }

        $paymentMethodDetails = [
            'cash' => ['name' => 'Cash', 'icon' => 'cash', 'color' => 'text-green-600'],
            'gcash' => ['name' => 'GCash', 'icon' => 'mobile', 'color' => 'text-blue-600'],
            'maya' => ['name' => 'Maya', 'icon' => 'mobile', 'color' => 'text-purple-600'],
            'online' => ['name' => 'Online', 'icon' => 'globe', 'color' => 'text-indigo-600'],
            'bank' => ['name' => 'Bank', 'icon' => 'bank', 'color' => 'text-orange-600'],
            'check' => ['name' => 'Check', 'icon' => 'file-text', 'color' => 'text-red-600'],
        ];

        $payment->payment_method_display = $paymentMethodDetails[$payment->payment_method]['name'] ?? ucfirst($payment->payment_method);
        $payment->payment_method_details = $paymentMethodDetails[$payment->payment_method] ?? ['name' => ucfirst($payment->payment_method), 'icon' => 'credit-card', 'color' => 'text-gray-600'];
        $payment->collection_type_display = ucfirst($payment->collection_type);
        $payment->status_display = ucfirst($payment->status);
        $payment->is_cleared_display = $payment->is_cleared ? 'Cleared' : 'Not Cleared';

        $subtotal = is_numeric($payment->subtotal) ? (float) $payment->subtotal : 0;
        $surcharge = is_numeric($payment->surcharge) ? (float) $payment->surcharge : 0;
        $penalty = is_numeric($payment->penalty) ? (float) $payment->penalty : 0;
        $discount = is_numeric($payment->discount) ? (float) $payment->discount : 0;

        $payment->has_surcharge = $surcharge > 0;
        $payment->has_penalty = $penalty > 0;
        $payment->has_discount = $discount > 0;
        $payment->corrected_total = $subtotal + $surcharge + $penalty - $discount;
        $payment->formatted_corrected_total = '₱' . number_format($payment->corrected_total, 2);
    }

    /**
     * Print receipt for the specified payment.
     */
    public function printReceipt(Payment $payment)
    {
        $payment->load([
            'items',
            'recorder',
            'items.clearanceRequest.clearanceType',
        ]);

        if ($payment->payer_type === 'resident') {
            $payment->load('resident.household');
        } elseif ($payment->payer_type === 'household') {
            $payment->load('household');
        }

        return Inertia::render('admin/Payments/Receipt', [
            'payment' => $payment,
            'barangay' => [
                'name' => config('app.barangay_name', 'Your Barangay Name'),
                'address' => config('app.barangay_address', 'Your Barangay Address'),
                'contact' => config('app.barangay_contact', 'Your Barangay Contact'),
            ],
            'officer' => [
                'name' => auth()->user()->name ?? 'Barangay Treasurer',
                'position' => 'Barangay Treasurer',
            ],
            'isClearancePayment' => $payment->items()->whereNotNull('clearance_request_id')->exists(),
        ]);
    }

    /**
     * Download receipt as PDF for the specified payment.
     */
    public function downloadReceipt(Payment $payment, Request $request)
    {
        try {
            Log::info('PaymentShowController@downloadReceipt accessed', [
                'user_id' => auth()->id(),
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number
            ]);

            $action = $request->get('action', 'download'); // 'preview' or 'download'

            // Load relationships
            $payment->load([
                'items.fee.feeType',
                'items.fee.payer',
                'items.clearanceRequest.clearanceType',
                'items.clearanceRequest.resident',
                'recorder',
                'discounts.rule',
                'discounts.verifier',
            ]);

            // Get payer details
            $payerName = $payment->payer_name ?? 'Unknown';
            $payerAddress = $payment->address ?? 'N/A';
            
            if ($payment->payer_type === 'resident' && $payment->resident) {
                $payerName = $payment->resident->full_name ?? $payment->resident->name ?? $payerName;
                $payerAddress = $payment->resident->address ?? $payerAddress;
            } elseif ($payment->payer_type === 'household' && $payment->household) {
                $payerName = $payment->household->household_number ?? $payerName;
                $payerAddress = $payment->household->address ?? $payerAddress;
            }

            // Calculate totals
            $subtotal = (float) ($payment->subtotal ?? 0);
            $surcharge = (float) ($payment->surcharge ?? 0);
            $penalty = (float) ($payment->penalty ?? 0);
            $discount = (float) ($payment->discount ?? 0);
            $totalAmount = (float) ($payment->total_amount ?? 0);

            // Get discount details
            $discountDetails = [];
            if ($payment->discounts && $payment->discounts->count() > 0) {
                $discountDetails = $payment->discounts->map(function ($discount) {
                    return [
                        'rule' => $discount->rule->name ?? $discount->discount_type ?? 'Discount',
                        'amount' => (float) $discount->discount_amount,
                        'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                        'id_number' => $discount->id_number,
                    ];
                })->toArray();
            }

            // Get fee breakdown
            $feeBreakdown = [];
            if ($payment->items) {
                foreach ($payment->items as $item) {
                    if ($item->fee) {
                        $feeBreakdown[] = [
                            'fee_name' => $item->fee->feeType->name ?? 'Fee',
                            'fee_code' => $item->fee->fee_code ?? 'N/A',
                            'amount' => (float) $item->amount,
                            'formatted_amount' => '₱' . number_format($item->amount, 2),
                        ];
                    } elseif ($item->clearanceRequest) {
                        $feeBreakdown[] = [
                            'fee_name' => $item->clearanceRequest->clearanceType->name ?? 'Clearance Fee',
                            'fee_code' => 'CLR-' . $item->clearanceRequest->id,
                            'amount' => (float) $item->amount,
                            'formatted_amount' => '₱' . number_format($item->amount, 2),
                        ];
                    }
                }
            }

            // Prepare data for the receipt view
            $data = [
                'payment' => $payment,
                'or_number' => $payment->or_number,
                'payment_date' => $payment->payment_date ? Carbon::parse($payment->payment_date)->format('F j, Y') : now()->format('F j, Y'),
                'payment_method' => $payment->payment_method ?? 'cash',
                'reference_number' => $payment->reference_number,
                'payer_name' => $payerName,
                'payer_address' => $payerAddress,
                
                // Financial breakdown
                'subtotal' => $subtotal,
                'formatted_subtotal' => '₱' . number_format($subtotal, 2),
                'surcharge' => $surcharge,
                'formatted_surcharge' => '₱' . number_format($surcharge, 2),
                'penalty' => $penalty,
                'formatted_penalty' => '₱' . number_format($penalty, 2),
                'total_discount' => $discount,
                'formatted_total_discount' => '₱' . number_format($discount, 2),
                'total_amount' => $totalAmount,
                'formatted_total_amount' => '₱' . number_format($totalAmount, 2),
                
                // Details
                'discount_details' => $discountDetails,
                'fee_breakdown' => $feeBreakdown,
                'received_by' => $payment->recorder ? 
                    trim(($payment->recorder->first_name ?? '') . ' ' . ($payment->recorder->last_name ?? '')) : 'Unknown',
                
                // Barangay info
                'barangay' => [
                    'name' => config('app.barangay_name', 'Barangay Management System'),
                    'address' => config('app.barangay_address', ''),
                    'contact' => config('app.barangay_contact', ''),
                ],
                'print_date' => now()->format('F j, Y h:i A'),
            ];

            $filename = "receipt-{$payment->or_number}.pdf";

            // Try to load the receipt view
            try {
                $pdf = Pdf::loadView('pdf.payment-receipt', $data);
            } catch (\Exception $e) {
                Log::warning('Payment receipt PDF view not found', ['error' => $e->getMessage()]);
                // Fallback to a simple view
                $html = view('pdf.receipt-simple', $data)->render();
                $pdf = Pdf::loadHTML($html);
            }

            $pdf->setPaper('A4', 'portrait');

            if ($action === 'preview') {
                return $pdf->stream($filename);
            }

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Payment receipt download failed', [
                'user_id' => auth()->id(),
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Failed to generate receipt'], 500);
            }

            return back()->with('error', 'Failed to generate receipt. Please try again.');
        }
    }

    /**
     * Export payments to PDF.
     */
    public function exportPdf(Request $request)
    {
        $query = Payment::with(['items', 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $payments = $query->get();

        $pdf = PDF::loadView('exports.payments', [
            'payments' => $payments,
            'filters' => $request->all(),
            'date_range' => $request->filled('date_from') && $request->filled('date_to') 
                ? $request->input('date_from') . ' to ' . $request->input('date_to')
                : 'All Time',
        ]);

        return $pdf->download('payments-report-' . date('Y-m-d') . '.pdf');
    }
}