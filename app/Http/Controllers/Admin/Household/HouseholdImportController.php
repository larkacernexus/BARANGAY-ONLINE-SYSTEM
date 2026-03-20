<?php

namespace App\Http\Controllers\Admin\Household;

use App\Models\Household;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdImportController extends BaseHouseholdController
{
    public function import(Request $request)
    {
        Log::info('Starting household import');
        
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'create_user_accounts' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file. Please upload a CSV file less than 10MB.',
                'errors' => $validator->errors()->toArray()
            ], 422);
        }

        try {
            $csvData = array_map('str_getcsv', file($request->file('file')->getRealPath()));
            
            if (count($csvData) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'CSV file must contain headers and at least one row of data.',
                ], 422);
            }

            $headers = array_map('trim', $csvData[0]);
            $rows = array_slice($csvData, 1);

            $missingHeaders = array_diff(
                ['head_first_name', 'head_last_name', 'contact_number', 'address', 'purok_name'], 
                $headers
            );
            
            if (!empty($missingHeaders)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing required headers: ' . implode(', ', $missingHeaders),
                ], 422);
            }

            $headerMap = array_flip($headers);
            $results = [
                'success' => 0,
                'failed' => 0,
                'total' => count($rows),
                'errors' => [],
                'warnings' => [],
            ];

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2;
                $result = $this->processRow($row, $headerMap, $rowNumber, $request);
                
                if ($result['success']) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                    $results['errors'][] = $result['error'];
                }
                
                if (!empty($result['warnings'])) {
                    $results['warnings'] = array_merge($results['warnings'], $result['warnings']);
                }
            }

            DB::commit();

            return response()->json(array_merge([
                'success' => true,
                'message' => $results['failed'] === 0 
                    ? "Successfully imported {$results['success']} households."
                    : "Imported {$results['success']} households with {$results['failed']} failures.",
            ], $results));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function processRow($row, $headerMap, $rowNumber, $request)
    {
        $warnings = [];
        
        try {
            $data = $this->extractRowData($row, $headerMap);
            
            $errors = $this->validateRowData($data);
            if (!empty($errors)) {
                return [
                    'success' => false,
                    'error' => ['row' => $rowNumber, 'errors' => $errors]
                ];
            }

            $purok = $this->findOrCreatePurok($data['purok_name'], $warnings);
            
            if (!empty($data['household_number']) && 
                Household::where('household_number', $data['household_number'])->exists()) {
                return [
                    'success' => false,
                    'error' => [
                        'row' => $rowNumber,
                        'errors' => ['household_number' => ['Household number already exists']]
                    ]
                ];
            }

            $headResident = $this->findOrCreateHeadResident($data, $purok, $warnings);
            $household = $this->createHouseholdFromImport($data, $purok);
            
            $this->addHeadMember($household, $headResident);
            $this->processAdditionalMembers($household, $row, $headerMap, $data, $purok, $warnings);
            
            if ($request->boolean('create_user_accounts', true)) {
                $this->createUserForHouseholdHead($household, $headResident, $request);
            }

            return [
                'success' => true,
                'warnings' => array_map(fn($w) => ['row' => $rowNumber, 'message' => $w], $warnings)
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => ['row' => $rowNumber, 'errors' => ['exception' => [$e->getMessage()]]]
            ];
        }
    }

    private function extractRowData($row, $headerMap)
    {
        return [
            'household_number' => $row[$headerMap['household_number']] ?? null,
            'head_first_name' => $row[$headerMap['head_first_name']] ?? '',
            'head_last_name' => $row[$headerMap['head_last_name']] ?? '',
            'head_middle_name' => $row[$headerMap['head_middle_name']] ?? null,
            'contact_number' => $row[$headerMap['contact_number']] ?? '',
            'email' => $row[$headerMap['email']] ?? null,
            'address' => $row[$headerMap['address']] ?? '',
            'purok_name' => $row[$headerMap['purok_name']] ?? '',
            'member_count' => $row[$headerMap['member_count']] ?? 1,
            'income_range' => $row[$headerMap['income_range']] ?? null,
            'housing_type' => $row[$headerMap['housing_type']] ?? null,
            'ownership_status' => $row[$headerMap['ownership_status']] ?? null,
            'water_source' => $row[$headerMap['water_source']] ?? null,
            'electricity' => isset($row[$headerMap['electricity']]) && strtoupper($row[$headerMap['electricity']]) === 'TRUE',
            'internet' => isset($row[$headerMap['internet']]) && strtoupper($row[$headerMap['internet']]) === 'TRUE',
            'vehicle' => isset($row[$headerMap['vehicle']]) && strtoupper($row[$headerMap['vehicle']]) === 'TRUE',
            'remarks' => $row[$headerMap['remarks']] ?? null,
        ];
    }

    private function validateRowData($data)
    {
        $errors = [];
        if (empty($data['head_first_name'])) $errors['head_first_name'] = ['First name is required'];
        if (empty($data['head_last_name'])) $errors['head_last_name'] = ['Last name is required'];
        if (empty($data['contact_number'])) $errors['contact_number'] = ['Contact number is required'];
        if (empty($data['address'])) $errors['address'] = ['Address is required'];
        if (empty($data['purok_name'])) $errors['purok_name'] = ['Purok name is required'];
        return $errors;
    }

    private function findOrCreatePurok($name, &$warnings)
    {
        $purok = Purok::where('name', $name)->first();
        if (!$purok) {
            $warnings[] = "Purok '{$name}' not found. Creating new purok.";
            $purok = Purok::create([
                'name' => $name,
                'slug' => \Str::slug($name),
                'status' => 'active',
            ]);
        }
        return $purok;
    }

    private function findOrCreateHeadResident($data, $purok, &$warnings)
    {
        $resident = Resident::where('first_name', $data['head_first_name'])
            ->where('last_name', $data['head_last_name'])
            ->first();

        if (!$resident) {
            $warnings[] = "New resident created for head of family.";
            $resident = Resident::create([
                'first_name' => $data['head_first_name'],
                'last_name' => $data['head_last_name'],
                'middle_name' => $data['head_middle_name'],
                'contact_number' => $data['contact_number'],
                'address' => $data['address'],
                'purok_id' => $purok->id,
                'status' => 'active',
                'gender' => 'male',
                'civil_status' => 'Single',
            ]);
        }
        
        return $resident;
    }

    private function createHouseholdFromImport($data, $purok)
    {
        $householdNumber = $data['household_number'] ?: $this->generateHouseholdNumber();
        
        return Household::create([
            'household_number' => $householdNumber,
            'contact_number' => $data['contact_number'],
            'email' => $data['email'],
            'address' => $data['address'],
            'purok_id' => $purok->id,
            'member_count' => (int) $data['member_count'],
            'income_range' => $data['income_range'],
            'housing_type' => $data['housing_type'],
            'ownership_status' => $data['ownership_status'],
            'water_source' => $data['water_source'],
            'electricity' => $data['electricity'],
            'internet' => $data['internet'],
            'vehicle' => $data['vehicle'],
            'remarks' => $data['remarks'],
            'status' => 'active',
        ]);
    }

    private function addHeadMember($household, $resident)
    {
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => 'Head',
            'is_head' => true,
        ]);
    }

    private function processAdditionalMembers($household, $row, $headerMap, $data, $purok, &$warnings)
    {
        for ($i = 1; $i <= 5; $i++) {
            $nameKey = "member_{$i}_name";
            $relKey = "member_{$i}_relationship";
            $ageKey = "member_{$i}_age";

            if (isset($headerMap[$nameKey]) && !empty($row[$headerMap[$nameKey]])) {
                $this->processMember($household, $row, $headerMap, $i, $data, $purok, $warnings);
            }
        }
    }

    private function processMember($household, $row, $headerMap, $i, $data, $purok, &$warnings)
    {
        $name = $row[$headerMap["member_{$i}_name"]];
        $relationship = $row[$headerMap["member_{$i}_relationship"]] ?? 'Other Relative';
        $age = $row[$headerMap["member_{$i}_age"]] ?? null;

        $nameParts = explode(' ', $name, 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $resident = Resident::where('first_name', $firstName)
            ->where('last_name', $lastName)
            ->first();

        if (!$resident) {
            $gender = stripos(strtolower($relationship), 'wife') !== false ? 'female' : 'male';
            
            $resident = Resident::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'age' => $age,
                'address' => $data['address'],
                'purok_id' => $purok->id,
                'status' => 'active',
                'gender' => $gender,
                'civil_status' => 'Single',
            ]);
            $warnings[] = "New resident created for member: {$name}";
        }

        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => $relationship,
            'is_head' => false,
        ]);
    }
}