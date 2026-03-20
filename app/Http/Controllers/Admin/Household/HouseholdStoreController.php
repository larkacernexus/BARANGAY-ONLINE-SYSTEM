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

class HouseholdStoreController extends BaseHouseholdController
{
    public function store(Request $request)
    {
        Log::info('Household creation started');
        
        $validator = Validator::make($request->all(), [
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'total_members' => 'required|integer|min:1',
            'members' => 'required|array|min:1',
            'members.*.name' => 'required|string|max:200',
            'members.*.relationship' => 'required|string|max:50',
            'members.*.resident_id' => 'nullable|exists:residents,id',
            'create_user_account' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        
        $headCount = collect($request->members)
            ->filter(fn($m) => strtolower(trim($m['relationship'])) === 'head')
            ->count();
        
        if ($headCount !== 1) {
            return redirect()->back()
                ->withErrors(['members' => 'Household must have exactly one "Head".'])
                ->withInput();
        }
        
        DB::beginTransaction();
        
        try {
            $household = $this->createHousehold($request);
            $headResident = $this->processMembers($household, $request);
            
            if ($request->boolean('create_user_account') && $headResident) {
                $credentials = $this->createUserForHouseholdHead($household, $headResident, $request);
                if ($credentials) {
                    session()->flash('user_credentials', $credentials);
                }
            }
            
            DB::commit();
            
            return redirect()->route('households.index')
                ->with('success', 'Household created successfully.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Household creation failed: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Error creating household: ' . $e->getMessage())
                ->withInput();
        }
    }

    private function createHousehold(Request $request)
    {
        $householdNumber = $this->generateHouseholdNumber($request->household_number);
        
        return Household::create([
            'household_number' => $householdNumber,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'address' => $request->address,
            'purok_id' => $request->purok_id,
            'member_count' => $request->total_members,
            'income_range' => $request->income_range,
            'housing_type' => $request->housing_type,
            'ownership_status' => $request->ownership_status,
            'water_source' => $request->water_source,
            'electricity' => $request->boolean('electricity'),
            'internet' => $request->boolean('internet'),
            'vehicle' => $request->boolean('vehicle'),
            'remarks' => $request->remarks,
            'status' => 'active',
        ]);
    }

    private function processMembers(Household $household, Request $request)
    {
        $headResident = null;
        
        foreach ($request->members as $member) {
            $isHead = strtolower(trim($member['relationship'])) === 'head';
            
            if (isset($member['resident_id'])) {
                $resident = Resident::find($member['resident_id']);
                if ($resident) {
                    $this->createMember($household, $resident, $member, $isHead);
                    if ($isHead) $headResident = $resident;
                }
            } elseif (!empty($member['name'])) {
                $resident = $this->createNewResident($member, $request, $isHead);
                $this->createMember($household, $resident, $member, $isHead);
                if ($isHead) $headResident = $resident;
            }
        }
        
        return $headResident;
    }

    private function createMember(Household $household, Resident $resident, array $member, bool $isHead)
    {
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => $member['relationship'],
            'is_head' => $isHead,
        ]);
    }

    private function createNewResident(array $member, Request $request, bool $isHead)
    {
        $nameParts = explode(' ', $member['name'], 2);
        
        return Resident::create([
            'first_name' => $nameParts[0] ?? '',
            'last_name' => $nameParts[1] ?? '',
            'age' => $member['age'] ?? null,
            'contact_number' => $isHead ? $request->contact_number : null,
            'address' => $request->address,
            'purok_id' => $request->purok_id,
            'status' => 'active',
            'gender' => $this->determineGender($member['relationship']),
            'civil_status' => 'Single',
        ]);
    }

    private function determineGender(string $relationship): string
    {
        $femaleRelationships = ['spouse', 'wife', 'daughter', 'mother', 'sister', 'grandmother'];
        return in_array(strtolower($relationship), $femaleRelationships) ? 'female' : 'male';
    }
}