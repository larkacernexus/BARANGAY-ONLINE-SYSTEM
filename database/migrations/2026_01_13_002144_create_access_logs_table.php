<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('session_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('method', 10);
            $table->text('url');
            $table->string('route_name')->nullable();
            $table->json('parameters')->nullable();
            $table->integer('status_code');
            $table->integer('response_time')->nullable()->comment('Response time in milliseconds');
            $table->json('response_data')->nullable()->comment('For sensitive operations');
            $table->string('action_type')->nullable()->comment('create, read, update, delete, login, logout, export');
            $table->string('resource_type')->nullable()->comment('User, Payment, Resident, etc.');
            $table->bigInteger('resource_id')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->timestamp('accessed_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['user_id', 'accessed_at']);
            $table->index(['action_type', 'accessed_at']);
            $table->index(['resource_type', 'resource_id']);
            $table->index(['is_sensitive', 'accessed_at']);
            $table->index('session_id');
            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};