<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();

            // Fee classification
            $table->foreignId('fee_type_id')
                ->constrained('fee_types')
                ->cascadeOnDelete();

            // Polymorphic payer
            $table->string('payer_type')->nullable();          // resident, household, business, other
            $table->unsignedBigInteger('payer_id')->nullable();
            $table->string('payer_model')->nullable();         // App\Models\Resident, Household, Business

            // Payer info snapshot
            $table->string('payer_name')->nullable();
            $table->string('business_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('address')->nullable();
            $table->string('purok')->nullable();
            $table->string('zone')->nullable();

            // Billing / period info
            $table->string('billing_period')->nullable();
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();

            // Dates
            $table->date('issue_date')->nullable();
            $table->date('due_date')->nullable();

            // Amounts
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->decimal('surcharge_amount', 12, 2)->default(0);
            $table->decimal('penalty_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('discount_type')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);

            // Purpose / description
            $table->string('purpose')->nullable();
            $table->text('property_description')->nullable();
            $table->string('business_type')->nullable();
            $table->decimal('area', 10, 2)->nullable();
            $table->text('remarks')->nullable();

            // Requirements
            $table->json('requirements_submitted')->nullable();

            // Status & references
            $table->string('status')->default('pending');
            $table->string('fee_code')->nullable();
            $table->string('or_number')->nullable();
            $table->string('certificate_number')->nullable();

            // Validity
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();

            // Audit / control
            $table->unsignedBigInteger('issued_by')->nullable();
            $table->unsignedBigInteger('collected_by')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->string('waiver_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Batch reference (community / household-wide fees)
            $table->string('batch_reference')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['payer_id', 'payer_model']);
            $table->index('payer_type');
            $table->index('batch_reference');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};
