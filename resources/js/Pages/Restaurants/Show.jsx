import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import AIChatWidget from '@/Components/AIChatWidget';

const DELIVERY_FEE = 49;

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function fmt(price) {
    return '₱' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Show({
    restaurant,
    menuItems,
    featuredItems,
    restaurantVouchers,
    allVouchers,
    cartCount,
    favoriteIds,
    claimedCodes: serverClaimedCodes = [],
    isAuth,
}) {
    const [localCartCount, setLocalCartCount] = useState(cartCount);
    const [isFavorited, setIsFavorited] = useState(() => favoriteIds.includes(restaurant.id));
    const [menuSearch, setMenuSearch] = useState('');
    const [activeSection, setActiveSection] = useState('featured');

    // Item detail modal
    const [modalItem, setModalItem] = useState(null);
    const [modalQty, setModalQty] = useState(1);
    const [instructions, setInstructions] = useState('');
    const [adding, setAdding] = useState(false);

    // Cart conflict
    const [conflict, setConflict] = useState(null);

    // Cart sidebar
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [orderType, setOrderType] = useState('pickup');
    const [cutlery, setCutlery] = useState(false);

    // Promo claiming — seeded from server, extended locally on claim
    const [claimedCodes, setClaimedCodes] = useState(() => [...serverClaimedCodes]);

    // Sticky bar
    const stickyRef = useRef(null);
    const [isSticky, setIsSticky] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    // ── Derived ─────────────────────────────────────────────────────────────
    const categoryKeys = useMemo(() => Object.keys(menuItems), [menuItems]);

    const allItemsById = useMemo(() => {
        const map = {};
        Object.values(menuItems).forEach(items => items.forEach(i => { map[i.id] = i; }));
        featuredItems.forEach(i => { map[i.id] = i; });
        return map;
    }, [menuItems, featuredItems]);

    const filteredMenuItems = useMemo(() => {
        if (!menuSearch.trim()) return menuItems;
        const q = menuSearch.toLowerCase();
        const result = {};
        Object.entries(menuItems).forEach(([cat, items]) => {
            const filtered = items.filter(i =>
                i.name.toLowerCase().includes(q) ||
                (i.description && i.description.toLowerCase().includes(q))
            );
            if (filtered.length > 0) result[cat] = filtered;
        });
        return result;
    }, [menuItems, menuSearch]);

    const filteredKeys = useMemo(() => Object.keys(filteredMenuItems), [filteredMenuItems]);
    const noResults = menuSearch.trim() !== '' && filteredKeys.length === 0;

    const modalTotal = modalItem
        ? (Number(modalItem.price) * modalQty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00';

    const cartSubtotal = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const cartTotal = cartSubtotal + deliveryFee;

    // ── Fetch cart ──────────────────────────────────────────────────────────
    const fetchCart = useCallback(async () => {
        try {
            const res = await fetch(route('cart.json'));
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items ?? []);
                setLocalCartCount(data.count ?? 0);
            }
        } catch {}
        setCartLoading(false);
    }, []);

    useEffect(() => { if (isAuth) fetchCart(); else setCartLoading(false); }, [isAuth, fetchCart]);

    // ── Scroll-spy ──────────────────────────────────────────────────────────
    useEffect(() => {
        const ids = featuredItems.length > 0 ? ['featured', ...categoryKeys.map(slugify)] : categoryKeys.map(slugify);
        const handleScroll = () => {
            const pos = window.scrollY + 160;
            let active = ids[0] || 'featured';
            ids.forEach(id => {
                const el = document.getElementById(`section-${id}`);
                if (el && el.offsetTop <= pos) active = id;
            });
            setActiveSection(active);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categoryKeys, featuredItems]);

    // ── Sticky observer ─────────────────────────────────────────────────────
    useEffect(() => {
        const el = stickyRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsSticky(!entry.isIntersecting),
            { threshold: 0, rootMargin: '-57px 0px 0px 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // ── Body scroll lock ────────────────────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = modalItem ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [modalItem]);

    function showToast(msg, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ msg, isError });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }

    async function toggleFavorite(e) {
        e.preventDefault(); e.stopPropagation();
        try {
            const res = await fetch(route('favorites.toggle'), {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ restaurant_id: restaurant.id }),
            });
            if (res.ok) { const d = await res.json(); setIsFavorited(d.favorited); showToast(d.favorited ? 'Added to favorites!' : 'Removed from favorites.'); }
        } catch { showToast('Could not update favorites.', true); }
    }

    async function doAddToCart(itemId, qty, notes) {
        if (!isAuth) { window.location.href = route('login'); return; }
        setAdding(true);
        try {
            const res = await fetch(route('cart.add'), {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ menu_item_id: itemId, quantity: qty, instructions: notes }),
            });
            if (res.status === 409) { setConflict({ itemId, qty, notes }); setModalItem(null); return; }
            if (res.ok) {
                const d = await res.json();
                setLocalCartCount(d.cart_count);
                showToast(`${qty}× ${allItemsById[itemId]?.name ?? 'Item'} added!`);
                setModalItem(null);
                fetchCart();
            }
        } catch { showToast('Could not add to cart.', true); }
        finally { setAdding(false); }
    }

    async function confirmClearAndAdd() {
        try { await fetch(route('cart.clear'), { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf() } }); } catch {}
        const s = conflict; setConflict(null);
        await doAddToCart(s.itemId, s.qty, s.notes);
    }

    async function updateCartQty(cartItemId, newQty) {
        if (newQty < 1) { removeCartItem(cartItemId); return; }
        try {
            await fetch(route('cart.update', cartItemId), {
                method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ quantity: newQty }),
            });
            fetchCart();
        } catch {}
    }

    async function removeCartItem(cartItemId) {
        try {
            await fetch(route('cart.remove', cartItemId), { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf() } });
            fetchCart();
        } catch {}
    }

    function openModal(item) {
        if (!isAuth) { window.location.href = route('login'); return; }
        setModalItem(item); setModalQty(1); setInstructions('');
    }

    function scrollToSection(id) {
        const el = document.getElementById(`section-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Claim promo
    async function claimVoucher(voucher) {
        if (!isAuth) { window.location.href = route('login'); return; }
        try {
            const res = await fetch('/api/vouchers/claim', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ voucher_id: voucher.id }),
            });
            if (res.ok) {
                setClaimedCodes(prev => [...prev, voucher.code]);
                showToast(`Promo ${voucher.code} claimed!`);
            } else {
                const d = await res.json();
                showToast(d.message || 'Could not claim promo.', true);
            }
        } catch { showToast('Could not claim promo.', true); }
    }

    const tabSections = useMemo(() => {
        const tabs = [];
        if (featuredItems.length > 0) tabs.push({ id: 'featured', label: `Featured Items (${featuredItems.length})` });
        (menuSearch.trim() ? filteredKeys : categoryKeys).forEach(cat => {
            const count = (menuSearch.trim() ? filteredMenuItems[cat] : menuItems[cat])?.length ?? 0;
            tabs.push({ id: slugify(cat), label: `${cat} (${count})` });
        });
        return tabs;
    }, [featuredItems, categoryKeys, filteredKeys, menuSearch, menuItems, filteredMenuItems]);

    return (
        <CustomerLayout cartCount={localCartCount} hideSearch>
            <Head title={`${restaurant.name} — Hapag`} />

            {/* ── Toast ──────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.isError
                        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    }
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* ── Cart conflict modal ─────────────────────────────── */}
            {conflict && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-gray-800 text-base mb-2">Different restaurant</h3>
                        <p className="text-gray-500 text-sm mb-5">Your cart has items from another restaurant. Clear it to add from &ldquo;{restaurant.name}&rdquo;?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConflict(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button onClick={confirmClearAndAdd} className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Clear &amp; Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Item detail modal ──────────────────────────────── */}
            {modalItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalItem(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <button onClick={() => setModalItem(null)} className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                        <div className="overflow-y-auto flex-1">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:w-1/2 aspect-square bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                    {modalItem.image_url ? <img src={modalItem.image_url} alt={modalItem.name} className="w-full h-full object-cover" /> : <span className="text-7xl">{restaurant.category?.icon ?? '🍽️'}</span>}
                                </div>
                                <div className="sm:w-1/2 p-6 flex flex-col">
                                    <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">{modalItem.name}</h2>
                                    <p className="text-lg font-bold text-gray-800 mt-1.5">{fmt(modalItem.price)}</p>
                                    {modalItem.description && <p className="text-gray-500 text-sm mt-3 leading-relaxed">{modalItem.description}</p>}
                                    {modalItem.category && <p className="text-gray-400 text-xs mt-3">{modalItem.category}</p>}
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Special Instructions</h3>
                                <textarea rows={2} placeholder="e.g. No onions, extra sauce..." value={instructions} onChange={e => setInstructions(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none" />
                            </div>
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4 bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
                                    <button type="button" onClick={() => setModalQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-800 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/></svg></button>
                                    <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">{modalQty}</span>
                                    <button type="button" onClick={() => setModalQty(q => Math.min(99, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-800 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg></button>
                                </div>
                                <button type="button" onClick={() => doAddToCart(modalItem.id, modalQty, instructions)} disabled={adding || !modalItem.is_available} className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors text-center">
                                    {adding ? 'Adding…' : `Add ${modalQty} to cart · ₱${modalTotal}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                 RESTAURANT INFO HEADER
                 ═══════════════════════════════════════════════════════ */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
                <div className="flex items-start gap-5">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 hidden sm:block shadow-sm">
                        {restaurant.image_url
                            ? <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">{restaurant.category?.icon ?? '🍽️'}</span></div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        {restaurant.category && <p className="text-gray-400 text-xs font-medium">{restaurant.category.name}</p>}
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 leading-tight">{restaurant.name} – {restaurant.municipality}</h1>
                        <p className="text-gray-400 text-xs mt-0.5">{restaurant.min_order_amount ? `Min. order ₱${Number(restaurant.min_order_amount).toFixed(0)}` : 'No min. order'}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                            {restaurant.owner && <span className="text-green-500 font-semibold">Owner: {restaurant.owner.name}</span>}
                            {(restaurant.opening_time || restaurant.closing_time) && <span className="text-gray-500">{restaurant.opening_time ?? '10:00 AM'} – {restaurant.closing_time ?? '9:30 PM'}</span>}
                        </div>
                        {restaurant.description && <p className="text-gray-400 text-xs mt-2 leading-relaxed max-w-lg line-clamp-2">{restaurant.description}</p>}
                    </div>
                    <button type="button" onClick={toggleFavorite} className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-semibold transition-colors ${isFavorited ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span className="hidden sm:inline">{isFavorited ? 'Favorited' : 'Add to favorites'}</span>
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 PROMOS — claimable
                 ═══════════════════════════════════════════════════════ */}
            {restaurantVouchers.length > 0 && (
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                    <h2 className="text-lg font-extrabold text-gray-800 mb-3">Promos</h2>
                    <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {restaurantVouchers.map(v => {
                            const isClaimed = claimedCodes.includes(v.code);
                            const label = v.type === 'percentage' ? `${Number(v.value).toFixed(0)}% OFF` : `₱${Math.round(v.value)} OFF`;
                            return (
                                <div key={v.id} className="shrink-0 w-60 rounded-2xl overflow-hidden relative" style={{ background: isClaimed ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                    {/* Decorative % icon */}
                                    <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                                        <span className="text-white/60 text-lg font-bold">%</span>
                                    </div>
                                    <div className="p-4 flex flex-col min-h-[130px] justify-between">
                                        <div>
                                            <p className="text-white font-extrabold text-sm leading-tight">{v.code}</p>
                                            <p className="text-white/70 text-xs mt-1 leading-relaxed pr-10">
                                                {v.type === 'percentage' ? `Enjoy ${Number(v.value).toFixed(0)}% discount on your next ordering!` : `Get ₱${Math.round(v.value)} off your next order!`}
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-between mt-2">
                                            <p className="text-white font-extrabold text-xl leading-none">{label}</p>
                                            {isClaimed ? (
                                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wide">Claimed</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => claimVoucher(v)}
                                                    className="px-3 py-1 rounded-full bg-white text-green-600 text-[11px] font-bold hover:bg-green-50 transition-colors"
                                                >
                                                    Claim
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                 STICKY SEARCH + CATEGORY TABS
                 ═══════════════════════════════════════════════════════ */}
            <div ref={stickyRef} className="h-0" />
            <div className={`sticky top-14 z-30 bg-white border-b border-gray-100 transition-shadow duration-200 ${isSticky ? 'shadow-sm' : ''}`}>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4">
                    <div className="relative w-52 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" value={menuSearch} onChange={e => setMenuSearch(e.target.value)} placeholder="Search in menu..." className="w-full pl-9 pr-8 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                        {menuSearch && <button type="button" onClick={() => setMenuSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>}
                    </div>
                    <div className="flex-1 overflow-x-auto flex items-center gap-0.5" style={{ scrollbarWidth: 'none' }}>
                        {tabSections.map(tab => (
                            <button key={tab.id} onClick={() => scrollToSection(tab.id)} className={`shrink-0 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${activeSection === tab.id ? 'text-gray-800 border-gray-800' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 MAIN: MENU + CART SIDEBAR
                 ═══════════════════════════════════════════════════════ */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6 items-start">

                    <main className="flex-1 min-w-0">
                        {/* Featured Items */}
                        {featuredItems.length > 0 && !menuSearch.trim() && (
                            <section id="section-featured" className="mb-8 scroll-mt-32">
                                <h2 className="text-lg font-extrabold text-gray-800 mb-3">Featured Items</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {featuredItems.map(item => (
                                        <div key={item.id} className="group cursor-pointer" onClick={() => openModal(item)}>
                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">{restaurant.category?.icon ?? '🍽️'}</span></div>}
                                                <button type="button" onClick={e => { e.stopPropagation(); openModal(item); }} className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-gray-700 hover:bg-green-500 hover:text-white transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-sm text-gray-800 mt-1.5 leading-tight group-hover:text-green-500 transition-colors">{item.name}</h3>
                                            <p className="text-gray-600 text-xs font-semibold mt-0.5">{fmt(item.price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Category sections */}
                        {Object.entries(filteredMenuItems).map(([cat, items]) => (
                            <section key={cat} id={`section-${slugify(cat)}`} className="mb-8 scroll-mt-32">
                                <h2 className="text-lg font-extrabold text-gray-800 mb-3">{cat}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {items.map(item => (
                                        <div key={item.id} className={`flex border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer ${!item.is_available ? 'opacity-50' : ''}`} onClick={() => openModal(item)}>
                                            <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-800 leading-tight">{item.name}</h3>
                                                    {item.description && <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>}
                                                </div>
                                                <div className="flex items-center justify-between mt-2.5">
                                                    <p className="text-gray-800 text-sm font-semibold">{fmt(item.price)}</p>
                                                    {item.is_available && (
                                                        <button type="button" onClick={e => { e.stopPropagation(); openModal(item); }} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-28 sm:w-32 shrink-0 bg-gray-50">
                                                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">{restaurant.category?.icon ?? '🍽️'}</span></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {noResults && (
                            <div className="text-center py-16">
                                <span className="text-4xl mb-3 block">🔍</span>
                                <p className="text-gray-500 font-semibold text-sm">No menu items match.</p>
                                <button type="button" onClick={() => setMenuSearch('')} className="mt-2 text-sm font-semibold text-green-500 hover:underline">Clear search</button>
                            </div>
                        )}
                        {categoryKeys.length === 0 && !menuSearch.trim() && (
                            <div className="text-center py-16"><span className="text-4xl mb-3 block">🍽️</span><p className="text-gray-500 font-semibold text-sm">No menu items available yet.</p></div>
                        )}
                    </main>

                    {/* ── Cart sidebar ────────────────────────────── */}
                    <aside className="hidden lg:block w-[280px] shrink-0 sticky top-32">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Order type toggle */}
                            <div className="border-b border-gray-100 px-4 py-3">
                                <div className="flex border border-gray-200 rounded-full overflow-hidden">
                                    <button onClick={() => setOrderType('pickup')} className={`flex-1 text-center py-2 text-xs font-bold transition-colors ${orderType === 'pickup' ? 'bg-white text-gray-800 shadow-sm' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}>
                                        Pickup
                                    </button>
                                    <button onClick={() => setOrderType('delivery')} className={`flex-1 text-center py-2 text-xs font-bold transition-colors ${orderType === 'delivery' ? 'bg-white text-gray-800 shadow-sm' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}>
                                        Delivery
                                    </button>
                                </div>
                                <p className="text-gray-400 text-[10px] text-center mt-1.5">
                                    {orderType === 'pickup' ? '15–25 mins · Cash on Pickup' : '25–40 mins · Cash on Delivery'}
                                </p>
                            </div>

                            {/* Items */}
                            <div className="px-4 py-3 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {cartLoading ? (
                                    <div className="text-center py-6">
                                        <div className="flex gap-1 justify-center mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                ) : cartItems.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-3xl block mb-2">🛒</span>
                                        <p className="text-gray-800 text-sm font-bold">Your cart is empty</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Add items to get started</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-gray-800 mb-2.5">Your Items</p>
                                        <div className="space-y-2.5">
                                            {cartItems.map(ci => (
                                                <div key={ci.id} className="flex items-start gap-2">
                                                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                        {ci.image_url ? <img src={ci.image_url} alt={ci.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-base">🍽️</div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{ci.name}</p>
                                                        <p className="text-xs font-semibold text-gray-400">{fmt(ci.price)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 shrink-0">
                                                        <button onClick={() => removeCartItem(ci.id)} className="text-red-400 hover:text-red-600 p-0.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                        </button>
                                                        <button onClick={() => updateCartQty(ci.id, ci.quantity - 1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-[10px] font-bold">−</button>
                                                        <span className="w-4 text-center text-[10px] font-bold text-gray-800">{ci.quantity}</span>
                                                        <button onClick={() => updateCartQty(ci.id, ci.quantity + 1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-[10px] font-bold">+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer totals */}
                            {cartItems.length > 0 && (
                                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                                    {/* Fee breakdown */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="font-semibold text-gray-800">{fmt(cartSubtotal)}</span>
                                        </div>
                                        {orderType === 'delivery' && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Standard delivery</span>
                                                <span className="font-semibold text-gray-800">{fmt(DELIVERY_FEE)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cutlery toggle */}
                                    <div className="border-t border-gray-100 pt-2">
                                        <div className="flex items-start gap-2.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m-4-8a8 8 0 100 16 8 8 0 000-16z"/>
                                                    </svg>
                                                    Cutlery
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">No cutlery provided. Thanks for reducing waste!</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCutlery(v => !v)}
                                                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${cutlery ? 'bg-green-500' : 'bg-gray-200'}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${cutlery ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t border-gray-100 pt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-800">Total</span>
                                            <span className="text-sm font-extrabold text-green-600">{fmt(cartTotal)}</span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`${route('cart.index')}?type=${orderType}`}
                                        className="block w-full py-2.5 rounded-xl bg-green-500 text-white text-xs font-bold text-center hover:bg-green-600 transition-colors"
                                    >
                                        Review payment and address
                                    </Link>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── AI Chat (scoped to this restaurant) ─────────────── */}
            {isAuth && <AIChatWidget restaurantId={restaurant.id} restaurantName={restaurant.name} />}
        </CustomerLayout>
    );
}