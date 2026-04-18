<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Carbon\Carbon;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use App\Models\HouseholdMember;
use App\Models\Purok;

class BarangayDataSeeder extends Seeder
{
    private $faker;
    private $puroks = [];
    private $households = [];
    private $residents = [];
    private $users = [];
    
    // Philippine-specific data
    private $firstNames = [
        'Juan', 'Maria', 'Jose', 'Pedro', 'Ana', 'Rosa', 'Ricardo', 'Luzviminda',
        'Francisco', 'Angel', 'Joseph', 'Jennifer', 'Mark', 'Michelle', 'John',
        'Mary', 'James', 'Patricia', 'Robert', 'Linda', 'Michael', 'Barbara',
        'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica',
        'Joseph', 'Sarah', 'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher',
        'Margaret', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Dorothy',
        'Donald', 'Sandra', 'Paul', 'Ashley', 'Steven', 'Kimberly', 'Andrew',
        'Donna', 'Joshua', 'Emily', 'Kenneth', 'Carol', 'Kevin', 'Michelle',
        'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald',
        'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Laura', 'Jeffrey', 'Helen',
        'Ryan', 'Sharon', 'Jacob', 'Cynthia', 'Gary', 'Kathleen', 'Nicholas',
        'Amy', 'Eric', 'Shirley', 'Jonathan', 'Angela', 'Stephen', 'Anna',
        'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon',
        'Samantha', 'Benjamin', 'Katherine', 'Samuel', 'Emma', 'Gregory',
        'Rachel', 'Frank', 'Catherine', 'Raymond', 'Christine', 'Alexander',
        'Maria', 'Patrick', 'Victoria', 'Jack', 'Marie', 'Dennis', 'Janet',
        'Jerry', 'Carolyn', 'Tyler', 'Virginia', 'Aaron', 'Marilyn', 'Jose',
        'Concepcion', 'Adam', 'Martha', 'Nathan', 'Judith', 'Henry', 'Cheryl',
        'Douglas', 'Megan', 'Zachary', 'Andrea', 'Peter', 'Olivia', 'Kyle',
        'Ann', 'Walter', 'Jean', 'Ethan', 'Alice', 'Jeremy', 'Jacqueline',
        'Harold', 'Hannah', 'Keith', 'Doris', 'Christian', 'Kathryn', 'Roger',
        'Gloria', 'Noah', 'Teresa', 'Gerald', 'Sara', 'Carl', 'Janice',
        'Terry', 'Julia', 'Sean', 'Grace', 'Austin', 'Judy', 'Arthur', 'Theresa',
        'Lawrence', 'Madison', 'Jesse', 'Beverly', 'Dylan', 'Denise', 'Bryan',
        'Marilyn', 'Joe', 'Amber', 'Jordan', 'Danielle', 'Billy', 'Rose',
        'Bruce', 'Brittany', 'Albert', 'Diana', 'Willie', 'Natalie', 'Gabriel',
        'Sophia', 'Logan', 'Alexis', 'Alan', 'Lori', 'Juan', 'Marilyn',
        'Wayne', 'Kayla', 'Roy', 'Jane', 'Ralph', 'Lauren', 'Randy', 'Christina',
        'Eugene', 'Chloe', 'Vincent', 'Abigail', 'Russell', 'Evelyn', 'Elijah',
        'Peggy', 'Louis', 'Tina', 'Bobby', 'Kathryn', 'Philip', 'Carmen',
        'Johnny', 'Wendy', 'Bradley', 'Isabella', 'Reynaldo', 'Lourdes',
        'Eduardo', 'Gloria', 'Rodolfo', 'Edith', 'Alfredo', 'Josephine',
        'Armando', 'Cecilia', 'Rogelio', 'Felisa', 'Wilfredo', 'Leticia'
    ];

