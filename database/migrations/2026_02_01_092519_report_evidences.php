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
        Schema::create('report_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('community_reports')->onDelete('cascade');
            
            // File information
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->bigInteger('file_size');
            $table->text('notes')->nullable();
            
            // Uploader information
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('restrict');
            $table->enum('uploaded_by_type', ['resident', 'officer', 'admin'])->default('resident');
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('report_id');
            $table->index('uploaded_by');
            $table->index('file_type');
            $table->index('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_evidences');
    }
};