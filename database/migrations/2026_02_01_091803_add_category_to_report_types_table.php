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
        Schema::table('report_types', function (Blueprint $table) {
            // Add category column with default value 'issue'
            $table->string('category')->default('issue')->after('code');
            
            // Add subcategory column (nullable)
            $table->string('subcategory')->nullable()->after('category');
            
            // You might also want to add an index for better performance
            $table->index('category');
            $table->index('subcategory');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_types', function (Blueprint $table) {
            $table->dropColumn(['category', 'subcategory']);
        });
    }
};