<?php

namespace App\Http\Controllers\Residentsettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('residentsettings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        // SECURITY NOTE: Validate with Laravel's built-in rules
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        // SECURITY NOTE: Hash the password before saving (critical!)
        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        // SECURITY NOTE: Regenerate session for security
        $request->session()->regenerate();

        return back()->with('status', 'Password updated successfully.');
    }
}