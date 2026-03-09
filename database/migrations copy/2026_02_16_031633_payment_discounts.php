<?php
// database/migrations/2024_01_01_000038_create_payment_discounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_discounts', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('discount_rule_id')->constrained()->cascadeOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0);
            
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            
            $table->boolean('id_presented')->default(false);
            $table->string('id_number')->nullable();
            $table->text('remarks')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('payment_id');
            $table->index('discount_rule_id');
            $table->index('verified_by');
            $table->index('verified_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_discounts');
    }
};