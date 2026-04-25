@php
    $hasPromo     = isset($hasPromo)     ? $hasPromo     : false;
    $featuredItem = isset($featuredItem) ? $featuredItem : null;
    $isFavorited  = isset($favoriteIds) && is_array($favoriteIds) && in_array($restaurant->id, $favoriteIds);
@endphp
<a href="{{ route('restaurants.show', $restaurant) }}"
   class="restaurant-card group block bg-white rounded-2xl overflow-hidden
          hover:shadow-md transition-all duration-200">

    {{-- Image --}}
    <div class="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-2xl">
        @if($restaurant->image_url)
            <img src="{{ $restaurant->image_url }}" alt="{{ $restaurant->name }}"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 loading="lazy">
        @else
            <div class="w-full h-full flex items-center justify-center
                        bg-gradient-to-br from-gray-50 to-gray-100">
                <span class="text-5xl">{{ $restaurant->category?->icon ?? '🍽️' }}</span>
            </div>
        @endif

        {{-- PROMO badge --}}
        @if($hasPromo)
        <span class="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-bold
                     px-2 py-0.5 rounded-full uppercase tracking-wide">
            PROMO
        </span>
        @endif

        {{-- Heart / favourite --}}
        @auth
        <button class="heart-btn absolute top-2.5 right-2.5 w-7 h-7 rounded-full
                       bg-white/90 backdrop-blur-sm shadow-sm
                       flex items-center justify-center transition-colors
                       {{ $isFavorited ? 'text-red-500' : 'text-gray-400' }}
                       hover:text-red-500"
                data-restaurant-id="{{ $restaurant->id }}"
                data-favorited="{{ $isFavorited ? 'true' : 'false' }}"
                onclick="event.preventDefault(); event.stopPropagation(); toggleFavorite(this);">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="{{ $isFavorited ? 'currentColor' : 'none' }}"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
        </button>
        @endauth
    </div>

    {{-- Info --}}
    <div class="pt-2.5 pb-1">
        <h3 class="font-bold text-gray-800 text-sm leading-tight truncate
                   group-hover:text-green-600 transition-colors">
            {{ $restaurant->name }} – {{ $restaurant->municipality }}
        </h3>
        <p class="text-gray-500 text-xs mt-0.5">5–15 min.</p>
    </div>
</a>
