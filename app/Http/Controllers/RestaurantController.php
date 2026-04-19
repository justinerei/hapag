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

        $restaurant->load('category');

        $menuItems = $restaurant->menuItems()
            ->where('is_available', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return view('restaurants.show', compact('restaurant', 'menuItems'));
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