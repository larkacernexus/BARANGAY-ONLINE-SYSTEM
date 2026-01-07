<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('households', function (Blueprint $table) {
            // Add internet column if it doesn't exist
            if (!Schema::hasColumn('households', 'internet')) {
                $table->boolean('internet')->default(false)->after('electricity');
            }
            
            // Add vehicle column if it doesn't exist
            if (!Schema::hasColumn('households', 'vehicle')) {
                $table->boolean('vehicle')->default(false)->after('internet');
            }
        });
    }

    public function down()
    {
        Schema::table('households', function (Blueprint $table) {
            $table->dropColumn(['internet', 'vehicle']);
        });
    }
};