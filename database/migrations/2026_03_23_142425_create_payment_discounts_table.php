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
        Schema::create('payment_discounts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('payment_id')->nullable()->default(NULL);
            $table->bigInteger('discount_rule_id')->nullable()->default(NULL);
            $table->decimal('discount_amount', 10, 2);
            $table->bigInteger('verified_by')->nullable()->default(NULL);
            $table->timestamp('verified_at')->nullable()->default(NULL);
            $table->integer('id_presented')->nullable()->default(NULL);
            $table->string('id_number', 255)->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_discounts');
    }
};