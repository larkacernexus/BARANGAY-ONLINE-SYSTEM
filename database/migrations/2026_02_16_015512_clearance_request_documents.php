<?php
// database/migrations/2024_01_01_000009_create_clearance_request_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clearance_request_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clearance_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            
            // File Information
            $table->string('file_path');
            $table->string('file_name');
            $table->string('original_name');
            $table->bigInteger('file_size')->unsigned()->comment('in bytes');
            $table->string('file_type')->nullable();
            $table->string('mime_type')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('clearance_request_id');
            $table->index('document_type_id');
            $table->index('is_verified');
            $table->index('file_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('clearance_request_documents');
    }
};