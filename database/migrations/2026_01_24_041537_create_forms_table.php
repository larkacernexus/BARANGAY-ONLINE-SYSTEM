<?php
// database/migrations/2024_01_01_000000_create_forms_table.php

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
            $table->string('file_path'); // Path to the uploaded file
            $table->string('file_name');
            $table->integer('file_size')->nullable(); // In bytes
            $table->string('file_type')->default('pdf'); // pdf, docx, xlsx, jpg, png
            $table->string('issuing_agency')->nullable(); // City Hall, DSWD, PNP, etc.
            $table->string('category')->nullable(); // Simple string, not FK
            $table->boolean('is_active')->default(true);
            $table->integer('download_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for faster filtering
            $table->index('category');
            $table->index('issuing_agency');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('forms');
    }
};