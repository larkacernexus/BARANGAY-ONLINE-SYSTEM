<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupportCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding support categories...');
        
        $categories = [
            ['name' => 'Account Issues', 'slug' => 'account-issues', 'description' => 'Problems with user account or login'],
            ['name' => 'Document Request', 'slug' => 'document-request', 'description' => 'Request for barangay documents'],
            ['name' => 'Payment Issues', 'slug' => 'payment-issues', 'description' => 'Problems with payments and receipts'],
            ['name' => 'Technical Support', 'slug' => 'technical-support', 'description' => 'Technical problems with the website'],
            ['name' => 'General Inquiry', 'slug' => 'general-inquiry', 'description' => 'General questions and concerns'],
        ];
        
        foreach ($categories as $category) {
            DB::table('support_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, [
                    'order' => 0,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($categories) . ' support categories');
    }
}