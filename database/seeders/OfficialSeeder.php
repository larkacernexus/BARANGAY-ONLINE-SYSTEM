<?php

namespace Database\Seeders;

use App\Models\Official;
use App\Models\Resident;
use App\Models\Position;
use App\Models\Committee;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OfficialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, make sure we have residents to assign as officials
        $this->ensureResidentsExist();
        
        // Seed current barangay officials
        $this->seedCurrentOfficials();
        
        // Seed former officials (historical data)
        $this->seedFormerOfficials();
        
        // Seed SK officials
        $this->seedSKOfficials();
        
        $this->command->info('Officials seeded successfully!');
    }

    /**
     * Ensure we have residents to assign as officials
     */
    private function ensureResidentsExist(): void
    {
        // Check if we have any residents, if not, create dummy residents
        if (Resident::count() === 0) {
            $this->command->info('No residents found. Creating dummy residents...');
            
            $residents = [
                [
                    'first_name' => 'Juan',
                    'middle_name' => 'Dela',
                    'last_name' => 'Cruz',
                    'suffix' => 'Sr.',
                    'gender' => 'male',
                    'birth_date' => '1970-01-15',
                    'civil_status' => 'married',
                    'contact_number' => '09123456789',
                    'email' => 'juan.cruz@example.com',
                    'address' => '123 Rizal St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Maria',
                    'middle_name' => 'Santos',
                    'last_name' => 'Reyes',
                    'suffix' => null,
                    'gender' => 'female',
                    'birth_date' => '1975-03-20',
                    'civil_status' => 'married',
                    'contact_number' => '09234567890',
                    'email' => 'maria.reyes@example.com',
                    'address' => '456 Mabini St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Pedro',
                    'middle_name' => 'Gonzales',
                    'last_name' => 'Santos',
                    'suffix' => 'Jr.',
                    'gender' => 'male',
                    'birth_date' => '1980-07-10',
                    'civil_status' => 'single',
                    'contact_number' => '09345678901',
                    'email' => 'pedro.santos@example.com',
                    'address' => '789 Bonifacio St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Ana',
                    'middle_name' => 'Luna',
                    'last_name' => 'Fernandez',
                    'suffix' => null,
                    'gender' => 'female',
                    'birth_date' => '1985-11-05',
                    'civil_status' => 'single',
                    'contact_number' => '09456789012',
                    'email' => 'ana.fernandez@example.com',
                    'address' => '101 Quezon Ave., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Jose',
                    'middle_name' => 'Mercado',
                    'last_name' => 'Rizal',
                    'suffix' => null,
                    'gender' => 'male',
                    'birth_date' => '1972-06-19',
                    'civil_status' => 'married',
                    'contact_number' => '09567890123',
                    'email' => 'jose.rizal@example.com',
                    'address' => '202 Rizal St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Gabriela',
                    'middle_name' => 'Silang',
                    'last_name' => 'Ilagan',
                    'suffix' => null,
                    'gender' => 'female',
                    'birth_date' => '1982-04-12',
                    'civil_status' => 'married',
                    'contact_number' => '09678901234',
                    'email' => 'gabriela.ilagan@example.com',
                    'address' => '303 Mabini St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Andres',
                    'middle_name' => 'Bonifacio',
                    'last_name' => 'Macaraig',
                    'suffix' => null,
                    'gender' => 'male',
                    'birth_date' => '1978-11-30',
                    'civil_status' => 'married',
                    'contact_number' => '09789012345',
                    'email' => 'andres.macaraig@example.com',
                    'address' => '404 Bonifacio St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Emilio',
                    'middle_name' => 'Jacinto',
                    'last_name' => 'Aguinaldo',
                    'suffix' => null,
                    'gender' => 'male',
                    'birth_date' => '1983-03-22',
                    'civil_status' => 'single',
                    'contact_number' => '09890123456',
                    'email' => 'emilio.aguinaldo@example.com',
                    'address' => '505 Quezon Ave., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Melchora',
                    'middle_name' => 'Aquino',
                    'last_name' => 'Tandang',
                    'suffix' => null,
                    'gender' => 'female',
                    'birth_date' => '1965-01-06',
                    'civil_status' => 'widowed',
                    'contact_number' => '09901234567',
                    'email' => 'melchora.tandang@example.com',
                    'address' => '606 Rizal St., Barangay Central',
                    'is_voter' => true,
                ],
                [
                    'first_name' => 'Lapu',
                    'middle_name' => 'Dimagiba',
                    'last_name' => 'Lapu',
                    'suffix' => null,
                    'gender' => 'male',
                    'birth_date' => '1976-08-17',
                    'civil_status' => 'married',
                    'contact_number' => '09012345678',
                    'email' => 'lapu.lapu@example.com',
                    'address' => '707 Mactan St., Barangay Central',
                    'is_voter' => true,
                ],
            ];

            foreach ($residents as $resident) {
                Resident::create($resident);
            }

            $this->command->info('Created ' . count($residents) . ' dummy residents.');
        }
    }

    /**
     * Seed current barangay officials
     */
    private function seedCurrentOfficials(): void
    {
        $residents = Resident::all();
        
        if ($residents->count() < 11) {
            $this->command->error('Not enough residents to seed officials. Need at least 11 residents.');
            return;
        }

        $committees = Committee::all();
        $positions = Position::all();

        // Current term (2023-2025)
        $termStart = '2023-07-01';
        $termEnd = '2025-06-30';

        $officials = [
            // Barangay Captain
            [
                'resident_id' => $residents[0]->id,
                'position' => 'captain',
                'committee' => 'Committee on Laws and Ordinances',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 1,
                'responsibilities' => 'Presides over all sessions and meetings of the Barangay Council; enforces all laws and ordinances; oversees the general administration of the barangay.',
                'contact_number' => '09171234567',
                'email' => 'barangay.captain@example.com',
                'achievements' => 'Implemented the Barangay Digital Transformation Program; Established the Barangay Health Center; Launched the Senior Citizens Wellness Program',
                'is_regular' => true,
            ],
            
            // Barangay Kagawads (7)
            [
                'resident_id' => $residents[1]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-001')->first()->name ?? 'Committee on Appropriations',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 2,
                'responsibilities' => 'Chairperson, Committee on Appropriations; Reviews and recommends the barangay budget; Oversees financial matters.',
                'contact_number' => '09172345678',
                'email' => 'kagawad.one@example.com',
                'achievements' => 'Successfully proposed a 20% increase in health budget; Implemented transparent financial reporting system.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[2]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-002')->first()->name ?? 'Committee on Peace and Order',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 3,
                'responsibilities' => 'Chairperson, Committee on Peace and Order; Maintains peace and order; Coordinates with PNP for security matters.',
                'contact_number' => '09173456789',
                'email' => 'kagawad.two@example.com',
                'achievements' => 'Established the Barangay Peacekeeping Action Team; Reduced crime rate by 30%; Implemented CCTV system in strategic areas.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[3]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-003')->first()->name ?? 'Committee on Health',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 4,
                'responsibilities' => 'Chairperson, Committee on Health; Oversees health programs; Coordinates with Health Center.',
                'contact_number' => '09174567890',
                'email' => 'kagawad.three@example.com',
                'achievements' => 'Organized quarterly medical missions; Launched nutrition program for children; Established Barangay Drug Rehabilitation Support Group.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[4]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-004')->first()->name ?? 'Committee on Education',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 5,
                'responsibilities' => 'Chairperson, Committee on Education; Manages scholarship programs; Coordinates with schools.',
                'contact_number' => '09175678901',
                'email' => 'kagawad.four@example.com',
                'achievements' => 'Established 50 scholarship slots; Built a community learning hub; Implemented tutorial programs for struggling students.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[5]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-005')->first()->name ?? 'Committee on Infrastructure',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 6,
                'responsibilities' => 'Chairperson, Committee on Infrastructure; Oversees infrastructure projects; Manages road repairs and maintenance.',
                'contact_number' => '09176789012',
                'email' => 'kagawad.five@example.com',
                'achievements' => 'Repaved 5km of barangay roads; Installed solar-powered street lights; Constructed covered court renovation.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[6]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-006')->first()->name ?? 'Committee on Environment',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 7,
                'responsibilities' => 'Chairperson, Committee on Environmental Protection; Implements environmental programs; Manages waste management.',
                'contact_number' => '09177890123',
                'email' => 'kagawad.six@example.com',
                'achievements' => 'Launched "Zero Waste Barangay" program; Established materials recovery facility; Organized monthly coastal clean-ups.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[7]->id,
                'position' => 'kagawad',
                'committee' => $committees->where('code', 'COM-007')->first()->name ?? 'Committee on Sports & Youth',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 8,
                'responsibilities' => 'Chairperson, Committee on Sports and Youth Development; Organizes sports events; Manages youth programs.',
                'contact_number' => '09178901234',
                'email' => 'kagawad.seven@example.com',
                'achievements' => 'Organized Barangay Youth Summit; Established sports league; Created youth skills training program.',
                'is_regular' => true,
            ],

            // Barangay Secretary
            [
                'resident_id' => $residents[8]->id,
                'position' => 'secretary',
                'committee' => 'Committee on Barangay Affairs',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 9,
                'responsibilities' => 'Prepares and keeps minutes of all sessions; Manages barangay records; Issues certifications.',
                'contact_number' => '09179012345',
                'email' => 'barangay.secretary@example.com',
                'achievements' => 'Digitized all barangay records; Implemented online document request system; Organized barangay archives.',
                'is_regular' => true,
            ],

            // Barangay Treasurer
            [
                'resident_id' => $residents[9]->id,
                'position' => 'treasurer',
                'committee' => 'Committee on Appropriations',
                'term_start' => $termStart,
                'term_end' => $termEnd,
                'status' => 'active',
                'order' => 10,
                'responsibilities' => 'Collects and disburses barangay funds; Maintains financial records; Prepares financial reports.',
                'contact_number' => '09180123456',
                'email' => 'barangay.treasurer@example.com',
                'achievements' => 'Implemented transparent online fund tracking; Successfully managed ₱5M annual budget; Received Good Housekeeping award.',
                'is_regular' => true,
            ],
        ];

        foreach ($officials as $official) {
            Official::updateOrCreate(
                [
                    'resident_id' => $official['resident_id'],
                    'position' => $official['position'],
                    'term_start' => $official['term_start'],
                ],
                $official
            );
        }

        $this->command->info('Current officials seeded successfully!');
    }

    /**
     * Seed former officials (historical data)
     */
    private function seedFormerOfficials(): void
    {
        $residents = Resident::skip(10)->take(5)->get(); // Use different residents
        
        if ($residents->count() < 2) {
            return;
        }

        // Previous term (2020-2022)
        $formerOfficials = [
            [
                'resident_id' => $residents[0]->id ?? 1,
                'position' => 'captain',
                'committee' => 'Committee on Laws and Ordinances',
                'term_start' => '2020-07-01',
                'term_end' => '2022-06-30',
                'status' => 'former',
                'order' => 1,
                'responsibilities' => 'Barangay Captain (Previous Term)',
                'achievements' => 'Completed the barangay hall renovation; Established Barangay Nutrition Program.',
                'is_regular' => true,
            ],
            [
                'resident_id' => $residents[1]->id ?? 2,
                'position' => 'secretary',
                'committee' => 'Committee on Barangay Affairs',
                'term_start' => '2020-07-01',
                'term_end' => '2022-06-30',
                'status' => 'former',
                'order' => 9,
                'responsibilities' => 'Barangay Secretary (Previous Term)',
                'achievements' => 'Implemented records management system.',
                'is_regular' => true,
            ],
        ];

        foreach ($formerOfficials as $official) {
            Official::updateOrCreate(
                [
                    'resident_id' => $official['resident_id'],
                    'position' => $official['position'],
                    'term_start' => $official['term_start'],
                ],
                $official
            );
        }

        $this->command->info('Former officials seeded successfully!');
    }

    /**
     * Seed Sangguniang Kabataan officials
     */
    private function seedSKOfficials(): void
    {
        // Get younger residents (assuming we have younger residents, if not, we'll create them)
        $skResidents = Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 15 AND 24')
                                ->take(8)
                                ->get();

        if ($skResidents->count() < 7) {
            // Create SK-age residents if not enough
            $this->createSKResidents();
            $skResidents = Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 15 AND 24')
                                    ->take(8)
                                    ->get();
        }

        if ($skResidents->count() >= 7) {
            $termStart = '2023-07-01';
            $termEnd = '2025-06-30';

            $skOfficials = [
                // SK Chairman
                [
                    'resident_id' => $skResidents[0]->id,
                    'position' => 'sk_chairman',
                    'committee' => 'Committee on Youth and Sports Development',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 11,
                    'responsibilities' => 'Chairperson of Sangguniang Kabataan; Represents the youth sector.',
                    'contact_number' => '09991234567',
                    'email' => 'sk.chairman@example.com',
                    'achievements' => 'Organized Youth Leadership Summit; Established SK Livelihood Program.',
                    'is_regular' => false,
                ],
                // SK Kagawads (7)
                [
                    'resident_id' => $skResidents[1]->id,
                    'position' => 'sk_kagawad',
                    'committee' => 'Committee on Education',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 12,
                    'responsibilities' => 'SK Kagawad, Committee on Education',
                    'is_regular' => false,
                ],
                [
                    'resident_id' => $skResidents[2]->id,
                    'position' => 'sk_kagawad',
                    'committee' => 'Committee on Health and Sanitation',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 13,
                    'responsibilities' => 'SK Kagawad, Committee on Health and Sanitation',
                    'is_regular' => false,
                ],
                [
                    'resident_id' => $skResidents[3]->id,
                    'position' => 'sk_kagawad',
                    'committee' => 'Committee on Sports',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 14,
                    'responsibilities' => 'SK Kagawad, Committee on Sports',
                    'is_regular' => false,
                ],
                [
                    'resident_id' => $skResidents[4]->id,
                    'position' => 'sk_kagawad',
                    'committee' => 'Committee on Environment',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 15,
                    'responsibilities' => 'SK Kagawad, Committee on Environment',
                    'is_regular' => false,
                ],
                [
                    'resident_id' => $skResidents[5]->id,
                    'position' => 'sk_kagawad',
                    'committee' => 'Committee on Culture and Arts',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 16,
                    'responsibilities' => 'SK Kagawad, Committee on Culture and Arts',
                    'is_regular' => false,
                ],
                [
                    'resident_id' => $skResidents[6]->id,
                    'position' => 'secretary_treasurer',
                    'committee' => 'Committee on Finance',
                    'term_start' => $termStart,
                    'term_end' => $termEnd,
                    'status' => 'active',
                    'order' => 17,
                    'responsibilities' => 'SK Secretary-Treasurer',
                    'is_regular' => false,
                ],
            ];

            foreach ($skOfficials as $official) {
                Official::updateOrCreate(
                    [
                        'resident_id' => $official['resident_id'],
                        'position' => $official['position'],
                        'term_start' => $official['term_start'],
                    ],
                    $official
                );
            }

            $this->command->info('SK Officials seeded successfully!');
        }
    }

    /**
     * Create SK-age residents
     */
    private function createSKResidents(): void
    {
        $skResidents = [
            [
                'first_name' => 'John',
                'middle_name' => 'Santos',
                'last_name' => 'Dela Cruz',
                'suffix' => null,
                'gender' => 'male',
                'birth_date' => '2005-05-15',
                'civil_status' => 'single',
                'contact_number' => '09123450001',
                'email' => 'john.delacruz@example.com',
                'address' => 'Unit 1 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Maria',
                'middle_name' => 'Luna',
                'last_name' => 'Santos',
                'suffix' => null,
                'gender' => 'female',
                'birth_date' => '2006-03-20',
                'civil_status' => 'single',
                'contact_number' => '09123450002',
                'email' => 'maria.santos@example.com',
                'address' => 'Unit 2 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Jose',
                'middle_name' => 'Rizal',
                'last_name' => 'Mercado',
                'suffix' => 'III',
                'gender' => 'male',
                'birth_date' => '2004-06-19',
                'civil_status' => 'single',
                'contact_number' => '09123450003',
                'email' => 'jose.mercado@example.com',
                'address' => 'Unit 3 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Gabriela',
                'middle_name' => 'Silang',
                'last_name' => 'Ilagan',
                'suffix' => null,
                'gender' => 'female',
                'birth_date' => '2005-11-12',
                'civil_status' => 'single',
                'contact_number' => '09123450004',
                'email' => 'gabriela.ilagan@example.com',
                'address' => 'Unit 4 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Andres',
                'middle_name' => 'Bonifacio',
                'last_name' => 'Macaraig',
                'suffix' => null,
                'gender' => 'male',
                'birth_date' => '2006-11-30',
                'civil_status' => 'single',
                'contact_number' => '09123450005',
                'email' => 'andres.macaraig@example.com',
                'address' => 'Unit 5 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Emilio',
                'middle_name' => 'Jacinto',
                'last_name' => 'Aguinaldo',
                'suffix' => null,
                'gender' => 'male',
                'birth_date' => '2005-03-22',
                'civil_status' => 'single',
                'contact_number' => '09123450006',
                'email' => 'emilio.aguinaldo@example.com',
                'address' => 'Unit 6 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
            [
                'first_name' => 'Melchora',
                'middle_name' => 'Aquino',
                'last_name' => 'Tandang',
                'suffix' => null,
                'gender' => 'female',
                'birth_date' => '2004-01-06',
                'civil_status' => 'single',
                'contact_number' => '09123450007',
                'email' => 'melchora.tandang@example.com',
                'address' => 'Unit 7 Youth Village, Barangay Central',
                'is_voter' => false,
            ],
        ];

        foreach ($skResidents as $resident) {
            Resident::create($resident);
        }

        $this->command->info('Created SK-age residents.');
    }
}