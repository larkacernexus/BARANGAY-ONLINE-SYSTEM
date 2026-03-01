<?php
// database/migrations/2024_01_01_000045_create_residents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            
            $table->string('resident_id')->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable()->comment('Jr., Sr., III, etc.');
            
            $table->date('birth_date')->nullable();
            $table->integer('age')->nullable();
            $table->string('gender')->nullable()->comment('Male, Female, Other');
            $table->string('civil_status')->nullable()->comment('Single, Married, Widowed, Divorced, Separated');
            
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            
            $table->foreignId('purok_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('household_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('occupation')->nullable();
            $table->string('education')->nullable()->comment('Elementary, High School, College, Vocational, etc.');
            $table->string('religion')->nullable();
            
            // Special classifications
            $table->boolean('is_voter')->default(false);
            $table->boolean('is_pwd')->default(false);
            $table->boolean('is_senior')->default(false);
            $table->boolean('is_solo_parent')->default(false);
            $table->boolean('is_indigent')->default(false);
            
            // ID numbers for special classifications
            $table->string('senior_id_number')->nullable();
            $table->string('pwd_id_number')->nullable();
            $table->string('solo_parent_id_number')->nullable();
            $table->string('indigent_id_number')->nullable();
            
            $table->json('discount_eligibilities')->nullable();
            
            $table->string('place_of_birth')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('active')->comment('active, inactive, deceased');
            
            $table->string('photo_path')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('resident_id');
            $table->index(['first_name', 'last_name']);
            $table->index('last_name');
            $table->index('birth_date');
            $table->index('gender');
            $table->index('civil_status');
            $table->index('purok_id');
            $table->index('household_id');
            $table->index('is_voter');
            $table->index('is_pwd');
            $table->index('is_senior');
            $table->index('is_solo_parent');
            $table->index('is_indigent');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('residents');
    }
};