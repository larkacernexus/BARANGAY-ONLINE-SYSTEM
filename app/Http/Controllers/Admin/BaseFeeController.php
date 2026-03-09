<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\DocumentCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

abstract class BaseFeeController extends Controller
{
    protected function getPayerDetails($fee)
    {
        $details = [
            'name' => $fee->payer_name,
            'contact' => $fee->contact_number,
            'purok' => $fee->purok,
            'address' => $fee->address,
            'type' => $fee->payer_type,
            'business_name' => $fee->business_name,
        ];

        if ($fee->payer_id && $fee->payer_model) {
            try {
                $modelClass = $this->normalizeModelClass($fee->payer_model);

                if (class_exists($modelClass)) {
                    $payerModel = $modelClass::find($fee->payer_id);
                    if ($payerModel) {
                        if ($modelClass === Resident::class) {
                            $details['full_name'] = $payerModel->first_name . ' ' . $payerModel->last_name;
                            $details['first_name'] = $payerModel->first_name;
                            $details['last_name'] = $payerModel->last_name;
                            $details['middle_name'] = $payerModel->middle_name;
                            $details['is_senior'] = $payerModel->is_senior;
                            $details['is_pwd'] = $payerModel->is_pwd;
                            $details['is_solo_parent'] = $payerModel->is_solo_parent;
                            $details['is_indigent'] = $payerModel->is_indigent;
                        } elseif ($modelClass === Household::class) {
                            $details['head_of_family'] = $payerModel->head_of_family;
                            $details['household_number'] = $payerModel->household_number;
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to load detailed payer info', [
                    'fee_id' => $fee->id,
                    'payer_model' => $fee->payer_model,
                    'payer_id' => $fee->payer_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $details;
    }

    protected function normalizeModelClass($className)
    {
        if (empty($className)) {
            return null;
        }

        if (class_exists($className)) {
            return $className;
        }

        $modelMap = [
            'resident' => Resident::class,
            'Resident' => Resident::class,
            'household' => Household::class,
            'Household' => Household::class,
            'business' => Business::class,
            'Business' => Business::class,
        ];

        return $modelMap[$className] ?? $className;
    }

    protected function getPayerTypeIcon($payerType)
    {
        $icons = [
            'resident' => 'user',
            'business' => 'building',
            'household' => 'home',
            'visitor' => 'user',
            'other' => 'user',
        ];

        return $icons[$payerType] ?? 'user';
    }

    protected function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Pending',
            'issued' => 'Issued',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'waived' => 'Waived',
            'written_off' => 'Written Off',
        ];

        return $labels[$status] ?? ucfirst($status);
    }

    protected function safeJsonDecode($value)
    {
        if (empty($value)) {
            return [];
        }
        
        if (is_array($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    protected function getPermissions(Fee $fee)
    {
        $user = Auth::user();
        
        return [
            'can_edit' => $user->can('update', $fee) && in_array($fee->status, ['pending', 'issued']),
            'can_delete' => $user->can('delete', $fee) && $fee->status === 'pending' && $fee->amount_paid == 0,
            'can_record_payment' => $user->can('recordPayment', $fee) && $fee->balance > 0 && !in_array($fee->status, ['cancelled', 'waived', 'paid']),
            'can_cancel' => $user->can('cancel', $fee) && !in_array($fee->status, ['paid', 'cancelled', 'waived']),
            'can_waive' => $user->can('waive', $fee) && $fee->balance > 0 && !in_array($fee->status, ['paid', 'cancelled']),
            'can_print' => true,
        ];
    }

    protected function generateFeeIdentifiers($fee)
    {
        if (!$fee->fee_code) {
            $feeType = $fee->feeType;
            $year = date('Y');
            $sequence = Fee::whereYear('created_at', $year)
                ->where('fee_type_id', $fee->fee_type_id)
                ->count();
            
            $fee->fee_code = $feeType->code . '-' . $year . '-' . str_pad($sequence + 1, 4, '0', STR_PAD_LEFT);
        }

        $feeType = $fee->feeType;
        if ($feeType && $feeType->document_category_id) {
            $category = DocumentCategory::find($feeType->document_category_id);
            if ($category && in_array($category->slug, ['clearance', 'certificate'])) {
                $year = date('Y');
                $sequence = Fee::whereYear('created_at', $year)
                    ->where('fee_type_id', $fee->fee_type_id)
                    ->whereNotNull('certificate_number')
                    ->count();
                
                $fee->certificate_number = $feeType->code . '-CERT-' . $year . '-' . str_pad($sequence + 1, 5, '0', STR_PAD_LEFT);
            }
        }

        $fee->save();
    }
}