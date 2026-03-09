<?php
// database/migrations/2024_01_01_000037_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            
            $table->string('status')->default('completed')
                ->comment('pending, partially_paid, completed, cancelled, refunded');
            
            $table->string('collection_type')->default('manual')
                ->comment('manual, online, mobile, system');
            
            $table->string('or_number')->nullable()->unique();
            
            // Payer info (polymorphic)
            $table->string('payer_type')->nullable()->comment('resident, household');
            $table->unsignedBigInteger('payer_id')->nullable();
            $table->string('payer_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->string('household_number')->nullable();
            $table->string('purok')->nullable();
            
            $table->dateTime('payment_date')->nullable();
            $table->string('period_covered')->nullable();
            $table->string('payment_method')->nullable()
                ->comment('cash, gcash, maya, bank, check, online');
            $table->string('reference_number')->nullable();
            
            // Amounts
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('penalty', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0)
                ->comment('Discount amount applied');
            $table->decimal('total_amount', 12, 2)->default(0)
                ->comment('subtotal + surcharge + penalty (BEFORE discount)');
            $table->decimal('amount_paid', 12, 2)->default(0)
                ->comment('Actual cash received from payer');
            
            $table->string('purpose')->nullable();
            $table->text('remarks')->nullable();
            
            $table->boolean('is_cleared')->default(false);
            $table->string('clearance_code')->nullable();
            $table->string('certificate_type')->nullable();
            $table->date('validity_date')->nullable();
            
            $table->json('method_details')->nullable();
            $table->foreignId('recorded_by')->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            // Discount tracking
            $table->string('discount_code')->nullable()
                ->comment('For tracking which discount was applied');
            $table->string('discount_type')->nullable()
                ->comment('Type of discount (percentage/fixed)');
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('or_number'); // redundant but safe
            $table->index('status');
            $table->index('collection_type');
            $table->index(['payer_type', 'payer_id']);
            $table->index('payer_name');
            $table->index('payment_date');
            $table->index('payment_method');
            $table->index('reference_number');
            $table->index('recorded_by');
            $table->index('is_cleared');
            $table->index('clearance_code');
            $table->index('discount_code');
            $table->index(['payment_date', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
