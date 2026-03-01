<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users for department heads (optional)
        $users = User::all();

        $departments = [
            // Executive Departments
            [
                'name' => 'Office of the Barangay Captain',
                'description' => 'Executive department headed by the Barangay Captain, responsible for overall governance and implementation of programs.',
                'head_user_id' => $this->getUserIdByRole('Barangay Captain', $users),
                'is_active' => true,
            ],
            [
                'name' => 'Office of the Barangay Secretary',
                'description' => 'Handles documentation, records management, and administrative support for the barangay council.',
                'head_user_id' => $this->getUserIdByRole('Barangay Secretary', $users),
                'is_active' => true,
            ],
            [
                'name' => 'Office of the Barangay Treasurer',
                'description' => 'Manages barangay finances, collections, disbursements, and financial reporting.',
                'head_user_id' => $this->getUserIdByRole('Barangay Treasurer', $users),
                'is_active' => true,
            ],

            // Administrative Departments
            [
                'name' => 'Human Resources and Administration',
                'description' => 'Manages personnel records, payroll, benefits, and administrative services.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Records Management Office',
                'description' => 'Responsible for maintaining and archiving all barangay records and documents.',
                'head_user_id' => $this->getUserIdByRole('Records Clerk', $users),
                'is_active' => true,
            ],

            // Community Services
            [
                'name' => 'Community Affairs Office',
                'description' => 'Handles community relations, events, and public assistance programs.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Social Welfare and Development',
                'description' => 'Implements social welfare programs, assists indigent families, and coordinates with DSWD.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Health Services Office',
                'description' => 'Manages health center operations, medical missions, and health programs.',
                'head_user_id' => null,
                'is_active' => true,
            ],

            // Public Safety
            [
                'name' => 'Peace and Order Office',
                'description' => 'Coordinates with tanods, police, and maintains peace and order in the barangay.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Disaster Risk Reduction Office',
                'description' => 'Manages disaster preparedness, response, and recovery programs.',
                'head_user_id' => null,
                'is_active' => true,
            ],

            // Economic Development
            [
                'name' => 'Livelihood and Economic Development',
                'description' => 'Promotes livelihood programs, skills training, and economic opportunities.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Agriculture and Fisheries Office',
                'description' => 'Supports farmers and fisherfolk with programs and assistance.',
                'head_user_id' => null,
                'is_active' => true,
            ],

            // Infrastructure and Environment
            [
                'name' => 'Engineering and Infrastructure Office',
                'description' => 'Oversees infrastructure projects, road maintenance, and construction.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Environmental Management Office',
                'description' => 'Handles solid waste management, clean-up drives, and environmental programs.',
                'head_user_id' => null,
                'is_active' => true,
            ],

            // Youth and Education
            [
                'name' => 'Sangguniang Kabataan Office',
                'description' => 'Handles youth programs, activities, and Sangguniang Kabataan affairs.',
                'head_user_id' => $this->getUserIdByRole('SK Chairman', $users),
                'is_active' => true,
            ],
            [
                'name' => 'Education and Scholarship Office',
                'description' => 'Manages scholarship programs and educational assistance.',
                'head_user_id' => null,
                'is_active' => true,
            ],

            // Special Bodies
            [
                'name' => 'Barangay Justice System',
                'description' => 'Handles barangay conciliation and mediation (Lupong Tagapamayapa).',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Gender and Development Office',
                'description' => 'Promotes gender equality and handles women\'s affairs programs.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Senior Citizens Affairs Office',
                'description' => 'Handles programs and services for senior citizens.',
                'head_user_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Persons with Disability Affairs Office',
                'description' => 'Handles programs and services for persons with disabilities.',
                'head_user_id' => null,
                'is_active' => true,
            ],
        ];

        $createdCount = 0;
        $updatedCount = 0;

        foreach ($departments as $departmentData) {
            // Use name as unique identifier instead of code
            $department = Department::updateOrCreate(
                ['name' => $departmentData['name']],
                $departmentData
            );

            if ($department->wasRecentlyCreated) {
                $createdCount++;
            } else {
                $updatedCount++;
            }
        }

        $this->command->info('✅ Departments seeded successfully!');
        $this->command->info("   - Created: {$createdCount} new departments");
        $this->command->info("   - Updated: {$updatedCount} existing departments");
        $this->command->info("   - Total: " . Department::count() . " departments");

        // Display table
        $departmentsTable = Department::with('head')
            ->get(['id', 'name', 'head_user_id', 'is_active'])
            ->map(function($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'head' => $dept->head ? $dept->head->full_name : 'Vacant',
                    'status' => $dept->is_active ? 'Active' : 'Inactive',
                ];
            })->toArray();

        $this->command->table(
            ['ID', 'Department Name', 'Department Head', 'Status'],
            $departmentsTable
        );
    }

    /**
     * Get user ID by role name
     */
    private function getUserIdByRole(string $roleName, $users): ?int
    {
        if ($users->isEmpty()) {
            return null;
        }

        // This is a simple implementation - you might want to adjust based on your actual user data
        foreach ($users as $user) {
            if ($user->role && $user->role->name === $roleName) {
                return $user->id;
            }
        }

        return null;
    }
}