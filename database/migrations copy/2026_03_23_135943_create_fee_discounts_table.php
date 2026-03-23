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
        Schema::create('fee_discounts', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('fee_id')->nullable()->default(NULL);
            $table->bigInteger('discount_type_id')->nullable()->default(NULL);
            $table->bigInteger('special_discount_id')->nullable()->default(NULL);
            $table->bigInteger('special_discount_application_id')->nullable()->default(NULL);
            $table->decimal('discount_amount', 10, 2);
            $table->decimal('discount_percentage', 10, 2);
            $table->decimal('base_amount', 10, 2);
            $table->text('notes')->nullable()->default(NULL);
            $table->bigInteger('applied_by')->nullable()->default(NULL);
            $table->timestamp('applied_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_discounts');
    }
};