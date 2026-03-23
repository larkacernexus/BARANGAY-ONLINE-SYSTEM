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
        Schema::create('announcements', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->string('title', 255)->nullable()->default(NULL);
            $table->text('content')->nullable()->default(NULL);
            $table->string('type', 255)->nullable();
            $table->integer('priority')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->date('start_date')->nullable()->default(NULL);
            $table->time('start_time')->nullable()->default(NULL);
            $table->date('end_date')->nullable()->default(NULL);
            $table->time('end_time')->nullable()->default(NULL);
            $table->string('audience_type', 255)->nullable();
            $table->text('target_roles')->nullable()->default(NULL);
            $table->text('target_puroks')->nullable()->default(NULL);
            $table->text('target_households')->nullable()->default(NULL);
            $table->text('target_users')->nullable()->default(NULL);
            $table->text('target_businesses')->nullable()->default(NULL);
            $table->bigInteger('created_by')->nullable()->default(NULL);
            $table->bigInteger('updated_by')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};