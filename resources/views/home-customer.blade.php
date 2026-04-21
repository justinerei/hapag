<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Home — Hapag</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased text-hapag-ink min-h-screen flex flex-col bg-white">

{{-- ══════════════════════════════════════════════════════════
     ANNOUNCEMENT BAR
══════════════════════════════════════════════════════════ --}}
@php
    $globalVoucher = $deals->first(fn ($d) => $d->restaurant_id === null);
    if ($globalVoucher) {
        $annDiscount = $globalVoucher->type === 'fixed'
            ? '₱' . number_format($globalVoucher->value, 0)
            : $globalVoucher->value . '%';
        $annMin = $globalVoucher->min_order_amount
            ? '₱' . number_format($globalVoucher->min_order_amount, 0) . ' min. order'
            : 'your next order';
    }
@endphp
<div id="announcement-bar"
     class="bg-hapag-red text-white text-center text-sm py-2.5 px-4 relative">
    @if($globalVoucher)
        <a href="{{ route('restaurants.index') }}" class="font-semibold underline underline-offset-2">Claim</a>
        your {{ $annDiscount }} off for {{ $annMin }}!
    @else
        Order ahead, <a href="{{ route('restaurants.index') }}"
                        class="font-semibold underline underline-offset-2">skip the wait</a>
        — pick up fresh from local Laguna restaurants.
    @endif
    <button onclick="document.getElementById('announcement-bar').remove()"
            class="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </button>
</div>

