<?php
// database/migrations/2024_01_01_000031_create_forms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // File information
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->bigInteger('file_size')->unsigned()->nullable()->comment('in bytes');
            $table->string('file_type')->nullable()->comment('mime type');
            
            // Metadata
            $table->string('issuing_agency')->nullable();
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            
            // Access control
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('requires_login')->default(false);
            
            // Statistics
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            
            // Tracking
            $table->timestamp('last_viewed_at')->nullable();
            $table->foreignId('last_viewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_downloaded_at')->nullable();
            $table->foreignId('last_downloaded_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('slug');
            $table->index('title');
            $table->index('category');
            $table->index('issuing_agency');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('is_public');
            $table->index('created_by');
            $table->index('last_viewed_at');
            $table->index('last_downloaded_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('forms');
    }
};