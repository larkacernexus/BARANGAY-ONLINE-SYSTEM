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

        // Add full URLs for images and calculate status
        $banners->getCollection()->transform(function ($banner) {
            $banner->image_url = $banner->image_path ? url('storage/' . $banner->image_path) : null;
            $banner->mobile_image_url = $banner->mobile_image_path ? url('storage/' . $banner->mobile_image_path) : $banner->image_url;
            
            // Calculate status based on dates and active flag
            $now = now();
            if (!$banner->is_active) {
                $banner->status = 'inactive';
            } elseif ($banner->start_date && $now->lt($banner->start_date)) {
                $banner->status = 'scheduled';
            } elseif ($banner->end_date && $now->gt($banner->end_date)) {
                $banner->status = 'expired';
            } else {
                $banner->status = 'active';
            }
            
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
            'nextOrder' => Banner::max('sort_order') + 1,
        ]);
    }

    /**
     * Save base64 image to storage with proper extension detection
     */
    private function saveBase64Image($base64String, $directory = 'banners')
    {
        // Extract the image type and data
        $imageType = 'jpg'; // default
        $imageData = null;
        
        // Check for data URL pattern
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
            $imageType = strtolower($matches[1]);
            // Handle special cases
            if ($imageType === 'jpeg') {
                $imageType = 'jpg';
            }
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $imageData = base64_decode($base64String);
        } else {
            // Assume it's raw base64
            $imageData = base64_decode($base64String);
            // Try to detect image type from magic bytes
            if ($imageData !== false && strlen($imageData) > 0) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $imageData);
                finfo_close($finfo);
                
                switch ($mimeType) {
                    case 'image/jpeg':
                        $imageType = 'jpg';
                        break;
                    case 'image/png':
                        $imageType = 'png';
                        break;
                    case 'image/gif':
                        $imageType = 'gif';
                        break;
                    case 'image/webp':
                        $imageType = 'webp';
                        break;
                }
            }
        }
        
        if ($imageData === false || empty($imageData)) {
            throw new \Exception('Invalid base64 image data');
        }
        
        // Generate unique filename with proper extension
        $filename = Str::random(40) . '.' . $imageType;
        $path = $directory . '/' . $filename;
        
        // Save to storage
        $saved = Storage::disk('public')->put($path, $imageData);
        
        if (!$saved) {
            throw new \Exception('Failed to save image to storage');
        }
        
        return $path;
    }

    /**
     * Check if string is base64 image
     */
    private function isBase64Image($string)
    {
        if (empty($string)) {
            return false;
        }
        
        // Check for data URL pattern
        if (preg_match('/^data:image\/(\w+);base64,/', $string)) {
            return true;
        }
        
        // Check if it looks like base64 (no spaces, only valid base64 chars, reasonable length)
        if (preg_match('/^[a-zA-Z0-9\/\+=]+$/', $string) && strlen($string) > 100) {
            // Try to decode to validate
            $decoded = base64_decode($string);
            if ($decoded !== false && strlen($decoded) > 100) {
                return true;
            }
        }
        
        return false;
    }

    public function store(Request $request)
    {
        try {
            $imagePath = null;
            $mobileImagePath = null;
            
            // Validate title and other required fields first
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'link_url' => 'nullable|string|max:255',
                'button_text' => 'nullable|string|max:50',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'target_audience' => 'required|string|in:all,puroks',
                'target_puroks' => 'nullable|array',
                'target_puroks.*' => 'exists:puroks,id',
            ]);
            
            // Handle main image - REQUIRED
            if ($request->hasFile('image')) {
                $request->validate([
                    'image' => 'required|image|max:5120',
                ]);
                
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $imageName = Str::random(40) . '.' . $extension;
                $imagePath = $image->storeAs('banners', $imageName, 'public');
            } elseif ($request->input('image_path') && $this->isBase64Image($request->input('image_path'))) {
                try {
                    $imagePath = $this->saveBase64Image($request->input('image_path'), 'banners');
                } catch (\Exception $e) {
                    return redirect()->back()
                        ->withInput()
                        ->with('error', 'Invalid image data. Please try uploading the image again.');
                }
            } else {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Image is required. Please upload an image.');
            }
            
            // Handle mobile image (optional)
            if ($request->hasFile('mobile_image')) {
                $request->validate([
                    'mobile_image' => 'nullable|image|max:5120',
                ]);
                
                $mobileImage = $request->file('mobile_image');
                $mobileExtension = $mobileImage->getClientOriginalExtension();
                $mobileImageName = Str::random(40) . '.' . $mobileExtension;
                $mobileImagePath = $mobileImage->storeAs('banners', $mobileImageName, 'public');
            } elseif ($request->input('mobile_image_path') && $this->isBase64Image($request->input('mobile_image_path'))) {
                try {
                    $mobileImagePath = $this->saveBase64Image($request->input('mobile_image_path'), 'banners');
                } catch (\Exception $e) {
                    // Don't fail the whole request for mobile image
                    $mobileImagePath = null;
                }
            }

            // Get validated data after image validation
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'link_url' => 'nullable|string|max:255',
                'button_text' => 'nullable|string|max:50',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'target_audience' => 'required|string|in:all,puroks',
                'target_puroks' => 'nullable|array',
                'target_puroks.*' => 'exists:puroks,id',
            ]);

            // Handle target_puroks
            $targetPuroks = null;
            if ($validated['target_audience'] === 'puroks' && isset($validated['target_puroks']) && !empty($validated['target_puroks'])) {
                $targetPuroks = $validated['target_puroks'];
            }

            $bannerData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'image_path' => $imagePath,
                'mobile_image_path' => $mobileImagePath,
                'link_url' => $validated['link_url'] ?? null,
                'button_text' => $validated['button_text'] ?? 'Learn More',
                'alt_text' => $validated['alt_text'] ?? null,
                'sort_order' => (int)($validated['sort_order'] ?? 0),
                'is_active' => $validated['is_active'] ?? true,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'target_audience' => $validated['target_audience'],
                'target_puroks' => $targetPuroks,
                'created_by' => Auth::id(),
            ];

            $banner = Banner::create($bannerData);

            return redirect()->route('admin.banners.index')
                ->with('success', 'Banner created successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Clean up uploaded files if validation fails
            if (isset($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            
            if (isset($mobileImagePath) && Storage::disk('public')->exists($mobileImagePath)) {
                Storage::disk('public')->delete($mobileImagePath);
            }
            
            throw $e;
            
        } catch (\Exception $e) {
            // Clean up uploaded files if something went wrong
            if (isset($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            
            if (isset($mobileImagePath) && Storage::disk('public')->exists($mobileImagePath)) {
                Storage::disk('public')->delete($mobileImagePath);
            }
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create banner. Error: ' . $e->getMessage());
        }
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
        try {
            $data = [];
            $imagePath = null;
            $mobileImagePath = null;
            
            // Validate basic fields first
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'link_url' => 'nullable|string|max:255',
                'button_text' => 'nullable|string|max:50',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'target_audience' => 'required|string|in:all,puroks',
                'target_puroks' => 'nullable|array',
                'target_puroks.*' => 'exists:puroks,id',
            ]);
            
            // Handle main image update (optional)
            if ($request->hasFile('image')) {
                $request->validate([
                    'image' => 'nullable|image|max:5120',
                ]);
                
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $imageName = Str::random(40) . '.' . $extension;
                $imagePath = $image->storeAs('banners', $imageName, 'public');
                $data['image_path'] = $imagePath;
                
                // Delete old image
                if ($banner->image_path) {
                    Storage::disk('public')->delete($banner->image_path);
                }
            } elseif ($request->input('image_path') && $this->isBase64Image($request->input('image_path'))) {
                try {
                    $imagePath = $this->saveBase64Image($request->input('image_path'), 'banners');
                    $data['image_path'] = $imagePath;
                    
                    // Delete old image
                    if ($banner->image_path) {
                        Storage::disk('public')->delete($banner->image_path);
                    }
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }
            
            // Handle mobile image update (optional)
            if ($request->hasFile('mobile_image')) {
                $request->validate([
                    'mobile_image' => 'nullable|image|max:5120',
                ]);
                
                $mobileImage = $request->file('mobile_image');
                $mobileExtension = $mobileImage->getClientOriginalExtension();
                $mobileImageName = Str::random(40) . '.' . $mobileExtension;
                $mobileImagePath = $mobileImage->storeAs('banners', $mobileImageName, 'public');
                $data['mobile_image_path'] = $mobileImagePath;
                
                // Delete old mobile image
                if ($banner->mobile_image_path) {
                    Storage::disk('public')->delete($banner->mobile_image_path);
                }
            } elseif ($request->input('mobile_image_path') && $this->isBase64Image($request->input('mobile_image_path'))) {
                try {
                    $mobileImagePath = $this->saveBase64Image($request->input('mobile_image_path'), 'banners');
                    $data['mobile_image_path'] = $mobileImagePath;
                    
                    // Delete old mobile image
                    if ($banner->mobile_image_path) {
                        Storage::disk('public')->delete($banner->mobile_image_path);
                    }
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }

            // Get validated data for other fields
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'link_url' => 'nullable|string|max:255',
                'button_text' => 'nullable|string|max:50',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'target_audience' => 'required|string|in:all,puroks',
                'target_puroks' => 'nullable|array',
                'target_puroks.*' => 'exists:puroks,id',
            ]);

            // Merge validated data
            $data = array_merge($data, [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'link_url' => $validated['link_url'] ?? null,
                'button_text' => $validated['button_text'] ?? 'Learn More',
                'alt_text' => $validated['alt_text'] ?? null,
                'sort_order' => (int)($validated['sort_order'] ?? 0),
                'is_active' => $validated['is_active'] ?? true,
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'target_audience' => $validated['target_audience'],
                'target_puroks' => ($validated['target_audience'] === 'puroks' && isset($validated['target_puroks']) && !empty($validated['target_puroks'])) 
                    ? $validated['target_puroks'] 
                    : null,
                'updated_by' => Auth::id(),
            ]);

            $banner->update($data);

            return redirect()->route('admin.banners.index')
                ->with('success', 'Banner updated successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
            
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update banner. Error: ' . $e->getMessage());
        }
    }

    public function destroy(Banner $banner)
    {
        try {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            
            if ($banner->mobile_image_path) {
                Storage::disk('public')->delete($banner->mobile_image_path);
            }

            $banner->delete();

            return redirect()->route('admin.banners.index')
                ->with('success', 'Banner deleted successfully.');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete banner. Please try again.');
        }
    }

    public function toggleActive(Banner $banner)
    {
        try {
            $newStatus = !$banner->is_active;
            $banner->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'is_active' => $banner->is_active,
                'message' => $newStatus ? 'Banner activated' : 'Banner deactivated',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle banner status',
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $request->validate([
                'banners' => 'required|array',
                'banners.*.id' => 'required|exists:banners,id',
                'banners.*.sort_order' => 'required|integer',
            ]);

            foreach ($request->banners as $bannerData) {
                Banner::where('id', $bannerData['id'])->update([
                    'sort_order' => (int)$bannerData['sort_order'],
                    'updated_by' => Auth::id(),
                ]);
            }

            return response()->json(['success' => true]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder banners',
            ], 500);
        }
    }

    /**
     * Bulk action handler for banners
     */
    public function bulkAction(Request $request)
    {
        try {
            $request->validate([
                'action' => 'required|string|in:delete,update_status,update_audience,export',
                'banner_ids' => 'required|array',
                'banner_ids.*' => 'exists:banners,id',
                'status' => 'required_if:action,update_status|string|in:active,inactive',
                'target_audience' => 'required_if:action,update_audience|string|in:all,puroks',
            ]);

            switch ($request->action) {
                case 'delete':
                    $bannerModels = Banner::whereIn('id', $request->banner_ids)->get();
                    
                    foreach ($bannerModels as $banner) {
                        if ($banner->image_path) {
                            Storage::disk('public')->delete($banner->image_path);
                        }
                        if ($banner->mobile_image_path) {
                            Storage::disk('public')->delete($banner->mobile_image_path);
                        }
                        $banner->delete();
                    }
                    
                    $message = count($request->banner_ids) . ' banner(s) deleted successfully.';
                    break;
                    
                case 'update_status':
                    $isActive = $request->status === 'active';
                    Banner::whereIn('id', $request->banner_ids)->update([
                        'is_active' => $isActive,
                        'updated_by' => Auth::id(),
                    ]);
                    
                    $message = count($request->banner_ids) . ' banner(s) updated to ' . $request->status . '.';
                    break;
                    
                case 'update_audience':
                    Banner::whereIn('id', $request->banner_ids)->update([
                        'target_audience' => $request->target_audience,
                        'updated_by' => Auth::id(),
                    ]);
                    
                    $message = count($request->banner_ids) . ' banner(s) audience updated to ' . $request->target_audience . '.';
                    break;
                    
                case 'export':
                    $message = 'Export functionality will be implemented.';
                    break;
                    
                default:
                    return response()->json(['success' => false, 'message' => 'Invalid action'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action: ' . $e->getMessage(),
            ], 500);
        }
    }
}