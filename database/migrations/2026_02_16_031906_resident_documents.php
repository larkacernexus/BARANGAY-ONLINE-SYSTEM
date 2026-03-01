<?php
// database/migrations/2024_01_01_000046_create_resident_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resident_documents', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('document_type_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('name');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_extension')->nullable();
            $table->bigInteger('file_size')->unsigned()->nullable()->comment('in bytes');
            $table->string('file_size_human')->nullable();
            $table->string('mime_type')->nullable();
            
            $table->string('reference_number')->nullable();
            $table->text('description')->nullable();
            
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            
            $table->json('metadata')->nullable();
            $table->json('tags')->nullable();
            
            $table->boolean('is_public')->default(false);
            $table->boolean('requires_password')->default(false);
            $table->string('password')->nullable();
            
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            
            $table->string('status')->default('active')->comment('active, expired, archived');
            
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('resident_id');
            $table->index('document_category_id');
            $table->index('document_type_id');
            $table->index('reference_number');
            $table->index('issue_date');
            $table->index('expiry_date');
            $table->index('status');
            $table->index('uploaded_by');
            $table->index('uploaded_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('resident_documents');
    }
};