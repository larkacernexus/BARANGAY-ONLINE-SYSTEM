<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding forms...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $admin = $users['admin'] ?? null;
        
        $forms = [
            [
                'title' => 'Barangay Clearance Application Form',
                'slug' => 'barangay-clearance-application',
                'description' => 'Application form for barangay clearance',
                'file_name' => 'barangay-clearance-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Clearance',
                'is_featured' => 1,
            ],
            [
                'title' => 'Certificate of Residency Form',
                'slug' => 'certificate-of-residency',
                'description' => 'Form for requesting certificate of residency',
                'file_name' => 'certificate-residency-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Certificate',
                'is_featured' => 1,
            ],
            [
                'title' => 'Business Permit Application',
                'slug' => 'business-permit-application',
                'description' => 'Application form for business permit',
                'file_name' => 'business-permit-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Business',
                'is_featured' => 0,
            ],
            [
                'title' => 'Blotter Report Form',
                'slug' => 'blotter-report-form',
                'description' => 'Form for reporting incidents',
                'file_name' => 'blotter-report-form.pdf',
                'file_type' => 'pdf',
                'category' => 'Blotter',
                'is_featured' => 0,
            ],
        ];
        
        foreach ($forms as $form) {
            DB::table('forms')->updateOrInsert(
                ['slug' => $form['slug']],
                array_merge($form, [
                    'file_path' => '/forms/' . $form['file_name'],
                    'is_active' => 1,
                    'is_public' => 1,
                    'download_count' => 0,
                    'created_by' => $admin->id ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
        
        $this->command->info('✅ Seeded ' . count($forms) . ' forms');
    }
}