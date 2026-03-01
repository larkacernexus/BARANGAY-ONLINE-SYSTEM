<?php
// database/migrations/2024_01_01_000016_create_community_reports_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('community_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('report_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('report_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->text('detailed_description')->nullable();
            $table->string('location')->nullable();
            $table->date('incident_date')->nullable();
            $table->time('incident_time')->nullable();
            $table->string('urgency_level')->default('medium')->comment('low, medium, high');
            $table->boolean('recurring_issue')->default(false);
            $table->string('affected_people')->default('individual')->comment('individual, family, community');
            $table->integer('estimated_affected_count')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('reporter_name')->nullable();
            $table->string('reporter_contact')->nullable();
            $table->text('reporter_address')->nullable();
            $table->text('perpetrator_details')->nullable();
            $table->text('preferred_resolution')->nullable();
            $table->boolean('has_previous_report')->default(false);
            $table->foreignId('previous_report_id')->nullable()->constrained('community_reports')->nullOnDelete();
            $table->string('impact_level')->default('moderate')->comment('low, moderate, high, severe');
            $table->boolean('safety_concern')->default(false);
            $table->boolean('environmental_impact')->default(false);
            $table->string('noise_level')->nullable();
            $table->integer('duration_hours')->nullable();
            $table->string('status')->default('pending')->comment('pending, under_review, assigned, in_progress, resolved, rejected');
            $table->string('priority')->default('medium')->comment('low, medium, high, critical');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('report_number');
            $table->index('user_id');
            $table->index('report_type_id');
            $table->index('status');
            $table->index('priority');
            $table->index('urgency_level');
            $table->index('incident_date');
            $table->index('assigned_to');
            $table->index(['status', 'priority']);
            $table->index(['created_at', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('community_reports');
    }
};