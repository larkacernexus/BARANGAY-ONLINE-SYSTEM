<?php
// database/migrations/2024_01_01_000004_create_audit_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // User Information
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_position')->nullable();
            
            // Event Information
            $table->string('event_type')->comment('created, updated, deleted, viewed, exported, printed, approved, rejected, login, logout, failed_login');
            $table->string('event_category')->comment('financial, resident, document, blotter, system, security, user');
            $table->string('event');
            $table->text('description');
            
            // Subject Information (Polymorphic)
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_name')->nullable();
            
            // Barangay Context
            $table->string('barangay_id')->nullable();
            $table->string('office')->nullable();
            $table->string('document_number')->nullable();
            
            // Financial Details (COA Compliance)
            $table->string('or_number')->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('transaction_type')->nullable();
            
            // Change Tracking
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('properties')->nullable();
            
            // Metadata
            $table->string('severity')->default('info')->comment('info, warning, error, critical');
            $table->string('status')->nullable();
            
            // Request Information
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device_type')->nullable()->comment('Desktop, Mobile, Tablet');
            $table->string('platform')->nullable()->comment('Windows, macOS, Linux, Android, iOS');
            $table->string('browser')->nullable()->comment('Chrome, Firefox, Safari, Edge, Opera');
            
            // Timestamps
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('user_name');
            $table->index('event_type');
            $table->index('event_category');
            $table->index('barangay_id');
            $table->index('office');
            $table->index('or_number');
            $table->index('document_number');
            $table->index('severity');
            $table->index('logged_at');
            $table->index(['subject_type', 'subject_id']);
            $table->index(['event_category', 'logged_at']);
            $table->index(['barangay_id', 'logged_at']);
            $table->index(['event_type', 'logged_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
};