<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Faker\Factory as Faker;
use Carbon\Carbon;
use App\Models\Fee;
use App\Models\ClearanceRequest;
use App\Models\Resident;
use App\Models\Household;
use App\Models\FeeType;
use App\Models\ClearanceType;

class FeeAndClearanceSeeder extends Seeder
{
    private $faker;
    
    /** @var Collection<int, Resident> */
    private Collection $residents;
    
    /** @var Collection<int, Household> */
    private Collection $households;
    
    /** @var Collection<int, FeeType> */
    private Collection $feeTypes;
    
    /** @var Collection<int, ClearanceType> */
    private Collection $clearanceTypes;
    
    private array $validFeeStatuses = [];
    
    public function run()
    {
        $this->faker = Faker::create('en_PH');
        
        // Initialize collections
        $this->residents = collect();
        $this->households = collect();
        $this->feeTypes = collect();
        $this->clearanceTypes = collect();
        
        // Get valid statuses from database
        $this->getValidFeeStatuses();
        
        $this->command->info('Starting Fee and Clearance Data Generation...');
        $this->command->info('Valid fee statuses: ' . implode(', ', $this->validFeeStatuses));
        
        // Load existing data
        $this->loadExistingData();
        
        // Generate 1000+ fees
        $this->command->info('Generating 1000+ fee records...');
        $this->generateFees(1000);
        
        // Generate clearance requests
        $this->command->info('Generating clearance requests...');
        $this->generateClearanceRequests(500);
        
        $this->command->info('Fee and Clearance data generation completed!');
        $this->command->info('Total Fees: ' . Fee::count());
        $this->command->info('Total Clearance Requests: ' . ClearanceRequest::count());
    }
    
    /**
     * Get valid statuses from the fees table ENUM
     */
    private function getValidFeeStatuses(): void
    {
        try {
            $column = DB::select("SHOW COLUMNS FROM fees WHERE Field = 'status'");
            if (!empty($column)) {
                $type = $column[0]->Type;
                // Extract enum values from string like "enum('draft','pending','paid',...)"
                preg_match("/^enum\((.*)\)$/", $type, $matches);
                if (!empty($matches[1])) {
                    $values = str_getcsv($matches[1], ',', "'");
                    $this->validFeeStatuses = $values;
                    return;
                }
            }
        } catch (\Exception $e) {
            $this->command->warn('Could not fetch ENUM values: ' . $e->getMessage());
        }
        
        // Fallback to safe default values
        $this->validFeeStatuses = ['draft', 'pending', 'pending_payment', 'partially_paid', 'paid', 'cancelled', 'waived'];
    }
    
    private function loadExistingData(): void
    {
        // Load residents
        $this->residents = Resident::with(['household', 'purok'])->get();
        $this->command->info('Loaded ' . $this->residents->count() . ' residents');
        
        // Load households
        $this->households = Household::with(['purok'])->get();
        $this->command->info('Loaded ' . $this->households->count() . ' households');
        
        // Load fee types
        $this->feeTypes = FeeType::where('is_active', 1)->get();
        $this->command->info('Loaded ' . $this->feeTypes->count() . ' fee types');
        
        // Load clearance types
        $this->clearanceTypes = ClearanceType::where('is_active', 1)->get();
        $this->command->info('Loaded ' . $this->clearanceTypes->count() . ' clearance types');
    }
    
