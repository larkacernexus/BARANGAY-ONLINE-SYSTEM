<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrivilegeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('privileges')->insert([

            [
                'name' => 'Senior Citizen',
                'code' => 'SC',
                'description' => 'Residents aged 60 years old and above',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Person With Disability',
                'code' => 'PWD',
                'description' => 'Registered person with disability',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => '4Ps Beneficiary',
                'code' => '4PS',
                'description' => 'Beneficiary of the Pantawid Pamilyang Pilipino Program',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Solo Parent',
                'code' => 'SP',
                'description' => 'Registered solo parent',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Indigent',
                'code' => 'IND',
                'description' => 'Low income or indigent resident',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Indigenous People',
                'code' => 'IP',
                'description' => 'Member of indigenous cultural community',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Farmer',
                'code' => 'FRM',
                'description' => 'Registered farmer',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Fisherfolk',
                'code' => 'FSH',
                'description' => 'Registered fisherfolk',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'OFW Family',
                'code' => 'OFW',
                'description' => 'Family member of Overseas Filipino Worker',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Student Scholar',
                'code' => 'SCH',
                'description' => 'Government scholarship beneficiary',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Senior Pensioner',
                'code' => 'OSP',
                'description' => 'Senior citizen receiving social pension',
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'name' => 'Unemployed',
                'code' => 'UNE',
                'description' => 'Currently unemployed individual',
                'created_at' => now(),
                'updated_at' => now()
            ],

        ]);
    }
}