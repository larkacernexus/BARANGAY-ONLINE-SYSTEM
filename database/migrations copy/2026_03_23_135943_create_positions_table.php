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
        Schema::create('positions', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('order')->nullable()->default(NULL);
            $table->bigInteger('role_id')->nullable()->default(NULL);
            $table->integer('requires_account')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->bigInteger('committee_id')->nullable()->default(NULL);
            $table->text('additional_committees')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};