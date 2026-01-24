<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;

class UserTest extends TestCase
{
    #[Test]
    public function user_has_full_name_attribute(): void
    {
        $user = new User();
        $user->first_name = 'John';
        $user->last_name = 'Doe';
        
        $this->assertEquals('John Doe', $user->full_name);
    }

    #[Test]
    public function user_has_correct_fillable_attributes(): void
    {
        $user = new User();
        
        $expectedFillable = [
            'first_name',
            'last_name',
            'email',
            'username',
            'contact_number',
            'position',
            'role_id',
            'status',
            'password',
            'email_verified_at',
            'require_password_change',
            'password_changed_at',
            'two_factor_secret',
            'two_factor_recovery_codes',
            'two_factor_confirmed_at',
            'two_factor_enabled_at',
            'two_factor_last_used_at',
            'two_factor_used_recovery_codes',
            'remember_token',
            'last_login_at',
            'last_login_ip',
            'login_count',
            'current_login_ip',
            'last_logout_at',
            'last_login_device',
            'last_login_browser',
            'failed_login_attempts',
            'last_failed_login_at',
            'account_locked_until',
        ];
        
        $this->assertEquals($expectedFillable, $user->getFillable());
    }

    #[Test]
    public function user_password_is_hashed_when_casted(): void
    {
        $user = new User();
        $casts = $user->getCasts();
        
        $this->assertArrayHasKey('password', $casts);
        $this->assertEquals('hashed', $casts['password']);
    }

    #[Test]
    public function user_has_boolean_and_datetime_casts(): void
    {
        $user = new User();
        $casts = $user->getCasts();
        
        $this->assertEquals('boolean', $casts['require_password_change']);
        $this->assertEquals('datetime', $casts['email_verified_at']);
        $this->assertEquals('datetime', $casts['last_login_at']);
        $this->assertEquals('integer', $casts['login_count']);
    }

    #[Test]
    public function user_is_administrator_check(): void
    {
        $user = new User();
        
        // Mock role relationship or test with actual role
        // This is a simple test
        $this->assertIsBool($user->isAdministrator());
    }

    #[Test]
    public function user_is_active_check(): void
    {
        $user = new User();
        $user->status = 'active';
        
        $this->assertTrue($user->isActive());
        
        $user->status = 'inactive';
        $this->assertFalse($user->isActive());
    }

    #[Test]
    public function user_has_permission_check_methods(): void
    {
        $user = new User();
        
        // These methods should exist
        $this->assertTrue(method_exists($user, 'hasPermission'));
        $this->assertTrue(method_exists($user, 'hasAnyPermission'));
        $this->assertTrue(method_exists($user, 'hasAllPermissions'));
        $this->assertTrue(method_exists($user, 'hasRole'));
        $this->assertTrue(method_exists($user, 'hasAnyRole'));
    }
}