<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // For MySQL: modify the ENUM column to include the two new statuses
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','accepted','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending'");
        }
        // SQLite handles enum as TEXT, so no modification needed
    }

    public function down(): void
    {
        // Revert back to original statuses (will fail if rows have the new values)
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','preparing','ready','completed') NOT NULL DEFAULT 'pending'");
        }
    }
};