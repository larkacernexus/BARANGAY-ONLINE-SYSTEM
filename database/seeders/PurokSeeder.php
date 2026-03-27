<?php

namespace Database\Seeders;

use App\Models\Purok;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PurokSeeder extends Seeder
{
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
                'google_maps_url' => 'https://goo.gl/maps/example1',
            ],
            [
                'name' => 'Purok 2',
                'slug' => 'purok-2',
                'description' => 'Central area surrounding the public market. Commercial and residential mixed.',
                'leader_name' => 'Maria Santos',
                'leader_contact' => '09187654321',
                'total_households' => 92,
                'total_residents' => 412,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example2',
            ],
            [
                'name' => 'Purok 3',
                'slug' => 'purok-3',
                'description' => 'Eastern hillside area with agricultural lands and scattered residences.',
                'leader_name' => 'Pedro Reyes',
                'leader_contact' => '09234567890',
                'total_households' => 68,
                'total_residents' => 289,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example3',
            ],
            [
                'name' => 'Purok 4',
                'slug' => 'purok-4',
                'description' => 'Southern riverbank area, prone to flooding but densely populated.',
                'leader_name' => 'Ana Lopez',
                'leader_contact' => '09345678901',
                'total_households' => 110,
                'total_residents' => 523,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example4',
            ],
            [
                'name' => 'Purok 5',
                'slug' => 'purok-5',
                'description' => 'Western industrial zone with warehouses and workers\' housing.',
                'leader_name' => 'Jose Mercado',
                'leader_contact' => '09456789012',
                'total_households' => 74,
                'total_residents' => 336,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example5',
            ],
            [
                'name' => 'Purok 6',
                'slug' => 'purok-6',
                'description' => 'Northern residential subdivision with mostly middle-class families.',
                'leader_name' => 'Elena Villanueva',
                'leader_contact' => '09567890123',
                'total_households' => 120,
                'total_residents' => 480,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example6',
            ],
            [
                'name' => 'Purok 7',
                'slug' => 'purok-7',
                'description' => 'Northeastern area with newly developed housing projects.',
                'leader_name' => 'Ricardo Gomez',
                'leader_contact' => '09678901234',
                'total_households' => 95,
                'total_residents' => 398,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example7',
            ],
            [
                'name' => 'Purok 8',
                'slug' => 'purok-8',
                'description' => 'Southeastern agricultural area with farming families.',
                'leader_name' => 'Luzviminda Fernandez',
                'leader_contact' => '09789012345',
                'total_households' => 82,
                'total_residents' => 345,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example8',
            ],
            [
                'name' => 'Purok 9',
                'slug' => 'purok-9',
                'description' => 'Southwestern coastal area with fishing community.',
                'leader_name' => 'Roberto Aquino',
                'leader_contact' => '09890123456',
                'total_households' => 78,
                'total_residents' => 367,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example9',
            ],
            [
                'name' => 'Purok 10',
                'slug' => 'purok-10',
                'description' => 'Central business district with most commercial establishments.',
                'leader_name' => 'Cecilia Ramos',
                'leader_contact' => '09901234567',
                'total_households' => 105,
                'total_residents' => 445,
                'status' => 'active',
                'google_maps_url' => 'https://goo.gl/maps/example10',
            ],
        ];

        foreach ($puroks as $purok) {
            Purok::updateOrCreate(
                ['slug' => $purok['slug']],
                $purok
            );
        }

        $this->command->info('Puroks seeded successfully!');
    }
}