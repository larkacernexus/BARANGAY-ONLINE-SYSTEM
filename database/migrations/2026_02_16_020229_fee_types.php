<?php
// database/migrations/2024_01_01_000020_create_fee_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('category')->comment('clearance, permit, certificate, others');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_discountable')->default(true);
            $table->json('applicable_to')->nullable()->comment('resident, business, etc.');
            $table->softDeletes();
            $table->timestamps();
            
            $table->index('code');
            $table->index('category');
            $table->index('is_active');
            $table->index('is_discountable');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_types');
    }
};