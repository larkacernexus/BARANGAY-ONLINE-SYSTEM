<?php


// app/Http/Controllers/Admin/PositionController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Models\Committee;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    /**
     * Display listing of positions
     */
    public function index(Request $request)
    {
        $query = Position::with(['committee', 'role']);
        
        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }
        
        // Filter by active status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        // Filter by requires account
        if ($request->has('requires_account') && $request->requires_account !== 'all') {
            $query->where('requires_account', $request->requires_account === 'yes');
        }
        
        // Sorting
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        $positions = $query->paginate($request->get('per_page', 15));
        
        return Inertia::render('admin/Positions/Index', [
            'positions' => $positions,
            'filters' => $request->only(['search', 'status', 'requires_account', 'sort_by', 'sort_order']),
            'stats' => [
                'total' => Position::count(),
                'active' => Position::where('is_active', true)->count(),
                'requires_account' => Position::where('requires_account', true)->count(),
                'kagawad_count' => Position::where('code', 'like', '%kagawad%')->count(),
            ],
        ]);
    }

    /**
     * Show form to create new position
     */
    public function create()
    {
        // Get active committees for dropdown
        $committees = Committee::where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->map(function ($committee) {
                return $committee->toSelectOption();
            });
        
        // Get roles for system accounts
        $roles = Role::where('is_system_role', true)
            ->orWhere('name', 'like', '%official%')
            ->orWhere('name', 'like', '%admin%')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('admin/Positions/Create', [
            'committees' => $committees,
            'roles' => $roles,
            'nextOrder' => Position::max('order') + 1,
        ]);
    }

    /**
     * Store new position
     */
   // In PositionController.php

public function store(Request $request)
{
    $validated = $request->validate([
        'code' => 'required|string|max:50|unique:positions,code',
        'name' => 'required|string|max:255',
        'committee_id' => 'nullable|exists:committees,id',
        'additional_committees' => 'nullable|array',
        'additional_committees.*' => 'exists:committees,id',
        'description' => 'nullable|string|max:1000',
        'order' => 'required|integer|min:0',
        'role_id' => 'nullable|exists:roles,id',
        'requires_account' => 'boolean',
        'is_active' => 'boolean',
    ]);
    
    // Generate code from name if not provided
    if (empty($validated['code'])) {
        $validated['code'] = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $validated['name']));
    }
    
    // Convert additional_committees to JSON
    // Let the model mutator handle this
    // if (isset($validated['additional_committees'])) {
    //     $validated['additional_committees'] = json_encode($validated['additional_committees']);
    // }
    
    $position = Position::create($validated);
    
    return redirect()->route('positions.index')
        ->with('success', 'Position created successfully.');
}


    /**
     * Show position details
     */
   public function show(Position $position)
{
    $position->load(['committee', 'role']);
    
    // Get officials count - use 'position' column, not 'position_code'
    $officialsCount = \App\Models\Official::where('position', $position->code)->count();
    
    // Get additional committees using the model method
    $additionalCommittees = $position->additionalCommittees();
    
    return Inertia::render('admin/Positions/Show', [
        'position' => [
            'id' => $position->id,
            'code' => $position->code,
            'name' => $position->name,
            'committee' => $position->committee,
            'additional_committees' => $position->additional_committees ?? [],
            'all_committees' => $additionalCommittees,
            'description' => $position->description,
            'order' => $position->order,
            'role' => $position->role,
            'requires_account' => $position->requires_account,
            'is_active' => $position->is_active,
            'created_at' => $position->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $position->updated_at->format('Y-m-d H:i:s'),
            'officials_count' => $officialsCount,
            'is_kagawad' => $position->isKagawad(),
        ],
    ]);
}
    /**
     * Show form to edit position
     */
    public function edit(Position $position)
    {
        $committees = Committee::where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->map(function ($committee) {
                return $committee->toSelectOption();
            });
        
        $roles = Role::where('is_system_role', true)
            ->orWhere('name', 'like', '%official%')
            ->orWhere('name', 'like', '%admin%')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('admin/Positions/Edit', [
            'position' => [
                'id' => $position->id,
                'code' => $position->code,
                'name' => $position->name,
                'committee_id' => $position->committee_id,
                'additional_committees' => $position->additional_committees ?? [],
                'description' => $position->description,
                'order' => $position->order,
                'role_id' => $position->role_id,
                'requires_account' => $position->requires_account,
                'is_active' => $position->is_active,
            ],
            'committees' => $committees,
            'roles' => $roles,
        ]);
    }

    /**
     * Update position
     */
  
