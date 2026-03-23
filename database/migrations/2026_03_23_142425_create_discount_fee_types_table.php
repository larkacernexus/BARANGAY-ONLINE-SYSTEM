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
        Schema::create('discount_fee_types', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('fee_type_id')->nullable()->default(NULL);
            $table->bigInteger('discount_type_id')->nullable()->default(NULL);
            $table->decimal('percentage', 10, 2);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('sort_order')->nullable()->default(NULL);
            $table->text('notes')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_fee_types');
    }
};