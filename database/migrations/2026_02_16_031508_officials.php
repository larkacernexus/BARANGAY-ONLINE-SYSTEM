<?php
// database/migrations/2024_01_01_000036_create_officials_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('officials', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('resident_id')->constrained()->cascadeOnDelete();
            $table->string('position')->comment('captain, kagawad, secretary, treasurer, sk_chairman, sk_kagawad, secretary_treasurer');
            $table->string('committee')->nullable();
            $table->date('term_start');
            $table->date('term_end');
            $table->string('status')->default('active')->comment('active, former, resigned, deceased');
            $table->integer('order')->default(0);
            $table->text('responsibilities')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('achievements')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('is_regular')->default(true)->comment('true=regular official, false=ex-officio');
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('resident_id');
            $table->index('position');
            $table->index('committee');
            $table->index('status');
            $table->index('order');
            $table->index('term_start');
            $table->index('term_end');
            $table->index('is_regular');
            $table->index(['position', 'status', 'term_start', 'term_end'], 'idx_position_status_term');
        });
    }

    public function down()
    {
        Schema::dropIfExists('officials');
    }
};