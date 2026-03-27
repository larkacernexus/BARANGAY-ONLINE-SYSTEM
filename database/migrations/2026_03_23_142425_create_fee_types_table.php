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
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 255)->nullable()->default(NULL);
            $table->bigInteger('document_category_id')->nullable()->default(NULL);
            $table->integer('is_discountable')->nullable()->default(NULL);
            $table->string('name', 255)->nullable()->default(NULL);
            $table->string('short_name', 255)->nullable()->default(NULL);
            $table->decimal('base_amount', 10, 2);
            $table->string('amount_type', 255)->nullable();
            $table->text('computation_formula')->nullable()->default(NULL);
            $table->string('unit', 255)->nullable()->default(NULL);
            $table->text('description')->nullable()->default(NULL);
            $table->integer('has_senior_discount')->nullable()->default(NULL);
            $table->decimal('senior_discount_percentage', 10, 2);
            $table->integer('has_pwd_discount')->nullable()->default(NULL);
            $table->decimal('pwd_discount_percentage', 10, 2)->nullable();
            $table->integer('has_solo_parent_discount')->nullable()->default(NULL);
            $table->decimal('solo_parent_discount_percentage', 10, 2)->nullable();
            $table->integer('has_indigent_discount')->nullable()->default(NULL);
            $table->decimal('indigent_discount_percentage', 10, 2)->nullable();
            $table->integer('has_surcharge')->nullable()->default(NULL);
            $table->decimal('surcharge_percentage', 10, 2)->nullable();
            $table->decimal('surcharge_fixed', 10, 2)->nullable();
            $table->integer('has_penalty')->nullable()->default(NULL);
            $table->decimal('penalty_percentage', 10, 2)->nullable();
            $table->decimal('penalty_fixed', 10, 2)->nullable();
            $table->string('frequency')->nullable();
            $table->integer('validity_days')->nullable()->default(NULL);
            $table->string('applicable_to', 255)->nullable()->default(NULL);
            $table->text('applicable_puroks')->nullable()->default(NULL);
            $table->text('requirements')->nullable()->default(NULL);
            $table->date('effective_date')->nullable()->default(NULL);
            $table->date('expiry_date')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->integer('is_mandatory')->nullable()->default(NULL);
            $table->integer('auto_generate')->nullable()->default(NULL);
            $table->integer('due_day')->nullable()->default(NULL);
            $table->integer('sort_order')->nullable()->default(NULL);
            $table->text('notes')->nullable()->default(NULL);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_types');
    }
};