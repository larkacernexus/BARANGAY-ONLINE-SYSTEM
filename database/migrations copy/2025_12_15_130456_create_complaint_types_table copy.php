<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable()->comment('Icon name for UI display');
            $table->string('color')->default('#6B7280')->comment('Hex color for UI display');
            $table->integer('priority_level')->default(3)->comment('1=Critical, 2=High, 3=Medium, 4=Low');
            $table->integer('resolution_days')->default(7)->comment('Expected resolution time in days');
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_immediate_action')->default(false);
            $table->boolean('requires_evidence')->default(false);
            $table->boolean('allows_anonymous')->default(false);
            $table->json('required_fields')->nullable()->comment('JSON array of required form fields');
            $table->json('resolution_steps')->nullable()->comment('JSON array of resolution steps');
            $table->json('assigned_to_roles')->nullable()->comment('JSON array of roles that handle this type');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_active', 'priority_level']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_types');
    }
};