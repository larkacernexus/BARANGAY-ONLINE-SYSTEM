<?php
// app/Http/Controllers/Admin/FormController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FormController extends Controller
{
    // List all forms (for admin)
    public function index(Request $request)
    {
        $query = Form::with('creator')
            ->latest();

        // Search filter
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Agency filter
        if ($request->has('agency')) {
            $query->byAgency($request->agency);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $forms = $query->paginate(20);

        return inertia('admin/Forms/Index', [
            'forms' => $forms,
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
            'filters' => $request->only(['search', 'category', 'agency', 'status']),
        ]);
    }

    // Show create form
    public function create()
    {
        return inertia('admin/Forms/Create', [
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
        ]);
    }

    // Store new form
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240', // 10MB max
            'category' => 'nullable|string|max:100',
            'issuing_agency' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        $file = $request->file('file');
        $filePath = $file->store('forms', 'public');
        
        // Generate slug
        $slug = Str::slug($validated['title']);
        $counter = 1;
        while (Form::where('slug', $slug)->exists()) {
            $slug = Str::slug($validated['title']) . '-' . $counter;
            $counter++;
        }

        // Create form
        Form::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_type' => $file->getClientOriginalExtension(),
            'issuing_agency' => $validated['issuing_agency'] ?? null,
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form uploaded successfully.');
    }

    // Show edit form
    public function edit(Form $form)
    {
        return inertia('admin/Forms/Edit', [
            'form' => $form->load('creator'),
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
        ]);
    }

    // Update form
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'issuing_agency' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        // Handle file update if provided
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('forms', 'public');
            
            // Delete old file
            Storage::disk('public')->delete($form->file_path);
            
            // Update file info
            $form->file_path = $filePath;
            $form->file_name = $file->getClientOriginalName();
            $form->file_size = $file->getSize();
            $form->file_type = $file->getClientOriginalExtension();
        }

        // Update other fields
        $form->title = $validated['title'];
        $form->description = $validated['description'] ?? null;
        $form->category = $validated['category'] ?? null;
        $form->issuing_agency = $validated['issuing_agency'] ?? null;
        $form->is_active = $validated['is_active'] ?? true;

        // Update slug if title changed
        if ($form->isDirty('title')) {
            $slug = Str::slug($validated['title']);
            $counter = 1;
            while (Form::where('slug', $slug)->where('id', '!=', $form->id)->exists()) {
                $slug = Str::slug($validated['title']) . '-' . $counter;
                $counter++;
            }
            $form->slug = $slug;
        }

        $form->save();

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form updated successfully.');
    }

    // Download form
    public function download($slug)
    {
        $form = Form::where('slug', $slug)->firstOrFail();
        
        // Check if form is active
        if (!$form->is_active) {
            abort(404);
        }

        // Increment download count
        $form->incrementDownloadCount();

        // Get file path
        $filePath = storage_path('app/public/' . $form->file_path);
        
        if (!file_exists($filePath)) {
            abort(404);
        }

        // Return file download
        return response()->download($filePath, $form->file_name);
    }

    // Delete form
    public function destroy(Form $form)
    {
        // Delete file from storage
        Storage::disk('public')->delete($form->file_path);
        
        // Delete form
        $form->delete();

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form deleted successfully.');
    }
}