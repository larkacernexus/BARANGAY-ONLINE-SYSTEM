<?php
// database/seeders/SupportCategorySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SupportCategory;

class SupportCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Technical Support',
                'slug' => 'technical',
                'description' => 'Issues with the portal, login problems, technical errors',
                'icon' => 'Settings',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Billing & Payments',
                'slug' => 'billing',
                'description' => 'Payment issues, fee inquiries, receipts',
                'icon' => 'CreditCard',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Document Requests',
                'slug' => 'documents',
                'description' => 'Clearance requests, certificate applications',
                'icon' => 'FileText',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Account Management',
                'slug' => 'account',
                'description' => 'Profile updates, household members, account settings',
                'icon' => 'User',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'General Inquiry',
                'slug' => 'general',
                'description' => 'General questions about barangay services',
                'icon' => 'HelpCircle',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Feedback & Suggestions',
                'slug' => 'feedback',
                'description' => 'Suggestions for improvement, feedback about services',
                'icon' => 'MessageSquare',
                'order' => 6,
                'is_active' => true,
            ],
        ];
        
        foreach ($categories as $category) {
            SupportCategory::create($category);
        }
    }
}