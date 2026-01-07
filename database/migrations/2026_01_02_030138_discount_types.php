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
        Schema::create('discount_types', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique(); // e.g., SENIOR, PWD, SOLO_PARENT
    $table->string('name'); // e.g., "Senior Citizen", "Person with Disability"
    $table->text('description')->nullable();
    $table->decimal('default_percentage', 5, 2)->default(0); // Default percentage
    $table->string('legal_basis')->nullable(); // RA 9994, RA 10754, etc.
    $table->json('requirements')->nullable(); // Required documents
    $table->boolean('is_active')->default(true);
    $table->boolean('is_mandatory')->default(false); // Required by law
    $table->integer('sort_order')->default(0);
    $table->timestamps();
    $table->softDeletes();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
