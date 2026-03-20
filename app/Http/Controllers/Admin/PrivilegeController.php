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
        $query = Privilege::with(['discountType', 'residentPrivileges' => function($q) {
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
        if ($request->filled('discount_type')) {
            $query->where('discount_type_id', $request->discount_type);
        }

        // Get privileges with counts
        $privileges = $query->orderBy('name')
            ->paginate(15)
            ->through(function($privilege) {
                $privilege->residents_count = $privilege->residentPrivileges->count();
                $privilege->active_residents_count = $privilege->residentPrivileges
                    ->whereNotNull('verified_at')
                    ->where(function($item) {
                        return !$item->expires_at || $item->expires_at > now();
                    })
                    ->count();
                return $privilege;
            });

        // Get discount types for filter
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code']);

        // Check permissions for UI (buttons visibility)
        $can = [
            'create' => auth()->user()->can('manage-privileges'),
            'edit' => auth()->user()->can('manage-privileges'),
            'delete' => auth()->user()->can('manage-privileges'),
            'assign' => auth()->user()->can('assign-privileges'),
        ];

        return inertia('admin/Privileges/Index', [
            'privileges' => $privileges,
            'discountTypes' => $discountTypes,
            'filters' => $request->only(['search', 'status', 'discount_type']),
            'can' => $can,
        ]);
    }

    /**
     * Show the form for creating a new privilege.
     */
    public function create()
    {
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code']);

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
            'discount_type_id' => 'required|exists:discount_types,id',
            'default_discount_percentage' => 'required|numeric|min:0|max:100',
            'requires_id_number' => 'boolean',
            'requires_verification' => 'boolean',
            'validity_years' => 'nullable|integer|min:1',
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
        
        // Get recent assignments with resident details
        $recentAssignments = ResidentPrivilege::with(['resident' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'email', 'age', 'gender');
            }])
            ->where('privilege_id', $privilege->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Add counts
        $privilege->residents_count = ResidentPrivilege::where('privilege_id', $privilege->id)->count();
        $privilege->active_residents_count = ResidentPrivilege::where('privilege_id', $privilege->id)
            ->whereNotNull('verified_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
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
        $discountTypes = DiscountType::orderBy('name')->get(['id', 'name', 'code']);

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
            'discount_type_id' => 'required|exists:discount_types,id',
            'default_discount_percentage' => 'required|numeric|min:0|max:100',
            'requires_id_number' => 'boolean',
            'requires_verification' => 'boolean',
            'validity_years' => 'nullable|integer|min:1',
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
        // Check if privilege has any assignments
        $assignmentsCount = ResidentPrivilege::where('privilege_id', $privilege->id)->count();
        
        if ($assignmentsCount > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete privilege with existing resident assignments. Please remove assignments first.'
            ]);
        }

        $privilege->delete();

        return redirect()->route('admin.privileges.index')
            ->with('success', 'Privilege deleted successfully.');
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

        // Get residents who DON'T already have this privilege
        $residents = Resident::query()
            ->whereNotExists(function($subQuery) use ($privilegeId) {
                $subQuery->select(DB::raw(1))
                    ->from('resident_privileges')
                    ->whereColumn('resident_privileges.resident_id', 'residents.id')
                    ->where('resident_privileges.privilege_id', $privilegeId);
            })
            ->when($query, function($q) use ($query) {
                // Using the Resident model's scopeSearch method
                $q->search($query);
            })
            ->select([
                'id', 
                'first_name', 
                'last_name', 
                'middle_name', 
                'contact_number', 
                'email',
                'age',
                'gender'
            ])
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

        // Calculate expiration date if validity_years is set and no custom date provided
        $expiresAt = $validated['expires_at'] ?? null;
        if (!$expiresAt && $privilege->validity_years) {
            $expiresAt = now()->addYears($privilege->validity_years)->format('Y-m-d');
        }

        DB::transaction(function() use ($privilege, $validated, $expiresAt, $now, &$assignments) {
            foreach ($validated['resident_ids'] as $index => $residentId) {
                // Check if assignment already exists (double-check)
                $exists = ResidentPrivilege::where('resident_id', $residentId)
                    ->where('privilege_id', $privilege->id)
                    ->exists();

                if (!$exists) {
                    $assignment = ResidentPrivilege::create([
                        'resident_id' => $residentId,
                        'privilege_id' => $privilege->id,
                        'discount_type_id' => $privilege->discount_type_id,
                        'id_number' => $validated['id_numbers'][$index] ?? null,
                        'verified_at' => $privilege->requires_verification ? null : $now,
                        'expires_at' => $expiresAt,
                        'remarks' => $validated['notes'] ?? null,
                        'discount_percentage' => $privilege->default_discount_percentage,
                        'created_at' => $now,
                        'updated_at' => $now,
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
     * Show the form for assigning privilege to residents (legacy page)
     */
    public function assign(Privilege $privilege)
    {
        $privilege->load('discountType');

        // Get residents who don't have this privilege yet
        $availableResidents = Resident::query()
            ->whereNotExists(function($query) use ($privilege) {
                $query->select(DB::raw(1))
                    ->from('resident_privileges')
                    ->whereColumn('resident_privileges.resident_id', 'residents.id')
                    ->where('resident_privileges.privilege_id', $privilege->id);
            })
            ->select('id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'email')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return inertia('admin/Privileges/Assign', [
            'privilege' => $privilege,
            'availableResidents' => $availableResidents,
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

        // Filter by verification status
        if ($request->filled('verification')) {
            if ($request->verification === 'verified') {
                $query->whereNotNull('verified_at');
            } elseif ($request->verification === 'pending') {
                $query->whereNull('verified_at');
            }
        }

        // Filter by status using the model's scopes
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'pending':
                    $query->pending();
                    break;
                case 'expired':
                    $query->expired();
                    break;
                case 'expiring_soon':
                    $query->expiringSoon();
                    break;
            }
        }

        // Search by resident name using Resident model's scopeSearch
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('resident', function($q) use ($search) {
                $q->search($search);
            });
        }

        $assignments = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = [
            'total' => ResidentPrivilege::where('privilege_id', $privilege->id)->count(),
            'verified' => ResidentPrivilege::where('privilege_id', $privilege->id)
                ->whereNotNull('verified_at')->count(),
            'pending' => ResidentPrivilege::where('privilege_id', $privilege->id)
                ->pending()->count(),
            'active' => ResidentPrivilege::where('privilege_id', $privilege->id)
                ->active()->count(),
            'expired' => ResidentPrivilege::where('privilege_id', $privilege->id)
                ->expired()->count(),
            'expiring_soon' => ResidentPrivilege::where('privilege_id', $privilege->id)
                ->expiringSoon()->count(),
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

        $assignment->update([
            'verified_at' => now(),
        ]);

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
        $handle = fopen('php://output', 'w');

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        // Add headers
        fputcsv($handle, [
            'Resident Name',
            'Contact Number',
            'ID Number',
            'Verified At',
            'Expires At',
            'Assigned At',
            'Status'
        ]);

        // Add data
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
        exit;
    }

    /**
     * Toggle privilege active status.
     */
    public function toggleStatus(Privilege $privilege)
    {
        $privilege->update([
            'is_active' => !$privilege->is_active
        ]);

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
        $newPrivilege->created_at = now();
        $newPrivilege->updated_at = now();
        $newPrivilege->save();

        return redirect()->route('admin.privileges.edit', $newPrivilege->id)
            ->with('success', 'Privilege duplicated successfully. Please review and update the details.');
    }
}