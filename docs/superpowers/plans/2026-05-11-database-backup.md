# Database Backup System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement manual backup (POST → JSON + auto-download), a scheduled daily `php artisan backup:database` command, and a backup-list UI with per-file download buttons — all using native Laravel + mysqldump, no packages.

**Architecture:** A `BackupService` class holds all mysqldump logic and is shared by both the Artisan command and `AdminController`. The controller's `backup()` returns JSON (not a file stream); the frontend triggers the file download separately via `window.open`. The backup list is loaded client-side on demand via `GET /admin/backups`.

**Tech Stack:** Laravel 11 (PHP 8.2), Symfony Process (bundled in Laravel vendor), MySQL 8.4 via Laragon, React 18 + Inertia.js, PHPUnit (Laravel feature tests).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `app/Services/BackupService.php` | mysqldump execution, storage, system_settings persistence |
| Create | `app/Console/Commands/BackupDatabase.php` | Artisan wrapper around BackupService |
| Create | `tests/Feature/BackupCommandTest.php` | Tests for Artisan command (success + failure) |
| Create | `tests/Feature/Admin/BackupTest.php` | Tests for all three controller backup routes |
| Modify | `app/Http/Controllers/AdminController.php` | Rewrite `backup()`, add `listBackups()`, `downloadBackup()` |
| Modify | `routes/web.php` | Add GET /admin/backups and GET /admin/backups/{filename} |
| Modify | `routes/console.php` | Register daily scheduler |
| Modify | `resources/js/Pages/Admin/Dashboard.jsx` | `backups` state, `fetchBackups`, updated `handleBackup`, updated `BackupSection` |
| Edit   | `.env` | Add MYSQLDUMP_PATH |

---

## Task 1: BackupService

**Files:**
- Create: `app/Services/BackupService.php`

> Note: BackupService makes a real system call (`mysqldump`), so it is verified manually in Task 8 rather than via an automated unit test. Controller and command tests mock it.

- [ ] **Step 1: Create the service**

Create `app/Services/BackupService.php` with this exact content:

```php
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
        $backupDir = storage_path('app/backups');

        Storage::disk('local')->makeDirectory('backups');

        $mysqldump = env('MYSQLDUMP_PATH', 'mysqldump');
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

        file_put_contents(
            $backupDir . DIRECTORY_SEPARATOR . $filename,
            $process->getOutput()
        );

        $now = now()->toDateTimeString();

        DB::table('system_settings')->updateOrInsert(
            ['key' => 'last_backup_at'],
            ['value' => $now]
        );

        DB::table('system_settings')->updateOrInsert(
            ['key' => 'last_backup_file'],
            ['value' => $filename]
        );

        return [
            'filename'       => $filename,
            'path'           => $backupDir . DIRECTORY_SEPARATOR . $filename,
            'last_backup_at' => $now,
        ];
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/BackupService.php
git commit -m "feat: add BackupService for mysqldump execution"
```

---

## Task 2: Artisan Command (TDD)

**Files:**
- Create: `app/Console/Commands/BackupDatabase.php`
- Create: `tests/Feature/BackupCommandTest.php`

- [ ] **Step 1: Write the failing tests**

Create `tests/Feature/BackupCommandTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupCommandTest extends TestCase
{
    use RefreshDatabase;

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
             ->assertExitCode(1);
    }
}
```

- [ ] **Step 2: Run the tests — confirm they FAIL**

```bash
php artisan test --filter BackupCommandTest
```

Expected output contains:
```
FAILED  Tests\Feature\BackupCommandTest
  Command "backup:database" is not defined.
```

- [ ] **Step 3: Create the command**

Create `app/Console/Commands/BackupDatabase.php`:

```php
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
```

- [ ] **Step 4: Run the tests — confirm they PASS**

```bash
php artisan test --filter BackupCommandTest
```

Expected:
```
Tests:  2 passed (2 assertions)
```

