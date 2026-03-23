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
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->bigInteger('document_category_id')->nullable()->default(NULL);
            $table->integer('is_required')->nullable()->default(NULL);
            $table->integer('sort_order')->nullable()->default(NULL);
            $table->text('accepted_formats')->nullable()->default(NULL);
            $table->integer('max_file_size')->nullable();
            $table->integer('is_active')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};