<?php

namespace Tests;

use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Assert;

abstract class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        TestResponse::macro('assertInertia', function (callable $assert = null) {
            /** @var TestResponse $this */
            
            // Check if it's an Inertia response
            Assert::assertArrayHasKey('x-inertia', $this->headers->all());
            Assert::assertEquals('true', $this->headers->get('x-inertia'));
            
            $page = json_decode(json_encode($this->original), true);
            
            if ($assert) {
                $assert($page);
            }
            
            return $this;
        });
        
        TestResponse::macro('assertInertiaComponent', function (string $component) {
            /** @var TestResponse $this */
            return $this->assertInertia(function ($page) use ($component) {
                Assert::assertEquals($component, $page['component']);
            });
        });
    }
}