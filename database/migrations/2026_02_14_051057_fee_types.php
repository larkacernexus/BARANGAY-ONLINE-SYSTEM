<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('code')->unique();
            $table->foreignId('document_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('short_name')->nullable();
            
            // Amount Configuration
            $table->decimal('base_amount', 10, 2)->default(0);
            $table->enum('amount_type', ['fixed', 'computed', 'range', 'per_unit'])->default('fixed');
            $table->json('computation_formula')->nullable(); // For computed amounts
            $table->string('unit')->nullable(); // e.g., 'per_clearance', 'per_page', 'per_business'
            
            // Discount Configuration (simplified - just a flag)
            $table->boolean('is_discountable')->default(true);
            
            // Surcharge Configuration
            $table->boolean('has_surcharge')->default(false);
            $table->decimal('surcharge_percentage', 5, 2)->nullable();
            $table->decimal('surcharge_fixed', 10, 2)->nullable();
            
            // Penalty Configuration
            $table->boolean('has_penalty')->default(false);
            $table->decimal('penalty_percentage', 5, 2)->nullable();
            $table->decimal('penalty_fixed', 10, 2)->nullable();
            
            // Validity and Frequency
            $table->enum('frequency', [
                'one_time', 
                'monthly', 
                'quarterly', 
                'semi_annual', 
                'annual', 
                'bi_annual',
                'custom'
            ])->default('one_time');
            $table->integer('validity_days')->nullable(); // How long the payment is valid
            
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
            $table->json('applicable_puroks')->nullable(); // Specific puroks if applicable
            
            // Requirements
            $table->json('requirements')->nullable(); // Required documents or conditions
            
            // Dates
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(false); // Is this fee mandatory?
            $table->boolean('auto_generate')->default(false); // Auto-generate fee for all residents?
            $table->integer('due_day')->nullable(); // For recurring fees, day of month due
            
            // Display
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('code');
            $table->index('is_active');
            $table->index('frequency');
            $table->index('applicable_to');
            $table->index(['effective_date', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_types');
    }
};