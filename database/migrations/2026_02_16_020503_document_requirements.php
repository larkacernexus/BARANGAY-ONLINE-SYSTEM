<?php
// database/migrations/2024_01_01_000025_create_document_requirements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clearance_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->unique(['clearance_type_id', 'document_type_id'], 'unique_clearance_document');
            $table->index('clearance_type_id');
            $table->index('document_type_id');
            $table->index('is_required');
            $table->index('sort_order');
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_requirements');
    }
};