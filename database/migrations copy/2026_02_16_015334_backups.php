<?php
// database/migrations/2024_01_01_000005_create_backups_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('backups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('filename');
            $table->string('type')->comment('manual, automated, scheduled');
            $table->bigInteger('size')->unsigned()->comment('in bytes');
            $table->string('path');
            $table->string('status')->default('pending')->comment('pending, processing, completed, failed');
            $table->boolean('compressed')->default(false);
            $table->json('tables')->nullable();
            $table->string('storage_location')->default('local');
            $table->boolean('contains_files')->default(true);
            $table->boolean('contains_database')->default(true);
            $table->integer('file_count')->unsigned()->default(0);
            
            // User tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('restored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_restored_at')->nullable();
            
            // Retention
            $table->timestamp('expires_at')->nullable();
            $table->string('checksum')->nullable()->comment('For integrity verification');
            
            $table->timestamps();
            
            // Indexes
            $table->index('name');
            $table->index('type');
            $table->index('status');
            $table->index('created_by');
            $table->index('expires_at');
            $table->index(['status', 'created_at']);
            $table->index(['type', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('backups');
    }
};