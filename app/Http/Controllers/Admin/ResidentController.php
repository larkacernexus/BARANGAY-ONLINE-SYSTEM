<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Resident;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ResidentController extends Controller
{
    // Display listing of residents
    public function index(Request $request)
    {
        $query = Resident::with('household')
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Purok filter
        if ($request->has('purok') && $request->purok !== 'all') {
            $query->where('purok', $request->purok);
        }

        $residents = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Resident::count(),
            'active' => Resident::where('status', 'active')->count(),
            'newThisMonth' => Resident::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'totalHouseholds' => Household::count(),
        ];

        return Inertia::render('Residents/Index', [
            'residents' => $residents,
            'filters' => $request->only(['search', 'status', 'purok']),
            'stats' => $stats,
            'puroks' => $this->getPuroks(),
        ]);
    }

    // Show the form for creating a new resident
    public function create()
    {
        return Inertia::render('admin/Residents/Create', [
            'households' => Household::orderBy('household_number')->get(),
            'puroks' => $this->getPuroks(),
            'civilStatusOptions' => $this->getCivilStatusOptions(),
            'genderOptions' => $this->getGenderOptions(),
            'educationOptions' => $this->getEducationOptions(),
        ]);
    }

    // Store a newly created resident
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'purok' => 'required|string|max:50',
            'household_id' => 'nullable|exists:households,id',
            'occupation' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'is_voter' => 'boolean',
            'is_pwd' => 'boolean',
            'is_senior' => 'boolean',
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        // Calculate age
        $validated['age'] = Carbon::parse($validated['birth_date'])->age;

        // Generate resident ID
        $validated['resident_id'] = $this->generateResidentId();

        $resident = Resident::create($validated);

        return redirect()
            ->route('residents.show', $resident)
            ->with('success', 'Resident registered successfully.');
    }

    // Display the specified resident
    public function show(Resident $resident)
    {
        $resident->load(['household', 'clearances', 'payments']);

        return Inertia::render('Residents/Show', [
            'resident' => $resident,
            'recentActivities' => $this->getResidentActivities($resident),
        ]);
    }

    // Show the form for editing the specified resident
    public function edit(Resident $resident)
    {
        return Inertia::render('Residents/Edit', [
            'resident' => $resident,
            'households' => Household::orderBy('household_number')->get(),
            'puroks' => $this->getPuroks(),
            'civilStatusOptions' => $this->getCivilStatusOptions(),
            'genderOptions' => $this->getGenderOptions(),
            'educationOptions' => $this->getEducationOptions(),
        ]);
    }

    // Update the specified resident
    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'civil_status' => 'required|in:single,married,widowed,separated',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'purok' => 'required|string|max:50',
            'household_id' => 'nullable|exists:households,id',
            'occupation' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'is_voter' => 'boolean',
            'is_pwd' => 'boolean',
            'is_senior' => 'boolean',
            'place_of_birth' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:active,inactive,deceased',
        ]);

        // Recalculate age if birth date changed
        if ($validated['birth_date'] !== $resident->birth_date) {
            $validated['age'] = Carbon::parse($validated['birth_date'])->age;
        }

        $resident->update($validated);

        return redirect()
            ->route('residents.show', $resident)
            ->with('success', 'Resident updated successfully.');
    }

    // Remove the specified resident
    public function destroy(Resident $resident)
    {
        $resident->delete();

        return redirect()
            ->route('residents.index')
            ->with('success', 'Resident deleted successfully.');
    }

    // Import residents from file
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        // Handle file import logic here
        // You might want to use Maatwebsite/Laravel-Excel package

        return redirect()
            ->route('residents.index')
            ->with('success', 'Residents imported successfully.');
    }

    // Export residents
    public function export(Request $request)
    {
        $residents = Resident::with('household')->get();
        
        // Export logic here (CSV, Excel, PDF)
        // You might want to use Maatwebsite/Laravel-Excel package
        
        return response()->streamDownload(function () use ($residents) {
            echo $residents->toJson();
        }, 'residents-export-' . now()->format('Y-m-d') . '.json');
    }

    // Bulk delete residents
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:residents,id',
        ]);

        Resident::whereIn('id', $request->ids)->delete();

        return redirect()
            ->route('residents.index')
            ->with('success', 'Selected residents deleted successfully.');
    }

    // Helper methods
    private function generateResidentId()
    {
        $year = now()->format('Y');
        $lastResident = Resident::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();
        
        if ($lastResident && str_contains($lastResident->resident_id, 'BRGY-' . $year)) {
            $lastNumber = intval(substr($lastResident->resident_id, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return 'BRGY-' . $year . '-' . $newNumber;
    }

    private function getPuroks()
    {
        return [
            'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4',
            'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8',
        ];
    }

    private function getCivilStatusOptions()
    {
        return [
            ['value' => 'single', 'label' => 'Single'],
            ['value' => 'married', 'label' => 'Married'],
            ['value' => 'widowed', 'label' => 'Widowed'],
            ['value' => 'separated', 'label' => 'Separated'],
        ];
    }

    private function getGenderOptions()
    {
        return [
            ['value' => 'male', 'label' => 'Male'],
            ['value' => 'female', 'label' => 'Female'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }

    private function getEducationOptions()
    {
        return [
            ['value' => 'none', 'label' => 'No Formal Education'],
            ['value' => 'elementary', 'label' => 'Elementary'],
            ['value' => 'highschool', 'label' => 'High School'],
            ['value' => 'college', 'label' => 'College'],
            ['value' => 'vocational', 'label' => 'Vocational'],
            ['value' => 'postgraduate', 'label' => 'Postgraduate'],
        ];
    }

    private function getResidentActivities(Resident $resident)
    {
        $payments = $resident->payments()
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'type' => 'payment',
                    'description' => "Payment of {$payment->amount} for {$payment->type}",
                    'date' => $payment->payment_date,
                    'icon' => 'credit-card',
                ];
            });

        $clearances = $resident->clearances()
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($clearance) {
                return [
                    'type' => 'clearance',
                    'description' => "{$clearance->type} clearance issued",
                    'date' => $clearance->issue_date,
                    'icon' => 'file-text',
                ];
            });

        return $payments->merge($clearances)
            ->sortByDesc('date')
            ->take(10)
            ->values();
    }
}