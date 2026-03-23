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
        Schema::create('puroks', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('slug', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('leader_name', 255)->nullable()->default(NULL);
            $table->string('leader_contact', 255)->nullable()->default(NULL);
            $table->integer('total_households')->nullable()->default(NULL);
            $table->integer('total_residents')->nullable()->default(NULL);
            $table->string('status', 255)->nullable()->default(NULL);
            $table->string('google_maps_url', 255)->nullable()->default(NULL);
            $table->decimal('latitude', 10, 2)->nullable();
            $table->decimal('longitude', 10, 2)->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('puroks');
    }
};