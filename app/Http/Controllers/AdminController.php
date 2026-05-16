<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ClaimedVoucher;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Notifications\RestaurantStatusUpdated;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

        $vouchers = Voucher::with('restaurant:id,name')
            ->orderByDesc('created_at')
            ->get();

        $lastBackup     = SystemSetting::where('key', 'last_backup_at')->value('value');
        $lastBackupFile = SystemSetting::where('key', 'last_backup_file')->value('value');

        // ── Summary totals ────────────────────────────────────────────────────────

        $totalRestaurants  = Restaurant::count();
        $activeRestaurants = Restaurant::where('status', 'active')->count();
        $totalUsers        = User::count();
        $totalCustomers    = User::where('role', 'customer')->count();
        $totalOwners       = User::where('role', 'owner')->count();
        $totalOrders       = Order::count();
        $totalRevenue      = (float) Order::sum('final_amount');

        $totalCompletedOrders = Order::where('status', 'completed')->count();
        $totalCancelledOrders = Order::where('status', 'cancelled')->count();
        $completionRate       = $totalOrders > 0 ? round($totalCompletedOrders / $totalOrders * 100, 1) : 0.0;
        $cancellationRate     = $totalOrders > 0 ? round($totalCancelledOrders / $totalOrders * 100, 1) : 0.0;

        $totalVouchersUsed      = VoucherUsage::count();
        $revenueSavedByVouchers = (float) Order::whereNotNull('voucher_id')->sum('discount_amount');
        $totalClaimed           = ClaimedVoucher::count();

        $repeatCustomers          = DB::table('orders')->select('user_id')->groupBy('user_id')->havingRaw('COUNT(*) > 1')->get()->count();
        $totalCustomersWithOrders = DB::table('orders')->distinct('user_id')->count('user_id');
        $retentionRate            = $totalCustomersWithOrders > 0 ? round($repeatCustomers / $totalCustomersWithOrders * 100, 1) : 0.0;

        // ── Daily growth data (raw, for client-side time filtering) ────────────────

        $restaurantGrowth = Restaurant::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        $customerGrowth = User::where('role', 'customer')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        $ownerGrowth = User::where('role', 'owner')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        $orderGrowth = Order::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        $revenueGrowth = Order::selectRaw('DATE(created_at) as date, SUM(final_amount) as revenue')
            ->groupBy('date')->orderBy('date')->get();

        $voucherUsageGrowth = VoucherUsage::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        // ── Analytics ─────────────────────────────────────────────────────────────

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $peakHoursData = Order::selectRaw('HOUR(created_at) as hour, DAYOFWEEK(created_at) as day, COUNT(*) as count')
            ->groupBy('hour', 'day')
            ->orderBy('day')
            ->orderBy('hour')
            ->get();

        $topVouchers = Voucher::orderByDesc('used_count')
            ->take(5)
            ->get(['id', 'code', 'type', 'value', 'used_count', 'is_active', 'max_uses']);

        $topRestaurants = DB::table('restaurants')
            ->join('orders', 'orders.restaurant_id', '=', 'restaurants.id')
            ->select('restaurants.id', 'restaurants.name', 'restaurants.municipality')
            ->selectRaw('SUM(orders.final_amount) as revenue, COUNT(orders.id) as order_count')
            ->groupBy('restaurants.id', 'restaurants.name', 'restaurants.municipality')
            ->orderByDesc('revenue')
            ->take(5)
            ->get();

        $topMenuItems = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('restaurants', 'menu_items.restaurant_id', '=', 'restaurants.id')
            ->select('menu_items.id', 'menu_items.name as item_name', 'restaurants.name as restaurant_name')
            ->selectRaw('SUM(order_items.quantity) as total_sold, SUM(order_items.unit_price * order_items.quantity) as revenue')
            ->groupBy('menu_items.id', 'menu_items.name', 'restaurants.name')
            ->orderByDesc('total_sold')
            ->take(10)
            ->get();

        $ordersByMunicipality = DB::table('orders')
            ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
            ->select('restaurants.municipality')
            ->selectRaw('COUNT(orders.id) as count, SUM(orders.final_amount) as revenue')
            ->groupBy('restaurants.municipality')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('Admin/Dashboard', compact(
            'pendingRestaurants',
            'categories',
            'vouchers',
            'lastBackup',
            'lastBackupFile',
            'totalRestaurants',
            'activeRestaurants',
            'totalUsers',
            'totalCustomers',
            'totalOwners',
            'totalOrders',
            'totalRevenue',
            'totalCompletedOrders',
            'totalCancelledOrders',
            'completionRate',
            'cancellationRate',
            'totalVouchersUsed',
            'revenueSavedByVouchers',
            'totalClaimed',
            'repeatCustomers',
            'totalCustomersWithOrders',
            'retentionRate',
            'restaurantGrowth',
            'customerGrowth',
            'ownerGrowth',
            'orderGrowth',
            'revenueGrowth',
            'voucherUsageGrowth',
            'ordersByStatus',
            'peakHoursData',
            'topVouchers',
            'topRestaurants',
            'topMenuItems',
            'ordersByMunicipality',
        ));
    }

    public function approveRestaurant(Request $request, Restaurant $restaurant)
    {
        $request->validate([
            'status' => 'required|in:active,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        $restaurant->update([
            'status'           => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? ($request->reason ?? null) : null,
        ]);

        $restaurant->owner->notify(
            new RestaurantStatusUpdated($restaurant, $request->reason ?? '')
        );

        return response()->json(['status' => $restaurant->status]);
    }

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
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

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
}
