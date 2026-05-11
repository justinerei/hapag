# Database Backup System — Design Spec
**Date:** 2026-05-11
**Project:** Hapag (Laravel 11 / React + Inertia)
**Status:** Approved

---

## Overview

Implement a fully working database backup system with three capabilities:
1. **Manual backup** — admin triggers from the dashboard, gets an immediate file download.
2. **Automated daily backup** — Laravel scheduler runs `php artisan backup:database` at 07:00.
3. **Backup list + per-file download** — admin can see and download all past backups.

No third-party packages. Native Laravel + mysqldump only.

---

## Architecture

### BackupService (`app/Services/BackupService.php`)

Single shared class used by both the controller and the Artisan command. Contains one public method:

```
BackupService::run(): array
```

**Responsibilities:**
- Read DB credentials from `config('database.connections.mysql')` (host, port, database, username, password). Never hardcode.
- Read `MYSQLDUMP_PATH` from `.env` — defaults to `"mysqldump"` (works on Linux/CI where it is in PATH). On this Laragon machine, `.env` must set:
  ```
  MYSQLDUMP_PATH=C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe
  ```
- Build timestamped filename: `hapag_backup_2026-05-11_07-00-00.sql`
- Ensure `storage/app/backups/` exists via `Storage::makeDirectory('backups')`.
- Run the dump using Symfony `Process` (already in Laravel vendor). Do not use raw `exec()`.
- On failure: throw `\RuntimeException` with captured stderr.
- On success:
  - Persist `last_backup_at` and `last_backup_file` to `system_settings` using `DB::table('system_settings')->updateOrInsert(['key' => ...], ['value' => ...])` — handles the case where the keys don't exist yet.
  - Return `['filename' => ..., 'path' => ..., 'last_backup_at' => ...]`.

The mysqldump command format:
```
mysqldump --host={host} --port={port} --user={user} --password={pass} {database}
```
Output is captured by Process and written to the `.sql` file. The password is passed directly in the command string (`--password={pass}`). `MYSQL_PWD` is a Linux-only env var trick — it is not supported on Windows/Laragon and must not be used here.

---

### Artisan Command (`app/Console/Commands/BackupDatabase.php`)

**Signature:** `backup:database`
**Description:** "Run a full MySQL database backup."

- Instantiates `BackupService` and calls `run()`.
- On success: `Log::info("Backup succeeded: {filename}")` and `$this->info(...)`.
- On failure (caught `RuntimeException`): `Log::error(...)`, `$this->error(...)`, exit code 1.

**Scheduler registration** in `routes/console.php`:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:database')->dailyAt('07:00');
```

---

### AdminController changes

#### `backup()` — rewritten
- Instantiates `BackupService`, calls `run()`.
- Returns JSON: `{ success: true, filename, last_backup_at, last_backup_file }`.
- On `RuntimeException`: returns `response()->json(['success' => false, 'message' => $e->getMessage()], 500)`.

#### `listBackups()` — new
- Lists all files in `storage/app/backups/` via `Storage::disk('local')->files('backups')`.
- Filters to `.sql` files only.
- Maps each to `{ filename, size_kb, created_at }` using `Storage::lastModified()`.
- Returns sorted descending by `created_at` as JSON.

#### `downloadBackup(string $filename)` — new
- Validates `$filename` against regex `/^hapag_backup_[\d_\-]+\.sql$/` — rejects anything containing `/`, `..`, or unexpected characters.
- Returns 404 if the file does not exist in `storage/app/backups/`.
- Returns `Storage::disk('local')->download("backups/{$filename}")`.

---

### Routes (inside existing `role:admin` middleware group)

```php
// Already exists — no change:
Route::post('/backup', [AdminController::class, 'backup'])->name('backup');

// New:
Route::get('/backups',            [AdminController::class, 'listBackups'])   ->name('backups.list');
Route::get('/backups/{filename}', [AdminController::class, 'downloadBackup'])->name('backups.download');
```

---

### Dashboard.jsx changes

#### `handleBackup()` update
After a successful POST, the response includes `filename`. Auto-trigger download:
```js
window.open(route('admin.backups.download', { filename: data.filename }), '_blank');
```
After the download is triggered, re-fetch the backup list so the new file appears immediately.

#### `BackupSection` component update
- Accept a `backups` prop (array of `{ filename, size_kb, created_at }`).
- On mount (when `activeSection === 'backup'`), `GET /admin/backups` to populate the list.
- Each row displays: filename | size | date | **Download** button linking to `/admin/backups/{filename}`.
- After a manual backup completes, refresh the list.

---

## Data Flow

```
Admin clicks "Run backup now"
  → POST /admin/backup
    → AdminController@backup
      → BackupService::run()
        → Symfony Process runs mysqldump
        → Writes .sql to storage/app/backups/
        → Updates system_settings (last_backup_at, last_backup_file)
        → Returns { filename, last_backup_at }
      → Returns JSON { success, filename, last_backup_at, last_backup_file }
  → Frontend updates UI state (lastBackup, backupFile)
  → window.open('/admin/backups/{filename}') → file download
  → Re-fetches GET /admin/backups → list refreshes
```

```
Laravel Scheduler (07:00 daily)
  → php artisan backup:database
    → BackupService::run()
      → same logic as above
    → Log::info / Log::error to storage/logs/laravel.log
```

---

## Security

- **Path traversal prevention:** `downloadBackup` validates filename with a strict regex before constructing the storage path. No user input reaches `Storage::download()` unvalidated.
- **Credentials:** DB password passed directly in the command string (`--password=`). This is acceptable for a local Laragon dev environment. `MYSQL_PWD` is not supported on Windows and is not used.
- **Admin-only:** All backup routes are inside the `['auth', 'role:admin']` middleware group. No new middleware needed.

---

## Files Touched

| Action | File |
|--------|------|
| Create | `app/Services/BackupService.php` |
| Create | `app/Console/Commands/BackupDatabase.php` |
| Edit   | `app/Http/Controllers/AdminController.php` |
| Edit   | `routes/web.php` |
| Edit   | `routes/console.php` |
| Edit   | `resources/js/Pages/Admin/Dashboard.jsx` |
| Edit   | `.env` (manual — add `MYSQLDUMP_PATH`) |

---

## Out of Scope

- Compression (`.sql.gz`) — not requested.
- Email notification on scheduled backup — not requested.
- Backup retention/cleanup — not requested.
- Remote storage (S3, etc.) — not requested.
