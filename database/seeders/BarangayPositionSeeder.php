<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\Position;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BarangayPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, seed the committees
        $this->seedCommittees();

        // Then seed the positions that reference committees
        $this->seedPositions();
    }

    /**
     * Seed all barangay committees
     */
    private function seedCommittees(): void
    {
        $committees = [
            [
                'code' => 'COM-001',
                'name' => 'Committee on Appropriations',
                'description' => 'Oversees the barangay\'s budget and financial matters',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'COM-002',
                'name' => 'Committee on Peace and Order',
                'description' => 'Maintains peace and order in the barangay',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'COM-003',
                'name' => 'Committee on Health and Sanitation',
                'description' => 'Manages health programs and sanitation initiatives',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'COM-004',
                'name' => 'Committee on Education',
                'description' => 'Oversees educational programs and scholarship grants',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'COM-005',
                'name' => 'Committee on Infrastructure',
                'description' => 'Manages barangay infrastructure projects',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'code' => 'COM-006',
                'name' => 'Committee on Environmental Protection',
                'description' => 'Implements environmental protection programs',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'code' => 'COM-007',
                'name' => 'Committee on Sports and Youth Development',
                'description' => 'Promotes sports and youth programs',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'code' => 'COM-008',
                'name' => 'Committee on Social Services',
                'description' => 'Manages social welfare programs and services',
                'order' => 8,
                'is_active' => true,
            ],
            [
                'code' => 'COM-009',
                'name' => 'Committee on Laws and Ordinances',
                'description' => 'Reviews and proposes barangay ordinances',
                'order' => 9,
                'is_active' => true,
            ],
            [
                'code' => 'COM-010',
                'name' => 'Committee on Barangay Affairs',
                'description' => 'Handles internal barangay administrative matters',
                'order' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($committees as $committee) {
            Committee::updateOrCreate(
                ['code' => $committee['code']],
                $committee
            );
        }

        $this->command->info('Committees seeded successfully!');
    }

    /**
     * Seed all barangay positions with their committee assignments
     */
    private function seedPositions(): void
    {
        // Get role IDs if you have a roles table
        // For now, we'll set role_id to null or you can create default roles
        $captainRole = Role::firstOrCreate(
            ['name' => 'Barangay Captain'],
            ['guard_name' => 'web', 'description' => 'Barangay Captain']
        )->id ?? 1;

        $kagawadRole = Role::firstOrCreate(
            ['name' => 'Barangay Kagawad'],
            ['guard_name' => 'web', 'description' => 'Barangay Kagawad']
        )->id ?? 2;

        $skChairmanRole = Role::firstOrCreate(
            ['name' => 'SK Chairman'],
            ['guard_name' => 'web', 'description' => 'Sangguniang Kabataan Chairman']
        )->id ?? 3;

        $secretaryRole = Role::firstOrCreate(
            ['name' => 'Barangay Secretary'],
            ['guard_name' => 'web', 'description' => 'Barangay Secretary']
        )->id ?? 4;

        $treasurerRole = Role::firstOrCreate(
            ['name' => 'Barangay Treasurer'],
            ['guard_name' => 'web', 'description' => 'Barangay Treasurer']
        )->id ?? 5;

        // Get committee IDs for reference
        $committees = Committee::all()->keyBy('code');

        // Define positions with their committee assignments
        $positions = [
            // Barangay Captain
            [
                'code' => 'CAPTAIN',
                'name' => 'Barangay Captain',
                'committee_id' => $committees['COM-009']->id, // Laws and Ordinances
                'additional_committees' => [
                    $committees['COM-001']->id, // Appropriations
                    $committees['COM-002']->id, // Peace and Order
                ],
                'description' => 'Chief executive of the barangay',
                'order' => 1,
                'role_id' => $captainRole,
                'requires_account' => true,
                'is_active' => true,
            ],

            // Barangay Kagawads (7 members)
            [
                'code' => 'KAGAWAD-1',
                'name' => 'Barangay Kagawad - Committee on Appropriations',
                'committee_id' => $committees['COM-001']->id,
                'additional_committees' => [
                    $committees['COM-008']->id, // Social Services
                ],
                'description' => 'Chairperson, Committee on Appropriations',
                'order' => 2,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-2',
                'name' => 'Barangay Kagawad - Committee on Peace and Order',
                'committee_id' => $committees['COM-002']->id,
                'additional_committees' => [
                    $committees['COM-009']->id, // Laws and Ordinances
                ],
                'description' => 'Chairperson, Committee on Peace and Order',
                'order' => 3,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-3',
                'name' => 'Barangay Kagawad - Committee on Health and Sanitation',
                'committee_id' => $committees['COM-003']->id,
                'additional_committees' => [
                    $committees['COM-008']->id, // Social Services
                ],
                'description' => 'Chairperson, Committee on Health and Sanitation',
                'order' => 4,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-4',
                'name' => 'Barangay Kagawad - Committee on Education',
                'committee_id' => $committees['COM-004']->id,
                'additional_committees' => [
                    $committees['COM-007']->id, // Sports and Youth Development
                ],
                'description' => 'Chairperson, Committee on Education',
                'order' => 5,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-5',
                'name' => 'Barangay Kagawad - Committee on Infrastructure',
                'committee_id' => $committees['COM-005']->id,
                'additional_committees' => [
                    $committees['COM-006']->id, // Environmental Protection
                ],
                'description' => 'Chairperson, Committee on Infrastructure',
                'order' => 6,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-6',
                'name' => 'Barangay Kagawad - Committee on Environmental Protection',
                'committee_id' => $committees['COM-006']->id,
                'additional_committees' => [
                    $committees['COM-003']->id, // Health and Sanitation
                ],
                'description' => 'Chairperson, Committee on Environmental Protection',
                'order' => 7,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'code' => 'KAGAWAD-7',
                'name' => 'Barangay Kagawad - Committee on Sports and Youth Development',
                'committee_id' => $committees['COM-007']->id,
                'additional_committees' => [
                    $committees['COM-004']->id, // Education
                ],
                'description' => 'Chairperson, Committee on Sports and Youth Development',
                'order' => 8,
                'role_id' => $kagawadRole,
                'requires_account' => true,
                'is_active' => true,
            ],

            // SK Chairman
            [
                'code' => 'SK-CHAIRMAN',
                'name' => 'Sangguniang Kabataan Chairman',
                'committee_id' => $committees['COM-007']->id, // Sports and Youth Development
                'additional_committees' => [
                    $committees['COM-004']->id, // Education
                    $committees['COM-008']->id, // Social Services
                ],
                'description' => 'Chairperson of the Sangguniang Kabataan',
                'order' => 9,
                'role_id' => $skChairmanRole,
                'requires_account' => true,
                'is_active' => true,
            ],

            // Barangay Secretary
            [
                'code' => 'SECRETARY',
                'name' => 'Barangay Secretary',
                'committee_id' => $committees['COM-010']->id, // Barangay Affairs
                'additional_committees' => [
                    $committees['COM-001']->id, // Appropriations (for minutes of meetings)
                ],
                'description' => 'Secretary to the Barangay Council',
                'order' => 10,
                'role_id' => $secretaryRole,
                'requires_account' => true,
                'is_active' => true,
            ],

            // Barangay Treasurer
            [
                'code' => 'TREASURER',
                'name' => 'Barangay Treasurer',
                'committee_id' => $committees['COM-001']->id, // Appropriations
                'additional_committees' => [
                    $committees['COM-010']->id, // Barangay Affairs
                ],
                'description' => 'Treasurer of the Barangay',
                'order' => 11,
                'role_id' => $treasurerRole,
                'requires_account' => true,
                'is_active' => true,
            ],
        ];

        // Create or update each position
        foreach ($positions as $position) {
            Position::updateOrCreate(
                ['code' => $position['code']],
                $position
            );
        }

        $this->command->info('Positions seeded successfully!');
    }

    /**
     * Optional: Additional method to clear existing data if needed
     */
    public function clearExistingData(): void
    {
        // Be careful with this! Only use in development
        if (app()->environment('local')) {
            Position::truncate();
            Committee::truncate();
            $this->command->info('Existing positions and committees cleared.');
        }
    }
}