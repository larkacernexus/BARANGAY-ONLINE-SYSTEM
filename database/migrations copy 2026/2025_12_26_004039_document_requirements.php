<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // database/migrations/xxxx_create_document_requirements_table.php
Schema::create('document_requirements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('clearance_type_id')->constrained()->onDelete('cascade');
    $table->foreignId('document_type_id')->constrained()->onDelete('cascade');
    $table->boolean('is_required')->default(true);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    
    // Unique constraint to prevent duplicates
    $table->unique(['clearance_type_id', 'document_type_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
