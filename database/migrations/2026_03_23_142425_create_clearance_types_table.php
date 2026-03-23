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
        Schema::create('clearance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('code', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->decimal('fee', 10, 2);
            $table->integer('processing_days')->nullable()->default(NULL);
            $table->integer('validity_days')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('requires_payment')->nullable()->default(NULL);
            $table->integer('requires_approval')->nullable()->default(NULL);
            $table->integer('is_online_only')->nullable()->default(NULL);
            $table->integer('is_discountable')->nullable()->default(NULL);
            $table->text('eligibility_criteria')->nullable()->default(NULL);
            $table->text('purpose_options')->nullable()->default(NULL);
            $table->text('requirements')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clearance_types');
    }
};