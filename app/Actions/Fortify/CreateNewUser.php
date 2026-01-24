<?php
// app/Actions/Fortify/CreateNewUser.php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Illuminate\Support\Facades\DB;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'contact_number' => ['nullable', 'string', 'max:20'],
            'terms' => ['required', 'accepted'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'username' => $input['username'],
                'password' => Hash::make($input['password']),
                'contact_number' => $input['contact_number'] ?? null,
                'status' => 'pending', // Default status for new users
                'is_active' => true,
                'require_password_change' => false,
            ]);

            // Assign default role if needed
            // $user->assignRole('user');

            // Log user creation
            activity()
                ->causedBy($user) // The user created themselves
                ->performedOn($user)
                ->withProperties([
                    'log_name' => 'users',
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'action_type' => 'user_registered',
                    'registration_source' => 'public_registration',
                ])
                ->log('User registered an account');

            return $user;
        });
    }
}