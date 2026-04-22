<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $restaurant->name }} — Hapag</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased text-hapag-ink min-h-screen flex flex-col bg-white">

{{-- ══════════════════════════════════════════════════════════
     STICKY NAVBAR (same as home-customer)
══════════════════════════════════════════════════════════ --}}
<nav id="main-nav"
     class="sticky top-0 z-50 bg-white border-b border-hapag-cream2 shadow-sm h-14 flex items-center">
    <div class="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">

        <a href="{{ route('home') }}"
           class="shrink-0 text-xl font-extrabold tracking-tight text-hapag-red mr-1">Hapag</a>

        @auth
        <div class="relative shrink-0" id="loc-wrapper">
            <button id="loc-btn" class="flex items-center gap-1.5 text-sm font-semibold text-hapag-ink hover:text-hapag-red transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span id="loc-label" class="max-w-[120px] truncate">{{ auth()->user()->municipality ?? 'Laguna' }}</span>
                <span class="text-hapag-gray font-normal">• Now</span>
            </button>
        </div>
        @endauth

        <div class="flex-1 min-w-0">
            <div class="relative max-w-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hapag-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input id="menu-search" type="text" placeholder="Search for restaurants, cuisines, or dishes..."
                       class="w-full pl-10 pr-4 py-2 rounded-full bg-hapag-cream border border-hapag-cream2 text-sm text-hapag-ink placeholder:text-hapag-gray/50 focus:outline-none focus:ring-2 focus:ring-hapag-red/20 focus:border-hapag-red transition-colors">
            </div>
        </div>

        <div class="flex items-center gap-0.5 shrink-0">
            @auth
            <a href="{{ route('favorites') }}" class="p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-red transition-colors" title="Favourites">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </a>
            <button id="cart-toggle-btn" class="relative p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-ink transition-colors" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"/></svg>
                <span id="cart-badge" class="{{ $cartCount > 0 ? '' : 'hidden' }} absolute -top-0.5 -right-0.5 bg-hapag-red text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{{ $cartCount }}</span>
            </button>
            <div class="relative" id="profile-wrapper">
                <button id="profile-btn" class="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-hapag-cream transition-colors">
                    <div class="w-8 h-8 rounded-full bg-hapag-red text-white flex items-center justify-center text-sm font-bold shrink-0">{{ strtoupper(substr(auth()->user()->name, 0, 1)) }}</div>
                    <span class="hidden sm:block text-sm font-semibold text-hapag-ink max-w-[80px] truncate">{{ explode(' ', auth()->user()->name)[0] }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-gray shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="profile-menu" class="hidden absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-hapag-cream2 py-2 w-48 z-50">
                    <div class="px-4 py-2 border-b border-hapag-cream2 mb-1">
                        <p class="text-xs font-bold text-hapag-ink truncate">{{ auth()->user()->name }}</p>
                        <p class="text-xs text-hapag-gray truncate">{{ auth()->user()->email }}</p>
                    </div>
                    <a href="{{ route('orders.index') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-hapag-ink hover:bg-hapag-cream transition-colors">My Orders</a>
                    <a href="{{ route('profile.edit') }}" class="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-hapag-ink hover:bg-hapag-cream transition-colors">My Account</a>
                    <div class="border-t border-hapag-cream2 mt-1 pt-1">
                        <form method="POST" action="{{ route('logout') }}">@csrf
                            <button type="submit" class="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-semibold text-hapag-red hover:bg-red-50 transition-colors">Log Out</button>
                        </form>
                    </div>
                </div>
            </div>
            @else
            <a href="{{ route('login') }}" class="text-sm font-semibold text-hapag-red hover:underline">Log in</a>
            @endauth
        </div>
    </div>
</nav>

{{-- ══════════════════════════════════════════════════════════
     HERO BANNER
══════════════════════════════════════════════════════════ --}}
<div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
    <div class="relative rounded-2xl overflow-hidden h-48 sm:h-56 md:h-64 bg-hapag-cream2">
        @if($restaurant->image_url)
            <img src="{{ $restaurant->image_url }}" alt="{{ $restaurant->name }}"
                 class="w-full h-full object-cover">
        @else
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-hapag-cream to-hapag-cream2">
                <span class="text-8xl">{{ $restaurant->category?->icon ?? '🍽️' }}</span>
            </div>
        @endif
        {{-- Favourite heart --}}
        @auth
        <button class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-hapag-gray hover:text-hapag-red transition-colors"
                onclick="var svg=this.querySelector('svg'); var f=svg.getAttribute('fill')==='currentColor'; svg.setAttribute('fill',f?'none':'currentColor'); this.classList.toggle('text-hapag-red',!f); this.classList.toggle('text-hapag-gray',f);">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
        </button>
        @endauth
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     TWO-COLUMN BODY — sidebar + menu
══════════════════════════════════════════════════════════ --}}
<div class="flex-1">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {{-- Restaurant name + info row (spans full width, above the 2-col split) --}}
        <div class="flex items-start justify-between gap-6 mb-6">
            <div>
                <h1 class="text-2xl font-extrabold text-hapag-ink leading-tight">{{ $restaurant->name }}</h1>
                <div class="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                    <span class="text-hapag-red font-semibold">Owner: {{ $restaurant->owner->name ?? 'N/A' }}</span>
                    <span class="text-hapag-amber font-semibold">{{ $restaurant->opening_time ?? '10:00 AM' }} – {{ $restaurant->closing_time ?? '9:30 PM' }}</span>
                </div>
                <p class="text-hapag-gray text-xs mt-0.5">Location: {{ $restaurant->municipality }}, Laguna</p>
                @if($restaurant->description)
                <p class="text-hapag-gray text-xs mt-2 leading-relaxed max-w-md">{{ $restaurant->description }}</p>
                @endif
            </div>
            {{-- Search in restaurant (right side, matching Figma) --}}
            <div class="hidden sm:block shrink-0 w-72">
                <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hapag-gray/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input id="restaurant-search" type="text" placeholder="Search for restaurants, cuisines, or dishes..."
                           class="w-full pl-10 pr-4 py-2.5 rounded-full border border-hapag-cream2 bg-white text-sm text-hapag-ink placeholder:text-hapag-gray/50 focus:outline-none focus:ring-2 focus:ring-hapag-red/20 focus:border-hapag-red transition-colors">
                </div>
            </div>
        </div>

        {{-- Two-column split --}}
        <div class="flex gap-8 items-start">

            {{-- ── LEFT SIDEBAR (sticky) ─────────────────────────────── --}}
            <aside class="hidden lg:block w-[220px] shrink-0 sticky top-20">
                <nav class="space-y-0">
                    <a href="#section-featured" data-cat-nav="featured"
                       class="cat-nav-link flex items-center px-3 py-2.5 text-sm font-bold text-hapag-ink border-l-[3px] border-hapag-ink bg-hapag-cream/50 rounded-r-lg transition-all">
                        Featured Items
                    </a>
                    @foreach($menuItems->keys() as $category)
                    <a href="#section-{{ Str::slug($category) }}" data-cat-nav="{{ Str::slug($category) }}"
                       class="cat-nav-link flex items-center px-3 py-2.5 text-sm font-semibold text-hapag-red border-l-[3px] border-transparent hover:border-hapag-red/30 hover:bg-hapag-cream/30 rounded-r-lg transition-all">
                        {{ $category }}
                    </a>
                    @endforeach
                </nav>
            </aside>

            {{-- ── MAIN CONTENT ─────────────────────────────────────── --}}
            <main class="flex-1 min-w-0">

                {{-- ── Promos (only restaurant-specific vouchers) ────── --}}
                @if($restaurantVouchers->isNotEmpty())
                <section class="mb-8">
                    <h2 class="text-xl font-extrabold text-hapag-ink mb-3">Promos</h2>
                    <div class="flex gap-4 overflow-x-auto pb-2" style="scrollbar-width:none;">
                        @foreach($restaurantVouchers as $v)
                        @php
                            $discLabel = $v->type === 'percentage'
                                ? number_format($v->value, 0) . '% OFF'
                                : '₱' . number_format($v->value, 0) . ' OFF';
                            $dealDesc = $v->type === 'percentage'
                                ? 'Enjoy ' . $v->value . '% discount on your next ordering!'
                                : 'Get ₱' . number_format($v->value, 0) . ' off your next order!';
                        @endphp
                        <div class="shrink-0 w-52 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                             style="background: linear-gradient(135deg, #E63946 0%, #B71C38 50%, #8B1A2B 100%);"
                             onclick="claimPromo('{{ $v->code }}')">
                            <div class="p-5 flex flex-col min-h-[140px] justify-between">
                                <div>
                                    <p class="text-white font-extrabold text-sm leading-tight mb-1">{{ $restaurant->name }}</p>
                                    <p class="text-white/65 text-xs leading-relaxed">{{ $dealDesc }}</p>
                                </div>
                                <div class="flex items-center justify-between mt-3">
                                    <p class="text-white font-extrabold text-xl font-mono leading-none">{{ $discLabel }}</p>
                                    <span class="text-white/80 text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">Claim</span>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif

                {{-- ── Featured Items ───────────────────────────────── --}}
                @if($featuredItems->isNotEmpty())
                <section id="section-featured" class="mb-8 scroll-mt-20">
                    <h2 class="text-xl font-extrabold text-hapag-ink mb-3">Featured Items</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        @foreach($featuredItems as $item)
                        <div class="group cursor-pointer" onclick="openItemModal({{ $item->id }})">
                            <div class="relative aspect-square rounded-2xl overflow-hidden bg-hapag-cream2">
                                @if($item->image_url)
                                    <img src="{{ $item->image_url }}" alt="{{ $item->name }}"
                                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                                @else
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-hapag-cream to-hapag-cream2">
                                        <span class="text-5xl">{{ $restaurant->category?->icon ?? '🍽️' }}</span>
                                    </div>
                                @endif
                                @auth
                                <button onclick="event.stopPropagation(); openItemModal({{ $item->id }})"
                                        class="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-hapag-ink hover:bg-hapag-red hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                                    </svg>
                                </button>
                                @endauth
                            </div>
                            <h3 class="font-bold text-sm text-hapag-ink mt-2 leading-tight group-hover:text-hapag-red transition-colors">{{ $item->name }}</h3>
                            <p class="text-hapag-ink text-xs font-mono font-semibold mt-0.5">₱ {{ number_format($item->price, 2) }}</p>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif

                {{-- ── Menu Categories ──────────────────────────────── --}}
                @foreach($menuItems as $category => $items)
                <section id="section-{{ Str::slug($category) }}" class="mb-8 scroll-mt-20 menu-section" data-category="{{ $category }}">
                    <h2 class="text-xl font-extrabold text-hapag-ink mb-3">{{ $category }}</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @foreach($items as $item)
                        <div class="menu-item-card flex items-stretch border border-hapag-cream2 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
                             data-item-name="{{ strtolower($item->name) }}"
                             onclick="openItemModal({{ $item->id }})">
                            {{-- Text side --}}
                            <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
                                <div>
                                    <h3 class="font-bold text-sm text-hapag-ink leading-tight">{{ $item->name }}</h3>
                                    @if($item->description)
                                    <p class="text-hapag-gray text-xs mt-1 leading-relaxed line-clamp-2">{{ $item->description }}</p>
                                    @endif
                                </div>
                                <div class="flex items-center justify-between mt-3">
                                    <p class="text-hapag-ink text-sm font-mono font-semibold">₱ {{ number_format($item->price, 2) }}</p>
                                    @auth
                                    <button onclick="event.stopPropagation(); openItemModal({{ $item->id }})"
                                            class="w-7 h-7 rounded-full bg-hapag-cream border border-hapag-cream2 flex items-center justify-center text-hapag-ink hover:bg-hapag-red hover:text-white hover:border-hapag-red transition-colors shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                                        </svg>
                                    </button>
                                    @endauth
                                </div>
                            </div>
                            {{-- Image side --}}
                            <div class="w-32 sm:w-36 shrink-0 bg-hapag-cream2">
                                @if($item->image_url)
                                    <img src="{{ $item->image_url }}" alt="{{ $item->name }}" class="w-full h-full object-cover" loading="lazy">
                                @else
                                    <div class="w-full h-full flex items-center justify-center">
                                        <span class="text-3xl">{{ $restaurant->category?->icon ?? '🍽️' }}</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endforeach

                {{-- No results --}}
                <div id="menu-no-results" class="hidden text-center py-12">
                    <span class="text-4xl mb-3 block">🔍</span>
                    <p class="text-hapag-gray font-semibold text-sm">No menu items match your search.</p>
                </div>

            </main>
        </div>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     ITEM DETAIL MODAL (Uber Eats style)
══════════════════════════════════════════════════════════ --}}
<div id="item-modal-overlay" class="fixed inset-0 z-[100] hidden">
    <div id="item-modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative flex items-center justify-center min-h-screen p-4">
        <div id="item-modal-card" class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col scale-95 opacity-0 transition-all duration-200">

            {{-- Close button --}}
            <button onclick="closeItemModal()" class="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-hapag-ink hover:bg-hapag-cream transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>

            {{-- Scrollable content --}}
            <div class="overflow-y-auto flex-1">
                {{-- Image + details split --}}
                <div class="flex flex-col sm:flex-row">
                    {{-- Image --}}
                    <div id="modal-image-wrap" class="sm:w-1/2 aspect-square bg-hapag-cream2 shrink-0 flex items-center justify-center overflow-hidden">
                        <img id="modal-image" src="" alt="" class="w-full h-full object-cover hidden">
                        <span id="modal-image-fallback" class="text-7xl">🍽️</span>
                    </div>
                    {{-- Details --}}
                    <div class="sm:w-1/2 p-6 flex flex-col">
                        <h2 id="modal-name" class="text-2xl font-extrabold text-hapag-ink leading-tight"></h2>
                        <p id="modal-price" class="text-lg font-mono font-bold text-hapag-ink mt-1"></p>
                        <p id="modal-desc" class="text-hapag-gray text-sm mt-3 leading-relaxed"></p>
                    </div>
                </div>

                {{-- Special instructions --}}
                <div class="px-6 py-4 border-t border-hapag-cream2">
                    <h3 class="text-sm font-bold text-hapag-ink mb-2">Special Instructions</h3>
                    <p class="text-hapag-gray text-xs mb-2">Any specific preferences or allergies? Let the restaurant know.</p>
                    <textarea id="modal-instructions" rows="2" placeholder="e.g. No onions, extra sauce..."
                              class="w-full px-3 py-2 rounded-xl border border-hapag-cream2 bg-hapag-cream text-sm text-hapag-ink placeholder:text-hapag-gray/50 focus:outline-none focus:ring-2 focus:ring-hapag-red/20 focus:border-hapag-red resize-none transition-colors"></textarea>
                </div>
            </div>

            {{-- Fixed bottom bar --}}
            <div class="border-t border-hapag-cream2 px-6 py-4 bg-white shrink-0">
                <div class="flex items-center gap-4">
                    {{-- Quantity picker --}}
                    <div class="flex items-center gap-0 border border-hapag-cream2 rounded-full overflow-hidden shrink-0">
                        <button onclick="modalQty(-1)" class="w-10 h-10 flex items-center justify-center text-hapag-ink hover:bg-hapag-cream transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
                        </button>
                        <span id="modal-qty" class="w-8 text-center text-sm font-bold text-hapag-ink">1</span>
                        <button onclick="modalQty(1)" class="w-10 h-10 flex items-center justify-center text-hapag-ink hover:bg-hapag-cream transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                    {{-- Add to cart button --}}
                    <button id="modal-add-btn" onclick="addFromModal()"
                            class="flex-1 py-3 rounded-xl bg-hapag-ink text-white text-sm font-bold hover:bg-black transition-colors text-center">
                        Add 1 to order • <span id="modal-total-price">₱0.00</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     CART SIDEBAR PANEL (Uber Eats style — slides from right)
