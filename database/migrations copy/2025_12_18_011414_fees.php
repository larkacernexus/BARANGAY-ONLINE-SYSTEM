<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            
            // Reference to Fee Type
            $table->foreignId('fee_type_id')->constrained()->onDelete('restrict');
            $table->string('fee_code'); // Copy from fee_type for easy reference
            
            // Payer Information
            $table->enum('payer_type', ['resident', 'business', 'household', 'visitor', 'other'])->default('resident');
            $table->foreignId('resident_id')->nullable()->constrained()->onDelete('restrict');
            $table->foreignId('household_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('business_name')->nullable(); // For business payers
            
            // Payer Details (cached for reference)
            $table->string('payer_name');
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->string('purok')->nullable();
            $table->string('zone')->nullable();
            
            // Billing Details
            $table->string('billing_period')->nullable(); // e.g., "January 2024", "Q1 2024"
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->date('issue_date');
            $table->date('due_date');
            
            // Amount Details
            $table->decimal('base_amount', 10, 2);
            $table->decimal('surcharge_amount', 10, 2)->default(0);
            $table->decimal('penalty_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->enum('discount_type', ['senior', 'pwd', 'solo_parent', 'indigent', 'other'])->nullable();
            $table->decimal('total_amount', 10, 2);
            
            // Payment Status
            $table->enum('status', [
                'pending',          // Not yet issued
                'issued',           // Bill issued
                'partially_paid',   // Partial payment
                'paid',             // Fully paid
                'overdue',          // Past due date
                'cancelled',        // Cancelled bill
                'waived',           // Waived/free
                'written_off'       // Written off as bad debt
            ])->default('pending');
            
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('balance', 10, 2);
            
            // Payment Details (when paid)
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->string('or_number')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('transaction_reference')->nullable();
            
            // For Clearances/Certificates
            $table->string('certificate_number')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('purpose')->nullable(); // Purpose of clearance/certificate
            
            // For Property/Business Taxes
            $table->string('property_description')->nullable();
            $table->string('business_type')->nullable();
            $table->decimal('area', 10, 2)->nullable(); // For property tax
            
            // Barangay Processing
            $table->foreignId('issued_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('collected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Additional Information
            $table->json('computation_details')->nullable(); // How amount was calculated
            $table->json('requirements_submitted')->nullable(); // Submitted documents
            $table->text('remarks')->nullable();
            $table->text('waiver_reason')->nullable();
            
            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for Performance
            $table->index(['resident_id', 'status']);
            $table->index(['household_id', 'status']);
            $table->index(['payer_type', 'status']);
            $table->index('due_date');
            $table->index('status');
            $table->index('or_number');
            $table->index('purok');
            $table->index('fee_type_id');
            $table->index('payment_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fees');
    }
};