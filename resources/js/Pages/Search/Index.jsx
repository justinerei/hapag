import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

function fmt(price) {
    return '₱' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// ── Dish Preview Card ─────────────────────────────────────────────────────────

function DishCard({ dish }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group">
            <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="w-full text-left"
            >
                <div className="flex gap-3 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {dish.image_url ? (
                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{dish.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">{dish.restaurant?.name}</p>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="font-extrabold text-green-600 text-sm">{fmt(dish.price)}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{dish.category}</span>
                        </div>
                    </div>
                </div>
            </button>

            {/* Expanded preview */}
            {expanded && (
                <div className="mt-2 ml-[92px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {dish.description && (
                        <p className="text-gray-600 text-xs leading-relaxed mb-3">{dish.description}</p>
                    )}
                    <Link
                        href={route('restaurants.show', dish.restaurant_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                        View restaurant menu
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SearchIndex({ query, restaurants, dishes, cartCount, favoriteIds }) {
    const [favorites, setFavorites] = useState(() => new Set(favoriteIds));
    const [tab, setTab] = useState('all');

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
            }
        } catch { /* ignore */ }
    }

    const handleNavSearch = (val) => {
        if (val.length >= 2) {
            router.visit(route('search') + '?q=' + encodeURIComponent(val), { preserveState: false });
        }
    };

    const totalResults = restaurants.length + dishes.length;
    const hasQuery = query.length >= 2;

    return (
        <CustomerLayout cartCount={cartCount} initialSearch={query} onSearchSubmit={handleNavSearch}>
            <Head title={`Search: ${query} — Hapag`} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header */}
                <div className="mb-6">
                    {hasQuery ? (
                        <>
                            <h1 className="text-2xl font-extrabold text-gray-800">
                                Results for "{query}"
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                            </p>
                        </>
                    ) : (
                        <h1 className="text-2xl font-extrabold text-gray-800">Search</h1>
                    )}
                </div>

                {/* Tabs */}
                {hasQuery && totalResults > 0 && (
                    <div className="flex gap-1 mb-6">
                        {[
                            ['all', `All (${totalResults})`],
                            ['restaurants', `Restaurants (${restaurants.length})`],
                            ['dishes', `Dishes (${dishes.length})`],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                                    tab === key
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {hasQuery && totalResults === 0 && (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">🔍</span>
                        <p className="text-gray-500 font-semibold text-lg">No results for "{query}"</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different spelling or keyword.</p>
                    </div>
                )}

                {/* No query state */}
                {!hasQuery && (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">🍜</span>
                        <p className="text-gray-500 font-semibold">Type at least 2 characters to search</p>
                        <p className="text-gray-400 text-sm mt-1">Search for restaurants, dishes, or cuisines</p>
                    </div>
                )}

                {/* Restaurants section */}
                {(tab === 'all' || tab === 'restaurants') && restaurants.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-extrabold text-gray-800 mb-4">Restaurants</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
                            {restaurants.map(r => (
                                <Link
                                    key={r.id}
                                    href={route('restaurants.show', r.id)}
                                    className="group block"
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-xl">
                                        {r.image_url ? (
                                            <img src={r.image_url} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                <span className="text-4xl">{r.category?.icon ?? '🍽️'}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <button
                                            type="button"
                                            onClick={(e) => toggleFavorite(r.id, e)}
                                            className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all hover:scale-110 ${favorites.has(r.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={favorites.has(r.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-green-600 transition-colors">{r.name}</h3>
                                        <p className="text-gray-400 text-xs mt-0.5">{r.municipality} · 5–15 min.</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Dishes section */}
                {(tab === 'all' || tab === 'dishes') && dishes.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-extrabold text-gray-800 mb-4">Dishes</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dishes.map(d => (
                                <DishCard key={d.id} dish={d} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}