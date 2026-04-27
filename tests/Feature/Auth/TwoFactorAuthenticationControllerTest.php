<?php

namespace Tests\Feature\Settings;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PragmaRX\Google2FA\Google2FA;
use Mockery;

class TwoFactorAuthenticationControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $google2FAMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock Google2FA for consistent testing
        $this->google2FAMock = Mockery::mock(Google2FA::class);
        $this->app->instance(Google2FA::class, $this->google2FAMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Helper to create a user with 2FA disabled
     */
    private function createUserWithout2FA(): User
    {
        return User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);
    }

    /**
     * Helper to create a user with 2FA in setup phase
     */
    private function createUserWithPending2FA(): User
    {
        return User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'two_factor_secret' => Crypt::encryptString('JBSWY3DPEHPK3PXP'),
            'two_factor_confirmed_at' => null,
            'two_factor_enabled_at' => null,
        ]);
    }

    /**
     * Helper to create a user with fully enabled 2FA
     */
    private function createUserWithEnabled2FA(): User
    {
        return User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'two_factor_secret' => Crypt::encryptString('JBSWY3DPEHPK3PXP'),
            'two_factor_confirmed_at' => now(),
            'two_factor_enabled_at' => now(),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode(['CODE1', 'CODE2'])),
        ]);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_show_method_for_user_without_2fa()
    {
        $user = $this->createUserWithout2FA();
        $this->actingAs($user);

        $response = $this->get('/settings/two-factor');

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/settings/two-factor')
                ->where('twoFactorEnabled', false)
                ->where('requiresConfirmation', false)
                ->where('initialSetupData', null);
        });
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_show_method_for_user_with_pending_2fa()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock QR code generation
        $this->mockGoogle2FAForQRCode();

        $response = $this->get('/settings/two-factor');

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/settings/two-factor')
                ->where('twoFactorEnabled', false)
                ->where('requiresConfirmation', true)
                ->where('initialSetupData', function ($data) {
                    return isset($data['qrCodeSvg']) && isset($data['manualSetupKey']);
                });
        });
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_enable_2fa_successfully()
    {
        $user = $this->createUserWithout2FA();
        $this->actingAs($user);

        // Mock secret generation
        $this->mockGoogle2FAForEnable();

        $response = $this->post('/settings/two-factor/enable');

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHas('qrCodeSvg');
        $response->assertSessionHas('manualSetupKey');

        // Verify database was updated
        $user->refresh();
        $this->assertNotNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_confirmed_at);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_cannot_enable_2fa_when_already_enabled()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user);

        $response = $this->post('/settings/two-factor/enable');

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertStringContainsString('already enabled', session('error'));
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_confirm_2fa_with_valid_code()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock successful verification
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->with('JBSWY3DPEHPK3PXP', '123456', 2)
            ->andReturn(true);

        $response = $this->post('/settings/two-factor/confirm', [
            'code' => '123456',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHas('recoveryCodes');
        $response->assertSessionHas('showRecoveryCodes', true);

        // Verify 2FA was fully enabled
        $user->refresh();
        $this->assertNotNull($user->two_factor_confirmed_at);
        $this->assertNotNull($user->two_factor_enabled_at);
        $this->assertNotNull($user->two_factor_recovery_codes);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_confirm_2fa_with_invalid_code()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock failed verification
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->with('JBSWY3DPEHPK3PXP', '000000', 2)
            ->andReturn(false);

        $response = $this->post('/settings/two-factor/confirm', [
            'code' => '000000',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertStringContainsString('Invalid verification code', session('error'));

        // Verify 2FA was not enabled
        $user->refresh();
        $this->assertNull($user->two_factor_confirmed_at);
    }

    /**
     * @test
     * @group two-factor
     * @security Tests rate limiting on confirmation attempts
     */
    public function it_rate_limits_failed_confirmation_attempts()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock failed verifications
        $this->google2FAMock->shouldReceive('verifyKey')
            ->times(6)
            ->andReturn(false);

        // Make 6 attempts (exceeds limit of 5)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post('/settings/two-factor/confirm', [
                'code' => '000000',
            ]);
        }

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertStringContainsString('Too many failed attempts', session('error'));
    }

    /**
     * @test
     * @group two-factor
     * @security Tests that secrets are never exposed
     */
    public function it_does_not_expose_secret_in_response()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user);

        $response = $this->get('/settings/two-factor');

        $response->assertStatus(200);
        $response->assertDontSee('JBSWY3DPEHPK3PXP');
        $response->assertViewMissing('two_factor_secret');
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_disable_2fa_with_valid_password()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user);

        $response = $this->post('/settings/two-factor/disable', [
            'password' => 'password123',
            'reason' => 'Testing disable functionality',
            'confirmation' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify 2FA was disabled
        $user->refresh();
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertNull($user->two_factor_enabled_at);
    }

    /**
     * @test
     * @group two-factor
     * @security Tests password confirmation requirement
     */
    public function it_requires_password_for_disabling_2fa()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user);

        $response = $this->post('/settings/two-factor/disable', [
            'reason' => 'Test disable',
            'confirmation' => true,
        ]);

        $response->assertSessionHasErrors(['password']);
        
        // Verify 2FA was not disabled
        $user->refresh();
        $this->assertNotNull($user->two_factor_secret);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_cancel_setup_with_valid_password()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        $response = $this->post('/settings/two-factor/cancel-setup', [
            'password' => 'password123',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify setup was cancelled
        $user->refresh();
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_confirmed_at);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_regenerate_recovery_codes()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user);

        $oldCodes = $user->two_factor_recovery_codes;

        $response = $this->post('/settings/two-factor/regenerate-recovery-codes', [
            'password' => 'password123',
            'confirm_regenerate' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHas('recoveryCodes');
        $response->assertSessionHas('showRecoveryCodes', true);

        // Verify codes were regenerated
        $user->refresh();
        $this->assertNotEquals($oldCodes, $user->two_factor_recovery_codes);
    }

    /**
     * @test
     * @group two-factor
     * @security Tests that recovery codes are properly hashed
     */
    public function it_hashes_recovery_codes()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock successful verification
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->andReturn(true);

        $response = $this->post('/settings/two-factor/confirm', [
            'code' => '123456',
        ]);

        $user->refresh();

        // Verify hashed codes exist
        $this->assertNotNull($user->two_factor_recovery_codes_hashed);
        
        $hashedCodes = json_decode($user->two_factor_recovery_codes_hashed, true);
        $this->assertIsArray($hashedCodes);
        
        // Verify each code is properly hashed
        foreach ($hashedCodes as $hash) {
            $this->assertTrue(password_get_info($hash)['algo'] > 0);
        }
    }

    /**
     * @test
     * @group two-factor
     * @security Tests input validation for code format
     */
    public function it_validates_code_format_strictly()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        $invalidCodes = [
            '12345',     // Too short
            '1234567',   // Too long
            'abcdef',    // Letters
            '123 456',   // Space
            '12-456',    // Special char
            '12.456',    // Decimal
            'ABCDEF',    // Uppercase letters
        ];

        foreach ($invalidCodes as $code) {
            $response = $this->post('/settings/two-factor/confirm', [
                'code' => $code,
            ]);

            $response->assertSessionHasErrors(['code']);
        }
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_verify_code_api_endpoint()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user, 'api'); // Use API guard

        // Mock successful verification
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->with('JBSWY3DPEHPK3PXP', '123456', 2)
            ->andReturn(true);

        $response = $this->postJson('/api/settings/two-factor/verify', [
            'code' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Code verified successfully.'
            ]);

        // Verify last used timestamp was updated
        $user->refresh();
        $this->assertNotNull($user->two_factor_last_used_at);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_get_recovery_codes_api_endpoint()
    {
        $user = $this->createUserWithEnabled2FA();
        $this->actingAs($user, 'api');

        // Simulate recent password confirmation
        session(['auth.password_confirmed_at' => time()]);

        $response = $this->getJson('/api/settings/two-factor/recovery-codes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'recoveryCodes',
                    'remaining',
                ]
            ]);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_logs_are_written_for_security_events()
    {
        Log::shouldReceive('info')->once()->withArgs(function ($message, $context) {
            return $message === '2FA enabled successfully' &&
                   isset($context['user_id']);
        });

        Log::shouldReceive('warning')->never();

        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        // Mock successful verification
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->andReturn(true);

        $this->post('/settings/two-factor/confirm', [
            'code' => '123456',
        ]);
    }

    /**
     * @test
     * @group two-factor
     * @security Tests that secrets are not logged
     */
    public function test_secrets_are_not_logged()
    {
        Log::shouldReceive('info')->withAnyArgs()->andReturnNull();
        Log::shouldReceive('warning')->withAnyArgs()->andReturnNull();
        
        // Verify no log calls contain the secret
        Log::shouldReceive('info')->andReturnUsing(function ($message, $context) {
            $contextStr = json_encode($context);
            $this->assertStringNotContainsString('JBSWY3DPEHPK3PXP', $contextStr);
            $this->assertStringNotContainsString('secret', strtolower($contextStr));
            return null;
        });

        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->andReturn(true);

        $this->post('/settings/two-factor/confirm', [
            'code' => '123456',
        ]);
    }

    /**
     * @test
     * @group two-factor
     */
    public function test_throttle_resets_after_successful_confirmation()
    {
        $user = $this->createUserWithPending2FA();
        $this->actingAs($user);

        $throttleKey = "2fa_throttle:{$user->id}:confirm_2fa";

        // First, make some failed attempts
        $this->google2FAMock->shouldReceive('verifyKey')
            ->times(2)
            ->andReturn(false);

        $this->post('/settings/two-factor/confirm', ['code' => '000000']);
        $this->post('/settings/two-factor/confirm', ['code' => '000000']);

        // Verify attempts were recorded
        $this->assertEquals(2, Cache::get($throttleKey));

        // Now succeed
        $this->google2FAMock->shouldReceive('verifyKey')
            ->once()
            ->andReturn(true);

        $this->post('/settings/two-factor/confirm', ['code' => '123456']);

        // Verify attempts were cleared
        $this->assertNull(Cache::get($throttleKey));
    }

    // Mock Helpers

    private function mockGoogle2FAForQRCode()
    {
        $this->google2FAMock->shouldReceive('getQRCodeUrl')
            ->once()
            ->andReturn('otpauth://totp/test');
    }

    private function mockGoogle2FAForEnable()
    {
        $this->google2FAMock->shouldReceive('generateSecretKey')
            ->once()
            ->andReturn('JBSWY3DPEHPK3PXP');
        
        $this->google2FAMock->shouldReceive('getQRCodeUrl')
            ->once()
            ->andReturn('otpauth://totp/test');
    }
}