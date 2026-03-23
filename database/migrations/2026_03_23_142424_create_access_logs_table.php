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
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('session_id', 255)->nullable()->default(NULL);
            $table->string('ip_address', 255)->nullable()->default(NULL);
            $table->text('user_agent')->nullable()->default(NULL);
            $table->string('method', 255)->nullable()->default(NULL);
            $table->text('url')->nullable()->default(NULL);
            $table->string('route_name', 255)->nullable()->default(NULL);
            $table->text('parameters')->nullable()->default(NULL);
            $table->integer('status_code')->nullable()->default(NULL);
            $table->integer('response_time')->nullable()->default(NULL);
            $table->text('response_data')->nullable()->default(NULL);
            $table->string('action_type', 255)->nullable()->default(NULL);
            $table->string('resource_type', 255)->nullable()->default(NULL);
            $table->bigInteger('resource_id')->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('is_sensitive')->nullable()->default(NULL);
            $table->timestamp('accessed_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};