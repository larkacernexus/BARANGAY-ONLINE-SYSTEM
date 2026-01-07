<?php

// database/migrations/xxxx_xx_xx_create_departments_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('head_user_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes(); // Optional: for soft deletion

            // Index for performance
            $table->index('is_active');
            $table->index('head_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};