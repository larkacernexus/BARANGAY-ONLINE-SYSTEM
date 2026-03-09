<?php
// database/migrations/2024_01_01_000041_create_positions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('committee_id')->nullable()->constrained()->nullOnDelete();
            $table->json('additional_committees')->nullable();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->foreignId('role_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('requires_account')->default(true);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('committee_id');
            $table->index('order');
            $table->index('role_id');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('positions');
    }
};