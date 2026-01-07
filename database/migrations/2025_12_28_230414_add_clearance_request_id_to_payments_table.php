<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('clearance_request_id')->nullable()->after('id');
            $table->foreign('clearance_request_id')->references('id')->on('clearance_requests')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['clearance_request_id']);
            $table->dropColumn('clearance_request_id');
        });
    }
};