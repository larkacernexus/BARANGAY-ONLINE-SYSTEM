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
        Schema::create('backups', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('filename', 255)->nullable()->default(NULL);
            $table->string('type', 255)->nullable();
            $table->bigInteger('size')->nullable()->default(NULL);
            $table->string('path', 255)->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->integer('compressed')->nullable()->default(NULL);
            $table->text('tables')->nullable()->default(NULL);
            $table->string('storage_location', 255)->nullable();
            $table->integer('contains_files')->nullable()->default(NULL);
            $table->integer('contains_database')->nullable()->default(NULL);
            $table->integer('file_count')->nullable()->default(NULL);
            $table->string('checksum', 255)->nullable()->default(NULL);
            $table->bigInteger('created_by')->nullable()->default(NULL);
            $table->bigInteger('restored_by')->nullable()->default(NULL);
            $table->timestamp('last_restored_at')->nullable()->default(NULL);
            $table->timestamp('expires_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backups');
    }
};