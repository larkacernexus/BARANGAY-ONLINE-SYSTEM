<?php
// database/migrations/2024_01_01_000006_create_backup_activities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('backup_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('backup_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action')->comment('created, downloaded, restored, deleted, verified');
            $table->json('details')->nullable();
            $table->string('status')->default('success');
            $table->integer('duration')->nullable()->comment('in seconds');
            $table->bigInteger('file_size')->nullable()->comment('in bytes');
            $table->timestamps();
            
            // Indexes
            $table->index('backup_id');
            $table->index('user_id');
            $table->index('action');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('backup_activities');
    }
};