<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Customer listens for their own order status updates
Broadcast::channel('customer.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Owner listens for new orders on their channel
Broadcast::channel('owner.{ownerId}', function ($user, $ownerId) {
    return (int) $user->id === (int) $ownerId && $user->role === 'owner';
});
