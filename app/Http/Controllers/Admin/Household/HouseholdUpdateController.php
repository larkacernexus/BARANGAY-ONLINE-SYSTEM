<?php

namespace App\Http\Controllers\Admin\Household;

use App\Models\Household;
use App\Models\Resident;
use App\Models\HouseholdMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdUpdateController extends BaseHouseholdController
{
    public function update(Request $request, Household $household)
    {
        Log::info('Updating household', ['household_id' => $household->id]);
        
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
            $currentHeadId = $household->householdMembers()->where('is_head', true)->first()?->resident_id;
            $newHeadData = $this->findNewHead($request->members);
            
            $this->updateHousehold($household, $request);
            $household->householdMembers()->delete();
            
            $newHeadId = $this->processMembers($household, $request, $newHeadData['resident']);
            
            if ($currentHeadId != $newHeadId && $newHeadData['resident']) {
                $this->handleHeadChange($household, $currentHeadId, $newHeadData['resident'], $request);
            }
            
            $household->update(['member_count' => $household->householdMembers()->count()]);
            
            DB::commit();
            
            return redirect()->route('households.show', $household)
                ->with('success', 'Household updated successfully!');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update failed: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Error updating household: ' . $e->getMessage())
                ->withInput();
        }
    }

    private function findNewHead(array $members)
    {
        foreach ($members as $member) {
            if (strtolower(trim($member['relationship'])) === 'head') {
                $resident = isset($member['resident_id']) 
                    ? Resident::find($member['resident_id']) 
                    : null;
                return ['resident' => $resident, 'id' => $resident?->id];
            }
        }
        return ['resident' => null, 'id' => null];
    }

    private function updateHousehold(Household $household, Request $request)
    {
        $household->update([
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
        ]);
    }

    private function processMembers(Household $household, Request $request, &$newHeadResident)
    {
        $addedIds = [];
        $newHeadId = null;
        
        foreach ($request->members as $member) {
            $isHead = strtolower(trim($member['relationship'])) === 'head';
            
            if (isset($member['resident_id']) && in_array($member['resident_id'], $addedIds)) {
                continue;
            }
            
            $resident = $this->getOrCreateResident($member, $request, $isHead);
            
            if ($resident) {
                HouseholdMember::create([
                    'household_id' => $household->id,
                    'resident_id' => $resident->id,
                    'relationship_to_head' => ucfirst(strtolower(trim($member['relationship']))),
                    'is_head' => $isHead,
                ]);
                
                $addedIds[] = $resident->id;
                
                if ($isHead) {
                    $newHeadResident = $resident;
                    $newHeadId = $resident->id;
                }
            }
        }
        
        return $newHeadId;
    }

    private function getOrCreateResident(array $member, Request $request, bool $isHead)
    {
        if (isset($member['resident_id'])) {
            return Resident::find($member['resident_id']);
        }
        
        if (!empty($member['name'])) {
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
        
        return null;
    }

    private function handleHeadChange(Household $household, $oldHeadId, $newHeadResident, Request $request)
    {
        if ($oldHeadId) {
            User::where('resident_id', $oldHeadId)
                ->where('household_id', $household->id)
                ->update(['status' => 'inactive', 'household_id' => null]);
        }
        
        $credentials = $this->createUserForHouseholdHead($household, $newHeadResident, $request);
        if ($credentials) {
            session()->flash('user_credentials', $credentials);
        }
    }

    private function determineGender(string $relationship): string
    {
        $femaleRelationships = ['spouse', 'wife', 'daughter', 'mother', 'sister', 'grandmother'];
        return in_array(strtolower($relationship), $femaleRelationships) ? 'female' : 'male';
    }
}