    private function generateFees(int $count): void
    {
        // Filter statuses to only include those that are actually in the database
        $availableStatuses = $this->validFeeStatuses;
        
        // Define weights for statuses that exist
        $statusWeights = [];
        foreach ($availableStatuses as $status) {
            $statusWeights[] = match($status) {
                'draft' => 5,
                'pending' => 15,
                'pending_payment' => 10,
                'partially_paid' => 15,
                'paid' => 40,
                'overdue' => 5,
                'cancelled' => 5,
                'waived' => 5,
                default => 5
            };
        }
        
        $batchReference = 'BATCH-' . date('Ymd') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        for ($i = 0; $i < $count; $i++) {
            // Randomly choose payer type
            $payerType = $this->faker->randomElement(['resident', 'household']);
            
            if ($payerType === 'resident') {
                $payer = $this->residents->random();
                $payerId = $payer->id;
                $payerModel = 'App\\Models\\Resident';
                $payerName = $payer->full_name;
                $businessName = null;
                $contactNumber = $payer->contact_number;
                $address = $payer->address;
                $purok = $payer->purok ? $payer->purok->name : null;
            } else {
                $payer = $this->households->random();
                $payerId = $payer->id;
                $payerModel = 'App\\Models\\Household';
                $payerName = $payer->current_head_name ?? 'Household #' . $payer->household_number;
                $businessName = null;
                $contactNumber = $payer->contact_number;
                $address = $payer->address;
                $purok = $payer->purok ? $payer->purok->name : null;
            }
            
            // Select appropriate fee type based on payer
            $feeType = $this->selectFeeType($payerType, $payer);
            
            if (!$feeType) {
                continue;
            }
            
            // Calculate dates
            $issueDate = $this->faker->dateTimeBetween('-1 year', 'now');
            $dueDate = $this->calculateDueDate($issueDate, $feeType);
            
            // Calculate amounts
            $baseAmount = $feeType->base_amount;
            $discountAmount = $this->calculateDiscount($feeType, $payer);
            $surchargeAmount = $this->calculateSurcharge($feeType);
            $penaltyAmount = $this->calculatePenalty($feeType, $dueDate);
            
            $totalAmount = $baseAmount - $discountAmount + $surchargeAmount + $penaltyAmount;
            
            // Determine status and payment
            $status = $this->getWeightedRandom($availableStatuses, $statusWeights);
            $amountPaid = 0;
            $orNumber = null;
            $collectedBy = null;
            
            if (in_array($status, ['paid', 'partially_paid'])) {
                if ($status === 'paid') {
                    $amountPaid = $totalAmount;
                } else {
                    $amountPaid = $totalAmount * $this->faker->randomFloat(2, 0.3, 0.9);
                }
                $orNumber = 'OR-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
                $collectedBy = rand(1, 5);
            }
            
            $balance = max(0, $totalAmount - $amountPaid);
            
            // Generate fee code
            $feeCode = $this->generateFeeCode($feeType, $i);
            
            // Create fee record with CORRECT column names
            Fee::create([
                'fee_type_id' => $feeType->id,
                'fee_code' => $feeCode,
                'certificate_number' => $this->faker->boolean(70) ? $this->generateCertificateNumber($feeType) : null,
                'or_number' => $orNumber,
                
                // Payer info - USING payer_model NOT payer_type
                'payer_type' => $payerModel,  // This is actually payer_model in your table?
                'payer_model' => $payerModel,  // Your table has payer_model column
                'payer_id' => $payerId,
                'payer_name' => $payerName,
                'business_name' => $businessName,
                'contact_number' => $contactNumber,
                'address' => $address,
                'purok' => $purok,
                'zone' => null,
                
                // Billing period
                'billing_period' => $this->generateBillingPeriod($feeType),
                'period_start' => $this->calculatePeriodStart($issueDate, $feeType),
                'period_end' => $this->calculatePeriodEnd($issueDate, $feeType),
                
                // Dates
                'issue_date' => $issueDate,
                'due_date' => $dueDate,
                'valid_from' => $issueDate,
                'valid_until' => $this->calculateValidUntil($issueDate, $feeType),
                
                // Amounts
                'base_amount' => $baseAmount,
                'discount_amount' => $discountAmount,
                'discount_type' => $discountAmount > 0 ? $this->getDiscountType($feeType, $payer) : null,
                'surcharge_amount' => $surchargeAmount,
                'penalty_amount' => $penaltyAmount,
                'total_amount' => $totalAmount,
                'amount_paid' => $amountPaid,
                'balance' => $balance,
                
                // Purpose and description
                'purpose' => $this->faker->boolean(50) ? $feeType->name : $this->faker->randomElement(['Payment', 'Renewal', 'Application', 'Registration']),
                'property_description' => null,
                'business_type' => null,
                'area' => null,
                'remarks' => $this->faker->boolean(30) ? $this->faker->sentence : null,
                
                // Status
                'status' => $status,
                
                // Requirements
                'requirements_submitted' => $this->generateRequirements($feeType),
                
                // Audit
                'issued_by' => rand(1, 5),
                'collected_by' => $collectedBy,
                'created_by' => rand(1, 5),
                
                // Batch
                'batch_reference' => $this->faker->boolean(50) ? $batchReference : null,
            ]);
            
            if (($i + 1) % 100 == 0) {
                $this->command->info("Generated " . ($i + 1) . " fees...");
            }
        }
    }
    
