<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Resident;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdUpdateController extends Controller
{
    public function update(Request $request, Household $household)
    {
        Log::info('Updating household', ['household_id' => $household->id]);
        
        // Log incoming members data for debugging
        Log::info('Incoming members data', [
            'members_count' => count($request->members ?? []),
            'members' => collect($request->members ?? [])->map(function($member) {
                return [
                    'name' => $member['name'] ?? null,
                    'relationship' => $member['relationship'] ?? null,
                    'resident_id' => $member['resident_id'] ?? null,
                ];
            })->toArray()
        ]);
        
        $validator = Validator::make($request->all(), [
            'household_number' => 'required|string|max:50|unique:households,household_number,' . $household->id,
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok_id' => 'required|exists:puroks,id',
            'total_members' => 'required|integer|min:1',
            'members' => 'required|array|min:1',
            'members.*.name' => 'required|string|max:200',
            'members.*.relationship' => 'required|string|max:50',
            'members.*.resident_id' => 'nullable|exists:residents,id',
            'google_maps_url' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);
        
        if ($validator->fails()) {
            Log::warning('Validation failed', ['errors' => $validator->errors()->toArray()]);
            return redirect()->back()->withErrors($validator)->withInput();
        }
        
        // Log head count check
        $headCount = collect($request->members)
            ->filter(fn($m) => strtolower(trim($m['relationship'])) === 'head')
            ->count();
        
        Log::info('Head count check', [
            'head_count' => $headCount,
            'relationships' => collect($request->members)->map(fn($m) => $m['relationship'])->toArray()
        ]);
        
        if ($headCount !== 1) {
            Log::warning('Invalid head count', ['head_count' => $headCount]);
            return redirect()->back()
                ->withErrors(['members' => 'Household must have exactly one "Head". Found ' . $headCount . ' head(s).'])
                ->withInput();
        }
        
        DB::beginTransaction();
        
        try {
            $this->updateHousehold($household, $request);
            Log::info('Household updated', ['household_id' => $household->id]);
            
            // Clear existing members and re-add
            $deletedCount = $household->householdMembers()->delete();
            Log::info('Deleted existing members', ['deleted_count' => $deletedCount]);
            
            $this->processMembers($household, $request);
            
            $newMemberCount = $household->householdMembers()->count();
            $household->update(['member_count' => $newMemberCount]);
            
            Log::info('Members processed', ['new_member_count' => $newMemberCount]);
            
            DB::commit();
            
            return redirect()->route('admin.households.show', $household)
                ->with('success', 'Household updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'household_id' => $household->id
            ]);
            
            return redirect()->back()
                ->with('error', 'Error updating household: ' . $e->getMessage())
                ->withInput();
        }
    }

    private function updateHousehold(Household $household, Request $request)
    {
        $updateData = [
            'household_number' => $request->household_number,
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
            'google_maps_url' => $request->google_maps_url,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ];
        
        Log::info('Updating household with data', [
            'household_id' => $household->id,
            'google_maps_url' => $request->google_maps_url,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);
        
        $household->update($updateData);
    }

    private function processMembers(Household $household, Request $request)
    {
        $processedCount = 0;
        
        foreach ($request->members as $index => $member) {
            $isHead = strtolower(trim($member['relationship'])) === 'head';
            
            Log::info('Processing member', [
                'index' => $index,
                'name' => $member['name'] ?? null,
                'relationship' => $member['relationship'] ?? null,
                'is_head' => $isHead,
                'resident_id' => $member['resident_id'] ?? null,
            ]);
            
            if (isset($member['resident_id'])) {
                $resident = Resident::find($member['resident_id']);
                if ($resident) {
                    $this->createMember($household, $resident, $member, $isHead);
                    $processedCount++;
                    Log::info('Added existing resident', ['resident_id' => $resident->id, 'name' => $resident->full_name]);
                } else {
                    Log::warning('Resident not found', ['resident_id' => $member['resident_id']]);
                }
            } elseif (!empty($member['name'])) {
                $resident = $this->createNewResident($member, $request, $isHead);
                $this->createMember($household, $resident, $member, $isHead);
                $processedCount++;
                Log::info('Created new resident', ['resident_id' => $resident->id, 'name' => $resident->full_name]);
            }
        }
        
        Log::info('Total members processed', ['count' => $processedCount]);
    }

    private function createMember(Household $household, Resident $resident, array $member, bool $isHead)
    {
        $relationship = ucfirst(strtolower(trim($member['relationship'])));
        
        Log::info('Creating household member', [
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => $relationship,
            'is_head' => $isHead,
        ]);
        
        HouseholdMember::create([
            'household_id' => $household->id,
            'resident_id' => $resident->id,
            'relationship_to_head' => $relationship,
            'is_head' => $isHead,
        ]);
        
        $resident->update([
            'household_id' => $household->id,
            'purok_id' => $household->purok_id,
        ]);
        
        Log::info('Resident updated', [
            'resident_id' => $resident->id,
            'household_id' => $household->id,
            'purok_id' => $household->purok_id,
        ]);
    }

    private function createNewResident(array $member, Request $request, bool $isHead)
    {
        $nameParts = explode(' ', $member['name'], 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';
        
        Log::info('Creating new resident', [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'age' => $member['age'] ?? null,
            'is_head' => $isHead,
        ]);
        
        $resident = Resident::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'age' => $member['age'] ?? null,
            'contact_number' => $isHead ? $request->contact_number : null,
            'address' => $request->address,
            'purok_id' => $request->purok_id,
            'status' => 'active',
            'gender' => $this->determineGender($member['relationship']),
            'civil_status' => 'Single',
        ]);
        
        Log::info('New resident created', ['resident_id' => $resident->id]);
        
        return $resident;
    }

    private function determineGender(string $relationship): string
    {
        $femaleRelationships = ['spouse', 'wife', 'daughter', 'mother', 'sister', 'grandmother'];
        $isFemale = in_array(strtolower($relationship), $femaleRelationships);
        
        Log::info('Determining gender', [
            'relationship' => $relationship,
            'gender' => $isFemale ? 'female' : 'male'
        ]);
        
        return $isFemale ? 'female' : 'male';
    }
}