<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fees', function (Blueprint $table) {
            // Only add columns, skip indexes since they might already exist
            if (!Schema::hasColumn('fees', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('total_amount');
            }
            
            if (!Schema::hasColumn('fees', 'balance')) {
                $table->decimal('balance', 10, 2)->default(0)->after('amount_paid');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fees', function (Blueprint $table) {
            if (Schema::hasColumn('fees', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }
            
            if (Schema::hasColumn('fees', 'balance')) {
                $table->dropColumn('balance');
            }
        });
    }
};