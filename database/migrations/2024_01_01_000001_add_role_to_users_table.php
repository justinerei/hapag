<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Use string for SQLite compatibility, enum for MySQL
            if (Schema::getConnection()->getDriverName() === 'mysql') {
                $table->enum('role', ['customer', 'owner', 'admin'])->default('customer')->after('email');
            } else {
                $table->string('role')->default('customer')->after('email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
