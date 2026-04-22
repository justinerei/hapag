<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Favorites — Hapag</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased text-hapag-ink min-h-screen flex flex-col bg-white">

{{-- Navbar --}}
<nav class="sticky top-0 z-50 bg-white border-b border-hapag-cream2 shadow-sm h-14 flex items-center">
    <div class="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <a href="{{ route('home') }}" class="shrink-0 text-xl font-extrabold tracking-tight text-hapag-red mr-1">Hapag</a>
        <div class="flex-1"></div>
        <div class="flex items-center gap-0.5 shrink-0">
            <a href="{{ route('favorites') }}" class="p-2 rounded-full bg-hapag-cream text-hapag-red" title="Favourites">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </a>
            <a href="{{ route('cart.index') }}" class="relative p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-ink transition-colors" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"/></svg>
                <span id="cart-badge" class="{{ $cartCount > 0 ? '' : 'hidden' }} absolute -top-0.5 -right-0.5 bg-hapag-red text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{{ $cartCount }}</span>
            </a>
            <div class="relative">
                <a href="{{ route('profile.edit') }}" class="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-hapag-cream transition-colors">
                    <div class="w-8 h-8 rounded-full bg-hapag-red text-white flex items-center justify-center text-sm font-bold shrink-0">{{ strtoupper(substr(auth()->user()->name, 0, 1)) }}</div>
                    <span class="hidden sm:block text-sm font-semibold text-hapag-ink max-w-[80px] truncate">{{ explode(' ', auth()->user()->name)[0] }}</span>
                </a>
            </div>
        </div>
    </div>
</nav>

{{-- Content --}}
<div class="flex-1">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div class="flex items-center gap-3 mb-6">
            <a href="{{ route('home') }}" class="p-2 rounded-full hover:bg-hapag-cream text-hapag-gray hover:text-hapag-ink transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </a>
            <h1 class="text-2xl font-extrabold text-hapag-ink">
                Your Favorites
                @if($restaurants->isNotEmpty())
                <span class="text-hapag-gray font-semibold text-base ml-1">({{ $restaurants->count() }})</span>
                @endif
            </h1>
        </div>

        @if($restaurants->isEmpty())
        <div class="text-center py-20">
            <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-hapag-red" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </div>
            <h2 class="text-xl font-extrabold text-hapag-ink mb-2">No favorites yet</h2>
            <p class="text-hapag-gray text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                Tap the heart icon on any restaurant to save it here for quick access.
            </p>
            <a href="{{ route('home') }}"
               class="inline-block px-6 py-3 rounded-full bg-hapag-red text-white text-sm font-bold
                      hover:bg-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                Browse Restaurants
            </a>
        </div>
        @else
        <div id="favorites-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            @foreach($restaurants as $restaurant)
            <div class="fav-card-wrapper" data-restaurant-id="{{ $restaurant->id }}">
                @include('partials.restaurant-card', [
                    'restaurant'  => $restaurant,
                    'hasPromo'    => false,
                    'featuredItem' => null,
                    'favoriteIds' => $favoriteIds->toArray(),
                ])
            </div>
            @endforeach
        </div>
        @endif

    </div>
</div>

{{-- Footer --}}
<footer class="bg-hapag-ink text-white relative overflow-hidden mt-auto">
    <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden h-32">
        <span class="text-[10rem] font-extrabold tracking-tighter text-white/[0.04] leading-none -mb-6">hapag</span>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p class="text-xs text-gray-600">&copy; {{ date('Y') }} Hapag. For educational use only.</p>
            <p class="text-xs text-gray-600">LSPU · ITEL 203 · Web Systems and Technologies</p>
        </div>
    </div>
</footer>

<script>
    // ═══════════════════════════════════════════════════════════════════════
    // TOAST
    // ═══════════════════════════════════════════════════════════════════════
    window.showToast = function (message, isError) {
        var existing = document.getElementById('hapag-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id = 'hapag-toast';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white transition-all duration-300 opacity-0 -translate-y-4';
        toast.style.background = isError ? '#E63946' : '#2A9D8F';
        toast.innerHTML = '<div class="flex items-center gap-2">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
            '<span>' + message + '</span></div>';
        document.body.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.remove('opacity-0', '-translate-y-4'); toast.classList.add('opacity-100', 'translate-y-0'); });
        setTimeout(function () { toast.classList.remove('opacity-100', 'translate-y-0'); toast.classList.add('opacity-0', '-translate-y-4'); setTimeout(function () { toast.remove(); }, 300); }, 2500);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // FAVORITE TOGGLE (removes card from grid on unfavorite)
    // ═══════════════════════════════════════════════════════════════════════
    window.toggleFavorite = async function (btn) {
        var restaurantId = btn.dataset.restaurantId;
        try {
            var res = await fetch('{{ route("favorites.toggle") }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ restaurant_id: restaurantId }),
            });
            if (res.ok) {
                var data = await res.json();
                if (!data.favorited) {
                    // Remove the card from the favorites grid
                    var wrapper = document.querySelector('.fav-card-wrapper[data-restaurant-id="' + restaurantId + '"]');
                    if (wrapper) {
                        wrapper.style.transition = 'opacity 0.3s, transform 0.3s';
                        wrapper.style.opacity = '0';
                        wrapper.style.transform = 'scale(0.95)';
                        setTimeout(function () {
                            wrapper.remove();
                            // Check if grid is now empty
                            var remaining = document.querySelectorAll('.fav-card-wrapper');
                            if (remaining.length === 0) {
                                window.location.reload();
                            }
                        }, 300);
                    }
                    showToast('Removed from favorites.');
                } else {
                    btn.dataset.favorited = 'true';
                    var svg = btn.querySelector('svg');
                    svg.setAttribute('fill', 'currentColor');
                    btn.classList.add('text-hapag-red');
                    btn.classList.remove('text-hapag-gray');
                    showToast('Added to favorites!');
                }
            }
        } catch (e) {
            console.error('Favorite toggle failed:', e);
        }
    };
</script>

</body>
</html>