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
        Schema::create('forms', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('title', 255)->nullable()->default(NULL);
            $table->string('slug', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->integer('file_size')->nullable()->default(NULL);
            $table->string('file_type', 255)->nullable()->default(NULL);
            $table->string('mime_type', 255)->nullable()->default(NULL);
            $table->string('issuing_agency', 255)->nullable()->default(NULL);
            $table->string('category', 255)->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('is_featured')->nullable()->default(NULL);
            $table->integer('is_public')->nullable()->default(NULL);
            $table->integer('requires_login')->nullable()->default(NULL);
            $table->text('tags')->nullable()->default(NULL);
            $table->string('version', 255)->nullable()->default(NULL);
            $table->date('valid_from')->nullable()->default(NULL);
            $table->date('valid_until')->nullable()->default(NULL);
            $table->string('language', 255)->nullable()->default(NULL);
            $table->integer('pages')->nullable()->default(NULL);
            $table->timestamp('last_viewed_at')->nullable()->default(NULL);
            $table->bigInteger('last_viewed_by')->nullable()->default(NULL);
            $table->timestamp('last_downloaded_at')->nullable()->default(NULL);
            $table->bigInteger('last_downloaded_by')->nullable()->default(NULL);
            $table->integer('download_count')->nullable()->default(NULL);
            $table->bigInteger('created_by')->nullable()->default(NULL);
            $table->integer('view_count')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};