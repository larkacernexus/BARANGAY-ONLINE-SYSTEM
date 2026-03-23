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
        Schema::create('announcement_views', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('announcement_id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->date('view_date')->nullable()->default(NULL);
            $table->integer('view_count')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcement_views');
    }
};