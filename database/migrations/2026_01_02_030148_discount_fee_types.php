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
       Schema::create('discount_fee_types', function (Blueprint $table) {
    $table->id();
    $table->foreignId('fee_type_id')->constrained('fee_types')->onDelete('cascade');
    $table->foreignId('discount_type_id')->constrained('discount_types')->onDelete('cascade');
    $table->decimal('percentage', 5, 2); // Custom percentage for this fee type
    $table->boolean('is_active')->default(true);
    $table->integer('sort_order')->default(0);
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->unique(['fee_type_id', 'discount_type_id']); // Prevent duplicates
    $table->index('fee_type_id');
    $table->index('discount_type_id');
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
