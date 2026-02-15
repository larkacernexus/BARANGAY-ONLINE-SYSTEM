<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('filename');
            $table->enum('type', ['full', 'database', 'files', 'residents', 'officials', 'financial', 'documents', 'custom']);
            $table->bigInteger('size')->default(0);
            $table->string('path');
            $table->enum('status', ['processing', 'completed', 'failed'])->default('processing');
            $table->boolean('compressed')->default(true);
            $table->json('tables')->nullable();
            $table->enum('storage_location', ['local', 's3', 'ftp'])->default('local');
            $table->boolean('contains_files')->default(false);
            $table->boolean('contains_database')->default(false);
            $table->integer('file_count')->default(0);
            $table->string('checksum')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('restored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_restored_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index('expires_at');
            $table->index('created_by');
            $table->index(['contains_files', 'contains_database']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('backups');
    }
};