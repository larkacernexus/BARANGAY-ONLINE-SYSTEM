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
         Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('or_number')->unique()->comment('Official Receipt Number');
            $table->enum('payer_type', ['resident', 'household', 'business', 'other']);
            $table->unsignedBigInteger('payer_id');
            $table->string('payer_name');
            $table->string('contact_number')->nullable();
            $table->string('address')->nullable();
            $table->string('house_number')->nullable();
            $table->string('purok')->nullable();
            $table->date('payment_date');
            $table->string('period_covered')->nullable();
            $table->enum('payment_method', ['cash', 'gcash', 'maya', 'bank', 'check', 'online']);
            $table->string('reference_number')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('penalty', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->string('discount_type')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->text('purpose');
            $table->text('remarks')->nullable();
            $table->boolean('is_cleared')->default(false);
            $table->string('certificate_type')->nullable();
            $table->date('validity_date')->nullable();
            $table->enum('collection_type', ['manual', 'system'])->default('manual');
            $table->string('status')->default('completed')->comment('pending, completed, cancelled, refunded');
            $table->json('method_details')->nullable()->comment('Stores payment method specific details');
            $table->foreignId('recorded_by')->constrained('users')->comment('Who recorded the payment');
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['payer_type', 'payer_id']);
            $table->index('payment_date');
            $table->index('or_number');
            $table->index('status');
            $table->index('payment_method');
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
