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
        Schema::create('resident_privileges', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('resident_id')->nullable()->default(NULL);
            $table->bigInteger('privilege_id')->nullable()->default(NULL);
            $table->string('id_number', 255)->nullable()->default(NULL);
            $table->timestamp('verified_at')->nullable()->default(NULL);
            $table->timestamp('expires_at')->nullable()->default(NULL);
            $table->text('remarks')->nullable()->default(NULL);
            $table->decimal('discount_percentage', 10, 2);
            $table->bigInteger('discount_type_id')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resident_privileges');
    }
};