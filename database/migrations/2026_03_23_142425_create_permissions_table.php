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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('display_name', 255)->nullable()->default(NULL);
            $table->string('description', 255)->nullable()->default(NULL);
            $table->string('module', 255)->nullable()->default(NULL);
            $table->string('guard_name', 255)->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};