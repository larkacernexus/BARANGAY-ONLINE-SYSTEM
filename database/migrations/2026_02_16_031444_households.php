<?php
// database/migrations/2024_01_01_000034_create_households_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            
            $table->string('household_number')->unique();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('purok_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('member_count')->default(0);
            $table->string('income_range')->nullable();
            $table->string('housing_type')->nullable();
            $table->string('ownership_status')->nullable();
            $table->string('water_source')->nullable();
            $table->boolean('electricity')->default(false);
            $table->boolean('internet')->default(false);
            $table->boolean('vehicle')->default(false);
            $table->text('remarks')->nullable();
            $table->string('status')->default('active');
            
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index('household_number');
            $table->index('purok_id');
            $table->index('status');
            $table->index('user_id');
            $table->index('income_range');
            $table->index('housing_type');
            $table->index('ownership_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('households');
    }
};