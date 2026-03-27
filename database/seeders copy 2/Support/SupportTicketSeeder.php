<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupportTicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding support tickets...');
        
        $residents = DB::table('residents')->get();
        $categories = DB::table('support_categories')->get()->keyBy('slug');
        $user = DB::table('users')->where('username', 'resident1')->first();
        $resident = $residents->where('user_id', $user->id ?? null)->first();
        
        $tickets = [
            [
                'subject' => 'Cannot login to account',
                'category_slug' => 'account-issues',
                'message' => 'I forgot my password and cannot reset it.',
                'priority' => 'high',
            ],
            [
                'subject' => 'Request for Barangay Clearance',
                'category_slug' => 'document-request',
                'message' => 'I need a barangay clearance for employment purposes.',
                'priority' => 'medium',
            ],
            [
                'subject' => 'Payment receipt not received',
                'category_slug' => 'payment-issues',
                'message' => 'I paid my clearance fee but haven\'t received the receipt.',
                'priority' => 'medium',
            ],
        ];
        
        $createdCount = 0;
        
        if ($resident) {
            foreach ($tickets as $ticket) {
                $category = $categories[$ticket['category_slug']] ?? null;
                
                if ($category) {
                    DB::table('support_tickets')->insert([
                        'resident_id' => $resident->id,
                        'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                        'subject' => $ticket['subject'],
                        'category' => $category->name,
                        'priority' => $ticket['priority'],
                        'message' => $ticket['message'],
                        'status' => 'open',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $createdCount++;
                }
            }
        }
        
        $this->command->info('✅ Seeded ' . $createdCount . ' support tickets');
    }
}