    private $lastNames = [
        'Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Torres', 'Flores',
        'Gonzales', 'Bautista', 'Villanueva', 'Fernandez', 'Rivera', 'Aquino',
        'Dela Cruz', 'Ramos', 'Castillo', 'De Leon', 'Guzman', 'Lopez',
        'Perez', 'Diaz', 'Martinez', 'Rodriguez', 'Sanchez', 'Jimenez',
        'Gomez', 'Vergara', 'Santiago', 'Soriano', 'Tolentino', 'Marquez',
        'Morales', 'Ocampo', 'Pascual', 'Valdez', 'Salazar', 'Manuel',
        'Padilla', 'David', 'Francisco', 'Suarez', 'Navarro', 'Domingo',
        'Gutierrez', 'Fernando', 'De Guzman', 'Angeles', 'Mercado', 'Aguilar',
        'Miranda', 'Velasco', 'Rosario', 'Bernardo', 'Villegas', 'Mariano',
        'Castro', 'Ortega', 'Serrano', 'Guevara', 'Estrada', 'Leonardo',
        'Abad', 'Andrada', 'Tuazon', 'Sarmiento', 'Carreon', 'Cervantes',
        'Cordero', 'Dimagiba', 'Enriquez', 'Fajardo', 'Ferrer', 'Galang',
        'Hernandez', 'Ignacio', 'Javier', 'Lazaro', 'Legaspi', 'Macapagal',
        'Magbanua', 'Manansala', 'Natividad', 'Olivar', 'Panganiban',
        'Quiambao', 'Romero', 'Salvador', 'Tecson', 'Umali', 'Valencia',
        'Villamor', 'Yabut', 'Zamora', 'Agustin', 'Basilio', 'Crisostomo',
        'Dimayuga', 'Evangelista', 'Faustino', 'Gregorio', 'Hipolito',
        'Isidro', 'Jacinto', 'Lacsamana', 'Magno', 'Narciso', 'Ochoa',
        'Palacios', 'Quinto', 'Robles', 'Samson', 'Tiamzon', 'Urbano',
        'Villafuerte', 'Yap', 'Zapanta', 'Abella', 'Bacani', 'Cayabyab',
        'Datu', 'Eleazar', 'Fabian', 'Galvez', 'Hermoso', 'Imperial',
        'Jocson', 'Labrador', 'Macaraeg', 'Nepomuceno', 'Ofracio', 'Paguio',
        'Quezon', 'Regalado', 'Sagun', 'Taruc', 'Ubaldo', 'Ventura',
        'Yambao', 'Zarate', 'Abuan', 'Balagtas', 'Cunanan', 'De Jesus',
        'Esguerra', 'Feliciano', 'Gatchalian', 'Hizon', 'Ilagan', 'Jose',
        'Katigbak', 'Laurel', 'Malabanan', 'Nolasco', 'Ong', 'Punzalan',
        'Quiazon', 'Roque', 'Salonga', 'Tantoco', 'Uy', 'Valeros',
        'Yanson', 'Zulueta'
    ];

    private $middleNames = [
        '', 'A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.',
        'K.', 'L.', 'M.', 'N.', 'O.', 'P.', 'Q.', 'R.', 'S.', 'T.',
        'U.', 'V.', 'W.', 'X.', 'Y.', 'Z.', 'Reyes', 'Santos', 'Cruz',
        'Garcia', 'Mendoza', 'Dela Cruz', 'Ramos', 'Gonzales', 'Lopez'
    ];

    private $suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

