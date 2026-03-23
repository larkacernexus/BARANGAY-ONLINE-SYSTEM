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
        Schema::create('announcement_attachments', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('announcement_id')->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->string('original_name', 255)->nullable()->default(NULL);
            $table->bigInteger('file_size')->nullable()->default(NULL);
            $table->string('mime_type', 255)->nullable()->default(NULL);
            $table->bigInteger('created_by')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_attachments');
    }
};