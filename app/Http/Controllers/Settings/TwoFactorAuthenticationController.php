<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorAuthenticationController extends Controller
{
    protected $google2fa;
    
    public function __construct()
    {
        $this->middleware('auth');
        $this->google2fa = new Google2FA();
    }

    /**
     * Show the user's two-factor authentication settings page.
     */
    public function show()
    {
        $user = Auth::user();
        
        return inertia('settings/two-factor', [
            'twoFactorEnabled' => $this->hasEnabledTwoFactor($user),
            'requiresConfirmation' => $user->two_factor_secret && !$user->two_factor_confirmed_at,
        ]);
    }

    /**
     * Enable two-factor authentication.
     */
    public function enable(Request $request)
    {
        $user = Auth::user();
        
        // If already enabled, return error
        if ($this->hasEnabledTwoFactor($user)) {
            return response()->json(['error' => '2FA is already enabled.'], 400);
        }
        
        // Generate new secret
        $secret = $this->google2fa->generateSecretKey();
        
        // Store in session temporarily
        $request->session()->put('two_factor_secret', $secret);
        
        // Generate QR code
        $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
        
        // Generate recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();
        $request->session()->put('two_factor_recovery_codes', $recoveryCodes);
        
        return response()->json([
            'qrCodeSvg' => $qrCodeSvg,
            'manualSetupKey' => $secret,
            'recoveryCodes' => $recoveryCodes,
        ]);
    }

    /**
     * Confirm two-factor authentication setup.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);
        
        $user = Auth::user();
        $secret = $request->session()->get('two_factor_secret');
        $recoveryCodes = $request->session()->get('two_factor_recovery_codes');
        
        if (!$secret) {
            return response()->json(['error' => 'Setup session expired.'], 400);
        }
        
        // Verify code
        $valid = $this->google2fa->verifyKey($secret, $request->code);
        
        if (!$valid) {
            return response()->json(['error' => 'Invalid verification code.'], 422);
        }
        
        // Enable 2FA
        $user->update([
            'two_factor_secret' => Crypt::encryptString($secret),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
        ]);
        
        // Clear session
        $request->session()->forget(['two_factor_secret', 'two_factor_recovery_codes']);
        
        return response()->json(['success' => 'Two-factor authentication enabled successfully.']);
    }

    /**
     * Disable two-factor authentication.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);
        
        $user = Auth::user();
        
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
        
        return response()->json(['success' => 'Two-factor authentication disabled.']);
    }

    /**
     * Get recovery codes.
     */
    public function getRecoveryCodes()
    {
        $user = Auth::user();
        
        if (!$user->two_factor_recovery_codes) {
            return response()->json(['recoveryCodes' => []]);
        }
        
        $recoveryCodes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes));
        
        return response()->json(['recoveryCodes' => $recoveryCodes]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes()
    {
        $user = Auth::user();
        
        if (!$this->hasEnabledTwoFactor($user)) {
            return response()->json(['error' => '2FA is not enabled.'], 400);
        }
        
        $recoveryCodes = $this->generateRecoveryCodes();
        
        $user->update([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
        ]);
        
        return response()->json(['recoveryCodes' => $recoveryCodes]);
    }

    /**
     * Check if user has enabled 2FA.
     */
    private function hasEnabledTwoFactor($user): bool
    {
        return !empty($user->two_factor_secret) && !empty($user->two_factor_confirmed_at);
    }

    /**
     * Generate QR code SVG.
     */
    private function generateQrCodeSvg(string $secret, string $email): string
    {
        $appName = config('app.name', 'Barangay System');
        $qrCodeUrl = $this->google2fa->getQRCodeUrl($appName, $email, $secret);
        
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        
        $writer = new Writer($renderer);
        return $writer->writeString($qrCodeUrl);
    }

    /**
     * Generate recovery codes.
     */
    private function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(5)));
        }
        return $codes;
    }
}