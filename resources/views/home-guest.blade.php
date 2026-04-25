<x-layouts.app-guest title="Good food, right to your table">

{{-- ── Announcement Bar ─────────────────────────────────────────────────── --}}
@push('announcement')
<div id="announcement-bar" class="bg-gray-800 text-white text-center text-sm py-2.5 px-4 relative">
    <span>Order ahead, <a href="{{ route('restaurants.index') }}" class="text-green-400 hover:underline font-semibold">skip the wait</a> — pick up your food fresh from local Laguna restaurants.</span>
    <button onclick="document.getElementById('announcement-bar').remove()" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>
@endpush

{{-- ── Hero Section ─────────────────────────────────────────────────────── --}}
<section class="relative overflow-hidden">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {{-- Left: Text content --}}
            <div class="relative z-10">
                <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 leading-[1.05] tracking-tight mb-6">
                    Good food,<br>
                    right to your<br>
                    table.
                </h1>
                <p class="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-md">
                    Discover the best local restaurants in Laguna. Order ahead, pick up fresh. No delivery fees, no hassle.
                </p>

                {{-- Search bar --}}
                <form action="{{ route('restaurants.index') }}" method="GET" class="relative max-w-md">
                    <input type="text" name="search" placeholder="Search a keyword... (e.g. Sinigang)"
                           class="w-full pl-5 pr-14 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-sm">
                    <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>
            </div>

            {{-- Right: Food image collage --}}
            <div class="relative hidden md:block">
                <div class="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
                         alt="Filipino food spread"
                         class="w-full h-full object-cover">
                    {{-- Gradient overlay for depth --}}
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {{-- Floating accent card --}}
                <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-5 py-3 border border-gray-200">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">🍜</span>
                        <div>
                            <p class="text-xs text-gray-500">Popular in Laguna</p>
                            <p class="text-sm font-bold text-gray-800">Sinigang na Baboy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

{{-- ── Restaurant Brand Marquee ────────────────────────────────────────── --}}
<section class="bg-white border-y max-w-7xl mx-auto border-gray-200 p-4 rounded-2xl overflow-hidden">
    <div class="flex animate-marquee whitespace-nowrap gap-6 items-center">
        @php
            $brands = [
                ['name' => 'Lutong Bahay ni Aling Rosa', 'color' => 'bg-gray-800 text-white'],
                ['name' => 'Grill Masters PH', 'color' => 'bg-green-600 text-white'],
                ['name' => "Kape't Tinapay", 'color' => 'bg-gray-800 text-white'],
                ['name' => "Mama Nena's Carinderia", 'color' => 'bg-green-600 text-white'],
                ['name' => 'Bida Burger', 'color' => 'bg-gray-800 text-white'],
                ['name' => 'La Preciosa Bakery', 'color' => 'bg-green-600 text-white'],
            ];
        @endphp
        @for($i = 0; $i < 3; $i++)
            @foreach($brands as $brand)
                <span class="inline-flex items-center px-6 py-2 rounded-full text-sm font-bold {{ $brand['color'] }} shrink-0">
                    {{ $brand['name'] }}
                </span>
                <span class="text-gray-400 text-xl shrink-0">✦</span>
            @endforeach
        @endfor
    </div>
</section>

