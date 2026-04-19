<x-layouts.app title="Home">

{{-- ── Hero / Search Bar ──────────────────────────────────────────────────── --}}
<section class="bg-hapag-cream border-b border-hapag-cream2 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-extrabold text-hapag-ink mb-1">
            Hello, {{ auth()->user()->name }}! 👋
        </h1>
        <p class="text-hapag-gray text-sm mb-5">What are you craving today?</p>

        {{-- Search --}}
        <form action="{{ route('restaurants.index') }}" method="GET" class="relative max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-hapag-gray/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" name="search" placeholder="Search restaurants or dishes..."
                   class="w-full pl-12 pr-36 py-4 rounded-2xl bg-white border border-hapag-cream2 text-hapag-ink text-sm placeholder:text-hapag-gray/60 focus:outline-none focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red shadow-sm">
            <button type="submit"
                    class="absolute right-2 top-1/2 -translate-y-1/2 bg-hapag-red hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                Search
            </button>
        </form>

        {{-- Weather strip (if available) --}}
        @if(!empty($weather))
        <div class="mt-4 inline-flex items-center gap-2 bg-hapag-amber/10 border border-hapag-amber/30 rounded-full px-4 py-1.5 text-sm text-hapag-ink">
            <span class="text-lg">
                @switch($weatherTag)
                    @case('rainy') 🌧️ @break
                    @case('cloudy') ☁️ @break
                    @case('cool') 🌤️ @break
                    @default ☀️
                @endswitch
            </span>
            <span class="font-semibold">{{ round($weather['main']['temp'] ?? 0) }}°C</span>
            <span class="text-hapag-gray">·</span>
            <span class="text-hapag-gray">{{ $weather['weather'][0]['description'] ?? '' }}</span>
            @if($suggested->isNotEmpty())
            <span class="text-hapag-gray">·</span>
            <span class="text-hapag-amber font-semibold">Try {{ $suggested->first()->name }}!</span>
            @endif
        </div>
        @endif
    </div>
</section>

{{-- ── Category Filter Pills ──────────────────────────────────────────────── --}}
<section class="bg-white border-b border-hapag-cream2 py-4 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <a href="{{ route('home') }}"
               class="shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors
                      {{ !request('category') ? 'bg-hapag-ink text-white' : 'bg-hapag-cream2 text-hapag-gray hover:bg-hapag-cream hover:text-hapag-ink' }}">
                All
            </a>
            @foreach($categories as $cat)
            <a href="{{ route('home') }}?category={{ $cat->id }}"
               class="shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-colors
                      {{ request('category') == $cat->id ? 'bg-hapag-ink text-white' : 'bg-hapag-cream2 text-hapag-gray hover:bg-hapag-cream hover:text-hapag-ink' }}">
                <span>{{ $cat->icon }}</span>
                <span>{{ $cat->name }}</span>
            </a>
            @endforeach
        </div>
    </div>
</section>

