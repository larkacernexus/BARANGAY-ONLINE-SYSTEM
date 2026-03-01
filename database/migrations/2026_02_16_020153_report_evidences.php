<?php
// database/migrations/2024_01_01_000017_create_report_evidences_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('report_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('community_reports')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->comment('image, video, document, audio');
            $table->bigInteger('file_size')->unsigned()->comment('in bytes');
            $table->string('mime_type')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index('report_id');
            $table->index('file_type');
            $table->index('uploaded_by');
        });
    }

    public function down()
    {
        Schema::dropIfExists('report_evidences');
    }
};