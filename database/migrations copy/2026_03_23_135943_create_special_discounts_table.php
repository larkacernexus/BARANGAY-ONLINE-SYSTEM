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
        Schema::create('special_discounts', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->decimal('percentage', 10, 2);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->date('valid_from')->nullable()->default(NULL);
            $table->date('valid_until')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('special_discounts');
    }
};