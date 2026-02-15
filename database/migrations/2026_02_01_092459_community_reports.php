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
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('report_type_id')->constrained()->onDelete('restrict');
            
            // Report identification
            $table->string('report_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->text('detailed_description')->nullable();
            
            // Location and time
            $table->string('location');
            $table->date('incident_date');
            $table->time('incident_time')->nullable();
            
            // Categorization
            $table->enum('urgency_level', ['low', 'medium', 'high'])->default('medium');
            $table->boolean('recurring_issue')->default(false);
            $table->enum('affected_people', ['individual', 'multiple', 'community'])->default('individual');
            $table->integer('estimated_affected_count')->default(1);
            
            // Reporter information (nullable if anonymous)
            $table->boolean('is_anonymous')->default(false);
            $table->string('reporter_name')->nullable();
            $table->string('reporter_contact')->nullable();
            $table->text('reporter_address')->nullable();
            
            // Specific details for complaints
            $table->text('perpetrator_details')->nullable();
            $table->text('preferred_resolution')->nullable();
            
            // Related reports
            $table->boolean('has_previous_report')->default(false);
            $table->foreignId('previous_report_id')->nullable()->constrained('community_reports')->onDelete('set null');
            
            // Impact assessment
            $table->enum('impact_level', ['minor', 'moderate', 'major', 'critical'])->default('moderate');
            $table->boolean('safety_concern')->default(false);
            $table->boolean('environmental_impact')->default(false);
            
            // Specific fields for noise complaints
            $table->enum('noise_level', ['low', 'moderate', 'high', 'extreme'])->nullable();
            $table->integer('duration_hours')->nullable();
            
            // Status and workflow
            $table->enum('status', [
                'pending', 
                'under_review', 
                'assigned', 
                'in_progress', 
                'resolved', 
                'closed', 
                'rejected',
                'withdrawn'
            ])->default('pending');
            
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            
            // Resolution tracking
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('report_number');
            $table->index('status');
            $table->index('priority');
            $table->index('urgency_level');
            $table->index('incident_date');
            $table->index('created_at');
            $table->index(['user_id', 'status']);
            $table->index(['report_type_id', 'status']);
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