    private $civilStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];
    
    private $genders = ['Male', 'Female'];

    private $occupations = [
        'Driver', 'Teacher', 'Nurse', 'Engineer', 'Accountant', 'Vendor',
        'Farmer', 'Fisherman', 'Carpenter', 'Electrician', 'Plumber',
        'Security Guard', 'Office Staff', 'Business Owner', 'Housekeeper',
        'Student', 'Retired', 'Unemployed', 'OFW', 'Construction Worker',
        'Barangay Official', 'Barangay Tanod', 'Barangay Health Worker',
        'Day Care Worker', 'Midwife', 'Police Officer', 'Firefighter',
        'Government Employee', 'Private Employee', 'Self-Employed',
        'Tricycle Driver', 'Jeepney Driver', 'Baker', 'Chef', 'Waiter',
        'Sales Clerk', 'Cashier', 'Beautician', 'Barber', 'Tailor',
        'Mechanic', 'Welder', 'Painter', 'Mason', 'Laborer', 'Janitor',
        'Messenger', 'Call Center Agent', 'IT Professional', 'Programmer',
        'Graphic Designer', 'Architect', 'Lawyer', 'Doctor', 'Dentist'
    ];

    private $educations = [
        'Elementary Graduate', 'Elementary Undergraduate',
        'High School Graduate', 'High School Undergraduate',
        'College Graduate', 'College Undergraduate',
        'Vocational Graduate', 'Vocational Undergraduate',
        'Master\'s Degree', 'Doctorate Degree'
    ];

    private $religions = [
        'Roman Catholic', 'Iglesia ni Cristo', 'Islam', 'Protestant',
        'Baptist', 'Born Again Christian', 'Seventh-day Adventist',
        'Jehovah\'s Witnesses', 'Aglipayan', 'Methodist', 'Mormon',
        'Buddhist', 'Hindu'
    ];

    private $relationships = [
        'Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild', 'Grandparent',
        'Nephew', 'Niece', 'Cousin', 'In-law', 'Other Relative', 'Boarder'
    ];

    private $streets = [
        'Rizal St.', 'Bonifacio St.', 'Mabini St.', 'Del Pilar St.',
        'Aguinaldo St.', 'Luna St.', 'Silang St.', 'Burgos St.',
        'Roxas Blvd.', 'Quezon Ave.', 'Magsaysay Ave.', 'Aurora Blvd.',
        'Shaw Blvd.', 'Taft Ave.', 'Gil Puyat Ave.', 'Ayala Ave.',
        'Ortigas Ave.', 'Commonwealth Ave.', 'España Blvd.', 'Alabang-Zapote Rd.'
    ];

    private $housingTypes = ['Concrete', 'Wood', 'Mixed', 'Light Materials', 'Makeshift'];
    
    private $ownershipStatuses = ['Owned', 'Rented', 'Mortgaged', 'Shared', 'Informal Settler'];
    
    private $waterSources = ['NAWASA', 'Deep Well', 'Artesian Well', 'Water Refilling', 'Spring'];
    
    private $incomeRanges = [
        'Below 5,000', '5,000 - 10,000', '10,000 - 15,000',
        '15,000 - 20,000', '20,000 - 30,000', '30,000 - 50,000',
        '50,000 - 100,000', 'Above 100,000'
    ];

    public function run()
    {
        $this->faker = Faker::create('en_PH');
        
        $this->command->info('Starting Barangay Data Generation...');
        $this->command->info('This may take a few minutes...');
        
        // Disable foreign key checks and clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        $this->command->info('Clearing existing data...');
        DB::table('household_members')->truncate();
        DB::table('users')->where('role_id', 13)->delete();
        DB::table('residents')->truncate();
        DB::table('households')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        // Get or create puroks
        $this->setupPuroks();
        
        // Generate households
        $this->command->info('Generating 1000+ households...');
        $this->generateHouseholds(1000);
        
        // Generate residents
        $this->command->info('Generating residents for each household...');
        $this->generateResidents();
        
        // Create household members relationships
        $this->command->info('Creating household member relationships...');
        $this->createHouseholdMembers();
        
        // Create user accounts for each household
        $this->command->info('Creating user accounts for household heads...');
        $this->createUserAccounts();
        
        $this->command->info('Barangay data generation completed!');
        $this->command->info('Total Households: ' . count($this->households));
        $this->command->info('Total Residents: ' . count($this->residents));
        $this->command->info('Total Users: ' . count($this->users));
    }

    private function setupPuroks()
    {
        $purokNames = [
            'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5',
            'Purok 6', 'Purok 7', 'Purok 8', 'Purok 9', 'Purok 10'
        ];
        
        foreach ($purokNames as $name) {
            $purok = Purok::firstOrCreate(
                ['name' => $name],
                [
                    'description' => $name . ' Area',
                    'status' => 'active'
                ]
            );
            $this->puroks[] = $purok;
        }
    }

    private function generateHouseholds($count)
    {
        $barangayName = 'Barangay ' . $this->faker->city . ', ' . $this->faker->state;
        
        for ($i = 1; $i <= $count; $i++) {
            $purok = $this->faker->randomElement($this->puroks);
            $street = $this->faker->randomElement($this->streets);
            
            $householdNumber = sprintf('HH-%04d-%03d', date('Y'), $i);
            
            $household = Household::create([
                'household_number' => $householdNumber,
                'contact_number' => '09' . $this->faker->numberBetween(10, 99) . 
                                   $this->faker->numberBetween(1000000, 9999999),
                'email' => $this->faker->boolean(60) ? $this->faker->safeEmail : null,
                'address' => $this->faker->numberBetween(1, 999) . ' ' . $street . ', ' . $barangayName,
                'purok_id' => $purok->id,
                'member_count' => 0, // Will update later
                'income_range' => $this->faker->randomElement($this->incomeRanges),
                'housing_type' => $this->faker->randomElement($this->housingTypes),
                'ownership_status' => $this->faker->randomElement($this->ownershipStatuses),
                'water_source' => $this->faker->randomElement($this->waterSources),
                'electricity' => $this->faker->boolean(85),
                'internet' => $this->faker->boolean(40),
                'vehicle' => $this->faker->boolean(50),
                'remarks' => $this->faker->boolean(20) ? $this->faker->sentence : null,
                'status' => $this->faker->boolean(95) ? 'active' : 'inactive',
                'google_maps_url' => $this->faker->boolean(30) ? $this->generateGoogleMapsUrl($purok->name) : null,
            ]);
            
            $this->households[] = $household;
            
            if ($i % 100 == 0) {
                $this->command->info("Generated {$i} households...");
            }
        }
    }

    private function generateGoogleMapsUrl($purokName)
    {
        // Generate realistic Philippine coordinates
        $baseLat = 14.5995; // Manila area
        $baseLng = 120.9842;
        
        $lat = $baseLat + ($this->faker->randomFloat(6, -0.1, 0.1));
        $lng = $baseLng + ($this->faker->randomFloat(6, -0.1, 0.1));
        
        return "https://maps.app.goo.gl/" . Str::random(17) . "?q={$lat},{$lng}";
    }

    private function generateResidents()
    {
        $residentIdCounter = 1;
        
        foreach ($this->households as $household) {
            $memberCount = $this->faker->numberBetween(4, 10);
            
            // Generate the head of household first
            $head = $this->createResident($household, true);
            $this->residents[] = $head;
            
            // Generate other family members
            for ($i = 1; $i < $memberCount; $i++) {
                $resident = $this->createResident($household, false);
                $this->residents[] = $resident;
            }
            
            $residentIdCounter += $memberCount;
            
            // Update household member count
            $household->update(['member_count' => $memberCount]);
        }
    }

    private function createResident($household, $isHead = false)
    {
        $gender = $this->faker->randomElement($this->genders);
        $firstName = $this->getFirstNameByGender($gender);
        $lastName = $this->faker->randomElement($this->lastNames);
        $middleName = $this->faker->randomElement($this->middleNames);
        $suffix = $this->faker->boolean(5) ? $this->faker->randomElement($this->suffixes) : null;
        
        // Calculate realistic age
        $age = $isHead ? 
            $this->faker->numberBetween(25, 75) : 
            $this->faker->numberBetween(1, 70);
        
        $birthDate = Carbon::now()->subYears($age)
            ->subMonths($this->faker->numberBetween(0, 11))
            ->subDays($this->faker->numberBetween(0, 30));
        
        // Generate unique resident ID
        $year = date('Y');
        $residentId = sprintf('RES-%s-%06d', $year, Resident::count() + 1);
        
        return Resident::create([
            'resident_id' => $residentId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'middle_name' => $middleName,
            'suffix' => $suffix,
            'birth_date' => $birthDate,
            'age' => $age,
            'gender' => $gender,
            'civil_status' => $age >= 18 ? $this->faker->randomElement($this->civilStatuses) : 'Single',
            'contact_number' => $isHead ? $household->contact_number : 
                               ($age >= 15 ? '09' . $this->faker->numberBetween(10, 99) . 
                                             $this->faker->numberBetween(1000000, 9999999) : null),
            'email' => $isHead ? $household->email : 
                      ($age >= 18 && $this->faker->boolean(40) ? $this->faker->safeEmail : null),
            'address' => $household->address,
            'purok_id' => $household->purok_id,
            'household_id' => $household->id,
            'occupation' => $age >= 18 ? $this->faker->randomElement($this->occupations) : 
                          ($age >= 15 ? 'Student' : null),
            'education' => $this->getEducationByAge($age),
            'religion' => $this->faker->randomElement($this->religions),
            'is_voter' => $age >= 18 ? $this->faker->boolean(70) : false,
            'place_of_birth' => $this->faker->city . ', ' . $this->faker->state,
            'remarks' => $this->faker->boolean(10) ? $this->faker->sentence : null,
            'status' => 'active',
        ]);
    }

    private function getFirstNameByGender($gender)
    {
        // Simplified - in a real scenario, you'd have separate lists
        return $this->faker->randomElement($this->firstNames);
    }

    private function getEducationByAge($age)
    {
        if ($age < 6) return null;
        if ($age < 12) return 'Elementary Undergraduate';
        if ($age < 16) return 'High School Undergraduate';
        if ($age < 18) return 'High School Graduate';
        if ($age < 22) return 'College Undergraduate';
        
        return $this->faker->randomElement($this->educations);
    }

    private function createHouseholdMembers()
    {
        foreach ($this->households as $household) {
            $members = Resident::where('household_id', $household->id)->get();
            
            if ($members->isEmpty()) continue;
            
            // First member is always the head
            $head = $members->first();
            HouseholdMember::create([
                'household_id' => $household->id,
                'resident_id' => $head->id,
                'relationship_to_head' => 'Self',
                'is_head' => true,
            ]);
            
            // Create relationships for other members
            foreach ($members->slice(1) as $index => $member) {
                $relationship = $this->determineRelationship($head, $member);
                
                HouseholdMember::create([
                    'household_id' => $household->id,
                    'resident_id' => $member->id,
                    'relationship_to_head' => $relationship,
                    'is_head' => false,
                ]);
            }
        }
    }

    private function determineRelationship($head, $member)
    {
        $ageDiff = $head->age - $member->age;
        
        // Same gender as head and age difference small -> Spouse
        if ($head->gender != $member->gender && 
            abs($ageDiff) <= 15 && 
            $member->age >= 18 &&
            $head->civil_status == 'Married' &&
            $this->faker->boolean(30)) {
            return 'Spouse';
        }
        
        // Much younger -> Child
        if ($ageDiff >= 15 && $ageDiff <= 50) {
            return 'Child';
        }
        
        // Much older -> Parent
        if ($ageDiff <= -20) {
            return 'Parent';
        }
        
        // Similar age -> Sibling or In-law
        if (abs($ageDiff) <= 20) {
            return $this->faker->randomElement(['Sibling', 'In-law', 'Cousin']);
        }
        
        // Much younger than child age -> Grandchild
        if ($ageDiff > 40) {
            return 'Grandchild';
        }
        
        // Default
        return $this->faker->randomElement($this->relationships);
    }

  private function createUserAccounts()
{
    // Ensure Household Head role exists with ID 13
    $role = \App\Models\Role::find(13);
    
    if (!$role) {
        $role = \App\Models\Role::create([
            'id' => 13,
            'name' => 'Household Head',
            'guard_name' => 'web',
            'description' => 'Head of household with limited access'
        ]);
    }
    
    foreach ($this->households as $index => $household) {
        // Get the head of household
        $headMember = HouseholdMember::where('household_id', $household->id)
            ->where('is_head', true)
            ->first();
        
        if (!$headMember) continue;
        
        $head = Resident::find($headMember->resident_id);
        
        if (!$head) continue;
        
        // Generate username from household number
        $username = strtolower(str_replace(['-', ' ', 'HH'], ['', '', 'hh'], $household->household_number));
        $counter = 1;
        $originalUsername = $username;
        
        while (User::where('username', $username)->exists()) {
            $username = $originalUsername . $counter;
            $counter++;
        }
        
        // Generate a secure password
        $password = $this->generateSecurePassword($household->household_number, $head);
        
        // Create user account - position field omitted (it's nullable)
        $user = User::create([
            'username' => $username,
            'first_name' => $head->first_name,
            'last_name' => $head->last_name,
            'email' => $household->email ?? $this->generateEmail($head),
            'contact_number' => $household->contact_number,
            // 'position' => null, // Omit or set to null - it's nullable
            'role_id' => 13, // Household Head role ID
            'status' => $this->faker->boolean(90) ? 'active' : 'inactive',
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'require_password_change' => true,
            'password_changed_at' => null,
            'resident_id' => $head->id,
            'household_id' => $household->id,
            'current_resident_id' => $head->id,
            'login_count' => $this->faker->numberBetween(0, 50),
            'last_login_at' => $this->faker->boolean(60) ? $this->faker->dateTimeBetween('-30 days', 'now') : null,
            'last_login_ip' => $this->faker->boolean(60) ? $this->faker->ipv4 : null,
        ]);
        
        $this->users[] = [
            'user' => $user,
            'password' => $password,
            'household' => $household->household_number,
            'head' => $head->full_name,
        ];
        
        // Update household with user_id
        $household->update(['user_id' => $user->id]);
        
        if (($index + 1) % 100 == 0) {
            $this->command->info("Created user accounts for " . ($index + 1) . " households...");
        }
    }
    
    // Output sample credentials
    $this->outputCredentials();
}

    private function generateEmail($head)
    {
        $email = strtolower(str_replace(' ', '.', $head->first_name)) . '.' . 
                 strtolower(str_replace(' ', '', $head->last_name));
        
        // Remove special characters
        $email = preg_replace('/[^a-z0-9.]/', '', $email);
        
        $domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        $domain = $this->faker->randomElement($domains);
        
        $email = $email . $this->faker->numberBetween(0, 999) . '@' . $domain;
        
        return $email;
    }

    private function generateSecurePassword($householdNumber, $head)
    {
        // Generate a memorable but secure password
        $words = [
            'Barangay', 'Pamilya', 'Bahay', 'Tahanan', 'Komunidad',
            'Pilipinas', 'Bayani', 'Lahi', 'Bayan', 'Lungsod'
        ];
        
        $word = $this->faker->randomElement($words);
        $number = substr($householdNumber, -4);
        $symbols = ['@', '#', '$', '%', '&', '*', '!'];
        $symbol = $this->faker->randomElement($symbols);
        
        return $word . $number . $symbol;
    }

    private function outputCredentials()
    {
        $this->command->info("\n========== SAMPLE USER CREDENTIALS ==========");
        $this->command->info("All users have role_id = 13 (Household Head)");
        $this->command->info("\nFirst 10 user accounts:");
        
        for ($i = 0; $i < min(10, count($this->users)); $i++) {
            $userData = $this->users[$i];
            $user = $userData['user'];
            
            $this->command->info(sprintf(
                "\n%d. Household: %s",
                $i + 1,
                $userData['household']
            ));
            $this->command->info(sprintf(
                "   Username: %s",
                $user->username
            ));
            $this->command->info(sprintf(
                "   Password: %s",
                $userData['password']
            ));
            $this->command->info(sprintf(
                "   Head: %s",
                $userData['head']
            ));
            $this->command->info(sprintf(
                "   Email: %s",
                $user->email ?: 'Not set'
            ));
            $this->command->info(sprintf(
                "   Contact: %s",
                $user->contact_number
            ));
        }
        
        $this->command->info("\n=============================================");
        $this->command->info("Total Users Created: " . count($this->users));
        $this->command->info("All users require password change on first login.");
        $this->command->info("=============================================\n");
    }
}