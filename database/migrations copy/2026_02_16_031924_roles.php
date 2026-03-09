<?php
// database/migrations/2024_01_01_000047_create_roles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index('name');
            $table->index('is_system_role');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roles');
    }
};