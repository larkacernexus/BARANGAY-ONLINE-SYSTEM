<?php
// database/migrations/2024_01_01_000049_create_complaints_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('report_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('resident_id')->nullable()->constrained()->nullOnDelete();
            $table->string('complaint_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('pending');
            $table->timestamps();
            
            $table->index('report_type_id');
            $table->index('resident_id');
            $table->index('complaint_number');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('complaints');
    }
};