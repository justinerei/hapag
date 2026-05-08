import { useState, useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { motion, AnimatePresence, useInView } from 'framer-motion';

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

const FALLBACK_CUISINE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';
const FALLBACK_CARD    = 'https://picsum.photos/seed/hapag-card/800/600';

function getCuisineImage(name) {
    for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
        if (name.includes(key)) return url;
    }
    return FALLBACK_CUISINE;
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function isOpenNow(openingTime, closingTime) {
    if (!openingTime || !closingTime) return null;
    const now       = new Date();
    const [oh, om]  = openingTime.split(':').map(Number);
    const [ch, cm]  = closingTime.split(':').map(Number);
    const nowMins   = now.getHours() * 60 + now.getMinutes();
    const openMins  = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    if (openMins <= closeMins) return nowMins >= openMins && nowMins < closeMins;
    return nowMins >= openMins || nowMins < closeMins;
}

// ── Animation config ───────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1];

const fadeUp = {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease } },
};

const headerStagger = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

// ── SVG icons ──────────────────────────────────────────────────────────────────

function SearchIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
    );
}

function XIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    );
}

function HeartIcon({ className, filled }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className}
             fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
    );
}

function CheckIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
    );
}

function MapPinIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
    );
}

function ForkKnifeIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3v18M3 9h4a2 2 0 002-2V3M9 3v18M15 3v4a4 4 0 008 0V3M19 11v10"/>
        </svg>
    );
}

// ── RestaurantCard ─────────────────────────────────────────────────────────────

