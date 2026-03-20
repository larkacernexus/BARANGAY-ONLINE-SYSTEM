<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ResidentImportController extends BaseResidentController
{
    public function import()
    {
        $privileges = Privilege::where('is_active', true)
            ->orderBy('name')
            ->get(['code', 'name']);

        return Inertia::render('admin/Residents/Import', [
            'privileges' => $privileges
        ]);
    }

    public function processImport(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240',
            'has_headers' => 'boolean',
        ]);

        $file = $request->file('csv_file');
        $hasHeaders = $request->boolean('has_headers', true);
        $results = [
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
            'errors' => [],
            'successes' => [],
        ];

        try {
            $handle = fopen($file->getRealPath(), 'r');
            
            // Skip headers if present
            if ($hasHeaders) {
                fgetcsv($handle);
            }

            $rowNumber = $hasHeaders ? 2 : 1;
            
            DB::beginTransaction();

            while (($row = fgetcsv($handle)) !== false) {
                $results['total']++;
                
                $rowResult = $this->processRow($row, $rowNumber);
                
                if ($rowResult['success']) {
                    $results['successful']++;
                    $results['successes'][] = $rowResult['data'];
                } else {
                    $results['failed']++;
                    $results['errors'][] = $rowResult['error'];
                }

                $rowNumber++;
            }

            fclose($handle);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Import completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'results' => $results
            ], 500);
        }
    }

    private function processRow(array $row, int $rowNumber): array
    {
        // Skip empty rows
        if (empty(array_filter($row))) {
            return [
                'success' => false,
                'error' => [
                    'row' => $rowNumber,
                    'error' => 'Empty row skipped',
                    'data' => $row
                ]
            ];
        }

        // Validate required field count
        if (count($row) < 11) {
            return [
                'success' => false,
                'error' => [
                    'row' => $rowNumber,
                    'error' => 'Insufficient columns. Expected at least 11 fields.',
                    'data' => $row
                ]
            ];
        }

        // Map CSV columns to database fields
        $data = $this->mapCsvToData($row);

        // Handle privileges column (last column)
        $privilegeCodes = [];
        if (isset($row[19]) && !empty(trim($row[19]))) {
            $privilegeCodes = explode('|', trim($row[19]));
        }

        // Validate resident data
        $validator = Validator::make($data, [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'household_id' => 'nullable|exists:households,id',
            'occupation' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'is_voter' => 'boolean',
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'error' => [
                    'row' => $rowNumber,
                    'error' => implode(', ', $validator->errors()->all()),
                    'data' => $row
                ]
            ];
        }

        try {
            // Calculate age
            $data['age'] = Carbon::parse($data['birth_date'])->age;
            
            // Generate resident ID
            $data['resident_id'] = $this->generateResidentId();
            
            // Set default status if not provided
            if (!isset($data['status']) || empty($data['status'])) {
                $data['status'] = 'active';
            }

            $resident = Resident::create($data);

            // Handle privileges
            if (!empty($privilegeCodes)) {
                $this->addPrivileges($resident, $privilegeCodes);
            }

            // Handle household membership
            if (!empty($data['household_id']) && $data['household_id'] !== 'none') {
                $this->addToHousehold($resident, $data['household_id']);
            }

            return [
                'success' => true,
                'data' => [
                    'row' => $rowNumber,
                    'resident_id' => $data['resident_id'],
                    'name' => trim($data['first_name'] . ' ' . $data['last_name']),
                    'privileges' => $privilegeCodes,
                    'message' => 'Successfully imported'
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => [
                    'row' => $rowNumber,
                    'error' => 'Database error: ' . $e->getMessage(),
                    'data' => $row
                ]
            ];
        }
    }

    private function mapCsvToData(array $row): array
    {
        return [
            'first_name' => $row[0] ?? null,
            'last_name' => $row[1] ?? null,
            'middle_name' => $row[2] ?? null,
            'suffix' => $row[3] ?? null,
            'birth_date' => $row[4] ?? null,
            'gender' => strtolower($row[5] ?? ''),
            'civil_status' => strtolower($row[6] ?? ''),
            'contact_number' => $row[7] ?? null,
            'email' => $row[8] ?? null,
            'address' => $row[9] ?? null,
            'purok_id' => $row[10] ?? null,
            'household_id' => isset($row[11]) && $row[11] !== '' ? $row[11] : null,
            'occupation' => $row[12] ?? null,
            'education' => $row[13] ?? null,
            'religion' => $row[14] ?? null,
            'is_voter' => (bool)($row[15] ?? 0),
            'place_of_birth' => $row[16] ?? null,
            'remarks' => $row[17] ?? null,
            'status' => $row[18] ?? 'active',
        ];
    }

    private function addPrivileges(Resident $resident, array $privilegeCodes): void
    {
        $privileges = Privilege::whereIn('code', $privilegeCodes)
            ->where('is_active', true)
            ->get();
        
        if ($privileges->isEmpty()) {
            return;
        }

        $privilegeData = [];
        foreach ($privileges as $privilege) {
            $expiresAt = $privilege->validity_years ? now()->addYears($privilege->validity_years) : null;

            $privilegeData[] = [
                'privilege_id' => $privilege->id,
                'id_number' => null,
                'verified_at' => now(),
                'expires_at' => $expiresAt,
                'remarks' => 'Imported via CSV',
                'discount_percentage' => $privilege->default_discount_percentage,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $resident->residentPrivileges()->createMany($privilegeData);
    }

    private function addToHousehold(Resident $resident, $householdId): void
    {
        $household = Household::find($householdId);
        
        if (!$household) {
            return;
        }

        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'member',
            'is_head' => false,
        ]);

        $household->update([
            'member_count' => $household->householdMembers()->count()
        ]);
        
        $resident->update(['household_id' => $household->id]);
    }

    public function downloadGuide()
    {
        $privileges = Privilege::where('is_active', true)
            ->orderBy('code')
            ->get(['code', 'name']);

        $privilegeList = $privileges->map(fn($p) => "{$p->code} - {$p->name}")->implode("\n");

        $guideContent = "RESIDENTS IMPORT GUIDE
===========================

REQUIRED FORMAT: CSV (Comma Separated Values)
ENCODING: UTF-8

COLUMN ORDER (20 columns):
1. first_name     - First name (required)
2. last_name      - Last name (required)
3. middle_name    - Middle name (optional)
4. suffix         - Suffix: Jr., Sr., III, etc. (optional)
5. birth_date     - Date of birth: YYYY-MM-DD (required)
6. gender         - male, female, or other (required)
7. civil_status   - single, married, widowed, separated (required)
8. contact_number - 11-digit mobile number (required)
9. email          - Email address (optional)
10. address       - Complete address (required)
11. purok_id      - Purok ID (must exist in database) (required)
12. household_id  - Household ID (optional, must exist or leave empty)
13. occupation    - Occupation/profession (optional)
14. education     - Highest education (optional)
15. religion      - Religion (optional)
16. is_voter      - 1 for yes, 0 for no (required)
17. place_of_birth - City/Municipality, Province (optional)
18. remarks       - Additional notes (optional)
19. status        - active or inactive (optional, defaults to active)
20. privileges    - Pipe-separated privilege codes (e.g., \"SC|PWD|4PS\") (optional)

AVAILABLE PRIVILEGE CODES:
{$privilegeList}

VALIDATION RULES:
- Email must be valid format
- Contact numbers must be 11 digits
- Birth dates must be valid
- Purok ID must exist in puroks table
- Household ID must exist in households table or be empty
- Privilege codes must exist in privileges table

IMPORTANT NOTES:
- Do NOT include id, resident_id, photo_path, age, created_at, updated_at
- These are auto-generated or calculated
- Maximum file size: 10MB
- Maximum rows per import: 1000

TIPS:
- Save CSV in UTF-8 encoding
- Do not modify column headers
- Dates must be YYYY-MM-DD format
- For text with commas, enclose in double quotes
- Example: \"Manila, Philippines\"";

        return response($guideContent, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="residents_import_guide.txt"',
        ]);
    }

    public function downloadTemplate()
    {
        $privileges = Privilege::where('is_active', true)
            ->pluck('code')
            ->implode('|');

        $csvTemplate = "first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,place_of_birth,remarks,status,privileges\n";
        $csvTemplate .= "Juan,Dela Cruz,Santos,Jr.,1990-05-15,male,single,09123456789,juan@example.com,123 Main Street,1,1,Farmer,College Graduate,Roman Catholic,1,Manila City,\"Active resident\",active,\"{$privileges}\"\n";

        return response($csvTemplate, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="residents_import_template.csv"',
        ]);
    }

    public function downloadEmptyTemplate()
    {
        $headers = 'first_name,last_name,middle_name,suffix,birth_date,gender,civil_status,contact_number,email,address,purok_id,household_id,occupation,education,religion,is_voter,place_of_birth,remarks,status,privileges';
        $emptyTemplate = $headers . "\n" . str_repeat(',', 19);
        
        return response($emptyTemplate, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="residents_empty_template.csv"',
        ]);
    }
}