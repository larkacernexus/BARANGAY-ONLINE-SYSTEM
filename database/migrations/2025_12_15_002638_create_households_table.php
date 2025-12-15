<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            $table->string('household_number')->unique();
            $table->string('head_of_family');
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('address');
            $table->string('purok');
            $table->integer('member_count')->default(1);
            $table->string('income_range')->nullable();
            $table->string('housing_type')->nullable();
            $table->string('ownership_status')->nullable();
            $table->string('water_source')->nullable();
            $table->boolean('electricity')->default(false);
            $table->text('remarks')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('households');
    }
};