function RestaurantCard({ restaurant, isFavorited, onFavoriteToggle }) {
    const openStatus = isOpenNow(restaurant.opening_time, restaurant.closing_time);

    return (
        <Link
            href={route('restaurants.show', restaurant.id)}
            className="group relative block rounded-2xl overflow-hidden bg-gray-900 aspect-[4/3] cursor-pointer"
        >
            {/* Background image */}
            {restaurant.image_url ? (
                <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    onError={e => { e.currentTarget.src = FALLBACK_CARD; }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ willChange: 'transform' }}
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <ForkKnifeIcon className="h-12 w-12 text-gray-600" />
                </div>
            )}

            {/* Persistent bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/20 to-transparent pointer-events-none" />
            {/* Hover darken layer */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />

            {/* ── Top badges ─────────────────────────────────────────────── */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                {openStatus !== null ? (
                    <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border ${
                            openStatus
                                ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                                : 'bg-black/35 border-white/10 text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${openStatus ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        {openStatus ? 'Open now' : 'Closed'}
                    </span>
                ) : (
                    <span />
                )}

                <motion.button
                    type="button"
                    onClick={e => onFavoriteToggle(restaurant.id, e)}
                    whileTap={{ scale: 0.72 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 14 }}
                    className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center shrink-0 transition-colors ${
                        isFavorited
                            ? 'bg-red-500 border-red-400/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                            : 'bg-black/30 border-white/15 text-white/75 hover:bg-red-500/25 hover:border-red-300/30 hover:text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    }`}
                >
                    <HeartIcon className="h-3.5 w-3.5" filled={isFavorited} />
                </motion.button>
            </div>

            {/* ── Bottom text overlay ─────────────────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pointer-events-none">
                <h3 className="text-white font-bold text-[15px] leading-snug truncate transition-transform duration-300 group-hover:-translate-y-0.5">
                    {restaurant.name}
                </h3>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                        <MapPinIcon className="h-3 w-3 text-white/45 shrink-0" />
                        <span className="text-white/55 text-xs truncate">{restaurant.municipality}</span>
                    </div>
                    {restaurant.menu_items_count > 0 && (
                        <span className="text-white/35 text-xs shrink-0 tabular-nums">
                            {restaurant.menu_items_count} items
                        </span>
                    )}
                </div>
                {restaurant.category && (
                    <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mt-1.5">
                        {restaurant.category.name}
                    </p>
                )}
            </div>
        </Link>
    );
}

// ── FilterBar ──────────────────────────────────────────────────────────────────

function FilterBar({ categories, selectedCategory, onSelect, sortBy, onSort }) {
    return (
        <div className="flex items-center gap-3">
            {/* Scrollable category strip */}
            <div className="flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-center gap-2 pb-0.5 snap-x snap-mandatory">
                    {/* All */}
                    <motion.button
                        type="button"
                        onClick={() => onSelect(null)}
                        whileTap={{ scale: 0.95 }}
                        className={`shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                            selectedCategory === null
                                ? 'bg-green-500 border-green-500 text-white shadow-[0_2px_14px_-3px_rgba(34,197,94,0.5)]'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                        }`}
                    >
                        All
                    </motion.button>

                    {/* Categories with thumbnail */}
                    {categories.map(cat => {
                        const active = selectedCategory === cat.id;
                        return (
                            <motion.button
                                key={cat.id}
                                type="button"
                                onClick={() => onSelect(active ? null : cat.id)}
                                whileTap={{ scale: 0.95 }}
                                className={`shrink-0 snap-start flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                                    active
                                        ? 'bg-green-500 border-green-500 text-white shadow-[0_2px_14px_-3px_rgba(34,197,94,0.5)]'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg overflow-hidden shrink-0 ${active ? 'ring-2 ring-white/40' : ''}`}>
                                    <img
                                        src={getCuisineImage(cat.name)}
                                        alt={cat.name}
                                        onError={e => { e.currentTarget.src = FALLBACK_CUISINE; }}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {cat.name}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Divider + sort */}
            <div className="shrink-0 flex items-center gap-2">
                <div className="h-8 w-px bg-gray-200" aria-hidden="true" />
                {[['az', 'A–Z'], ['newest', 'New']].map(([val, label]) => (
                    <button
                        key={val}
                        type="button"
                        onClick={() => onSort(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                            sortBy === val
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────

function EmptyState({ hasRestaurants, onClear }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-6 text-gray-200"
            >
                {hasRestaurants
                    ? <SearchIcon className="h-16 w-16" />
                    : <ForkKnifeIcon className="h-16 w-16" />
                }
            </motion.div>
            <h3 className="text-gray-800 font-bold text-lg">
                {hasRestaurants ? 'No matches found' : 'No restaurants yet'}
            </h3>
            <p className="text-gray-400 text-sm mt-1.5 max-w-[240px] leading-relaxed">
                {hasRestaurants
                    ? 'Try a different search or remove a filter.'
                    : 'Check back soon — restaurants are being added.'}
            </p>
            {hasRestaurants && (
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClear}
                    className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                    Clear filters
                </motion.button>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Index({ restaurants, categories, cartCount = 0, favoriteIds = [] }) {
    const [search, setSearch]                     = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy]                     = useState('az');
    const [favorites, setFavorites]               = useState(() => new Set(favoriteIds));
    const [toast, setToast]                       = useState(null);
    const toastTimer = useRef(null);
    const gridRef    = useRef(null);
    const gridInView = useInView(gridRef, { once: true, margin: '-80px' });

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 2600);
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
                showToast(data.favorited ? 'Added to favorites' : 'Removed from favorites');
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

    const hasFilters  = search.trim() !== '' || selectedCategory !== null || sortBy !== 'az';
    const activeCount = (search.trim() ? 1 : 0) + (selectedCategory !== null ? 1 : 0) + (sortBy !== 'az' ? 1 : 0);

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="Restaurants — Hapag" />

            {/* ── Toast ─────────────────────────────────────────────────────── */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            key="toast"
                            initial={{ opacity: 0, y: -20, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white whitespace-nowrap ${
                                toast.isError ? 'bg-red-500' : 'bg-gray-900'
                            }`}
                        >
                            {toast.isError
                                ? <XIcon className="h-4 w-4 shrink-0" />
                                : <CheckIcon className="h-4 w-4 shrink-0 text-green-400" />
                            }
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Header ────────────────────────────────────────────────────── */}
            <motion.section
                variants={headerStagger}
                initial="hidden"
                animate="visible"
                className="relative overflow-hidden bg-gradient-to-b from-green-50/60 via-green-50/20 to-gray-50 pt-10 pb-9 lg:pt-14 lg:pb-11"
            >
                {/* Ambient radial glow — fixed, no scroll cost */}
                <div
                    className="pointer-events-none absolute -top-40 left-1/4 w-[700px] h-[480px] rounded-full bg-green-200/25 blur-[100px]"
                    aria-hidden="true"
                />

                <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title + count row */}
                    <div className="flex items-end justify-between mb-7">
                        <motion.div variants={fadeUp}>
                            <p className="text-[11px] font-bold text-green-600 uppercase tracking-widest mb-2">
                                Laguna province
                            </p>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight leading-none" style={{ textWrap: 'balance' }}>
                                Discover great food nearby.
                            </h1>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm shrink-0 ml-5"
                        >
                            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'place' : 'places'}
                            </span>
                        </motion.div>
                    </div>

                    {/* Search */}
                    <motion.div variants={fadeUp} className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="What are you craving?"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all"
                        />
                        <AnimatePresence>
                            {search && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6 }}
                                    transition={{ duration: 0.14 }}
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XIcon className="h-4 w-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.section>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* ── Filter bar ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, delay: 0.28, ease }}
                    className="mb-5"
                >
                    <FilterBar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                        sortBy={sortBy}
                        onSort={setSortBy}
                    />

                    <AnimatePresence>
                        {hasFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-2 pt-3">
                                    <span className="text-xs text-gray-400">
                                        {activeCount} filter{activeCount !== 1 ? 's' : ''} active
                                    </span>
                                    <span className="text-gray-300" aria-hidden="true">·</span>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Restaurant grid ─────────────────────────────────────── */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredRestaurants.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="col-span-full"
                            >
                                <EmptyState
                                    hasRestaurants={restaurants.length > 0}
                                    onClear={clearFilters}
                                />
                            </motion.div>
                        ) : (
                            filteredRestaurants.map((r, i) => (
                                <motion.div
                                    key={r.id}
                                    layout
                                    initial={{ opacity: 0, y: 22 }}
                                    animate={{
                                        opacity: gridInView ? 1 : 0,
                                        y: gridInView ? 0 : 22,
                                    }}
                                    exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.2 } }}
                                    transition={{
                                        opacity:  { duration: 0.45, delay: Math.min(i * 0.05, 0.35), ease },
                                        y:        { duration: 0.45, delay: Math.min(i * 0.05, 0.35), ease },
                                        layout:   { type: 'spring', stiffness: 280, damping: 28 },
                                    }}
                                    whileHover={{
                                        y: -6,
                                        transition: { type: 'spring', stiffness: 320, damping: 22 },
                                    }}
                                >
                                    <RestaurantCard
                                        restaurant={r}
                                        isFavorited={favorites.has(r.id)}
                                        onFavoriteToggle={toggleFavorite}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CustomerLayout>
    );
}