{{-- ── Restaurants Grid ────────────────────────────────────────────────────── --}}
<section class="py-10 bg-hapag-cream">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {{-- Section heading --}}
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-xl font-extrabold text-hapag-ink">
                    @if(request('category'))
                        {{ $categories->firstWhere('id', request('category'))?->name ?? 'Restaurants' }}
                    @else
                        All Restaurants
                    @endif
                </h2>
                <p class="text-hapag-gray text-sm mt-0.5">{{ $restaurants->count() }} open near you in Laguna</p>
            </div>
            <a href="{{ route('restaurants.index') }}" class="text-sm font-semibold text-hapag-red hover:underline">
                See all →
            </a>
        </div>

        @if($restaurants->isEmpty())
            <div class="text-center py-20">
                <span class="text-5xl mb-4 block">🍽️</span>
                <p class="text-hapag-gray font-semibold">No restaurants found.</p>
            </div>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                @foreach($restaurants as $restaurant)
                <a href="{{ route('restaurants.show', $restaurant) }}"
                   class="group bg-white rounded-2xl overflow-hidden border border-hapag-cream2 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">

                    {{-- Thumbnail --}}
                    <div class="aspect-[4/3] bg-hapag-cream2 overflow-hidden relative">
                        @if($restaurant->image_url)
                            <img src="{{ $restaurant->image_url }}" alt="{{ $restaurant->name }}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        @else
                            <div class="w-full h-full flex items-center justify-center">
                                <span class="text-5xl">{{ $restaurant->category?->icon ?? '🍽️' }}</span>
                            </div>
                        @endif
                        {{-- Category badge --}}
                        @if($restaurant->category)
                        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-hapag-ink text-xs font-bold px-2.5 py-1 rounded-full">
                            {{ $restaurant->category->icon }} {{ $restaurant->category->name }}
                        </span>
                        @endif
                    </div>

                    {{-- Info --}}
                    <div class="p-4">
                        <h3 class="font-bold text-hapag-ink text-base leading-tight mb-1 group-hover:text-hapag-red transition-colors">
                            {{ $restaurant->name }}
                        </h3>
                        <div class="flex items-center gap-1.5 text-hapag-gray text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {{ $restaurant->municipality }}
                        </div>
                        @if($restaurant->description)
                        <p class="text-hapag-gray text-xs mt-2 leading-relaxed line-clamp-2">{{ $restaurant->description }}</p>
                        @endif
                        <div class="mt-3 flex items-center justify-between">
                            <span class="text-xs font-semibold text-hapag-teal bg-teal-50 px-2.5 py-1 rounded-full">Pickup ready</span>
                            <span class="text-xs text-hapag-gray">Cash on pickup</span>
                        </div>
                    </div>
                </a>
                @endforeach
            </div>
        @endif
    </div>
</section>

{{-- ── AI Recommender Strip ────────────────────────────────────────────────── --}}
<section class="py-12 bg-white border-t border-hapag-cream2">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-hapag-amber/20 to-hapag-cream rounded-3xl p-8 border border-hapag-amber/20">
            <div class="flex items-start gap-4 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-hapag-amber/20 flex items-center justify-center shrink-0">
                    <span class="text-2xl">✨</span>
                </div>
                <div>
                    <h2 class="text-xl font-extrabold text-hapag-ink">Not sure what to eat?</h2>
                    <p class="text-hapag-gray text-sm mt-0.5">Describe your craving and our AI will pick the perfect dish for you.</p>
                </div>
            </div>

            <div class="flex gap-2">
                <input id="ai-prompt" type="text" placeholder="e.g. something spicy and filling..."
                       class="flex-1 px-4 py-3 rounded-xl bg-white border border-hapag-cream2 text-hapag-ink text-sm placeholder:text-hapag-gray/60 focus:outline-none focus:ring-2 focus:ring-hapag-amber/40 focus:border-hapag-amber">
                <button id="ai-btn"
                        class="px-6 py-3 bg-hapag-ink hover:bg-hapag-brown text-white text-sm font-bold rounded-xl transition-colors">
                    Ask AI
                </button>
            </div>

            <div id="ai-result" class="hidden mt-4 bg-white rounded-2xl p-4 border border-hapag-amber/20 text-sm text-hapag-ink leading-relaxed"></div>
        </div>
    </div>
</section>

@push('scripts')
<script>
(function () {
    const btn    = document.getElementById('ai-btn');
    const input  = document.getElementById('ai-prompt');
    const result = document.getElementById('ai-result');

    btn?.addEventListener('click', async function () {
        const prompt = input.value.trim();
        if (!prompt) return;

        btn.disabled = true;
        btn.textContent = 'Thinking…';
        result.classList.add('hidden');

        try {
            const res = await fetch('{{ route('ai.recommend') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            result.textContent = data.recommendation ?? data.error ?? 'No recommendation available.';
            result.classList.remove('hidden');
        } catch {
            result.textContent = 'Something went wrong. Please try again.';
            result.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Ask AI';
        }
    });

    input?.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') btn.click();
    });
})();
</script>
@endpush

</x-layouts.app>