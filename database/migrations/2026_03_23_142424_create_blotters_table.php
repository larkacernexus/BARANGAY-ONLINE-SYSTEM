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
        Schema::create('blotters', function (Blueprint $table) {
            $table->id();
            $table->string('blotter_number', 255)->nullable()->default(NULL);
            $table->string('incident_type', 255)->nullable()->default(NULL);
            $table->text('incident_description')->nullable()->default(NULL);
            $table->dateTime('incident_datetime')->nullable()->default(NULL);
            $table->string('location', 255)->nullable()->default(NULL);
            $table->string('barangay', 255)->nullable()->default(NULL);
            $table->string('reporter_name', 255)->nullable()->default(NULL);
            $table->string('reporter_contact', 255)->nullable()->default(NULL);
            $table->string('reporter_address', 255)->nullable()->default(NULL);
            $table->string('respondent_name', 255)->nullable()->default(NULL);
            $table->string('respondent_address', 255)->nullable()->default(NULL);
            $table->text('witnesses')->nullable()->default(NULL);
            $table->text('evidence')->nullable()->default(NULL);
            $table->string('status', 255)->nullable();
            $table->string('priority', 255)->nullable();
            $table->text('action_taken')->nullable()->default(NULL);
            $table->string('investigator', 255)->nullable()->default(NULL);
            $table->dateTime('resolved_datetime')->nullable()->default(NULL);
            $table->text('attachments')->nullable()->default(NULL);
            $table->text('involved_residents')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blotters');
    }
};