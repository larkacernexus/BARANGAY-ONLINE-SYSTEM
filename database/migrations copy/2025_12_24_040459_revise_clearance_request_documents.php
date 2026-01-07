<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clearance_request_documents', function (Blueprint $table) {
            // Add document_type_id foreign key
            $table->foreignId('document_type_id')
                  ->nullable()
                  ->after('document_type')
                  ->constrained('document_types')
                  ->nullOnDelete();
            
            // Rename file_type to mime_type for consistency
            $table->renameColumn('file_type', 'mime_type');
            
            // Add missing columns
            $table->string('original_name')->nullable()->after('file_name');
            $table->text('description')->nullable()->after('document_type_id');
            $table->boolean('is_verified')->default(false)->after('description');
            
            // Make document_type nullable since we'll migrate to document_type_id
            $table->string('document_type')->nullable()->change();
        });
    }

  
};