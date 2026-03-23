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
        Schema::create('businesses', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('business_name', 255)->nullable()->default(NULL);
            $table->string('business_type', 255)->nullable()->default(NULL);
            $table->bigInteger('owner_id')->nullable()->default(NULL);
            $table->string('owner_name', 255)->nullable()->default(NULL);
            $table->string('dti_sec_number', 255)->nullable()->default(NULL);
            $table->string('tin_number', 255)->nullable()->default(NULL);
            $table->string('mayors_permit_number', 255)->nullable()->default(NULL);
            $table->text('address')->nullable()->default(NULL);
            $table->bigInteger('purok_id')->nullable()->default(NULL);
            $table->decimal('capital_amount', 10, 2);
            $table->decimal('monthly_gross', 10, 2);
            $table->integer('employee_count')->nullable()->default(NULL);
            $table->date('permit_expiry_date')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};