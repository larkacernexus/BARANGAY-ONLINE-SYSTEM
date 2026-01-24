<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resident_documents', function (Blueprint $table) {
            // Add document_type_id if not exists
            if (!Schema::hasColumn('resident_documents', 'document_type_id')) {
                $table->foreignId('document_type_id')->nullable()->constrained('document_types')->nullOnDelete()->after('document_category_id');
            }
            
            // Add tags column
            if (!Schema::hasColumn('resident_documents', 'tags')) {
                $table->json('tags')->nullable();
            }
            
            // Add scan_quality column
            if (!Schema::hasColumn('resident_documents', 'scan_quality')) {
                $table->string('scan_quality')->nullable();
            }
            
            // Add security features columns
            if (!Schema::hasColumn('resident_documents', 'add_watermark')) {
                $table->boolean('add_watermark')->default(false);
            }
            
            if (!Schema::hasColumn('resident_documents', 'enable_encryption')) {
                $table->boolean('enable_encryption')->default(false);
            }
            
            if (!Schema::hasColumn('resident_documents', 'audit_log_access')) {
                $table->boolean('audit_log_access')->default(false);
            }
            
            if (!Schema::hasColumn('resident_documents', 'security_options')) {
                $table->json('security_options')->nullable();
            }
            
            // Add uploaded_by and uploaded_at columns
            if (!Schema::hasColumn('resident_documents', 'uploaded_by')) {
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            }
            
            if (!Schema::hasColumn('resident_documents', 'uploaded_at')) {
                $table->timestamp('uploaded_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('resident_documents', function (Blueprint $table) {
            $table->dropColumn([
                'document_type_id',
                'tags',
                'scan_quality',
                'add_watermark',
                'enable_encryption',
                'audit_log_access',
                'security_options',
                'uploaded_by',
                'uploaded_at',
            ]);
        });
    }
};