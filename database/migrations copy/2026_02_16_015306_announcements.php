<?php
// database/migrations/2024_01_01_000003_create_announcements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('type')->default('general')->comment('general, important, event, maintenance, other');
            $table->tinyInteger('priority')->default(0)->comment('0=Normal,1=Low,2=Medium,3=High,4=Urgent');
            $table->boolean('is_active')->default(true);
            $table->date('start_date')->nullable();
            $table->time('start_time')->nullable();
            $table->date('end_date')->nullable();
            $table->time('end_time')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('type');
            $table->index('priority');
            $table->index('is_active');
            $table->index('start_date');
            $table->index('end_date');
            $table->index(['is_active', 'start_date', 'end_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcements');
    }
};