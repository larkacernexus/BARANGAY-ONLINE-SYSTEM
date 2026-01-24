<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserLoginLogsTable extends Migration
{
    public function up()
    {
        Schema::create('user_login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('device_type', 50)->nullable(); // desktop, mobile, tablet
            $table->string('browser', 100)->nullable();
            $table->string('platform', 100)->nullable();
            $table->timestamp('login_at')->useCurrent();
            $table->timestamp('logout_at')->nullable();
            $table->boolean('is_successful')->default(true);
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'login_at']);
            $table->index('login_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_login_logs');
    }
}