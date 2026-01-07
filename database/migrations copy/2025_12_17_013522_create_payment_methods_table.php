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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // e.g., 'credit_card', 'gcash', 'paypal', 'bank_transfer'
            $table->string('provider'); // e.g., 'Visa', 'Mastercard', 'GCash', 'BDO'
            $table->string('account_number')->nullable(); // Last 4 digits for cards, phone number for GCash
            $table->string('account_name');
            $table->date('expiry_date')->nullable(); // For credit cards
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable(); // Additional payment details
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['resident_id', 'is_active']);
            $table->index(['resident_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};