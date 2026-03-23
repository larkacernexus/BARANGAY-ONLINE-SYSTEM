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
        Schema::create('incident_evidences', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('incident_id')->nullable()->default(NULL);
            $table->string('file_path', 255)->nullable()->default(NULL);
            $table->string('file_name', 255)->nullable()->default(NULL);
            $table->string('file_type', 255)->nullable()->default(NULL);
            $table->bigInteger('file_size')->nullable()->default(NULL);
            $table->bigInteger('uploaded_by')->nullable()->default(NULL);
            $table->text('notes')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident_evidences');
    }
};