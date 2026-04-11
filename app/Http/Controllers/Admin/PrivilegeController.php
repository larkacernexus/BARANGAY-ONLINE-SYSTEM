<?php

namespace App\Http\Controllers\Admin;

use App\Models\Privilege;
use App\Models\DiscountType;
use App\Models\Resident;
use App\Models\ResidentPrivilege;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PrivilegeController extends Controller
{
    /**
     * Display a listing of privileges.
     */
    public function index(Request $request)
    {
        // Eager load discountType relationship
        $query = Privilege::with('discountType')
            ->with(['residentPrivileges' => function($q) {
                $q->select('id', 'privilege_id', 'resident_id', 'verified_at', 'expires_at');
            }]);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Discount type filter
        if ($request->filled('discount_type') && $request->discount_type !== 'all') {
            $query->where('discount_type_id', $request->discount_type);
        }

        // Assignments range filter
        if ($request->filled('assignments_range')) {
            $this->applyAssignmentsRangeFilter($query, $request->assignments_range);
        }

        // Discount percentage range filter
        if ($request->filled('discount_percentage_range')) {
            $this->applyDiscountPercentageRangeFilter($query, $request->discount_percentage_range);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        switch ($sortBy) {
            case 'discount_percentage':
                $query->leftJoin('discount_types', 'privileges.discount_type_id', '=', 'discount_types.id')
                      ->orderBy('discount_types.percentage', $sortOrder)
                      ->select('privileges.*');
                break;
            case 'discount_type':
                $query->leftJoin('discount_types', 'privileges.discount_type_id', '=', 'discount_types.id')
                      ->orderBy('discount_types.name', $sortOrder)
                      ->select('privileges.*');
                break;
            case 'residents_count':
                $query->withCount('residentPrivileges');
                $query->orderBy('resident_privileges_count', $sortOrder);
                break;
            case 'active_residents_count':
                $query->withCount(['residentPrivileges as active_residents_count' => function($q) {
                    $q->whereNotNull('verified_at')
                      ->where(function($sub) {
                          $sub->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                      });
                }]);
                $query->orderBy('active_residents_count', $sortOrder);
                break;
            case 'status':
                $query->orderBy('is_active', $sortOrder);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        // ✅ FIXED: Explicitly transform each privilege to include discountType data
        $paginated = $query->paginate(15);
        
        // Transform the collection to ensure discountType is included
        $privileges = $paginated->through(function($privilege) {
            return [
                'id' => $privilege->id,
                'name' => $privilege->name,
                'code' => $privilege->code,
                'description' => $privilege->description,
                'is_active' => $privilege->is_active,
                'discount_type_id' => $privilege->discount_type_id,
                'created_at' => $privilege->created_at,
                'updated_at' => $privilege->updated_at,
                'residents_count' => $privilege->residentPrivileges->count(),
                'active_residents_count' => $privilege->residentPrivileges
                    ->whereNotNull('verified_at')
                    ->where(function($item) {
                        return !$item->expires_at || $item->expires_at > now();
                    })->count(),
                // ✅ Explicitly include the discountType relationship data
                'discountType' => $privilege->discountType ? [
                    'id' => $privilege->discountType->id,
                    'name' => $privilege->discountType->name,
                    'code' => $privilege->discountType->code,
                    'percentage' => (float) $privilege->discountType->percentage,
                    'requires_verification' => (bool) $privilege->discountType->requires_verification,
                    'requires_id_number' => (bool) $privilege->discountType->requires_id_number,
                    'validity_days' => $privilege->discountType->validity_days,
                ] : null,
            ];
        });

        // Get discount types for filter
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code', 'percentage']);

        // Calculate stats
        $allPrivileges = Privilege::with('discountType', 'residentPrivileges')->get();
        $totalAssignments = $allPrivileges->sum(fn($p) => $p->residentPrivileges->count());
        $totalActiveAssignments = $allPrivileges->sum(function($p) {
            return $p->residentPrivileges
                ->whereNotNull('verified_at')
                ->where(fn($item) => !$item->expires_at || $item->expires_at > now())
                ->count();
        });
        $avgDiscount = $allPrivileges->avg(fn($p) => $p->discountType?->percentage ?? 0) ?? 0;
        $unassignedCount = $allPrivileges->filter(fn($p) => $p->residentPrivileges->count() === 0)->count();

        $stats = [
            'total' => $allPrivileges->count(),
            'active' => $allPrivileges->where('is_active', true)->count(),
            'totalAssignments' => $totalAssignments,
            'activeAssignments' => $totalActiveAssignments,
            'avgDiscount' => round($avgDiscount),
            'unassignedCount' => $unassignedCount
        ];

        $can = [
            'create' => auth()->user()->can('manage-privileges'),
            'edit' => auth()->user()->can('manage-privileges'),
            'delete' => auth()->user()->can('manage-privileges'),
            'assign' => auth()->user()->can('assign-privileges'),
        ];

        return inertia('admin/Privileges/Index', [
            'privileges' => $privileges,
            'discountTypes' => $discountTypes,
            'filters' => $request->only(['search', 'status', 'discount_type', 'assignments_range', 'discount_percentage_range', 'sort_by', 'sort_order']),
            'can' => $can,
            'stats' => $stats,
        ]);
    }

    /**
     * Apply assignments range filter to query
     */
    private function applyAssignmentsRangeFilter($query, string $range): void
    {
        $query->withCount('residentPrivileges');
        
        switch ($range) {
            case '0':
                $query->having('resident_privileges_count', 0);
                break;
            case '1-10':
                $query->havingBetween('resident_privileges_count', [1, 10]);
                break;
            case '11-50':
                $query->havingBetween('resident_privileges_count', [11, 50]);
                break;
            case '51-100':
                $query->havingBetween('resident_privileges_count', [51, 100]);
                break;
            case '100+':
                $query->having('resident_privileges_count', '>=', 100);
                break;
        }
    }

    /**
     * Apply discount percentage range filter to query
     */
    private function applyDiscountPercentageRangeFilter($query, string $range): void
    {
        $query->leftJoin('discount_types', 'privileges.discount_type_id', '=', 'discount_types.id');
        
        switch ($range) {
            case '0-10':
                $query->whereBetween('discount_types.percentage', [0, 10]);
                break;
            case '11-25':
                $query->whereBetween('discount_types.percentage', [11, 25]);
                break;
            case '26-50':
                $query->whereBetween('discount_types.percentage', [26, 50]);
                break;
            case '51-75':
                $query->whereBetween('discount_types.percentage', [51, 75]);
                break;
            case '75+':
                $query->where('discount_types.percentage', '>=', 75);
                break;
        }
    }

    /**
     * Show the form for creating a new privilege.
     */
    public function create()
    {
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code', 'percentage']);

        return inertia('admin/Privileges/Create', [
            'discountTypes' => $discountTypes,
        ]);
    }

    /**
     * Store a newly created privilege.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:privileges,code',
            'description' => 'nullable|string',
            'discount_type_id' => 'nullable|exists:discount_types,id',
            'is_active' => 'boolean',
        ]);

        $privilege = Privilege::create($validated);

        return redirect()->route('admin.privileges.index')
            ->with('success', 'Privilege created successfully.');
    }

    /**
     * Display the specified privilege.
     */
    public function show(Privilege $privilege)
    {
        $privilege->load(['discountType']);
        
        $recentAssignments = ResidentPrivilege::with(['resident' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'email', 'age', 'gender');
            }])
            ->where('privilege_id', $privilege->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $privilege->residents_count = ResidentPrivilege::where('privilege_id', $privilege->id)->count();
        $privilege->active_residents_count = ResidentPrivilege::where('privilege_id', $privilege->id)
            ->whereNotNull('verified_at')
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->count();
        $privilege->pending_count = ResidentPrivilege::where('privilege_id', $privilege->id)
            ->whereNull('verified_at')
            ->count();
        $privilege->expired_count = ResidentPrivilege::where('privilege_id', $privilege->id)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->count();

        $can = [
            'edit' => auth()->user()->can('manage-privileges'),
            'delete' => auth()->user()->can('manage-privileges'),
            'assign' => auth()->user()->can('assign-privileges'),
        ];

        return inertia('admin/Privileges/Show', [
            'privilege' => $privilege,
            'recentAssignments' => $recentAssignments,
            'can' => $can,
        ]);
    }

    /**
     * Show the form for editing the specified privilege.
     */
    public function edit(Privilege $privilege)
    {
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code', 'percentage']);

        return inertia('admin/Privileges/Edit', [
            'privilege' => $privilege,
            'discountTypes' => $discountTypes,
        ]);
    }

    /**
     * Update the specified privilege.
     */
    public function update(Request $request, Privilege $privilege)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:privileges,code,' . $privilege->id,
            'description' => 'nullable|string',
            'discount_type_id' => 'nullable|exists:discount_types,id',
            'is_active' => 'boolean',
        ]);

        $privilege->update($validated);

        return redirect()->route('admin.privileges.index')
            ->with('success', 'Privilege updated successfully.');
    }

    /**
     * Remove the specified privilege.
     */
    public function destroy(Privilege $privilege)
    {
        $assignmentsCount = ResidentPrivilege::where('privilege_id', $privilege->id)->count();
        
        if ($assignmentsCount > 0) {
            return back()->withErrors(['error' => 'Cannot delete privilege with existing resident assignments.']);
        }

        $privilege->delete();

        return redirect()->route('admin.privileges.index')
            ->with('success', 'Privilege deleted successfully.');
    }

    /**
     * Bulk action for privileges
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,update_status',
            'privilege_ids' => 'required|array',
            'privilege_ids.*' => 'exists:privileges,id',
            'status' => 'required_if:action,update_status|boolean',
        ]);

        $action = $request->action;
        $privilegeIds = $request->privilege_ids;

        DB::beginTransaction();

        try {
            switch ($action) {
                case 'delete':
                    $privilegesWithAssignments = Privilege::whereIn('id', $privilegeIds)
                        ->whereHas('residentPrivileges')
                        ->count();
                    
                    if ($privilegesWithAssignments > 0) {
                        return redirect()->back()->withErrors(['error' => 'Cannot delete privileges with existing assignments.']);
                    }
                    
                    $deleted = Privilege::whereIn('id', $privilegeIds)->delete();
                    DB::commit();
                    return redirect()->back()->with('success', $deleted . ' privilege(s) deleted successfully.');

                case 'update_status':
                    $status = $request->status;
                    $updated = Privilege::whereIn('id', $privilegeIds)->update(['is_active' => $status]);
                    DB::commit();
                    return redirect()->back()->with('success', $updated . ' privilege(s) status updated successfully.');

                default:
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Invalid action.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Bulk action failed: ' . $e->getMessage());
        }
    }

    /**
     * Toggle privilege active status.
     */
    public function toggleStatus(Privilege $privilege)
    {
        $privilege->update(['is_active' => !$privilege->is_active]);
        $status = $privilege->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Privilege {$status} successfully.");
    }

    /**
     * Duplicate a privilege.
     */
    public function duplicate(Privilege $privilege)
    {
        $newPrivilege = $privilege->replicate();
        $newPrivilege->name = $privilege->name . ' (Copy)';
        $newPrivilege->code = $privilege->code . '_COPY_' . uniqid();
        $newPrivilege->save();

        return redirect()->route('admin.privileges.edit', $newPrivilege->id)
            ->with('success', 'Privilege duplicated successfully.');
    }

    /**
     * Search residents for assignment modal (API endpoint)
     */
    public function searchResidents(Request $request, Privilege $privilege)
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = $request->get('q', '');
        $privilegeId = $privilege->id;
        $page = $request->get('page', 1);
        $perPage = 10;

        $residents = Resident::query()
            ->whereNotExists(function($subQuery) use ($privilegeId) {
                $subQuery->select(DB::raw(1))
                    ->from('resident_privileges')
                    ->whereColumn('resident_privileges.resident_id', 'residents.id')
                    ->where('resident_privileges.privilege_id', $privilegeId);
            })
            ->when($query, fn($q) => $q->search($query))
            ->select('id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'email', 'age', 'gender')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $residents->items(),
            'current_page' => $residents->currentPage(),
            'last_page' => $residents->lastPage(),
            'total' => $residents->total(),
            'per_page' => $residents->perPage(),
        ]);
    }

    /**
     * Store privilege assignments (from modal)
     */
    public function storeAssignment(Request $request, Privilege $privilege)
    {
        $validated = $request->validate([
            'resident_ids' => 'required|array',
            'resident_ids.*' => 'exists:residents,id',
            'id_numbers' => 'nullable|array',
            'id_numbers.*' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        $assignments = [];
        $now = now();

        $discountType = $privilege->discountType;
        $requiresVerification = $discountType?->requires_verification ?? false;
        $discountPercentage = $discountType?->percentage ?? 0;

        DB::transaction(function() use ($privilege, $validated, $now, &$assignments, $requiresVerification, $discountPercentage) {
            foreach ($validated['resident_ids'] as $index => $residentId) {
                $exists = ResidentPrivilege::where('resident_id', $residentId)
                    ->where('privilege_id', $privilege->id)
                    ->exists();

                if (!$exists) {
                    $assignment = ResidentPrivilege::create([
                        'resident_id' => $residentId,
                        'privilege_id' => $privilege->id,
                        'discount_type_id' => $privilege->discount_type_id,
                        'id_number' => $validated['id_numbers'][$index] ?? null,
                        'verified_at' => $requiresVerification ? null : $now,
                        'expires_at' => $validated['expires_at'] ?? null,
                        'remarks' => $validated['notes'] ?? null,
                        'discount_percentage' => $discountPercentage,
                    ]);
                    $assignments[] = $assignment;
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($assignments) . ' resident(s) assigned successfully.',
            'count' => count($assignments)
        ]);
    }

    /**
     * Display all assignments for a privilege.
     */
    public function assignments(Privilege $privilege, Request $request)
    {
        $privilege->load('discountType');

        $query = ResidentPrivilege::with(['resident' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'email', 'age', 'gender');
            }])
            ->where('privilege_id', $privilege->id);

        if ($request->filled('verification')) {
            if ($request->verification === 'verified') {
                $query->whereNotNull('verified_at');
            } elseif ($request->verification === 'pending') {
                $query->whereNull('verified_at');
            }
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active': $query->active(); break;
                case 'pending': $query->pending(); break;
                case 'expired': $query->expired(); break;
                case 'expiring_soon': $query->expiringSoon(); break;
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('resident', fn($q) => $q->search($search));
        }

        $assignments = $query->orderBy('created_at', 'desc')->paginate(15);

        $stats = [
            'total' => ResidentPrivilege::where('privilege_id', $privilege->id)->count(),
            'verified' => ResidentPrivilege::where('privilege_id', $privilege->id)->whereNotNull('verified_at')->count(),
            'pending' => ResidentPrivilege::where('privilege_id', $privilege->id)->pending()->count(),
            'active' => ResidentPrivilege::where('privilege_id', $privilege->id)->active()->count(),
            'expired' => ResidentPrivilege::where('privilege_id', $privilege->id)->expired()->count(),
            'expiring_soon' => ResidentPrivilege::where('privilege_id', $privilege->id)->expiringSoon()->count(),
        ];

        $can = [
            'verify' => auth()->user()->can('assign-privileges'),
            'revoke' => auth()->user()->can('assign-privileges'),
        ];

        return inertia('admin/Privileges/Assignments', [
            'privilege' => $privilege,
            'assignments' => $assignments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'verification', 'status']),
            'can' => $can,
        ]);
    }

    /**
     * Verify a resident's privilege.
     */
    public function verifyAssignment(ResidentPrivilege $assignment)
    {
        if ($assignment->verified_at) {
            return back()->withErrors(['error' => 'Assignment already verified.']);
        }

        $assignment->update(['verified_at' => now()]);
        return back()->with('success', 'Privilege assignment verified successfully.');
    }

    /**
     * Revoke a resident's privilege.
     */
    public function revokeAssignment(ResidentPrivilege $assignment)
    {
        $privilegeName = $assignment->privilege->name;
        $residentName = $assignment->resident->full_name;
        $assignment->delete();
        return back()->with('success', "Privilege '{$privilegeName}' revoked from {$residentName}.");
    }

    /**
     * Bulk verify assignments.
     */
    public function bulkVerify(Request $request, Privilege $privilege)
    {
        $validated = $request->validate([
            'assignment_ids' => 'required|array',
            'assignment_ids.*' => 'exists:resident_privileges,id',
        ]);

        $count = ResidentPrivilege::whereIn('id', $validated['assignment_ids'])
            ->where('privilege_id', $privilege->id)
            ->pending()
            ->update(['verified_at' => now()]);

        return back()->with('success', "{$count} assignment(s) verified successfully.");
    }

    /**
     * Export assignments to CSV.
     */
    public function exportAssignments(Privilege $privilege)
    {
        $assignments = ResidentPrivilege::with('resident')
            ->where('privilege_id', $privilege->id)
            ->get();

        $filename = "privilege_{$privilege->code}_assignments_" . date('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($assignments) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Resident Name', 'Contact Number', 'ID Number', 'Verified At', 'Expires At', 'Assigned At', 'Status']);

            foreach ($assignments as $assignment) {
                fputcsv($handle, [
                    $assignment->resident->full_name ?? $assignment->resident->first_name . ' ' . $assignment->resident->last_name,
                    $assignment->resident->contact_number ?? 'N/A',
                    $assignment->id_number ?? 'N/A',
                    $assignment->verified_at ? $assignment->verified_at->format('Y-m-d H:i:s') : 'Not Verified',
                    $assignment->expires_at ? $assignment->expires_at->format('Y-m-d') : 'Lifetime',
                    $assignment->created_at->format('Y-m-d H:i:s'),
                    $assignment->status,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}