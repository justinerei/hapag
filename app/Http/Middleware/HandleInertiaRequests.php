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
                    'id'           => $user->id,
                    'name'         => $user->name,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'municipality' => $user->municipality,
                    'address'      => $user->address,
                    'avatar_url'   => $user->avatar_url,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            // Share unread notifications for customer role only.
            // Wrapped in a closure so it only runs when a customer is logged in —
            // avoids a wasted query for guests, owners, and admins.
            'notifications' => function () use ($user) {
                if (! $user || $user->role !== 'customer') {
                    return [];
                }

                return $user->unreadNotifications
                    ->map(fn ($n) => [
                        'id'         => $n->id,
                        'message'    => $n->data['message'] ?? 'Your order status has been updated.',
                        'order_id'   => $n->data['order_id'] ?? null,
                        'status'     => $n->data['status'] ?? null,
                        'created_at' => $n->created_at->diffForHumans(),
                    ])
                    ->values()
                    ->all();
            },
        ];
    }
}