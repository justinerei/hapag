<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OwnerController extends Controller
{
    public function setup()
    {
        if (auth()->user()->restaurants()->exists()) {
            return redirect()->route('owner.dashboard');
        }

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Owner/Setup', compact('categories'));
    }

    public function storeSetup(Request $request)
    {
        if (auth()->user()->restaurants()->exists()) {
            return redirect()->route('owner.dashboard');
        }

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'category_id'  => ['required', 'exists:categories,id'],
            'municipality' => ['required', 'string', 'max:255'],
            'image'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('restaurants', 'public');
        }

        $coords = [
            'Santa Cruz'  => [14.2794, 121.4117],
            'Pagsanjan'   => [14.2713, 121.4559],
            'Los Baños'   => [14.1692, 121.2436],
            'Calamba'     => [14.2116, 121.1653],
            'San Pablo'   => [14.0688, 121.3224],
            'Bay'         => [14.1791, 121.2840],
            'Nagcarlan'   => [14.1390, 121.4180],
            'Pila'        => [14.2300, 121.3670],
        ];

        [$lat, $lng] = $coords[$data['municipality']] ?? [14.2794, 121.4117];

        Restaurant::create([
            'owner_id'     => auth()->id(),
            'category_id'  => $data['category_id'],
            'name'         => $data['name'],
            'description'  => $data['description'] ?? null,
            'address'      => $data['municipality'],
            'municipality' => $data['municipality'],
            'lat'          => $lat,
            'lng'          => $lng,
            'image_url'    => $imagePath ? Storage::disk('public')->url($imagePath) : null,
            'status'       => 'pending',
        ]);

        return redirect()->route('owner.dashboard')
            ->with('success', 'Your restaurant has been submitted for review. We\'ll notify you once it\'s approved.');
    }

    public function dashboard()
    {
        $restaurants = auth()->user()
            ->restaurants()
            ->with([
                'menuItems' => fn ($q) => $q->orderBy('category')->orderBy('name'),
                'orders'    => fn ($q) => $q->with('user', 'items.menuItem')->latest()->limit(100),
                'vouchers'  => fn ($q) => $q->orderByDesc('created_at'),
            ])
            ->get();

        // If owner has no restaurants at all, send them to setup
        if ($restaurants->isEmpty()) {
            return redirect()->route('owner.setup');
        }

        // If the owner has restaurants but ALL are pending, show the waiting page
        if ($restaurants->every(fn ($r) => $r->status === 'pending')) {
            return Inertia::render('Owner/PendingApproval', [
                'restaurant' => $restaurants->first(),
            ]);
        }

        $categories = Category::orderBy('name')->get();

        $notifications = auth()->user()
            ->notifications()
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($n) => [
                'id'            => $n->id,
                'order_id'      => $n->data['order_id'] ?? null,
                'customer_name' => $n->data['customer_name'] ?? 'Customer',
                'order_type'    => $n->data['order_type'] ?? 'pickup',
                'total'         => $n->data['total'] ?? 0,
                'received_at'   => $n->created_at->diffForHumans(),
                'read'          => !is_null($n->read_at),
            ]);
        $unreadCount = auth()->user()->unreadNotifications()->count();

        return Inertia::render('Owner/Dashboard', compact('restaurants', 'categories', 'notifications', 'unreadCount'));
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
        abort_if($restaurant->status !== 'active', 403, 'Restaurant is not active.');

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
        abort_if($menuItem->restaurant->status !== 'active', 403, 'Restaurant is not active.');

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
        abort_if($menuItem->restaurant->status !== 'active', 403, 'Restaurant is not active.');

        $menuItem->update(['is_available' => ! $menuItem->is_available]);

        return response()->json(['is_available' => $menuItem->is_available]);
    }

    private function authorizeItem(MenuItem $menuItem): void
    {
        abort_if($menuItem->restaurant->owner_id !== auth()->id(), 403);
    }

    public function updateSettings(Request $request, Restaurant $restaurant)
    {
        abort_if($restaurant->owner_id !== auth()->id(), 403);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'category_id'  => ['nullable', 'exists:categories,id'],
            'municipality' => ['required', 'string', 'max:255'],
            'address'      => ['nullable', 'string', 'max:500'],
            'image'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'opening_time' => ['nullable', 'string', 'max:10'],
            'closing_time' => ['nullable', 'string', 'max:10'],
        ]);

        if ($request->hasFile('image')) {
            if ($restaurant->image_url && str_contains($restaurant->image_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', parse_url($restaurant->image_url, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $data['image_url'] = Storage::disk('public')->url(
                $request->file('image')->store('restaurants', 'public')
            );
        } else {
            unset($data['image_url']);
        }

        $coords = [
            'Santa Cruz' => [14.2794, 121.4117],
            'Pagsanjan'  => [14.2713, 121.4559],
            'Los Baños'  => [14.1692, 121.2436],
            'Calamba'    => [14.2116, 121.1653],
            'San Pablo'  => [14.0688, 121.3224],
            'Bay'        => [14.1791, 121.2840],
            'Nagcarlan'  => [14.1390, 121.4180],
            'Pila'       => [14.2300, 121.3670],
        ];

        if (isset($coords[$data['municipality']])) {
            [$data['lat'], $data['lng']] = $coords[$data['municipality']];
        }

        $restaurant->update($data);

        return response()->json(['updated' => true, 'restaurant' => $restaurant->fresh()]);
    }

    public function exportSales(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'range'         => 'required|in:today,week,month,all',
        ]);

        $restaurant = Restaurant::findOrFail($request->restaurant_id);

        abort_if($restaurant->owner_id !== auth()->id(), 403);

        $query = $restaurant->orders()
            ->with(['user', 'items.menuItem', 'voucher'])
            ->latest();

        $now = now();

        match ($request->range) {
            'today' => $query->whereDate('created_at', $now->toDateString()),
            'week'  => $query->where('created_at', '>=',
                           $now->copy()->startOfWeek(\Carbon\Carbon::MONDAY)),
            'month' => $query->where('created_at', '>=',
                           $now->copy()->startOfMonth()),
            'all'   => null,
        };

        $orders = $query->get();

        $totalRevenue    = $orders->sum('final_amount');
        $totalOrders     = $orders->count();
        $completedOrders = $orders->where('status', 'completed')->count();
        $cancelledOrders = $orders->where('status', 'cancelled')->count();
        $pickupOrders    = $orders->where('order_type', 'pickup')->count();
        $deliveryOrders  = $orders->where('order_type', 'delivery')->count();
        $avgOrderValue   = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $deliveryRevenue = $orders->where('order_type', 'delivery')->sum('final_amount');
        $pickupRevenue   = $orders->where('order_type', 'pickup')->sum('final_amount');

        $itemCounts = [];
        foreach ($orders as $order) {
            foreach ($order->items as $oi) {
                $name = $oi->menuItem->name ?? 'Unknown Item';
                if (!isset($itemCounts[$name])) {
                    $itemCounts[$name] = ['qty' => 0, 'revenue' => 0];
                }
                $itemCounts[$name]['qty']     += $oi->quantity;
                $itemCounts[$name]['revenue'] += $oi->unit_price * $oi->quantity;
            }
        }
        uasort($itemCounts, fn($a, $b) => $b['qty'] <=> $a['qty']);
        $topItems = array_slice($itemCounts, 0, 10, true);

        return response()->json([
            'restaurant' => [
                'name'         => $restaurant->name,
                'municipality' => $restaurant->municipality,
            ],
            'range'        => $request->range,
            'generated_at' => $now->toDateTimeString(),
            'summary'      => [
                'total_revenue'    => round($totalRevenue, 2),
                'total_orders'     => $totalOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'pickup_orders'    => $pickupOrders,
                'delivery_orders'  => $deliveryOrders,
                'avg_order_value'  => round($avgOrderValue, 2),
                'pickup_revenue'   => round($pickupRevenue, 2),
                'delivery_revenue' => round($deliveryRevenue, 2),
            ],
            'top_items' => $topItems,
            'orders'    => $orders->map(fn ($o) => [
                'id'               => $o->id,
                'created_at'       => $o->created_at->toDateTimeString(),
                'status'           => $o->status,
                'order_type'       => $o->order_type,
                'customer_name'    => $o->user->name ?? 'Guest',
                'delivery_address' => $o->delivery_address,
                'items'            => $o->items->map(fn ($oi) => [
                    'name'       => $oi->menuItem->name ?? 'Item',
                    'quantity'   => $oi->quantity,
                    'unit_price' => $oi->unit_price,
                    'subtotal'   => $oi->unit_price * $oi->quantity,
                ]),
                'total_amount'    => $o->total_amount,
                'discount_amount' => $o->discount_amount,
                'delivery_fee'    => $o->delivery_fee,
                'final_amount'    => $o->final_amount,
                'voucher_code'    => $o->voucher?->code,
            ]),
        ]);
    }
}