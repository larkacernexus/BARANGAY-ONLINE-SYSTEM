<?php
// database/migrations/2024_01_01_000027_create_document_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->foreignId('document_category_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('accepted_formats')->nullable();
            $table->integer('max_file_size')->nullable()->comment('in KB');
            $table->integer('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
            
            $table->index('code');
            $table->index('document_category_id');
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_types');
    }
};