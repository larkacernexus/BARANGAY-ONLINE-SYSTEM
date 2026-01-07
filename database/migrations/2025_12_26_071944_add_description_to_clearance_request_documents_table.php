<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clearance_request_documents', function (Blueprint $table) {
            $table->text('description')->nullable()->after('document_type_id');
            // Rename file_type to mime_type (optional)
            $table->renameColumn('file_type', 'mime_type');
        });
    }

    public function down()
    {
        Schema::table('clearance_request_documents', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->renameColumn('mime_type', 'file_type');
        });
    }
};