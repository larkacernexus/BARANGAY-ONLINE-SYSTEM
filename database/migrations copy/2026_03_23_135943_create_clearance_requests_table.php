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
        Schema::create('clearance_requests', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('payer_type', 255)->nullable()->default(NULL);
            $table->bigInteger('payer_id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->bigInteger('household_id')->nullable()->default(NULL);
            $table->bigInteger('clearance_type_id')->nullable()->default(NULL);
            $table->string('reference_number', 255)->nullable()->default(NULL);
            $table->string('purpose', 255)->nullable()->default(NULL);
            $table->string('specific_purpose', 255)->nullable()->default(NULL);
            $table->string('urgency', 255)->nullable();
            $table->date('needed_date')->nullable()->default(NULL);
            $table->text('additional_requirements')->nullable()->default(NULL);
            $table->decimal('fee_amount', 10, 2);
            $table->string('status', 255)->nullable();
            $table->bigInteger('payment_id')->nullable()->default(NULL);
            $table->string('payment_status', 255)->nullable();
            $table->decimal('amount_paid', 10, 2);
            $table->decimal('balance', 10, 2);
            $table->dateTime('payment_date')->nullable()->default(NULL);
            $table->string('or_number', 255)->nullable()->default(NULL);
            $table->string('clearance_number', 255)->nullable()->default(NULL);
            $table->date('issue_date')->nullable()->default(NULL);
            $table->date('valid_until')->nullable()->default(NULL);
            $table->text('requirements_met')->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->string('contact_name', 255)->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->text('contact_address')->nullable()->default(NULL);
            $table->bigInteger('contact_purok_id')->nullable()->default(NULL);
            $table->string('contact_email', 255)->nullable()->default(NULL);
            $table->string('issuing_officer_name', 255)->nullable()->default(NULL);
            $table->bigInteger('processed_by')->nullable()->default(NULL);
            $table->timestamp('processed_at')->nullable()->default(NULL);
            $table->text('admin_notes')->nullable()->default(NULL);
            $table->text('cancellation_reason')->nullable()->default(NULL);
            $table->bigInteger('requested_by_user_id')->nullable()->default(NULL);
            $table->bigInteger('issuing_officer_id')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clearance_requests');
    }
};