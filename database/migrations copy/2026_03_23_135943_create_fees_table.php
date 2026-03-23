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
        Schema::create('fees', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('fee_type_id')->nullable()->default(NULL);
            $table->string('payer_type', 255)->nullable()->default(NULL);
            $table->bigInteger('payer_id')->nullable()->default(NULL);
            $table->string('payer_model', 255)->nullable()->default(NULL);
            $table->string('payer_name', 255)->nullable()->default(NULL);
            $table->string('business_name', 255)->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->string('address', 255)->nullable()->default(NULL);
            $table->string('purok', 255)->nullable()->default(NULL);
            $table->string('zone', 255)->nullable()->default(NULL);
            $table->string('billing_period', 255)->nullable()->default(NULL);
            $table->date('period_start')->nullable()->default(NULL);
            $table->date('period_end')->nullable()->default(NULL);
            $table->date('issue_date')->nullable()->default(NULL);
            $table->date('due_date')->nullable()->default(NULL);
            $table->decimal('base_amount', 10, 2);
            $table->decimal('surcharge_amount', 10, 2);
            $table->decimal('penalty_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2);
            $table->string('discount_type', 255)->nullable()->default(NULL);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2);
            $table->decimal('balance', 10, 2);
            $table->string('purpose', 255)->nullable()->default(NULL);
            $table->text('property_description')->nullable()->default(NULL);
            $table->string('business_type', 255)->nullable()->default(NULL);
            $table->decimal('area', 10, 2);
            $table->text('remarks')->nullable()->default(NULL);
            $table->text('requirements_submitted')->nullable()->default(NULL);
            $table->string('status', 255)->nullable()->default(NULL);
            $table->string('fee_code', 255)->nullable()->default(NULL);
            $table->string('or_number', 255)->nullable()->default(NULL);
            $table->string('certificate_number', 255)->nullable()->default(NULL);
            $table->date('valid_from')->nullable()->default(NULL);
            $table->date('valid_until')->nullable()->default(NULL);
            $table->bigInteger('issued_by')->nullable()->default(NULL);
            $table->bigInteger('collected_by')->nullable()->default(NULL);
            $table->bigInteger('cancelled_by')->nullable()->default(NULL);
            $table->bigInteger('created_by')->nullable()->default(NULL);
            $table->bigInteger('updated_by')->nullable()->default(NULL);
            $table->string('waiver_reason', 255)->nullable()->default(NULL);
            $table->timestamp('cancelled_at')->nullable()->default(NULL);
            $table->string('batch_reference', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};