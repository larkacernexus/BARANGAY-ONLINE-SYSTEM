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
        // database/migrations/xxxx_merge_clearance_tables.php
Schema::create('clearance_requests', function (Blueprint $table) {
    // Existing request fields
    $table->id();
    $table->foreignId('resident_id')->constrained();
    $table->foreignId('clearance_type_id')->constrained();
    $table->string('reference_number')->unique();
    $table->string('purpose');
    $table->string('specific_purpose')->nullable();
    $table->enum('urgency', ['normal', 'rush', 'express'])->default('normal');
    $table->date('needed_date');
    $table->text('additional_requirements')->nullable();
    $table->decimal('fee_amount', 10, 2)->default(0);
    
    // Status flow: pending → processing → approved/rejected/cancelled
    $table->enum('status', [
        'pending',           // Request submitted
        'pending_payment',   // Waiting for payment
        'processing',        // Under review
        'approved',          // Approved but not yet issued
        'issued',            // Clearance printed/given (FINAL)
        'rejected',          // Denied
        'cancelled',         // Cancelled by resident
        'expired'            // Validity expired
    ])->default('pending');
    
    // Admin fields (populated when processed)
    $table->string('clearance_number')->nullable()->unique();
    $table->date('issue_date')->nullable();
    $table->date('valid_until')->nullable();
    $table->json('requirements_met')->nullable();
    $table->text('remarks')->nullable();
    $table->string('issuing_officer')->nullable(); // Who approved/issued
    $table->foreignId('processed_by')->nullable()->constrained('users');
    $table->timestamp('processed_at')->nullable();
    
    // Rejection/Cancellation
    $table->text('admin_notes')->nullable();
    $table->text('cancellation_reason')->nullable();
    
    // Tracking
    $table->foreignId('requested_by_user_id')->nullable()->constrained('users');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
