<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class ResidentFormController extends Controller
{
    // Public forms listing (for residents)
    public function index(Request $request)
    {
        $query = Form::active()
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

        $forms = $query->paginate(12);

        return inertia('resident/Forms/Index', [
            'forms' => $forms,
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
            'filters' => $request->only(['search', 'category', 'agency']),
        ]);
    }

    // Public form details page
  public function show(Form $form)
{
    // Form will be automatically fetched by ID
    if (!$form->is_active) {
        abort(404);
    }
    
    // Get related forms (same category or agency)
    $relatedForms = Form::where('id', '!=', $form->id)
        ->active()
        ->where(function($query) use ($form) {
            $query->where('category', $form->category)
                ->orWhere('issuing_agency', $form->issuing_agency);
        })
        ->limit(4)
        ->get();

    // Track view count (optional)
    $form->increment('view_count');

    return inertia('resident/Forms/Show', [
        'form' => $form,
        'relatedForms' => $relatedForms,
        'categories' => Form::CATEGORIES,
        'agencies' => Form::AGENCIES,
    ]);
}

    // Public download
    public function download($slug)
    {
        $form = Form::where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Increment download count
        $form->increment('download_count');

        // Get file path
        $filePath = storage_path('app/public/' . $form->file_path);
        
        if (!file_exists($filePath)) {
            abort(404);
        }

        return response()->download($filePath, $form->file_name);
    }
}