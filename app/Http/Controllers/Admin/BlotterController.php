<?php
// app/Http/Controllers/Admin/BlotterController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use App\Models\Resident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class BlotterController extends Controller
{
    /**
     * Display a listing of blotters.
     */
    public function index(Request $request)
    {
        $query = Blotter::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('blotter_number', 'like', "%{$search}%")
                  ->orWhere('incident_type', 'like', "%{$search}%")
                  ->orWhere('reporter_name', 'like', "%{$search}%")
                  ->orWhere('respondent_name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Incident type filter
        if ($request->filled('incident_type') && $request->incident_type !== 'all') {
            $query->where('incident_type', $request->incident_type);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('incident_datetime', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('incident_datetime', '<=', $request->date_to);
        }

        // Barangay filter
        if ($request->filled('barangay') && $request->barangay !== 'all') {
            $query->where('barangay', $request->barangay);
        }

        // Sorting
        $sortField = $request->get('sort_field', 'incident_datetime');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $blotters = $query->paginate(10)
            ->through(function ($blotter) {
                return [
                    'id' => $blotter->id,
                    'blotter_number' => $blotter->blotter_number,
                    'incident_type' => $blotter->incident_type,
                    'incident_datetime' => $blotter->incident_datetime->format('Y-m-d H:i:s'),
                    'formatted_datetime' => $blotter->formatted_incident_datetime,
                    'location' => $blotter->location,
                    'barangay' => $blotter->barangay,
                    'reporter_name' => $blotter->reporter_name,
                    'respondent_name' => $blotter->respondent_name,
                    'status' => $blotter->status,
                    'status_badge' => $blotter->status_badge,
                    'priority' => $blotter->priority,
                    'priority_badge' => $blotter->priority_badge,
                    'created_at' => $blotter->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get statistics
        $stats = [
            'total' => Blotter::count(),
            'pending' => Blotter::where('status', 'pending')->count(),
            'investigating' => Blotter::where('status', 'investigating')->count(),
            'resolved' => Blotter::where('status', 'resolved')->count(),
            'archived' => Blotter::where('status', 'archived')->count(),
            'urgent' => Blotter::where('priority', 'urgent')->count(),
            'high' => Blotter::where('priority', 'high')->count(),
            'medium' => Blotter::where('priority', 'medium')->count(),
            'low' => Blotter::where('priority', 'low')->count(),
        ];

        // Get unique barangays for filter
        $barangays = Blotter::distinct('barangay')
            ->whereNotNull('barangay')
            ->pluck('barangay')
            ->values();

        return Inertia::render('admin/Blotters/Index', [
            'blotters' => $blotters,
            'stats' => $stats,
            'barangays' => $barangays,
            'filters' => $request->only([
                'search', 
                'status', 
                'priority', 
                'incident_type',
                'date_from', 
                'date_to', 
                'barangay', 
                'sort_field', 
                'sort_direction'
            ]),
        ]);
    }

    /**
     * Show the form for creating a new blotter.
     */
    public function create()
    {
        return Inertia::render('admin/Blotters/Create', [
            'barangayName' => config('app.barangay_name', 'Kibawe'),
        ]);
    }

    /**
     * Search residents via AJAX for blotter party selection
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Resident::with('purok')
            ->select([
                'id',
                'first_name',
                'last_name',
                'middle_name',
                'suffix',
                'address',
                'contact_number',
                'email',
                'purok_id',
                'photo_path',
                'gender',
                'civil_status',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('purok', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($resident) {
            return [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'suffix' => $resident->suffix,
                'address' => $resident->address,
                'contact_number' => $resident->contact_number,
                'email' => $resident->email,
                'purok' => $resident->purok?->name,
                'purok_id' => $resident->purok_id,
                'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                'gender' => $resident->gender,
                'civil_status' => $resident->civil_status,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Store a newly created blotter.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'incident_type' => 'required|string|max:255',
            'incident_description' => 'required|string',
            'incident_datetime' => 'required|date',
            'location' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'reporter_name' => 'required|string|max:255',
            'reporter_contact' => 'nullable|string|max:20',
            'reporter_address' => 'nullable|string|max:255',
            'reporter_is_resident' => 'boolean',
            'reporter_resident_id' => 'nullable|exists:residents,id',
            'respondent_name' => 'nullable|string|max:255',
            'respondent_address' => 'nullable|string|max:255',
            'respondent_is_resident' => 'boolean',
            'respondent_resident_id' => 'nullable|exists:residents,id',
            'witnesses' => 'nullable|string',
            'evidence' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'involved_residents' => 'nullable|array',
            'involved_residents.*' => 'exists:residents,id',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // Handle file uploads
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('blotter-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
            $data['attachments'] = $attachments;
        }

        // Set initial status
        $data['status'] = 'pending';

        // Create blotter
        $blotter = Blotter::create($data);

        return redirect()->route('admin.blotters.show', $blotter->id)
            ->with('success', 'Blotter record created successfully.');
    }

    /**
     * Display the specified blotter.
     */
    public function show(Blotter $blotter)
    {
        // Get involved residents details
        $involvedResidents = [];
        if ($blotter->involved_residents) {
            $involvedResidents = Resident::whereIn('id', $blotter->involved_residents)
                ->select('id', 'first_name', 'last_name', 'middle_name', 'suffix', 'address', 'contact_number')
                ->get()
                ->map(function ($resident) {
                    return [
                        'id' => $resident->id,
                        'name' => $resident->full_name,
                        'address' => $resident->address,
                        'contact' => $resident->contact_number,
                    ];
                });
        }

        return Inertia::render('admin/Blotters/Show', [
            'blotter' => [
                'id' => $blotter->id,
                'blotter_number' => $blotter->blotter_number,
                'incident_type' => $blotter->incident_type,
                'incident_description' => $blotter->incident_description,
                'incident_datetime' => $blotter->incident_datetime->format('Y-m-d H:i:s'),
                'formatted_datetime' => $blotter->formatted_incident_datetime,
                'location' => $blotter->location,
                'barangay' => $blotter->barangay,
                'reporter_name' => $blotter->reporter_name,
                'reporter_contact' => $blotter->reporter_contact,
                'reporter_address' => $blotter->reporter_address,
                'respondent_name' => $blotter->respondent_name,
                'respondent_address' => $blotter->respondent_address,
                'witnesses' => $blotter->witnesses,
                'evidence' => $blotter->evidence,
                'status' => $blotter->status,
                'status_badge' => $blotter->status_badge,
                'priority' => $blotter->priority,
                'priority_badge' => $blotter->priority_badge,
                'action_taken' => $blotter->action_taken,
                'investigator' => $blotter->investigator,
                'resolved_datetime' => $blotter->resolved_datetime?->format('Y-m-d H:i:s'),
                'attachments' => $blotter->attachments,
                'involved_residents' => $involvedResidents,
                'created_at' => $blotter->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $blotter->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified blotter.
     */
    public function edit(Blotter $blotter)
    {
        return Inertia::render('admin/Blotters/Edit', [
            'blotter' => [
                'id' => $blotter->id,
                'blotter_number' => $blotter->blotter_number,
                'incident_type' => $blotter->incident_type,
                'incident_description' => $blotter->incident_description,
                'incident_datetime' => $blotter->incident_datetime->format('Y-m-d H:i:s'),
                'location' => $blotter->location,
                'barangay' => $blotter->barangay,
                'reporter_name' => $blotter->reporter_name,
                'reporter_contact' => $blotter->reporter_contact,
                'reporter_address' => $blotter->reporter_address,
                'reporter_is_resident' => (bool) $blotter->reporter_is_resident,
                'reporter_resident_id' => $blotter->reporter_resident_id,
                'respondent_name' => $blotter->respondent_name,
                'respondent_address' => $blotter->respondent_address,
                'respondent_is_resident' => (bool) $blotter->respondent_is_resident,
                'respondent_resident_id' => $blotter->respondent_resident_id,
                'witnesses' => $blotter->witnesses,
                'evidence' => $blotter->evidence,
                'status' => $blotter->status,
                'priority' => $blotter->priority,
                'action_taken' => $blotter->action_taken,
                'investigator' => $blotter->investigator,
                'resolved_datetime' => $blotter->resolved_datetime?->format('Y-m-d H:i:s'),
                'involved_residents' => $blotter->involved_residents ?? [],
            ],
        ]);
    }

    /**
     * Update the specified blotter.
     */
    public function update(Request $request, Blotter $blotter)
    {
        $validator = Validator::make($request->all(), [
            'incident_type' => 'required|string|max:255',
            'incident_description' => 'required|string',
            'incident_datetime' => 'required|date',
            'location' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'reporter_name' => 'required|string|max:255',
            'reporter_contact' => 'nullable|string|max:20',
            'reporter_address' => 'nullable|string|max:255',
            'reporter_is_resident' => 'boolean',
            'reporter_resident_id' => 'nullable|exists:residents,id',
            'respondent_name' => 'nullable|string|max:255',
            'respondent_address' => 'nullable|string|max:255',
            'respondent_is_resident' => 'boolean',
            'respondent_resident_id' => 'nullable|exists:residents,id',
            'witnesses' => 'nullable|string',
            'evidence' => 'nullable|string',
            'status' => 'required|in:pending,investigating,resolved,archived',
            'priority' => 'required|in:low,medium,high,urgent',
            'action_taken' => 'nullable|string',
            'investigator' => 'nullable|string|max:255',
            'resolved_datetime' => 'nullable|date',
            'involved_residents' => 'nullable|array',
            'involved_residents.*' => 'exists:residents,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // Automatically set resolved datetime if status is resolved
        if ($data['status'] === 'resolved' && !isset($data['resolved_datetime'])) {
            $data['resolved_datetime'] = now();
        }

        // Clear resolved datetime if status is not resolved
        if ($data['status'] !== 'resolved') {
            $data['resolved_datetime'] = null;
        }

        $blotter->update($data);

        return redirect()->route('admin.blotters.show', $blotter->id)
            ->with('success', 'Blotter record updated successfully.');
    }

    /**
     * Remove the specified blotter.
     */
    public function destroy(Blotter $blotter)
    {
        // Delete attachments
        if ($blotter->attachments) {
            foreach ($blotter->attachments as $attachment) {
                Storage::disk('public')->delete($attachment['path']);
            }
        }

        $blotter->delete();

        return redirect()->route('admin.blotters.index')
            ->with('success', 'Blotter record deleted successfully.');
    }

    /**
     * Update blotter status.
     */
    public function updateStatus(Request $request, Blotter $blotter)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,investigating,resolved,archived',
            'action_taken' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $data = $validator->validated();

        if ($data['status'] === 'resolved') {
            $data['resolved_datetime'] = now();
        }

        $blotter->update($data);

        return back()->with('success', 'Blotter status updated successfully.');
    }

    /**
     * Download attachment.
     */
    public function downloadAttachment(Blotter $blotter, $index)
    {
        if (!$blotter->attachments || !isset($blotter->attachments[$index])) {
            return back()->with('error', 'Attachment not found.');
        }

        $attachment = $blotter->attachments[$index];
        
        if (!Storage::disk('public')->exists($attachment['path'])) {
            return back()->with('error', 'File not found.');
        }

        return Storage::disk('public')->download($attachment['path'], $attachment['name']);
    }
}