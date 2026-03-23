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
        Schema::create('resident_documents', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->bigInteger('document_category_id')->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_extension', 255)->nullable()->default(NULL);
            $table->bigInteger('file_size')->nullable()->default(NULL);
            $table->string('file_size_human', 255)->nullable()->default(NULL);
            $table->string('mime_type', 255)->nullable()->default(NULL);
            $table->string('reference_number', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->date('issue_date')->nullable()->default(NULL);
            $table->date('expiry_date')->nullable()->default(NULL);
            $table->text('metadata')->nullable()->default(NULL);
            $table->integer('is_public')->nullable()->default(NULL);
            $table->integer('requires_password')->nullable()->default(NULL);
            $table->string('password', 255)->nullable()->default(NULL);
            $table->integer('view_count')->nullable()->default(NULL);
            $table->integer('download_count')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->bigInteger('document_type_id')->nullable()->default(NULL);
            $table->text('tags')->nullable()->default(NULL);
            $table->text('security_options')->nullable()->default(NULL);
            $table->bigInteger('uploaded_by')->nullable()->default(NULL);
            $table->timestamp('uploaded_at')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resident_documents');
    }
};