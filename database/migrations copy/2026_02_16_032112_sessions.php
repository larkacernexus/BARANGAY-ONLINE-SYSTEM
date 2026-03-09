<?php
// database/migrations/2024_01_01_000051_create_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
            
            // Additional fields for tracking
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('last_activity');
        });
    }

    public function down()
    {
        Schema::dropIfExists('sessions');
    }
};