<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Models\Committee;
use App\Models\Official;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PositionController extends Controller
{
    /**
     * Display listing of positions
     */
    public function index(Request $request)
    {
        $query = Position::with(['committee', 'role'])
            ->withCount('officials');
        
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
        
        // Filter by requires account
        if ($request->filled('requires_account') && $request->requires_account !== 'all') {
            $query->where('requires_account', $request->requires_account === 'required');
        }
        
        // Sorting - support all frontend sort options
        $sortBy = $request->get('sort_by', 'order');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Handle special sort columns
        switch ($sortBy) {
            case 'member_count':
                $query->orderBy('officials_count', $sortOrder);
                break;
            case 'committee':
                $query->leftJoin('committees', 'positions.committee_id', '=', 'committees.id')
                    ->orderBy('committees.name', $sortOrder)
                    ->select('positions.*');
                break;
            case 'status':
                $query->orderBy('is_active', $sortOrder);
                break;
            case 'requires_account':
                $query->orderBy('requires_account', $sortOrder);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
                break;
        }
        
        $positions = $query->paginate(15);
        
        // Get comprehensive stats
        $stats = [
            'total' => Position::count(),
            'active' => Position::where('is_active', true)->count(),
            'inactive' => Position::where('is_active', false)->count(),
            'requires_account' => Position::where('requires_account', true)->count(),
            'kagawad_count' => Position::where('code', 'like', 'KAG%')->orWhere('name', 'like', '%Kagawad%')->count(),
            'assigned' => Position::has('officials')->count(),
            'unassigned' => Position::doesntHave('officials')->count(),
        ];
        
        return Inertia::render('admin/Positions/Index', [
            'positions' => $positions,
            'filters' => $request->only(['search', 'status', 'requires_account', 'sort_by', 'sort_order']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show form to create new position
     */
    public function create()
    {
        // Get committees for dropdown
        $committees = Committee::orderBy('name')->get(['id', 'name']);
        
        // Get roles for dropdown
        $roles = Role::orderBy('name')->get(['id', 'name']);
        
        // Get existing positions for order suggestion
        $maxOrder = Position::max('order') ?? 0;
        
        // Get common position templates
        $templates = [
            [
                'name' => 'Punong Barangay',
                'code' => 'PUNONG_BARANGAY',
                'description' => 'Chief executive of the barangay',
                'order' => 1,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Barangay Kagawad',
                'code' => 'KAGAWAD',
                'description' => 'Barangay council member',
                'order' => 2,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Barangay Secretary',
                'code' => 'SECRETARY',
                'description' => 'Records keeper and administrative officer',
                'order' => 3,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Barangay Treasurer',
                'code' => 'TREASURER',
                'description' => 'Financial officer of the barangay',
                'order' => 4,
                'requires_account' => true,
                'is_active' => true,
            ],
            [
                'name' => 'SK Chairperson',
                'code' => 'SK_CHAIRPERSON',
                'description' => 'Sangguniang Kabataan chairperson',
                'order' => 5,
                'requires_account' => true,
                'is_active' => true,
            ],
        ];
        
        return Inertia::render('admin/Positions/Create', [
            'committees' => $committees,
            'roles' => $roles,
            'maxOrder' => $maxOrder,
            'templates' => $templates,
        ]);
    }

    /**
     * Show position details with complete data
     */
    public function show(Position $position)
    {
        $position->load(['committee', 'role'])
            ->loadCount('officials');
        
        $officialsCount = Official::where('position_id', $position->id)->count();
        
        // Get additional committees if the field exists
        $additionalCommittees = [];
        if ($position->additional_committees) {
            // Handle both string and array cases
            if (is_string($position->additional_committees)) {
                $decoded = json_decode($position->additional_committees, true);
                if (is_array($decoded)) {
                    $additionalCommittees = Committee::whereIn('id', $decoded)->get();
                }
            } elseif (is_array($position->additional_committees)) {
                // Already an array from model casting
                $additionalCommittees = Committee::whereIn('id', $position->additional_committees)->get();
            }
        }
        
        return Inertia::render('admin/Positions/Show', [
            'position' => [
                'id' => $position->id,
                'code' => $position->code,
                'name' => $position->name,
                'description' => $position->description,
                'order' => $position->order,
                'is_active' => $position->is_active,
                'requires_account' => $position->requires_account,
                'created_at' => $position->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $position->updated_at?->format('Y-m-d H:i:s'),
                'officials_count' => $officialsCount,
                'committee' => $position->committee ? [
                    'id' => $position->committee->id,
                    'name' => $position->committee->name,
                ] : null,
                'role' => $position->role ? [
                    'id' => $position->role->id,
                    'name' => $position->role->name,
                ] : null,
                'additional_committees' => $additionalCommittees,
            ],
        ]);
    }

    /**
     * Store new position
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:positions,code',
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
            $validated['code'] = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $validated['name']));
        }
        
        // Handle additional committees JSON
        if (isset($validated['additional_committees'])) {
            $validated['additional_committees'] = json_encode($validated['additional_committees']);
        }
        
        $position = Position::create($validated);
        
        return redirect()->route('positions.index')
            ->with('success', 'Position created successfully.');
    }

    /**
     * Show form to edit position
     */
    public function edit(Position $position)
    {
        // Load relationships
        $position->load(['committee', 'role']);
        
        // Get committees for dropdown
        $committees = Committee::orderBy('name')->get(['id', 'name']);
        
        // Get roles for dropdown
        $roles = Role::orderBy('name')->get(['id', 'name']);
        
        // Get existing positions for order reference
        $maxOrder = Position::max('order') ?? 0;
        
        // Handle additional committees - check if it's already an array or needs decoding
        $additionalCommittees = [];
        if ($position->additional_committees) {
            if (is_array($position->additional_committees)) {
                $additionalCommittees = $position->additional_committees;
            } else {
                $additionalCommittees = json_decode($position->additional_committees, true) ?? [];
            }
        }
        
        $officialsCount = Official::where('position_id', $position->id)->count();
        
        // Get officials assigned to this position (for reference)
        $assignedOfficials = Official::where('position_id', $position->id)
            ->with(['user', 'resident'])
            ->get()
            ->map(function ($official) {
                return [
                    'id' => $official->id,
                    'full_name' => $official->resident?->full_name ?? 'N/A',
                    'term_start' => $official->term_start?->format('Y-m-d'),
                    'term_end' => $official->term_end?->format('Y-m-d'),
                    'status' => $official->status,
                ];
            });
        
        return Inertia::render('admin/Positions/Edit', [
            'position' => [
                'id' => $position->id,
                'code' => $position->code,
                'name' => $position->name,
                'description' => $position->description,
                'committee_id' => $position->committee_id,
                'committee' => $position->committee ? [
                    'id' => $position->committee->id,
                    'name' => $position->committee->name,
                ] : null,
                'additional_committees' => $additionalCommittees,
                'order' => $position->order,
                'role_id' => $position->role_id,
                'role' => $position->role ? [
                    'id' => $position->role->id,
                    'name' => $position->role->name,
                ] : null,
                'requires_account' => $position->requires_account,
                'is_active' => $position->is_active,
                'created_at' => $position->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $position->updated_at?->format('Y-m-d H:i:s'),
            ],
            'committees' => $committees,
            'roles' => $roles,
            'maxOrder' => $maxOrder,
            'officialsCount' => $officialsCount,
            'assignedOfficials' => $assignedOfficials,
            'allPositions' => Position::orderBy('order')
                ->get(['id', 'name', 'order'])
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'order' => $p->order,
                ]),
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
        
        // Handle additional committees JSON
        if (isset($validated['additional_committees'])) {
            $validated['additional_committees'] = json_encode($validated['additional_committees']);
        }
        
        $position->update($validated);
        
        return redirect()->route('positions.show', $position)
            ->with('success', 'Position updated successfully.');
    }

    /**
     * Delete position
     */
    public function destroy(Position $position)
    {
        $officialsCount = Official::where('position_id', $position->id)->count();
        
        if ($officialsCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete position. It is being used by ' . $officialsCount . ' official(s).');
        }
        
        $position->delete();
        
        return redirect()->route('positions.index')
            ->with('success', 'Position deleted successfully.');
    }

    /**
     * Bulk action handler
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,toggle_account,delete',
            'position_ids' => 'required|array',
            'position_ids.*' => 'exists:positions,id',
            'requires_account' => 'required_if:action,toggle_account|boolean',
        ]);

        $positionIds = $request->position_ids;
        $action = $request->action;

        try {
            DB::beginTransaction();

            switch ($action) {
                case 'activate':
                    Position::whereIn('id', $positionIds)->update(['is_active' => true]);
                    $message = count($positionIds) . ' positions activated successfully.';
                    break;

                case 'deactivate':
                    Position::whereIn('id', $positionIds)->update(['is_active' => false]);
                    $message = count($positionIds) . ' positions deactivated successfully.';
                    break;

                case 'toggle_account':
                    Position::whereIn('id', $positionIds)->update(['requires_account' => $request->requires_account]);
                    $status = $request->requires_account ? 'enabled' : 'disabled';
                    $message = count($positionIds) . ' positions account requirement ' . $status . ' successfully.';
                    break;

                case 'delete':
                    // Check if any positions have officials
                    $positions = Position::whereIn('id', $positionIds)->get();
                    $usedPositions = [];
                    
                    foreach ($positions as $position) {
                        $officialsCount = Official::where('position_id', $position->id)->count();
                        if ($officialsCount > 0) {
                            $usedPositions[] = $position->name;
                        }
                    }
                    
                    if (!empty($usedPositions)) {
                        throw new \Exception('Cannot delete positions: ' . implode(', ', $usedPositions) . ' - they have assigned officials.');
                    }
                    
                    Position::whereIn('id', $positionIds)->delete();
                    $message = count($positionIds) . ' positions deleted successfully.';
                    break;
            }

            DB::commit();
            
            return redirect()->back()->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Export positions to CSV
     */
    public function export(Request $request)
    {
        $query = Position::with(['committee', 'role'])->withCount('officials');
        
        // Apply same filters as index
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
        
        if ($request->filled('requires_account') && $request->requires_account !== 'all') {
            $query->where('requires_account', $request->requires_account === 'required');
        }
        
        $positions = $query->orderBy('order')->get();
        
        $csv = fopen('php://temp', 'r+');
        
        // Headers
        fputcsv($csv, [
            'ID', 'Code', 'Name', 'Description', 'Committee', 'Display Order', 
            'Officials Count', 'Requires Account', 'Status', 'Created At'
        ]);
        
        // Data rows
        foreach ($positions as $position) {
            fputcsv($csv, [
                $position->id,
                $position->code,
                $position->name,
                $position->description ?? '',
                $position->committee?->name ?? '',
                $position->order,
                $position->officials_count ?? 0,
                $position->requires_account ? 'Yes' : 'No',
                $position->is_active ? 'Active' : 'Inactive',
                $position->created_at?->format('Y-m-d H:i:s'),
            ]);
        }
        
        rewind($csv);
        $csvContent = stream_get_contents($csv);
        fclose($csv);
        
        $filename = 'positions-export-' . date('Y-m-d-His') . '.csv';
        
        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get positions for dropdown
     */
    public function getForDropdown()
    {
        $positions = Position::where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'name', 'code', 'requires_account']);
            
        return response()->json($positions);
    }

    /**
     * Apply all filters to query
     */
    protected function applyFilters($query, Request $request)
    {
        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        // Requires account filter
        if ($request->filled('requires_account') && $request->requires_account !== 'all') {
            $query->where('requires_account', $request->requires_account === 'required');
        }
    }

    /**
     * Get position statistics
     */
    protected function getStats(): array
    {
        return [
            'total' => Position::count(),
            'active' => Position::where('is_active', true)->count(),
            'inactive' => Position::where('is_active', false)->count(),
            'requires_account' => Position::where('requires_account', true)->count(),
            'kagawad_count' => Position::where('code', 'like', 'KAG%')
                ->orWhere('name', 'like', '%Kagawad%')
                ->count(),
            'assigned' => Position::has('officials')->count(),
            'unassigned' => Position::doesntHave('officials')->count(),
        ];
    }
}