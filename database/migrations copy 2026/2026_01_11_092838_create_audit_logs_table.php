<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            // Primary Key
            $table->id();
            
            // User Information (Who performed the action)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_name')->nullable(); // Store name separately in case user is deleted
            $table->string('user_position')->nullable(); // Barangay position (Captain, Secretary, Treasurer, etc.)
            
            // Action Details
            $table->string('event_type'); // CRUD operations: created, updated, deleted, viewed, exported
            $table->string('event_category'); // Financial, Resident, Document, System, Security
            $table->string('event'); // Specific event name
            $table->text('description');
            
            // Target/Subject Information (What was affected)
            $table->string('subject_type')->nullable(); // Model/Table name (Payment, Resident, Clearance, etc.)
            $table->unsignedBigInteger('subject_id')->nullable(); // ID of affected record
            $table->string('subject_name')->nullable(); // Name/title of affected record
            
            // For Barangay-specific tracking
            $table->string('barangay_id')->nullable(); // If multiple barangays share system
            $table->string('office')->nullable(); // Barangay office/section (Treasury, Secretariat, etc.)
            $table->string('document_number')->nullable(); // OR Number, Clearance Number, etc.
            
            // Action Properties (What changed)
            $table->json('old_values')->nullable(); // Old data before change
            $table->json('new_values')->nullable(); // New data after change
            $table->json('properties')->nullable(); // Additional metadata
            
            // Severity & Status
            $table->enum('severity', ['info', 'warning', 'error', 'critical'])->default('info');
            $table->enum('status', ['success', 'failed', 'pending'])->default('success');
            
            // Location & Device Info (Important for security)
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_type')->nullable(); // Desktop, Mobile, Tablet
            $table->string('platform')->nullable(); // Windows, Android, iOS
            $table->string('browser')->nullable(); // Chrome, Firefox, etc.
            
            // Philippine Government Requirements
            $table->string('or_number')->nullable(); // Official Receipt Number (for financial logs)
            $table->decimal('amount', 12, 2)->nullable(); // Amount involved (for financial logs)
            $table->string('transaction_type')->nullable(); // Payment, Refund, Adjustment
            
            // Timestamps
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();
            
            // Indexes for Performance (Critical for barangay with many records)
            $table->index(['user_id', 'logged_at']);
            $table->index(['event_category', 'logged_at']);
            $table->index(['event_type', 'logged_at']);
            $table->index(['subject_type', 'subject_id']);
            $table->index(['severity', 'logged_at']);
            $table->index('document_number');
            $table->index('or_number');
            $table->index('office');
            $table->index(['barangay_id', 'logged_at']);
            
            // Full-text search index for descriptions
            $table->fullText(['description', 'event', 'subject_name']);
        });
        
        // Optional: Create separate table for financial audit trail (COA compliance)
        Schema::create('financial_audit_trails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_log_id')->constrained('audit_logs')->onDelete('cascade');
            $table->string('fund_source')->nullable(); // General Fund, SK Fund, etc.
            $table->string('account_code')->nullable(); // COA account code
            $table->string('particulars')->nullable(); // Detailed description
            $table->string('payee')->nullable(); // Who received payment
            $table->string('voucher_number')->nullable(); // Disbursement voucher number
            $table->date('transaction_date');
            $table->decimal('debit', 12, 2)->nullable();
            $table->decimal('credit', 12, 2)->nullable();
            $table->decimal('balance', 12, 2)->nullable();
            $table->string('approved_by')->nullable(); // Who approved transaction
            $table->string('received_by')->nullable(); // Who received (for disbursements)
            $table->timestamps();
            
            $table->index(['transaction_date', 'account_code']);
            $table->index('voucher_number');
            $table->index('or_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('financial_audit_trails');
        Schema::dropIfExists('audit_logs');
    }
};