    /**
     * Generate billing period string
     */
    private function generateBillingPeriod($feeType): ?string
    {
        if (!$feeType->frequency) {
            return null;
        }
        
        $now = Carbon::now();
        
        return match($feeType->frequency) {
            'monthly' => $now->format('F Y'),
            'quarterly' => 'Q' . ceil($now->month / 3) . ' ' . $now->year,
            'annual' => $now->format('Y'),
            default => null
        };
    }
    
    /**
     * Get discount type description
     */
    private function getDiscountType($feeType, $payer): ?string
    {
        if (!$feeType->is_discountable) {
            return null;
        }
        
        if ($payer instanceof Resident) {
            if ($feeType->has_senior_discount && method_exists($payer, 'isSenior') && $payer->isSenior()) {
                return 'Senior Citizen Discount';
            }
            if ($feeType->has_pwd_discount && method_exists($payer, 'isPwd') && $payer->isPwd()) {
                return 'PWD Discount';
            }
            if ($feeType->has_solo_parent_discount && method_exists($payer, 'isSoloParent') && $payer->isSoloParent()) {
                return 'Solo Parent Discount';
            }
            if ($feeType->has_indigent_discount && method_exists($payer, 'isIndigent') && $payer->isIndigent()) {
                return 'Indigent Discount';
            }
        }
        
        return null;
    }
    
    /**
     * @param string $payerType
     * @param Resident|Household $payer
     * @return FeeType|null
     */
    private function selectFeeType(string $payerType, $payer): ?FeeType
    {
        $applicableTypes = $this->feeTypes->filter(function (FeeType $type) use ($payerType): bool {
            if (!$type->applicable_to) {
                return true;
            }
            
            $applicableTo = is_string($type->applicable_to) 
                ? json_decode($type->applicable_to, true) 
                : $type->applicable_to;
            
            if (is_array($applicableTo)) {
                return in_array($payerType . 's', $applicableTo) || in_array('all_residents', $applicableTo);
            }
            
            return $type->applicable_to === 'all_residents' || 
                   $type->applicable_to === $payerType . 's';
        });
        
        if ($applicableTypes->isEmpty()) {
            return $this->feeTypes->random();
        }
        
        return $applicableTypes->random();
    }
    
    private function calculateDueDate($issueDate, FeeType $feeType): Carbon
    {
        $issueDate = Carbon::instance($issueDate);
        
        if ($feeType->due_day) {
            return $issueDate->copy()->day($feeType->due_day)->addMonth();
        }
        
        if ($feeType->validity_days) {
            return $issueDate->copy()->addDays($feeType->validity_days);
        }
        
        return $issueDate->copy()->addDays(30);
    }
    
    private function calculatePeriodStart($issueDate, FeeType $feeType): ?Carbon
    {
        if (in_array($feeType->frequency, ['monthly', 'annual'])) {
            return Carbon::instance($issueDate)->startOfMonth();
        }
        return null;
    }
    
    private function calculatePeriodEnd($issueDate, FeeType $feeType): ?Carbon
    {
        if (in_array($feeType->frequency, ['monthly', 'annual'])) {
            return Carbon::instance($issueDate)->endOfMonth();
        }
        return null;
    }
    
    private function calculateValidUntil($issueDate, FeeType $feeType): ?Carbon
    {
        if ($feeType->validity_days) {
            return Carbon::instance($issueDate)->addDays($feeType->validity_days);
        }
        return null;
    }
    
