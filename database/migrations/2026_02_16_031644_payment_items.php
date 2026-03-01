<?php
// database/migrations/2024_01_01_000039_create_payment_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('payment_id')
                ->constrained()
                ->cascadeOnDelete();
            
            $table->foreignId('original_fee_id')
                ->nullable()
                ->constrained('fees')
                ->nullOnDelete();
            
            $table->foreignId('clearance_request_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            
            $table->foreignId('fee_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            
            $table->string('fee_name');
            $table->string('fee_code')->nullable();
            $table->text('description')->nullable();
            
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->decimal('surcharge', 12, 2)->default(0);
            $table->decimal('penalty', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            
            $table->string('category')->nullable();
            $table->string('period_covered')->nullable();
            $table->integer('months_late')->nullable();
            $table->json('fee_metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('payment_id'); // redundant (FK already indexed)
            $table->index('original_fee_id');
            $table->index('clearance_request_id');
            $table->index('fee_id');
            $table->index('fee_code');
            $table->index('category');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_items');
    }
};
