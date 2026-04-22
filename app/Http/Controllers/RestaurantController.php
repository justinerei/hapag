<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        $query = Restaurant::with('category')
            ->where('status', 'active')
            ->orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $restaurants = $query->get();
        $categories  = Category::orderBy('name')->get();

        if ($request->ajax()) {
            return response()->json([
                'restaurants' => $restaurants->map(fn ($r) => [
                    'id'           => $r->id,
                    'name'         => $r->name,
                    'description'  => $r->description,
                    'municipality' => $r->municipality,
                    'image_url'    => $r->image_url,
                    'category'     => [
                        'name' => $r->category->name,
                        'icon' => $r->category->icon,
                    ],
                ]),
            ]);
        }

        return view('restaurants.index', compact('restaurants', 'categories'));
    }

    public function show(Restaurant $restaurant)
    {
        abort_if($restaurant->status !== 'active', 404);

        $restaurant->load(['category', 'owner']);

        $menuItems = $restaurant->menuItems()
            ->where('is_available', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        // Random 4 featured items
        $featuredItems = $restaurant->menuItems()
            ->where('is_available', true)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Restaurant-specific vouchers ONLY (for the Promos section on menu page)
        $restaurantVouchers = \App\Models\Voucher::where('is_active', true)
            ->where(function ($q) { $q->whereNull('expires_at')->orWhere('expires_at', '>', now()); })
            ->where('restaurant_id', $restaurant->id)
            ->get();

        // All available vouchers for cart promo section (restaurant + site-wide)
        $allVouchers = \App\Models\Voucher::where('is_active', true)
            ->where(function ($q) { $q->whereNull('expires_at')->orWhere('expires_at', '>', now()); })
            ->where(function ($q) use ($restaurant) {
                $q->where('restaurant_id', $restaurant->id)->orWhereNull('restaurant_id');
            })
            ->get();

        // Cart data for logged-in users
        $cartItems = [];
        $cartCount = 0;
        $favoriteIds = [];
        if (auth()->check()) {
            $cartItems = \App\Models\CartItem::where('user_id', auth()->id())
                ->with('menuItem.restaurant')
                ->get();
            $cartCount = $cartItems->sum('quantity');
            $favoriteIds = \App\Models\Favorite::where('user_id', auth()->id())
                ->pluck('restaurant_id')->toArray();
        }

        // All active restaurants for footer
        $allRestaurants = Restaurant::where('status', 'active')->orderBy('name')->limit(5)->get();

        return view('restaurants.show', compact(
            'restaurant', 'menuItems', 'featuredItems',
            'restaurantVouchers', 'allVouchers', 'cartItems', 'cartCount',
            'allRestaurants', 'favoriteIds'
        ));
    }

    public function mapData()
    {
        $restaurants = Restaurant::with('category')
            ->where('status', 'active')
            ->get(['id', 'name', 'address', 'municipality', 'lat', 'lng', 'category_id', 'image_url']);

        return response()->json(
            $restaurants->map(fn ($r) => [
                'id'           => $r->id,
                'name'         => $r->name,
                'address'      => $r->address,
                'municipality' => $r->municipality,
                'lat'          => $r->lat,
                'lng'          => $r->lng,
                'image_url'    => $r->image_url,
                'category'     => [
                    'name' => $r->category->name,
                    'icon' => $r->category->icon,
                ],
            ])
        );
    }
}