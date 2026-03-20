<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\User;
use Illuminate\Http\Request;

class HouseholdIndexController extends Controller
{
    public function index(Request $request)
    {
        $allHouseholds = $this->getAllHouseholds();
        $households = $this->getPaginatedHouseholds($request);
        $stats = $this->calculateStats();
        $puroks = Purok::active()->orderBy('name')->get()->toArray();
        
        return Inertia::render('admin/Households/Index', [
            'households' => $households,
            'allHouseholds' => $allHouseholds,
            'stats' => $stats,
            'puroks' => $puroks,
            'filters' => $request->only(['search', 'status', 'purok_id']),
        ]);
    }

    private function getAllHouseholds()
    {
        return Household::withCount('householdMembers')
            ->latest()
            ->get()
            ->map(function ($household) {
                $headMember = $household->householdMembers()->where('is_head', true)->first();
                $headName = $headMember ? $headMember->resident->full_name : 'No Head Assigned';
                
                $hasUserAccount = false;
                if ($headMember && $headMember->resident) {
                    $hasUserAccount = User::where('resident_id', $headMember->resident->id)
                        ->where('household_id', $household->id)
                        ->exists();
                }
                
                return [
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'head_of_family' => $headName,
                    'member_count' => $household->household_members_count,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'purok' => $household->purok,
                    'created_at' => $household->created_at->toISOString(),
                    'status' => $household->status,
                    'has_user_account' => $hasUserAccount,
                ];
            })
            ->toArray();
    }

    private function getPaginatedHouseholds(Request $request)
    {
        $query = Household::withCount('householdMembers')->latest();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhereHas('householdMembers', function ($q) use ($search) {
                      $q->where('is_head', true)
                        ->whereHas('resident', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%");
                        });
                  })
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->has('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->purok_id);
        }
        
        return $query->paginate(15)->withQueryString();
    }

    private function calculateStats()
    {
        $totalHouseholds = Household::count();
        $totalMembers = Resident::count();
        $averageMembers = $totalHouseholds > 0 ? $totalMembers / $totalHouseholds : 0;
        
        $householdsWithAccounts = 0;
        foreach (Household::with('householdMembers')->get() as $household) {
            $headMember = $household->householdMembers()->where('is_head', true)->first();
            if ($headMember && $headMember->resident) {
                if (User::where('resident_id', $headMember->resident->id)
                    ->where('household_id', $household->id)
                    ->exists()) {
                    $householdsWithAccounts++;
                }
            }
        }
        
        return [
            ['label' => 'Total Households', 'value' => $totalHouseholds],
            ['label' => 'Active Households', 'value' => Household::where('status', 'active')->count()],
            ['label' => 'Total Members', 'value' => $totalMembers],
            ['label' => 'Average Members', 'value' => number_format($averageMembers, 1)],
            ['label' => 'With User Accounts', 'value' => $householdsWithAccounts],
        ];
    }
}