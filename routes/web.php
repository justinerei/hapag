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
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────────────────

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/restaurants', [RestaurantController::class, 'index'])->name('restaurants.index');
Route::get('/menu/{restaurant}', [RestaurantController::class, 'show'])->name('restaurants.show');

Route::get('/api/restaurants/map', [RestaurantController::class, 'mapData'])->name('restaurants.map');
Route::get('/api/weather', [WeatherController::class, 'index'])->name('weather');

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

    // My orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    // Cart — clear before {cartItem} so DELETE /cart is never mistaken for a model route
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'add'])->name('cart.add');
    Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');

    // Voucher AJAX validation (cart page)
    Route::post('/vouchers/validate', [VoucherController::class, 'validate'])->name('vouchers.validate');

    // AI food recommender (customer)
    Route::post('/ai/recommend', [AIController::class, 'recommend'])->name('ai.recommend');
});

// ── Owner portal ──────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:owner'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {

        Route::get('/', [OwnerController::class, 'dashboard'])->name('dashboard');
        Route::get('/setup', [OwnerController::class, 'setup'])->name('setup');

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