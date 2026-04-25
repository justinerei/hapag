<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Restaurant;
use App\Models\SystemSetting;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $pendingRestaurants = Restaurant::with('category', 'owner')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $categories = Category::orderBy('name')->get();

        $vouchers = Voucher::whereNull('restaurant_id')
            ->orderByDesc('created_at')
            ->get();

        $lastBackup     = SystemSetting::where('key', 'last_backup_at')->value('value');
        $lastBackupFile = SystemSetting::where('key', 'last_backup_file')->value('value');

        return Inertia::render('Admin/Dashboard', compact(
            'pendingRestaurants',
            'categories',
            'vouchers',
            'lastBackup',
            'lastBackupFile',
        ));
    }

    public function approveRestaurant(Request $request, Restaurant $restaurant)
    {
        $request->validate([
            'status' => 'required|in:active,rejected',
        ]);

        $restaurant->update(['status' => $request->status]);

        return response()->json(['status' => $restaurant->status]);
    }

    public function backup()
    {
        Artisan::call('db:backup');

        $lastBackup     = SystemSetting::where('key', 'last_backup_at')->value('value');
        $lastBackupFile = SystemSetting::where('key', 'last_backup_file')->value('value');

        return response()->json([
            'success'          => true,
            'last_backup_at'   => $lastBackup,
            'last_backup_file' => $lastBackupFile,
        ]);
    }
}