<?php
// database/migrations/2024_01_01_000029_create_fee_discounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fee_discounts', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('fee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('discount_type_id')->constrained()->nullOnDelete();
            $table->foreignId('special_discount_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('special_discount_application_id')->nullable()->constrained()->nullOnDelete();
            
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('base_amount', 12, 2)->default(0);
            
            $table->text('notes')->nullable();
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('applied_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('fee_id');
            $table->index('discount_type_id');
            $table->index('special_discount_id');
            $table->index('special_discount_application_id');
            $table->index('applied_by');
            $table->index('applied_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_discounts');
    }
};