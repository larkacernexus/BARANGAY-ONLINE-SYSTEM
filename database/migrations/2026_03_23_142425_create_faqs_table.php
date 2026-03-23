<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question', 255)->nullable()->default(NULL);
            $table->text('answer')->nullable()->default(NULL);
            $table->string('category', 255)->nullable()->default(NULL);
            $table->integer('order')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('views')->nullable()->default(NULL);
            $table->integer('helpful_count')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};