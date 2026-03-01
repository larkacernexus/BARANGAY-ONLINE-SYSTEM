<?php
// database/migrations/2024_01_01_000028_create_fees_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            
            // Basic identification
            $table->foreignId('fee_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('fee_code')->nullable();
            $table->string('certificate_number')->nullable()->unique();
            $table->string('or_number')->nullable();
            
            // Payer info (polymorphic)
            $table->string('payer_type')->nullable();
            $table->unsignedBigInteger('payer_id')->nullable();
            $table->string('payer_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->string('purok')->nullable();
            $table->string('zone')->nullable();
            
            // Timing
            $table->date('issue_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            
            // Amounts
            $table->decimal('base_amount', 12, 2)->default(0)->comment('Original amount before discounts');
            $table->decimal('total_discounts', 12, 2)->default(0)->comment('Sum of all discounts applied');
            $table->decimal('surcharge_amount', 12, 2)->default(0)->comment('Calculated surcharge');
            $table->decimal('penalty_amount', 12, 2)->default(0)->comment('Calculated penalty');
            $table->decimal('total_amount', 12, 2)->default(0)->comment('base_amount - total_discounts + surcharge + penalty');
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            
            // Status
            $table->string('status')->default('draft')
                ->comment('draft, issued, pending_payment, partially_paid, paid, cancelled, waived');
            
            // Fee-specific data (store as JSON for flexibility)
            $table->json('metadata')->nullable()
                ->comment('business_type, area, property_description, etc.');
            
            // Audit
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('collected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            
            // Metadata
            $table->text('remarks')->nullable();
            $table->string('batch_reference')->nullable();
            $table->json('requirements_submitted')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('fee_type_id');
            $table->index('fee_code');
            $table->index('certificate_number');
            $table->index('or_number');
            $table->index(['payer_type', 'payer_id']);
            $table->index('payer_name');
            $table->index('purok');
            $table->index('zone');
            $table->index('issue_date');
            $table->index('due_date');
            $table->index('valid_until');
            $table->index('status');
            $table->index('batch_reference');
            $table->index('cancelled_by');
            $table->index('cancelled_at');
            $table->index(['status', 'due_date']);
            $table->index(['payer_type', 'payer_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('fees');
    }
};
