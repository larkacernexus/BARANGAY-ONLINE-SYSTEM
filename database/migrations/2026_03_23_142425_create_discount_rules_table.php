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
        Schema::create('discount_rules', function (Blueprint $table) {
            $table->id();
            $table->string('code', 255)->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('discount_type', 255)->nullable()->default(NULL);
            $table->string('value_type', 255)->nullable();
            $table->decimal('discount_value', 10, 2);
            $table->decimal('maximum_discount_amount', 10, 2)->nullable()->default(NULL);
            $table->decimal('minimum_purchase_amount', 10, 2)->nullable()->default(NULL);
            $table->integer('priority')->nullable()->default(NULL);
            $table->integer('requires_verification')->nullable()->default(NULL);
            $table->string('verification_document', 255)->nullable()->default(NULL);
            $table->string('applicable_to', 255)->nullable()->default(NULL);
            $table->text('applicable_puroks')->nullable()->default(NULL);
            $table->integer('stackable')->nullable()->default(NULL);
            $table->text('exclusive_with')->nullable()->default(NULL);
            $table->date('effective_date')->nullable()->default(NULL);
            $table->date('expiry_date')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('sort_order')->nullable()->default(NULL);
            $table->text('notes')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_rules');
    }
};