<?php
// database/migrations/2024_01_01_000040_create_permissions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            
            $table->string('name')->unique();
            $table->string('display_name')->nullable();
            $table->text('description')->nullable();
            $table->string('module')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index('name');
            $table->index('module');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};