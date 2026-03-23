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
        Schema::create('payment_items', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('payment_id')->nullable()->default(NULL);
            $table->bigInteger('fee_id')->nullable()->default(NULL);
            $table->bigInteger('discount_type_id')->nullable()->default(NULL);
            $table->bigInteger('original_fee_id')->nullable()->default(NULL);
            $table->string('fee_name', 255)->nullable()->default(NULL);
            $table->string('fee_code', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->decimal('base_amount', 10, 2);
            $table->decimal('surcharge', 10, 2);
            $table->decimal('penalty', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2);
            $table->string('discount_type', 255)->nullable()->default(NULL);
            $table->text('discount_breakdown')->nullable()->default(NULL);
            $table->string('category', 255)->nullable()->default(NULL);
            $table->string('period_covered', 255)->nullable()->default(NULL);
            $table->integer('months_late')->nullable()->default(NULL);
            $table->text('fee_metadata')->nullable()->default(NULL);
            $table->bigInteger('clearance_request_id')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_items');
    }
};