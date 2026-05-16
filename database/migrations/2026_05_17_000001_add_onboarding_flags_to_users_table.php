<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('has_seen_tour')->default(false)->after('avatar_url');
            $table->boolean('has_dismissed_progress_bar')->default(false)->after('has_seen_tour');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['has_seen_tour', 'has_dismissed_progress_bar']);
        });
    }
};
