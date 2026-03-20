<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\Resident;
use App\Models\HouseholdMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdMemberController extends BaseHouseholdController
{
    public function addMember(Request $request, Household $household)
    {
        $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'relationship' => 'required|string|max:50',
        ]);
        
        Log::info('Adding member to household', [
            'household_id' => $household->id,
            'resident_id' => $request->resident_id,
        ]);
        
        $resident = Resident::find($request->resident_id);
        
        if ($this->belongsToOtherHousehold($resident, $household)) {
            return redirect()->back()
                ->with('error', 'Resident already belongs to another household.');
        }
        
        $isHead = strtolower(trim($request->relationship)) === 'head';
        
        DB::transaction(function () use ($household, $resident, $request, $isHead) {
            if ($isHead) {
                $this->handleNewHead($household, $resident);
            }
            
            HouseholdMember::create([
                'household_id' => $household->id,
                'resident_id' => $resident->id,
                'relationship_to_head' => $request->relationship,
                'is_head' => $isHead,
            ]);
            
            $household->increment('member_count');
        });
        
        return redirect()->back()
            ->with('success', 'Member added successfully!');
    }
    
    public function removeMember(Household $household, $memberId)
    {
        Log::info('Removing member from household', [
            'household_id' => $household->id,
            'member_id' => $memberId,
        ]);
        
        $member = HouseholdMember::find($memberId);
        
        if (!$member || $member->household_id != $household->id) {
            return redirect()->back()
                ->with('error', 'Member not found in this household.');
        }
        
        DB::transaction(function () use ($household, $member) {
            if ($member->is_head) {
                $this->handleHeadRemoval($household, $member);
            }
            
            $member->delete();
            $household->decrement('member_count');
        });
        
        return redirect()->back()
            ->with('success', 'Member removed successfully!');
    }

    private function belongsToOtherHousehold($resident, $household)
    {
        $existing = $resident->householdMemberships()->first();
        return $existing && $existing->household_id != $household->id;
    }

    private function handleNewHead(Household $household, Resident $newHead)
    {
        $oldHead = $household->householdMembers()->where('is_head', true)->first();
        
        if ($oldHead) {
            $oldHead->update(['is_head' => false]);
            
            User::where('resident_id', $oldHead->resident_id)
                ->where('household_id', $household->id)
                ->update(['status' => 'inactive', 'household_id' => null]);
        }
    }

    private function handleHeadRemoval(Household $household, HouseholdMember $oldHead)
    {
        $newHead = $this->findNewHeadCandidate($household, $oldHead->id);
        
        if ($newHead) {
            $newHead->update(['is_head' => true]);
            $resident = Resident::find($newHead->resident_id);
            
            if ($resident) {
                $this->createUserForHouseholdHead($household, $resident, new Request([
                    'contact_number' => $household->contact_number,
                    'email' => $household->email,
                ]));
            }
        } else {
            User::where('resident_id', $oldHead->resident_id)
                ->where('household_id', $household->id)
                ->update(['status' => 'inactive', 'household_id' => null]);
        }
    }

    private function findNewHeadCandidate(Household $household, $excludeId)
    {
        $spouse = $household->householdMembers()
            ->where('relationship_to_head', 'Spouse')
            ->where('id', '!=', $excludeId)
            ->first();
        
        if ($spouse) return $spouse;
        
        return $household->householdMembers()
            ->with('resident')
            ->where('id', '!=', $excludeId)
            ->orderByRaw('(SELECT age FROM residents WHERE id = household_members.resident_id) DESC')
            ->first();
    }
}