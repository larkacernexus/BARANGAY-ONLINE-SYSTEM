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
        Schema::create('incidents', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('household_id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('type', 255)->nullable();
            $table->string('title', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('is_anonymous')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->string('reported_as_name', 255)->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};