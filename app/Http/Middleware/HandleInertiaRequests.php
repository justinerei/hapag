<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'                         => $user->id,
                    'name'                       => $user->name,
                    'email'                      => $user->email,
                    'role'                       => $user->role,
                    'municipality'               => $user->municipality,
                    'address'                    => $user->address,
                    'avatar_url'                 => $user->avatar_url,
                    'has_seen_tour'              => (bool) $user->has_seen_tour,
                    'has_dismissed_progress_bar' => (bool) $user->has_dismissed_progress_bar,
                    'has_seen_owner_tour'        => (bool) $user->has_seen_owner_tour,
                ] : null,
            ],

            // Ito yung kailangan ng useNotification.js
            'notifications' => function () use ($user) {
                if (!$user) return [];

                return $user->unreadNotifications->map(fn ($n) => [
                    'id'         => $n->id,
                    'message'    => $n->data['message'] ?? 'Status updated',
                    'order_id'   => $n->data['order_id'] ?? null,
                    'created_at' => $n->created_at->diffForHumans(),
                ]);
            },

            // Bilang ng active orders para sa badge
            'orderNotifCount' => $user 
                ? $user->orders()->whereIn('status', ['pending', 'preparing', 'ready'])->count() 
                : 0,

            'cartCount' => $user ? $user->cartItems()->count() : 0,
        ];
    }
}
