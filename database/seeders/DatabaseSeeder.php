<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DocumentTypesSeeder::class, 
            PermissionsSeeder::class,
            ClearanceTypesTableSeeder::class,
            DiscountRuleSeeder::class,
            DiscountTypeSeeder::class,
            // DocumentCategorySeeder::class,
            DocumentTypesSeeder::class,
            FeeTypesTableSeeder::class,
            // PurokSeeder::class,
            ReportTypeSeeder::class,
            ResidentSeeder::class,
            
            // ClearanceTypeSeeder::class,
        ]);
    }
}