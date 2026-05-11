<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupService
{
    public function run(): array
    {
        $cfg = config('database.connections.mysql');

        $filename  = 'hapag_backup_' . now()->format('Y-m-d_H-i-s') . '.sql';

        Storage::disk('local')->makeDirectory('backups');

        $mysqldump = config('backup.mysqldump_path');
        $password  = $cfg['password'] ?? '';

        $cmd = [
            $mysqldump,
            '--host='  . ($cfg['host']     ?? '127.0.0.1'),
            '--port='  . ($cfg['port']     ?? '3306'),
            '--user='  . ($cfg['username'] ?? 'root'),
        ];

        if ($password !== '') {
            $cmd[] = '--password=' . $password;
        }

        $cmd[] = $cfg['database'];

        $process = new Process($cmd);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException('mysqldump failed: ' . $process->getErrorOutput());
        }

        $output = $process->getOutput();

        if (trim($output) === '') {
            throw new \RuntimeException('mysqldump produced empty output. Backup aborted.');
        }

        $filePath = Storage::disk('local')->path('backups/' . $filename);

        $written = file_put_contents($filePath, $output);

        if ($written === false) {
            throw new \RuntimeException('Failed to write backup file: ' . $filePath);
        }

        $now = now()->toDateTimeString();

        DB::transaction(function () use ($now, $filename) {
            DB::table('system_settings')->updateOrInsert(
                ['key' => 'last_backup_at'],
                ['value' => $now]
            );

            DB::table('system_settings')->updateOrInsert(
                ['key' => 'last_backup_file'],
                ['value' => $filename]
            );
        });

        return [
            'filename'       => $filename,
            'path'           => $filePath,
            'last_backup_at' => $now,
        ];
    }
}
