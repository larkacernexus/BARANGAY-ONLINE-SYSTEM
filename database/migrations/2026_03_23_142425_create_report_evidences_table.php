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
            $table->bigInteger('report_id')->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->string('file_type', 255)->nullable()->default(NULL);
            $table->integer('file_size')->nullable()->default(NULL);
            $table->text('notes')->nullable()->default(NULL);
            $table->bigInteger('uploaded_by')->nullable()->default(NULL);
            $table->integer('is_verified')->nullable()->default(NULL);
            $table->bigInteger('verified_by')->nullable()->default(NULL);
            $table->timestamp('verified_at')->nullable()->default(NULL);
            $table->text('verification_notes')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

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