<?php
// database/migrations/2024_01_01_000043_create_report_evidences_table.php

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
            $table->string('file_type')->comment('image/jpeg, image/png, application/pdf, video/mp4, etc.');
            $table->bigInteger('file_size')->unsigned()->comment('in bytes');
            $table->text('notes')->nullable();
            
            // Uploader info
            $table->foreignId('uploaded_by')->nullable()->constrained('residents')->nullOnDelete();
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('report_id');
            $table->index('uploaded_by');
            $table->index('is_verified');
            $table->index('verified_by');
            $table->index('verified_at');
            $table->index('file_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('report_evidences');
    }
};