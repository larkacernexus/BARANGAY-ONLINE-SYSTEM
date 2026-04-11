<?php

// app/Http/Controllers/Admin/CommitteeController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees
     */
    public function index(Request $request)
    {
        $query = Committee::query()
            ->withCount('primaryPositions'); // Add position count
        
        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Filter by active status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        // Sorting - Handle special cases for computed fields
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Handle sorting by position_count (primaryPositions count)
        if ($sortBy === 'position_count') {
            $query->orderBy('primary_positions_count', $sortOrder);
        }
        // Handle sorting by status (is_active)
        elseif ($sortBy === 'status') {
            $query->orderBy('is_active', $sortOrder);
        }
        // Handle sorting by name
        elseif ($sortBy === 'name') {
            $query->orderBy('name', $sortOrder);
        }
        // Handle sorting by code
        elseif ($sortBy === 'code') {
            $query->orderBy('code', $sortOrder);
        }
        // Handle sorting by description
        elseif ($sortBy === 'description') {
            $query->orderBy('description', $sortOrder);
        }
        // Handle sorting by order
        elseif ($sortBy === 'order') {
            $query->orderBy('order', $sortOrder);
        }
        // Handle sorting by created_at
        elseif ($sortBy === 'created_at') {
            $query->orderBy('created_at', $sortOrder);
        }
        // Default sort by order
        else {
            $query->orderBy('order', $sortOrder);
        }
        
        $committees = $query->paginate($request->get('per_page', 15));
        
        // Transform committees to include positions_count in the data
        $committees->getCollection()->transform(function ($committee) {
            $committee->positions_count = $committee->primary_positions_count ?? 0;
            return $committee;
        });
        
        return Inertia::render('admin/Committees/Index', [
            'committees' => $committees,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
            'stats' => [
                'total' => Committee::count(),
                'active' => Committee::where('is_active', true)->count(),
                'inactive' => Committee::where('is_active', false)->count(),
                'with_positions' => Committee::has('primaryPositions')->count(),
                'without_positions' => Committee::doesntHave('primaryPositions')->count(),
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
            $query->with('committee')
                  ->orderBy('order');
        }]);
        
        $committee->loadCount('primaryPositions');
        
        return Inertia::render('admin/Committees/Show', [
            'committee' => [
                'id' => $committee->id,
                'code' => $committee->code,
                'name' => $committee->name,
                'description' => $committee->description,
                'order' => $committee->order,
                'is_active' => $committee->is_active,
                'created_at' => $committee->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $committee->updated_at?->format('Y-m-d H:i:s'),
                'primary_positions' => $committee->primaryPositions,
                'positions_count' => $committee->primary_positions_count,
            ],
        ]);
    }

    /**
     * Show form to edit committee
     */
    public function edit(Committee $committee)
    {
        return Inertia::render('admin/Committees/Edit', [
            'committee' => [
                'id' => $committee->id,
                'code' => $committee->code,
                'name' => $committee->name,
                'description' => $committee->description,
                'order' => $committee->order,
                'is_active' => $committee->is_active,
            ],
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
     * Toggle committee status
     */
    public function toggleStatus(Committee $committee)
    {
        $committee->update(['is_active' => !$committee->is_active]);
        
        return redirect()->back()
            ->with('success', 'Committee status updated successfully.');
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

    /**
     * Bulk activate committees
     */
    public function bulkActivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:committees,id',
        ]);

        Committee::whereIn('id', $request->ids)->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Selected committees activated successfully.');
    }

    /**
     * Bulk deactivate committees
     */
    public function bulkDeactivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:committees,id',
        ]);

        Committee::whereIn('id', $request->ids)->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Selected committees deactivated successfully.');
    }

    /**
     * Bulk delete committees
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:committees,id',
        ]);

        $committees = Committee::whereIn('id', $request->ids)->get();
        $deletedCount = 0;
        $failedCommittees = [];
        
        foreach ($committees as $committee) {
            // Check if committee is being used
            $positionsCount = $committee->primaryPositions()->count();
            
            if ($positionsCount > 0) {
                $failedCommittees[] = $committee->name . " ({$positionsCount} positions)";
            } else {
                $committee->delete();
                $deletedCount++;
            }
        }

        if ($deletedCount > 0 && count($failedCommittees) > 0) {
            return redirect()->back()->with('warning', "Deleted {$deletedCount} committees. Failed to delete: " . implode(', ', $failedCommittees));
        } elseif ($deletedCount > 0) {
            return redirect()->back()->with('success', "Successfully deleted {$deletedCount} committees.");
        } else {
            return redirect()->back()->with('error', "Cannot delete committees: " . implode(', ', $failedCommittees));
        }
    }

    /**
     * Bulk action handler
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:activate,deactivate,delete',
            'committee_ids' => 'required|array',
            'committee_ids.*' => 'exists:committees,id',
        ]);

        switch ($request->action) {
            case 'activate':
                Committee::whereIn('id', $request->committee_ids)->update(['is_active' => true]);
                return redirect()->back()->with('success', 'Selected committees activated successfully.');
                
            case 'deactivate':
                Committee::whereIn('id', $request->committee_ids)->update(['is_active' => false]);
                return redirect()->back()->with('success', 'Selected committees deactivated successfully.');
                
            case 'delete':
                $committees = Committee::whereIn('id', $request->committee_ids)->get();
                $deletedCount = 0;
                $failedCommittees = [];
                
                foreach ($committees as $committee) {
                    $positionsCount = $committee->primaryPositions()->count();
                    
                    if ($positionsCount > 0) {
                        $failedCommittees[] = $committee->name . " ({$positionsCount} positions)";
                    } else {
                        $committee->delete();
                        $deletedCount++;
                    }
                }
                
                if ($deletedCount > 0 && count($failedCommittees) > 0) {
                    return redirect()->back()->with('warning', "Deleted {$deletedCount} committees. Failed to delete: " . implode(', ', $failedCommittees));
                } elseif ($deletedCount > 0) {
                    return redirect()->back()->with('success', "Successfully deleted {$deletedCount} committees.");
                } else {
                    return redirect()->back()->with('error', "Cannot delete committees: " . implode(', ', $failedCommittees));
                }
                
            default:
                return redirect()->back()->with('error', 'Invalid action.');
        }
    }

    /**
     * Export committees to CSV
     */
    public function export(Request $request)
    {
        $query = Committee::query()->withCount('primaryPositions');
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if ($sortBy === 'position_count') {
            $query->orderBy('primary_positions_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }
        
        $committees = $query->get();
        
        $csv = "ID,Code,Name,Description,Order,Status,Positions Count,Created\n";
        
        foreach ($committees as $committee) {
            $csv .= implode(',', [
                $committee->id,
                $committee->code,
                '"' . $committee->name . '"',
                '"' . str_replace('"', '""', $committee->description ?? '') . '"',
                $committee->order,
                $committee->is_active ? 'Active' : 'Inactive',
                $committee->primary_positions_count ?? 0,
                $committee->created_at->format('Y-m-d')
            ]) . "\n";
        }
        
        $filename = 'committees-export-' . date('Y-m-d') . '.csv';
        
        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}