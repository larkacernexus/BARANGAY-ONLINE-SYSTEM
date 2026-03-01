<?php
// database/migrations/2024_01_01_000010_create_clearance_types_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clearance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('fee', 12, 2)->default(0);
            $table->boolean('is_discountable')->default(false);
            $table->integer('processing_days')->default(1);
            $table->integer('validity_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_payment')->default(true);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('is_online_only')->default(false);
            $table->json('requirements')->nullable();
            $table->json('eligibility_criteria')->nullable();
            $table->json('purpose_options')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('name');
            $table->index('is_active');
            $table->index('fee');
            $table->index('is_discountable');
            $table->index(['is_active', 'requires_payment']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('clearance_types');
    }
};