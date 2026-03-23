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
        Schema::create('activity_log', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('log_name', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('subject_type', 255)->nullable()->default(NULL);
            $table->string('event', 255)->nullable()->default(NULL);
            $table->bigInteger('subject_id')->nullable()->default(NULL);
            $table->string('causer_type', 255)->nullable()->default(NULL);
            $table->bigInteger('causer_id')->nullable()->default(NULL);
            $table->text('properties')->nullable()->default(NULL);
            $table->string('batch_uuid', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};