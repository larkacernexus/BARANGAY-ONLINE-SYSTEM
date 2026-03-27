<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding document categories...');
        
        $categories = [
            ['name' => 'Government IDs', 'description' => 'Government-issued identification documents', 'slug' => 'government-ids', 'icon' => 'id-card', 'color' => 'blue'],
            ['name' => 'Barangay Clearances', 'description' => 'Barangay clearance documents', 'slug' => 'barangay-clearances', 'icon' => 'file-alt', 'color' => 'green'],
            ['name' => 'Certificates', 'description' => 'Various certificates', 'slug' => 'certificates', 'icon' => 'certificate', 'color' => 'purple'],
            ['name' => 'Business Permits', 'description' => 'Business-related documents', 'slug' => 'business-permits', 'icon' => 'store', 'color' => 'orange'],
            ['name' => 'Land Titles', 'description' => 'Property and land documents', 'slug' => 'land-titles', 'icon' => 'landmark', 'color' => 'red'],
        ];
        
        foreach ($categories as $category) {
            DB::table('document_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'order' => 0,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($categories) . ' document categories');
    }
}