    /**
     * @param FeeType $feeType
     * @param Resident|Household $payer
     * @return float
     */
    private function calculateDiscount(FeeType $feeType, $payer): float
    {
        if (!$feeType->is_discountable) {
            return 0;
        }
        
        $discountPercentage = 0;
        
        // Check if payer is resident and has privileges
        if ($payer instanceof Resident) {
            if ($feeType->has_senior_discount && method_exists($payer, 'isSenior') && $payer->isSenior()) {
                $discountPercentage = max($discountPercentage, $feeType->senior_discount_percentage ?? 20);
            }
            if ($feeType->has_pwd_discount && method_exists($payer, 'isPwd') && $payer->isPwd()) {
                $discountPercentage = max($discountPercentage, $feeType->pwd_discount_percentage ?? 20);
            }
            if ($feeType->has_solo_parent_discount && method_exists($payer, 'isSoloParent') && $payer->isSoloParent()) {
                $discountPercentage = max($discountPercentage, $feeType->solo_parent_discount_percentage ?? 20);
            }
            if ($feeType->has_indigent_discount && method_exists($payer, 'isIndigent') && $payer->isIndigent()) {
                $discountPercentage = max($discountPercentage, $feeType->indigent_discount_percentage ?? 100);
            }
        }
        
        if ($discountPercentage > 0) {
            return $feeType->base_amount * ($discountPercentage / 100);
        }
        
        return 0;
    }
    
    private function calculateSurcharge(FeeType $feeType): float
    {
        if (!$feeType->has_surcharge) {
            return 0;
        }
        
        if ($feeType->surcharge_fixed > 0) {
            return $feeType->surcharge_fixed;
        }
        
        if ($feeType->surcharge_percentage > 0) {
            return $feeType->base_amount * ($feeType->surcharge_percentage / 100);
        }
        
        return 0;
    }
    
    private function calculatePenalty(FeeType $feeType, $dueDate): float
    {
        if (!$feeType->has_penalty) {
            return 0;
        }
        
        $dueDate = Carbon::instance($dueDate);
        
        // Only apply penalty if overdue
        if ($dueDate->isFuture() || $dueDate->isToday()) {
            return 0;
        }
        
        if ($feeType->penalty_fixed > 0) {
            return $feeType->penalty_fixed;
        }
        
        if ($feeType->penalty_percentage > 0) {
            return $feeType->base_amount * ($feeType->penalty_percentage / 100);
        }
        
        return 0;
    }
    
    private function generateFeeCode(FeeType $feeType, int $index): string
    {
        $prefix = strtoupper(substr($feeType->code ?? 'FEE', 0, 3));
        $year = date('Y');
        $sequence = str_pad($index + 1, 6, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$year}-{$sequence}";
    }
    
