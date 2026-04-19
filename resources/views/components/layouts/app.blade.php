@props(['title' => 'Hapag', 'heroMode' => false])
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

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLcE=" crossorigin="" defer></script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="font-sans antialiased bg-hapag-cream text-hapag-ink min-h-screen flex flex-col">

    {{-- Announcement bar slot (pushed from individual pages) --}}
    @stack('announcement')

    {{-- ── Navbar ──────────────────────────────────────────────────────────── --}}
    <nav id="hapag-nav"
         data-hero="{{ $heroMode ? 'true' : 'false' }}"
         class="sticky top-0 z-50 transition-all duration-300
                {{ $heroMode ? '' : 'bg-white/85 backdrop-blur-md border-b border-hapag-cream2/70 shadow-sm' }}">

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">

                {{-- Logo --}}
                <a href="{{ route('home') }}" class="shrink-0">
                    <span id="nav-logo"
                          class="text-2xl font-bold tracking-tight transition-colors duration-300
                                 {{ $heroMode ? 'text-hapag-ink' : 'text-hapag-red' }}">
                        Hapag
                    </span>
                </a>

                {{-- Center nav links --}}
                <div id="nav-center"
                     class="hidden md:flex items-center gap-0.5 transition-all duration-300
                            {{ $heroMode ? 'opacity-0 pointer-events-none' : 'opacity-100' }}">
                    <a href="{{ route('home') }}"
                       class="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150
                              {{ request()->routeIs('home') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream' }}">
                        Home
                    </a>
                    <a href="{{ route('restaurants.index') }}"
                       class="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150
                              {{ request()->routeIs('restaurants.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream' }}">
                        Browse Restaurants
                    </a>
                    @auth
                        @if(auth()->user()->role === 'customer')
                            <a href="{{ route('orders.index') }}"
                               class="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150
                                      {{ request()->routeIs('orders.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream' }}">
                                My Orders
                            </a>
                        @elseif(auth()->user()->role === 'owner')
                            <a href="{{ route('owner.dashboard') }}"
                               class="px-4 py-2 rounded-full text-sm font-semibold text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream transition-colors duration-150">
                                My Restaurant
                            </a>
                        @elseif(auth()->user()->role === 'admin')
                            <a href="{{ route('admin.dashboard') }}"
                               class="px-4 py-2 rounded-full text-sm font-semibold text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream transition-colors duration-150">
                                Admin Panel
                            </a>
                        @endif
                    @else
                        <a href="{{ route('restaurants.index') }}"
                           class="px-4 py-2 rounded-full text-sm font-semibold text-hapag-gray hover:text-hapag-ink hover:bg-hapag-cream transition-colors duration-150">
                            Menu
                        </a>
                    @endauth
                </div>

                {{-- Right side --}}
                <div class="flex items-center gap-2">

                    @auth
                        {{-- Cart (customers only) --}}
                        @if(auth()->user()->role === 'customer')
                            @php $cartCount = \App\Models\CartItem::where('user_id', auth()->id())->sum('quantity'); @endphp
                            <a href="{{ route('cart.index') }}"
                               class="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                                      {{ request()->routeIs('cart.*') ? 'bg-hapag-red text-white' : 'bg-hapag-cream2/80 text-hapag-ink hover:bg-hapag-red hover:text-white' }}
                                      transition-colors duration-150">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span class="hidden sm:inline">Cart</span>
                                <span id="nav-cart-badge"
                                      class="absolute -top-1 -right-1 bg-hapag-red text-white text-xs font-bold w-5 h-5 rounded-full items-center justify-center {{ $cartCount > 0 ? 'flex' : 'hidden' }}">
                                    {{ $cartCount > 99 ? '99+' : $cartCount }}
                                </span>
                            </a>
                        @endif

                        {{-- User dropdown --}}
                        <div class="relative" id="user-dd-root">
                            <button id="user-dd-btn"
                                    class="flex items-center gap-2 px-3 py-2 rounded-full bg-hapag-cream2/80 hover:bg-hapag-cream2 text-sm font-semibold text-hapag-ink transition-colors duration-150">
                                <span class="hidden sm:block max-w-[120px] truncate">{{ auth()->user()->name }}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" id="user-dd-caret"
                                     class="h-4 w-4 text-hapag-gray transition-transform duration-200"
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div id="user-dd-menu"
                                 class="hidden absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-hapag-cream2 py-1 z-50">
                                <div class="px-4 py-2.5 border-b border-hapag-cream2">
                                    <p class="text-xs text-hapag-gray">Signed in as</p>
                                    <p class="text-sm font-semibold text-hapag-ink truncate">{{ auth()->user()->email }}</p>
                                </div>
                                <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-hapag-ink hover:bg-hapag-cream transition-colors">Edit Profile</a>
                                @if(auth()->user()->role === 'owner')
                                    <a href="{{ route('owner.dashboard') }}" class="block px-4 py-2 text-sm text-hapag-ink hover:bg-hapag-cream transition-colors">My Restaurant</a>
                                @elseif(auth()->user()->role === 'admin')
                                    <a href="{{ route('admin.dashboard') }}" class="block px-4 py-2 text-sm text-hapag-ink hover:bg-hapag-cream transition-colors">Admin Panel</a>
                                @endif
                                <div class="border-t border-hapag-cream2 mt-1 pt-1">
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="w-full text-left px-4 py-2 text-sm text-hapag-red hover:bg-red-50 font-semibold transition-colors">
                                            Log out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                    @else
                        <a href="{{ route('login') }}"
                           class="px-4 py-2 rounded-full text-sm font-semibold text-hapag-gray hover:text-hapag-ink transition-colors duration-150">
                            Sign In
                        </a>
                        <a href="{{ route('register') }}"
                           class="px-5 py-2 rounded-full text-sm font-bold bg-hapag-red text-white hover:bg-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                            Sign Up
                        </a>
                    @endauth

                    {{-- Mobile hamburger --}}
                    <button id="mobile-menu-btn"
                            class="md:hidden ml-1 p-2 rounded-full text-hapag-gray hover:bg-hapag-cream2 transition-colors duration-150">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {{-- Mobile menu --}}
        <div id="mobile-menu"
             class="hidden border-t border-hapag-cream2/60 bg-white/95 backdrop-blur-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
                <a href="{{ route('home') }}"
                   class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                          {{ request()->routeIs('home') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">Home</a>
                <a href="{{ route('restaurants.index') }}"
                   class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                          {{ request()->routeIs('restaurants.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">Browse Restaurants</a>
                @auth
                    <a href="{{ route('orders.index') }}"
                       class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                              {{ request()->routeIs('orders.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">My Orders</a>
                    @if(auth()->user()->role === 'customer')
                        <a href="{{ route('cart.index') }}"
                           class="block px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                                  {{ request()->routeIs('cart.*') ? 'bg-hapag-cream2 text-hapag-ink' : 'text-hapag-gray hover:bg-hapag-cream' }}">Cart</a>
                    @endif
                @else
                    <a href="{{ route('restaurants.index') }}"
                       class="block px-4 py-2 rounded-xl text-sm font-semibold text-hapag-gray hover:bg-hapag-cream transition-colors">Menu</a>
                @endauth
            </div>
        </div>
    </nav>

    {{-- ── Flash messages ──────────────────────────────────────────────────── --}}
    @if(session('success'))
        <div id="flash-success" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div class="flex items-center gap-3 bg-teal-50 border border-hapag-teal text-hapag-teal px-5 py-3 rounded-2xl text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ session('success') }}
            </div>
        </div>
    @endif
    @if(session('error') || $errors->any())
        <div id="flash-error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div class="flex items-center gap-3 bg-red-50 border border-hapag-red text-hapag-red px-5 py-3 rounded-2xl text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    @if(session('error'))
                        {{ session('error') }}
                    @else
                        @foreach($errors->all() as $error)<div>{{ $error }}</div>@endforeach
                    @endif
                </div>
            </div>
        </div>
    @endif

    {{-- ── Page content ─────────────────────────────────────────────────────── --}}
    <main class="flex-1">{{ $slot }}</main>

    {{-- ── Footer ──────────────────────────────────────────────────────────── --}}
    <footer class="bg-hapag-ink text-white relative overflow-hidden">
        {{-- Large watermark text --}}
        <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-32">
            <span class="text-[10rem] font-extrabold tracking-tighter text-white/[0.04] leading-none -mb-6">hapag</span>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

                {{-- Brand --}}
                <div>
                    <h3 class="text-2xl font-bold text-hapag-red mb-3">Hapag</h3>
                    <p class="text-sm text-gray-400 leading-relaxed mb-3">
                        Good food, right to your table.<br>Serving Laguna province, Philippines.
                    </p>
                    <span class="inline-block text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        Pickup only · Cash on Pickup
                    </span>
                </div>

                {{-- Explore links --}}
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</h4>
                    <ul class="space-y-2.5 text-sm">
                        <li><a href="{{ route('home') }}" class="text-gray-400 hover:text-white transition-colors">Home</a></li>
                        <li><a href="{{ route('restaurants.index') }}" class="text-gray-400 hover:text-white transition-colors">Browse Restaurants</a></li>
                        @auth
                            <li><a href="{{ route('cart.index') }}" class="text-gray-400 hover:text-white transition-colors">My Cart</a></li>
                            <li><a href="{{ route('orders.index') }}" class="text-gray-400 hover:text-white transition-colors">My Orders</a></li>
                        @else
                            <li><a href="{{ route('login') }}" class="text-gray-400 hover:text-white transition-colors">Sign In</a></li>
                            <li><a href="{{ route('register') }}" class="text-gray-400 hover:text-white transition-colors">Create Account</a></li>
                        @endauth
                    </ul>
                </div>

                {{-- Get Started (guest) / About (auth) --}}
                <div>
                    @guest
                        <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Get Started</h4>
                        <p class="text-sm text-gray-400 leading-relaxed mb-4">
                            Create a free account to start ordering from local Laguna restaurants. Your cart saves automatically.
                        </p>
                        <a href="{{ route('register') }}"
                           class="inline-block px-6 py-2.5 rounded-full bg-hapag-red text-white text-sm font-bold hover:bg-red-700 transition-colors">
                            Sign up for free
                        </a>
                    @else
                        <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">About</h4>
                        <p class="text-sm text-gray-400 leading-relaxed">
                            A school project for ITEL 203 — Web Systems and Technologies at LSPU College of Computer Studies.
                        </p>
                    @endguest
                </div>
            </div>

            <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p class="text-xs text-gray-600">&copy; {{ date('Y') }} Hapag. For educational use only.</p>
                <p class="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
            </div>
        </div>
    </footer>

    {{-- ── Global scripts ───────────────────────────────────────────────────── --}}
    <script>
    (function () {
        const nav     = document.getElementById('hapag-nav');
        const center  = document.getElementById('nav-center');
        const logo    = document.getElementById('nav-logo');
        const isHero  = nav.dataset.hero === 'true';

        function updateNav() {
            const scrolled = window.scrollY > 260;

            if (isHero) {
                if (scrolled) {
                    nav.classList.add('bg-white/85', 'backdrop-blur-md', 'border-b', 'border-hapag-cream2/70', 'shadow-sm');
                    center.classList.remove('opacity-0', 'pointer-events-none');
                    center.classList.add('opacity-100');
                    logo.classList.replace('text-hapag-ink', 'text-hapag-red');
                } else {
                    nav.classList.remove('bg-white/85', 'backdrop-blur-md', 'border-b', 'border-hapag-cream2/70', 'shadow-sm');
                    center.classList.add('opacity-0', 'pointer-events-none');
                    center.classList.remove('opacity-100');
                    logo.classList.replace('text-hapag-red', 'text-hapag-ink');
                }
            }
        }

        if (isHero) {
            window.addEventListener('scroll', updateNav, { passive: true });
            updateNav();
        }

        // Mobile menu
        document.getElementById('mobile-menu-btn')?.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });

        // User dropdown
        const ddBtn  = document.getElementById('user-dd-btn');
        const ddMenu = document.getElementById('user-dd-menu');
        const ddCaret = document.getElementById('user-dd-caret');
        if (ddBtn && ddMenu) {
            ddBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const open = !ddMenu.classList.contains('hidden');
                ddMenu.classList.toggle('hidden');
                ddCaret.style.transform = open ? '' : 'rotate(180deg)';
            });
            document.addEventListener('click', function () {
                ddMenu.classList.add('hidden');
                if (ddCaret) ddCaret.style.transform = '';
            });
        }

        // Auto-dismiss flash messages
        ['flash-success', 'flash-error'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) setTimeout(() => el.style.opacity = '0', 4500);
            if (el) setTimeout(() => el.remove(), 5000);
        });
    })();
    </script>

    @stack('scripts')
</body>
</html>