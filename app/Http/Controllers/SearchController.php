<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Favorite;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * AJAX live-search: returns top restaurants + dishes matching the query.
     * GET /api/search?q=...
     */
    public function query(Request $request)
    {
        $q = trim($request->input('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json(['restaurants' => [], 'dishes' => []]);
        }

        $restaurants = Restaurant::where('status', 'active')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('municipality', 'like', "%{$q}%");
            })
            ->with('category:id,name,icon')
            ->limit(5)
            ->get(['id', 'name', 'municipality', 'image_url', 'category_id']);

        $dishes = MenuItem::where('is_available', true)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('category', 'like', "%{$q}%");
            })
            ->whereHas('restaurant', fn ($r) => $r->where('status', 'active'))
            ->with('restaurant:id,name,municipality,image_url')
            ->limit(6)
            ->get(['id', 'restaurant_id', 'name', 'description', 'price', 'category', 'image_url']);

        return response()->json([
            'restaurants' => $restaurants,
            'dishes'      => $dishes,
        ]);
    }

    /**
     * Full search results page.
     * GET /search?q=...
     */
    public function index(Request $request)
    {
        $q = trim($request->input('q', ''));

        $restaurants = collect();
        $dishes      = collect();

        if (mb_strlen($q) >= 2) {
            $restaurants = Restaurant::where('status', 'active')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                          ->orWhere('municipality', 'like', "%{$q}%");
                })
                ->with('category:id,name,icon')
                ->orderBy('name')
                ->get();

            $dishes = MenuItem::where('is_available', true)
                ->where(function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                          ->orWhere('description', 'like', "%{$q}%")
                          ->orWhere('category', 'like', "%{$q}%");
                })
                ->whereHas('restaurant', fn ($r) => $r->where('status', 'active'))
                ->with('restaurant:id,name,municipality,image_url')
                ->orderBy('name')
                ->get();
        }

        $cartCount   = 0;
        $favoriteIds = [];
        if (auth()->check()) {
            $cartCount   = CartItem::where('user_id', auth()->id())->sum('quantity');
            $favoriteIds = Favorite::where('user_id', auth()->id())
                ->pluck('restaurant_id')->toArray();
        }

        return Inertia::render('Search/Index', [
            'query'       => $q,
            'restaurants' => $restaurants,
            'dishes'      => $dishes,
            'cartCount'   => $cartCount,
            'favoriteIds' => $favoriteIds,
        ]);
    }
}