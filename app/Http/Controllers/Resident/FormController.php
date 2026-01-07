<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormCategory;
use App\Models\FormDownload;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index(Request $request)
    {
        $resident = auth()->user()->residentProfile;
        $category = $request->input('category', 'all');
        $search = $request->input('search');
        
        $query = Form::where('is_active', true)
            ->with('category')
            ->orderBy('downloads', 'desc');
        
        if ($category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $forms = $query->paginate(12);
        
        $categories = FormCategory::all();
        
        // Get recently downloaded forms
        $recentDownloads = FormDownload::where('resident_id', $resident->id)
            ->with('form')
            ->latest()
            ->limit(5)
            ->get()
            ->pluck('form_id')
            ->toArray();
        
        // Get stats
        $stats = [
            'total_forms' => Form::where('is_active', true)->count(),
            'total_downloads' => Form::sum('downloads'),
            'recent_downloads' => count($recentDownloads),
        ];
        
        // Get most popular forms
        $popularForms = Form::where('is_active', true)
            ->orderBy('downloads', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('Resident/Forms/Index', [
            'forms' => $forms,
            'categories' => $categories,
            'stats' => $stats,
            'recentDownloads' => $recentDownloads,
            'popularForms' => $popularForms,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }
    
    public function download(Form $form)
    {
        if (!$form->is_active) {
            return back()->with('error', 'Form is not available.');
        }
        
        $resident = auth()->user()->residentProfile;
        
        if (!Storage::disk('public')->exists($form->file_path)) {
            return back()->with('error', 'Form file not found.');
        }
        
        // Record download
        FormDownload::create([
            'form_id' => $form->id,
            'resident_id' => $resident->id,
            'downloaded_at' => now(),
        ]);
        
        // Increment download count
        $form->increment('downloads');
        
        return Storage::disk('public')->download($form->file_path, $form->file_name);
    }
    
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'submission_data' => 'required|array',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:5120', // 5MB max
            'remarks' => 'nullable|string|max:1000',
        ]);
        
        $resident = auth()->user()->residentProfile;
        $form = Form::find($validated['form_id']);
        
        $submission = FormSubmission::create([
            'form_id' => $form->id,
            'resident_id' => $resident->id,
            'submission_data' => json_encode($validated['submission_data']),
            'remarks' => $validated['remarks'],
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        
        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $attachment) {
                $path = $attachment->store('form-submissions/' . $submission->id, 'public');
                $submission->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $attachment->getClientOriginalName(),
                    'file_size' => $attachment->getSize(),
                ]);
            }
        }
        
        // Send notification to barangay officials
        // Notification::send($admins, new FormSubmissionNotification($submission));
        
        return back()->with('success', 'Form submitted successfully.');
    }
    
    public function requestForm(Request $request)
    {
        $validated = $request->validate([
            'form_name' => 'required|string|max:255',
            'purpose' => 'required|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'urgency' => 'required|string|in:low,medium,high',
        ]);
        
        $resident = auth()->user()->residentProfile;
        
        // Create form request
        $formRequest = \App\Models\FormRequest::create([
            'resident_id' => $resident->id,
            'form_name' => $validated['form_name'],
            'purpose' => $validated['purpose'],
            'description' => $validated['description'],
            'urgency' => $validated['urgency'],
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        
        return back()->with('success', 'Form request submitted. We will review your request.');
    }
}