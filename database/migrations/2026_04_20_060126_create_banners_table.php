<?php
// database/migrations/xxxx_xx_xx_create_banners_table.php

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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('title');
            $table->text('description')->nullable();
            
            // Image Paths
            $table->string('image_path')->nullable();
            $table->string('mobile_image_path')->nullable();
            
            // Link Information
            $table->string('link_url')->nullable();
            $table->string('button_text')->nullable();
            $table->string('alt_text')->nullable();
            
            // Ordering
            $table->integer('sort_order')->default(0);
            
            // Status and Scheduling
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            
            // Targeting
            $table->string('target_audience')->default('all'); // all, specific_roles, specific_puroks
            $table->json('target_roles')->nullable(); // Array of role IDs
            $table->json('target_puroks')->nullable(); // Array of purok IDs
            
            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index('is_active');
            $table->index('sort_order');
            $table->index('target_audience');
            $table->index(['start_date', 'end_date']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};