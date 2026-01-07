<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use Illuminate\Database\Seeder;

class DocumentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Identification', 'slug' => 'identification', 'icon' => 'User', 'color' => 'purple', 'order' => 1],
            ['name' => 'Personal', 'slug' => 'personal', 'icon' => 'Heart', 'color' => 'pink', 'order' => 2],
            ['name' => 'Financial', 'slug' => 'financial', 'icon' => 'FileText', 'color' => 'green', 'order' => 3],
            ['name' => 'Health', 'slug' => 'health', 'icon' => 'Heart', 'color' => 'red', 'order' => 4],
            ['name' => 'Education', 'slug' => 'education', 'icon' => 'GraduationCap', 'color' => 'amber', 'order' => 5],
            ['name' => 'Business', 'slug' => 'business', 'icon' => 'Briefcase', 'color' => 'indigo', 'order' => 6],
            ['name' => 'Certificates', 'slug' => 'certificates', 'icon' => 'Award', 'color' => 'blue', 'order' => 7],
            ['name' => 'Permits', 'slug' => 'permits', 'icon' => 'Shield', 'color' => 'orange', 'order' => 8],
        ];

        foreach ($categories as $category) {
            DocumentCategory::create($category);
        }
    }
}