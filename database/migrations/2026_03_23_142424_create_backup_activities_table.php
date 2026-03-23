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
        Schema::create('backup_activities', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('backup_id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('action', 255)->nullable();
            $table->text('details')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->integer('duration')->nullable()->default(NULL);
            $table->bigInteger('file_size')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_activities');
    }
};