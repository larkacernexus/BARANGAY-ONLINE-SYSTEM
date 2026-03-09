<?php
// database/migrations/2024_01_01_000035_create_household_members_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->string('relationship_to_head')->default('Other');
            $table->boolean('is_head')->default(false);
            
            $table->timestamps();
            
            // Ensure a resident can only be in one household
            $table->unique('resident_id');
            
            // Indexes
            $table->index('household_id');
            $table->index('resident_id');
            $table->index('is_head');
            $table->index('relationship_to_head');
        });
    }

    public function down()
    {
        Schema::dropIfExists('household_members');
    }
};