══════════════════════════════════════════════════════════ --}}
<div id="cart-overlay" class="fixed inset-0 z-[90] hidden">
    <div id="cart-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeCartPanel()"></div>
    <div id="cart-panel" class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col translate-x-full transition-transform duration-300 ease-out">

        {{-- Header --}}
        <div class="flex items-center justify-between px-5 py-4 border-b border-hapag-cream2 shrink-0">
            <button onclick="closeCartPanel()" class="w-9 h-9 rounded-full hover:bg-hapag-cream flex items-center justify-center text-hapag-ink transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h2 class="text-base font-extrabold text-hapag-ink">Your Cart</h2>
            <div class="w-9"></div>
        </div>

        {{-- Cart restaurant info --}}
        <div id="cart-restaurant-info" class="px-5 py-3 border-b border-hapag-cream2 shrink-0 hidden">
            <p id="cart-resto-name" class="text-sm font-bold text-hapag-ink"></p>
            <p id="cart-resto-location" class="text-xs text-hapag-gray"></p>
        </div>

        {{-- Cart items (scrollable) --}}
        <div id="cart-items-list" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {{-- Populated via JS --}}
        </div>

        {{-- Empty state --}}
        <div id="cart-empty" class="flex-1 flex flex-col items-center justify-center px-5 hidden">
            <span class="text-5xl mb-3">🛒</span>
            <p class="text-hapag-gray font-semibold text-sm">Your cart is empty</p>
            <p class="text-hapag-gray text-xs mt-1">Add items from the menu to get started.</p>
        </div>

        {{-- Promo / Voucher section --}}
        <div id="cart-promo-section" class="border-t border-hapag-cream2 px-5 py-4 shrink-0 hidden">
            <h3 class="text-sm font-bold text-hapag-ink mb-2">Apply a promo</h3>

            {{-- Code input --}}
            <div class="flex gap-2 mb-3">
                <input id="promo-code-input" type="text" placeholder="Enter promo code"
                       class="flex-1 px-3 py-2 rounded-xl border border-hapag-cream2 bg-hapag-cream text-sm text-hapag-ink placeholder:text-hapag-gray/50 focus:outline-none focus:ring-2 focus:ring-hapag-red/20 focus:border-hapag-red transition-colors uppercase">
                <button id="promo-apply-btn" onclick="applyPromoCode()"
                        class="px-4 py-2 rounded-xl bg-hapag-red text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0">
                    Apply
                </button>
            </div>

            {{-- Error / success message --}}
            <div id="promo-message" class="hidden text-xs px-3 py-2 rounded-xl mb-3"></div>

            {{-- Applied promo display --}}
            <div id="promo-applied" class="hidden flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-2">
                <div class="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-hapag-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    <div class="min-w-0">
                        <p id="promo-applied-code" class="text-xs font-bold text-hapag-teal truncate"></p>
                        <p id="promo-applied-discount" class="text-[10px] text-hapag-gray"></p>
                    </div>
                </div>
                <button onclick="removePromo()" class="text-hapag-red hover:text-red-700 shrink-0 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            {{-- Available promos (claimable) --}}
            <div id="promo-available-list" class="space-y-2 mt-2">
                {{-- Populated by JS --}}
            </div>
        </div>

        {{-- Footer --}}
        <div id="cart-footer" class="border-t border-hapag-cream2 px-5 py-4 shrink-0 hidden">
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-hapag-gray">Subtotal</span>
                <span id="cart-subtotal" class="text-sm font-mono text-hapag-gray">₱0.00</span>
            </div>
            <div id="cart-discount-row" class="hidden flex items-center justify-between mb-1">
                <span class="text-sm text-hapag-teal font-semibold">Discount</span>
                <span id="cart-discount" class="text-sm font-mono text-hapag-teal font-semibold">-₱0.00</span>
            </div>
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-bold text-hapag-ink">Total</span>
                <span id="cart-total" class="text-base font-extrabold font-mono text-hapag-ink">₱0.00</span>
            </div>
            <a href="{{ route('cart.index') }}"
               class="block w-full py-3.5 rounded-xl bg-hapag-ink text-white text-sm font-bold text-center hover:bg-black transition-colors">
                Go to checkout
            </a>
        </div>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     CART CONFLICT MODAL
