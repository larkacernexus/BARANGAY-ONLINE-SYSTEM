<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('code')->unique();
            $table->string('name');
            $table->string('short_name')->nullable();
            
            // Categorization
            $table->enum('category', [
                'tax',           // Taxes (Business, Property)
                'clearance',     // Barangay Clearances
                'certificate',   // Certificates (Indigency, Residency)
                'service',       // Services (Document Processing)
                'rental',        // Facility Rentals
                'fine',          // Ordinance Violations
                'contribution',  // Community Contributions
                'other'          // Other Fees
            ])->default('other');
            
            // Pricing
            $table->decimal('base_amount', 10, 2);
            $table->enum('amount_type', ['fixed', 'variable', 'computed'])->default('fixed');
            $table->json('computation_formula')->nullable(); // For computed fees
            $table->string('unit')->nullable(); // e.g., per square meter, per month
            
            // Discounts & Exemptions
            $table->boolean('has_senior_discount')->default(false);
            $table->boolean('has_pwd_discount')->default(false);
            $table->boolean('has_solo_parent_discount')->default(false);
            $table->boolean('has_indigent_discount')->default(false);
            $table->decimal('discount_percentage', 5, 2)->nullable(); // Default discount rate
            
            // Late Payment Rules
            $table->boolean('has_surcharge')->default(false);
            $table->decimal('surcharge_percentage', 5, 2)->nullable(); // % per month
            $table->decimal('surcharge_fixed', 10, 2)->nullable(); // OR fixed amount
            
            $table->boolean('has_penalty')->default(false);
            $table->decimal('penalty_percentage', 5, 2)->nullable();
            $table->decimal('penalty_fixed', 10, 2)->nullable();
            
            // Validity & Frequency
            $table->enum('frequency', [
                'one_time',
                'monthly',
                'quarterly',
                'semi_annual',
                'annual',
                'bi_annual',
                'custom'
            ])->default('one_time');
            
            $table->integer('validity_days')->nullable(); // For clearances/certificates
            
            // Applicability
            $table->enum('applicable_to', [
                'all_residents',
                'property_owners',
                'business_owners',
                'households',
                'specific_purok',
                'specific_zone',
                'visitors'
            ])->default('all_residents');
            
            $table->json('applicable_puroks')->nullable(); // If limited to specific puroks
            
            // Requirements
            $table->json('requirements')->nullable(); // Required documents
            $table->string('approval_needed')->nullable(); // captain, treasurer, etc.
            
            // Timing
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            
            // Status & Management
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('auto_generate')->default(false); // Auto-generate bills
            $table->integer('due_day')->nullable(); // Day of month due (for recurring)
            
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['category', 'is_active']);
            $table->index('code');
            $table->index('applicable_to');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_types');
    }
};