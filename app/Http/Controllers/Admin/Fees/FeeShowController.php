<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeShowController extends Controller
{
    // Show fee details
    public function show(Fee $fee)
    {
        try {
            Log::info('FeeShowController@show accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code
            ]);

            // Load relationships
            $fee->load([
                'feeType', 
                'issuedBy', 
                'createdBy',
                'payer',
                'paymentItems' => function($query) {
                    $query->with(['payment.discounts.rule', 'payment.recorder']);
                }
            ]);

            // Get the actual payer model
            $payer = $fee->payer;
            
            $formattedFee = $this->formatFeeForShow($fee, $payer);
            $relatedFees = $this->getRelatedFees($fee);
            $paymentHistory = $this->getPaymentHistory($fee);
            $permissions = $this->getPermissions($fee);

            return Inertia::render('admin/Fees/Show', [
                'fee' => $formattedFee,
                'related_fees' => $relatedFees,
                'payment_history' => $paymentHistory,
                'permissions' => $permissions,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeShowController@show error', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fee details. Please try again.');
        }
    }
    
    // Format fee for show view
    private function formatFeeForShow(Fee $fee, $payer = null)
    {
        $formatted = [
            'id' => $fee->id,
            'fee_code' => $fee->fee_code,
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
            'discount_amount' => (float) $fee->total_discounts,
            'total_amount' => (float) $fee->total_amount,
            'amount_paid' => (float) $fee->amount_paid,
            'balance' => (float) $fee->balance,
            'status' => $fee->status,
            'status_display' => $this->getStatusLabel($fee->status),
            'or_number' => $fee->or_number,
            'certificate_number' => $fee->certificate_number,
            'valid_from' => $fee->valid_from ? Carbon::parse($fee->valid_from)->format('Y-m-d') : null,
            'valid_until' => $fee->valid_until ? Carbon::parse($fee->valid_until)->format('Y-m-d') : null,
            'payment_date' => $fee->payment_date ? Carbon::parse($fee->payment_date)->format('Y-m-d') : null,
            'payment_method' => $fee->payment_method,
            'transaction_reference' => $fee->transaction_reference,
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
            'created_at' => $fee->created_at ? Carbon::parse($fee->created_at)->toISOString() : null,
            'updated_at' => $fee->updated_at ? Carbon::parse($fee->updated_at)->toISOString() : null,
            'cancelled_at' => $fee->cancelled_at ? Carbon::parse($fee->cancelled_at)->toISOString() : null,
        ];

        // Add fee type information
        if ($fee->feeType) {
            $requirements = $this->safeArray($fee->feeType->requirements);
            
            $formatted['fee_type'] = [
                'id' => $fee->feeType->id,
                'code' => $fee->feeType->code,
                'name' => $fee->feeType->name,
                'description' => $fee->feeType->description,
                'base_amount' => (float) $fee->feeType->base_amount,
                'amount_type' => $fee->feeType->amount_type,
                'is_discountable' => (bool) $fee->feeType->is_discountable,
                'has_surcharge' => (bool) $fee->feeType->has_surcharge,
                'surcharge_percentage' => (float) ($fee->feeType->surcharge_percentage ?? 0),
                'has_penalty' => (bool) $fee->feeType->has_penalty,
                'penalty_percentage' => (float) ($fee->feeType->penalty_percentage ?? 0),
                'requirements' => $requirements,
                'validity_days' => $fee->feeType->validity_days,
            ];
        }

        // Add resident information if payer is a resident
        if ($payer && $payer instanceof Resident) {
            $formatted['resident'] = [
                'id' => $payer->id,
                'name' => $payer->full_name ?? trim($payer->first_name . ' ' . $payer->last_name),
                'full_name' => $payer->full_name ?? trim($payer->first_name . ' ' . $payer->last_name),
                'birth_date' => $payer->birth_date ? Carbon::parse($payer->birth_date)->format('Y-m-d') : null,
                'gender' => $payer->gender ?? null,
                'occupation' => $payer->occupation ?? null,
                'contact_number' => $payer->contact_number ?? null,
                'email' => $payer->email ?? null,
                'address' => $payer->address ?? null,
                'purok' => $payer->purok ? $payer->purok->name : null,
                'zone' => $payer->zone ?? null,
                'profile_photo' => $payer->photo_url ?? null,
                'is_senior' => $payer->is_senior ?? $payer->isSenior(),
                'is_pwd' => $payer->is_pwd ?? false,
                'is_solo_parent' => $payer->is_solo_parent ?? false,
                'is_indigent' => $payer->is_indigent ?? false,
            ];
        }

        // Add household information if payer is a household
        if ($payer && $payer instanceof Household) {
            $formatted['household'] = [
                'id' => $payer->id,
                'name' => $payer->household_number ?? 'Household',
                'address' => $payer->address ?? null,
                'household_head_name' => $payer->head_of_family ?? null,
                'contact_number' => $payer->contact_number ?? null,
                'purok' => $payer->purok ? $payer->purok->name : null,
                'zone' => $payer->zone ?? null,
            ];
        }

        // Add business information if payer is a business
        if ($payer && $payer instanceof Business) {
            $formatted['business'] = [
                'id' => $payer->id,
                'business_name' => $payer->business_name ?? null,
                'owner_name' => $payer->owner_name ?? null,
                'business_type' => $payer->business_type ?? null,
                'address' => $payer->address ?? null,
                'contact_number' => $payer->contact_number ?? null,
                'email' => $payer->email ?? null,
                'purok' => $payer->purok ? $payer->purok->name : null,
                'zone' => $payer->zone ?? null,
            ];
        }

        // Add user information
        if ($fee->issuedBy) {
            $formatted['issued_by_user'] = [
                'id' => $fee->issuedBy->id,
                'name' => trim(($fee->issuedBy->first_name ?? '') . ' ' . ($fee->issuedBy->last_name ?? '')),
                'email' => $fee->issuedBy->email,
                'role' => $fee->issuedBy->role ?? 'Staff',
            ];
        }

        if ($fee->createdBy) {
            $formatted['created_by_user'] = [
                'id' => $fee->createdBy->id,
                'name' => trim(($fee->createdBy->first_name ?? '') . ' ' . ($fee->createdBy->last_name ?? '')),
                'email' => $fee->createdBy->email,
                'role' => $fee->createdBy->role ?? 'Staff',
            ];
        }

        // Check if approved_by and collected_by columns exist and are not null
        if ($fee->approved_by) {
            try {
                $approvedBy = \App\Models\User::find($fee->approved_by);
                if ($approvedBy) {
                    $formatted['approved_by_user'] = [
                        'id' => $approvedBy->id,
                        'name' => trim(($approvedBy->first_name ?? '') . ' ' . ($approvedBy->last_name ?? '')),
                        'email' => $approvedBy->email,
                        'role' => $approvedBy->role ?? 'Staff',
                    ];
                }
            } catch (\Exception $e) {
                // Silently fail if user doesn't exist
            }
        }

        if ($fee->collected_by) {
            try {
                $collectedBy = \App\Models\User::find($fee->collected_by);
                if ($collectedBy) {
                    $formatted['collected_by_user'] = [
                        'id' => $collectedBy->id,
                        'name' => trim(($collectedBy->first_name ?? '') . ' ' . ($collectedBy->last_name ?? '')),
                        'email' => $collectedBy->email,
                        'role' => $collectedBy->role ?? 'Staff',
                    ];
                }
            } catch (\Exception $e) {
                // Silently fail if user doesn't exist
            }
        }

        return $formatted;
    }

    // Helper function to safely convert data to array
    private function safeArray($data): array
    {
        if (empty($data)) {
            return [];
        }

        if (is_array($data)) {
            return $data;
        }

        if (is_string($data)) {
            try {
                $decoded = json_decode($data, true);
                return is_array($decoded) ? $decoded : [];
            } catch (\Exception $e) {
                return [];
            }
        }

        return [];
    }

    // Get related fees
    private function getRelatedFees(Fee $fee)
    {
        try {
            $query = Fee::where('id', '!=', $fee->id)
                ->where('status', '!=', 'cancelled');

            // Filter by same payer using polymorphic relationship
            if ($fee->payer_id && $fee->payer_type) {
                $query->where('payer_id', $fee->payer_id)
                      ->where('payer_type', $fee->payer_type);
            } elseif ($fee->payer_name) {
                $query->where('payer_name', 'like', "%{$fee->payer_name}%");
            }

            return $query->select(['id', 'fee_code', 'fee_type_id', 'total_amount', 'status', 'issue_date'])
                ->with(['feeType:id,name'])
                ->orderBy('issue_date', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($relatedFee) {
                    return [
                        'id' => $relatedFee->id,
                        'fee_code' => $relatedFee->fee_code,
                        'fee_type_name' => $relatedFee->feeType->name ?? 'Unknown',
                        'total_amount' => '₱' . number_format($relatedFee->total_amount, 2),
                        'status' => $relatedFee->status,
                        'status_label' => $this->getStatusLabel($relatedFee->status),
                        'issue_date' => $relatedFee->issue_date ? Carbon::parse($relatedFee->issue_date)->format('Y-m-d') : null,
                    ];
                });
        } catch (\Exception $e) {
            Log::warning('Failed to get related fees', ['error' => $e->getMessage()]);
            return collect();
        }
    }

    // Get payment history with discounts
    private function getPaymentHistory(Fee $fee)
    {
        try {
            // Get unique payments from payment items
            $paymentIds = $fee->paymentItems()->pluck('payment_id')->unique();
            
            if ($paymentIds->isEmpty()) {
                return collect();
            }
            
            return \App\Models\Payment::whereIn('id', $paymentIds)
                ->with(['recorder', 'discounts.rule'])
                ->orderBy('payment_date', 'desc')
                ->get()
                ->map(function ($payment) {
                    $discounts = $payment->discounts->map(function ($discount) {
                        return [
                            'id' => $discount->id,
                            'rule_name' => $discount->rule->name ?? 'Unknown',
                            'discount_type' => $discount->rule->discount_type ?? null,
                            'amount' => $discount->discount_amount,
                            'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                            'id_number' => $discount->id_number,
                            'verified_by' => $discount->verifier->name ?? 'Unknown',
                        ];
                    });

                    return [
                        'id' => $payment->id,
                        'amount' => $payment->total_amount,
                        'formatted_amount' => '₱' . number_format($payment->total_amount, 2),
                        'subtotal' => $payment->subtotal,
                        'formatted_subtotal' => '₱' . number_format($payment->subtotal, 2),
                        'discounts' => $discounts,
                        'total_discount' => $discounts->sum('amount'),
                        'formatted_total_discount' => '₱' . number_format($discounts->sum('amount'), 2),
                        'description' => $payment->remarks ?? 'Payment',
                        'payment_date' => $payment->payment_date ? Carbon::parse($payment->payment_date)->format('Y-m-d') : null,
                        'or_number' => $payment->or_number,
                        'payment_method' => $payment->payment_method,
                        'reference_number' => $payment->reference_number,
                        'status' => $payment->status,
                        'received_by' => $payment->recorder ? 
                            trim(($payment->recorder->first_name ?? '') . ' ' . ($payment->recorder->last_name ?? '')) : 'Unknown',
                        'created_at' => $payment->created_at ? Carbon::parse($payment->created_at)->toISOString() : null,
                    ];
                });

        } catch (\Exception $e) {
            Log::warning('Failed to get payment history', ['error' => $e->getMessage()]);
            return collect();
        }
    }

    // Get status label
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Pending',
            'draft' => 'Draft',
            'issued' => 'Issued',
            'pending_payment' => 'Pending Payment',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'waived' => 'Waived',
            'approved' => 'Approved',
            'collected' => 'Collected',
        ];
        
        return $labels[$status] ?? ucfirst($status);
    }

    // Get permissions for current user
    private function getPermissions(Fee $fee)
    {
        $user = Auth::user();
        
        return [
            'can_edit' => $user->can('update', $fee) && in_array($fee->status, ['draft', 'pending', 'issued', 'pending_payment']),
            'can_delete' => $user->can('delete', $fee) && in_array($fee->status, ['draft', 'pending', 'pending_payment']) && $fee->amount_paid == 0,
            'can_record_payment' => $user->can('recordPayment', $fee) && $fee->balance > 0 && !in_array($fee->status, ['cancelled', 'waived']),
            'can_cancel' => $user->can('cancel', $fee) && !in_array($fee->status, ['paid', 'cancelled', 'waived']),
            'can_waive' => $user->can('waive', $fee) && $fee->balance > 0 && !in_array($fee->status, ['paid', 'cancelled']),
            'can_view_audit' => $user->can('viewAudit', $fee),
            'can_approve' => $user->can('approve', $fee) && $fee->status === 'pending',
            'can_collect' => $user->can('collect', $fee) && $fee->status === 'approved',
        ];
    }

    // Download certificate (if fee has one)
    public function downloadCertificate(Fee $fee)
    {
        try {
            if (!$fee->certificate_number) {
                return back()->with('error', 'No certificate available for this fee.');
            }

            // Load relationships
            $fee->load(['feeType', 'issuedBy', 'payer']);
            
            // Get the actual payer model
            $payer = $fee->payer;

            // Format names for display
            $issuedByName = 'Unknown';
            if ($fee->issuedBy) {
                $issuedByName = trim(($fee->issuedBy->first_name ?? '') . ' ' . ($fee->issuedBy->last_name ?? ''));
            }
            
            $payerName = $fee->payer_name ?? 'Unknown';
            if ($payer) {
                if ($payer instanceof Resident) {
                    $payerName = $payer->full_name ?? trim($payer->first_name . ' ' . $payer->last_name);
                } elseif ($payer instanceof Household) {
                    $payerName = $payer->head_of_family ?? $payer->household_number ?? 'Household';
                } elseif ($payer instanceof Business) {
                    $payerName = $payer->business_name ?? $payer->owner_name ?? 'Business';
                }
            }

            $data = [
                'fee' => $fee,
                'payer' => $payer,
                'payer_name' => $payerName,
                'issued_by_name' => $issuedByName,
                'barangay' => [
                    'name' => config('app.barangay_name', 'Barangay Management System'),
                    'address' => config('app.barangay_address', ''),
                    'contact' => config('app.barangay_contact', ''),
                    'official' => $issuedByName,
                    'position' => Auth::user()->role ?? 'Barangay Staff',
                ],
                'print_date' => now()->format('F j, Y h:i A'),
            ];

            $filename = "certificate-{$fee->certificate_number}.pdf";
            
            // Try to load certificate view, fallback to simple view
            try {
                $pdf = Pdf::loadView('pdf.fee-certificate', $data);
            } catch (\Exception $e) {
                Log::warning('Certificate PDF view not found', ['error' => $e->getMessage()]);
                $html = view('pdf.certificate-simple', $data)->render();
                $pdf = Pdf::loadHTML($html);
            }

            $pdf->setPaper('A4', 'portrait');
            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Certificate download failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to download certificate. Please try again.');
        }
    }
}