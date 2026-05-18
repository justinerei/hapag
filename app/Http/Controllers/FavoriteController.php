<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function index()
    {
        $favoriteIds = auth()->user()->favorites()->pluck('restaurant_id');

        $restaurants = Restaurant::whereIn('id', $favoriteIds)
            ->where('status', 'active')
            ->with('category')
            ->withCount('menuItems')
            ->orderBy('name')
            ->get();

        $cartCount = auth()->user()->cartItems()->sum('quantity');

        return Inertia::render('Favorites/Index', compact('restaurants', 'cartCount', 'favoriteIds'));
    }

    public function toggle(Request $request)
    {
        $request->validate(['restaurant_id' => 'required|exists:restaurants,id']);

        // Only allow favoriting active restaurants
        $restaurant = Restaurant::where('id', $request->restaurant_id)
            ->where('status', 'active')
            ->firstOrFail();

        $userId = auth()->id();

        $existing = Favorite::where('user_id', $userId)
            ->where('restaurant_id', $restaurant->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFavorited = false;
        } else {
            Favorite::create([
                'user_id'       => $userId,
                'restaurant_id' => $restaurant->id,
            ]);
            $isFavorited = true;
        }

        $count = Favorite::where('user_id', $userId)->count();

        return response()->json([
            'favorited' => $isFavorited,
            'count'     => $count,
        ]);
    }
}