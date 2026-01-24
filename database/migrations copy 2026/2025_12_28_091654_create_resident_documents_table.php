<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resident_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_extension');
            $table->bigInteger('file_size');
            $table->string('file_size_human');
            $table->string('mime_type');
            $table->string('reference_number')->nullable()->unique();
            $table->text('description')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('requires_password')->default(false);
            $table->string('password')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->enum('status', ['active', 'expired', 'revoked', 'pending'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['resident_id', 'document_category_id']);
            $table->index('status');
            $table->index('issue_date');
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resident_documents');
    }
};