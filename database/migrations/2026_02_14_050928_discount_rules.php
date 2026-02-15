<?php
// migration for discount_rules table
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('discount_rules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('discount_type'); // SENIOR, PWD, SOLO_PARENT, INDIGENT
            $table->enum('value_type', ['percentage', 'fixed']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('maximum_discount_amount', 10, 2)->nullable();
            $table->decimal('minimum_purchase_amount', 10, 2)->nullable();
            $table->integer('priority')->default(0);
            $table->boolean('requires_verification')->default(true);
            $table->string('verification_document')->nullable();
            $table->string('applicable_to')->default('resident'); // resident, household, business, all
            $table->json('applicable_puroks')->nullable();
            $table->boolean('stackable')->default(false);
            $table->json('exclusive_with')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('discount_type');
            $table->index('is_active');
            $table->index('priority');
        });
    }

    public function down()
    {
        Schema::dropIfExists('discount_rules');
    }
};