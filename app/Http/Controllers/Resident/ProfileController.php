<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\ResidentProfile;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class ProfileController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = $user->residentProfile;
        $household = $profile->household;
        
        return Inertia::render('Resident/Profile', [
            'profile' => $profile,
            'household' => $household,
        ]);
    }
    
    public function update(Request $request)
    {
        $user = auth()->user();
        $profile = $user->residentProfile;
        
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'purok' => 'required|string|max:50',
            'birthdate' => 'required|date',
            'gender' => 'required|string|in:male,female,other',
            'civil_status' => 'required|string|in:single,married,divorced,widowed',
            'occupation' => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:255',
            'blood_type' => 'nullable|string|max:10',
        ]);
        
        // Update user email if changed
        if ($user->email !== $validated['email']) {
            $user->email = $validated['email'];
            $user->save();
        }
        
        // Update profile
        $profile->update([
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'purok' => $validated['purok'],
            'birthdate' => $validated['birthdate'],
            'gender' => $validated['gender'],
            'civil_status' => $validated['civil_status'],
            'occupation' => $validated['occupation'],
            'emergency_contact' => $validated['emergency_contact'],
            'blood_type' => $validated['blood_type'],
        ]);
        
        return back()->with('success', 'Profile updated successfully.');
    }
    
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);
        
        $user = auth()->user();
        $profile = $user->residentProfile;
        
        // Delete old photo if exists
        if ($profile->photo_path) {
            Storage::delete($profile->photo_path);
        }
        
        // Store new photo
        $path = $request->file('photo')->store('resident-photos', 'public');
        
        $profile->update([
            'photo_path' => $path,
        ]);
        
        return back()->with('success', 'Profile photo updated successfully.');
    }
    
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);
        
        $user = auth()->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);
        
        return back()->with('success', 'Password changed successfully.');
    }
}