══════════════════════════════════════════════════════════ --}}
<div id="conflict-modal" style="display:none;" class="fixed inset-0 z-[110] items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 class="font-bold text-hapag-ink text-base">Different restaurant</h3>
        </div>
        <p id="conflict-msg" class="text-hapag-gray text-sm mb-5 leading-relaxed">Your cart has items from another restaurant. Clear it to add from this one?</p>
        <div class="flex gap-3">
            <button onclick="closeConflictModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-hapag-cream2 text-sm font-semibold text-hapag-gray hover:bg-hapag-cream transition-colors">Cancel</button>
            <button id="conflict-confirm-btn" class="flex-1 px-4 py-2.5 rounded-xl bg-hapag-red text-white text-sm font-bold hover:bg-red-700 transition-colors">Clear & Add</button>
        </div>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════
     FOOTER
══════════════════════════════════════════════════════════ --}}
<footer class="bg-hapag-ink text-white relative overflow-hidden">
    <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-32">
        <span class="text-[10rem] font-extrabold tracking-tighter text-white/[0.04] leading-none -mb-6">hapag</span>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Explore</h4>
                <ul class="space-y-2.5 text-sm">
                    <li><a href="{{ route('home') }}" class="text-gray-400 hover:text-white transition-colors font-semibold">Home</a></li>
                    <li><a href="{{ route('restaurants.index') }}" class="text-gray-400 hover:text-white transition-colors font-semibold">Browse Restaurants</a></li>
                    @auth
                    <li><a href="{{ route('cart.index') }}" class="text-gray-400 hover:text-white transition-colors font-semibold">My Cart</a></li>
                    <li><a href="{{ route('orders.index') }}" class="text-gray-400 hover:text-white transition-colors font-semibold">My Orders</a></li>
                    @endauth
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Restaurants</h4>
                <ul class="space-y-2.5 text-sm">
                    @foreach($allRestaurants as $r)
                    <li><a href="{{ route('restaurants.show', $r) }}" class="text-gray-400 hover:text-white transition-colors font-semibold truncate block">{{ $r->name }}</a></li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Get Started</h4>
                <p class="text-sm text-gray-400 leading-relaxed mb-4">Create a free account to start ordering from local Laguna restaurants. Your cart saves automatically — come back anytime.</p>
                <a href="{{ route('register') }}" class="inline-block bg-hapag-red hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors">Sign up for free</a>
            </div>
        </div>
        <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p class="text-xs text-gray-600">&copy; {{ date('Y') }} Hapag. For educational use only.</p>
            <p class="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
        </div>
    </div>
