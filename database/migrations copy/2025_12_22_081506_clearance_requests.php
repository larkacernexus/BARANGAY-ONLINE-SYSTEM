<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clearance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->foreignId('clearance_type_id')->constrained()->onDelete('cascade');
            $table->string('reference_number')->unique();
            $table->string('purpose');
            $table->text('specific_purpose');
            $table->enum('urgency', ['normal', 'rush', 'express'])->default('normal');
            $table->date('needed_date');
            $table->json('additional_requirements')->nullable();
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->enum('status', [
                'pending',
                'processing',
                'approved',
                'rejected',
                'cancelled',
                'pending_payment'
            ])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->foreignId('clearance_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->index(['resident_id', 'status']);
            $table->index('reference_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('clearance_requests');
    }
};