<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use App\Models\DocumentCategory;
use Illuminate\Database\Seeder;

class DocumentTypesSeeder extends Seeder
{
    public function run(): void
    {
        // Get category IDs by slug
        $categories = [
            'identification' => DocumentCategory::where('slug', 'identification')->first()->id,
            'personal' => DocumentCategory::where('slug', 'personal')->first()->id,
            'financial' => DocumentCategory::where('slug', 'financial')->first()->id,
            'health' => DocumentCategory::where('slug', 'health')->first()->id,
            'education' => DocumentCategory::where('slug', 'education')->first()->id,
            'business' => DocumentCategory::where('slug', 'business')->first()->id,
            'certificates' => DocumentCategory::where('slug', 'certificates')->first()->id,
            'permits' => DocumentCategory::where('slug', 'permits')->first()->id,
        ];

        $documentTypes = [
            // IDENTIFICATION DOCUMENTS (category: identification)
            [
                'name' => 'Valid ID (Government Issued)',
                'code' => 'valid_id_gov',
                'description' => 'Any valid government-issued identification card (Passport, Driver\'s License, PRC ID, SSS ID, PhilHealth ID, Postal ID, Voter\'s ID)',
                'document_category_id' => $categories['identification'],
                'is_required' => true,
                'sort_order' => 1,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Barangay ID',
                'code' => 'barangay_id',
                'description' => 'Barangay Identification Card',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 2,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Philippine Passport',
                'code' => 'passport',
                'description' => 'Valid Philippine Passport (Bio page)',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 3,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Driver\'s License',
                'code' => 'drivers_license',
                'description' => 'Valid Driver\'s License (LTO)',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 4,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Voter\'s ID',
                'code' => 'voters_id',
                'description' => 'COMELEC Voter\'s Identification Card',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 5,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Senior Citizen ID',
                'code' => 'senior_citizen_id',
                'description' => 'Office of Senior Citizen Affairs (OSCA) ID',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 6,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'PWD ID',
                'code' => 'pwd_id',
                'description' => 'Persons with Disability Identification Card',
                'document_category_id' => $categories['identification'],
                'is_required' => false,
                'sort_order' => 7,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],

            // PERSONAL DOCUMENTS (category: personal)
            [
                'name' => 'Birth Certificate',
                'code' => 'birth_certificate',
                'description' => 'PSA-authenticated Birth Certificate',
                'document_category_id' => $categories['personal'],
                'is_required' => true,
                'sort_order' => 8,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Marriage Certificate',
                'code' => 'marriage_certificate',
                'description' => 'PSA-authenticated Marriage Certificate',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 9,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'CENOMAR',
                'code' => 'cenomar',
                'description' => 'Certificate of No Marriage (CENOMAR)',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 10,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],

            // PROOF OF RESIDENCY (category: personal)
            [
                'name' => 'Proof of Residency',
                'code' => 'proof_of_residency',
                'description' => 'Utility bills (electricity, water, internet, landline), Credit card statement, Bank statement (must show name and address)',
                'document_category_id' => $categories['personal'],
                'is_required' => true,
                'sort_order' => 11,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png', 'pdf']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Lease/Rental Contract',
                'code' => 'lease_contract',
                'description' => 'Notarized lease or rental agreement',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 12,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'Barangay Certificate of Residency',
                'code' => 'barangay_residency_cert',
                'description' => 'Certificate issued by the barangay confirming residency',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 13,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Tax Declaration',
                'code' => 'tax_declaration',
                'description' => 'Real Property Tax Declaration',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 14,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],

            // FINANCIAL DOCUMENTS (category: financial)
            [
                'name' => 'Proof of Income',
                'code' => 'proof_of_income',
                'description' => 'Certificate of Employment with Compensation, Latest payslip, ITR, Business registration documents',
                'document_category_id' => $categories['financial'],
                'is_required' => true,
                'sort_order' => 15,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'Certificate of Indigency',
                'code' => 'certificate_indigency',
                'description' => 'Certificate declaring low-income status',
                'document_category_id' => $categories['financial'],
                'is_required' => false,
                'sort_order' => 16,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'ITR (Income Tax Return)',
                'code' => 'itr',
                'description' => 'Latest Income Tax Return',
                'document_category_id' => $categories['financial'],
                'is_required' => false,
                'sort_order' => 17,
                'accepted_formats' => json_encode(['pdf']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'Bank Statement',
                'code' => 'bank_statement',
                'description' => 'Latest 3 months bank statement',
                'document_category_id' => $categories['financial'],
                'is_required' => false,
                'sort_order' => 18,
                'accepted_formats' => json_encode(['pdf']),
                'max_file_size' => 5120,
            ],

            // HEALTH DOCUMENTS (category: health)
            [
                'name' => 'Medical Certificate',
                'code' => 'medical_certificate',
                'description' => 'Medical certificate from licensed physician',
                'document_category_id' => $categories['health'],
                'is_required' => false,
                'sort_order' => 19,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Laboratory Results',
                'code' => 'lab_results',
                'description' => 'Medical laboratory test results',
                'document_category_id' => $categories['health'],
                'is_required' => false,
                'sort_order' => 20,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],

            // EDUCATION DOCUMENTS (category: education)
            [
                'name' => 'School ID',
                'code' => 'school_id',
                'description' => 'Valid School Identification Card',
                'document_category_id' => $categories['education'],
                'is_required' => false,
                'sort_order' => 21,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Transcript of Records',
                'code' => 'transcript_records',
                'description' => 'Official Transcript of Records',
                'document_category_id' => $categories['education'],
                'is_required' => false,
                'sort_order' => 22,
                'accepted_formats' => json_encode(['pdf']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'Diploma',
                'code' => 'diploma',
                'description' => 'Graduation Diploma',
                'document_category_id' => $categories['education'],
                'is_required' => false,
                'sort_order' => 23,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],

            // BUSINESS DOCUMENTS (category: business)
            [
                'name' => 'Business Permit',
                'code' => 'business_permit',
                'description' => 'Mayor\'s Permit/Business Permit',
                'document_category_id' => $categories['business'],
                'is_required' => false,
                'sort_order' => 24,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'DTI/SEC Registration',
                'code' => 'dti_sec_registration',
                'description' => 'DTI Business Name Registration or SEC Certificate',
                'document_category_id' => $categories['business'],
                'is_required' => false,
                'sort_order' => 25,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],
            [
                'name' => 'Business Plan',
                'code' => 'business_plan',
                'description' => 'Detailed business plan',
                'document_category_id' => $categories['business'],
                'is_required' => false,
                'sort_order' => 26,
                'accepted_formats' => json_encode(['pdf', 'doc', 'docx']),
                'max_file_size' => 10240,
            ],

            // CERTIFICATES (category: certificates)
            [
                'name' => 'Barangay Clearance',
                'code' => 'barangay_clearance',
                'description' => 'Barangay Clearance Certificate',
                'document_category_id' => $categories['certificates'],
                'is_required' => true,
                'sort_order' => 27,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Police Clearance',
                'code' => 'police_clearance',
                'description' => 'NBI or Police Clearance',
                'document_category_id' => $categories['certificates'],
                'is_required' => false,
                'sort_order' => 28,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],

            // PERMITS (category: permits)
            [
                'name' => 'Court Clearance',
                'code' => 'court_clearance',
                'description' => 'Court Clearance Certificate',
                'document_category_id' => $categories['permits'],
                'is_required' => false,
                'sort_order' => 29,
                'accepted_formats' => json_encode(['pdf']),
                'max_file_size' => 2048,
            ],

            // EMPLOYMENT DOCUMENTS (category: personal)
            [
                'name' => 'Certificate of Employment',
                'code' => 'certificate_employment',
                'description' => 'Certificate from current employer',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 30,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Pay Slip',
                'code' => 'payslip',
                'description' => 'Latest 3 months payslip',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 31,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 5120,
            ],

            // PHOTOS (category: personal)
            [
                'name' => '2x2 ID Picture',
                'code' => 'photo_2x2',
                'description' => 'Recent 2x2 colored ID picture with white background',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 32,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png']),
                'max_file_size' => 1024,
            ],
            [
                'name' => '1x1 ID Picture',
                'code' => 'photo_1x1',
                'description' => 'Recent 1x1 colored ID picture with white background',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 33,
                'accepted_formats' => json_encode(['jpg', 'jpeg', 'png']),
                'max_file_size' => 1024,
            ],

            // OTHER DOCUMENTS (category: personal)
            [
                'name' => 'Authorization Letter',
                'code' => 'authorization_letter',
                'description' => 'Notarized authorization letter if processing for someone else',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 34,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
            [
                'name' => 'Affidavit',
                'code' => 'affidavit',
                'description' => 'Notarized affidavit for various purposes',
                'document_category_id' => $categories['personal'],
                'is_required' => false,
                'sort_order' => 35,
                'accepted_formats' => json_encode(['pdf', 'jpg', 'jpeg']),
                'max_file_size' => 2048,
            ],
        ];

        foreach ($documentTypes as $type) {
            DocumentType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }

        $this->command->info('Document types seeded successfully!');
    }
}