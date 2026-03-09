<?php
// database/migrations/2024_01_01_000008_create_clearance_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clearance_requests', function (Blueprint $table) {
            $table->id();
            
            // Resident & Type
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->foreignId('clearance_type_id')->constrained()->cascadeOnDelete();
            
            // Request Details
            $table->string('reference_number')->unique();
            $table->string('purpose');
            $table->string('specific_purpose')->nullable();
            $table->string('urgency')->default('normal')->comment('normal, rush, express');
            $table->date('needed_date')->nullable();
            $table->json('additional_requirements')->nullable();
            $table->decimal('fee_amount', 12, 2)->default(0);
            
            // Status
            $table->string('status')->default('pending')
                ->comment('pending, processing, approved, issued, rejected, cancelled, pending_payment, expired');
            
            // Clearance Issuance Details
            $table->string('clearance_number')->nullable()->unique();
            $table->date('issue_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->json('requirements_met')->nullable();
            $table->text('remarks')->nullable();
            
            // Officer Information
            $table->foreignId('issuing_officer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('issuing_officer_name')->nullable();
            
            // Processing Details
            $table->text('admin_notes')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index('resident_id');
            $table->index('clearance_type_id');
            $table->index('reference_number');
            $table->index('status');
            $table->index('urgency');
            $table->index('issue_date');
            $table->index('valid_until');
            $table->index('issuing_officer_id');
            $table->index('processed_by');
            $table->index(['status', 'created_at']);
            $table->index(['resident_id', 'status']);
            $table->index(['clearance_type_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('clearance_requests');
    }
};