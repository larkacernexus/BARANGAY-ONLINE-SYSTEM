<?php
// database/migrations/2024_01_02_000000_add_missing_fields_to_forms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('forms', function (Blueprint $table) {
            // Add mime_type column
            if (!Schema::hasColumn('forms', 'mime_type')) {
                $table->string('mime_type')->nullable()->after('file_type');
            }
            
            // Add featured and access control columns
            if (!Schema::hasColumn('forms', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_active');
            }
            
            if (!Schema::hasColumn('forms', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('is_featured');
            }
            
            if (!Schema::hasColumn('forms', 'requires_login')) {
                $table->boolean('requires_login')->default(false)->after('is_public');
            }
            
            // Add tags column (JSON)
            if (!Schema::hasColumn('forms', 'tags')) {
                $table->json('tags')->nullable()->after('requires_login');
            }
            
            // Add form metadata columns
            if (!Schema::hasColumn('forms', 'version')) {
                $table->string('version', 50)->nullable()->after('tags');
            }
            
            if (!Schema::hasColumn('forms', 'valid_from')) {
                $table->date('valid_from')->nullable()->after('version');
            }
            
            if (!Schema::hasColumn('forms', 'valid_until')) {
                $table->date('valid_until')->nullable()->after('valid_from');
            }
            
            if (!Schema::hasColumn('forms', 'language')) {
                $table->string('language', 50)->nullable()->default('en')->after('valid_until');
            }
            
            if (!Schema::hasColumn('forms', 'pages')) {
                $table->integer('pages')->nullable()->after('language');
            }
            
            // Add activity tracking columns
            if (!Schema::hasColumn('forms', 'last_viewed_at')) {
                $table->timestamp('last_viewed_at')->nullable()->after('pages');
            }
            
            if (!Schema::hasColumn('forms', 'last_viewed_by')) {
                $table->foreignId('last_viewed_by')->nullable()->constrained('users')->nullOnDelete()->after('last_viewed_at');
            }
            
            if (!Schema::hasColumn('forms', 'last_downloaded_at')) {
                $table->timestamp('last_downloaded_at')->nullable()->after('last_viewed_by');
            }
            
            if (!Schema::hasColumn('forms', 'last_downloaded_by')) {
                $table->foreignId('last_downloaded_by')->nullable()->constrained('users')->nullOnDelete()->after('last_downloaded_at');
            }
            
            // Add view_count if missing (you mentioned it exists, but checking anyway)
            if (!Schema::hasColumn('forms', 'view_count')) {
                $table->integer('view_count')->default(0)->after('download_count');
            }
            
            // Add indexes
            $table->index('is_featured');
            $table->index('is_public');
            $table->index('requires_login');
            $table->index('last_viewed_at');
            $table->index('last_downloaded_at');
        });
    }

    public function down()
    {
        Schema::table('forms', function (Blueprint $table) {
            // Remove columns if they exist
            $columns = [
                'mime_type',
                'is_featured',
                'is_public',
                'requires_login',
                'tags',
                'version',
                'valid_from',
                'valid_until',
                'language',
                'pages',
                'last_viewed_at',
                'last_viewed_by',
                'last_downloaded_at',
                'last_downloaded_by',
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('forms', $column)) {
                    $table->dropColumn($column);
                }
            }
            
            // Remove indexes
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['is_public']);
            $table->dropIndex(['requires_login']);
            $table->dropIndex(['last_viewed_at']);
            $table->dropIndex(['last_downloaded_at']);
        });
    }
};