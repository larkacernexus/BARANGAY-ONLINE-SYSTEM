<?php
// database/migrations/2024_01_01_000007_create_blotter_details_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blotter_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained()->cascadeOnDelete();
            $table->string('respondent_name');
            $table->dateTime('hearing_date')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('incident_id');
            $table->index('hearing_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('blotter_details');
    }
};