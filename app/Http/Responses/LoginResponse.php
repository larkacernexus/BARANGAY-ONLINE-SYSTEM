<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();
        
        // Redirect based on role_id
        switch ($user->role_id) {
            case 0:
                return redirect('/residentdashboard');
            case 1:
                return redirect('/dashboard');
            case 2:
                return redirect('/staffdashboard');
            default:
                return redirect('/residentdashboard');
        }
    }
}