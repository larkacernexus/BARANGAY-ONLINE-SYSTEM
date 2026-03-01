<?php
// database/seeders/ReceiptSeeder.php

namespace Database\Seeders;

use App\Models\Receipt;
use App\Models\Payment;
use App\Models\Fee;
use App\Models\ClearanceRequest;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReceiptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for issued_by
        $admin = User::where('email', 'admin@example.com')->first();
        $issuerId = $admin ? $admin->id : 1;

        $this->command->info('Starting Receipt Seeder...');

        // Seed receipts from payments
        $this->seedFromPayments($issuerId);

        // Seed receipts for direct fee payments
        $this->seedForFees($issuerId);

        // Seed receipts for clearance requests
        $this->seedForClearanceRequests($issuerId);

        // Seed additional test receipts
        $this->seedTestReceipts($issuerId);

        $this->command->info('Receipt Seeder completed!');
    }

    /**
     * Seed receipts from existing payments
     */
    private function seedFromPayments($issuerId)
    {
        $this->command->info('Creating receipts from payments...');

        $payments = Payment::with(['items', 'discounts'])
            ->whereIn('status', ['completed', 'partially_paid'])
            ->get();

        if ($payments->isEmpty()) {
            $this->command->warn('No payments found. Skipping payment receipts.');
            return;
        }

        $count = 0;
        foreach ($payments as $payment) {
            // Check if receipt already exists for this payment
            if (Receipt::where('payment_id', $payment->id)->exists()) {
                continue;
            }

            // Determine receipt type based on payment purpose
            $receiptType = 'official';
            $receiptable = null;
            
            // Check if payment has clearance request
            $clearanceRequest = $payment->items()
                ->whereNotNull('clearance_request_id')
                ->first()?->clearanceRequest;
            
            if ($clearanceRequest) {
                $receiptType = 'clearance';
                $receiptable = $clearanceRequest;
            } elseif ($payment->items->isNotEmpty() && $payment->items->first()->fee_id) {
                $receiptType = 'fee';
                $receiptable = Fee::find($payment->items->first()->fee_id);
            }

            $receiptData = [
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'receipt_type' => $receiptType,
                'payer_name' => $payment->payer_name,
                'payer_address' => $payment->address,
                'subtotal' => $payment->subtotal,
                'surcharge' => $payment->surcharge,
                'penalty' => $payment->penalty,
                'discount' => $payment->discount,
                'total_amount' => $payment->total_amount - $payment->discount,
                'amount_paid' => $payment->amount_paid,
                'change_due' => $payment->change_due,
                'payment_method' => $payment->payment_method,
                'reference_number' => $payment->reference_number,
                'payment_date' => $payment->payment_date,
                'issued_date' => $payment->payment_date,
                'issued_by' => $payment->recorded_by ?? $issuerId,
                'fee_breakdown' => $payment->items->map(function($item) {
                    return [
                        'fee_id' => $item->fee_id,
                        'fee_name' => $item->fee_name,
                        'fee_code' => $item->fee_code,
                        'category' => $item->category,
                        'base_amount' => $item->base_amount,
                        'surcharge' => $item->surcharge,
                        'penalty' => $item->penalty,
                        'discount' => $item->discount,
                        'total_amount' => $item->total_amount,
                        'clearance_request_id' => $item->clearance_request_id,
                    ];
                })->toArray(),
                'discount_breakdown' => $payment->discounts->isNotEmpty() ? 
                    $payment->discounts->map(function($discount) {
                        return [
                            'rule_id' => $discount->discount_rule_id,
                            'rule_name' => $discount->rule?->name,
                            'discount_type' => $discount->rule?->discount_type,
                            'discount_amount' => $discount->discount_amount,
                            'id_number' => $discount->id_number,
                        ];
                    })->toArray() : null,
                'printed_count' => rand(0, 3),
                'created_at' => $payment->payment_date,
                'updated_at' => $payment->payment_date,
            ];

            // Create receipt with polymorphic relationship if applicable
            $receipt = new Receipt($receiptData);
            
            if ($receiptable) {
                $receipt->receiptable()->associate($receiptable);
            }
            
            $receipt->save();

            // Randomly mark some as printed
            if ($receipt->printed_count > 0) {
                $receipt->last_printed_at = $payment->payment_date->copy()->addDays(rand(1, 5));
                $receipt->save();
            }

            $count++;
            $this->command->info("  Created receipt: {$receipt->receipt_number} for payment #{$payment->id}");
        }

        $this->command->info("Created {$count} receipts from payments.");
    }

    /**
     * Seed receipts for direct fee payments (without associated payment record)
     */
    private function seedForFees($issuerId)
    {
        $this->command->info('Creating receipts for direct fee payments...');

        // Get all fees
        $fees = Fee::all();
        
        if ($fees->isEmpty()) {
            $this->command->warn('No fees found. Skipping fee receipts.');
            return;
        }

        $residents = Resident::inRandomOrder()->limit(10)->get();
        if ($residents->isEmpty()) {
            $this->command->warn('No residents found. Skipping fee receipts.');
            return;
        }

        $paymentMethods = ['cash', 'gcash', 'maya', 'bank', 'check'];
        $count = 0;

        // Create 20 random fee receipts
        for ($i = 0; $i < 20; $i++) {
            $fee = $fees->random();
            $resident = $residents->random();
            $date = Carbon::now()->subDays(rand(0, 60));
            // Use amount field if exists, otherwise generate random amount
            $amount = $fee->amount ?? $fee->price ?? rand(100, 1000);
            $method = $paymentMethods[array_rand($paymentMethods)];

            // Get fee name from available fields
            $feeName = $fee->name ?? $fee->fee_name ?? $fee->description ?? 'General Fee';
            $feeCode = $fee->code ?? $fee->fee_code ?? 'FEE-' . str_pad($fee->id, 3, '0', STR_PAD_LEFT);
            $feeCategory = $fee->category ?? $fee->type ?? 'general';

            $receiptData = [
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id' => null,
                'or_number' => 'DIRECT-' . $date->format('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'receipt_type' => 'fee',
                'payer_name' => $resident->full_name ?? $resident->name ?? 'Resident',
                'payer_address' => $resident->address ?? 'Unknown Address',
                'subtotal' => $amount,
                'surcharge' => 0,
                'penalty' => 0,
                'discount' => 0,
                'total_amount' => $amount,
                'amount_paid' => $amount,
                'change_due' => 0,
                'payment_method' => $method,
                'reference_number' => $method !== 'cash' ? 'REF-' . rand(100000, 999999) : null,
                'payment_date' => $date,
                'issued_date' => $date,
                'issued_by' => $issuerId,
                'fee_breakdown' => [
                    [
                        'fee_id' => $fee->id,
                        'fee_name' => $feeName,
                        'fee_code' => $feeCode,
                        'category' => $feeCategory,
                        'base_amount' => $amount,
                        'surcharge' => 0,
                        'penalty' => 0,
                        'discount' => 0,
                        'total_amount' => $amount,
                        'clearance_request_id' => null,
                    ]
                ],
                'printed_count' => rand(0, 2),
                'last_printed_at' => rand(0, 1) ? $date->copy()->addDays(rand(1, 3)) : null,
                'is_voided' => rand(1, 30) === 1, // ~3% chance
                'void_reason' => rand(1, 30) === 1 ? 'Payment error' : null,
                'created_at' => $date,
                'updated_at' => $date,
            ];

            $receipt = new Receipt($receiptData);
            $receipt->receiptable()->associate($fee);
            $receipt->save();

            $count++;
        }

        $this->command->info("Created {$count} direct fee receipts.");
    }

    /**
     * Seed receipts for clearance requests
     */
    private function seedForClearanceRequests($issuerId)
    {
        $this->command->info('Creating receipts for clearance requests...');

        $clearanceRequests = ClearanceRequest::with(['resident', 'clearanceType'])
            ->where('status', 'approved')
            ->whereDoesntHave('payment') // Only those without payments
            ->get();

        if ($clearanceRequests->isEmpty()) {
            $this->command->warn('No approved clearance requests found. Skipping clearance receipts.');
            return;
        }

        $paymentMethods = ['cash', 'gcash', 'maya'];
        $count = 0;

        foreach ($clearanceRequests->take(15) as $request) {
            $date = $request->approved_at ?? Carbon::now()->subDays(rand(1, 30));
            $amount = $request->clearanceType->fee_amount ?? 150;
            $method = $paymentMethods[array_rand($paymentMethods)];

            $receiptData = [
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id' => null,
                'or_number' => 'CLR-' . $date->format('Ymd') . '-' . str_pad($request->id, 4, '0', STR_PAD_LEFT),
                'receipt_type' => 'clearance',
                'payer_name' => $request->resident->full_name ?? $request->resident->name ?? 'Resident',
                'payer_address' => $request->resident->address ?? 'Unknown Address',
                'subtotal' => $amount,
                'surcharge' => 0,
                'penalty' => 0,
                'discount' => 0,
                'total_amount' => $amount,
                'amount_paid' => $amount,
                'change_due' => 0,
                'payment_method' => $method,
                'reference_number' => $method !== 'cash' ? 'REF-CLR-' . rand(100000, 999999) : null,
                'payment_date' => $date,
                'issued_date' => $date,
                'issued_by' => $issuerId,
                'fee_breakdown' => [
                    [
                        'fee_id' => $request->clearanceType->fee_id,
                        'fee_name' => $request->clearanceType->name . ' Fee',
                        'fee_code' => $request->clearanceType->code,
                        'category' => 'clearance',
                        'base_amount' => $amount,
                        'surcharge' => 0,
                        'penalty' => 0,
                        'discount' => 0,
                        'total_amount' => $amount,
                        'clearance_request_id' => $request->id,
                    ]
                ],
                'metadata' => [
                    'control_number' => $request->control_number,
                    'purpose' => $request->purpose,
                    'clearance_type' => $request->clearanceType->name,
                ],
                'printed_count' => rand(0, 1),
                'created_at' => $date,
                'updated_at' => $date,
            ];

            $receipt = new Receipt($receiptData);
            $receipt->receiptable()->associate($request);
            $receipt->save();

            $count++;
        }

        $this->command->info("Created {$count} clearance request receipts.");
    }

    /**
     * Seed additional test receipts with various scenarios
     */
    private function seedTestReceipts($issuerId)
    {
        $this->command->info('Creating additional test receipts...');

        $fees = Fee::all();
        $residents = Resident::all();
        
        if ($fees->isEmpty() || $residents->isEmpty()) {
            $this->command->warn('Insufficient data for test receipts.');
            return;
        }

        $scenarios = [
            'partial_payment' => [
                'amount_paid' => 0.5, // 50% paid
                'change_due' => 0,
            ],
            'overpayment' => [
                'amount_paid' => 1.2, // 120% paid
                'change_due' => 0.2,
            ],
            'with_discount' => [
                'discount' => 0.1, // 10% discount
                'amount_paid' => 0.9,
            ],
            'voided' => [
                'is_voided' => true,
                'void_reason' => 'Test void reason',
            ],
        ];

        // Only add multiple_fees scenario if there are enough fees
        if ($fees->count() >= 2) {
            $scenarios['multiple_fees'] = [
                'multiple' => true,
            ];
        } else {
            $this->command->warn('Not enough fees for multiple_fees scenario. Skipping...');
        }

        $paymentMethods = ['cash', 'gcash', 'maya', 'bank', 'check'];
        $count = 0;

        foreach ($scenarios as $scenario => $config) {
            for ($i = 0; $i < 3; $i++) {
                $fee = $fees->random();
                $resident = $residents->random();
                $date = Carbon::now()->subDays(rand(0, 45));
                $baseAmount = $fee->amount ?? $fee->price ?? rand(100, 2000);
                
                $discount = $config['discount'] ?? 0;
                $discountAmount = $baseAmount * $discount;
                $totalAmount = $baseAmount - $discountAmount;
                
                $amountMultiplier = $config['amount_paid'] ?? 1;
                $amountPaid = $config['multiple'] ?? false ? $totalAmount : $totalAmount * $amountMultiplier;
                
                $changeDue = $config['change_due'] ?? ($amountPaid > $totalAmount ? $amountPaid - $totalAmount : 0);
                
                $method = $paymentMethods[array_rand($paymentMethods)];

                // Get fee details
                $feeName = $fee->name ?? $fee->fee_name ?? $fee->description ?? 'General Fee';
                $feeCode = $fee->code ?? $fee->fee_code ?? 'FEE-' . str_pad($fee->id, 3, '0', STR_PAD_LEFT);
                $feeCategory = $fee->category ?? $fee->type ?? 'general';

                // Build fee breakdown (multiple fees if needed)
                $feeBreakdown = [];
                if ($config['multiple'] ?? false) {
                    // Safely get random fees - ensure we don't request more than available
                    $numberOfFees = min(rand(2, 4), $fees->count());
                    $selectedFees = $fees->random($numberOfFees);
                    $totalAmount = 0;
                    
                    foreach ($selectedFees as $selectedFee) {
                        $feeAmount = $selectedFee->amount ?? $selectedFee->price ?? rand(50, 500);
                        $totalAmount += $feeAmount;
                        $feeBreakdown[] = [
                            'fee_id' => $selectedFee->id,
                            'fee_name' => $selectedFee->name ?? $selectedFee->fee_name ?? 'Fee',
                            'fee_code' => $selectedFee->code ?? $selectedFee->fee_code ?? 'FEE-' . str_pad($selectedFee->id, 3, '0', STR_PAD_LEFT),
                            'category' => $selectedFee->category ?? $selectedFee->type ?? 'general',
                            'base_amount' => $feeAmount,
                            'surcharge' => 0,
                            'penalty' => 0,
                            'discount' => 0,
                            'total_amount' => $feeAmount,
                            'clearance_request_id' => null,
                        ];
                    }
                    $amountPaid = $totalAmount;
                    $baseAmount = $totalAmount; // For display purposes
                } else {
                    $feeBreakdown = [
                        [
                            'fee_id' => $fee->id,
                            'fee_name' => $feeName,
                            'fee_code' => $feeCode,
                            'category' => $feeCategory,
                            'base_amount' => $baseAmount,
                            'surcharge' => 0,
                            'penalty' => 0,
                            'discount' => $discountAmount,
                            'total_amount' => $totalAmount,
                            'clearance_request_id' => null,
                        ]
                    ];
                }

                $receiptData = [
                    'receipt_number' => Receipt::generateReceiptNumber(),
                    'payment_id' => null,
                    'or_number' => 'TEST-' . $date->format('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'receipt_type' => 'official',
                    'payer_name' => $resident->full_name ?? $resident->name ?? 'Resident',
                    'payer_address' => $resident->address ?? 'Unknown Address',
                    'subtotal' => $baseAmount,
                    'surcharge' => 0,
                    'penalty' => 0,
                    'discount' => $discountAmount,
                    'total_amount' => $config['multiple'] ?? false ? $totalAmount : $totalAmount,
                    'amount_paid' => $amountPaid,
                    'change_due' => $changeDue,
                    'payment_method' => $method,
                    'reference_number' => $method !== 'cash' ? 'REF-TEST-' . rand(100000, 999999) : null,
                    'payment_date' => $date,
                    'issued_date' => $date,
                    'issued_by' => $issuerId,
                    'fee_breakdown' => $feeBreakdown,
                    'discount_breakdown' => $discountAmount > 0 ? [
                        [
                            'rule_id' => rand(1, 5),
                            'rule_name' => 'Senior Citizen Discount',
                            'discount_type' => 'percentage',
                            'discount_amount' => $discountAmount,
                            'id_number' => 'SC-' . rand(1000, 9999),
                        ]
                    ] : null,
                    'printed_count' => rand(0, 3),
                    'last_printed_at' => rand(0, 1) ? $date->copy()->addDays(rand(1, 3)) : null,
                    'is_voided' => $config['is_voided'] ?? false,
                    'void_reason' => $config['void_reason'] ?? null,
                    'voided_at' => $config['is_voided'] ?? false ? $date->copy()->addDays(rand(1, 2)) : null,
                    'metadata' => [
                        'scenario' => $scenario,
                        'test_data' => true,
                    ],
                    'created_at' => $date,
                    'updated_at' => $date,
                ];

                $receipt = new Receipt($receiptData);
                
                // Associate with fee or leave as general receipt
                if (!($config['multiple'] ?? false)) {
                    $receipt->receiptable()->associate($fee);
                }
                
                $receipt->save();
                $count++;
            }
        }

        $this->command->info("Created {$count} test receipts with various scenarios.");
    }

    /**
     * Get random fee name for test data
     */
    private function getRandomFeeName()
    {
        $fees = [
            'Barangay Clearance Fee',
            'Certificate of Indigency Fee',
            'Business Clearance Fee',
            'Residency Certificate Fee',
            'Community Tax Certificate',
            'Building Permit Fee',
            'Health Certificate Fee',
            'Sanitary Permit Fee',
            'Zoning Clearance Fee',
            'Fencing Permit Fee',
        ];
        
        return $fees[array_rand($fees)];
    }
}