<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding announcements...');
        
        $users = DB::table('users')->get()->keyBy('username');
        $admin = $users['admin'] ?? null;
        $roles = DB::table('roles')->get()->keyBy('name');
        
        $announcements = [
            [
                'title' => 'Barangay Assembly 2024',
                'content' => 'The Barangay Assembly will be held on March 30, 2024 at 8:00 AM at the Barangay Hall. All residents are invited to attend.',
                'type' => 'event',
                'priority' => 3,
                'start_date' => '2024-03-30',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-30',
                'end_time' => '12:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Free Medical Mission',
                'content' => 'Free medical check-up and dental services on April 15, 2024 from 7:00 AM to 4:00 PM at the Barangay Health Center.',
                'type' => 'event',
                'priority' => 2,
                'start_date' => '2024-04-15',
                'start_time' => '07:00:00',
                'end_date' => '2024-04-15',
                'end_time' => '16:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Water Interruption Advisory',
                'content' => 'There will be a water interruption on March 25, 2024 from 8:00 AM to 5:00 PM due to pipeline repair.',
                'type' => 'maintenance',
                'priority' => 4,
                'start_date' => '2024-03-25',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-25',
                'end_time' => '17:00:00',
                'audience_type' => 'all',
                'created_by' => $admin->id ?? null,
            ],
            [
                'title' => 'Registration for Senior Citizens',
                'content' => 'Senior citizens are requested to update their records at the Barangay Hall from March 1-15, 2024.',
                'type' => 'important',
                'priority' => 3,
                'start_date' => '2024-03-01',
                'start_time' => '08:00:00',
                'end_date' => '2024-03-15',
                'end_time' => '17:00:00',
                'audience_type' => 'roles',
                'target_roles' => $roles['Resident'] ? json_encode([$roles['Resident']->id]) : null,
                'created_by' => $admin->id ?? null,
            ],
        ];
        
        foreach ($announcements as $announcement) {
            DB::table('announcements')->insert(array_merge($announcement, [
                'is_active' => 1,
                'updated_by' => $announcement['created_by'],
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
        
        $this->command->info('✅ Seeded ' . count($announcements) . ' announcements');
    }
}