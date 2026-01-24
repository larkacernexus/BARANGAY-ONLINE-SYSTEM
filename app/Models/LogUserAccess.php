<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AccessLog;
use Illuminate\Support\Facades\Auth;

class LogUserAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $endTime = microtime(true);
        $responseTime = round(($endTime - $startTime) * 1000); // Convert to milliseconds
        
        // Don't log certain routes (images, assets, etc.)
        if ($this->shouldSkipLogging($request)) {
            return $response;
        }
        
        // Determine action type
        $actionType = $this->determineActionType($request, $response);
        
        // Determine if this is a sensitive action
        $isSensitive = $this->isSensitiveAction($request, $response, $actionType);
        
        // Get session ID
        $sessionId = $request->session()->getId();
        
        // Get route name
        $routeName = $request->route()?->getName();
        
        // Determine resource type and ID
        $resourceInfo = $this->determineResourceInfo($request, $response);
        
        // Prepare response data for sensitive actions
        $responseData = $isSensitive ? $this->getResponseData($response) : null;
        
        try {
            AccessLog::create([
                'user_id' => Auth::id(),
                'session_id' => $sessionId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'route_name' => $routeName,
                'parameters' => $this->getFilteredParameters($request),
                'status_code' => $response->getStatusCode(),
                'response_time' => $responseTime,
                'response_data' => $responseData,
                'action_type' => $actionType,
                'resource_type' => $resourceInfo['type'],
                'resource_id' => $resourceInfo['id'],
                'description' => $this->getActionDescription($request, $actionType),
                'is_sensitive' => $isSensitive,
                'accessed_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Don't break the application if logging fails
            \Log::error('Failed to log access: ' . $e->getMessage());
        }
        
        return $response;
    }
    
    /**
     * Check if logging should be skipped for this request.
     */
    private function shouldSkipLogging(Request $request): bool
    {
        $skipPaths = [
            '/livewire/*',
            '/_debugbar/*',
            '/telescope/*',
            '/horizon/*',
            '/api/debug/*',
            '/storage/*',
            '/favicon.ico',
        ];
        
        $path = $request->path();
        
        foreach ($skipPaths as $skipPath) {
            if (str_is($skipPath, $path)) {
                return true;
            }
        }
        
        // Skip assets
        if (preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/', $path)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine the action type based on request and response.
     */
    private function determineActionType(Request $request, Response $response): string
    {
        $method = $request->method();
        $routeName = $request->route()?->getName();
        
        // Check for specific routes first
        if (str_contains($routeName, 'login')) {
            return 'login';
        } elseif (str_contains($routeName, 'logout')) {
            return 'logout';
        } elseif (str_contains($routeName, 'export')) {
            return 'export';
        }
        
        // Determine by HTTP method
        switch ($method) {
            case 'POST':
                return 'create';
            case 'PUT':
            case 'PATCH':
                return 'update';
            case 'DELETE':
                return 'delete';
            case 'GET':
            default:
                return 'read';
        }
    }
    
    /**
     * Check if this is a sensitive action.
     */
    private function isSensitiveAction(Request $request, Response $response, string $actionType): bool
    {
        $sensitiveRoutes = [
            'password.*',
            'users.*',
            'roles.*',
            'permissions.*',
            'settings.*',
            'admin.*',
            'payments.*',
            'clearances.*',
        ];
        
        $sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        $sensitiveActions = ['create', 'update', 'delete', 'login', 'logout', 'export'];
        
        $routeName = $request->route()?->getName();
        
        // Check if route matches sensitive patterns
        foreach ($sensitiveRoutes as $pattern) {
            if ($routeName && str_is($pattern, $routeName)) {
                return true;
            }
        }
        
        // Check if method is sensitive
        if (in_array($request->method(), $sensitiveMethods)) {
            return true;
        }
        
        // Check if action type is sensitive
        if (in_array($actionType, $sensitiveActions)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine resource type and ID from request.
     */
    private function determineResourceInfo(Request $request, Response $response): array
    {
        $routeName = $request->route()?->getName();
        $parameters = $request->route()?->parameters();
        
        // Map route patterns to resource types
        $resourceMap = [
            'users' => ['type' => 'User', 'id_key' => 'user'],
            'residents' => ['type' => 'Resident', 'id_key' => 'resident'],
            'households' => ['type' => 'Household', 'id_key' => 'household'],
            'payments' => ['type' => 'Payment', 'id_key' => 'payment'],
            'clearances' => ['type' => 'Clearance', 'id_key' => 'clearance'],
            'roles' => ['type' => 'Role', 'id_key' => 'role'],
            'permissions' => ['type' => 'Permission', 'id_key' => 'permission'],
        ];
        
        foreach ($resourceMap as $pattern => $info) {
            if ($routeName && str_contains($routeName, $pattern)) {
                $resourceId = $parameters[$info['id_key']] ?? null;
                return ['type' => $info['type'], 'id' => $resourceId];
            }
        }
        
        return ['type' => null, 'id' => null];
    }
    
    /**
     * Get filtered parameters (remove sensitive data).
     */
    private function getFilteredParameters(Request $request): array
    {
        $parameters = $request->all();
        
        // Remove sensitive fields
        $sensitiveFields = [
            'password',
            'password_confirmation',
            'current_password',
            'new_password',
            'token',
            'api_key',
            'secret',
            'credit_card',
            'cvv',
            'ssn',
            'social_security',
        ];
        
        foreach ($sensitiveFields as $field) {
            if (isset($parameters[$field])) {
                $parameters[$field] = '***REDACTED***';
            }
        }
        
        return $parameters;
    }
    
    /**
     * Get response data for sensitive actions.
     */
    private function getResponseData(Response $response): ?array
    {
        $content = $response->getContent();
        
        try {
            $data = json_decode($content, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        } catch (\Exception $e) {
            // If not JSON, return limited info
            return [
                'content_type' => $response->headers->get('Content-Type'),
                'content_length' => strlen($content),
                'sample' => substr($content, 0, 100) . (strlen($content) > 100 ? '...' : ''),
            ];
        }
        
        return null;
    }
    
    /**
     * Generate a description for the action.
     */
    private function getActionDescription(Request $request, string $actionType): ?string
    {
        $routeName = $request->route()?->getName();
        
        if (!$routeName) {
            return null;
        }
        
        $descriptions = [
            'login' => 'User authentication',
            'logout' => 'User session ended',
            'export' => 'Data export',
            'create' => 'New record created',
            'update' => 'Record updated',
            'delete' => 'Record deleted',
            'read' => 'Data viewed',
        ];
        
        $baseDescription = $descriptions[$actionType] ?? 'Action performed';
        
        // Add resource context if available
        $resourceInfo = $this->determineResourceInfo($request, new \Illuminate\Http\Response());
        if ($resourceInfo['type']) {
            $baseDescription .= ' for ' . $resourceInfo['type'];
            if ($resourceInfo['id']) {
                $baseDescription .= ' #' . $resourceInfo['id'];
            }
        }
        
        return $baseDescription;
    }
}