<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    /**
     * Deliver via database so customers can see it in-app.
     * Add 'mail' here later when mail is configured.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
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
            'message'    => 'Your order #' . $this->order->id . ' ' . ($labels[$this->order->status] ?? 'has been updated.'),
            'restaurant' => $this->order->restaurant->name ?? 'the restaurant',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order #' . $this->order->id . ' Update — Hapag')
            ->line($this->toArray($notifiable)['message'])
            ->action('View My Orders', url('/orders'));
    }
}