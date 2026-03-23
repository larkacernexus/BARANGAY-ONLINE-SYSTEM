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
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('household_number', 255)->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->string('email', 255)->nullable()->default(NULL);
            $table->text('address')->nullable()->default(NULL);
            $table->integer('member_count')->nullable()->default(NULL);
            $table->string('income_range', 255)->nullable()->default(NULL);
            $table->string('housing_type', 255)->nullable()->default(NULL);
            $table->string('ownership_status', 255)->nullable()->default(NULL);
            $table->string('water_source', 255)->nullable()->default(NULL);
            $table->integer('electricity')->nullable()->default(NULL);
            $table->integer('internet')->nullable()->default(NULL);
            $table->integer('vehicle')->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->string('google_maps_url', 255)->nullable()->default(NULL);
            $table->decimal('latitude', 10, 2)->nullable();
            $table->decimal('longitude', 10, 2)->nullable();
            $table->string('status', 255)->nullable();
            $table->bigInteger('purok_id')->nullable()->default(NULL);
            $table->string('head_of_family', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('households');
    }
};