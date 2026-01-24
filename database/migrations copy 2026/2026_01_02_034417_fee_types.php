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
            
            // Basic information
            $table->string('code', 20)->unique();
            $table->string('name', 255);
            $table->string('short_name', 50)->nullable();
            $table->enum('category', ['tax', 'clearance', 'certificate', 'service', 'rental', 'fine', 'contribution', 'other']);
            $table->decimal('base_amount', 10, 2);
            $table->enum('amount_type', ['fixed', 'per_unit', 'computed']);
            $table->json('computation_formula')->nullable();
            $table->string('unit', 50)->nullable();
            $table->text('description')->nullable();
            
            // Discount configurations
            $table->boolean('has_senior_discount')->default(false);
            $table->decimal('senior_discount_percentage', 5, 2)->nullable();
            
            $table->boolean('has_pwd_discount')->default(false);
            $table->decimal('pwd_discount_percentage', 5, 2)->nullable();
            
            $table->boolean('has_solo_parent_discount')->default(false);
            $table->decimal('solo_parent_discount_percentage', 5, 2)->nullable();
            
            $table->boolean('has_indigent_discount')->default(false);
            $table->decimal('indigent_discount_percentage', 5, 2)->nullable();
            
            // Late payment configurations
            $table->boolean('has_surcharge')->default(false);
            $table->decimal('surcharge_percentage', 5, 2)->nullable();
            $table->decimal('surcharge_fixed', 10, 2)->nullable();
            
            $table->boolean('has_penalty')->default(false);
            $table->decimal('penalty_percentage', 5, 2)->nullable();
            $table->decimal('penalty_fixed', 10, 2)->nullable();
            
            // Frequency and validity
            $table->enum('frequency', ['one_time', 'monthly', 'quarterly', 'semi_annual', 'annual', 'as_needed']);
            $table->integer('validity_days')->nullable();
            
            // Applicability
            $table->enum('applicable_to', ['all_residents', 'businesses', 'households', 'specific_purok', 'visitors', 'other']);
            $table->json('applicable_puroks')->nullable();
            $table->json('requirements')->nullable();
            
            // Dates
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            
            // Settings
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('auto_generate')->default(false);
            $table->integer('due_day')->nullable();
            $table->integer('sort_order')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_types');
    }
};