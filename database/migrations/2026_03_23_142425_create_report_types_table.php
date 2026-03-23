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
        Schema::create('report_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->string('category', 255)->nullable()->default(NULL);
            $table->string('subcategory', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->string('icon', 255)->nullable()->default(NULL);
            $table->string('color', 255)->nullable()->default(NULL);
            $table->integer('priority_level')->nullable()->default(NULL);
            $table->integer('resolution_days')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('requires_immediate_action')->nullable()->default(NULL);
            $table->integer('requires_evidence')->nullable()->default(NULL);
            $table->integer('allows_anonymous')->nullable()->default(NULL);
            $table->text('required_fields')->nullable()->default(NULL);
            $table->text('resolution_steps')->nullable()->default(NULL);
            $table->text('assigned_to_roles')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_types');
    }
};