<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('households', function (Blueprint $table) {
            $table->unsignedBigInteger('head_resident_id')->nullable()->after('head_of_family');
            
            $table->foreign('head_resident_id')
                  ->references('id')
                  ->on('residents')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('households', function (Blueprint $table) {
            $table->dropForeign(['head_resident_id']);
            $table->dropColumn('head_resident_id');
        });
    }
};