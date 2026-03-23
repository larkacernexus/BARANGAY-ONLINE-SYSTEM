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
        Schema::create('community_reports', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('report_type_id')->nullable()->default(NULL);
            $table->string('report_number', 255)->nullable()->default(NULL);
            $table->string('title', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->text('detailed_description')->nullable()->default(NULL);
            $table->string('location', 255)->nullable()->default(NULL);
            $table->date('incident_date')->nullable()->default(NULL);
            $table->time('incident_time')->nullable()->default(NULL);
            $table->string('urgency_level', 255)->nullable();
            $table->integer('recurring_issue')->nullable()->default(NULL);
            $table->string('affected_people', 255)->nullable();
            $table->integer('estimated_affected_count')->nullable()->default(NULL);
            $table->integer('is_anonymous')->nullable()->default(NULL);
            $table->string('reporter_name', 255)->nullable()->default(NULL);
            $table->string('reporter_contact', 255)->nullable()->default(NULL);
            $table->text('reporter_address')->nullable()->default(NULL);
            $table->text('perpetrator_details')->nullable()->default(NULL);
            $table->text('preferred_resolution')->nullable()->default(NULL);
            $table->integer('has_previous_report')->nullable()->default(NULL);
            $table->bigInteger('previous_report_id')->nullable()->default(NULL);
            $table->string('impact_level', 255)->nullable()->default(NULL);
            $table->integer('safety_concern')->nullable()->default(NULL);
            $table->integer('environmental_impact')->nullable()->default(NULL);
            $table->string('noise_level', 255)->nullable()->default(NULL);
            $table->integer('duration_hours')->nullable()->default(NULL);
            $table->string('status', 255)->nullable()->default(NULL);
            $table->string('priority', 255)->nullable()->default(NULL);
            $table->bigInteger('assigned_to')->nullable()->default(NULL);
            $table->text('resolution_notes')->nullable()->default(NULL);
            $table->timestamp('resolved_at')->nullable()->default(NULL);
            $table->timestamp('acknowledged_at')->nullable()->default(NULL);
            $table->bigInteger('user_id')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_reports');
    }
};