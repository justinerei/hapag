<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
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

    public function confirmReceived(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);

        if ($order->status !== 'ready') {
            return response()->json(['message' => 'Order is not ready yet.'], 422);
        }

        $order->update(['status' => 'completed']);

        $order->restaurant->owner->notify(new OrderStatusUpdated($order));

        return response()->json(['status' => 'completed']);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,accepted,preparing,ready,completed,cancelled',
        ]);

        // Only the owner of the restaurant this order belongs to may update it
        abort_if($order->restaurant->owner_id !== auth()->id(), 403);

        $allowed = [
            'pending'  => ['accepted', 'cancelled'],
            'accepted' => ['preparing', 'cancelled'],
            'preparing' => ['ready'],
            'ready'    => ['completed'],
        ];

        if (!in_array($request->status, $allowed[$order->status] ?? [], true)) {
            return response()->json(['message' => 'Invalid status transition.'], 422);
        }

        $order->update(['status' => $request->status]);

        // Notify the customer about the status change
        $order->user->notify(new OrderStatusUpdated($order));

        return response()->json(['status' => $order->status]);
    }
}