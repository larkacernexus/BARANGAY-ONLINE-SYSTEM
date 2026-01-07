<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clearance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('fee', 10, 2)->default(0);
            $table->integer('processing_days')->default(3)->comment('Estimated processing time in days');
            $table->integer('validity_days')->nullable()->comment('Number of days the clearance is valid');
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_payment')->default(true);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('is_online_only')->default(false);
            $table->json('requirements')->nullable()->comment('JSON array of required documents');
            $table->json('eligibility_criteria')->nullable()->comment('JSON array of eligibility criteria');
            $table->text('purpose_options')->nullable()->comment('Common purposes for this clearance');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('is_active');
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clearance_types');
    }
};