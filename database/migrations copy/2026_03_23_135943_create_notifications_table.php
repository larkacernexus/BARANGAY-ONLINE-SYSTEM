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
        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id', 255)->nullable()->default(NULL);
            $table->string('type', 255)->nullable()->default(NULL);
            $table->string('notifiable_type', 255)->nullable()->default(NULL);
            $table->bigInteger('notifiable_id')->nullable()->default(NULL);
            $table->text('data')->nullable()->default(NULL);
            $table->timestamp('read_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};