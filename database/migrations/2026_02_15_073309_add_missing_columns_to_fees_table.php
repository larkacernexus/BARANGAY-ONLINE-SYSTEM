<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('fees', function (Blueprint $table) {
            // Add metadata column for JSON data
            if (!Schema::hasColumn('fees', 'metadata')) {
                $table->json('metadata')->nullable()->after('remarks');
            }
            
            // Add total_discounts column
            if (!Schema::hasColumn('fees', 'total_discounts')) {
                $table->decimal('total_discounts', 10, 2)
                      ->default(0)
                      ->after('total_amount')
                      ->comment('Sum of all discounts applied to this fee');
            }
            
            // Add last_payment_date and last_payment_or
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
                'metadata',
                'total_discounts',
                'last_payment_date',
                'last_payment_or'
            ]);
        });
    }
};