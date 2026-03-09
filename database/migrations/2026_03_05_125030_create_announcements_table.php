<?php
// database/migrations/2024_01_01_000001_create_announcements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            
            // Basic announcement fields
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['general', 'important', 'event', 'maintenance', 'other'])->default('general');
            $table->integer('priority')->default(0)->comment('0=Normal,1=Low,2=Medium,3=High,4=Urgent');
            $table->boolean('is_active')->default(true);
            
            // Scheduling fields
            $table->date('start_date')->nullable();
            $table->time('start_time')->nullable();
            $table->date('end_date')->nullable();
            $table->time('end_time')->nullable();
            
            // Audience targeting fields
            $table->enum('audience_type', [
                'all', 
                'roles', 
                'puroks', 
                'households', 
                'household_members', 
                'businesses', 
                'specific_users'
            ])->default('all')->after('is_active');
            
            $table->json('target_roles')->nullable()->comment('Array of role IDs');
            $table->json('target_puroks')->nullable()->comment('Array of purok IDs');
            $table->json('target_households')->nullable()->comment('Array of household IDs');
            $table->json('target_users')->nullable()->comment('Array of user IDs');
            $table->json('target_businesses')->nullable()->comment('Array of business IDs');
            
            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Soft deletes
            $table->softDeletes();
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('type');
            $table->index('priority');
            $table->index('is_active');
            $table->index('audience_type');
            $table->index('start_date');
            $table->index('end_date');
            $table->index(['start_date', 'end_date']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcements');
    }
};