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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->string('user_name', 255)->nullable()->default(NULL);
            $table->string('user_position', 255)->nullable()->default(NULL);
            $table->string('event_type', 255)->nullable()->default(NULL);
            $table->string('event_category', 255)->nullable()->default(NULL);
            $table->string('event', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('subject_type', 255)->nullable()->default(NULL);
            $table->bigInteger('subject_id')->nullable()->default(NULL);
            $table->string('subject_name', 255)->nullable()->default(NULL);
            $table->string('barangay_id', 255)->nullable()->default(NULL);
            $table->string('office', 255)->nullable()->default(NULL);
            $table->string('document_number', 255)->nullable()->default(NULL);
            $table->text('old_values')->nullable()->default(NULL);
            $table->text('new_values')->nullable()->default(NULL);
            $table->text('properties')->nullable()->default(NULL);
            $table->string('severity', 255)->nullable();
            $table->string('status', 255)->nullable();
            $table->string('ip_address', 255)->nullable()->default(NULL);
            $table->string('user_agent', 255)->nullable()->default(NULL);
            $table->string('device_type', 255)->nullable()->default(NULL);
            $table->string('platform', 255)->nullable()->default(NULL);
            $table->string('browser', 255)->nullable()->default(NULL);
            $table->string('or_number', 255)->nullable()->default(NULL);
            $table->decimal('amount', 10, 2);
            $table->string('transaction_type', 255)->nullable()->default(NULL);
            $table->timestamp('logged_at')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};