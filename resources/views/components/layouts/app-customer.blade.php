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
<body class="font-sans antialiased text-gray-800 min-h-screen flex flex-col bg-gray-50">

{{-- ── Customer Navbar ──────────────────────────────────────────────────── --}}
<nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center">
    <div class="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center gap-3">

        {{-- Logo --}}
        <a href="{{ route('home') }}" class="shrink-0 text-2xl font-extrabold tracking-tight text-green-600">
            Hapag
        </a>

        {{-- Location pill --}}
        <div class="relative shrink-0" id="location-wrapper">
            <button id="location-btn"
                    class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200
                           px-3 py-1.5 rounded-full text-xs font-semibold text-gray-800 transition-colors">
                {{-- pin icon --}}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-green-600 shrink-0" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span id="location-label" class="max-w-[130px] truncate">
                    {{ auth()->user()->municipality ? auth()->user()->municipality . ', Laguna' : 'Laguna' }}
                </span>
                {{-- pencil icon --}}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-500 shrink-0" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
            </button>

            {{-- Location dropdown --}}
            <div id="location-menu"
                 class="hidden absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200
                        py-2 min-w-[180px] z-50">
                @foreach(['Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba', 'San Pablo'] as $mun)
                <button onclick="updateMunicipality('{{ $mun }}')"
                        class="w-full text-left px-4 py-2 text-sm font-semibold text-gray-800
                               hover:bg-gray-50 transition-colors">
                    {{ $mun }}
                </button>
                @endforeach
            </div>
        </div>

        {{-- Search bar --}}
        <div class="flex-1 min-w-0">
            <div class="relative max-w-xl">
                <svg xmlns="http://www.w3.org/2000/svg"
                     class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text"
                       placeholder="Search cuisines, dishes, or restaurants..."
                       class="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm
                              text-gray-800 placeholder:text-gray-400 outline-none
                              focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors">
            </div>
        </div>

        {{-- Right actions --}}
        <div class="flex items-center gap-1 shrink-0">

            {{-- Favorites --}}
            <a href="{{ route('favorites') }}"
               class="p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-green-600"
               title="Favorites">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            </a>

            {{-- Cart with badge --}}
            <a href="{{ route('cart.index') }}"
               class="relative p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-800"
               title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 5H19m-9 0a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
                @php $navCartCount = auth()->user()->cartItems()->count(); @endphp
                @if($navCartCount > 0)
                <span class="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold
                             min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {{ $navCartCount }}
                </span>
                @endif
            </a>

            {{-- Profile dropdown --}}
            <div class="relative" id="profile-wrapper">
                <button id="profile-btn"
                        class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
                    <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                    </div>
                    <span class="hidden sm:block text-sm font-semibold text-gray-800 max-w-[90px] truncate">
                        {{ explode(' ', auth()->user()->name)[0] }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 shrink-0" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                {{-- Profile menu --}}
                <div id="profile-menu"
                     class="hidden absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200
                            py-2 w-48 z-50">
                    <div class="px-4 py-2 border-b border-gray-200 mb-1">
                        <p class="text-xs font-bold text-gray-800 truncate">{{ auth()->user()->name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ auth()->user()->email }}</p>
                    </div>
                    <a href="{{ route('orders.index') }}"
                       class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-800
                              hover:bg-gray-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        My Orders
                    </a>
                    <a href="{{ route('profile.edit') }}"
                       class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-800
                              hover:bg-gray-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        My Account
                    </a>
                    <div class="border-t border-gray-200 mt-1 pt-1">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                    class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold
                                           text-red-500 hover:bg-red-50 transition-colors">
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

        </div>{{-- /right actions --}}
    </div>
</nav>

{{-- Flash success --}}
@if(session('success'))
<div class="bg-green-50 border-b border-green-500 px-6 py-2.5 text-sm font-semibold text-green-700 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
    {{ session('success') }}
</div>
@endif

{{-- Page content --}}
<div class="flex-1">{{ $slot }}</div>

<x-restaurant-setup-modal />

<script>
(function () {
    // ── Dropdowns ──────────────────────────────────────────────────────────
    const locationBtn  = document.getElementById('location-btn');
    const locationMenu = document.getElementById('location-menu');
    const profileBtn   = document.getElementById('profile-btn');
    const profileMenu  = document.getElementById('profile-menu');

    function closeAll() {
        locationMenu?.classList.add('hidden');
        profileMenu?.classList.add('hidden');
    }

    locationBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        const isHidden = locationMenu.classList.contains('hidden');
        closeAll();
        if (isHidden) locationMenu.classList.remove('hidden');
    });

    profileBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        const isHidden = profileMenu.classList.contains('hidden');
        closeAll();
        if (isHidden) profileMenu.classList.remove('hidden');
    });

    document.addEventListener('click', closeAll);

    // ── Municipality AJAX ──────────────────────────────────────────────────
    window.updateMunicipality = async function (municipality) {
        try {
            const res = await fetch('{{ route('profile.municipality') }}', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ municipality }),
            });
            if (res.ok) {
                document.getElementById('location-label').textContent = municipality + ', Laguna';
                locationMenu?.classList.add('hidden');
            }
        } catch (e) {
            console.error('Municipality update failed', e);
        }
    };
})();
</script>

@stack('scripts')
</body>
</html>
