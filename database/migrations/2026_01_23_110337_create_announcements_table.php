<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['general', 'important', 'event', 'maintenance', 'other'])->default('general');
            $table->integer('priority')->default(0)->comment('Higher number = higher priority');
            $table->boolean('is_active')->default(true);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            // Added columns with datetime precision
            $table->dateTime('start_time')->nullable()->comment('Exact start datetime');
            $table->dateTime('end_time')->nullable()->comment('Exact end datetime');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};