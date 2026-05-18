<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\CartItem;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
            'user'            => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's avatar/profile photo.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        $oldPath = $user->getRawOriginal('avatar_url');
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->forceFill(['avatar_url' => $path])->save();

        return back()->with('status', 'avatar-updated');
    }

    /**
     * Remove the user's avatar/profile photo.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        $rawPath = $user->getRawOriginal('avatar_url');
        if ($rawPath) {
            Storage::disk('public')->delete($rawPath);
        }

        $user->forceFill(['avatar_url' => null])->save();

        return back()->with('status', 'avatar-removed');
    }

    /**
     * Sync the user's avatar with their Google profile photo.
     * Only applicable to Google-linked accounts.
     */
    public function syncGoogleAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->google_id) {
            return response()->json(['error' => 'Not a Google account.'], 422);
        }

        if (!$user->google_avatar) {
            return response()->json([
                'error' => 'No Google photo on file. Please sign out and sign back in with Google, then try again.',
            ], 422);
        }

        $user->avatar_url = $user->google_avatar;
        $user->save();

        return response()->json(['ok' => true]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $rawPath = $user->getRawOriginal('avatar_url');
        if ($rawPath) {
            Storage::disk('public')->delete($rawPath);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}