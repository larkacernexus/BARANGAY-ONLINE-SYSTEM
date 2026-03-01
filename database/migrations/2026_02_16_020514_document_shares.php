<?php
// database/migrations/2024_01_01_000026_create_document_shares_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('document_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('resident_documents')->cascadeOnDelete();
            $table->string('token')->unique();
            $table->string('access_type')->default('view')->comment('view, download');
            $table->boolean('requires_password')->default(false);
            $table->string('password')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_views')->nullable();
            $table->integer('view_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('document_id');
            $table->index('token');
            $table->index('expires_at');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_shares');
    }
};