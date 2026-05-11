<?php

namespace Tests\Feature;

use App\Services\BackupService;
use Tests\TestCase;

class BackupCommandTest extends TestCase
{

    public function test_backup_command_calls_service_and_exits_successfully(): void
    {
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andReturn([
                'filename'       => 'hapag_backup_2026-05-11_07-00-00.sql',
                'path'           => '/tmp/hapag_backup_2026-05-11_07-00-00.sql',
                'last_backup_at' => '2026-05-11 07:00:00',
            ]);
        });

        $this->artisan('backup:database')
             ->expectsOutput('Backup complete: hapag_backup_2026-05-11_07-00-00.sql')
             ->assertExitCode(0);
    }

    public function test_backup_command_exits_with_failure_on_exception(): void
    {
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andThrow(
                new \RuntimeException('mysqldump failed: Access denied')
            );
        });

        $this->artisan('backup:database')
             ->expectsOutput('Backup failed: mysqldump failed: Access denied')
             ->assertExitCode(1);
    }

    public function test_backup_command_handles_unexpected_exceptions(): void
    {
        $this->mock(BackupService::class, function ($mock) {
            $mock->shouldReceive('run')->once()->andThrow(
                new \LogicException('Invalid process configuration')
            );
        });

        $this->artisan('backup:database')
             ->expectsOutput('Backup failed: Invalid process configuration')
             ->assertExitCode(1);
    }
}
