<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use Laravel\Fortify\Features;

// This file contains authentication-related routes
// Fortify typically handles most auth routes automatically

// If you need custom auth routes, add them here
Route::middleware('guest')->group(function () {
    // Your custom guest auth routes if any
});

Route::middleware('auth')->group(function () {
    // Your custom authenticated auth routes if any
});