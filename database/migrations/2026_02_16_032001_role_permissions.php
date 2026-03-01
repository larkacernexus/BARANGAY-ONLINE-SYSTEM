<?php
// database/migrations/2024_01_01_000050_create_role_permissions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            
            // Additional fields
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('granted_at')->nullable();
            
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['role_id', 'permission_id']);
            
            // Indexes
            $table->index('role_id');
            $table->index('permission_id');
            $table->index('granted_by');
            $table->index('granted_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('role_permissions');
    }
};