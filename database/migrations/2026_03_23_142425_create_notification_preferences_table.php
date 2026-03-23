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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('type', 255)->nullable()->default(NULL);
            $table->string('channel', 255)->nullable()->default(NULL);
            $table->integer('enabled')->nullable()->default(NULL);
            $table->text('settings')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};