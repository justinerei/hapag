@props(['title' => 'Hapag'])
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ $title }} — Hapag</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="font-sans antialiased text-hapag-ink min-h-screen flex flex-col"
      style="background-color:#FFF8EF; background-image:url('/images/texture1.png'); background-repeat:repeat; background-size:1600px auto;">

    {{-- Announcement bar (pushed by individual pages) --}}
    @stack('announcement')

    {{-- ── Guest Navbar ────────────────────────────────────────────────────── --}}
    {{-- Before scroll: transparent, logo + auth only. After scroll: pill card + nav links. --}}
    <div class="sticky top-0 z-50 px-4 pt-4 pb-1">
        <nav id="guest-nav" class="max-w-6xl mx-auto transition-all duration-300 px-6 h-16 flex items-center justify-between">

            {{-- Logo --}}
            <a href="{{ route('home') }}" class="shrink-0">
                <span class="text-2xl font-bold tracking-tight text-hapag-red">Hapag</span>
            </a>

            {{-- Center nav links — hidden until scrolled --}}
            <div id="guest-nav-links" class="hidden md:flex items-center gap-1 opacity-0 pointer-events-none transition-opacity duration-300">
                <a href="{{ route('home') }}"
                   class="px-4 py-2 rounded-full text-sm font-semibold transition-colors
                          {{ request()->routeIs('home') ? 'text-hapag-ink font-bold' : 'text-hapag-gray hover:text-hapag-ink' }}">
                    Home
                </a>
                <a href="{{ route('restaurants.index') }}"
                   class="px-4 py-2 rounded-full text-sm font-semibold transition-colors
                          {{ request()->routeIs('restaurants.*') ? 'text-hapag-ink font-bold' : 'text-hapag-gray hover:text-hapag-ink' }}">
                    Restaurants
                </a>
            </div>

            {{-- Auth actions --}}
            <div class="flex items-center gap-2">
                <button onclick="openLoginModal()"
                        class="hidden sm:block px-4 py-2 text-sm font-semibold text-hapag-gray hover:text-hapag-ink transition-colors">
                    Sign In
                </button>
                <button onclick="openAuthModal()"
                        class="px-5 py-2.5 rounded-full text-sm font-bold bg-hapag-red text-white hover:bg-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                    Sign Up
                </button>

                {{-- Mobile hamburger --}}
                <button id="mobile-menu-btn"
                        class="md:hidden ml-1 p-2 rounded-full text-hapag-gray hover:bg-hapag-cream2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </nav>

        {{-- Mobile dropdown --}}
        <div id="mobile-menu" class="hidden max-w-6xl mx-auto mt-1 bg-white rounded-2xl shadow-md px-4 py-3 space-y-1">
            <a href="{{ route('home') }}"
               class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                      {{ request()->routeIs('home') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">Home</a>
            <a href="{{ route('restaurants.index') }}"
               class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                      {{ request()->routeIs('restaurants.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">Restaurants</a>
            <div class="border-t border-hapag-cream2 pt-2 mt-2 flex gap-2">
                <button onclick="openLoginModal()" class="flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold text-hapag-gray hover:bg-hapag-cream transition-colors">Sign In</button>
                <button onclick="openAuthModal()" class="flex-1 text-center px-4 py-2 rounded-xl text-sm font-bold bg-hapag-red text-white hover:bg-red-700 transition-colors">Sign Up</button>
            </div>
        </div>
    </div>

    {{-- Flash messages --}}
    @if(session('success'))
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div class="flex items-center gap-3 bg-teal-50 border border-hapag-teal text-hapag-teal px-5 py-3 rounded-2xl text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ session('success') }}
            </div>
        </div>
    @endif

    {{-- Page content --}}
    <main class="flex-1">{{ $slot }}</main>

    {{-- ── Footer ─────────────────────────────────────────────────────────── --}}
    <footer class="bg-hapag-ink text-white relative overflow-hidden">
        <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-32">
            <span class="text-[10rem] font-extrabold tracking-tighter text-white/[0.04] leading-none -mb-6">hapag</span>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
                <div>
                    <h3 class="text-2xl font-bold text-hapag-red mb-3">Hapag</h3>
                    <p class="text-sm text-gray-400 leading-relaxed mb-3">Good food, right to your table.<br>Serving Laguna province, Philippines.</p>
                    <span class="inline-block text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/10">Pickup only · Cash on Pickup</span>
                </div>
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</h4>
                    <ul class="space-y-2.5 text-sm">
                        <li><a href="{{ route('home') }}" class="text-gray-400 hover:text-white transition-colors">Home</a></li>
                        <li><a href="{{ route('restaurants.index') }}" class="text-gray-400 hover:text-white transition-colors">Browse Restaurants</a></li>
                        <li><button onclick="openLoginModal()" class="text-gray-400 hover:text-white transition-colors">Sign In</button></li>
                        <li><button onclick="openAuthModal()" class="text-gray-400 hover:text-white transition-colors">Create Account</button></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Get Started</h4>
                    <p class="text-sm text-gray-400 leading-relaxed mb-4">Create a free account to start ordering from local Laguna restaurants.</p>
                    <button onclick="openAuthModal()" class="px-6 py-2.5 rounded-full bg-hapag-red text-white text-sm font-bold hover:bg-red-700 transition-colors">Sign up for free</button>
                </div>
            </div>
            <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p class="text-xs text-gray-600">&copy; {{ date('Y') }} Hapag. For educational use only.</p>
                <p class="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
            </div>
        </div>
    </footer>

    <script>
    (function () {
        const nav   = document.getElementById('guest-nav');
        const links = document.getElementById('guest-nav-links');

        function updateNav() {
            if (window.scrollY > 80) {
                nav.classList.add('bg-white', 'rounded-2xl', 'shadow-md');
                links.classList.remove('opacity-0', 'pointer-events-none');
                links.classList.add('opacity-100');
            } else {
                nav.classList.remove('bg-white', 'rounded-2xl', 'shadow-md');
                links.classList.add('opacity-0', 'pointer-events-none');
                links.classList.remove('opacity-100');
            }
        }

        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();

        document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    })();
    </script>

    <x-auth-modal />
    <x-login-modal />
    @stack('scripts')
</body>
</html>