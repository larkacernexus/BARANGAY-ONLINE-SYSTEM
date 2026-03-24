<?php

namespace Database\Seeders;

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Resident;
use App\Models\Purok;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class HouseholdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all puroks
        $puroks = Purok::all();
        
        if ($puroks->isEmpty()) {
            $this->command->warn('⚠️  No puroks found. Please run PurokSeeder first.');
            return;
        }

        $households = [
            // Household 1
            [
                'household_number' => 'HH-001',
                'contact_number' => '09123456789',
                'email' => 'dela.cruz.family@example.com',
                'address' => '123 Mabini Street',
                'purok_id' => $puroks[0]->id,
                'income_range' => '15000-25000',
                'housing_type' => 'Concrete',
                'ownership_status' => 'Owned',
                'water_source' => 'Municipal',
                'electricity' => true,
                'internet' => true,
                'vehicle' => true,
                'remarks' => 'Registered voter family',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Juan',
                        'last_name' => 'Dela Cruz',
                        'birth_date' => '1980-05-15',
                        'gender' => 'male',
                        'civil_status' => 'Married',
                        'occupation' => 'Government Employee',
                        'education' => 'College Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Maria',
                        'last_name' => 'Dela Cruz',
                        'birth_date' => '1982-08-22',
                        'gender' => 'female',
                        'civil_status' => 'Married',
                        'occupation' => 'Teacher',
                        'education' => 'College Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Spouse',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Jose',
                        'last_name' => 'Dela Cruz',
                        'birth_date' => '2008-03-10',
                        'gender' => 'male',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'High School',
                        'religion' => 'Roman Catholic',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Ana',
                        'last_name' => 'Dela Cruz',
                        'birth_date' => '2010-11-18',
                        'gender' => 'female',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'Elementary',
                        'religion' => 'Roman Catholic',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                ],
            ],

            // Household 2
            [
                'household_number' => 'HH-002',
                'contact_number' => '09234567890',
                'email' => 'santos.family@example.com',
                'address' => '456 Rizal Avenue',
                'purok_id' => $puroks[1]->id,
                'income_range' => '25000-35000',
                'housing_type' => 'Concrete',
                'ownership_status' => 'Mortgage',
                'water_source' => 'Municipal',
                'electricity' => true,
                'internet' => true,
                'vehicle' => true,
                'remarks' => 'Small business owners',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Pedro',
                        'last_name' => 'Santos',
                        'birth_date' => '1975-02-20',
                        'gender' => 'male',
                        'civil_status' => 'Married',
                        'occupation' => 'Business Owner',
                        'education' => 'College Graduate',
                        'religion' => 'Iglesia Ni Cristo',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Elena',
                        'last_name' => 'Santos',
                        'birth_date' => '1978-07-12',
                        'gender' => 'female',
                        'civil_status' => 'Married',
                        'occupation' => 'Business Owner',
                        'education' => 'College Graduate',
                        'religion' => 'Iglesia Ni Cristo',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Spouse',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Carlos',
                        'last_name' => 'Santos',
                        'birth_date' => '2005-09-30',
                        'gender' => 'male',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'Senior High',
                        'religion' => 'Iglesia Ni Cristo',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                ],
            ],

            // Household 3
            [
                'household_number' => 'HH-003',
                'contact_number' => '09345678901',
                'email' => 'reyes.family@example.com',
                'address' => '789 Bonifacio Street',
                'purok_id' => $puroks[2]->id,
                'income_range' => '5000-15000',
                'housing_type' => 'Semi-Concrete',
                'ownership_status' => 'Rented',
                'water_source' => 'Deep Well',
                'electricity' => true,
                'internet' => false,
                'vehicle' => false,
                'remarks' => 'Extended family living together',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Miguel',
                        'last_name' => 'Reyes',
                        'birth_date' => '1988-12-05',
                        'gender' => 'male',
                        'civil_status' => 'Married',
                        'occupation' => 'Construction Worker',
                        'education' => 'High School Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Teresa',
                        'last_name' => 'Reyes',
                        'birth_date' => '1990-04-18',
                        'gender' => 'female',
                        'civil_status' => 'Married',
                        'occupation' => 'Housewife',
                        'education' => 'High School Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Spouse',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Rosa',
                        'last_name' => 'Reyes',
                        'birth_date' => '2012-06-25',
                        'gender' => 'female',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'Elementary',
                        'religion' => 'Roman Catholic',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Lito',
                        'last_name' => 'Reyes',
                        'birth_date' => '1955-03-08',
                        'gender' => 'male',
                        'civil_status' => 'Widowed',
                        'occupation' => 'Retired',
                        'education' => 'Elementary Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => true,
                        'relationship_to_head' => 'Parent',
                        'is_head' => false,
                    ],
                ],
            ],

            // Household 4 - Senior Citizens
            [
                'household_number' => 'HH-004',
                'contact_number' => '09456789012',
                'email' => 'garcia.family@example.com',
                'address' => '1010 Luna Street',
                'purok_id' => $puroks[3]->id,
                'income_range' => 'Below 5000',
                'housing_type' => 'Light Materials',
                'ownership_status' => 'Owned',
                'water_source' => 'Deep Well',
                'electricity' => true,
                'internet' => false,
                'vehicle' => false,
                'remarks' => 'Senior citizens living alone',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Anita',
                        'last_name' => 'Garcia',
                        'birth_date' => '1950-01-15',
                        'gender' => 'female',
                        'civil_status' => 'Widowed',
                        'occupation' => 'Retired',
                        'education' => 'Elementary Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => true,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                ],
            ],

            // Household 5 - Large Family
            [
                'household_number' => 'HH-005',
                'contact_number' => '09567890123',
                'email' => 'fernandez.family@example.com',
                'address' => '1111 Mabuhay Street',
                'purok_id' => $puroks[4]->id,
                'income_range' => '15000-25000',
                'housing_type' => 'Concrete',
                'ownership_status' => 'Owned',
                'water_source' => 'Municipal',
                'electricity' => true,
                'internet' => true,
                'vehicle' => true,
                'remarks' => 'Large extended family',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Ramon',
                        'last_name' => 'Fernandez',
                        'birth_date' => '1972-09-10',
                        'gender' => 'male',
                        'civil_status' => 'Married',
                        'occupation' => 'Driver',
                        'education' => 'High School Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Luz',
                        'last_name' => 'Fernandez',
                        'birth_date' => '1975-11-22',
                        'gender' => 'female',
                        'civil_status' => 'Married',
                        'occupation' => 'Vendor',
                        'education' => 'High School Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Spouse',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Mark',
                        'last_name' => 'Fernandez',
                        'birth_date' => '1998-07-14',
                        'gender' => 'male',
                        'civil_status' => 'Single',
                        'occupation' => 'Call Center Agent',
                        'education' => 'College Level',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Joy',
                        'last_name' => 'Fernandez',
                        'birth_date' => '2000-03-28',
                        'gender' => 'female',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'College',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Ben',
                        'last_name' => 'Fernandez',
                        'birth_date' => '2003-12-05',
                        'gender' => 'male',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'Senior High',
                        'religion' => 'Roman Catholic',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                ],
            ],

            // Household 6 - Solo Parent
            [
                'household_number' => 'HH-006',
                'contact_number' => '09678901234',
                'email' => 'villanueva.family@example.com',
                'address' => '1212 Rizal Extension',
                'purok_id' => $puroks[5]->id,
                'income_range' => '5000-15000',
                'housing_type' => 'Semi-Concrete',
                'ownership_status' => 'Rented',
                'water_source' => 'Deep Well',
                'electricity' => true,
                'internet' => false,
                'vehicle' => false,
                'remarks' => 'Solo parent household',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Marites',
                        'last_name' => 'Villanueva',
                        'birth_date' => '1985-06-19',
                        'gender' => 'female',
                        'civil_status' => 'Single Parent',
                        'occupation' => 'Laundry Worker',
                        'education' => 'High School Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Kristine',
                        'last_name' => 'Villanueva',
                        'birth_date' => '2015-02-08',
                        'gender' => 'female',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'Elementary',
                        'religion' => 'Roman Catholic',
                        'is_voter' => false,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                ],
            ],

            // Household 7 - PWD Member
            [
                'household_number' => 'HH-007',
                'contact_number' => '09789012345',
                'email' => 'torres.family@example.com',
                'address' => '1313 Bonifacio Street',
                'purok_id' => $puroks[6]->id,
                'income_range' => '15000-25000',
                'housing_type' => 'Concrete',
                'ownership_status' => 'Owned',
                'water_source' => 'Municipal',
                'electricity' => true,
                'internet' => true,
                'vehicle' => true,
                'remarks' => 'Household with PWD member',
                'status' => 'active',
                'members' => [
                    [
                        'first_name' => 'Manuel',
                        'last_name' => 'Torres',
                        'birth_date' => '1970-10-30',
                        'gender' => 'male',
                        'civil_status' => 'Married',
                        'occupation' => 'Government Employee',
                        'education' => 'College Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Self',
                        'is_head' => true,
                    ],
                    [
                        'first_name' => 'Gloria',
                        'last_name' => 'Torres',
                        'birth_date' => '1973-12-12',
                        'gender' => 'female',
                        'civil_status' => 'Married',
                        'occupation' => 'Teacher',
                        'education' => 'College Graduate',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => false,
                        'is_senior' => false,
                        'relationship_to_head' => 'Spouse',
                        'is_head' => false,
                    ],
                    [
                        'first_name' => 'Kevin',
                        'last_name' => 'Torres',
                        'birth_date' => '2001-04-25',
                        'gender' => 'male',
                        'civil_status' => 'Single',
                        'occupation' => 'Student',
                        'education' => 'College',
                        'religion' => 'Roman Catholic',
                        'is_voter' => true,
                        'is_pwd' => true,
                        'is_senior' => false,
                        'relationship_to_head' => 'Child',
                        'is_head' => false,
                    ],
                ],
            ],
        ];

        $createdHouseholds = 0;
        $updatedHouseholds = 0;
        $createdResidents = 0;
        $updatedResidents = 0;

        foreach ($households as $householdData) {
            $members = $householdData['members'];
            unset($householdData['members']);

            // Create or update household
            $household = Household::updateOrCreate(
                ['household_number' => $householdData['household_number']],
                $householdData
            );
            
            if ($household->wasRecentlyCreated) {
                $createdHouseholds++;
            } else {
                $updatedHouseholds++;
            }

            // Create or update residents and add to household
            foreach ($members as $memberData) {
                $relationshipToHead = $memberData['relationship_to_head'];
                $isHead = $memberData['is_head'];
                
                // Remove relationship data before creating resident
                unset($memberData['relationship_to_head']);
                unset($memberData['is_head']);
                
                // Add household, purok, and address to resident
                $memberData['household_id'] = $household->id;
                $memberData['purok_id'] = $household->purok_id;
                $memberData['address'] = $householdData['address']; // FIX: Add address from household
                
                // Calculate age from birth_date
                $birthDate = Carbon::parse($memberData['birth_date']);
                $memberData['age'] = $birthDate->age;
                
                // Generate resident_id if not exists
                if (!isset($memberData['resident_id'])) {
                    $memberData['resident_id'] = 'RES-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                }

                // Create or update resident
                $resident = Resident::updateOrCreate(
                    [
                        'first_name' => $memberData['first_name'],
                        'last_name' => $memberData['last_name'],
                        'birth_date' => $memberData['birth_date'],
                    ],
                    $memberData
                );

                if ($resident->wasRecentlyCreated) {
                    $createdResidents++;
                } else {
                    $updatedResidents++;
                }

                // Create or update household member relationship
                HouseholdMember::updateOrCreate(
                    [
                        'household_id' => $household->id,
                        'resident_id' => $resident->id,
                    ],
                    [
                        'relationship_to_head' => $relationshipToHead,
                        'is_head' => $isHead,
                    ]
                );
            }

            // Update household member count
            $household->update(['member_count' => count($members)]);
        }

        $this->command->info('✅ Households seeded successfully!');
        $this->command->info("   - Created: {$createdHouseholds} new households");
        $this->command->info("   - Updated: {$updatedHouseholds} existing households");
        $this->command->info("   - Created: {$createdResidents} new residents");
        $this->command->info("   - Updated: {$updatedResidents} existing residents");
        $this->command->info("   - Total households: " . Household::count());
        $this->command->info("   - Total residents: " . Resident::count());

        // Display table of households
        $householdsTable = Household::with('purok')
            ->get(['id', 'household_number', 'address', 'purok_id', 'member_count', 'status'])
            ->map(function($household) {
                return [
                    'id' => $household->id,
                    'number' => $household->household_number,
                    'address' => $household->address,
                    'purok' => $household->purok->name ?? 'Unknown',
                    'members' => $household->member_count,
                    'status' => $household->status,
                ];
            })->toArray();

        $this->command->table(
            ['ID', 'Household #', 'Address', 'Purok', 'Members', 'Status'],
            $householdsTable
        );
    }
}