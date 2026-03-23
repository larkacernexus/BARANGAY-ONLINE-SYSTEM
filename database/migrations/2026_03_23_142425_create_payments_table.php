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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('or_number', 255)->nullable()->default(NULL);
            $table->string('payer_type', 255)->nullable();
            $table->bigInteger('payer_id')->nullable()->default(NULL);
            $table->string('payer_name', 255)->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->string('address', 255)->nullable()->default(NULL);
            $table->string('household_number', 255)->nullable()->default(NULL);
            $table->string('purok', 255)->nullable()->default(NULL);
            $table->dateTime('payment_date')->nullable()->default(NULL);
            $table->string('period_covered', 255)->nullable()->default(NULL);
            $table->string('payment_method', 255)->nullable();
            $table->string('reference_number', 255)->nullable()->default(NULL);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('surcharge', 10, 2);
            $table->decimal('penalty', 10, 2);
            $table->decimal('discount', 10, 2);
            $table->string('discount_code', 255)->nullable()->default(NULL);
            $table->string('discount_type', 255)->nullable()->default(NULL);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2);
            $table->text('purpose')->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->integer('is_cleared')->nullable()->default(NULL);
            $table->string('clearance_code', 255)->nullable()->default(NULL);
            $table->string('certificate_type', 255)->nullable()->default(NULL);
            $table->date('validity_date')->nullable()->default(NULL);
            $table->string('collection_type', 255)->nullable();
            $table->string('status', 255)->nullable()->default(NULL);
            $table->text('method_details')->nullable()->default(NULL);
            $table->bigInteger('recorded_by')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};