<?php
// database/migrations/2024_01_01_000052_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            // Basic Info
            $table->string('username')->unique();
            $table->string('email')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            
            // Role & Position
            $table->string('position')->nullable();
            $table->foreignId('role_id')->nullable()->constrained()->nullOnDelete();
            
            // Status
            $table->string('status')->default('active')->comment('active, inactive, suspended, locked');
            
            // Authentication
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('require_password_change')->default(false);
            $table->timestamp('password_changed_at')->nullable();
            $table->rememberToken();
            
            // Two Factor Authentication
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamp('two_factor_enabled_at')->nullable();
            $table->timestamp('two_factor_last_used_at')->nullable();
            $table->json('two_factor_used_recovery_codes')->nullable();
            
            // Login Tracking
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->integer('login_count')->default(0);
            $table->string('current_login_ip', 45)->nullable();
            $table->timestamp('last_logout_at')->nullable();
            $table->string('last_login_device')->nullable();
            $table->string('last_login_browser')->nullable();
            
            // Security
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('last_failed_login_at')->nullable();
            $table->timestamp('account_locked_until')->nullable();
            
            // Relationships to other entities
            $table->foreignId('resident_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('household_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('current_resident_id')->nullable()->constrained('residents')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index('username');
            $table->index('email');
            $table->index('role_id');
            $table->index('status');
            $table->index('resident_id');
            $table->index('household_id');
            $table->index('current_resident_id');
            $table->index('last_login_at');
            $table->index('account_locked_until');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};