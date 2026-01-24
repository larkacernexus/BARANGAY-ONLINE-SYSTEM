<?php
// app/Http/Controllers/FormController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;

class FormController extends Controller
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

        return inertia('Forms/Index', [
            'forms' => $forms,
            'categories' => Form::CATEGORIES,
            'agencies' => Form::AGENCIES,
            'filters' => $request->only(['search', 'category', 'agency']),
        ]);
    }

    // Public download (same as admin download)
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

        return response()->download($filePath, $form->file_name);
    }
}