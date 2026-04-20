<?php
// app/Http/Controllers/Admin/BannerController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Purok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::with(['creator:id,first_name,last_name'])
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Add full URLs for images
        $banners->getCollection()->transform(function ($banner) {
            $banner->image_url = $banner->image_path ? url('storage/' . $banner->image_path) : null;
            $banner->mobile_image_url = $banner->mobile_image_path ? url('storage/' . $banner->mobile_image_path) : $banner->image_url;
            return $banner;
        });

        return Inertia::render('admin/Banners/Index', [
            'banners' => $banners,
            'puroks' => Purok::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Banners/Create', [
            'puroks' => Purok::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'image' => 'required|image|max:5120',
            'mobile_image' => 'nullable|image|max:5120',
            'link_url' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:50',
            'alt_text' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'target_audience' => 'required|string|in:all,residents,puroks',
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
        ]);

        // Store with original filename to avoid issues
        $image = $request->file('image');
        $imageName = Str::random(40) . '.' . $image->getClientOriginalExtension();
        $imagePath = $image->storeAs('banners', $imageName, 'public');
        
        $mobileImagePath = null;
        if ($request->hasFile('mobile_image')) {
            $mobileImage = $request->file('mobile_image');
            $mobileImageName = Str::random(40) . '.' . $mobileImage->getClientOriginalExtension();
            $mobileImagePath = $mobileImage->storeAs('banners', $mobileImageName, 'public');
        }

        // Handle target_puroks
        $targetPuroks = null;
        if ($validated['target_audience'] === 'puroks' && isset($validated['target_puroks'])) {
            $targetPuroks = $validated['target_puroks'];
        }

        Banner::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'mobile_image_path' => $mobileImagePath,
            'link_url' => $validated['link_url'] ?? null,
            'button_text' => $validated['button_text'] ?? 'Learn More',
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'target_audience' => $validated['target_audience'],
            'target_puroks' => $targetPuroks,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner created successfully.');
    }

    public function edit(Banner $banner)
    {
        // Add full URLs for images
        $bannerData = $banner->toArray();
        $bannerData['image_url'] = $banner->image_path ? url('storage/' . $banner->image_path) : null;
        $bannerData['mobile_image_url'] = $banner->mobile_image_path ? url('storage/' . $banner->mobile_image_path) : $bannerData['image_url'];

        return Inertia::render('admin/Banners/Edit', [
            'banner' => $bannerData,
            'puroks' => Purok::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'mobile_image' => 'nullable|image|max:5120',
            'link_url' => 'nullable|string|max:255',
            'button_text' => 'nullable|string|max:50',
            'alt_text' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'target_audience' => 'required|string|in:all,residents,puroks',
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
        ]);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'button_text' => $validated['button_text'] ?? 'Learn More',
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'target_audience' => $validated['target_audience'],
            'target_puroks' => ($validated['target_audience'] === 'puroks' && isset($validated['target_puroks'])) 
                ? $validated['target_puroks'] 
                : null,
            'updated_by' => Auth::id(),
        ];

        if ($request->hasFile('image')) {
            // Delete old image
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $image = $request->file('image');
            $imageName = Str::random(40) . '.' . $image->getClientOriginalExtension();
            $data['image_path'] = $image->storeAs('banners', $imageName, 'public');
        }

        if ($request->hasFile('mobile_image')) {
            // Delete old mobile image
            if ($banner->mobile_image_path) {
                Storage::disk('public')->delete($banner->mobile_image_path);
            }
            $mobileImage = $request->file('mobile_image');
            $mobileImageName = Str::random(40) . '.' . $mobileImage->getClientOriginalExtension();
            $data['mobile_image_path'] = $mobileImage->storeAs('banners', $mobileImageName, 'public');
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner updated successfully.');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }
        if ($banner->mobile_image_path) {
            Storage::disk('public')->delete($banner->mobile_image_path);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner deleted successfully.');
    }

    public function toggleActive(Banner $banner)
    {
        $banner->update([
            'is_active' => !$banner->is_active,
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'is_active' => $banner->is_active,
        ]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->banners as $bannerData) {
            Banner::where('id', $bannerData['id'])->update([
                'sort_order' => $bannerData['sort_order'],
                'updated_by' => Auth::id(),
            ]);
        }

        return response()->json(['success' => true]);
    }
}