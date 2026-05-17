<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        $role = request()->get('role', 'customer');
        if (!in_array($role, ['customer', 'owner'])) {
            $role = 'customer';
        }
        session(['google_intended_role' => $role]);

        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Google login failed. Please try again.');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            $user->update([
                'google_id'     => $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $intendedRole = session()->pull('google_intended_role', 'customer');

            $user = User::create([
                'name'          => $googleUser->getName(),
                'email'         => $googleUser->getEmail(),
                'google_id'     => $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
                'avatar_url'    => null,
                'role'          => $intendedRole,
                'password'      => null,
            ]);
        }

        Auth::login($user, remember: true);

        // ✅ Role-based redirect instead of intended() which
        //    could send users to a stale /owner/setup URL
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'owner' => redirect()->route('owner.dashboard'),
            default => redirect()->route('home'),
        };
    }
}