<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clearances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resident_id');
            $table->string('type');
            $table->text('purpose');
            $table->date('issue_date');
            $table->date('valid_until');
            $table->string('clearance_number')->unique();
            $table->decimal('fee_amount', 10, 2)->nullable();
            $table->json('requirements_met')->nullable();
            $table->text('remarks')->nullable();
            $table->string('issuing_officer');
            $table->enum('status', ['pending', 'issued', 'rejected', 'expired'])->default('pending');
            $table->timestamps();
            
            $table->foreign('resident_id')
                  ->references('id')
                  ->on('residents')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clearances');
    }
};