<?php
// database/migrations/2024_01_01_000054_create_user_login_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_login_logs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('session_id')->nullable();
            
            // Device info
            $table->string('device_type')->nullable()->comment('Desktop, Mobile, Tablet');
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();
            
            // Login tracking
            $table->timestamp('login_at')->nullable();
            $table->timestamp('logout_at')->nullable();
            
            // Status
            $table->boolean('is_successful')->default(true);
            $table->string('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('session_id');
            $table->index('ip_address');
            $table->index('login_at');
            $table->index('logout_at');
            $table->index('is_successful');
            $table->index(['user_id', 'login_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_login_logs');
    }
};