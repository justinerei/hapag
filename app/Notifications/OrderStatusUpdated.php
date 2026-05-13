<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function broadcastOn(): array
    {
        $this->order->loadMissing('restaurant');

        return [
            new PrivateChannel('customer.' . $this->order->user_id),
            new PrivateChannel('owner.' . $this->order->restaurant->owner_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order-status-updated';
    }

    public function toArray(object $notifiable): array
    {
        $labels = [
            'accepted'  => 'has been accepted and is being prepared.',
            'preparing' => 'is now being prepared.',
            'ready'     => 'is ready for ' . ($this->order->order_type === 'delivery' ? 'dispatch!' : 'pickup!'),
            'completed' => 'has been completed. Enjoy your meal!',
            'cancelled' => 'has been cancelled.',
        ];

        return [
            'order_id'   => $this->order->id,
            'status'     => $this->order->status,
            'message'    => 'Your order #' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT) . ' ' . ($labels[$this->order->status] ?? 'has been updated.'),
            'restaurant' => $this->order->restaurant->name ?? 'the restaurant',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order #' . str_pad($this->order->id, 5, '0', STR_PAD_LEFT) . ' Update — Hapag')
            ->line($this->toArray($notifiable)['message'])
            ->action('View My Orders', url('/orders'));
    }
}
