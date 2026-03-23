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
        Schema::create('clearance_request_documents', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('document_type_id')->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('is_verified')->nullable();
            $table->bigInteger('clearance_request_id')->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->string('original_name', 255)->nullable()->default(NULL);
            $table->bigInteger('file_size')->nullable()->default(NULL);
            $table->string('file_type', 255)->nullable()->default(NULL);
            $table->string('mime_type', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clearance_request_documents');
    }
};