<x-layouts.app-customer title="Favorites">
<div class="flex-1 flex items-center justify-center py-24 px-4">
    <div class="text-center max-w-sm">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-hapag-red" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-hapag-ink mb-2">No favorites yet</h1>
        <p class="text-hapag-gray text-sm leading-relaxed mb-6">
            Tap the heart icon on any restaurant to save it here for quick access.
        </p>
        <a href="{{ route('home') }}"
           class="inline-block px-6 py-3 rounded-full bg-hapag-red text-white text-sm font-bold
                  hover:bg-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            Browse Restaurants
        </a>
    </div>
</div>
</x-layouts.app-customer>