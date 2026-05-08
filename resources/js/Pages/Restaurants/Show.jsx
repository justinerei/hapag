import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ── Icon primitives ───────────────────────────────────────────────────────────

function IcoSearch({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
}
function IcoX({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
}
function IcoPlus({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>;
}
function IcoMinus({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/></svg>;
}
function IcoHeart({ c, filled }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>;
}
function IcoTrash({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
}
function IcoBag({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>;
}
function IcoChevUp({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>;
}
function IcoChevDown({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>;
}
function IcoChevLeft({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>;
}
function IcoClock({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
}
function IcoCheck({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;
}
function IcoPin({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
}
function IcoTag({ c }) {
    return <svg xmlns="http://www.w3.org/2000/svg" className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>;
}

function FoodImg({ src, alt, className }) {
    if (src) return <img src={src} alt={alt} className={className} loading="lazy" />;
    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
        </div>
    );
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

    // Cart
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [orderType, setOrderType] = useState('pickup');
    const [cutlery, setCutlery] = useState(false);
    const [cartExpanded, setCartExpanded] = useState(false);

    // Promo claiming
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
    const totalItemCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

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
        if (featuredItems.length > 0) tabs.push({ id: 'featured', label: 'Featured' });
        (menuSearch.trim() ? filteredKeys : categoryKeys).forEach(cat => {
            tabs.push({ id: slugify(cat), label: cat });
        });
        return tabs;
    }, [featuredItems, categoryKeys, filteredKeys, menuSearch]);

    return (
        <CustomerLayout cartCount={localCartCount} hideSearch>
            <Head title={`${restaurant.name} — Hapag`} />

            {/* ── Toast ──────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white pointer-events-none whitespace-nowrap ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        {toast.isError ? <IcoX c="h-4 w-4 shrink-0" /> : <IcoCheck c="h-4 w-4 shrink-0" />}
                        <span>{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Cart conflict modal ─────────────────────────────── */}
            <AnimatePresence>
                {conflict && (
                    <motion.div
                        key="conflict-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.94, y: 10 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
                        >
                            <h3 className="font-bold text-gray-800 text-base mb-2">Different restaurant</h3>
                            <p className="text-gray-500 text-sm mb-5">Your cart has items from another restaurant. Clear it to add from &ldquo;{restaurant.name}&rdquo;?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConflict(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={confirmClearAndAdd} className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors">Clear &amp; Add</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Item detail modal ──────────────────────────────── */}
            <AnimatePresence>
                {modalItem && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalItem(null)} />
                        <motion.div
                            initial={{ opacity: 0, y: 32, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 32, scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
                            className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
                        >
                            {/* Food image */}
                            <div className="relative w-full aspect-[16/9] bg-gray-100 shrink-0 overflow-hidden">
                                <FoodImg
                                    src={modalItem.image_url}
                                    alt={modalItem.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                <button
                                    onClick={() => setModalItem(null)}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                                >
                                    <IcoX c="h-4 w-4" />
                                </button>
                                {!modalItem.is_available && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-bold text-base tracking-wide">Unavailable</span>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto flex-1 px-5 pt-4 pb-2">
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{modalItem.name}</h2>
                                    <p className="text-xl font-extrabold text-green-600 shrink-0">{fmt(modalItem.price)}</p>
                                </div>
                                {modalItem.category && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold mb-3">
                                        <IcoTag c="h-3 w-3" />
                                        {modalItem.category}
                                    </span>
                                )}
                                {modalItem.description && (
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{modalItem.description}</p>
                                )}
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wide">Special instructions</label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g. No onions, extra sauce..."
                                        value={instructions}
                                        onChange={e => setInstructions(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Action footer */}
                            <div className="border-t border-gray-100 px-5 py-4 bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setModalQty(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            <IcoMinus c="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-900 select-none">{modalQty}</span>
                                        <button
                                            type="button"
                                            onClick={() => setModalQty(q => Math.min(99, q + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            <IcoPlus c="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => doAddToCart(modalItem.id, modalQty, instructions)}
                                        disabled={adding || !modalItem.is_available}
                                        className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
                                    >
                                        {adding ? 'Adding…' : `Add ${modalQty} · ₱${modalTotal}`}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════
                 RESTAURANT HERO HEADER
                 ═══════════════════════════════════════════════════════ */}
            <div className="relative bg-gray-900 overflow-hidden">
                {restaurant.image_url && (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/65 to-gray-800/40" />

                <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-7">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-white/50 text-xs font-medium hover:text-white/80 transition-colors mb-5"
                    >
                        <IcoChevLeft c="h-3.5 w-3.5" />
                        Back to restaurants
                    </Link>

                    <div className="flex items-end justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {restaurant.category && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/75 text-xs font-semibold mb-2.5 border border-white/10 backdrop-blur-sm">
                                    <IcoTag c="h-3 w-3" />
                                    {restaurant.category.name}
                                </span>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight mb-2">
                                {restaurant.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/55 text-xs">
                                <span className="flex items-center gap-1.5">
                                    <IcoPin c="h-3.5 w-3.5" />
                                    {restaurant.municipality}
                                </span>
                                {(restaurant.opening_time || restaurant.closing_time) && (
                                    <span className="flex items-center gap-1.5">
                                        <IcoClock c="h-3.5 w-3.5" />
                                        {restaurant.opening_time ?? '10:00 AM'} – {restaurant.closing_time ?? '9:30 PM'}
                                    </span>
                                )}
                                {restaurant.min_order_amount && (
                                    <span className="flex items-center gap-1.5">
                                        <IcoBag c="h-3.5 w-3.5" />
                                        Min. order {fmt(restaurant.min_order_amount)}
                                    </span>
                                )}
                            </div>
                            {restaurant.description && (
                                <p className="text-white/40 text-xs mt-2.5 leading-relaxed max-w-lg line-clamp-2">{restaurant.description}</p>
                            )}
                        </div>

                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleFavorite}
                            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all backdrop-blur-sm ${
                                isFavorited
                                    ? 'border-red-400/50 text-red-400 bg-red-500/15'
                                    : 'border-white/20 text-white/60 bg-white/10 hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10'
                            }`}
                        >
                            <IcoHeart c="h-4 w-4" filled={isFavorited} />
                            <span className="hidden sm:inline text-xs">{isFavorited ? 'Favorited' : 'Favorite'}</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 PROMOS
                 ═══════════════════════════════════════════════════════ */}
            {restaurantVouchers.length > 0 && (
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Available Promos</p>
                        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                            {restaurantVouchers.map(v => {
                                const isClaimed = claimedCodes.includes(v.code);
                                const label = v.type === 'percentage' ? `${Number(v.value).toFixed(0)}% OFF` : `₱${Math.round(v.value)} OFF`;
                                return (
                                    <div
                                        key={v.id}
                                        className={`shrink-0 w-56 rounded-2xl border border-dashed p-3.5 flex items-center gap-3 transition-all ${isClaimed ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50 hover:border-green-300'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${isClaimed ? 'bg-gray-200 text-gray-400' : 'bg-green-500 text-white'}`}>
                                            %
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-extrabold text-sm leading-tight ${isClaimed ? 'text-gray-400' : 'text-gray-800'}`}>{label}</p>
                                            <p className="text-gray-400 text-[10px] truncate mt-0.5">{v.code}</p>
                                        </div>
                                        {isClaimed ? (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold shrink-0">
                                                <IcoCheck c="h-2.5 w-2.5" />
                                                Done
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => claimVoucher(v)}
                                                className="px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold hover:bg-green-600 transition-colors shrink-0"
                                            >
                                                Claim
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                 STICKY SEARCH + CATEGORY TABS
                 ═══════════════════════════════════════════════════════ */}
            <div ref={stickyRef} className="h-0" />
            <div className={`sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-shadow duration-200 ${isSticky ? 'shadow-sm' : ''}`}>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    {/* Search bar */}
                    <div className="relative mb-3">
                        <IcoSearch c="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={menuSearch}
                            onChange={e => setMenuSearch(e.target.value)}
                            placeholder="Search menu items..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/25 focus:border-green-400 focus:bg-white transition-all"
                        />
                        <AnimatePresence>
                            {menuSearch && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    type="button"
                                    onClick={() => setMenuSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
                                >
                                    <IcoX c="h-3 w-3" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Category pills */}
                    <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {tabSections.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                                    activeSection === tab.id
                                        ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                 MAIN MENU — FULL WIDTH
                 ═══════════════════════════════════════════════════════ */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36">

                {/* Featured Items */}
                {featuredItems.length > 0 && !menuSearch.trim() && (
                    <section id="section-featured" className="mb-10 scroll-mt-40">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-lg font-extrabold text-gray-900">Featured Items</h2>
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-500 text-xs font-bold">{featuredItems.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {featuredItems.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 30 }}
                                    onClick={() => openModal(item)}
                                    className={`group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${!item.is_available ? 'opacity-60' : ''}`}
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                        <FoodImg
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {!item.is_available && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded-full">Sold out</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1 group-hover:text-green-600 transition-colors">{item.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-green-600 text-sm font-extrabold">{fmt(item.price)}</p>
                                            {item.is_available && (
                                                <button
                                                    type="button"
                                                    onClick={e => { e.stopPropagation(); openModal(item); }}
                                                    className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 active:scale-90 transition-all shadow-sm"
                                                >
                                                    <IcoPlus c="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category sections */}
                {Object.entries(filteredMenuItems).map(([cat, items], si) => (
                    <motion.section
                        key={cat}
                        id={`section-${slugify(cat)}`}
                        className="mb-10 scroll-mt-40"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: si * 0.035, type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-1 h-5 rounded-full bg-green-500 shrink-0" />
                            <h2 className="text-lg font-extrabold text-gray-900">{cat}</h2>
                            <span className="text-gray-400 text-sm">({items.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => openModal(item)}
                                    className={`group flex border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer ${!item.is_available ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="font-bold text-sm text-gray-900 leading-tight group-hover:text-green-600 transition-colors">{item.name}</h3>
                                            {item.description && (
                                                <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-green-600 text-sm font-extrabold">{fmt(item.price)}</p>
                                            {item.is_available ? (
                                                <button
                                                    type="button"
                                                    onClick={e => { e.stopPropagation(); openModal(item); }}
                                                    className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 active:scale-90 transition-all shadow-sm"
                                                >
                                                    <IcoPlus c="h-3.5 w-3.5" />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Sold out</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-28 sm:w-32 shrink-0 bg-gray-50 overflow-hidden">
                                        <FoodImg
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}

                {/* Empty states */}
                {noResults && (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <IcoSearch c="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-gray-800 font-bold text-sm">No items match &ldquo;{menuSearch}&rdquo;</p>
                        <p className="text-gray-400 text-xs mt-1">Try a different keyword</p>
                        <button type="button" onClick={() => setMenuSearch('')} className="mt-3 text-sm font-semibold text-green-500 hover:underline">Clear search</button>
                    </div>
                )}
                {categoryKeys.length === 0 && !menuSearch.trim() && (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <IcoBag c="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-gray-800 font-bold text-sm">No menu items available yet</p>
                        <p className="text-gray-400 text-xs mt-1">Check back soon</p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════
                 FLOATING CART — OPTION A
                 ═══════════════════════════════════════════════════════ */}
            {isAuth && cartItems.length > 0 && (
                <>
                    {/* Backdrop for expanded cart */}
                    <AnimatePresence>
                        {cartExpanded && (
                            <motion.div
                                key="cart-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[38]"
                                onClick={() => setCartExpanded(false)}
                            />
                        )}
                    </AnimatePresence>

                    <div className="fixed bottom-5 right-4 sm:right-6 z-[39] w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px]">
                        <AnimatePresence mode="wait">
                            {cartExpanded ? (
                                /* ── EXPANDED CART PANEL ── */
                                <motion.div
                                    key="cart-expanded"
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 16, scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 36 }}
                                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                                    style={{ maxHeight: '72vh' }}
                                >
                                    {/* Panel header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <IcoBag c="h-4 w-4 text-green-500" />
                                            <span className="font-bold text-gray-900 text-sm">Your Order</span>
                                            <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-extrabold flex items-center justify-center">{totalItemCount}</span>
                                        </div>
                                        <button
                                            onClick={() => setCartExpanded(false)}
                                            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <IcoChevDown c="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Order type toggle */}
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
                                            <button
                                                onClick={() => setOrderType('pickup')}
                                                className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'pickup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Pickup · 15–25 min
                                            </button>
                                            <button
                                                onClick={() => setOrderType('delivery')}
                                                className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'delivery' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Delivery · 25–40 min
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '200px', scrollbarWidth: 'thin' }}>
                                        {cartItems.map(ci => (
                                            <div key={ci.id} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                    <FoodImg src={ci.image_url} alt={ci.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{ci.name}</p>
                                                    <p className="text-xs text-gray-400">{fmt(ci.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => updateCartQty(ci.id, ci.quantity - 1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-xs"
                                                    >−</button>
                                                    <span className="w-5 text-center text-xs font-bold text-gray-900 select-none">{ci.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQty(ci.id, ci.quantity + 1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-xs"
                                                    >+</button>
                                                    <button
                                                        onClick={() => removeCartItem(ci.id)}
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-0.5"
                                                    >
                                                        <IcoTrash c="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer: cutlery + fees + checkout */}
                                    <div className="border-t border-gray-100 px-4 py-3 space-y-2.5">
                                        {/* Cutlery toggle */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-800">Cutlery</p>
                                                <p className="text-[10px] text-gray-400">Help reduce waste</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCutlery(v => !v)}
                                                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${cutlery ? 'bg-green-500' : 'bg-gray-200'}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${cutlery ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        {/* Fee breakdown */}
                                        <div className="space-y-1 pt-2 border-t border-gray-50">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Subtotal</span>
                                                <span className="font-semibold text-gray-800">{fmt(cartSubtotal)}</span>
                                            </div>
                                            {orderType === 'delivery' && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400">Delivery fee</span>
                                                    <span className="font-semibold text-gray-800">{fmt(DELIVERY_FEE)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
                                                <span className="text-sm font-bold text-gray-900">Total</span>
                                                <span className="text-base font-extrabold text-green-600">{fmt(cartTotal)}</span>
                                            </div>
                                        </div>

                                        {/* Checkout */}
                                        <Link
                                            href={`${route('cart.index')}?type=${orderType}`}
                                            className="block w-full py-3 rounded-xl bg-green-500 text-white text-sm font-bold text-center hover:bg-green-600 active:scale-[0.98] transition-all shadow-sm shadow-green-500/30"
                                        >
                                            Review payment and address
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── COLLAPSED CART PILL ── */
                                <motion.button
                                    key="cart-collapsed"
                                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 36 }}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setCartExpanded(true)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/35 hover:bg-green-600 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-green-600 flex items-center justify-center">
                                            <span className="text-xs font-extrabold">{totalItemCount}</span>
                                        </div>
                                        <span className="text-sm font-bold">View order</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold">{fmt(cartTotal)}</span>
                                        <IcoChevUp c="h-4 w-4 opacity-70" />
                                    </div>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}

            {/* ── AI Chat ─────────────────────────────────────────── */}
            {isAuth && <AIChatWidget restaurantId={restaurant.id} restaurantName={restaurant.name} />}
        </CustomerLayout>
    );
}
