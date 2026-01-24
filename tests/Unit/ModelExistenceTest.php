<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resident;
use PHPUnit\Framework\Attributes\Test;

class ModelExistenceTest extends TestCase
{
    #[Test]
    public function user_model_exists(): void
    {
        $this->assertTrue(class_exists(User::class));
    }

    #[Test]
    public function resident_model_exists(): void
    {
        $this->assertTrue(class_exists(Resident::class));
    }
    
    #[Test]
    public function can_create_user_instance(): void
    {
        $user = new User();
        $this->assertInstanceOf(User::class, $user);
    }
    
    #[Test]
    public function can_create_resident_instance(): void
    {
        $resident = new Resident();
        $this->assertInstanceOf(Resident::class, $resident);
    }
}