<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->nullable()->constrained('residents')->onDelete('set null');
            $table->foreignId('complaint_type_id')->constrained('complaint_types')->onDelete('cascade');
            $table->string('reference_number')->unique();
            $table->string('complainant_name');
            $table->string('complainant_contact')->nullable();
            $table->string('complainant_address')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->text('description');
            $table->string('incident_location');
            $table->date('incident_date');
            $table->time('incident_time')->nullable();
            $table->json('evidence_files')->nullable();
            $table->json('witnesses')->nullable();
            $table->enum('status', [
                'draft', 
                'pending', 
                'under_review', 
                'investigating', 
                'in_progress', 
                'resolved', 
                'dismissed', 
                'closed',
                'reopened'
            ])->default('draft');
            $table->integer('current_step')->default(0);
            $table->integer('priority_score')->default(0);
            $table->boolean('requires_follow_up')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->text('action_taken')->nullable();
            $table->date('resolution_date')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('investigation_started_at')->nullable();
            $table->timestamp('resolution_started_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'created_at']);
            $table->index(['resident_id', 'status']);
            $table->index(['complaint_type_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('reference_number');
            $table->index('priority_score');
            $table->index('follow_up_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};