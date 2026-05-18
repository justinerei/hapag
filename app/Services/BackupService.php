<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    public function run(): array
    {
        $filename = 'hapag_backup_' . now()->format('Y-m-d_H-i-s') . '.sql';

        Storage::disk('local')->makeDirectory('backups');

        $lines   = [];
        $lines[] = '-- Hapag database backup';
        $lines[] = '-- Generated: ' . now()->toDateTimeString();
        $lines[] = '';
        $lines[] = 'SET FOREIGN_KEY_CHECKS=0;';
        $lines[] = '';

        // Get the raw PDO connection for proper SQL escaping via PDO::quote()
        $pdo    = DB::connection()->getPdo();
        $tables = DB::select('SHOW TABLES');
        $dbName = config('database.connections.mysql.database');
        $tableKey = 'Tables_in_' . $dbName;

        foreach ($tables as $row) {
            $table = $row->$tableKey;

            $createRow = DB::select("SHOW CREATE TABLE `{$table}`");
            $createSql = $createRow[0]->{'Create Table'};

            $lines[] = "DROP TABLE IF EXISTS `{$table}`;";
            $lines[] = $createSql . ';';
            $lines[] = '';

            $rows = DB::table($table)->get();

            if ($rows->isEmpty()) {
                continue;
            }

            $columns = array_map(
                fn($col) => '`' . $col . '`',
                array_keys((array) $rows->first())
            );
            $columnList = implode(', ', $columns);

            $insertLines = [];
            foreach ($rows as $record) {
                $values = array_map(function ($value) use ($pdo) {
                    if ($value === null) {
                        return 'NULL';
                    }
                    // PDO::quote() handles all edge cases including multibyte
                    // characters and binary data — safer than addslashes()
                    return $pdo->quote((string) $value);
                }, (array) $record);

                $insertLines[] = '(' . implode(', ', $values) . ')';
            }

            $lines[] = "INSERT INTO `{$table}` ({$columnList}) VALUES";
            $lastIdx = count($insertLines) - 1;
            foreach ($insertLines as $i => $valueLine) {
                $lines[] = $valueLine . ($i === $lastIdx ? ';' : ',');
            }
            $lines[] = '';
        }

        $lines[] = 'SET FOREIGN_KEY_CHECKS=1;';

        $output = implode("\n", $lines);

        $filePath = Storage::disk('local')->path('backups/' . $filename);
        $written  = file_put_contents($filePath, $output);

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