<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Inertia\Inertia;

class QrLoginController extends Controller
{
    /**
     * Generate QR code for faster login
     */
    public function generateQrCode(Request $request)
    {
        Log::info('QR Code generation started', ['user_id' => $request->user()->id]);
        
        $user = $request->user();
        
        // Check if user already has a QR code
        if ($user->login_qr_code && $user->qr_code_url) {
            Log::info('User already has QR code', [
                'user_id' => $user->id,
                'token_exists' => !is_null($user->login_qr_code),
                'image_exists' => !is_null($user->qr_code_url)
            ]);
            
            // Return existing QR code
            return back()->with([
                'info' => 'QR code already exists',
                'qr_code_url' => '/storage/' . $user->qr_code_url,
                'login_url' => route('qr.login', ['token' => $user->login_qr_code]),
            ]);
        }
        
        // Generate a unique token
        $token = Str::random(32);
        Log::debug('Generated QR token', ['user_id' => $user->id, 'token' => $token]);
        
        // Set expiration (30 days from now)
        $expiresAt = now()->addDays(30);
        
        // Generate QR code image
        $loginUrl = route('qr.login', ['token' => $token]);
        Log::debug('Login URL generated', ['user_id' => $user->id, 'login_url' => $loginUrl]);
        
        try {
            // Configure QR options
            $options = new QROptions([
                'version' => 10,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_L,
                'scale' => 5,
                'imageBase64' => false,
                'imageTransparent' => false,
                'addQuietzone' => true,
                'quietzoneSize' => 2,
            ]);
            
            Log::info('QR options configured', [
                'user_id' => $user->id,
                'version' => 10,
                'eccLevel' => 'L'
            ]);
            
            // Generate QR code
            $qrcode = new QRCode($options);
            $pngData = $qrcode->render($loginUrl);
            
            Log::debug('QR code rendered', [
                'user_id' => $user->id,
                'data_size' => strlen($pngData)
            ]);
            
            // Make sure the directory exists
            $directory = 'qr-codes';
            if (!Storage::disk('public')->exists($directory)) {
                Log::info('Creating QR codes directory', ['user_id' => $user->id, 'directory' => $directory]);
                Storage::disk('public')->makeDirectory($directory);
            }
            
            // Store QR code image
            $fileName = $directory . '/' . $user->id . '_' . time() . '.png';
            Storage::disk('public')->put($fileName, $pngData);
            
            Log::info('QR code image saved', [
                'user_id' => $user->id,
                'file_name' => $fileName,
                'full_path' => Storage::disk('public')->path($fileName)
            ]);
            
            // Delete old QR image if exists
            if ($user->qr_code_url) {
                Log::info('Deleting old QR code image', [
                    'user_id' => $user->id,
                    'old_file' => $user->qr_code_url
                ]);
                Storage::disk('public')->delete($user->qr_code_url);
            }
            
            // Update user with QR login token
            $user->update([
                'login_qr_code' => $token,
                'login_qr_code_generated_at' => now(),
                'login_qr_code_expires_at' => $expiresAt,
                'login_qr_code_used_count' => 0,
                'qr_code_url' => $fileName,
            ]);
            
            Log::info('QR code generation completed successfully', [
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => $expiresAt->toDateTimeString()
            ]);
            
            return back()->with([
                'success' => 'QR code generated successfully',
                'qr_code_url' => '/storage/' . $fileName,
                'login_url' => $loginUrl,
            ]);
            
        } catch (\Exception $e) {
            Log::error('QR code generation failed', [
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to generate QR code: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Get QR code status (returns Inertia response)
     */
    public function getQrStatus(Request $request)
    {
        $user = $request->user();
        
        Log::info('QR status check', [
            'user_id' => $user->id,
            'has_token' => !is_null($user->login_qr_code),
            'has_image' => !is_null($user->qr_code_url)
        ]);
        
        // If it's an Inertia request, share the data
        if ($request->wantsJson()) {
            $response = [
                'has_qr_code' => !is_null($user->login_qr_code),
                'qr_code_url' => $user->qr_code_url ? '/storage/' . $user->qr_code_url : null,
                'generated_at' => $user->login_qr_code_generated_at,
                'expires_at' => $user->login_qr_code_expires_at,
                'is_expired' => $user->login_qr_code_expires_at ? now()->gt($user->login_qr_code_expires_at) : false,
                'used_count' => $user->login_qr_code_used_count,
            ];
            
            Log::debug('QR status response', $response);
            
            return response()->json($response);
        }
        
        return back();
    }
    
    /**
     * Regenerate QR code (this will invalidate the old one)
     */
    public function regenerateQrCode(Request $request)
    {
        Log::info('QR code regeneration started', ['user_id' => $request->user()->id]);
        
        $user = $request->user();
        
        // Generate new token
        $newToken = Str::random(32);
        $expiresAt = now()->addDays(30);
        
        // Generate new QR code
        $loginUrl = route('qr.login', ['token' => $newToken]);
        
        try {
            // Configure QR options
            $options = new QROptions([
                'version' => 10,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_L,
                'scale' => 5,
                'imageBase64' => false,
                'imageTransparent' => false,
                'addQuietzone' => true,
                'quietzoneSize' => 2,
            ]);
            
            Log::info('QR options configured for regeneration', [
                'user_id' => $user->id,
                'version' => 10,
                'eccLevel' => 'L'
            ]);
            
            // Generate QR code
            $qrcode = new QRCode($options);
            $pngData = $qrcode->render($loginUrl);
            
            // Make sure the directory exists
            $directory = 'qr-codes';
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }
            
            $fileName = $directory . '/' . $user->id . '_' . time() . '.png';
            Storage::disk('public')->put($fileName, $pngData);
            
            Log::info('New QR code image saved for regeneration', [
                'user_id' => $user->id,
                'file_name' => $fileName
            ]);
            
            // Delete old QR image if exists
            if ($user->qr_code_url) {
                Log::info('Deleting old QR code image during regeneration', [
                    'user_id' => $user->id,
                    'old_file' => $user->qr_code_url
                ]);
                Storage::disk('public')->delete($user->qr_code_url);
            }
            
            // Update user
            $user->update([
                'login_qr_code' => $newToken,
                'login_qr_code_generated_at' => now(),
                'login_qr_code_expires_at' => $expiresAt,
                'login_qr_code_used_count' => 0,
                'qr_code_url' => $fileName,
            ]);
            
            Log::info('QR code regeneration completed successfully', [
                'user_id' => $user->id,
                'new_token' => $newToken
            ]);
            
            return back()->with([
                'success' => 'QR code regenerated successfully',
                'qr_code_url' => '/storage/' . $fileName,
                'login_url' => $loginUrl,
            ]);
            
        } catch (\Exception $e) {
            Log::error('QR code regeneration failed', [
                'user_id' => $user->id,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to regenerate QR code: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Disable QR login
     */
    public function disableQrLogin(Request $request)
    {
        $user = $request->user();
        
        Log::warning('QR login disabled', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        return back()->with([
            'success' => 'QR login disabled'
        ]);
    }
    
    /**
     * Enable QR login
     */
    public function enableQrLogin(Request $request)
    {
        $user = $request->user();
        
        Log::info('QR login enabled', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        return back()->with([
            'success' => 'QR login enabled'
        ]);
    }
    
    /**
     * Handle QR code login (redirects to portal/dashboard)
     */
    public function loginWithQr($token)
    {
        Log::info('QR login attempt', ['token' => substr($token, 0, 8) . '...', 'ip' => request()->ip()]);
        
        // Find user with this token
        $user = User::where('login_qr_code', $token)
            ->where(function($query) {
                $query->where('login_qr_code_expires_at', '>', now())
                    ->orWhereNull('login_qr_code_expires_at');
            })
            ->first();
        
        if (!$user) {
            Log::warning('QR login failed - invalid or expired token', [
                'token' => substr($token, 0, 8) . '...',
                'ip' => request()->ip()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'Invalid or expired QR code');
        }
        
        Log::info('QR login successful', [
            'user_id' => $user->id,
            'token' => substr($token, 0, 8) . '...',
            'ip' => request()->ip()
        ]);
        
        // Update usage stats
        $user->update([
            'login_qr_code_used_count' => ($user->login_qr_code_used_count ?? 0) + 1,
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);
        
        // Log the user in
        auth()->login($user, true);
        
        // Redirect to portal/dashboard
        return redirect()->intended('/portal/dashboard')
            ->with('success', 'Logged in successfully via QR code');
    }
}