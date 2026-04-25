<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cartItems = CartItem::where('user_id', auth()->id())
            ->with(['menuItem.restaurant'])
            ->get();

        $restaurant = $cartItems->first()?->menuItem->restaurant;
        $cartCount  = $cartItems->sum('quantity');

        return Inertia::render('Cart/Index', compact('cartItems', 'restaurant', 'cartCount'));
    }

    public function json()
    {
        $cartItems = CartItem::where('user_id', auth()->id())
            ->with(['menuItem.restaurant'])
            ->get();

        $restaurant = $cartItems->first()?->menuItem->restaurant;

        return response()->json([
            'items' => $cartItems->map(fn ($ci) => [
                'id'          => $ci->id,
                'quantity'    => $ci->quantity,
                'name'        => $ci->menuItem->name,
                'price'       => (float) $ci->menuItem->price,
                'image_url'   => $ci->menuItem->image_url ?? null,
                'category'    => $ci->menuItem->category,
                'restaurant'  => $ci->menuItem->restaurant->name ?? '',
            ]),
            'restaurant' => $restaurant ? [
                'id'   => $restaurant->id,
                'name' => $restaurant->name,
                'municipality' => $restaurant->municipality,
            ] : null,
            'subtotal' => $cartItems->sum(fn ($ci) => $ci->menuItem->price * $ci->quantity),
            'count'    => $cartItems->sum('quantity'),
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity'      => 'sometimes|integer|min:1|max:99',
        ]);

        $menuItem = MenuItem::findOrFail($request->menu_item_id);
        $qty      = $request->input('quantity', 1);

        abort_if(! $menuItem->is_available, 422, 'This item is no longer available.');

        // One-restaurant-per-cart rule
        $existingRestaurantId = CartItem::where('user_id', auth()->id())
            ->join('menu_items', 'cart_items.menu_item_id', '=', 'menu_items.id')
            ->value('menu_items.restaurant_id');

        if ($existingRestaurantId && (int) $existingRestaurantId !== $menuItem->restaurant_id) {
            return response()->json(['conflict' => true], 409);
        }

        $cartItem = CartItem::where('user_id', auth()->id())
            ->where('menu_item_id', $menuItem->id)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $qty);
        } else {
            CartItem::create([
                'user_id'      => auth()->id(),
                'menu_item_id' => $menuItem->id,
                'quantity'     => $qty,
            ]);
        }

        $cartCount = CartItem::where('user_id', auth()->id())->sum('quantity');

        return response()->json(['added' => true, 'cart_count' => $cartCount]);
    }

    public function update(Request $request, CartItem $cartItem)
    {
        abort_if($cartItem->user_id !== auth()->id(), 403);

        $request->validate(['quantity' => 'required|integer|min:1|max:99']);

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['updated' => true]);
    }

    public function remove(CartItem $cartItem)
    {
        abort_if($cartItem->user_id !== auth()->id(), 403);

        $cartItem->delete();

        return response()->json(['removed' => true]);
    }

    public function clear()
    {
        CartItem::where('user_id', auth()->id())->delete();

        return response()->json(['cleared' => true]);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'voucher_code'     => 'nullable|string|max:50',
            'order_type'       => 'required|in:pickup,delivery',
            'delivery_address' => 'required_if:order_type,delivery|nullable|string|max:500',
            'pickup_note'      => 'nullable|string|max:500',
        ]);

        $user      = auth()->user();
        $cartItems = CartItem::where('user_id', $user->id)
            ->with('menuItem')
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['cart' => 'Your cart is empty.']);
        }

        $restaurantId = $cartItems->first()->menuItem->restaurant_id;
        $subtotal     = $cartItems->sum(fn ($i) => $i->menuItem->price * $i->quantity);
        $deliveryFee  = $request->order_type === 'delivery' ? 49.00 : 0.00;

        try {
            DB::transaction(function () use ($request, $user, $cartItems, $restaurantId, $subtotal, $deliveryFee) {
                $voucher        = null;
                $discountAmount = 0;

                if ($request->filled('voucher_code')) {
                    $voucher = Voucher::where('code', strtoupper($request->voucher_code))->first();

                    // Re-validate all 6 conditions inside the transaction
                    if (! $voucher || ! $voucher->is_active) {
                        throw new \RuntimeException('Invalid or inactive voucher code.');
                    }
                    if ($voucher->expires_at && $voucher->expires_at->isPast()) {
                        throw new \RuntimeException('This voucher has expired.');
                    }
                    if ($voucher->max_uses !== null && $voucher->used_count >= $voucher->max_uses) {
                        throw new \RuntimeException('This voucher has reached its usage limit.');
                    }
                    if (VoucherUsage::where('voucher_id', $voucher->id)->where('user_id', $user->id)->exists()) {
                        throw new \RuntimeException('You have already used this voucher.');
                    }
                    if ($voucher->min_order_amount !== null && $subtotal < $voucher->min_order_amount) {
                        throw new \RuntimeException(
                            'Minimum order of ₱' . number_format($voucher->min_order_amount, 2) . ' required for this voucher.'
                        );
                    }
                    if ($voucher->restaurant_id !== null && $voucher->restaurant_id !== $restaurantId) {
                        throw new \RuntimeException('This voucher is not valid for this restaurant.');
                    }

                    $discountAmount = $voucher->type === 'percentage'
                        ? $subtotal * ($voucher->value / 100)
                        : (float) $voucher->value;

                    $discountAmount = min($discountAmount, $subtotal);
                }

                $finalAmount = max(0, $subtotal - $discountAmount) + $deliveryFee;

                $order = Order::create([
                    'user_id'          => $user->id,
                    'restaurant_id'    => $restaurantId,
                    'total_amount'     => $subtotal,
                    'discount_amount'  => $discountAmount,
                    'delivery_fee'     => $deliveryFee,
                    'final_amount'     => $finalAmount,
                    'voucher_id'       => $voucher?->id,
                    'status'           => 'pending',
                    'order_type'       => $request->order_type,
                    'delivery_address' => $request->order_type === 'delivery' ? $request->delivery_address : null,
                    'pickup_note'      => $request->order_type === 'pickup' ? $request->pickup_note : null,
                ]);

                foreach ($cartItems as $item) {
                    OrderItem::create([
                        'order_id'     => $order->id,
                        'menu_item_id' => $item->menu_item_id,
                        'quantity'     => $item->quantity,
                        'unit_price'   => $item->menuItem->price, // frozen at checkout
                    ]);
                }

                if ($voucher) {
                    $voucher->increment('used_count');
                    VoucherUsage::create([
                        'voucher_id' => $voucher->id,
                        'user_id'    => $user->id,
                        'order_id'   => $order->id,
                    ]);
                }

                CartItem::where('user_id', $user->id)->delete();

                session(['last_order_id' => $order->id]);
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['voucher' => $e->getMessage()]);
        }

        $successMsg = $request->order_type === 'delivery'
            ? 'Order placed! Pay cash on delivery.'
            : 'Order placed! Pay on pickup.';

        return redirect()->route('orders.index')->with('success', $successMsg);
    }
}