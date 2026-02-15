<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('fees', function (Blueprint $table) {
            // Add total_discounts column if it doesn't exist
            if (!Schema::hasColumn('fees', 'total_discounts')) {
                $table->decimal('total_discounts', 10, 2)
                      ->default(0)
                      ->after('total_amount')
                      ->comment('Sum of all discounts applied to this fee');
            }
            
            // Also add last_payment_date and last_payment_or if they don't exist
            if (!Schema::hasColumn('fees', 'last_payment_date')) {
                $table->timestamp('last_payment_date')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('fees', 'last_payment_or')) {
                $table->string('last_payment_or', 100)->nullable()->after('last_payment_date');
            }
        });
    }

    public function down()
    {
        Schema::table('fees', function (Blueprint $table) {
            $table->dropColumn([
                'total_discounts',
                'last_payment_date',
                'last_payment_or'
            ]);
        });
    }
};