</footer>

{{-- ══════════════════════════════════════════════════════════
     MENU ITEMS JSON (for modal)
══════════════════════════════════════════════════════════ --}}
@php
    // Merge all menu items + featured items into one keyed collection for the JS modal
    $allItems = $menuItems->flatten()->keyBy('id');
    foreach ($featuredItems as $fi) {
        $allItems[$fi->id] = $fi;
    }
    $menuJson = $allItems->mapWithKeys(function ($i) {
        return [$i->id => [
            'id'          => $i->id,
            'name'        => $i->name,
            'description' => $i->description,
            'price'       => (float) $i->price,
            'category'    => $i->category,
            'image_url'   => $i->image_url ?? null,
        ]];
    });
@endphp
<script>
var MENU_DATA = @json($menuJson);
var RESTAURANT_ID   = {{ $restaurant->id }};
var RESTAURANT_NAME = @json($restaurant->name);
var CSRF_TOKEN      = document.querySelector('meta[name="csrf-token"]').content;
var IS_AUTH         = {{ auth()->check() ? 'true' : 'false' }};

@php
    $promosJson = $allVouchers->map(function ($v) {
        $label = $v->type === 'percentage'
            ? number_format($v->value, 0) . '% OFF'
            : '₱' . number_format($v->value, 0) . ' OFF';
        return [
            'code'  => $v->code,
            'label' => $label,
            'type'  => $v->type,
            'value' => (float) $v->value,
            'min'   => $v->min_order_amount ? (float) $v->min_order_amount : null,
            'scope' => $v->restaurant_id ? 'restaurant' : 'site-wide',
        ];
    });
