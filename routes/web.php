<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────────────────

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/restaurants', [RestaurantController::class, 'index'])->name('restaurants.index');
Route::get('/menu/{restaurant}', [RestaurantController::class, 'show'])->name('restaurants.show');

Route::get('/api/restaurants/map', [RestaurantController::class, 'mapData'])->name('restaurants.map');
Route::get('/api/weather', [WeatherController::class, 'index'])->name('weather');

// Search
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/api/search', [SearchController::class, 'query'])->name('search.query');

// ── Role-based redirect after Breeze login ────────────────────────────────────

Route::get('/dashboard', function () {
    return match (auth()->user()->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'owner' => redirect()->route('owner.dashboard'),
        default => redirect()->route('home'),
    };
})->middleware('auth')->name('dashboard');

// ── Authenticated (any role) ──────────────────────────────────────────────────

Route::middleware('auth')->group(function () {

    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');

    // My orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index'])->name('favorites');
    Route::post('/favorites/toggle', [\App\Http\Controllers\FavoriteController::class, 'toggle'])->name('favorites.toggle');

    // Municipality quick-update (AJAX from customer navbar)
    Route::patch('/profile/municipality', function (\Illuminate\Http\Request $request) {
        $request->validate(['municipality' => ['required', 'string', 'max:255']]);
        auth()->user()->update(['municipality' => $request->municipality]);
        return response()->json(['ok' => true]);
    })->name('profile.municipality');

    // Cart — clear before {cartItem} so DELETE /cart is never mistaken for a model route
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::get('/cart/json', [CartController::class, 'json'])->name('cart.json');
    Route::get('/checkout', [CartController::class, 'checkoutPage'])->name('checkout');
    Route::post('/cart', [CartController::class, 'add'])->name('cart.add');
    Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');

    // Voucher AJAX validation (cart page)
    Route::post('/vouchers/validate', [VoucherController::class, 'validate'])->name('vouchers.validate');

    // Voucher claiming (menu page promos)
    Route::post('/api/vouchers/claim', function (\Illuminate\Http\Request $request) {
        $request->validate(['voucher_id' => 'required|exists:vouchers,id']);

        $user    = auth()->user();
        $voucher = \App\Models\Voucher::findOrFail($request->voucher_id);

        if (! $voucher->is_active) {
            return response()->json(['message' => 'This voucher is no longer active.'], 422);
        }
        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return response()->json(['message' => 'This voucher has expired.'], 422);
        }
        if ($voucher->max_uses !== null && $voucher->used_count >= $voucher->max_uses) {
            return response()->json(['message' => 'This voucher has reached its limit.'], 422);
        }
        if (\App\Models\VoucherUsage::where('voucher_id', $voucher->id)->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You have already used this voucher.'], 422);
        }
        if (\App\Models\ClaimedVoucher::where('user_id', $user->id)->where('voucher_id', $voucher->id)->exists()) {
            return response()->json(['message' => 'Already claimed.'], 422);
        }

        \App\Models\ClaimedVoucher::create([
            'user_id'    => $user->id,
            'voucher_id' => $voucher->id,
        ]);

        return response()->json(['claimed' => true, 'code' => $voucher->code]);
    })->name('vouchers.claim');

    // AI food recommender (customer)
    Route::post('/ai/recommend', [AIController::class, 'recommend'])->name('ai.recommend');
    Route::post('/ai/chat', [AIController::class, 'chat'])->name('ai.chat');
});

// ── Owner portal ──────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:owner'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {

        Route::get('/', [OwnerController::class, 'dashboard'])->name('dashboard');
        Route::get('/setup', [OwnerController::class, 'setup'])->name('setup');
        Route::post('/setup', [OwnerController::class, 'storeSetup'])->name('setup.store');

        // Menu items
        Route::post('/items', [OwnerController::class, 'storeItem'])->name('items.store');
        Route::patch('/items/{menuItem}', [OwnerController::class, 'updateItem'])->name('items.update');
        Route::delete('/items/{menuItem}', [OwnerController::class, 'deleteItem'])->name('items.destroy');
        Route::patch('/items/{menuItem}/toggle', [OwnerController::class, 'toggleAvailable'])->name('items.toggle');

        // Order status
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

        // Vouchers (restaurant-scoped)
        Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
        Route::patch('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
        Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

        // AI description generator
        Route::post('/ai/describe', [AIController::class, 'describe'])->name('ai.describe');

        // Restaurant settings
        Route::patch('/restaurants/{restaurant}/settings', [OwnerController::class, 'updateSettings'])->name('settings.update');
    });

// ── Admin panel ───────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

        // Restaurant approvals
        Route::patch('/restaurants/{restaurant}/approve', [AdminController::class, 'approveRestaurant'])->name('restaurants.approve');

        // Categories
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Vouchers (site-wide)
        Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
        Route::patch('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
        Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

        // DB backup
        Route::post('/backup', [AdminController::class, 'backup'])->name('backup');
    });

require __DIR__.'/auth.php';