{{-- ══════════════════════════════════════════════════════════
     STICKY NAVBAR
══════════════════════════════════════════════════════════ --}}
<nav id="main-nav"
     class="sticky top-0 z-50 bg-white border-b border-hapag-cream2 shadow-sm h-14 flex items-center
            transition-all duration-200">
    <div class="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">

        {{-- Logo --}}
        <a href="{{ route('home') }}"
           class="shrink-0 text-xl font-extrabold tracking-tight text-hapag-red mr-1">
            Hapag
        </a>

        {{-- Location pill --}}
        <div class="relative shrink-0" id="loc-wrapper">
            <button id="loc-btn"
                    class="flex items-center gap-1.5 text-sm font-semibold text-hapag-ink
                           hover:text-hapag-red transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-red shrink-0" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span id="loc-label" class="max-w-[120px] truncate">
                    {{ auth()->user()->municipality ?? 'Laguna' }}
                </span>
                <span class="text-hapag-gray font-normal">• Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-hapag-gray" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            <div id="loc-menu"
                 class="hidden absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl
                        border border-hapag-cream2 py-2 min-w-[180px] z-50">
                @foreach(['Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba', 'San Pablo'] as $mun)
                <button onclick="updateMunicipality('{{ $mun }}')"
                        class="w-full text-left px-4 py-2 text-sm font-semibold text-hapag-ink
                               hover:bg-hapag-cream transition-colors">
                    {{ $mun }}
                </button>
                @endforeach
            </div>
        </div>

        {{-- Search bar --}}
        <div class="flex-1 min-w-0">
            <div class="relative max-w-lg">
                <svg xmlns="http://www.w3.org/2000/svg"
                     class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hapag-gray/50 pointer-events-none"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input id="navbar-search" type="text"
                       placeholder="Search for restaurants, cuisines, or dishes..."
                       class="w-full pl-10 pr-4 py-2 rounded-full bg-hapag-cream border border-hapag-cream2
                              text-sm text-hapag-ink placeholder:text-hapag-gray/50
                              focus:outline-none focus:ring-2 focus:ring-hapag-red/20 focus:border-hapag-red
                              transition-colors">
            </div>
        </div>

        {{-- Right icons --}}
        <div class="flex items-center gap-0.5 shrink-0">

            {{-- Favourites --}}
            <a href="{{ route('favorites') }}"
               class="p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-red transition-colors"
               title="Favourites">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </a>

            {{-- Cart --}}
            <a id="cart-nav-link" href="{{ route('cart.index') }}"
               class="relative p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-ink transition-colors"
               title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
                <span id="cart-badge"
                      class="{{ $cartCount > 0 ? '' : 'hidden' }} absolute -top-0.5 -right-0.5
                             bg-hapag-red text-white text-[10px] font-bold
                             min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {{ $cartCount }}
                </span>
            </a>

            {{-- Profile dropdown --}}
            <div class="relative" id="profile-wrapper">
                <button id="profile-btn"
                        class="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full
                               hover:bg-hapag-cream transition-colors">
                    <div class="w-8 h-8 rounded-full bg-hapag-red text-white flex items-center
                                justify-center text-sm font-bold shrink-0">
                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                    </div>
                    <span class="hidden sm:block text-sm font-semibold text-hapag-ink
                                 max-w-[80px] truncate">
                        {{ explode(' ', auth()->user()->name)[0] }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-gray shrink-0" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                <div id="profile-menu"
                     class="hidden absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl
                            border border-hapag-cream2 py-2 w-48 z-50">
                    <div class="px-4 py-2 border-b border-hapag-cream2 mb-1">
                        <p class="text-xs font-bold text-hapag-ink truncate">{{ auth()->user()->name }}</p>
                        <p class="text-xs text-hapag-gray truncate">{{ auth()->user()->email }}</p>
                    </div>
                    <a href="{{ route('orders.index') }}"
                       class="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-hapag-ink
                              hover:bg-hapag-cream transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-gray" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        My Orders
                    </a>
                    <a href="{{ route('profile.edit') }}"
                       class="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-hapag-ink
                              hover:bg-hapag-cream transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-gray" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        My Account
                    </a>
                    <div class="border-t border-hapag-cream2 mt-1 pt-1">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                    class="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-semibold
                                           text-hapag-red hover:bg-red-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Log Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    </div>
</nav>

{{-- ══════════════════════════════════════════════════════════
     MAIN LAYOUT — Floating filter sidebar + Content
══════════════════════════════════════════════════════════ --}}
<div class="flex-1 bg-white">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex gap-6 items-start">

            {{-- ── FLOATING FILTER SIDEBAR (sticky, indented) ────────────── --}}
            <aside id="sidebar"
                   class="hidden lg:block w-[220px] shrink-0 sticky top-20">
                <div class="bg-white rounded-2xl border border-hapag-cream2 shadow-sm px-5 py-5 space-y-4">

                    <h2 class="text-lg font-extrabold text-hapag-ink">Filters</h2>

                    {{-- Sort by --}}
                    <div>
                        <h3 class="text-xs font-bold text-hapag-ink mb-2.5">Sort by</h3>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2.5 cursor-pointer">
                                <input type="radio" name="sort-by" value="relevance" checked
                                       class="w-4 h-4 text-hapag-ink border-gray-300 focus:ring-hapag-red/30"
                                       onchange="applyFilters()">
                                <span class="text-sm text-hapag-ink">Relevance</span>
                            </label>
                            <label class="flex items-center gap-2.5 cursor-pointer">
                                <input type="radio" name="sort-by" value="newest"
                                       class="w-4 h-4 text-hapag-ink border-gray-300 focus:ring-hapag-red/30"
                                       onchange="applyFilters()">
                                <span class="text-sm text-hapag-ink">Newest</span>
                            </label>
                        </div>
                    </div>

                    {{-- Offers --}}
                    <div>
                        <h3 class="text-xs font-bold text-hapag-red mb-2.5">Offers</h3>
                        <label class="flex items-center gap-2.5 cursor-pointer group">
                            <input id="has-deals-check" type="checkbox"
                                   class="w-4 h-4 rounded text-hapag-red border-gray-300 focus:ring-hapag-red/30 cursor-pointer"
                                   onchange="applyFilters()">
                            <span class="text-sm text-hapag-ink group-hover:text-hapag-red transition-colors">
                                Has Active Deals
                            </span>
                        </label>
                    </div>

                    {{-- Cuisines --}}
                    <div>
                        <h3 class="text-xs font-bold text-hapag-red mb-2.5">Cuisines</h3>
                        <div class="space-y-2">
                            @foreach($categories as $cat)
                            <label class="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" value="{{ $cat->id }}"
                                       class="cuisine-check w-4 h-4 rounded text-hapag-red border-gray-300
                                              focus:ring-hapag-red/30 cursor-pointer"
                                       onchange="applyFilters()">
                                <span class="text-sm text-hapag-ink group-hover:text-hapag-red transition-colors">
                                    {{ $cat->name }}
                                </span>
                            </label>
                            @endforeach
                        </div>
                    </div>

                </div>
            </aside>

            {{-- ── MAIN CONTENT ─────────────────────────────────────────── --}}
            <main class="flex-1 min-w-0 space-y-8">

                {{-- ── Weather Card ───────────────────────────────────── --}}
                @if(!empty($weather))
                @php
                    $temp      = round($weather['main']['temp'] ?? 0);
                    $condition = strtolower($weather['weather'][0]['main'] ?? 'clear');
                    $condDesc  = ucfirst($weather['weather'][0]['description'] ?? 'clear sky');
                    $city      = auth()->user()->municipality ?? ($weather['name'] ?? 'Laguna');
                    $weatherImg = asset('images/weather/' . match($weatherTag) {
                        'rainy'  => 'weather-rainy.png',
                        'cloudy' => 'weather-cloudy.png',
                        'cool'   => 'weather-cool.png',
                        default  => 'weather-sunny.png',
                    });
                    $weatherSuggestion = match($weatherTag) {
                        'rainy'  => 'Warm up with hot soups, comfort food, and hot drinks.',
                        'cloudy' => 'A cloudy day calls for freshly baked goods and pastries.',
                        'cool'   => 'Cool weather is perfect for grilled meats and hearty meals.',
                        default  => 'Beat the heat with cold desserts and refreshing drinks.',
                    };
                    $weatherEmoji = match($weatherTag) {
                        'rainy'  => '🌧️',
                        'cloudy' => '☁️',
                        'cool'   => '🍃',
                        default  => '☀️',
                    };
                @endphp
                <section>
                    <div class="rounded-2xl overflow-hidden relative min-h-[170px]"
                         style="background: linear-gradient(135deg, #E63946 0%, #D62839 40%, #C2185B 100%);">

                        {{-- Weather image as background — covers entire card, right-aligned --}}
                        <img src="{{ $weatherImg }}" alt="{{ $weatherTag }}"
                             class="absolute inset-0 w-full h-full object-cover object-right opacity-100">

                        {{-- Gradient overlay so left text stays readable --}}
                        <div class="absolute inset-0"
                             style="background: linear-gradient(to right, #E63946 0%, #E63946 35%, transparent 70%);"></div>

                        {{-- Text content --}}
                        <div class="relative z-10 px-7 py-6 flex flex-col justify-center min-h-[170px]">
                            <p class="text-xl md:text-2xl font-extrabold text-white leading-snug">
                                {{ $weatherEmoji }} It's {{ $temp }}°C and {{ $condition }}<br>in {{ $city }}
                            </p>
                            <p class="text-white/80 text-sm mt-1.5 max-w-sm leading-relaxed">
                                {{ $weatherSuggestion }}
                            </p>
                            @if($suggested->isNotEmpty())
                            <p class="text-white/60 text-xs mt-3">
                                Suggested category: {{ $suggested->pluck('name')->implode(', ') }}
                            </p>
                            @endif
                        </div>
                    </div>
                </section>
                @endif

                {{-- ── Cuisines (rounded-square thumbnails) ───────────── --}}
                <section>
                    <h2 class="text-2xl font-extrabold text-hapag-ink mb-4">Cuisines</h2>
                    @php
                        $cuisineImgs = [
                            'Filipino'  => 'https://i.pinimg.com/1200x/e2/95/a8/e295a8e416096d4172669cb4649e4ae8.jpg',
                            'BBQ'       => 'https://i.pinimg.com/1200x/bb/3d/bb/bb3dbb02d108d02230155960f49b2a6d.jpg',
                            'Ihaw'      => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
                            'Cafe'      => 'https://i.pinimg.com/736x/e0/17/bd/e017bd3ac09b84fd3912f6d794f4cc08.jpg',
                            'Coffee'    => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
                            'Bakery'    => 'https://i.pinimg.com/1200x/ea/e8/34/eae83495a307b0c89fb40a75ac2c861d.jpg',
                            'Fast Food' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
                            'Desserts'  => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
                            'Dessert'   => 'https://i.pinimg.com/1200x/86/bd/6e/86bd6e184792c5e29be52fe23434cbe8.jpg',
                        ];
                    @endphp
                    <div class="flex flex-nowrap gap-5 overflow-x-auto pb-4 w-full" style="scrollbar-width:none; -ms-overflow-style:none;">
                        @foreach($categories as $cat)
                        @php
                            $img = null;
                            foreach ($cuisineImgs as $key => $url) {
                                if (str_contains($cat->name, $key)) { $img = $url; break; }
                            }
                            $img = $img ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';
                        @endphp
                        <button class="shrink-0 flex flex-col items-center gap-2 group w-[120px]"
                                data-cat-id="{{ $cat->id }}">
                            <div class="w-[120px] h-[120px] rounded-2xl overflow-hidden border-2 border-transparent
                        group-hover:border-hapag-red transition-all duration-150 shadow-sm bg-gray-100">
                                <img src="{{ $img }}" alt="{{ $cat->name }}"
                                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                     loading="lazy">
                            </div>
                            <span class="text-xs font-semibold text-hapag-red text-center leading-tight w-full truncate">
                                {{ $cat->name }}
                            </span>
                        </button>
                        @endforeach
                    </div>
                </section>

                {{-- ── Your Daily Deals ──────────────────────────────── --}}
                @if($deals->isNotEmpty())
                <section>
                    <h2 class="text-2xl font-extrabold text-hapag-ink mb-4">Your Daily Deals</h2>
                    <div class="relative">
                        <div id="deals-scroll"
                             class="flex gap-4 overflow-x-auto pb-2" style="scrollbar-width:none;">
                            @foreach($deals as $deal)
                            @php
                                $dr = $deal->restaurant;
                                $discPct  = $deal->type === 'percentage';
                                $discLabel = $discPct
                                    ? $deal->value . '% OFF'
                                    : '₱' . number_format($deal->value, 0) . ' OFF';
                                $dealDesc = $discPct
                                    ? 'Enjoy ' . $deal->value . '% discount on your next ordering!'
                                    : 'Get ₱' . number_format($deal->value, 0) . ' off your next order!';
                                $dealTitle = $dr ? $dr->name : 'Student Discount';
                            @endphp
                            <a href="{{ $dr ? route('restaurants.show', $dr) : route('restaurants.index') }}"
                               class="shrink-0 w-56 rounded-2xl overflow-hidden
                                      hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                               style="background: linear-gradient(135deg, #E63946 0%, #B71C38 50%, #8B1A2B 100%);">
                                <div class="p-5 flex flex-col min-h-[155px] justify-between">
                                    <div>
                                        <p class="text-white font-extrabold text-base leading-tight mb-1.5">
                                            {{ $dealTitle }}
                                        </p>
                                        <p class="text-white/65 text-xs leading-relaxed">
                                            {{ $dealDesc }}
                                        </p>
                                    </div>
                                    <p class="text-white font-extrabold text-2xl font-mono mt-4 leading-none text-right">
                                        {{ $discLabel }}
                                    </p>
                                </div>
                            </a>
                            @endforeach
                        </div>
                        {{-- Scroll arrow --}}
                        <button onclick="scrollRow('deals-scroll', 1)"
                                class="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10
                                       w-8 h-8 rounded-full bg-white shadow-md border border-hapag-cream2
                                       items-center justify-center text-hapag-gray hover:text-hapag-ink transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </section>
                @endif

                {{-- ── Popular In Your Area ──────────────────────────── --}}
                @if($popular->isNotEmpty())
                <section>
                    <h2 class="text-2xl font-extrabold text-hapag-ink mb-4">Popular In Your Area</h2>
                    <div class="relative">
                        <div id="popular-scroll"
                             class="flex gap-4 overflow-x-auto pb-2" style="scrollbar-width:none;">
                            @foreach($popular as $r)
                            <div class="shrink-0 w-52">
                                @include('partials.restaurant-card', [
                                    'restaurant'  => $r,
                                    'hasPromo'    => in_array($r->id, $promoRestaurantIds),
                                    'featuredItem' => $featuredItemMap[$r->id] ?? null,
                                ])
                            </div>
                            @endforeach
                        </div>
                        <button onclick="scrollRow('popular-scroll', 1)"
                                class="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10
                                       w-8 h-8 rounded-full bg-white shadow-md border border-hapag-cream2
                                       items-center justify-center text-hapag-gray hover:text-hapag-ink transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </section>
                @endif

                {{-- ── All Restaurant ────────────────────────────────── --}}
                <section class="pb-10">
                    <h2 class="text-2xl font-extrabold text-hapag-ink mb-4">All Restaurant</h2>

                    @if($restaurants->isEmpty())
                    <div class="text-center py-16">
                        <span class="text-5xl mb-4 block">🍽️</span>
                        <p class="text-hapag-gray font-semibold">No restaurants available yet.</p>
                    </div>
                    @else
                    <div id="all-restaurant-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        @foreach($restaurants as $restaurant)
                        <div class="rest-card-wrapper"
                             data-name="{{ strtolower($restaurant->name) }}"
                             data-category="{{ $restaurant->category_id }}"
                             data-has-promo="{{ in_array($restaurant->id, $promoRestaurantIds) ? 'true' : 'false' }}"
                             data-created="{{ $restaurant->created_at->timestamp }}">
                            @include('partials.restaurant-card', [
                                'restaurant'   => $restaurant,
                                'hasPromo'     => in_array($restaurant->id, $promoRestaurantIds),
                                'featuredItem' => $featuredItemMap[$restaurant->id] ?? null,
                            ])
                        </div>
                        @endforeach
                    </div>

                    <div id="no-results" class="hidden text-center py-16">
                        <span class="text-4xl mb-3 block">🔍</span>
                        <p class="text-hapag-gray font-semibold">No restaurants match your filters.</p>
                        <button onclick="document.querySelectorAll('.cuisine-check').forEach(c=>c.checked=false);
                                         document.getElementById('has-deals-check').checked=false;
                                         document.querySelector('input[name=sort-by][value=relevance]').checked=true;
                                         document.getElementById('navbar-search').value='';
                                         applyFilters();"
                                class="mt-3 text-sm font-semibold text-hapag-red hover:underline">
                            Clear filters
                        </button>
                    </div>
                    @endif
                </section>

            </main>
        </div>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     FOOTER
══════════════════════════════════════════════════════════ --}}
<footer class="bg-hapag-ink text-white relative overflow-hidden">
    <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center
                pointer-events-none select-none overflow-hidden h-32">
        <span class="text-[10rem] font-extrabold tracking-tighter text-white/[0.04]
                     leading-none -mb-6">hapag</span>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</h4>
                <ul class="space-y-2.5 text-sm">
                    <li><a href="{{ route('home') }}"
                           class="text-gray-400 hover:text-white transition-colors font-semibold">Home</a></li>
                    <li><a href="{{ route('restaurants.index') }}"
                           class="text-gray-400 hover:text-white transition-colors font-semibold">Browse Restaurants</a></li>
                    <li><a href="{{ route('cart.index') }}"
                           class="text-gray-400 hover:text-white transition-colors font-semibold">My Cart</a></li>
                    <li><a href="{{ route('orders.index') }}"
                           class="text-gray-400 hover:text-white transition-colors font-semibold">My Orders</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Restaurants</h4>
                <ul class="space-y-2.5 text-sm">
                    @foreach($restaurants->take(5) as $r)
                    <li>
                        <a href="{{ route('restaurants.show', $r) }}"
                           class="text-gray-400 hover:text-white transition-colors font-semibold truncate block">
                            {{ $r->name }}
                        </a>
                    </li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Get Started</h4>
                <p class="text-sm text-gray-400 leading-relaxed mb-4">
                    Create a free account to start ordering from local Laguna restaurants.
                    Your cart saves automatically — come back anytime.
                </p>
                <a href="{{ route('register') }}"
                   class="inline-block bg-hapag-red hover:bg-red-700 text-white text-sm font-bold
                          px-5 py-2.5 rounded-full transition-colors">
                    Sign up for free
                </a>
            </div>
        </div>
        <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p class="text-xs text-gray-600">&copy; {{ date('Y') }} Hapag. For educational use only.</p>
            <p class="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
        </div>
    </div>
