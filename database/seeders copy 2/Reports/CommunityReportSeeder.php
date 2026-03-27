<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding community reports...');
        
        $reportTypes = DB::table('report_types')->get()->keyBy('code');
        $users = DB::table('users')->get()->keyBy('username');
        $residents = DB::table('residents')->get();
        
        $reports = [
            [
                'title' => 'Excessive Noise from Karaoke',
                'description' => 'Loud karaoke past midnight disturbing the neighborhood',
                'report_type_code' => 'REP-NOISE',
                'location' => 'Purok 1',
                'incident_date' => '2024-03-20',
                'urgency_level' => 'medium',
                'affected_people' => 'community',
                'status' => 'pending',
                'reporter_username' => 'resident1',
            ],
            [
                'title' => 'Uncollected Garbage',
                'description' => 'Garbage not collected for 3 days, causing foul odor',
                'report_type_code' => 'REP-WASTE',
                'location' => 'Purok 2',
                'incident_date' => '2024-03-21',
                'urgency_level' => 'high',
                'affected_people' => 'community',
                'status' => 'in_progress',
                'reporter_username' => 'resident1',
            ],
            [
                'title' => 'Street Light Not Working',
                'description' => 'Street light at corner of Purok 3 has been out for a week',
                'report_type_code' => 'REP-LIGHT',
                'location' => 'Purok 3',
                'incident_date' => '2024-03-18',
                'urgency_level' => 'low',
                'affected_people' => 'community',
                'status' => 'resolved',
                'reporter_username' => 'resident2',
            ],
        ];
        
        $createdCount = 0;
        
        foreach ($reports as $report) {
            $reportType = $reportTypes[$report['report_type_code']] ?? null;
            $user = $users[$report['reporter_username']] ?? null;
            $resident = $user ? $residents->where('user_id', $user->id)->first() : null;
            
            if ($reportType && $user && $resident) {
                DB::table('community_reports')->insert([
                    'report_type_id' => $reportType->id,
                    'report_number' => 'REP-' . strtoupper(Str::random(8)),
                    'title' => $report['title'],
                    'description' => $report['description'],
                    'location' => $report['location'],
                    'incident_date' => $report['incident_date'],
                    'urgency_level' => $report['urgency_level'],
                    'affected_people' => $report['affected_people'],
                    'status' => $report['status'],
                    'user_id' => $user->id,
                    'reporter_name' => $resident->first_name . ' ' . $resident->last_name,
                    'reporter_contact' => $resident->contact_number,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdCount++;
            }
        }
        
        $this->command->info('✅ Seeded ' . $createdCount . ' community reports');
    }
}