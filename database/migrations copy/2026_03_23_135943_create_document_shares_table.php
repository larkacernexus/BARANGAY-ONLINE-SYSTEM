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
        Schema::create('document_shares', function (Blueprint $table) {
            $table->bigInteger('id')->nullable()->default(NULL);
            $table->bigInteger('document_id')->nullable()->default(NULL);
            $table->string('token', 255)->nullable()->default(NULL);
            $table->string('access_type', 255)->nullable()->default(NULL);
            $table->integer('requires_password')->nullable()->default(NULL);
            $table->string('password', 255)->nullable()->default(NULL);
            $table->timestamp('expires_at')->nullable()->default(NULL);
            $table->integer('max_views')->nullable()->default(NULL);
            $table->integer('view_count')->nullable()->default(NULL);
            $table->integer('is_active')->nullable()->default(NULL);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_shares');
    }
};