- [ ] **Step 5: Commit**

```bash
git add app/Console/Commands/BackupDatabase.php tests/Feature/BackupCommandTest.php
git commit -m "feat: add backup:database Artisan command"
```

---

## Task 3: Controller — `backup()` rewrite (TDD)

**Files:**
- Create: `tests/Feature/Admin/BackupTest.php`
- Modify: `app/Http/Controllers/AdminController.php`

- [ ] **Step 1: Create test file and write the failing test for `backup()`**

Create `tests/Feature/Admin/BackupTest.php`:

```php
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
}
```

- [ ] **Step 2: Run — confirm FAIL**

```bash
php artisan test --filter BackupTest
```

Expected: fails because current `backup()` calls `Artisan::call('db:backup')` which does not exist.

- [ ] **Step 3: Rewrite `AdminController@backup()`**

In `app/Http/Controllers/AdminController.php`, make these two changes:

**a) Replace the imports block** — remove `Artisan`, add `BackupService` and `Storage`:

```php
// Remove this line:
use Illuminate\Support\Facades\Artisan;

// Add these two lines:
use App\Services\BackupService;
use Illuminate\Support\Facades\Storage;
```

**b) Replace the `backup()` method** (currently lines 169–179):

```php
public function backup(BackupService $service)
{
    try {
        $result = $service->run();

        return response()->json([
            'success'          => true,
            'filename'         => $result['filename'],
            'last_backup_at'   => $result['last_backup_at'],
            'last_backup_file' => $result['filename'],
        ]);
    } catch (\RuntimeException $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
}
```

- [ ] **Step 4: Run — confirm PASS**

```bash
php artisan test --filter BackupTest
```

Expected:
```
Tests:  2 passed (7 assertions)
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/AdminController.php tests/Feature/Admin/BackupTest.php
git commit -m "feat: rewrite AdminController backup() to use BackupService"
```

---

## Task 4: Controller — `listBackups()` and `downloadBackup()` (TDD)

**Files:**
- Modify: `tests/Feature/Admin/BackupTest.php` (add new tests)
- Modify: `app/Http/Controllers/AdminController.php` (add two methods)

- [ ] **Step 1: Add tests for `listBackups()` and `downloadBackup()` to the existing test file**

Append these test methods inside the `BackupTest` class (before the closing `}`):

```php
    // ── GET /admin/backups ───────────────────────────────────────────────────────

    public function test_list_backups_returns_sql_files_as_json(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        \Illuminate\Support\Facades\Storage::disk('local')->makeDirectory('backups');
        \Illuminate\Support\Facades\Storage::disk('local')->put(
            'backups/hapag_backup_2026-05-11_07-00-00.sql', 'dump content A'
        );
        \Illuminate\Support\Facades\Storage::disk('local')->put(
            'backups/hapag_backup_2026-05-10_07-00-00.sql', 'dump content B'
        );

        $response = $this->actingAs($this->adminUser())
                         ->getJson('/admin/backups');

        $response->assertOk()->assertJsonCount(2);

        $filenames = collect($response->json())->pluck('filename');
        $this->assertTrue($filenames->contains('hapag_backup_2026-05-11_07-00-00.sql'));
        $this->assertTrue($filenames->contains('hapag_backup_2026-05-10_07-00-00.sql'));

        $first = $response->json(0);
        $this->assertArrayHasKey('size_kb', $first);
        $this->assertArrayHasKey('created_at', $first);
    }

    public function test_list_backups_ignores_non_sql_files(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        \Illuminate\Support\Facades\Storage::disk('local')->put('backups/notes.txt', 'ignore me');
        \Illuminate\Support\Facades\Storage::disk('local')->put(
            'backups/hapag_backup_2026-05-11_07-00-00.sql', 'content'
        );

        $this->actingAs($this->adminUser())
             ->getJson('/admin/backups')
             ->assertOk()
             ->assertJsonCount(1);
    }

    // ── GET /admin/backups/{filename} ────────────────────────────────────────────

    public function test_download_serves_valid_backup_file(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        \Illuminate\Support\Facades\Storage::disk('local')->put(
            'backups/hapag_backup_2026-05-11_07-00-00.sql', 'SELECT 1;'
        );

        $this->actingAs($this->adminUser())
             ->get('/admin/backups/hapag_backup_2026-05-11_07-00-00.sql')
             ->assertOk();
    }

    public function test_download_returns_404_for_missing_file(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');

        $this->actingAs($this->adminUser())
             ->get('/admin/backups/hapag_backup_2026-01-01_00-00-00.sql')
             ->assertNotFound();
    }

    public function test_download_rejects_filenames_not_matching_pattern(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');

        $admin = $this->adminUser();

        // no hapag_backup_ prefix
        $this->actingAs($admin)->get('/admin/backups/evil.sql')->assertNotFound();

        // dots in timestamp (not matching [\d_\-]+)
        $this->actingAs($admin)
             ->get('/admin/backups/hapag_backup_2026.05.11.sql')
             ->assertNotFound();
    }
```

