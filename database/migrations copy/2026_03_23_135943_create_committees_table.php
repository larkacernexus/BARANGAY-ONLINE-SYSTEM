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
        Schema::create('committees', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('order')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committees');
    }
};