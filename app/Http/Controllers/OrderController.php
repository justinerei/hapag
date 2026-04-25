<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['restaurant', 'items.menuItem', 'voucher'])
            ->latest()
            ->get();

        $cartCount = CartItem::where('user_id', auth()->id())->sum('quantity');

        return Inertia::render('Orders/Index', compact('orders', 'cartCount'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready',
        ]);

        // Only the owner of the restaurant this order belongs to may update it
        abort_if($order->restaurant->owner_id !== auth()->id(), 403);

        $order->update(['status' => $request->status]);

        return response()->json(['status' => $order->status]);
    }
}