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
        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('ticket_id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->text('message')->nullable()->default(NULL);
            $table->string('attachment', 255)->nullable()->default(NULL);
            $table->integer('is_staff')->nullable()->default(NULL);
            $table->string('staff_name', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_replies');
    }
};