    private function generateCertificateNumber(FeeType $feeType): string
    {
        $prefix = strtoupper(substr($feeType->code ?? 'CERT', 0, 3));
        $year = date('Y');
        $sequence = str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$year}-{$sequence}";
    }
    
    private function generateRequirements(FeeType $feeType): ?array
    {
        if (empty($feeType->requirements)) {
            return null;
        }
        
        $requirements = is_string($feeType->requirements) 
            ? json_decode($feeType->requirements, true) 
            : $feeType->requirements;
        
        if (!is_array($requirements) || empty($requirements)) {
            return null;
        }
        
        // Randomly select some requirements as submitted
        $submitted = [];
        $count = min(rand(1, count($requirements)), count($requirements));
        
        if ($count > 0) {
            $keys = (array) array_rand($requirements, $count);
            
            foreach ($keys as $key) {
                $submitted[] = $requirements[$key];
            }
        }
        
        return !empty($submitted) ? $submitted : null;
    }
    
    private function generateClearanceRequests(int $count): void
    {
        $statuses = ['pending', 'processing', 'approved', 'issued', 'rejected', 'cancelled', 'pending_payment'];
        $statusWeights = [15, 10, 10, 40, 5, 5, 15];
        $paymentStatuses = ['unpaid', 'partially_paid', 'paid'];
        $urgencies = ['normal', 'rush', 'express'];
        $urgenciesWeights = [70, 20, 10];
        
        $purposes = [
            'Employment', 'School Requirement', 'Government Transaction',
            'Travel', 'Business Registration', 'Scholarship Application',
            'Medical Assistance', 'Financial Aid', 'Legal Purpose',
            'Identification', 'Other'
        ];
        
        for ($i = 0; $i < $count; $i++) {
            // Randomly choose payer type
            $payerType = $this->faker->randomElement(['resident', 'household']);
            
            if ($payerType === 'resident') {
                $payer = $this->residents->random();
                $payerId = $payer->id;
                $payerModel = 'App\\Models\\Resident';
                $contactName = $payer->full_name;
                $contactNumber = $payer->contact_number;
                $contactAddress = $payer->address;
                $contactPurokId = $payer->purok_id;
                $contactEmail = $payer->email;
                $residentId = $payer->id;
                $householdId = $payer->household_id;
            } else {
                $payer = $this->households->random();
                $payerId = $payer->id;
                $payerModel = 'App\\Models\\Household';
                $contactName = $payer->current_head_name ?? 'Household Representative';
                $contactNumber = $payer->contact_number;
                $contactAddress = $payer->address;
                $contactPurokId = $payer->purok_id;
                $contactEmail = $payer->email;
                
                // For household payer, we need to get the head resident's ID
                $headResident = $this->getHouseholdHeadResident($payer);
                $residentId = $headResident ? $headResident->id : $this->residents->random()->id;
                $householdId = $payer->id;
            }
            
            // Select clearance type
            $clearanceType = $this->clearanceTypes->random();
            
            // Calculate fee with potential discounts
            $feeAmount = $this->calculateClearanceFee($clearanceType, $payerType, $payer);
            
            // Determine status
            $status = $this->getWeightedRandom($statuses, $statusWeights);
            
            // Calculate dates
            $createdAt = $this->faker->dateTimeBetween('-6 months', 'now');
            $neededDate = Carbon::instance($createdAt)->addDays(rand(1, 14));
            
            $processedAt = null;
            $issueDate = null;
            $validUntil = null;
            $clearanceNumber = null;
            
            if (in_array($status, ['approved', 'issued', 'rejected'])) {
                $processedAt = Carbon::instance($createdAt)->addDays(rand(1, $clearanceType->processing_days ?? 3));
            }
            
            if ($status === 'issued') {
                $issueDate = $processedAt ?? now();
                $validUntil = Carbon::instance($issueDate)->addDays($clearanceType->validity_days ?? 30);
                $clearanceNumber = ClearanceRequest::generateClearanceNumber();
            }
            
            // Payment details
            $paymentStatus = $this->faker->randomElement($paymentStatuses);
            $amountPaid = 0;
            $paymentDate = null;
            $orNumber = null;
            
            if ($paymentStatus === 'paid') {
                $amountPaid = $feeAmount;
                $paymentDate = Carbon::instance($createdAt)->addDays(rand(1, 5));
                $orNumber = 'OR-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
            } elseif ($paymentStatus === 'partially_paid') {
                $amountPaid = $feeAmount * $this->faker->randomFloat(2, 0.3, 0.9);
                $paymentDate = Carbon::instance($createdAt)->addDays(rand(1, 5));
                $orNumber = 'OR-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
            }
            
            $balance = max(0, $feeAmount - $amountPaid);
            
            if ($paymentStatus === 'unpaid' && $feeAmount > 0) {
                $status = 'pending_payment';
            }
            
            // Generate reference number
            $referenceNumber = ClearanceRequest::generateReferenceNumber();
            
            // Prepare requirements_met
            $requirementsMet = null;
            if ($this->faker->boolean(80) && $clearanceType->requirements) {
                $reqs = is_string($clearanceType->requirements) 
                    ? json_decode($clearanceType->requirements, true) 
                    : $clearanceType->requirements;
                if (is_array($reqs)) {
                    $requirementsMet = $reqs;
                }
            }
            
            // Create clearance request
            ClearanceRequest::create([
                // Payer Information
                'payer_type' => $payerModel,
                'payer_id' => $payerId,
                
                // Resident (required field - backward compatibility)
                'resident_id' => $residentId,
                'household_id' => $householdId,
                
                // Type
                'clearance_type_id' => $clearanceType->id,
                
                // Request Details
                'reference_number' => $referenceNumber,
                'purpose' => $this->faker->randomElement($purposes),
                'specific_purpose' => $this->faker->boolean(50) ? $this->faker->sentence : null,
                'urgency' => $this->getWeightedRandom($urgencies, $urgenciesWeights),
                'needed_date' => $neededDate,
                'fee_amount' => $feeAmount,
                
                // Status
                'status' => $status,
                
                // Payment Tracking
                'payment_status' => $paymentStatus,
                'amount_paid' => $amountPaid,
                'balance' => $balance,
                'payment_date' => $paymentDate,
                'or_number' => $orNumber,
                
                // Clearance Issuance Details
                'clearance_number' => $clearanceNumber,
                'issue_date' => $issueDate,
                'valid_until' => $validUntil,
                'requirements_met' => $requirementsMet,
                'remarks' => $this->faker->boolean(20) ? $this->faker->sentence : null,
                'issuing_officer_id' => $status === 'issued' ? rand(1, 5) : null,
                'issuing_officer_name' => $status === 'issued' ? 'Admin Officer ' . rand(1, 5) : null,
                
                // Processing Details
                'admin_notes' => $this->faker->boolean(15) ? $this->faker->sentence : null,
                'cancellation_reason' => $status === 'cancelled' ? 'Requested by applicant' : null,
                'processed_at' => $processedAt,
                'processed_by' => $processedAt ? rand(1, 5) : null,
                
                // Contact Info
                'contact_name' => $contactName,
                'contact_number' => $contactNumber,
                'contact_address' => $contactAddress,
                'contact_purok_id' => $contactPurokId,
                'contact_email' => $contactEmail,
                
                'requested_by_user_id' => $this->faker->boolean(60) ? rand(1, 1000) : null,
            ]);
            
            if (($i + 1) % 100 == 0) {
                $this->command->info("Generated " . ($i + 1) . " clearance requests...");
            }
        }
    }
    
    /**
     * Get the head resident of a household
     */
    private function getHouseholdHeadResident(Household $household): ?Resident
    {
        // Try to get from household members relationship
        if (method_exists($household, 'householdMembers')) {
            $headMember = $household->householdMembers()
                ->where('is_head', true)
                ->with('resident')
                ->first();
            
            if ($headMember && $headMember->resident) {
                return $headMember->resident;
            }
        }
        
        // Try to get from residents relationship
        if (method_exists($household, 'residents')) {
            $residents = $household->residents;
            if ($residents->isNotEmpty()) {
                $adultResidents = $residents->filter(function($resident) {
                    return $resident->age >= 18;
                });
                
                if ($adultResidents->isNotEmpty()) {
                    return $adultResidents->sortByDesc('age')->first();
                }
                
                return $residents->first();
            }
        }
        
        return $this->residents->where('purok_id', $household->purok_id)->random();
    }
    
    /**
     * @param ClearanceType $clearanceType
     * @param string $payerType
     * @param Resident|Household $payer
     * @return float
     */
    private function calculateClearanceFee(ClearanceType $clearanceType, string $payerType, $payer): float
    {
        $fee = $clearanceType->fee ?? 0;
        
        if ($clearanceType->is_discountable && $payerType === 'resident' && $payer instanceof Resident) {
            if ((method_exists($payer, 'isSenior') && $payer->isSenior()) || 
                (method_exists($payer, 'isPwd') && $payer->isPwd())) {
                $fee = $fee * 0.8;
            }
        }
        
        if (in_array($clearanceType->code, ['INDIGENCY_CERT', 'FTJ_CERT', 'CEDULA_EXEMPT'])) {
            $fee = 0;
        }
        
        return $fee;
    }
    
    /**
     * @param array $items
     * @param array $weights
     * @return mixed
     */
    private function getWeightedRandom(array $items, array $weights)
    {
        $totalWeight = array_sum($weights);
        $random = rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($items as $index => $item) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $item;
            }
        }
        
        return $items[0];
    }
}