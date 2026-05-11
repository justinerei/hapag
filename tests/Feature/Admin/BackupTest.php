<?php

namespace Tests\Feature\Admin;

use App\Http\Controllers\AdminController;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Tests\TestCase;

class BackupTest extends TestCase
{
    // ── POST /admin/backup ───────────────────────────────────────────────────────

    public function test_backup_returns_json_with_filename_on_success(): void
    {
        // Mock the BackupService
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andReturn([
                'filename'       => 'hapag_backup_2026-05-11_07-00-00.sql',
                'path'           => '/tmp/hapag_backup_2026-05-11_07-00-00.sql',
                'last_backup_at' => '2026-05-11 07:00:00',
            ]);
        });

        // Create the controller and call backup method directly
        $controller = new AdminController();
        $backupService = $this->app->make(BackupService::class);

        // Call the backup method with the mocked service (injected via container)
        $response = $controller->backup($backupService);

        // Verify the response
        $this->assertEquals(200, $response->status());
        $data = json_decode($response->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertEquals('hapag_backup_2026-05-11_07-00-00.sql', $data['filename']);
        $this->assertEquals('2026-05-11 07:00:00', $data['last_backup_at']);
        $this->assertEquals('hapag_backup_2026-05-11_07-00-00.sql', $data['last_backup_file']);
    }

    public function test_backup_returns_500_when_service_throws(): void
    {
        // Mock the BackupService to throw an exception
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andThrow(
                new \RuntimeException('mysqldump failed: No such file')
            );
        });

        // Create the controller and call backup method directly
        $controller = new AdminController();
        $backupService = $this->app->make(BackupService::class);

        // Call the backup method with the mocked service (injected via container)
        $response = $controller->backup($backupService);

        // Verify the error response
        $this->assertEquals(500, $response->status());
        $data = json_decode($response->getContent(), true);
        $this->assertFalse($data['success']);
        $this->assertNotEmpty($data['message']);
        $this->assertStringContainsString('mysqldump failed', $data['message']);
    }
}
