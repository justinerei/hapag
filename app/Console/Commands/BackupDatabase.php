<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackupDatabase extends Command
{
    protected $signature   = 'backup:database';
    protected $description = 'Run a full MySQL database backup.';

    public function handle(BackupService $service): int
    {
        try {
            $result = $service->run();
            Log::info('Backup succeeded: ' . $result['filename']);
            $this->info('Backup complete: ' . $result['filename']);
            return self::SUCCESS;
        } catch (\RuntimeException $e) {
            Log::error('Backup failed: ' . $e->getMessage());
            $this->error('Backup failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
