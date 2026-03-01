<?php
// database/migrations/2024_01_01_000001_create_access_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('method', 10)->nullable();
            $table->text('url')->nullable();
            $table->string('route_name')->nullable();
            $table->json('parameters')->nullable();
            $table->integer('status_code')->nullable();
            $table->float('response_time')->nullable()->comment('in milliseconds');
            $table->json('response_data')->nullable();
            $table->string('action_type')->nullable()->comment('create, read, update, delete, login, logout, export');
            $table->string('resource_type')->nullable();
            $table->string('resource_id')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->timestamp('accessed_at')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('user_id');
            $table->index('session_id');
            $table->index('ip_address');
            $table->index('route_name');
            $table->index('action_type');
            $table->index('resource_type');
            $table->index('resource_id');
            $table->index('accessed_at');
            $table->index(['resource_type', 'resource_id']);
            $table->index(['action_type', 'accessed_at']);
            $table->index(['is_sensitive', 'accessed_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('access_logs');
    }
};