- [ ] **Step 2: Run — confirm new tests FAIL**

```bash
php artisan test --filter BackupTest
```

Expected: 5 of the new tests fail — `listBackups` and `downloadBackup` methods do not exist yet.

- [ ] **Step 3: Add `listBackups()` to AdminController**

Add after the `backup()` method in `app/Http/Controllers/AdminController.php`:

```php
public function listBackups(): \Illuminate\Http\JsonResponse
{
    $files = Storage::disk('local')->files('backups');

    $backups = collect($files)
        ->filter(fn($f) => str_ends_with($f, '.sql'))
        ->map(fn($file) => [
            'filename'   => basename($file),
            'size_kb'    => round(Storage::disk('local')->size($file) / 1024, 1),
            'created_at' => date('Y-m-d H:i:s', Storage::disk('local')->lastModified($file)),
        ])
        ->sortByDesc('created_at')
        ->values();

    return response()->json($backups);
}
```

- [ ] **Step 4: Add `downloadBackup()` to AdminController**

Add after `listBackups()`:

```php
public function downloadBackup(string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
{
    if (! preg_match('/^hapag_backup_[\d_\-]+\.sql$/', $filename)) {
        abort(404);
    }

    $path = 'backups/' . $filename;

    if (! Storage::disk('local')->exists($path)) {
        abort(404);
    }

    return Storage::disk('local')->download($path);
}
```

- [ ] **Step 5: Run — confirm all tests PASS**

```bash
php artisan test --filter BackupTest
```

Expected:
```
Tests:  7 passed (18 assertions)
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/AdminController.php tests/Feature/Admin/BackupTest.php
git commit -m "feat: add listBackups and downloadBackup to AdminController"
```

---

## Task 5: Routes

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add the two new routes inside the admin group**

In `routes/web.php`, find the admin group (around line 225) and add the two new routes after the existing `Route::post('/backup', ...)`:

```php
// DB backup (already exists — no change)
Route::post('/backup',              [AdminController::class, 'backup'])        ->name('backup');

// New:
Route::get('/backups',              [AdminController::class, 'listBackups'])   ->name('backups.list');
Route::get('/backups/{filename}',   [AdminController::class, 'downloadBackup'])->name('backups.download');
```

- [ ] **Step 2: Run all backup tests to confirm routing is wired**

```bash
php artisan test --filter BackupTest
```

Expected:
```
Tests:  7 passed (18 assertions)
```

- [ ] **Step 3: Commit**

```bash
git add routes/web.php
git commit -m "feat: add GET /admin/backups and GET /admin/backups/{filename} routes"
```

---

## Task 6: Scheduler

**Files:**
- Modify: `routes/console.php`

