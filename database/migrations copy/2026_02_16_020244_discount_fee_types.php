<?php
// database/migrations/2024_01_01_000021_create_discount_fee_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('discount_fee_types', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys with proper table references
            $table->foreignId('fee_type_id')
                  ->constrained('fee_types')
                  ->cascadeOnDelete();
                  
            $table->foreignId('discount_type_id')
                  ->constrained('discount_types')
                  ->cascadeOnDelete();
            
            // Discount configuration
            $table->decimal('percentage', 5, 2)->comment('Discount percentage for this specific fee');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(false);
            $table->decimal('min_amount', 12, 2)->nullable()->comment('Minimum amount to qualify for discount');
            $table->decimal('max_amount', 12, 2)->nullable()->comment('Maximum amount eligible for discount');
            $table->date('validity_start')->nullable();
            $table->date('validity_end')->nullable();
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Unique constraint to prevent duplicate fee-discount combinations
            $table->unique(['fee_type_id', 'discount_type_id'], 'unique_fee_discount');
            
            // Indexes for better query performance
            $table->index('fee_type_id');
            $table->index('discount_type_id');
            $table->index('is_active');
            $table->index('validity_start');
            $table->index('validity_end');
            $table->index('sort_order');
            
            // Composite index for active validity period queries
            $table->index(['is_active', 'validity_start', 'validity_end'], 'idx_active_validity');
        });
    }

    public function down()
    {
        Schema::dropIfExists('discount_fee_types');
    }
};