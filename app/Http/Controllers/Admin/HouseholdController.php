<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HouseholdController extends Controller
{
    /**
     * Display a listing of households.
     */
    public function index(Request $request)
    {
        $query = Household::query()
            ->withCount('members')
            ->latest();
        
        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('household_number', 'like', "%{$search}%")
                  ->orWhere('head_of_family', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        
        $households = $query->paginate(20)->withQueryString();
        
        $stats = [
            ['label' => 'Total Households', 'value' => Household::count()],
            ['label' => 'Active Households', 'value' => Household::where('status', 'active')->count()],
            ['label' => 'Total Members', 'value' => Resident::count()],
            ['label' => 'Average Members', 'value' => number_format(Household::avg('member_count') ?? 0, 1)],
        ];
        
        return Inertia::render('Households/Index', [
            'households' => $households,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }
    
    /**
     * Show the form for creating a new household.
     */
    public function create()
    {
        $heads = Resident::whereNull('household_id')
            ->orWhere('household_id', '')
            ->select(['id', 'first_name', 'last_name', 'middle_name'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                ];
            });
        
        $puroks = [
            'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4',
            'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8'
        ];
        
        return Inertia::render('Households/Create', [
            'heads' => $heads,
            'puroks' => $puroks,
        ]);
    }
    
    /**
     * Store a newly created household in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'household_number' => 'nullable|string|max:50|unique:households',
            'head_of_family' => 'required|string|max:200',
            'head_resident_id' => 'nullable|exists:residents,id',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok' => 'required|string',
            'total_members' => 'nullable|integer|min:1',
            'income_range' => 'nullable|string|max:50',
            'housing_type' => 'nullable|string|max:100',
            'ownership_status' => 'nullable|string|max:50',
            'water_source' => 'nullable|string|max:100',
            'electricity' => 'boolean',
            'remarks' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Generate household number if not provided
        $householdNumber = $request->household_number;
        if (!$householdNumber) {
            $lastHousehold = Household::orderBy('id', 'desc')->first();
            $lastNumber = $lastHousehold ? (int) str_replace('HH-', '', $lastHousehold->household_number) : 0;
            $householdNumber = 'HH-' . str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        }
        
        $household = Household::create([
            'household_number' => $householdNumber,
            'head_of_family' => $request->head_of_family,
            'head_resident_id' => $request->head_resident_id,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'address' => $request->address,
            'purok' => $request->purok,
            'member_count' => $request->total_members ?? 1,
            'income_range' => $request->income_range,
            'housing_type' => $request->housing_type,
            'ownership_status' => $request->ownership_status,
            'water_source' => $request->water_source,
            'electricity' => $request->boolean('electricity'),
            'remarks' => $request->remarks,
            'status' => 'active',
        ]);
        
        // Update head resident's household if head_resident_id is provided
        if ($request->head_resident_id) {
            Resident::where('id', $request->head_resident_id)
                ->update(['household_id' => $household->id]);
        }
        
        return redirect()->route('households.show', $household)
            ->with('success', 'Household registered successfully!');
    }
    
    /**
     * Display the specified household.
     */
    public function show(Household $household)
    {
        $household->load(['members', 'headResident']);
        
        return Inertia::render('Households/Show', [
            'household' => $household,
        ]);
    }
    
    /**
     * Show the form for editing the specified household.
     */
    public function edit(Household $household)
    {
        $heads = Resident::whereNull('household_id')
            ->orWhere('household_id', '')
            ->orWhere('id', $household->head_resident_id)
            ->select(['id', 'first_name', 'last_name', 'middle_name'])
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                ];
            });
        
        $puroks = [
            'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4',
            'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8'
        ];
        
        return Inertia::render('Households/Edit', [
            'household' => $household,
            'heads' => $heads,
            'puroks' => $puroks,
        ]);
    }
    
    /**
     * Update the specified household in storage.
     */
    public function update(Request $request, Household $household)
    {
        $validator = Validator::make($request->all(), [
            'household_number' => 'required|string|max:50|unique:households,household_number,' . $household->id,
            'head_of_family' => 'required|string|max:200',
            'head_resident_id' => 'nullable|exists:residents,id',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'required|string',
            'purok' => 'required|string',
            'member_count' => 'required|integer|min:1',
            'income_range' => 'nullable|string|max:50',
            'housing_type' => 'nullable|string|max:100',
            'ownership_status' => 'nullable|string|max:50',
            'water_source' => 'nullable|string|max:100',
            'electricity' => 'boolean',
            'remarks' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        // Handle head resident change
        $oldHeadId = $household->head_resident_id;
        if ($request->head_resident_id != $oldHeadId) {
            // Remove old head from household
            if ($oldHeadId) {
                Resident::where('id', $oldHeadId)
                    ->update(['household_id' => null]);
            }
            
            // Set new head to household
            if ($request->head_resident_id) {
                Resident::where('id', $request->head_resident_id)
                    ->update(['household_id' => $household->id]);
            }
        }
        
        $household->update($request->all());
        
        return redirect()->route('households.show', $household)
            ->with('success', 'Household updated successfully!');
    }
    
    /**
     * Remove the specified household from storage.
     */
    public function destroy(Household $household)
    {
        // Remove all residents from this household
        Resident::where('household_id', $household->id)
            ->update(['household_id' => null]);
        
        $household->delete();
        
        return redirect()->route('households.index')
            ->with('success', 'Household deleted successfully!');
    }
    
    /**
     * Add member to household
     */
    public function addMember(Request $request, Household $household)
    {
        $request->validate([
            'resident_id' => 'required|exists:residents,id',
        ]);
        
        $resident = Resident::find($request->resident_id);
        
        // Check if resident already belongs to another household
        if ($resident->household_id && $resident->household_id != $household->id) {
            return redirect()->back()
                ->with('error', 'Resident already belongs to another household.');
        }
        
        $resident->update(['household_id' => $household->id]);
        $household->increment('member_count');
        
        return redirect()->back()
            ->with('success', 'Member added to household successfully!');
    }
    
    /**
     * Remove member from household
     */
    public function removeMember(Household $household, Resident $resident)
    {
        if ($resident->household_id != $household->id) {
            return redirect()->back()
                ->with('error', 'Resident does not belong to this household.');
        }
        
        $resident->update(['household_id' => null]);
        $household->decrement('member_count');
        
        return redirect()->back()
            ->with('success', 'Member removed from household successfully!');
    }
}