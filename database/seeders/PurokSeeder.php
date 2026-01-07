<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Purok;
use Illuminate\Support\Str;

class PurokSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $puroks = [
            [
                'name' => 'Purok 1',
                'slug' => 'purok-1',
                'description' => 'Northwest area near the barangay hall and church. Mostly residential with some small businesses.',
                'leader_name' => 'Juan Dela Cruz',
                'leader_contact' => '09123456789',
                'total_households' => 85,
                'total_residents' => 357,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9600, 7.5400],
                        [124.9620, 7.5400],
                        [124.9620, 7.5420],
                        [124.9600, 7.5420],
                        [124.9600, 7.5400]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 2',
                'slug' => 'purok-2',
                'description' => 'Central market area with commercial establishments and residential houses.',
                'leader_name' => 'Maria Santos',
                'leader_contact' => '09123456788',
                'total_households' => 92,
                'total_residents' => 412,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9620, 7.5380],
                        [124.9640, 7.5380],
                        [124.9640, 7.5400],
                        [124.9620, 7.5400],
                        [124.9620, 7.5380]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 3',
                'slug' => 'purok-3',
                'description' => 'Southside residential area near the elementary school.',
                'leader_name' => 'Pedro Reyes',
                'leader_contact' => '09123456787',
                'total_households' => 78,
                'total_residents' => 298,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9580, 7.5360],
                        [124.9600, 7.5360],
                        [124.9600, 7.5380],
                        [124.9580, 7.5380],
                        [124.9580, 7.5360]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 4',
                'slug' => 'purok-4',
                'description' => 'East riverbank area with farming communities.',
                'leader_name' => 'Ana Torres',
                'leader_contact' => '09123456786',
                'total_households' => 65,
                'total_residents' => 245,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9640, 7.5400],
                        [124.9660, 7.5400],
                        [124.9660, 7.5420],
                        [124.9640, 7.5420],
                        [124.9640, 7.5400]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 5',
                'slug' => 'purok-5',
                'description' => 'Hilltop district with panoramic views of the barangay.',
                'leader_name' => 'Carlos Lim',
                'leader_contact' => '09123456785',
                'total_households' => 45,
                'total_residents' => 178,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9560, 7.5420],
                        [124.9580, 7.5420],
                        [124.9580, 7.5440],
                        [124.9560, 7.5440],
                        [124.9560, 7.5420]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 6',
                'slug' => 'purok-6',
                'description' => 'Farmland area with rice fields and vegetable gardens.',
                'leader_name' => 'Lorna Garcia',
                'leader_contact' => '09123456784',
                'total_households' => 52,
                'total_residents' => 201,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9660, 7.5360],
                        [124.9680, 7.5360],
                        [124.9680, 7.5380],
                        [124.9660, 7.5380],
                        [124.9660, 7.5360]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 7',
                'slug' => 'purok-7',
                'description' => 'Coastal area near the river with fishing communities.',
                'leader_name' => 'Roberto Aquino',
                'leader_contact' => '09123456783',
                'total_households' => 38,
                'total_residents' => 156,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9540, 7.5380],
                        [124.9560, 7.5380],
                        [124.9560, 7.5400],
                        [124.9540, 7.5400],
                        [124.9540, 7.5380]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 8',
                'slug' => 'purok-8',
                'description' => 'New development area with modern housing projects.',
                'leader_name' => 'Sofia Ramos',
                'leader_contact' => '09123456782',
                'total_households' => 32,
                'total_residents' => 128,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9680, 7.5420],
                        [124.9700, 7.5420],
                        [124.9700, 7.5440],
                        [124.9680, 7.5440],
                        [124.9680, 7.5420]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 9',
                'slug' => 'purok-9',
                'description' => 'Mixed commercial and residential zone near the highway.',
                'leader_name' => 'Miguel Fernandez',
                'leader_contact' => '09123456781',
                'total_households' => 56,
                'total_residents' => 234,
                'status' => 'active',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9620, 7.5420],
                        [124.9640, 7.5420],
                        [124.9640, 7.5440],
                        [124.9620, 7.5440],
                        [124.9620, 7.5420]
                    ]]
                ]),
            ],
            [
                'name' => 'Purok 10',
                'slug' => 'purok-10',
                'description' => 'Educational zone near the high school and library.',
                'leader_name' => 'Carmen Reyes',
                'leader_contact' => '09123456780',
                'total_households' => 41,
                'total_residents' => 189,
                'status' => 'inactive',
                'boundaries' => json_encode([
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [124.9600, 7.5440],
                        [124.9620, 7.5440],
                        [124.9620, 7.5460],
                        [124.9600, 7.5460],
                        [124.9600, 7.5440]
                    ]]
                ]),
            ],
        ];

        // Clear existing puroks (optional)
        Purok::truncate();

        // Insert puroks
        foreach ($puroks as $purok) {
            Purok::create($purok);
        }

        $this->command->info('Successfully seeded ' . count($puroks) . ' puroks.');
        $this->command->info('Active puroks: ' . Purok::where('status', 'active')->count());
        $this->command->info('Inactive puroks: ' . Purok::where('status', 'inactive')->count());
        $this->command->info('Total households across all puroks: ' . Purok::sum('total_households'));
        $this->command->info('Total residents across all puroks: ' . Purok::sum('total_residents'));
    }
}