</footer>

{{-- ══════════════════════════════════════════════════════════
     CART CONFLICT MODAL
══════════════════════════════════════════════════════════ --}}
<div id="conflict-modal"
     style="display:none;"
     class="fixed inset-0 z-[60] items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <h3 class="font-bold text-hapag-ink text-base">Cart has items from another restaurant</h3>
        </div>
        <p id="conflict-msg" class="text-hapag-gray text-sm mb-5 leading-relaxed">
            Your cart already has items from a different restaurant. Clear it to add from this one?
        </p>
        <div class="flex gap-3">
            <button onclick="closeConflictModal()"
                    class="flex-1 px-4 py-2.5 rounded-xl border border-hapag-cream2 text-sm font-semibold
                           text-hapag-gray hover:bg-hapag-cream transition-colors">
                Cancel
            </button>
            <button id="conflict-confirm-btn"
                    class="flex-1 px-4 py-2.5 rounded-xl bg-hapag-red text-white text-sm font-bold
                           hover:bg-red-700 transition-colors">
                Clear & Add
            </button>
        </div>
    </div>
</div>

{{-- Restaurant setup modal --}}
<x-restaurant-setup-modal />

{{-- ══════════════════════════════════════════════════════════
     SCRIPTS
══════════════════════════════════════════════════════════ --}}
<script>
(function () {

    // ── Navbar blur on scroll ──────────────────────────────────────────────
    window.addEventListener('scroll', function () {
        var nav = document.getElementById('main-nav');
        if (window.scrollY > 10) {
            nav.classList.add('bg-white/95', 'backdrop-blur-md');
        } else {
            nav.classList.remove('bg-white/95', 'backdrop-blur-md');
        }
    }, { passive: true });

    // ── Profile dropdown ───────────────────────────────────────────────────
    var profileBtn  = document.getElementById('profile-btn');
    var profileMenu = document.getElementById('profile-menu');
    var locBtn      = document.getElementById('loc-btn');
    var locMenu     = document.getElementById('loc-menu');

    function closeAllDropdowns() {
        profileMenu && profileMenu.classList.add('hidden');
        locMenu && locMenu.classList.add('hidden');
    }

    profileBtn && profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        locMenu && locMenu.classList.add('hidden');
        profileMenu && profileMenu.classList.toggle('hidden');
    });

    locBtn && locBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        profileMenu && profileMenu.classList.add('hidden');
        locMenu && locMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', closeAllDropdowns);

    // ── Municipality AJAX ──────────────────────────────────────────────────
    window.updateMunicipality = async function (municipality) {
        try {
            var res = await fetch('{{ route("profile.municipality") }}', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ municipality: municipality }),
            });
            if (res.ok) {
                document.getElementById('loc-label').textContent = municipality;
                locMenu && locMenu.classList.add('hidden');
                window.location.reload();
            }
        } catch (e) {
            console.error('Municipality update failed', e);
        }
    };

    // ── Horizontal scroll helpers ──────────────────────────────────────────
    window.scrollRow = function (id, dir) {
        var el = document.getElementById(id);
        if (el) el.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };

    // ── Restaurant grid filtering & sorting ───────────────────────────────
    window.applyFilters = function () {
        var selectedCuisines = Array.from(
            document.querySelectorAll('.cuisine-check:checked')
        ).map(function (el) { return el.value; });

        var hasDeals  = document.getElementById('has-deals-check') ? document.getElementById('has-deals-check').checked : false;
        var sortByEl  = document.querySelector('input[name="sort-by"]:checked');
        var sortBy    = sortByEl ? sortByEl.value : 'relevance';
        var searchEl  = document.getElementById('navbar-search');
        var search    = searchEl ? searchEl.value.toLowerCase().trim() : '';

        var wrappers  = Array.from(document.querySelectorAll('.rest-card-wrapper'));
        var visible   = 0;

        wrappers.forEach(function (w) {
            var catMatch    = selectedCuisines.length === 0 || selectedCuisines.indexOf(w.dataset.category) !== -1;
            var dealsMatch  = !hasDeals || w.dataset.hasPromo === 'true';
            var searchMatch = !search   || w.dataset.name.indexOf(search) !== -1;
            var show = catMatch && dealsMatch && searchMatch;
            w.classList.toggle('hidden', !show);
            if (show) visible++;
        });

        var noResults = document.getElementById('no-results');
        if (noResults) noResults.classList.toggle('hidden', visible > 0);

        var grid   = document.getElementById('all-restaurant-grid');
        var sorted = wrappers.filter(function (w) { return !w.classList.contains('hidden'); });

        if (sortBy === 'newest') {
            sorted.sort(function (a, b) {
                return parseInt(b.dataset.created) - parseInt(a.dataset.created);
            });
        } else {
            sorted.sort(function (a, b) {
                return a.dataset.name.localeCompare(b.dataset.name);
            });
        }

        sorted.forEach(function (w) { grid.appendChild(w); });
    };

    // Search bar live filter
    var searchInput = document.getElementById('navbar-search');
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    // ── Cuisine circles → filter & scroll to grid ─────────────────────────
    document.querySelectorAll('.cuisine-circle-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var catId = this.dataset.catId;

            document.querySelectorAll('.cuisine-check').forEach(function (cb) {
                cb.checked = cb.value === catId;
            });

            applyFilters();

            var grid = document.getElementById('all-restaurant-grid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ── Cart conflict modal state ──────────────────────────────────────────
    var pendingMenuItemId = null;

    window.closeConflictModal = function () {
        document.getElementById('conflict-modal').style.display = 'none';
        pendingMenuItemId = null;
    };

    function showConflictModal(menuItemId, restaurantName) {
        pendingMenuItemId = menuItemId;
        var msg = document.getElementById('conflict-msg');
        if (msg) {
            msg.textContent = 'Your cart has items from another restaurant. Clear it to add from "' +
                              restaurantName + '"?';
        }
        document.getElementById('conflict-modal').style.display = 'flex';
    }

    var confirmBtn = document.getElementById('conflict-confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            if (!pendingMenuItemId) return;

            try {
                await fetch('{{ route("cart.clear") }}', {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                });
            } catch (e) { /* ignore */ }

            closeConflictModal();

            quickAddToCart({ dataset: { menuItem: pendingMenuItemId, restaurantName: '' } });
        });
    }

    // ── Quick add to cart ──────────────────────────────────────────────────
    window.quickAddToCart = async function (btn) {
        var menuItemId = btn.dataset.menuItem;
        if (!menuItemId) return;

        try {
            var res = await fetch('{{ route("cart.add") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ menu_item_id: menuItemId }),
            });

            if (res.status === 409) {
                showConflictModal(menuItemId, btn.dataset.restaurantName || 'this restaurant');
                return;
            }

            if (res.ok) {
                var data = await res.json();
                updateCartBadge(data.cart_count);

                if (btn.classList) {
                    btn.classList.add('scale-125', 'bg-hapag-teal');
                    setTimeout(function () {
                        btn.classList.remove('scale-125', 'bg-hapag-teal');
                    }, 500);
                }
            }
        } catch (e) {
            console.error('Quick add failed:', e);
        }
    };

    function updateCartBadge(count) {
        var badge = document.getElementById('cart-badge');
        if (!badge) return;
        badge.textContent = count;
        badge.classList.toggle('hidden', count <= 0);
    }

})();
</script>

</body>
</html>