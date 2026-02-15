<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->string('position'); // Captain, Kagawad, Secretary, Treasurer, SK Chairman, etc.
            $table->string('committee')->nullable(); // Committee assignment
            $table->date('term_start');
            $table->date('term_end');
            $table->enum('status', ['active', 'inactive', 'former'])->default('active');
            $table->integer('order')->default(0); // For ordering in display
            $table->text('responsibilities')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('achievements')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('is_regular')->default(true); // Regular or ex-officio
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'position']);
            $table->unique(['resident_id', 'position', 'term_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('officials');
    }
};