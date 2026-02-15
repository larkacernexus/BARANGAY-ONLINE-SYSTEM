<?php
// migration for payment_discounts table
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('discount_rule_id')->constrained()->onDelete('cascade');
            $table->decimal('discount_amount', 10, 2);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->boolean('id_presented')->default(false);
            $table->string('id_number')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['payment_id', 'discount_rule_id']);
            $table->index('verified_by');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_discounts');
    }
};