<?php
// database/seeders/DiscountTypeSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiscountType;

class DiscountTypeSeeder extends Seeder
{
    public function run()
    {
        $discountTypes = [
            [
                'code' => 'SENIOR',
                'name' => 'Senior Citizen',
                'description' => 'Discount for senior citizens aged 60 and above',
                'default_percentage' => 20.00,
                'legal_basis' => 'Republic Act 9994 (Expanded Senior Citizens Act)',
                'requirements' => ['Senior Citizen ID', 'Birth Certificate'],
                'is_active' => true,
                'is_mandatory' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'PWD',
                'name' => 'Person with Disability',
                'description' => 'Discount for persons with disabilities',
                'default_percentage' => 20.00,
                'legal_basis' => 'Republic Act 10754',
                'requirements' => ['PWD ID', 'Medical Certificate'],
                'is_active' => true,
                'is_mandatory' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'SOLO_PARENT',
                'name' => 'Solo Parent',
                'description' => 'Discount for solo parents',
                'default_percentage' => 10.00,
                'legal_basis' => 'Republic Act 8972',
                'requirements' => ['Solo Parent ID', 'Birth Certificate of Children'],
                'is_active' => true,
                'is_mandatory' => false,
                'sort_order' => 3,
            ],
            [
                'code' => 'INDIGENT',
                'name' => 'Indigent',
                'description' => 'Discount for indigent families as certified by LGU',
                'default_percentage' => 50.00,
                'legal_basis' => 'Local Ordinance',
                'requirements' => ['Certificate of Indigency', 'Barangay Certification'],
                'is_active' => true,
                'is_mandatory' => false,
                'sort_order' => 4,
            ],
            [
                'code' => 'VETERAN',
                'name' => 'Veteran',
                'description' => 'Discount for military veterans',
                'default_percentage' => 20.00,
                'legal_basis' => 'Republic Act 6948',
                'requirements' => ['Veteran ID', 'Service Records'],
                'is_active' => true,
                'is_mandatory' => false,
                'sort_order' => 5,
            ],
        ];

        foreach ($discountTypes as $discountType) {
            DiscountType::create($discountType);
        }
    }
}