- [ ] **Step 1: Register the daily backup schedule**

Replace the full contents of `routes/console.php` with:

```php
<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('backup:database')->dailyAt('07:00');
```

- [ ] **Step 2: Verify the schedule is registered**

```bash
php artisan schedule:list
```

Expected output includes a line like:
```
0 7 * * *  php artisan backup:database
```

- [ ] **Step 3: Commit**

```bash
git add routes/console.php
git commit -m "feat: schedule daily database backup at 07:00"
```

---

## Task 7: Dashboard.jsx

**Files:**
- Modify: `resources/js/Pages/Admin/Dashboard.jsx`

- [ ] **Step 1: Add `backups` state after `backupLoading` (line 1431)**

Find:
```js
    const [backupLoading,  setBackupLoading]  = useState(false);
```

Replace with:
```js
    const [backupLoading,  setBackupLoading]  = useState(false);
    const [backups,        setBackups]        = useState([]);
```

- [ ] **Step 2: Add `fetchBackups` function after `handleBackup`**

Find the comment `// ── Backup ──────────────────────────────────────────────────────────────────` and the `handleBackup` function that follows it (lines 1498–1513). Replace the entire block with:

```js
    // ── Backup ──────────────────────────────────────────────────────────────────

    async function fetchBackups() {
        try {
            const data = await apiFetch(route('admin.backups.list'), 'GET');
            setBackups(data);
        } catch {
            // silently ignore — list just stays empty
        }
    }

    useEffect(() => {
        if (activeSection === 'backup') fetchBackups();
    }, [activeSection]);

    async function handleBackup() {
        if (!confirm('Run a full database backup now?')) return;
        setBackupLoading(true);
        try {
            const data = await apiFetch(route('admin.backup'), 'POST');
            setLastBackup(data.last_backup_at);
            setBackupFile(data.last_backup_file);
            addToast('Database backup complete.');
            window.open(route('admin.backups.download', { filename: data.filename }), '_blank');
            fetchBackups();
        } catch {
            addToast('Backup failed. Check server logs.', 'error');
        } finally {
            setBackupLoading(false);
        }
    }
```

- [ ] **Step 3: Pass `backups` prop to `BackupSection` (lines 1662–1667)**

Find:
```jsx
                                    <BackupSection
                                        lastBackup={lastBackup}
                                        backupFile={backupFile}
                                        onBackup={handleBackup}
                                        loading={backupLoading}
                                    />
```

Replace with:
```jsx
                                    <BackupSection
                                        lastBackup={lastBackup}
                                        backupFile={backupFile}
                                        onBackup={handleBackup}
                                        loading={backupLoading}
                                        backups={backups}
                                    />
```

- [ ] **Step 4: Replace the `BackupSection` component (lines 1338–1380)**

Find the entire `BackupSection` function (from `// ── Backup Section (dark) ──` to the closing `}`) and replace it with:

```jsx
// ── Backup Section (dark) ──────────────────────────────────────────────────────

function BackupSection({ lastBackup, backupFile, onBackup, loading, backups }) {
    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>
            <motion.h2 variants={FADE_UP} className="text-base font-bold text-white mb-5">Database backup</motion.h2>

            {/* Manual backup card */}
            <motion.div variants={FADE_UP} className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-6 max-w-lg mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                        <IcoDB c="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Full database export</p>
                        <p className="text-xs text-gray-500">Creates a SQL dump of all tables</p>
                    </div>
                </div>

                <dl className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700/40">
                        <span className="text-gray-500">Last backup</span>
                        <span className="text-gray-300 font-medium">{lastBackup ?? 'Never'}</span>
                    </div>
                    {backupFile && (
                        <div className="flex justify-between py-2 border-b border-gray-700/40">
                            <span className="text-gray-500">File</span>
                            <span className="text-gray-400 font-mono text-xs truncate max-w-[200px]">{backupFile}</span>
                        </div>
                    )}
                </dl>

                <button
                    onClick={onBackup}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                    <IcoDB c="w-4 h-4" />
                    {loading ? 'Running backup…' : 'Run backup now'}
                </button>
            </motion.div>

            {/* Backup file list */}
            <motion.div variants={FADE_UP} className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-6 max-w-lg">
                <p className="text-sm font-semibold text-white mb-4">Backup files</p>
                {backups.length === 0 ? (
                    <p className="text-xs text-gray-500">No backups yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {backups.map(b => (
                            <li key={b.filename} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-700/40 last:border-0">
                                <div className="min-w-0">
                                    <p className="text-gray-300 font-mono text-xs truncate">{b.filename}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{b.size_kb} KB · {b.created_at}</p>
                                </div>
                                <a
                                    href={route('admin.backups.download', { filename: b.filename })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 px-2.5 py-1 rounded-lg bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 text-xs font-medium transition-colors"
                                >
                                    Download
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.div>
        </motion.div>
    );
}
```

