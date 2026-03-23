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
        Schema::create('residents', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('photo_path', 255)->nullable()->default(NULL);
            $table->string('resident_id', 255)->nullable()->default(NULL);
            $table->string('first_name', 255)->nullable()->default(NULL);
            $table->string('last_name', 255)->nullable()->default(NULL);
            $table->string('middle_name', 255)->nullable()->default(NULL);
            $table->string('suffix', 255)->nullable()->default(NULL);
            $table->date('birth_date')->nullable()->default(NULL);
            $table->integer('age')->nullable()->default(NULL);
            $table->string('gender', 255)->nullable();
            $table->string('civil_status', 255)->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->string('email', 255)->nullable()->default(NULL);
            $table->text('address')->nullable()->default(NULL);
            $table->bigInteger('purok_id')->nullable()->default(NULL);
            $table->bigInteger('household_id')->nullable()->default(NULL);
            $table->string('occupation', 255)->nullable()->default(NULL);
            $table->string('employment_status', 255)->nullable()->default(NULL);
            $table->string('educational_attainment', 255)->nullable()->default(NULL);
            $table->string('education', 255)->nullable()->default(NULL);
            $table->string('religion', 255)->nullable()->default(NULL);
            $table->integer('is_voter')->nullable()->default(NULL);
            $table->string('place_of_birth', 255)->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};