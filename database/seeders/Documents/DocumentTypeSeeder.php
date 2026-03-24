<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding document types...');
        
        $categories = DB::table('document_categories')->get()->keyBy('slug');
        
        $docTypes = [
            ['name' => 'UMID ID', 'code' => 'DOC-UMID', 'description' => 'Unified Multi-Purpose ID', 'category_slug' => 'government-ids', 'is_required' => 1],
            ['name' => 'Driver\'s License', 'code' => 'DOC-DL', 'description' => 'Driver\'s license', 'category_slug' => 'government-ids', 'is_required' => 0],
            ['name' => 'Passport', 'code' => 'DOC-PASS', 'description' => 'Philippine Passport', 'category_slug' => 'government-ids', 'is_required' => 0],
            ['name' => 'Barangay Clearance', 'code' => 'DOC-BC', 'description' => 'Barangay Clearance', 'category_slug' => 'barangay-clearances', 'is_required' => 1],
            ['name' => 'Certificate of Residency', 'code' => 'DOC-COR', 'description' => 'Certificate of Residency', 'category_slug' => 'certificates', 'is_required' => 1],
            ['name' => 'Business Permit', 'code' => 'DOC-BP', 'description' => 'Mayor\'s Permit', 'category_slug' => 'business-permits', 'is_required' => 1],
        ];
        
        foreach ($docTypes as $docType) {
            $category = $categories[$docType['category_slug']] ?? null;
            
            if ($category) {
                DB::table('document_types')->updateOrInsert(
                    ['code' => $docType['code']],
                    [
                        'name' => $docType['name'],
                        'code' => $docType['code'],
                        'description' => $docType['description'],
                        'document_category_id' => $category->id,
                        'is_required' => $docType['is_required'],
                        'sort_order' => 0,
                        'accepted_formats' => json_encode(['pdf', 'jpg', 'png']),
                        'max_file_size' => 5120,
                        'is_active' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
        
        $this->command->info('✅ Seeded ' . count($docTypes) . ' document types');
    }
}