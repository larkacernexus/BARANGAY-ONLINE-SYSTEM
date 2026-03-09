<?php
// database/migrations/2024_01_01_000042_create_puroks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('puroks', function (Blueprint $table) {
            $table->id();
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('leader_name')->nullable();
            $table->string('leader_contact')->nullable();
            $table->integer('total_households')->default(0);
            $table->integer('total_residents')->default(0);
            $table->string('status')->default('active');
            
            // Optional coordinates
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('google_maps_url')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('name');
            $table->index('slug');
            $table->index('status');
            $table->index('leader_name');
        });
    }

    public function down()
    {
        Schema::dropIfExists('puroks');
    }
};