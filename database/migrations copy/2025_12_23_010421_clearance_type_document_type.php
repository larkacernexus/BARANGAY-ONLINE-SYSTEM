<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clearance_type_document_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clearance_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_type_id')->constrained()->onDelete('cascade');
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->unique(['clearance_type_id', 'document_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clearance_type_document_type');
    }
};