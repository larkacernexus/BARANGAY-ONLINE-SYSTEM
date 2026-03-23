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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('username')->nullable();
            $table->string('contact_number')->nullable();
            $table->bigInteger('position')->nullable();
            $table->integer('require_password_change')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->string('email')->nullable();
            $table->string('login_qr_code')->nullable();
            $table->timestamp('login_qr_code_generated_at')->nullable();
            $table->timestamp('login_qr_code_expires_at')->nullable();
            $table->integer('login_qr_code_used_count')->nullable();
            $table->integer('role_id')->nullable();
            $table->string('status');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('qr_code_url')->nullable();
            $table->timestamp('qr_code_generated_at')->nullable();
            $table->integer('qr_code_download_count')->nullable();
            $table->string('password')->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->text('two_factor_used_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamp('two_factor_enabled_at')->nullable();
            $table->timestamp('two_factor_last_used_at')->nullable();
            $table->string('remember_token')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->integer('login_count')->nullable();
            $table->string('current_login_ip')->nullable();
            $table->timestamp('last_logout_at')->nullable();
            $table->string('last_login_device')->nullable();
            $table->string('last_login_browser')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->integer('failed_login_attempts')->nullable();
            $table->timestamp('last_failed_login_at')->nullable();
            $table->timestamp('account_locked_until')->nullable();
            $table->bigInteger('resident_id')->nullable();
            $table->bigInteger('household_id')->nullable();
            $table->bigInteger('current_resident_id')->nullable();
            $table->text('notification_preferences')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};