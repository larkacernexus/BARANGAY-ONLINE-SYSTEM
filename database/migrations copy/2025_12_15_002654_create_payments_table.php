<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resident_id');
            $table->string('type');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->date('due_date')->nullable();
            $table->date('period_from')->nullable();
            $table->date('period_to')->nullable();
            $table->string('receipt_number')->unique();
            $table->string('payment_method');
            $table->string('reference_number')->nullable();
            $table->enum('status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->text('remarks')->nullable();
            $table->string('collecting_officer');
            $table->timestamps();
            
            $table->foreign('resident_id')
                  ->references('id')
                  ->on('residents')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};