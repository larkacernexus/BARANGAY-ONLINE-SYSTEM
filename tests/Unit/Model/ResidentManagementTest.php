<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\Purok;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ResidentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    /** @test */
    public function admin_can_view_residents_index()
    {
        Resident::factory()->count(5)->create();
        
        $response = $this->get(route('residents.index'));
        
        $response->assertOk();
        $response->assertViewHas('residents');
        $response->assertSeeText('Residents');
    }

    /** @test */
    public function admin_can_create_resident()
    {
        $purok = Purok::factory()->create();
        
        $data = [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'middle_name' => 'Santos',
            'birth_date' => '1990-05-15',
            'gender' => 'Male',
            'civil_status' => 'Single',
            'contact_number' => '09123456789',
            'email' => 'juan@example.com',
            'address' => '123 Main St',
            'purok_id' => $purok->id,
            'occupation' => 'Engineer',
            'is_voter' => true,
            'is_pwd' => false,
            'status' => 'active',
        ];
        
        $response = $this->post(route('residents.store'), $data);
        
        $response->assertRedirect(route('residents.index'));
        $this->assertDatabaseHas('residents', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan@example.com',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_resident()
    {
        $response = $this->post(route('residents.store'), []);
        
        $response->assertSessionHasErrors([
            'first_name',
            'last_name',
            'birth_date',
            'gender',
        ]);
    }

    /** @test */
    public function admin_can_update_resident()
    {
        $resident = Resident::factory()->create(['first_name' => 'Old Name']);
        $newPurok = Purok::factory()->create();
        
        $data = [
            'first_name' => 'Updated Name',
            'last_name' => $resident->last_name,
            'birth_date' => $resident->birth_date->format('Y-m-d'),
            'gender' => $resident->gender,
            'purok_id' => $newPurok->id,
        ];
        
        $response = $this->put(route('residents.update', $resident->id), $data);
        
        $response->assertRedirect(route('residents.index'));
        $this->assertDatabaseHas('residents', [
            'id' => $resident->id,
            'first_name' => 'Updated Name',
            'purok_id' => $newPurok->id,
        ]);
    }

    /** @test */
    public function admin_can_delete_resident()
    {
        $resident = Resident::factory()->create();
        
        $response = $this->delete(route('residents.destroy', $resident->id));
        
        $response->assertRedirect(route('residents.index'));
        $this->assertSoftDeleted('residents', ['id' => $resident->id]);
        // Or if not using soft deletes:
        // $this->assertDatabaseMissing('residents', ['id' => $resident->id]);
    }

    /** @test */
    public function it_can_upload_photo()
    {
        Storage::fake('public');
        
        $resident = Resident::factory()->create();
        $file = UploadedFile::fake()->image('resident-photo.jpg');
        
        $response = $this->patch(route('residents.upload-photo', $resident->id), [
            'photo' => $file,
        ]);
        
        $response->assertRedirect();
        $this->assertNotNull($resident->fresh()->photo_path);
        Storage::disk('public')->assertExists($resident->fresh()->photo_path);
    }
}