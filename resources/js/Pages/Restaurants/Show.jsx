import { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Helpers ───────────────────────────────────────────────────────────────────

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function fmt(price) {
    return '₱ ' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Show({
    restaurant,
    menuItems,          // { "Category": [ MenuItem, ... ], ... }
    featuredItems,      // MenuItem[]
    restaurantVouchers, // Voucher[]
    allVouchers,        // Voucher[]
    cartCount,
    favoriteIds,
    isAuth,
}) {
    // ── Core state ────────────────────────────────────────────────────────────
    const [localCartCount, setLocalCartCount] = useState(cartCount);
    const [isFavorited, setIsFavorited]       = useState(() => favoriteIds.includes(restaurant.id));
    const [menuSearch, setMenuSearch]         = useState('');
    const [activeSection, setActiveSection]   = useState('featured');

    // Item detail modal
    const [modalItem, setModalItem]       = useState(null);
    const [modalQty, setModalQty]         = useState(1);
    const [instructions, setInstructions] = useState('');
    const [adding, setAdding]             = useState(false);

    // Cart conflict modal
    const [conflict, setConflict] = useState(null); // { itemId, qty, notes }

    // Toast
    const [toast, setToast]     = useState(null);
    const toastTimer             = useRef(null);

    // ── Derived ───────────────────────────────────────────────────────────────
    const categoryKeys = useMemo(() => Object.keys(menuItems), [menuItems]);

    const allItemsById = useMemo(() => {
        const map = {};
        Object.values(menuItems).forEach(items => items.forEach(i => { map[i.id] = i; }));
        featuredItems.forEach(i => { map[i.id] = i; });
        return map;
    }, []);

    const filteredMenuItems = useMemo(() => {
        if (!menuSearch.trim()) return menuItems;
        const q = menuSearch.toLowerCase();
        const result = {};
        Object.entries(menuItems).forEach(([cat, items]) => {
            const filtered = items.filter(i => i.name.toLowerCase().includes(q));
            if (filtered.length > 0) result[cat] = filtered;
        });
        return result;
    }, [menuItems, menuSearch]);

    const noResults = menuSearch.trim() !== '' && Object.keys(filteredMenuItems).length === 0;

    const modalTotal = modalItem
        ? (Number(modalItem.price) * modalQty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00';

    // ── Scroll-spy ────────────────────────────────────────────────────────────
    useEffect(() => {
        const ids = ['featured', ...categoryKeys.map(slugify)];
        const handleScroll = () => {
            const pos = window.scrollY + 120;
            let active = 'featured';
            ids.forEach(id => {
                const el = document.getElementById(`section-${id}`);
                if (el && el.offsetTop <= pos) active = id;
            });
            setActiveSection(active);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categoryKeys]);

    // ── Body scroll lock when modal open ─────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = modalItem ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [modalItem]);

    // ── Toast ─────────────────────────────────────────────────────────────────
    function showToast(msg, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ msg, isError });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }

    // ── Favorite toggle ───────────────────────────────────────────────────────
    async function toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(route('favorites.toggle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ restaurant_id: restaurant.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setIsFavorited(data.favorited);
                showToast(data.favorited ? 'Added to favorites!' : 'Removed from favorites.');
            }
        } catch {
            showToast('Could not update favorites.', true);
        }
    }

    // ── Cart ──────────────────────────────────────────────────────────────────
    async function doAddToCart(itemId, qty, notes) {
        if (!isAuth) { window.location.href = route('login'); return; }
        setAdding(true);
        try {
            const res = await fetch(route('cart.add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ menu_item_id: itemId, quantity: qty, instructions: notes }),
            });
            if (res.status === 409) {
                setConflict({ itemId, qty, notes });
                setModalItem(null);
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setLocalCartCount(data.cart_count);
                const name = allItemsById[itemId]?.name ?? 'Item';
                showToast(`${qty}× ${name} added to cart!`);
                setModalItem(null);
            }
        } catch {
            showToast('Could not add to cart.', true);
        } finally {
            setAdding(false);
        }
    }

    async function confirmClearAndAdd() {
        try {
            await fetch(route('cart.clear'), { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf() } });
        } catch { /* ignore */ }
        const saved = conflict;
        setConflict(null);
        await doAddToCart(saved.itemId, saved.qty, saved.notes);
    }

    function openModal(item) {
        if (!isAuth) { window.location.href = route('login'); return; }
        setModalItem(item);
        setModalQty(1);
        setInstructions('');
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <CustomerLayout cartCount={localCartCount}>
            <Head title={`${restaurant.name} — Hapag`} />

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
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* ── Cart conflict modal ────────────────────────────────────────── */}
            {conflict && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-800 text-base">Different restaurant</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                            Your cart has items from another restaurant. Clear it to add from "{restaurant.name}"?
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

            {/* ── Item detail modal ──────────────────────────────────────────── */}
            {modalItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalItem(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        {/* Close */}
                        <button
                            onClick={() => setModalItem(null)}
                            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1">
                            <div className="flex flex-col sm:flex-row">
                                {/* Image */}
                                <div className="sm:w-1/2 aspect-square bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                    {modalItem.image_url ? (
                                        <img src={modalItem.image_url} alt={modalItem.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-7xl">{restaurant.category?.icon ?? '🍽️'}</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="sm:w-1/2 p-6 flex flex-col">
                                    <div className="flex items-start gap-2">
                                        <h2 className="flex-1 text-2xl font-extrabold text-gray-800 leading-tight">{modalItem.name}</h2>
                                        {!modalItem.is_available && (
                                            <span className="shrink-0 mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase">Sold Out</span>
                                        )}
                                    </div>
                                    <p className="text-lg font-mono font-bold text-gray-800 mt-1.5">{fmt(modalItem.price)}</p>
                                    {modalItem.description && (
                                        <p className="text-gray-500 text-sm mt-3 leading-relaxed">{modalItem.description}</p>
                                    )}
                                    {modalItem.category && (
                                        <p className="text-gray-400 text-xs mt-3">{modalItem.category}</p>
                                    )}
                                </div>
                            </div>

                            {/* Special instructions */}
                            <div className="px-6 py-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Special Instructions</h3>
                                <p className="text-gray-400 text-xs mb-2">Any preferences or allergies? Let the restaurant know.</p>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. No onions, extra sauce..."
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Fixed bottom bar */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                {/* Quantity picker */}
                                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setModalQty(q => Math.max(1, q - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/>
                                        </svg>
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">{modalQty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setModalQty(q => Math.min(99, q + 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Add to cart button */}
                                <button
                                    type="button"
                                    onClick={() => doAddToCart(modalItem.id, modalQty, instructions)}
                                    disabled={adding || !modalItem.is_available}
                                    className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
                                >
                                    {adding
                                        ? 'Adding…'
                                        : `Add ${modalQty} to cart • ₱${modalTotal}`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page ──────────────────────────────────────────────────────── */}
            <div>

                {/* ── Hero banner ─────────────────────────────────────────── */}
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56 md:h-64 bg-gray-200">
                        {restaurant.image_url ? (
                            <img
                                src={restaurant.image_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                                <span className="text-8xl">{restaurant.category?.icon ?? '🍽️'}</span>
                            </div>
                        )}

                        {/* Favorite heart */}
                        <button
                            type="button"
                            onClick={toggleFavorite}
                            className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors hover:text-red-500 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                                 fill={isFavorited ? 'currentColor' : 'none'}
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Body ────────────────────────────────────────────────── */}
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                    {/* Restaurant info header */}
                    <div className="flex items-start justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">{restaurant.name}</h1>
                            <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                                {restaurant.category && (
                                    <span className="text-green-500 font-semibold">{restaurant.category.name}</span>
                                )}
                                {(restaurant.opening_time || restaurant.closing_time) && (
                                    <span className="text-yellow-500 font-semibold">
                                        {restaurant.opening_time ?? '10:00 AM'} – {restaurant.closing_time ?? '9:30 PM'}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{restaurant.municipality}, Laguna</p>
                            {restaurant.description && (
                                <p className="text-gray-500 text-xs mt-2 leading-relaxed max-w-md">{restaurant.description}</p>
                            )}
                        </div>

                        {/* In-restaurant search (desktop) */}
                        <div className="hidden sm:block shrink-0 w-72">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search menu items…"
                                    value={menuSearch}
                                    onChange={e => setMenuSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                />
                                {menuSearch && (
                                    <button type="button" onClick={() => setMenuSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="sm:hidden relative mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search menu items…"
                            value={menuSearch}
                            onChange={e => setMenuSearch(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                        />
                        {menuSearch && (
                            <button type="button" onClick={() => setMenuSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Two-column layout */}
                    <div className="flex gap-8 items-start">

                        {/* ── Left sidebar (desktop, sticky) ────────────────── */}
                        <aside className="hidden lg:block w-[200px] shrink-0 sticky top-20">
                            <nav className="space-y-0">
                                {featuredItems.length > 0 && (
                                    <a
                                        href="#section-featured"
                                        className={`flex items-center px-3 py-2.5 text-sm border-l-[3px] rounded-r-lg transition-all ${
                                            activeSection === 'featured'
                                                ? 'font-bold text-gray-800 border-gray-800 bg-gray-100/60'
                                                : 'font-semibold text-green-500 border-transparent hover:border-green-500/40 hover:bg-green-50/40'
                                        }`}
                                    >
                                        Featured Items
                                    </a>
                                )}
                                {categoryKeys.map(cat => (
                                    <a
                                        key={cat}
                                        href={`#section-${slugify(cat)}`}
                                        className={`flex items-center px-3 py-2.5 text-sm border-l-[3px] rounded-r-lg transition-all ${
                                            activeSection === slugify(cat)
                                                ? 'font-bold text-gray-800 border-gray-800 bg-gray-100/60'
                                                : 'font-semibold text-green-500 border-transparent hover:border-green-500/40 hover:bg-green-50/40'
                                        }`}
                                    >
                                        {cat}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* ── Main content ──────────────────────────────────── */}
                        <main className="flex-1 min-w-0">

                            {/* ── Promo voucher cards ──────────────────────── */}
                            {restaurantVouchers.length > 0 && (
                                <section className="mb-8">
                                    <h2 className="text-xl font-extrabold text-gray-800 mb-3">Promos</h2>
                                    <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                        {restaurantVouchers.map(v => {
                                            const label = v.type === 'percentage'
                                                ? `${v.value}% OFF`
                                                : `₱${Math.round(v.value)} OFF`;
                                            const desc = v.type === 'percentage'
                                                ? `Enjoy ${v.value}% discount on your next order!`
                                                : `Get ₱${Math.round(v.value)} off your next order!`;
                                            return (
                                                <div
                                                    key={v.id}
                                                    className="shrink-0 w-52 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                                                    style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)' }}
                                                >
                                                    <div className="p-5 flex flex-col min-h-[140px] justify-between">
                                                        <div>
                                                            <p className="text-white font-extrabold text-sm leading-tight mb-1">{restaurant.name}</p>
                                                            <p className="text-white/65 text-xs leading-relaxed">{desc}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <p className="text-white font-extrabold text-xl font-mono leading-none">{label}</p>
                                                            <span className="text-white/80 text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wide">{v.code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* ── Featured Items ────────────────────────────── */}
                            {featuredItems.length > 0 && !menuSearch.trim() && (
                                <section id="section-featured" className="mb-8 scroll-mt-20">
                                    <h2 className="text-xl font-extrabold text-gray-800 mb-3">Featured Items</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {featuredItems.map(item => (
                                            <div
                                                key={item.id}
                                                className="group cursor-pointer"
                                                onClick={() => openModal(item)}
                                            >
                                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                            <span className="text-5xl">{restaurant.category?.icon ?? '🍽️'}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); openModal(item); }}
                                                        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 hover:bg-green-500 hover:text-white transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-sm text-gray-800 mt-2 leading-tight group-hover:text-green-500 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-800 text-xs font-mono font-semibold mt-0.5">{fmt(item.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Menu category sections ────────────────────── */}
                            {Object.entries(filteredMenuItems).map(([cat, items]) => (
                                <section key={cat} id={`section-${slugify(cat)}`} className="mb-8 scroll-mt-20">
                                    <h2 className="text-xl font-extrabold text-gray-800 mb-3">{cat}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                className={`flex items-stretch border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all duration-200 cursor-pointer ${!item.is_available ? 'opacity-60' : ''}`}
                                                onClick={() => openModal(item)}
                                            >
                                                {/* Text side */}
                                                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                                                    <div>
                                                        <div className="flex items-start gap-2">
                                                            <h3 className="flex-1 font-bold text-sm text-gray-800 leading-tight">{item.name}</h3>
                                                            {!item.is_available && (
                                                                <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">Sold Out</span>
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <p className="text-gray-800 text-sm font-mono font-semibold">{fmt(item.price)}</p>
                                                        {item.is_available && (
                                                            <button
                                                                type="button"
                                                                onClick={e => { e.stopPropagation(); openModal(item); }}
                                                                className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors shrink-0"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Image side */}
                                                <div className="w-32 sm:w-36 shrink-0 bg-gray-100">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-3xl">{restaurant.category?.icon ?? '🍽️'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}

                            {/* No search results */}
                            {noResults && (
                                <div className="text-center py-16">
                                    <span className="text-4xl mb-3 block">🔍</span>
                                    <p className="text-gray-500 font-semibold text-sm">No menu items match your search.</p>
                                    <button
                                        type="button"
                                        onClick={() => setMenuSearch('')}
                                        className="mt-2 text-sm font-semibold text-green-500 hover:underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}

                            {/* Empty restaurant (no menu items at all) */}
                            {categoryKeys.length === 0 && !menuSearch.trim() && (
                                <div className="text-center py-16">
                                    <span className="text-4xl mb-3 block">🍽️</span>
                                    <p className="text-gray-500 font-semibold text-sm">No menu items available yet.</p>
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
