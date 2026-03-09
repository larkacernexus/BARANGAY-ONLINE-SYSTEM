SQL 

<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_announcement_attachments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('announcement_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('announcement_id');
            $table->index('mime_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcement_attachments');
    }
};