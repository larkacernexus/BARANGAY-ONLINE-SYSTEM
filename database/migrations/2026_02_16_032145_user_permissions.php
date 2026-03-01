<?php
// database/migrations/2024_01_01_000053_create_user_permissions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            
            // Whether permission is granted or denied (for custom overrides)
            $table->boolean('is_granted')->default(true);
            
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'permission_id']);
            
            // Indexes
            $table->index('user_id');
            $table->index('permission_id');
            $table->index('is_granted');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_permissions');
    }
};