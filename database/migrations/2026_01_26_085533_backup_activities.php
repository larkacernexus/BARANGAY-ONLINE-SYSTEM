<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('backup_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('action', ['create', 'restore', 'download', 'delete', 'schedule', 'cleanup']);
            $table->json('details')->nullable();
            $table->enum('status', ['success', 'failed', 'processing'])->default('processing');
            $table->integer('duration')->nullable()->comment('Duration in seconds');
            $table->bigInteger('file_size')->nullable();
            $table->timestamps();
            
            $table->index(['action', 'status']);
            $table->index('created_at');
            $table->index('user_id');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('backup_activities');
    }
};