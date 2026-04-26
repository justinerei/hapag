<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'categories' => \App\Models\Category::orderBy('name')->get(),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['required', 'string', 'max:255'],
            'email'        => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password'     => ['required', 'confirmed', Rules\Password::defaults()],
            'role'         => ['required', 'in:customer,owner'],
            'municipality' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name'         => trim($request->first_name . ' ' . $request->last_name),
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => $request->role,
            'municipality' => $request->municipality ?: null,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return match ($user->role) {
            'owner'  => redirect()->route('owner.setup'),
            default  => redirect()->route('home')->with('registered', true),
        };
    }
}