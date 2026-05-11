<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('owner.' . $this->order->restaurant->owner_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-order';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id'      => $this->order->id,
            'customer_name' => $this->order->user->name,
            'order_type'    => $this->order->order_type,
            'total'         => $this->order->final_amount,
            'items_count'   => $this->order->items()->count(),
            'restaurant'    => $this->order->restaurant->name,
        ];
    }
}
