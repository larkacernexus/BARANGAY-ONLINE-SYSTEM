<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('puroks', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('leader_name')->nullable();
            $table->string('leader_contact')->nullable();
            $table->integer('total_households')->default(0);
            $table->integer('total_residents')->default(0);
            $table->string('status')->default('active'); // active, inactive
            $table->json('boundaries')->nullable(); // For mapping coordinates
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('puroks');
    }
};