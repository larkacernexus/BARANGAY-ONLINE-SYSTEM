<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Display name (e.g., "Valid ID")
            $table->string('code')->unique(); // Unique code (e.g., "valid_id")
            $table->text('description')->nullable(); // Detailed description
            $table->enum('category', [
                'identification',
                'residency_proof',
                'financial',
                'educational',
                'employment',
                'legal',
                'medical',
                'business',
                'other'
            ])->default('other');
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('accepted_formats')->nullable(); // e.g., ["jpg", "png", "pdf"]
            $table->integer('max_file_size')->nullable()->default(5120); // in KB
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};