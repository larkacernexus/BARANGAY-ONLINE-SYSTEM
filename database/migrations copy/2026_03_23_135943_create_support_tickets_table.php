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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->string('ticket_number', 255)->nullable()->default(NULL);
            $table->string('subject', 255)->nullable()->default(NULL);
            $table->string('category', 255)->nullable()->default(NULL);
            $table->string('priority', 255)->nullable();
            $table->text('message')->nullable()->default(NULL);
            $table->string('attachment', 255)->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->timestamp('resolved_at')->nullable()->default(NULL);
            $table->timestamp('closed_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};