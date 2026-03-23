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
        Schema::create('receipts', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('receipt_number', 255)->nullable()->default(NULL);
            $table->bigInteger('receiptable_id')->nullable()->default(NULL);
            $table->string('receiptable_type', 255)->nullable()->default(NULL);
            $table->bigInteger('payment_id')->nullable()->default(NULL);
            $table->string('or_number', 255)->nullable()->default(NULL);
            $table->string('receipt_type', 255)->nullable();
            $table->string('payer_name', 255)->nullable()->default(NULL);
            $table->string('payer_address', 255)->nullable()->default(NULL);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('surcharge', 10, 2);
            $table->decimal('penalty', 10, 2);
            $table->decimal('discount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2);
            $table->decimal('change_due', 10, 2);
            $table->string('payment_method', 255)->nullable()->default(NULL);
            $table->string('reference_number', 255)->nullable()->default(NULL);
            $table->timestamp('payment_date')->nullable()->default(NULL);
            $table->timestamp('issued_date')->nullable()->default(NULL);
            $table->bigInteger('issued_by')->nullable()->default(NULL);
            $table->text('fee_breakdown')->nullable()->default(NULL);
            $table->text('discount_breakdown')->nullable()->default(NULL);
            $table->text('metadata')->nullable()->default(NULL);
            $table->integer('is_voided')->nullable();
            $table->text('void_reason')->nullable()->default(NULL);
            $table->bigInteger('voided_by')->nullable()->default(NULL);
            $table->timestamp('voided_at')->nullable()->default(NULL);
            $table->integer('printed_count')->nullable();
            $table->timestamp('last_printed_at')->nullable()->default(NULL);
            $table->integer('email_sent')->nullable();
            $table->timestamp('email_sent_at')->nullable()->default(NULL);
            $table->integer('sms_sent')->nullable();
            $table->timestamp('sms_sent_at')->nullable()->default(NULL);
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
        Schema::dropIfExists('receipts');
    }
};