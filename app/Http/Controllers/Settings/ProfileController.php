<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        Log::info('Profile edit page accessed', [
            'user_id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $oldData = [
            'username' => $user->username,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at
        ];
        
        Log::info('Profile update initiated', [
            'user_id' => $user->id,
            'old_username' => $oldData['username'],
            'old_email' => $oldData['email'],
            'new_username' => $request->username,
            'new_email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        try {
            // Fill the user with validated data (now expects 'username' instead of 'name')
            $user->fill($request->validated());

            $emailChanged = $user->isDirty('email');
            $usernameChanged = $user->isDirty('username');

            if ($emailChanged) {
                $user->email_verified_at = null;
                Log::info('Email address changed, verification reset', [
                    'user_id' => $user->id,
                    'old_email' => $oldData['email'],
                    'new_email' => $user->email
                ]);
            }

            if ($usernameChanged) {
                Log::info('Username changed', [
                    'user_id' => $user->id,
                    'old_username' => $oldData['username'],
                    'new_username' => $user->username
                ]);
            }

            $user->save();

            Log::info('Profile updated successfully', [
                'user_id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'changes' => [
                    'username_changed' => $usernameChanged,
                    'email_changed' => $emailChanged
                ]
            ]);

            // Add success message to session
            session()->flash('success', 'Profile updated successfully.');

        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            session()->flash('error', 'Failed to update profile. Please try again.');
            
            return back()->withInput();
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        Log::warning('Account deletion initiated', [
            'user_id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            Auth::logout();

            $userId = $user->id;
            $username = $user->username;
            $email = $user->email;

            $user->delete();

            Log::info('Account deleted successfully', [
                'user_id' => $userId,
                'username' => $username,
                'email' => $email,
                'ip' => $request->ip()
            ]);

            $request->session()->invalidate();
            $request->session()->regenerateToken();

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Account deletion failed - invalid password', [
                'user_id' => $user->id,
                'username' => $user->username,
                'ip' => $request->ip()
            ]);
            
            throw $e;
        } catch (\Exception $e) {
            Log::error('Account deletion failed with error', [
                'user_id' => $user->id,
                'username' => $user->username,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            session()->flash('error', 'Failed to delete account. Please try again.');
            
            return back();
        }

        return redirect('/');
    }
}