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
        Schema::create('privileges', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('is_active')->nullable();
            $table->bigInteger('discount_type_id')->nullable()->default(NULL);
            $table->decimal('default_discount_percentage', 10, 2);
            $table->integer('requires_id_number')->nullable();
            $table->integer('requires_verification')->nullable();
            $table->integer('validity_years')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('privileges');
    }
};