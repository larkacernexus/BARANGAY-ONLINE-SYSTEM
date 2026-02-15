<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->onDelete('cascade');
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['complaint', 'blotter']);
            $table->string('title');
            $table->text('description');
            $table->boolean('is_anonymous')->default(false);
            $table->enum('status', ['pending', 'under_investigation', 'resolved', 'dismissed'])->default('pending');
            $table->string('reported_as_name');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};