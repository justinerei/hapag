import { useState, useMemo, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Constants ─────────────────────────────────────────────────────────────────

const CUISINE_IMAGES = {
    'Filipino':   'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200&h=200&fit=crop',
    'BBQ':        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Ihaw':       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Cafe':       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Coffee':     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Bakery':     'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
    'Fast Food':  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    'Desserts':   'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
    'Dessert':    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
};

const WEATHER_META = {
    rainy:  { img: '/images/weather/weather-rainy.png',  emoji: '🌧️', text: 'Warm up with hot soups, comfort food, and hot drinks.' },
    cloudy: { img: '/images/weather/weather-cloudy.png', emoji: '☁️', text: 'A cloudy day calls for freshly baked goods and pastries.' },
    cool:   { img: '/images/weather/weather-cool.png',   emoji: '🍃', text: 'Cool weather is perfect for grilled meats and hearty meals.' },
    hot:    { img: '/images/weather/weather-sunny.png',  emoji: '☀️', text: 'Beat the heat with cold desserts and refreshing drinks.' },
};

function getCuisineImage(name) {
    for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
        if (name.includes(key)) return url;
    }
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// ── RestaurantCard ─────────────────────────────────────────────────────────────

function RestaurantCard({ restaurant, hasPromo, featuredItemId, isFavorited, onFavoriteToggle, onAddToCart }) {
    return (
        <Link
            href={route('restaurants.show', restaurant.id)}
            className="group block bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-2xl">
                {restaurant.image_url ? (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span className="text-5xl">{restaurant.category?.icon ?? '🍽️'}</span>
                    </div>
                )}

                {/* Promo badge */}
                {hasPromo && (
                    <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        PROMO
                    </span>
                )}

                {/* Favorite heart */}
                <button
                    type="button"
                    onClick={(e) => onFavoriteToggle(restaurant.id, e)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors hover:text-red-500 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5"
                         fill={isFavorited ? 'currentColor' : 'none'}
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>

                {/* Quick-add button */}
                {featuredItemId && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(featuredItemId, restaurant.name); }}
                        className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Quick add to cart"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="pt-2.5 pb-1">
                <h3 className="font-bold text-gray-800 text-sm leading-tight truncate group-hover:text-green-500 transition-colors">
                    {restaurant.name}
                </h3>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-gray-500 text-xs truncate">{restaurant.municipality}</p>
                    {restaurant.menu_items_count > 0 && (
                        <p className="text-gray-400 text-xs shrink-0 ml-2">{restaurant.menu_items_count} items</p>
                    )}
                </div>
                {restaurant.category && (
                    <p className="text-gray-400 text-xs mt-0.5">{restaurant.category.name}</p>
                )}
            </div>
        </Link>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Customer({
    restaurants,
    categories,
    weather,
    weatherTag,
    suggested,
    deals,
    cartCount,
    promoRestaurantIds,
    popular,
    featuredItemMap,
    favoriteIds,
}) {
    const [search, setSearch] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [hasDealsFilter, setHasDealsFilter] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [favorites, setFavorites] = useState(() => new Set(favoriteIds));
    const [localCartCount, setLocalCartCount] = useState(cartCount);
    const [toast, setToast] = useState(null);
    const [conflict, setConflict] = useState(null);

    const pageProps = usePage().props;
    const [showWelcome, setShowWelcome] = useState(() => !!pageProps?.flash?.registered);

    const toastTimer = useRef(null);
    const gridRef = useRef(null);

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }

    async function toggleFavorite(restaurantId, e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(route('favorites.toggle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ restaurant_id: restaurantId }),
            });
            if (res.ok) {
                const data = await res.json();
                setFavorites(prev => {
                    const next = new Set(prev);
                    data.favorited ? next.add(restaurantId) : next.delete(restaurantId);
                    return next;
                });
                showToast(data.favorited ? 'Added to favorites!' : 'Removed from favorites.');
            }
        } catch {
            showToast('Could not update favorites.', true);
        }
    }

    async function addToCart(menuItemId, restaurantName) {
        if (!menuItemId) return;
        try {
            const res = await fetch(route('cart.add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ menu_item_id: menuItemId, quantity: 1 }),
            });
            if (res.status === 409) { setConflict({ menuItemId, restaurantName }); return; }
            if (res.ok) {
                const data = await res.json();
                setLocalCartCount(data.cart_count);
                showToast('Item added to cart!');
            }
        } catch {
            showToast('Could not add to cart.', true);
        }
    }

    async function confirmClearAndAdd() {
        try {
            await fetch(route('cart.clear'), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken() },
            });
        } catch { /* ignore */ }
        const saved = conflict;
        setConflict(null);
        await addToCart(saved.menuItemId, saved.restaurantName);
    }

    function toggleCuisine(catId) {
        setSelectedCuisines(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    }

    function handleCuisineCircleClick(catId) {
        setSelectedCuisines([catId]);
        setSearch('');
        setHasDealsFilter(false);
        setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }

    function clearFilters() {
        setSearch('');
        setSelectedCuisines([]);
        setHasDealsFilter(false);
        setSortBy('relevance');
    }

    const filteredRestaurants = useMemo(() => {
        let list = [...restaurants];
        if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
        if (selectedCuisines.length > 0) list = list.filter(r => selectedCuisines.includes(r.category_id));
        if (hasDealsFilter) list = list.filter(r => promoRestaurantIds.includes(r.id));
        return sortBy === 'newest'
            ? list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : list.sort((a, b) => a.name.localeCompare(b.name));
    }, [restaurants, search, selectedCuisines, hasDealsFilter, sortBy, promoRestaurantIds]);

    const wMeta = WEATHER_META[weatherTag] ?? WEATHER_META.hot;
    const temp = weather ? Math.round(weather.main?.temp ?? 0) : null;
    const condition = weather ? (weather.weather?.[0]?.main ?? '').toLowerCase() : '';
    const city = weather?.name ?? 'Laguna';

    return (
        <CustomerLayout cartCount={localCartCount}>
            <Head title="Home — Hapag" />

            {/* ── Welcome Modal (new registration) ─────────────────────── */}
            {showWelcome && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowWelcome(false)} />
                    <div className="relative z-10 max-w-sm w-full bg-white rounded-2xl shadow-2xl text-center p-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center mb-5">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You're all set!</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Your account has been created successfully. Start exploring restaurants and ordering your favorite dishes!
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                            Start Exploring
                        </button>
                    </div>
                </div>
            )}

            {/* ── Toast ─────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none transition-all ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.isError ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ── Cart conflict modal ────────────────────────────────────────── */}
            {conflict && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-800 text-base">Cart has items from another restaurant</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                            Your cart has items from another restaurant. Clear it to add from "{conflict.restaurantName}"?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConflict(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearAndAdd}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                            >
                                Clear &amp; Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page layout ───────────────────────────────────────────────── */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6 items-start">

                    {/* ── Filter sidebar (desktop) ────────────────────────────── */}
                    <aside className="hidden lg:block w-[220px] shrink-0 sticky top-24">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 space-y-5">
                            <h2 className="text-lg font-extrabold text-gray-800">Filters</h2>

                            {/* Search */}
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search restaurants…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                />
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-800 mb-2.5">Sort by</h3>
                                <div className="space-y-2">
                                    {[['relevance', 'Relevance'], ['newest', 'Newest']].map(([val, label]) => (
                                        <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sort-by"
                                                value={val}
                                                checked={sortBy === val}
                                                onChange={() => setSortBy(val)}
                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-800">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Offers */}
                            <div>
                                <h3 className="text-xs font-bold text-green-500 mb-2.5">Offers</h3>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasDealsFilter}
                                        onChange={e => setHasDealsFilter(e.target.checked)}
                                        className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-800">Has Active Deals</span>
                                </label>
                            </div>

                            {/* Cuisines */}
                            <div>
                                <h3 className="text-xs font-bold text-green-500 mb-2.5">Cuisines</h3>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCuisines.includes(cat.id)}
                                                onChange={() => toggleCuisine(cat.id)}
                                                className="w-4 h-4 rounded text-green-500 border-gray-300 focus:ring-green-500/30 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-800">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear */}
                            {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors text-left"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Main content ────────────────────────────────────────── */}
                    <main className="flex-1 min-w-0 space-y-8">

                        {/* Mobile search */}
                        <div className="lg:hidden relative">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search for restaurants…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                            />
                        </div>

                        {/* ── Weather banner ─────────────────────────────────── */}
                        {weather && (
                            <section>
                                <div
                                    className="rounded-2xl overflow-hidden relative min-h-[170px]"
                                    style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 40%, #14532d 100%)' }}
                                >
                                    <img
                                        src={wMeta.img}
                                        alt={weatherTag}
                                        className="absolute inset-0 w-full h-full object-cover object-right"
                                    />
                                    <div className="relative z-10 px-7 py-6 flex flex-col justify-center min-h-[170px]">
                                        <p className="text-xl md:text-2xl font-extrabold text-white leading-snug">
                                            {wMeta.emoji} It's {temp}°C and {condition}<br />in {city}
                                        </p>
                                        <p className="text-white/80 text-sm mt-1.5 max-w-sm leading-relaxed">
                                            {wMeta.text}
                                        </p>
                                        {suggested.length > 0 && (
                                            <p className="text-white/60 text-xs mt-3">
                                                Suggested: {suggested.map(s => s.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── Cuisines ───────────────────────────────────────── */}
                        <section>
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Cuisines</h2>
                            <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCuisineCircleClick(cat.id)}
                                        className="shrink-0 flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-150 shadow-sm ${selectedCuisines.includes(cat.id) ? 'border-green-500' : 'border-transparent group-hover:border-green-500'}`}>
                                            <img
                                                src={getCuisineImage(cat.name)}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold text-center leading-tight max-w-[80px] ${selectedCuisines.includes(cat.id) ? 'text-green-600' : 'text-green-500'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Daily Deals ────────────────────────────────────── */}
                        {deals.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Your Daily Deals</h2>
                                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                    {deals.map(deal => {
                                        const dr = deal.restaurant;
                                        const discLabel = deal.type === 'percentage'
                                            ? `${deal.value}% OFF`
                                            : `₱${Number(deal.value).toLocaleString('en-PH', { maximumFractionDigits: 0 })} OFF`;
                                        const dealTitle = dr ? dr.name : 'Site-Wide Deal';
                                        const href = dr
                                            ? route('restaurants.show', dr.id)
                                            : route('restaurants.index');
                                        return (
                                            <Link
                                                key={deal.id}
                                                href={href}
                                                className="shrink-0 w-56 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                                                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)' }}
                                            >
                                                <div className="p-5 flex flex-col min-h-[155px] justify-between">
                                                    <div>
                                                        <p className="text-white font-extrabold text-base leading-tight mb-1.5">
                                                            {dealTitle}
                                                        </p>
                                                        <p className="text-white/65 text-xs leading-relaxed">
                                                            {deal.type === 'percentage'
                                                                ? `Enjoy ${deal.value}% discount on your next order!`
                                                                : `Get ₱${deal.value} off your next order!`}
                                                        </p>
                                                    </div>
                                                    <p className="text-white font-extrabold text-2xl font-mono mt-4 leading-none text-right">
                                                        {discLabel}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ── Popular In Your Area ───────────────────────────── */}
                        {popular.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Popular In Your Area</h2>
                                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                    {popular.map(r => (
                                        <div key={r.id} className="shrink-0 w-52">
                                            <RestaurantCard
                                                restaurant={r}
                                                hasPromo={promoRestaurantIds.includes(r.id)}
                                                featuredItemId={featuredItemMap[r.id]}
                                                isFavorited={favorites.has(r.id)}
                                                onFavoriteToggle={toggleFavorite}
                                                onAddToCart={addToCart}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── All Restaurants ────────────────────────────────── */}
                        <section ref={gridRef} className="pb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-extrabold text-gray-800">All Restaurants</h2>
                                {filteredRestaurants.length !== restaurants.length && (
                                    <span className="text-sm text-gray-500">
                                        {filteredRestaurants.length} of {restaurants.length} shown
                                    </span>
                                )}
                            </div>

                            {/* Mobile filter row */}
                            <div className="lg:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                <button
                                    onClick={() => setHasDealsFilter(v => !v)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${hasDealsFilter ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    Has Deals
                                </button>
                                {['relevance', 'newest'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSortBy(val)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === val ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {val === 'relevance' ? 'Relevance' : 'Newest'}
                                    </button>
                                ))}
                                {(search || selectedCuisines.length > 0 || hasDealsFilter || sortBy !== 'relevance') && (
                                    <button
                                        onClick={clearFilters}
                                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-400 hover:text-gray-600 bg-white transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {filteredRestaurants.length === 0 ? (
                                <div className="text-center py-16">
                                    {restaurants.length === 0 ? (
                                        <>
                                            <span className="text-5xl mb-4 block">🍽️</span>
                                            <p className="text-gray-500 font-semibold">No restaurants available yet.</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-4xl mb-3 block">🔍</span>
                                            <p className="text-gray-500 font-semibold">No restaurants match your filters.</p>
                                            <button
                                                onClick={clearFilters}
                                                className="mt-3 text-sm font-semibold text-green-500 hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {filteredRestaurants.map(r => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={r}
                                            hasPromo={promoRestaurantIds.includes(r.id)}
                                            featuredItemId={featuredItemMap[r.id]}
                                            isFavorited={favorites.has(r.id)}
                                            onFavoriteToggle={toggleFavorite}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                    </main>
                </div>
            </div>
        </CustomerLayout>
    );
}
