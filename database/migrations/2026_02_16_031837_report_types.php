<?php
// database/migrations/2024_01_01_000044_create_report_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('report_types', function (Blueprint $table) {
            $table->id();
            
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->integer('priority_level')->default(3)->comment('1=Critical, 2=High, 3=Medium, 4=Low');
            $table->integer('resolution_days')->default(3)->comment('Expected days to resolve');
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_immediate_action')->default(false);
            $table->boolean('requires_evidence')->default(false);
            $table->boolean('allows_anonymous')->default(true);
            $table->json('required_fields')->nullable();
            $table->json('resolution_steps')->nullable();
            $table->json('assigned_to_roles')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('priority_level');
            $table->index('is_active');
            $table->index('requires_immediate_action');
        });
    }

    public function down()
    {
        Schema::dropIfExists('report_types');
    }
};