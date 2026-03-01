<?php
// database/migrations/2024_01_01_000022_create_discount_rules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('discount_rules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('discount_type')->comment('SENIOR, PWD, SOLO_PARENT, INDIGENT, VETERAN, STUDENT');
            $table->string('value_type')->default('percentage')->comment('percentage, fixed');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('maximum_discount_amount', 12, 2)->nullable();
            $table->decimal('minimum_purchase_amount', 12, 2)->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('requires_verification')->default(true);
            $table->string('verification_document')->nullable();
            $table->string('applicable_to')->default('resident')->comment('resident, household, business');
            $table->json('applicable_puroks')->nullable();
            $table->boolean('stackable')->default(false);
            $table->json('exclusive_with')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('discount_type');
            $table->index('value_type');
            $table->index('is_active');
            $table->index('priority');
            $table->index('effective_date');
            $table->index('expiry_date');
            $table->index(['discount_type', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('discount_rules');
    }
};