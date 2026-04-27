<!-- 
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResidentMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $user = auth()->user();
        
        // ALLOW Resident AND Kagawad roles
        $allowedRoles = ['Resident', 'Barangay Kagawad'];
        
        if (!$user->role || !in_array($user->role->name, $allowedRoles)) {
            // Redirect to admin dashboard if they're not a resident or kagawad
            return redirect('/dashboard')
                ->with('error', 'You do not have access to the resident portal.');
        }

        return $next($request);
    }
} -->