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
        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_id')->constrained('fees');
            $table->string('fee_name');
            $table->string('fee_code');
            $table->text('description')->nullable();
            $table->decimal('base_amount', 12, 2);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('penalty', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('category');
            $table->string('period_covered')->nullable();
            $table->integer('months_late')->nullable();
            $table->json('fee_metadata')->nullable()->comment('Original fee data at time of payment');
            $table->timestamps();
            
            // Indexes
            $table->index('fee_id');
            $table->index('category');
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
