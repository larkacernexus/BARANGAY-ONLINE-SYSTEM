<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('resident_documents')->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('access_type')->default('view'); // view, download
            $table->boolean('requires_password')->default(false);
            $table->string('password')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_views')->nullable();
            $table->integer('view_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_shares');
    }
};