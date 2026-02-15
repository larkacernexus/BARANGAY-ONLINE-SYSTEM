<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Http\Responses\LoginResponse;
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the custom LoginResponse
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        // Add morph map for polymorphic relationships
        Relation::morphMap([
            'App\Models\Resident' => 'App\Models\Resident',
            'App\Models\Household' => 'App\Models\Household',
        ]);
    }
}
