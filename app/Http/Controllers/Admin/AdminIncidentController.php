<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminIncidentController extends Controller
{
    /**
     * Show admin dashboard
     */
    public function dashboard()
    {
        $stats = [
            'total_incidents' => Incident::count(),
            'pending_incidents' => Incident::where('status', 'pending')->count(),
            'total_residents' => Resident::count(),
            'total_households' => Household::count(),
            'today_incidents' => Incident::whereDate('created_at', today())->count(),
        ];

        $recentIncidents = Incident::with(['resident', 'household', 'blotterDetails'])
            ->latest()
            ->take(10)
            ->get();

        $incidentsByType = [
            'complaints' => Incident::complaints()->count(),
            'blotters' => Incident::blotters()->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentIncidents' => $recentIncidents,
            'incidentsByType' => $incidentsByType,
        ]);
    }

    /**
     * List all incidents (admin view)
     */
    public function index(Request $request)
    {
        $query = Incident::with(['resident', 'household', 'blotterDetails', 'user']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reported_as_name', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $incidents = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Incidents/Index', [
            'incidents' => $incidents,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show specific incident (admin view)
     */
    public function show(Incident $incident)
    {
        $incident->load(['resident', 'household', 'blotterDetails', 'user']);

        // Get related incidents from same household
        $relatedIncidents = Incident::where('household_id', $incident->household_id)
            ->where('id', '!=', $incident->id)
            ->with(['resident'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Incidents/Show', [
            'incident' => $incident,
            'relatedIncidents' => $relatedIncidents,
        ]);
    }

    /**
     * Update incident status (admin only)
     */
    public function updateStatus(Request $request, Incident $incident)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,under_investigation,resolved,dismissed',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $incident->status;
        $incident->update(['status' => $validated['status']]);

        // Log status change
        activity()
            ->performedOn($incident)
            ->causedBy(auth()->user())
            ->withProperties([
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ])
            ->log('status_updated');

        return back()->with('success', 'Status updated successfully!');
    }

    /**
     * List complaints only (admin view)
     */
    public function complaints(Request $request)
    {
        $query = Incident::complaints()
            ->with(['resident', 'household', 'user']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $complaints = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Complaints/Index', [
            'complaints' => $complaints,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * List blotters only (admin view)
     */
    public function blotters(Request $request)
    {
        $query = Incident::blotters()
            ->with(['resident', 'household', 'blotterDetails', 'user']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('blotterDetails', function ($q) use ($search) {
                      $q->where('respondent_name', 'like', "%{$search}%");
                  });
            });
        }

        $blotters = $query->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Blotters/Index', [
            'blotters' => $blotters,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update blotter details (admin only)
     */
    public function updateBlotterDetails(Request $request, Incident $incident)
    {
        if ($incident->type !== 'blotter') {
            abort(400, 'This incident is not a blotter.');
        }

        $validated = $request->validate([
            'respondent_name' => 'required|string|max:255',
            'hearing_date' => 'nullable|date|after:today',
            'hearing_location' => 'nullable|string|max:255',
            'mediator_notes' => 'nullable|string',
        ]);

        $blotterDetails = $incident->blotterDetails;
        
        if ($blotterDetails) {
            $blotterDetails->update($validated);
        } else {
            $incident->blotterDetails()->create($validated);
        }

        // Log the update
        activity()
            ->performedOn($incident)
            ->causedBy(auth()->user())
            ->withProperties($validated)
            ->log('blotter_details_updated');

        return back()->with('success', 'Blotter details updated successfully!');
    }

    /**
     * Get statistics for dashboard charts
     */
    public function getStatistics()
    {
        $monthlyData = Incident::selectRaw('
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(*) as total,
                SUM(CASE WHEN type = "complaint" THEN 1 ELSE 0 END) as complaints,
                SUM(CASE WHEN type = "blotter" THEN 1 ELSE 0 END) as blotters
            ')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $statusDistribution = Incident::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $topHouseholds = Incident::selectRaw('household_id, COUNT(*) as incident_count')
            ->with('household')
            ->groupBy('household_id')
            ->orderByDesc('incident_count')
            ->take(5)
            ->get();

        return response()->json([
            'monthlyData' => $monthlyData,
            'statusDistribution' => $statusDistribution,
            'topHouseholds' => $topHouseholds,
        ]);
    }
}