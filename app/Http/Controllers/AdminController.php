<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class AdminController extends Controller
{
    public function dashboard()
    {
        $pendingRestaurants = Restaurant::with('category', 'owner')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $allRestaurants = Restaurant::with('category', 'owner')
            ->whereIn('status', ['active', 'rejected'])
            ->latest()
            ->get();

        $users = User::orderBy('role')->orderBy('name')->get();

        $recentOrders = Order::with('user', 'restaurant')
            ->latest()
            ->limit(20)
            ->get();

        $lastBackup = SystemSetting::where('key', 'last_backup_at')->value('value');
        $lastBackupFile = SystemSetting::where('key', 'last_backup_file')->value('value');

        return view('admin.dashboard', compact(
            'pendingRestaurants',
            'allRestaurants',
            'users',
            'recentOrders',
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