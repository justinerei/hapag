<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index()
    {
        $favoriteIds = auth()->user()->favorites()->pluck('restaurant_id');

        $restaurants = Restaurant::whereIn('id', $favoriteIds)
            ->where('status', 'active')
            ->with('category')
            ->orderBy('name')
            ->get();

        $cartCount = auth()->user()->cartItems()->sum('quantity');

        return view('favorites', compact('restaurants', 'cartCount', 'favoriteIds'));
    }

    public function toggle(Request $request)
    {
        $request->validate(['restaurant_id' => 'required|exists:restaurants,id']);

        $userId       = auth()->id();
        $restaurantId = $request->restaurant_id;

        $existing = Favorite::where('user_id', $userId)
            ->where('restaurant_id', $restaurantId)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFavorited = false;
        } else {
            Favorite::create([
                'user_id'       => $userId,
                'restaurant_id' => $restaurantId,
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