public function update(Request $request, Position $position)
{
    $validated = $request->validate([
        'code' => 'required|string|max:50|unique:positions,code,' . $position->id,
        'name' => 'required|string|max:255',
        'committee_id' => 'nullable|exists:committees,id',
        'additional_committees' => 'nullable|array',
        'additional_committees.*' => 'exists:committees,id',
        'description' => 'nullable|string|max:1000',
        'order' => 'required|integer|min:0',
        'role_id' => 'nullable|exists:roles,id',
        'requires_account' => 'boolean',
        'is_active' => 'boolean',
    ]);
    
    // Let the model mutator handle the JSON encoding
    // if (isset($validated['additional_committees'])) {
    //     $validated['additional_committees'] = json_encode($validated['additional_committees']);
    // }
    
    $position->update($validated);
    
    return redirect()->route('positions.show', $position)
        ->with('success', 'Position updated successfully.');
}
    /**
     * Delete position
     */
    public function destroy(Position $position)
    {
        // Check if position is being used by officials
        $officialsCount = \App\Models\Official::where('position', $position->code)->count();
        
        if ($officialsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete position. It is being used by ' . $officialsCount . ' official(s).');
        }
        
        $position->delete();
        
        return redirect()->route('positions.index')
            ->with('success', 'Position deleted successfully.');
    }

    /**
     * Get positions for dropdown (used in Official creation)
     */
    public function getForDropdown()
    {
        $positions = Position::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($position) {
                return $position->toSelectOption();
            });
            
        return response()->json($positions);
    }

    public function bulkActivate(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:positions,id',
    ]);

    Position::whereIn('id', $request->ids)->update(['is_active' => true]);

    return redirect()->back()->with('success', 'Selected positions activated successfully.');
}

public function bulkDeactivate(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:positions,id',
    ]);

    Position::whereIn('id', $request->ids)->update(['is_active' => false]);

    return redirect()->back()->with('success', 'Selected positions deactivated successfully.');
}

public function bulkDelete(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:positions,id',
    ]);

    $positions = Position::whereIn('id', $request->ids)->get();
    
    foreach ($positions as $position) {
        // Check if position is being used
        $officialsCount = \App\Models\Official::where('position', $position->code)->count();
        
        if ($officialsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete position "'.$position->name.'". It is being used by ' . $officialsCount . ' official(s).');
        }
        $position->delete();
    }

    return redirect()->back()->with('success', 'Selected positions deleted successfully.');
}

public function export(Request $request)
{
    $query = Position::with(['committee', 'role']);
    
    if ($request->has('search') && $request->search) {
        $query->where('name', 'like', "%{$request->search}%")
              ->orWhere('code', 'like', "%{$request->search}%");
    }
    
    if ($request->has('status') && $request->status !== 'all') {
        $query->where('is_active', $request->status === 'active');
    }
    
    if ($request->has('requires_account') && $request->requires_account !== 'all') {
        $query->where('requires_account', $request->requires_account === 'yes');
    }
    
    $positions = $query->orderBy('order')->get();
    
    $csv = "ID,Code,Name,Committee,Role,Requires Account,Order,Status,Officials Count,Created\n";
    
    foreach ($positions as $position) {
        $csv .= implode(',', [
            $position->id,
            $position->code,
            '"' . $position->name . '"',
            $position->committee?->name ?? 'None',
            $position->role?->name ?? 'None',
            $position->requires_account ? 'Yes' : 'No',
            $position->order,
            $position->is_active ? 'Active' : 'Inactive',
            $position->officials_count ?? 0,
            $position->created_at->format('Y-m-d')
        ]) . "\n";
    }
    
    $filename = 'positions-export-' . date('Y-m-d') . '.csv';
    
    return response($csv)
        ->header('Content-Type', 'text/csv')
        ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
}
}