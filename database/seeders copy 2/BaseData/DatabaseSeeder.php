<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');
        
        // Disable foreign key checks for clean seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Seed in order of dependencies
        $this->call([
            // Base Data Seeders
            PurokSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            ResidentSeeder::class,
            HouseholdSeeder::class,
            HouseholdMemberSeeder::class,
            
            // Organization Structure
            CommitteeSeeder::class,
            PositionSeeder::class,
            OfficialSeeder::class,
            
            // Document Management
            DocumentCategorySeeder::class,
            DocumentTypeSeeder::class,
            ClearanceTypeSeeder::class,
            
            // Business and Financial
            BusinessSeeder::class,
            FeeTypeSeeder::class,
            DiscountTypeSeeder::class,
            DiscountRuleSeeder::class,
            
            // Communications
            AnnouncementSeeder::class,
            
            // Reports and Complaints
            ReportTypeSeeder::class,
            CommunityReportSeeder::class,
            BlotterSeeder::class,
            
            // Support System
            SupportCategorySeeder::class,
            SupportTicketSeeder::class,
            
            // Forms
            FormSeeder::class,
            
            // Permissions (Last because it depends on roles)
            PermissionsSeeder::class,
        ]);
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        $this->command->info('✅ Database seeding completed successfully!');
    }
}