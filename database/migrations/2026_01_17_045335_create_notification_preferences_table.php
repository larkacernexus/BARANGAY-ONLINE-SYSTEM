<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // fee_reminder, payment_receipt, clearance_status, etc.
            $table->string('channel'); // email, sms, database, push
            $table->boolean('enabled')->default(true);
            $table->json('settings')->nullable(); // Additional settings
            $table->timestamps();
            
            $table->unique(['user_id', 'type', 'channel']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notification_preferences');
    }
};