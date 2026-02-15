<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->boolean('requires_account')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default positions
        DB::table('positions')->insert([
            [
                'code' => 'captain',
                'name' => 'Barangay Captain',
                'description' => 'Head of the barangay',
                'order' => 1,
                'role_id' => 2, // Barangay Captain role
                'requires_account' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'kagawad',
                'name' => 'Barangay Kagawad',
                'description' => 'Barangay council member',
                'order' => 2,
                'role_id' => 4, // Records Clerk role
                'requires_account' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'secretary',
                'name' => 'Barangay Secretary',
                'description' => 'Handles barangay records and documentation',
                'order' => 3,
                'role_id' => 4, // Records Clerk role
                'requires_account' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'treasurer',
                'name' => 'Barangay Treasurer',
                'description' => 'Manages barangay finances',
                'order' => 4,
                'role_id' => 3, // Treasury Officer role
                'requires_account' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'sk_chairman',
                'name' => 'SK Chairman',
                'description' => 'Sangguniang Kabataan Chairman',
                'order' => 5,
                'role_id' => 4, // Records Clerk role
                'requires_account' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'sk_kagawad',
                'name' => 'SK Kagawad',
                'description' => 'Sangguniang Kabataan Council Member',
                'order' => 6,
                'role_id' => 4, // Records Clerk role
                'requires_account' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'secretary_treasurer',
                'name' => 'Secretary-Treasurer',
                'description' => 'Combined secretary and treasurer role',
                'order' => 7,
                'role_id' => 4, // Records Clerk role
                'requires_account' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};