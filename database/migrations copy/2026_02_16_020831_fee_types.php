<?php
// database/migrations/2024_01_01_000030_create_fee_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            
            $table->string('code')->unique();
            $table->foreignId('document_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->string('amount_type')->default('fixed')->comment('fixed, computed');
            $table->json('computation_formula')->nullable();
            $table->string('unit')->nullable();
            
            $table->boolean('is_discountable')->default(true);
            
            // Surcharge
            $table->boolean('has_surcharge')->default(false);
            $table->decimal('surcharge_percentage', 5, 2)->nullable();
            $table->decimal('surcharge_fixed', 12, 2)->nullable();
            
            // Penalty
            $table->boolean('has_penalty')->default(false);
            $table->decimal('penalty_percentage', 5, 2)->nullable();
            $table->decimal('penalty_fixed', 12, 2)->nullable();
            
            // Applicability
            $table->string('frequency')->nullable()
                ->comment('one_time, monthly, quarterly, semi_annual, annual');
            $table->integer('validity_days')->nullable();
            $table->string('applicable_to')->nullable()
                ->comment('all_residents, property_owners, business_owners, households');
            $table->json('applicable_puroks')->nullable();
            $table->json('requirements')->nullable();
            
            // Validity
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('auto_generate')->default(false);
            $table->integer('due_day')->nullable()
                ->comment('Day of month when payment is due');
            
            // Metadata
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('document_category_id');
            $table->index('is_active');
            $table->index('is_discountable');
            $table->index('applicable_to');
            $table->index('effective_date');
            $table->index('expiry_date');
            $table->index('sort_order');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_types');
    }
};
