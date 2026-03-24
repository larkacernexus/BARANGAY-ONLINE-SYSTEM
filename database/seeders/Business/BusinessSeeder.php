<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding businesses...');
        
        $residents = DB::table('residents')->get();
        $puroks = DB::table('puroks')->get()->keyBy('slug');
        
        $businesses = [
            ['business_name' => 'Dela Cruz Sari-sari Store', 'business_type' => 'Retail', 'owner_name' => 'Juan Dela Cruz', 'address' => 'Purok 1', 'purok_slug' => 'purok-1', 'capital_amount' => 50000, 'monthly_gross' => 30000, 'employee_count' => 1, 'status' => 'active'],
            ['business_name' => 'Santos Bakery', 'business_type' => 'Food', 'owner_name' => 'Maria Santos', 'address' => 'Purok 1', 'purok_slug' => 'purok-1', 'capital_amount' => 100000, 'monthly_gross' => 80000, 'employee_count' => 3, 'status' => 'active'],
            ['business_name' => 'Fernandez Hardware', 'business_type' => 'Hardware', 'owner_name' => 'Pedro Fernandez', 'address' => 'Purok 2', 'purok_slug' => 'purok-2', 'capital_amount' => 200000, 'monthly_gross' => 150000, 'employee_count' => 4, 'status' => 'active'],
            ['business_name' => 'Reyes General Merchandise', 'business_type' => 'Retail', 'owner_name' => 'Ana Reyes', 'address' => 'Purok 3', 'purok_slug' => 'purok-3', 'capital_amount' => 150000, 'monthly_gross' => 100000, 'employee_count' => 2, 'status' => 'active'],
            ['business_name' => 'Mendoza Carinderia', 'business_type' => 'Food', 'owner_name' => 'Carlos Mendoza', 'address' => 'Purok 3', 'purok_slug' => 'purok-3', 'capital_amount' => 30000, 'monthly_gross' => 25000, 'employee_count' => 1, 'status' => 'active'],
        ];
        
        foreach ($businesses as $business) {
            // Find owner by full name
            $owner = null;
            foreach ($residents as $r) {
                $fullName = $r->first_name . ' ' . $r->last_name;
                if ($fullName === $business['owner_name']) {
                    $owner = $r;
                    break;
                }
            }
            
            $purok = $puroks[$business['purok_slug']] ?? null;
            
            DB::table('businesses')->insert([
                'business_name' => $business['business_name'],
                'business_type' => $business['business_type'],
                'owner_id' => $owner->id ?? null,
                'owner_name' => $business['owner_name'],
                'address' => $business['address'],
                'purok_id' => $purok->id ?? null,
                'capital_amount' => $business['capital_amount'],
                'monthly_gross' => $business['monthly_gross'],
                'employee_count' => $business['employee_count'],
                'status' => $business['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        $this->command->info('✅ Seeded ' . count($businesses) . ' businesses');
    }
}