import { useState, useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Constants ──────────────────────────────────────────────────────────────────

const CUISINE_IMAGES = {
    'Filipino':  'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=200&h=200&fit=crop',
    'BBQ':       'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Ihaw':      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    'Cafe':      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Coffee':    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    'Bakery':    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
    'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    'Desserts':  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
    'Dessert':   'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
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

function RestaurantCard({ restaurant, isFavorited, onFavoriteToggle }) {
    return (
        <Link
            href={route('restaurants.show', restaurant.id)}
            className="group block bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
        >
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
            </div>

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

export default function Index({ restaurants, categories, cartCount = 0, favoriteIds = [] }) {
    const [search, setSearch]               = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy]               = useState('az');
    const [favorites, setFavorites]         = useState(() => new Set(favoriteIds));
    const [toast, setToast]                 = useState(null);
    const toastTimer = useRef(null);

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

    function clearFilters() {
        setSearch('');
        setSelectedCategory(null);
        setSortBy('az');
    }

    const filteredRestaurants = useMemo(() => {
        let list = [...restaurants];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(r =>
                r.name.toLowerCase().includes(q) ||
                r.municipality.toLowerCase().includes(q)
            );
        }
        if (selectedCategory !== null) {
            list = list.filter(r => r.category_id === selectedCategory);
        }
        return sortBy === 'newest'
            ? list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : list.sort((a, b) => a.name.localeCompare(b.name));
    }, [restaurants, search, selectedCategory, sortBy]);

    const hasFilters = search.trim() !== '' || selectedCategory !== null || sortBy !== 'az';

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Restaurants — Hapag" />

            {/* ── Toast ─────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
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

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">All Restaurants</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} in Laguna
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative sm:w-72">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or city…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Category pills + sort ──────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === null ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-500 hover:text-green-500'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === cat.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-500 hover:text-green-500'}`}
                            >
                                {cat.icon && <span>{cat.icon}</span>}
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort pills */}
                    <div className="shrink-0 flex gap-2">
                        {[['az', 'A–Z'], ['newest', 'Newest']].map(([val, label]) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setSortBy(val)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === val ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Clear filters */}
                {hasFilters && (
                    <div className="mb-5 mt-2">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕ Clear all filters
                        </button>
                    </div>
                )}

                {/* ── Cuisine image strip (desktop, no active filter) ─────── */}
                {selectedCategory === null && !search.trim() && (
                    <div className="hidden lg:flex gap-5 overflow-x-auto pb-2 mb-7" style={{ scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className="shrink-0 flex flex-col items-center gap-2 group"
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-green-500 shadow-sm transition-all duration-150">
                                    <img
                                        src={getCuisineImage(cat.name)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="text-xs font-semibold text-green-500 text-center leading-tight max-w-[72px]">
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Grid ──────────────────────────────────────────────────── */}
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-20">
                        {restaurants.length === 0 ? (
                            <>
                                <span className="text-5xl mb-4 block">🍽️</span>
                                <p className="text-gray-500 font-semibold">No restaurants available yet.</p>
                            </>
                        ) : (
                            <>
                                <span className="text-4xl mb-3 block">🔍</span>
                                <p className="text-gray-500 font-semibold mb-2">No restaurants match your search.</p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm font-semibold text-green-500 hover:underline"
                                >
                                    Clear filters
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
                        {filteredRestaurants.map(r => (
                            <RestaurantCard
                                key={r.id}
                                restaurant={r}
                                isFavorited={favorites.has(r.id)}
                                onFavoriteToggle={toggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
