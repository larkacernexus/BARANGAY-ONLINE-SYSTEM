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
        Schema::create('user_login_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('ip_address', 255)->nullable()->default(NULL);
            $table->text('user_agent')->nullable()->default(NULL);
            $table->string('session_id', 255)->nullable()->default(NULL);
            $table->string('device_type', 255)->nullable()->default(NULL);
            $table->string('browser', 255)->nullable()->default(NULL);
            $table->string('platform', 255)->nullable()->default(NULL);
            $table->timestamp('login_at')->nullable()->default(NULL);
            $table->timestamp('logout_at')->nullable()->default(NULL);
            $table->integer('is_successful')->nullable()->default(NULL);
            $table->text('failure_reason')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_login_logs');
    }
};