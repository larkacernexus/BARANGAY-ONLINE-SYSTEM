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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->string('type', 255)->nullable()->default(NULL);
            $table->string('provider', 255)->nullable()->default(NULL);
            $table->string('account_number', 255)->nullable()->default(NULL);
            $table->string('account_name', 255)->nullable()->default(NULL);
            $table->date('expiry_date')->nullable()->default(NULL);
            $table->integer('is_default')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->text('metadata')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};