- [ ] **Step 5: Build and verify no errors**

```bash
npm run build
```

Expected: exits with code 0, no TypeScript/ESLint errors.

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Admin/Dashboard.jsx
git commit -m "feat: add backup list and auto-download to admin dashboard"
```

---

## Task 8: Environment + Manual Verification

**Files:**
- Edit: `.env`

- [ ] **Step 1: Add MYSQLDUMP_PATH to `.env`**

Open `.env` and add this line (after the DB block is a good spot):

```
MYSQLDUMP_PATH=C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe
```

> This file is git-ignored — do not commit it.

- [ ] **Step 2: Ensure the backups directory exists**

```bash
php artisan storage:link
```

Then manually check or create it:

```
storage/app/backups/
```

Laravel's `Storage::makeDirectory('backups')` inside BackupService will create it automatically on the first run, so this step is optional.

- [ ] **Step 3: Run the Artisan command end-to-end**

```bash
php artisan backup:database
```

Expected output:
```
Backup complete: hapag_backup_2026-05-11_HH-MM-SS.sql
```

Verify the file was created:

```bash
dir storage\app\backups\
```

Expected: one `.sql` file with size > 0.

- [ ] **Step 4: Run the full test suite to confirm nothing is broken**

```bash
php artisan test
```

Expected:
```
Tests:  N passed
```

No failures.

- [ ] **Step 5: Final commit**

```bash
git add .env.example
git commit -m "feat: complete database backup system"
```

> Add `MYSQLDUMP_PATH=mysqldump` (the default) to `.env.example` if one exists, so future developers know the variable exists.

---

## Self-Review Checklist

- [x] **BackupService** — `run()` builds command array, uses Symfony Process, writes file, calls `updateOrInsert`, returns array with filename.
- [x] **Password handling** — passes `--password=` directly in command string; no MYSQL_PWD (not supported on Windows).
- [x] **Artisan command** — injects BackupService, logs success/failure, returns correct exit codes.
- [x] **`backup()`** — dependency-injected BackupService, returns `{ success, filename, last_backup_at, last_backup_file }`, catches RuntimeException → 500.
- [x] **`listBackups()`** — filters `.sql` only, returns `{ filename, size_kb, created_at }`, sorted descending.
- [x] **`downloadBackup()`** — validates regex before any storage access, 404 on missing file.
- [x] **Routes** — both new routes inside `role:admin` middleware group, named `admin.backups.list` and `admin.backups.download`.
- [x] **Scheduler** — `Schedule::command('backup:database')->dailyAt('07:00')` in `routes/console.php`.
- [x] **Frontend** — `fetchBackups` called on section mount and after manual backup; `window.open` triggers download; backup list renders with Download anchors.
- [x] **No hardcoded credentials** — all from `config('database.connections.mysql')`.
- [x] **No third-party packages** — only Laravel + Symfony Process (bundled).
