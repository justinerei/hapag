<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    // ── POST /admin/backup ───────────────────────────────────────────────────────

    public function test_backup_returns_json_with_filename_on_success(): void
    {
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andReturn([
                'filename'       => 'hapag_backup_2026-05-11_07-00-00.sql',
                'path'           => '/tmp/hapag_backup_2026-05-11_07-00-00.sql',
                'last_backup_at' => '2026-05-11 07:00:00',
            ]);
        });

        $this->actingAs($this->adminUser())
             ->postJson('/admin/backup')
             ->assertOk()
             ->assertJsonPath('success', true)
             ->assertJsonPath('filename', 'hapag_backup_2026-05-11_07-00-00.sql')
             ->assertJsonPath('last_backup_at', '2026-05-11 07:00:00')
             ->assertJsonPath('last_backup_file', 'hapag_backup_2026-05-11_07-00-00.sql');
    }

    public function test_backup_returns_500_when_service_throws(): void
    {
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andThrow(
                new \RuntimeException('mysqldump failed: No such file')
            );
        });

        $this->actingAs($this->adminUser())
             ->postJson('/admin/backup')
             ->assertStatus(500)
             ->assertJsonPath('success', false)
             ->assertJsonStructure(['message']);
    }

    public function test_backup_requires_admin_role(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
             ->postJson('/admin/backup')
             ->assertForbidden();
    }
}
