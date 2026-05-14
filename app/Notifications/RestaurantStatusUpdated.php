<?php

namespace App\Notifications;

use App\Models\Restaurant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RestaurantStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Restaurant $restaurant) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $message = $this->restaurant->status === 'active'
            ? "Your restaurant {$this->restaurant->name} has been approved."
            : "Your restaurant {$this->restaurant->name} was not approved.";

        return [
            'restaurant_id'   => $this->restaurant->id,
            'restaurant_name' => $this->restaurant->name,
            'status'          => $this->restaurant->status,
            'message'         => $message,
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }
}
