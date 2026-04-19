<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    public function setup()
    {
        return view('owner.setup');
    }

    public function dashboard()
    {
        $restaurants = auth()->user()
            ->restaurants()
            ->with([
                'menuItems' => fn ($q) => $q->orderBy('category')->orderBy('name'),
                'orders'    => fn ($q) => $q->whereIn('status', ['pending', 'preparing'])
                                            ->with('items.menuItem')
                                            ->latest(),
            ])
            ->withCount('menuItems')
            ->get();

        return view('owner.dashboard', compact('restaurants'));
    }

    public function storeItem(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name'          => 'required|string|max:120',
            'description'   => 'nullable|string|max:500',
            'price'         => 'required|numeric|min:0|max:99999.99',
            'category'      => 'required|string|max:80',
            'is_available'  => 'boolean',
        ]);

        // Confirm this restaurant belongs to the authenticated owner
        $restaurant = Restaurant::findOrFail($data['restaurant_id']);
        abort_if($restaurant->owner_id !== auth()->id(), 403);

        $item = MenuItem::create([
            'restaurant_id' => $restaurant->id,
            'name'          => $data['name'],
            'description'   => $data['description'] ?? null,
            'price'         => $data['price'],
            'category'      => $data['category'],
            'is_available'  => $data['is_available'] ?? true,
        ]);

        return response()->json(['created' => true, 'item' => $item]);
    }

    public function updateItem(Request $request, MenuItem $menuItem)
    {
        $this->authorizeItem($menuItem);

        $data = $request->validate([
            'name'         => 'required|string|max:120',
            'description'  => 'nullable|string|max:500',
            'price'        => 'required|numeric|min:0|max:99999.99',
            'category'     => 'required|string|max:80',
            'is_available' => 'boolean',
        ]);

        $menuItem->update($data);

        return response()->json(['updated' => true, 'item' => $menuItem->fresh()]);
    }

    public function deleteItem(MenuItem $menuItem)
    {
        $this->authorizeItem($menuItem);

        try {
            $menuItem->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            // menu_items.id has restrictOnDelete on order_items — deletion blocked if used in orders
            return response()->json(
                ['error' => 'This item cannot be deleted because it appears in existing orders. Deactivate it instead.'],
                409
            );
        }

        return response()->json(['deleted' => true]);
    }

    public function toggleAvailable(MenuItem $menuItem)
    {
        $this->authorizeItem($menuItem);

        $menuItem->update(['is_available' => ! $menuItem->is_available]);

        return response()->json(['is_available' => $menuItem->is_available]);
    }

    private function authorizeItem(MenuItem $menuItem): void
    {
        abort_if($menuItem->restaurant->owner_id !== auth()->id(), 403);
    }
}