<?php

// app/Http/Controllers/Admin/CommitteeController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees
     */
    public function index(Request $request)
    {
        $query = Committee::query();
        
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
        
        // Sorting
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        $committees = $query->paginate($request->get('per_page', 15));
        
        return Inertia::render('admin/Committees/Index', [
            'committees' => $committees,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
            'stats' => [
                'total' => Committee::count(),
                'active' => Committee::where('is_active', true)->count(),
                'inactive' => Committee::where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Show form to create new committee
     */
    public function create()
    {
        return Inertia::render('admin/Committees/Create', [
            'nextOrder' => Committee::max('order') + 1,
        ]);
    }

    /**
     * Store new committee
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:committees,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);
        
        // Generate code from name if not provided
        if (empty($validated['code'])) {
            $validated['code'] = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $validated['name']));
        }
        
        $committee = Committee::create($validated);
        
        return redirect()->route('committees.index')
            ->with('success', 'Committee created successfully.');
    }

    /**
     * Show committee details
     */
    public function show(Committee $committee)
    {
        $committee->load(['primaryPositions' => function ($query) {
            $query->with('committee');
        }]);
        
        return Inertia::render('admin/Committees/Show', [
            'committee' => $committee,
        ]);
    }

    /**
     * Show form to edit committee
     */
    public function edit(Committee $committee)
    {
        return Inertia::render('admin/Committees/Edit', [
            'committee' => $committee,
        ]);
    }

    /**
     * Update committee
     */
    public function update(Request $request, Committee $committee)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:committees,code,' . $committee->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);
        
        $committee->update($validated);
        
        return redirect()->route('committees.show', $committee)
            ->with('success', 'Committee updated successfully.');
    }

    /**
     * Delete committee
     */
    public function destroy(Committee $committee)
    {
        // Check if committee is being used
        $positionsCount = $committee->primaryPositions()->count();
        
        if ($positionsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete committee. It is being used by ' . $positionsCount . ' position(s).');
        }
        
        $committee->delete();
        
        return redirect()->route('committees.index')
            ->with('success', 'Committee deleted successfully.');
    }

    /**
     * Get committees for dropdown (AJAX)
     */
    public function getForDropdown()
    {
        $committees = Committee::where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->map(function ($committee) {
                return $committee->toSelectOption();
            });
            
        return response()->json($committees);
    }
public function bulkActivate(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:committees,id',
    ]);

    Committee::whereIn('id', $request->ids)->update(['is_active' => true]);

    return redirect()->back()->with('success', 'Selected committees activated successfully.');
}

public function bulkDeactivate(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:committees,id',
    ]);

    Committee::whereIn('id', $request->ids)->update(['is_active' => false]);

    return redirect()->back()->with('success', 'Selected committees deactivated successfully.');
}

public function bulkDelete(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'exists:committees,id',
    ]);

    $committees = Committee::whereIn('id', $request->ids)->get();
    
    foreach ($committees as $committee) {
        // Check if committee is being used
        if ($committee->primaryPositions()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete committee "'.$committee->name.'". It is being used by position(s).');
        }
        $committee->delete();
    }

    return redirect()->back()->with('success', 'Selected committees deleted successfully.');
}

public function export(Request $request)
{
    $query = Committee::query();
    
    if ($request->has('search') && $request->search) {
        $query->where('name', 'like', "%{$request->search}%")
              ->orWhere('code', 'like', "%{$request->search}%");
    }
    
    if ($request->has('status') && $request->status !== 'all') {
        $query->where('is_active', $request->status === 'active');
    }
    
    $committees = $query->orderBy('order')->get();
    
    $csv = "ID,Code,Name,Description,Order,Status,Created\n";
    
    foreach ($committees as $committee) {
        $csv .= implode(',', [
            $committee->id,
            $committee->code,
            '"' . $committee->name . '"',
            '"' . ($committee->description ?? '') . '"',
            $committee->order,
            $committee->is_active ? 'Active' : 'Inactive',
            $committee->created_at->format('Y-m-d')
        ]) . "\n";
    }
    
    $filename = 'committees-export-' . date('Y-m-d') . '.csv';
    
    return response($csv)
        ->header('Content-Type', 'text/csv')
        ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
}
    
}