@endphp
var AVAILABLE_PROMOS = @json($promosJson);
var appliedPromoCode = null;
var appliedDiscount  = 0;
</script>

{{-- ══════════════════════════════════════════════════════════
     SCRIPTS
══════════════════════════════════════════════════════════ --}}
<script>
(function () {

    // ── Profile dropdown ───────────────────────────────────────────────────
    var profileBtn  = document.getElementById('profile-btn');
    var profileMenu = document.getElementById('profile-menu');
    if (profileBtn) {
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function () { profileMenu.classList.add('hidden'); });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ITEM DETAIL MODAL
    // ═══════════════════════════════════════════════════════════════════════
    var currentItemId = null;
    var currentQty    = 1;
    var currentPrice  = 0;

    var overlay  = document.getElementById('item-modal-overlay');
    var card     = document.getElementById('item-modal-card');
    var backdrop = document.getElementById('item-modal-backdrop');

    window.openItemModal = function (itemId) {
        if (!IS_AUTH) { window.location.href = '{{ route("login") }}'; return; }

        var item = MENU_DATA[itemId];
        if (!item) return;

        currentItemId = itemId;
        currentQty    = 1;
        currentPrice  = item.price;

        // Populate
        document.getElementById('modal-name').textContent  = item.name;
        document.getElementById('modal-price').textContent  = '₱' + item.price.toFixed(2);
        document.getElementById('modal-desc').textContent   = item.description || 'A delicious dish from ' + RESTAURANT_NAME + '.';
        document.getElementById('modal-qty').textContent     = '1';
        document.getElementById('modal-instructions').value  = '';
        updateModalTotal();

        var img     = document.getElementById('modal-image');
        var fallback = document.getElementById('modal-image-fallback');
        if (item.image_url) {
            img.src = item.image_url;
            img.alt = item.name;
            img.classList.remove('hidden');
            fallback.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            fallback.classList.remove('hidden');
        }

        // Show
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });
    };

    window.closeItemModal = function () {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(function () {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 200);
    };

    backdrop.addEventListener('click', closeItemModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeItemModal();
    });

    window.modalQty = function (delta) {
        currentQty = Math.max(1, Math.min(99, currentQty + delta));
        document.getElementById('modal-qty').textContent = currentQty;
        updateModalTotal();
    };

    function updateModalTotal() {
        var total = currentPrice * currentQty;
        document.getElementById('modal-total-price').textContent = '₱' + total.toFixed(2);
        document.getElementById('modal-add-btn').innerHTML =
            'Add ' + currentQty + ' to order &bull; <span id="modal-total-price">₱' + total.toFixed(2) + '</span>';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADD TO CART FROM MODAL
    // ═══════════════════════════════════════════════════════════════════════
    window.addFromModal = async function () {
        if (!currentItemId) return;

        var btn = document.getElementById('modal-add-btn');
        var originalHTML = btn.innerHTML;
        btn.textContent = 'Adding...';
        btn.disabled = true;

        try {
            var res = await fetch('{{ route("cart.add") }}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF_TOKEN },
                body: JSON.stringify({ menu_item_id: currentItemId, quantity: currentQty }),
            });

            if (res.status === 409) {
                closeItemModal();
                showConflictModal(currentItemId);
                return;
            }

            if (res.ok) {
                var data = await res.json();
                updateCartBadge(data.cart_count);
                closeItemModal();

                // Show green success toast
                var itemName = MENU_DATA[currentItemId] ? MENU_DATA[currentItemId].name : 'Item';
                showToast(currentQty + 'x ' + itemName + ' added to cart!');
            }
        } catch (e) {
            console.error('Add to cart failed:', e);
            showToast('Failed to add item. Try again.', true);
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // QUICK ADD (+ button without opening modal — adds 1 directly)
    // ═══════════════════════════════════════════════════════════════════════
    window.quickAdd = async function (itemId, event) {
        if (event) { event.stopPropagation(); event.preventDefault(); }
        if (!IS_AUTH) { window.location.href = '{{ route("login") }}'; return; }

        try {
            var res = await fetch('{{ route("cart.add") }}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF_TOKEN },
                body: JSON.stringify({ menu_item_id: itemId, quantity: 1 }),
            });

            if (res.status === 409) {
                showConflictModal(itemId);
                return;
            }

            if (res.ok) {
                var data = await res.json();
                updateCartBadge(data.cart_count);
                var itemName = MENU_DATA[itemId] ? MENU_DATA[itemId].name : 'Item';
                showToast(itemName + ' added to cart!');
            }
        } catch (e) {
            console.error('Quick add failed:', e);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOAST NOTIFICATION
    // ═══════════════════════════════════════════════════════════════════════
    window.showToast = function (message, isError) {
        // Remove existing toast if any
        var existing = document.getElementById('hapag-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.id = 'hapag-toast';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all duration-300 opacity-0 -translate-y-4';
        toast.style.background = isError ? '#E63946' : '#2A9D8F';
        toast.innerHTML = '<div class="flex items-center gap-2">' +
            (isError
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
            ) +
            '<span>' + message + '</span></div>';

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(function () {
            toast.classList.remove('opacity-0', '-translate-y-4');
            toast.classList.add('opacity-100', 'translate-y-0');
        });

        // Auto-dismiss after 2.5s
        setTimeout(function () {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', '-translate-y-4');
            setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CART SIDEBAR PANEL
    // ═══════════════════════════════════════════════════════════════════════
    var cartOverlay = document.getElementById('cart-overlay');
    var cartPanel   = document.getElementById('cart-panel');

    var cartToggle = document.getElementById('cart-toggle-btn');
    if (cartToggle) {
        cartToggle.addEventListener('click', function () {
            if (cartOverlay.classList.contains('hidden')) {
                openCartPanel();
            } else {
                closeCartPanel();
            }
        });
    }

    window.openCartPanel = function () {
        refreshCartPanel();
        cartOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
            cartPanel.classList.remove('translate-x-full');
            cartPanel.classList.add('translate-x-0');
        });
    };

    window.closeCartPanel = function () {
        cartPanel.classList.remove('translate-x-0');
        cartPanel.classList.add('translate-x-full');
        setTimeout(function () {
            cartOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    };

    window.refreshCartPanel = async function () {
        try {
            var res  = await fetch('{{ route("cart.json") }}');
            var data = await res.json();

            var list        = document.getElementById('cart-items-list');
            var empty       = document.getElementById('cart-empty');
            var footer      = document.getElementById('cart-footer');
            var restoInfo   = document.getElementById('cart-restaurant-info');
            var promoSection = document.getElementById('cart-promo-section');

            if (data.items.length === 0) {
                list.innerHTML = '';
                list.classList.add('hidden');
                empty.classList.remove('hidden');
                footer.classList.add('hidden');
                restoInfo.classList.add('hidden');
                if (promoSection) promoSection.classList.add('hidden');
                appliedPromoCode = null;
                appliedDiscount = 0;
                return;
            }

            empty.classList.add('hidden');
            list.classList.remove('hidden');
            footer.classList.remove('hidden');
            if (promoSection) promoSection.classList.remove('hidden');

            if (data.restaurant) {
                restoInfo.classList.remove('hidden');
                document.getElementById('cart-resto-name').textContent = data.restaurant.name;
                document.getElementById('cart-resto-location').textContent = data.restaurant.municipality;
            }

            // Render items
            list.innerHTML = data.items.map(function (item) {
                return '<div class="flex items-center gap-3 py-2 border-b border-hapag-cream2 last:border-0">' +
                    '<div class="flex-1 min-w-0">' +
                        '<p class="text-sm font-semibold text-hapag-ink truncate">' + item.name + '</p>' +
                        '<p class="text-xs font-mono text-hapag-gray">₱' + item.price.toFixed(2) + '</p>' +
                    '</div>' +
                    '<div class="flex items-center gap-0 border border-hapag-cream2 rounded-full overflow-hidden shrink-0">' +
                        '<button onclick="updateCartItem(' + item.id + ', ' + (item.quantity - 1) + ')" class="w-8 h-8 flex items-center justify-center text-hapag-ink hover:bg-hapag-cream transition-colors">' +
                            (item.quantity <= 1
                                ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-hapag-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>'
                                : '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>'
                            ) +
                        '</button>' +
                        '<span class="w-6 text-center text-xs font-bold text-hapag-ink">' + item.quantity + '</span>' +
                        '<button onclick="updateCartItem(' + item.id + ', ' + (item.quantity + 1) + ')" class="w-8 h-8 flex items-center justify-center text-hapag-ink hover:bg-hapag-cream transition-colors">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');

            // Update totals
            var subtotal = data.subtotal;
            document.getElementById('cart-subtotal').textContent = '₱' + subtotal.toFixed(2);

            var discountRow = document.getElementById('cart-discount-row');
            if (appliedPromoCode && appliedDiscount > 0) {
                discountRow.classList.remove('hidden');
                document.getElementById('cart-discount').textContent = '-₱' + appliedDiscount.toFixed(2);
                document.getElementById('cart-total').textContent = '₱' + Math.max(0, subtotal - appliedDiscount).toFixed(2);
            } else {
                discountRow.classList.add('hidden');
                document.getElementById('cart-total').textContent = '₱' + subtotal.toFixed(2);
            }

            updateCartBadge(data.count);
            renderAvailablePromos();
        } catch (e) {
            console.error('Cart refresh failed:', e);
        }
    };

    window.updateCartItem = async function (cartItemId, newQty) {
        try {
            if (newQty <= 0) {
                await fetch('/cart/' + cartItemId, {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': CSRF_TOKEN },
                });
            } else {
                await fetch('/cart/' + cartItemId, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF_TOKEN },
                    body: JSON.stringify({ quantity: newQty }),
                });
            }
            // If cart changes, re-validate promo
            if (appliedPromoCode) {
                await validateAndApplyPromo(appliedPromoCode, true);
            }
            refreshCartPanel();
        } catch (e) {
            console.error('Cart update failed:', e);
        }
    };

    function updateCartBadge(count) {
        var badge = document.getElementById('cart-badge');
        if (!badge) return;
        badge.textContent = count;
        badge.classList.toggle('hidden', count <= 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROMO / VOUCHER SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    // Claim promo from the restaurant menu promo cards
    window.claimPromo = function (code) {
        if (!IS_AUTH) { window.location.href = '{{ route("login") }}'; return; }
        openCartPanel();
        // Auto-fill and apply the code
        var input = document.getElementById('promo-code-input');
        if (input) input.value = code;
        setTimeout(function () { applyPromoCode(); }, 300);
    };

    // Apply promo from the code input
    window.applyPromoCode = async function () {
        var input = document.getElementById('promo-code-input');
        var code  = (input.value || '').trim().toUpperCase();
        if (!code) return;
        await validateAndApplyPromo(code, false);
    };

    // Apply promo from available promos list
    window.applyAvailablePromo = async function (code) {
        document.getElementById('promo-code-input').value = code;
        await validateAndApplyPromo(code, false);
    };

    // Core validation via server
    async function validateAndApplyPromo(code, silent) {
        var msgEl = document.getElementById('promo-message');

        try {
            var res = await fetch('{{ route("vouchers.validate") }}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF_TOKEN },
                body: JSON.stringify({ code: code }),
            });

            var data = await res.json();

            if (!data.valid) {
                if (!silent) {
                    msgEl.textContent = data.message;
                    msgEl.className = 'text-xs px-3 py-2 rounded-xl mb-3 bg-red-50 text-hapag-red border border-red-200';
                    msgEl.classList.remove('hidden');
                }
                if (!silent) {
                    appliedPromoCode = null;
                    appliedDiscount = 0;
                    document.getElementById('promo-applied').classList.add('hidden');
                }
                return;
            }

            // Success
            appliedPromoCode = data.code;
            appliedDiscount  = data.discount;

            msgEl.classList.add('hidden');

            var appliedEl = document.getElementById('promo-applied');
            appliedEl.classList.remove('hidden');
            document.getElementById('promo-applied-code').textContent = data.code;
            document.getElementById('promo-applied-discount').textContent =
                (data.type === 'percentage' ? data.value + '% off' : '₱' + data.value + ' off') +
                ' — saving ₱' + data.discount.toFixed(2);

            // Update totals
            var discountRow = document.getElementById('cart-discount-row');
            discountRow.classList.remove('hidden');
            document.getElementById('cart-discount').textContent = '-₱' + data.discount.toFixed(2);
            document.getElementById('cart-total').textContent = '₱' + data.final_amount.toFixed(2);

            if (!silent) showToast('Promo ' + data.code + ' applied! You save ₱' + data.discount.toFixed(2));
            renderAvailablePromos();

        } catch (e) {
            console.error('Promo validation failed:', e);
            if (!silent) {
                msgEl.textContent = 'Could not validate promo. Try again.';
                msgEl.className = 'text-xs px-3 py-2 rounded-xl mb-3 bg-red-50 text-hapag-red border border-red-200';
                msgEl.classList.remove('hidden');
            }
        }
    }

    window.removePromo = function () {
        appliedPromoCode = null;
        appliedDiscount  = 0;
        document.getElementById('promo-applied').classList.add('hidden');
        document.getElementById('promo-message').classList.add('hidden');
        document.getElementById('promo-code-input').value = '';
        document.getElementById('cart-discount-row').classList.add('hidden');
        renderAvailablePromos();
        refreshCartPanel();
        showToast('Promo removed.');
    };

    function renderAvailablePromos() {
        var container = document.getElementById('promo-available-list');
        if (!container || !AVAILABLE_PROMOS || AVAILABLE_PROMOS.length === 0) return;

        container.innerHTML = AVAILABLE_PROMOS
            .filter(function (p) { return p.code !== appliedPromoCode; })
            .map(function (p) {
                var minText = p.min ? ' · Min ₱' + p.min.toFixed(0) : '';
                var scopeText = p.scope === 'site-wide' ? 'All restaurants' : RESTAURANT_NAME;
                return '<button onclick="applyAvailablePromo(\'' + p.code + '\')" ' +
                    'class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-hapag-cream2 hover:border-hapag-red/30 hover:bg-red-50/50 transition-all text-left group">' +
                    '<div class="min-w-0">' +
                        '<p class="text-xs font-bold text-hapag-ink group-hover:text-hapag-red transition-colors">' + p.code + '</p>' +
                        '<p class="text-[10px] text-hapag-gray">' + p.label + minText + ' · ' + scopeText + '</p>' +
                    '</div>' +
                    '<span class="text-[10px] font-bold text-hapag-red shrink-0 bg-red-50 px-2 py-0.5 rounded-full">Use</span>' +
                '</button>';
            }).join('');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CART CONFLICT MODAL
    // ═══════════════════════════════════════════════════════════════════════
    var pendingMenuItemId = null;

    window.closeConflictModal = function () {
        document.getElementById('conflict-modal').style.display = 'none';
        pendingMenuItemId = null;
    };

    function showConflictModal(menuItemId) {
        pendingMenuItemId = menuItemId;
        document.getElementById('conflict-modal').style.display = 'flex';
    }

    var confirmBtn = document.getElementById('conflict-confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            if (!pendingMenuItemId) return;
            try {
                await fetch('{{ route("cart.clear") }}', {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': CSRF_TOKEN },
                });
            } catch (e) { /* ignore */ }
            closeConflictModal();
            // Re-open modal for the item
            openItemModal(pendingMenuItemId);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MENU SEARCH (within restaurant)
    // ═══════════════════════════════════════════════════════════════════════
    var restaurantSearch = document.getElementById('restaurant-search');
    var navbarSearch     = document.getElementById('menu-search');

    function filterMenu(query) {
        query = (query || '').toLowerCase().trim();
        var sections = document.querySelectorAll('.menu-section');
        var anyVisible = false;

        sections.forEach(function (section) {
            var cards = section.querySelectorAll('.menu-item-card');
            var sectionVisible = false;
            cards.forEach(function (card) {
                var match = !query || card.dataset.itemName.indexOf(query) !== -1;
                card.classList.toggle('hidden', !match);
                if (match) sectionVisible = true;
            });
            section.classList.toggle('hidden', !sectionVisible);
            if (sectionVisible) anyVisible = true;
        });

        // Also filter featured section
        var featured = document.getElementById('section-featured');
        if (featured && query) featured.classList.add('hidden');
        if (featured && !query) featured.classList.remove('hidden');

        document.getElementById('menu-no-results').classList.toggle('hidden', anyVisible || !query);
    }

    if (restaurantSearch) restaurantSearch.addEventListener('input', function () { filterMenu(this.value); });
    if (navbarSearch) navbarSearch.addEventListener('input', function () { filterMenu(this.value); });

    // ═══════════════════════════════════════════════════════════════════════
    // CATEGORY SCROLL-SPY (sidebar nav highlighting)
    // ═══════════════════════════════════════════════════════════════════════
    var navLinks = document.querySelectorAll('.cat-nav-link');
    var sections = document.querySelectorAll('[id^="section-"]');

    function updateActiveNav() {
        var scrollPos = window.scrollY + 100;
        var activeId  = 'featured';

        sections.forEach(function (section) {
            if (section.offsetTop <= scrollPos) {
                activeId = section.id.replace('section-', '');
            }
        });

        navLinks.forEach(function (link) {
            var isActive = link.dataset.catNav === activeId;
            link.classList.toggle('border-hapag-ink', isActive);
            link.classList.toggle('bg-hapag-cream/50', isActive);
            link.classList.toggle('text-hapag-ink', isActive);
            link.classList.toggle('font-bold', isActive);
            link.classList.toggle('border-transparent', !isActive);
            link.classList.toggle('text-hapag-red', !isActive);
            link.classList.toggle('font-semibold', !isActive && !link.classList.contains('font-bold'));
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

})();
</script>

</body>
</html>