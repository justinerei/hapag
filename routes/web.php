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

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public restaurant routes
Route::get('/restaurants', [RestaurantController::class, 'index'])->name('restaurants.index');
Route::get('/menu/{restaurant}', [RestaurantController::class, 'show'])->name('restaurants.show');
Route::get('/api/restaurants/map', [RestaurantController::class, 'mapData'])->name('restaurants.map');
Route::get('/api/weather', [WeatherController::class, 'index'])->name('weather');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Orders (customer)
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    // Cart
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');

    // Voucher AJAX validation
    Route::post('/vouchers/validate', [VoucherController::class, 'validate'])->name('vouchers.validate');

    // AI recommender (customer)
    Route::post('/ai/recommend', [AIController::class, 'recommend'])->name('ai.recommend');
});

// Owner portal
Route::middleware(['auth', 'role:owner'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/', [OwnerController::class, 'dashboard'])->name('dashboard');
    Route::post('/items', [OwnerController::class, 'storeItem'])->name('items.store');
    Route::patch('/items/{menuItem}', [OwnerController::class, 'updateItem'])->name('items.update');
    Route::delete('/items/{menuItem}', [OwnerController::class, 'deleteItem'])->name('items.destroy');
    Route::patch('/items/{menuItem}/toggle', [OwnerController::class, 'toggleAvailable'])->name('items.toggle');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

    // AI description generator (owner)
    Route::post('/ai/describe', [AIController::class, 'describe'])->name('ai.describe');
});

// Admin panel
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::patch('/restaurants/{restaurant}/approve', [AdminController::class, 'approveRestaurant'])->name('restaurants.approve');
    Route::post('/backup', [AdminController::class, 'backup'])->name('backup');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});

require __DIR__.'/auth.php';
