import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Helpers ────────────────────────────────────────────────────────────────────

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

export default function FavoritesIndex({ restaurants: initialRestaurants, cartCount = 0, favoriteIds = [] }) {
    const [list, setList]           = useState(initialRestaurants);
    const [favorites, setFavorites] = useState(() => new Set(favoriteIds));
    const [toast, setToast]         = useState(null);
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
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (!data.favorited) {
                setList(prev => prev.filter(r => r.id !== restaurantId));
                setFavorites(prev => { const next = new Set(prev); next.delete(restaurantId); return next; });
                showToast('Removed from favorites.');
            } else {
                setFavorites(prev => { const next = new Set(prev); next.add(restaurantId); return next; });
                showToast('Added to favorites!');
            }
        } catch {
            showToast('Could not update favorites.', true);
        }
    }

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Favorites — Hapag" />

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
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-800">
                        Your Favorites
                        {list.length > 0 && (
                            <span className="text-gray-500 font-semibold text-base ml-2">({list.length})</span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Restaurants you've saved for quick access.</p>
                </div>

                {/* ── Empty state ────────────────────────────────────────────── */}
                {list.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800 mb-2">No favorites yet</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                            Tap the heart icon on any restaurant to save it here for quick access.
                        </p>
                        <Link
                            href={route('restaurants.index')}
                            className="inline-block px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {list.map(r => (
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
