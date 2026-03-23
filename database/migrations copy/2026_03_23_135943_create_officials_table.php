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
        Schema::create('officials', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->bigInteger('position_id')->nullable()->default(NULL);
            $table->bigInteger('committee_id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->date('term_start')->nullable()->default(NULL);
            $table->date('term_end')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->integer('order')->nullable();
            $table->text('responsibilities')->nullable()->default(NULL);
            $table->string('contact_number', 255)->nullable()->default(NULL);
            $table->string('email', 255)->nullable()->default(NULL);
            $table->text('achievements')->nullable()->default(NULL);
            $table->string('photo_path', 255)->nullable()->default(NULL);
            $table->integer('is_regular')->nullable();
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('officials');
    }
};