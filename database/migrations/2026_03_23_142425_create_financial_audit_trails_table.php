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
        Schema::create('financial_audit_trails', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('audit_log_id')->nullable()->default(NULL);
            $table->string('fund_source', 255)->nullable()->default(NULL);
            $table->string('account_code', 255)->nullable()->default(NULL);
            $table->string('particulars', 255)->nullable()->default(NULL);
            $table->string('payee', 255)->nullable()->default(NULL);
            $table->string('voucher_number', 255)->nullable()->default(NULL);
            $table->date('transaction_date')->nullable()->default(NULL);
            $table->decimal('debit', 10, 2);
            $table->decimal('credit', 10, 2);
            $table->decimal('balance', 10, 2);
            $table->string('approved_by', 255)->nullable()->default(NULL);
            $table->string('received_by', 255)->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_audit_trails');
    }
};