{{-- ── Why You'll Love Hapag ───────────────────────────────────────────── --}}
<section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800">Why You'll Love <span class="text-green-600">Hapag</span></h2>
            <p class="text-gray-500 mt-3 text-base">Built for Laguna locals who love good food without the hassle.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {{-- Feature 1 --}}
            <div class="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Easy to Order</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Browse menus from local Laguna restaurants, add to your cart, and check out in minutes — all from your phone or laptop.</p>
            </div>

            {{-- Feature 2 --}}
            <div class="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Quick Pickup, No Hassle</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Order ahead and your food will be ready when you arrive. No waiting in line, no delivery fees — just grab and go.</p>
            </div>

            {{-- Feature 3 --}}
            <div class="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Exclusive Deals & Vouchers</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Enjoy discounts with voucher codes on your orders. Check back for new promotions and save on your favorite meals.</p>
            </div>
        </div>
    </div>
</section>

{{-- ── Available Deals ─────────────────────────────────────────────────── --}}
<section class="py-20 bg-white relative overflow-hidden">
    {{-- Decorative blob --}}
    <div class="absolute -right-20 top-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800">Available Deals</h2>
            <p class="text-gray-500 mt-3 text-base">Save on your favorite Laguna eats with exclusive voucher codes.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @php
                $deals = [
                    [
                        'name' => 'Lutong Bahay ni Aling Rosa',
                        'deal' => '₱50 off on orders ₱300+. Classic Filipino comfort food in Santa Cruz.',
                        'image' => 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&q=80',
                    ],
                    [
                        'name' => "Kape't Tinapay",
                        'deal' => 'Buy 2 Barako coffees, get 1 free. Your morning café in Pagsanjan.',
                        'image' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
                    ],
                    [
                        'name' => 'Grill Masters PH',
                        'deal' => '20% off your first Inihaw na Liempo order. BBQ favorites, grilled fresh.',
                        'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
                    ],
                    [
                        'name' => 'Bida Burger',
                        'deal' => 'Free Fries with any burger order this week. Calamba\'s best burgers.',
                        'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
                    ],
                ];
            @endphp

            @foreach($deals as $deal)
            <div class="group cursor-pointer">
                <div class="aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm">
                    <img src="{{ $deal['image'] }}" alt="{{ $deal['name'] }}"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <h3 class="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors">{{ $deal['name'] }}</h3>
                <p class="text-gray-500 text-sm mt-1 leading-relaxed">{{ $deal['deal'] }}</p>
            </div>
            @endforeach
        </div>
    </div>
</section>

{{-- ── How It Works (3 Steps) ──────────────────────────────────────────── --}}
<section class="py-20 bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800">Your food in 3 easy steps</h2>
            <p class="text-gray-500 mt-3 text-base max-w-lg mx-auto">No delivery fees, no complicated process. Just pick, order, and enjoy real Laguna flavors.</p>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {{-- Dashed connector line (desktop only) --}}
            <div class="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-gray-200"></div>

            {{-- Step 1 --}}
            <div class="text-center relative">
                <div class="relative inline-block mb-6">
                    <span class="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10">1</span>
                    <div class="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Pick a Restaurant</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Browse local favorites across Laguna — from carinderia classics to neighborhood cafés.</p>
            </div>

            {{-- Step 2 --}}
            <div class="text-center relative">
                <div class="relative inline-block mb-6">
                    <span class="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10">2</span>
                    <div class="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Build Your Order</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Explore the menu, add dishes to your cart, and apply a voucher if you have one.</p>
            </div>

            {{-- Step 3 --}}
            <div class="text-center relative">
                <div class="relative inline-block mb-6">
                    <span class="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-10">3</span>
                    <div class="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Pick Up & Enjoy</h3>
                <p class="text-gray-500 text-sm leading-relaxed">Head to the restaurant, grab your food — fresh and ready. No waiting, no hassle.</p>
            </div>
        </div>
    </div>
</section>

{{-- ── CTA Banner ──────────────────────────────────────────────────────── --}}
<section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative bg-gray-800 rounded-3xl overflow-hidden px-8 py-14 md:px-16 md:py-16">
            {{-- Decorative circles --}}
            <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full border-[3px] border-white/10"></div>
            <div class="absolute -right-5 -top-5 w-36 h-36 rounded-full border-[3px] border-white/10"></div>

            <div class="relative max-w-lg">
                <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                    Get exclusive deals<br>by signing up!
                </h2>
                <p class="text-white/70 text-base leading-relaxed mb-8">
                    Create your free account to unlock voucher codes, order from local Laguna restaurants, and pick up your food hassle-free.
                </p>
                <a href="{{ route('register') }}"
                   class="inline-block px-8 py-3.5 bg-green-500 text-white text-sm font-bold rounded-full hover:bg-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                    Get Started
                </a>
            </div>
        </div>
    </div>
</section>

{{-- ── Marquee Animation CSS ───────────────────────────────────────────── --}}
@push('head')
<style>
    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
    }
    .animate-marquee {
        animation: marquee 30s linear infinite;
    }
    .animate-marquee:hover {
        animation-play-state: paused;
    }
</style>
@endpush

</x-layouts.app-guest>
