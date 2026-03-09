<?php
// database/migrations/2024_01_01_000001_create_receipts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique();
            
            // Polymorphic relationship for receiptable (Fee or ClearanceRequest)
            $table->nullableMorphs('receiptable'); // receiptable_id and receiptable_type
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('or_number')->nullable();
            $table->string('receipt_type')->default('official');
            $table->string('payer_name');
            $table->string('payer_address')->nullable();
            
            // Financial breakdown
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('surcharge', 10, 2)->default(0);
            $table->decimal('penalty', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('change_due', 10, 2)->default(0);
            
            // Payment details
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->timestamp('payment_date')->nullable();
            $table->timestamp('issued_date');
            
            // Tracking
            $table->foreignId('issued_by')->nullable()->constrained('users');
            
            // JSON breakdowns for storing snapshot data
            $table->json('fee_breakdown')->nullable(); // Store fee details at time of payment
            $table->json('discount_breakdown')->nullable(); // Store discount details
            $table->json('metadata')->nullable(); // Additional data
            
            // Void information
            $table->boolean('is_voided')->default(false);
            $table->text('void_reason')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users');
            $table->timestamp('voided_at')->nullable();
            
            // Printing
            $table->integer('printed_count')->default(0);
            $table->timestamp('last_printed_at')->nullable();
            
            // Communication
            $table->boolean('email_sent')->default(false);
            $table->timestamp('email_sent_at')->nullable();
            $table->boolean('sms_sent')->default(false);
            $table->timestamp('sms_sent_at')->nullable();
            
            // Additional
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('receipt_number');
            $table->index('or_number');
            $table->index('payer_name');
            $table->index('issued_date');
            $table->index('is_voided');
            $table->index('payment_method');
            $table->index('receipt_type');
            $table->index(['receiptable_type', 'receiptable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('receipts');
    }
};