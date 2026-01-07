<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->onDelete('cascade');
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->string('relationship_to_head', 50); // Head, Spouse, Son, Daughter, etc.
            $table->boolean('is_head')->default(false);
            $table->timestamps();
            
            $table->unique(['household_id', 'resident_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('household_members');
    }
};