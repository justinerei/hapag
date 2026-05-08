import { useState, useMemo, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

const DELIVERY_FEE = 49;

function fmt(price) {
    return '₱ ' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

export default function CartIndex({ cartItems: initialItems, restaurant, cartCount: initialCount, orderType: initialType }) {
    const [items, setItems]         = useState(initialItems);
    const [orderType, setOrderType] = useState(initialType || 'pickup');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast]         = useState(null);
    const toastTimer = useRef(null);

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    }

    const subtotal = useMemo(
        () => items.reduce((sum, i) => sum + Number(i.menu_item.price) * i.quantity, 0),
        [items],
    );
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const total       = subtotal + deliveryFee;
    const localCount  = items.reduce((s, i) => s + i.quantity, 0);

    // ── Cart mutations ─────────────────────────────────────────────────────

    async function updateQty(cartItemId, newQty) {
        if (newQty < 1 || newQty > 99) return;
        const prev = items;
        setItems(cur => cur.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
        try {
            const res = await fetch(route('cart.update', cartItemId), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ quantity: newQty }),
            });
            if (!res.ok) { setItems(prev); showToast('Could not update quantity.', true); }
        } catch {
            setItems(prev);
            showToast('Could not update quantity.', true);
        }
    }

    async function removeItem(cartItemId) {
        const prev = items;
        setItems(cur => cur.filter(i => i.id !== cartItemId));
        try {
            const res = await fetch(route('cart.remove', cartItemId), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            if (!res.ok) { setItems(prev); showToast('Could not remove item.', true); }
        } catch {
            setItems(prev);
            showToast('Could not remove item.', true);
        }
    }

    async function clearCart() {
        try {
            const res = await fetch(route('cart.clear'), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            if (res.ok) {
                setItems([]);
            } else {
                showToast('Could not clear cart.', true);
            }
        } catch {
            showToast('Could not clear cart.', true);
        }
    }

    function proceedToCheckout() {
        setSubmitting(true);
        router.visit(route('checkout') + '?type=' + orderType);
    }

    const isEmpty = items.length === 0;

    return (
        <CustomerLayout cartCount={localCount}>
            <Head title="Your Cart — Hapag" />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg text-sm font-bold text-white pointer-events-none ${toast.isError ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page header */}
                <div className="mb-6">
                    {restaurant && (
                        <Link
                            href={route('restaurants.show', restaurant.id)}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors mb-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Back to {restaurant.name}
                        </Link>
                    )}
                    <h1 className="text-2xl font-extrabold text-gray-800">Your Cart</h1>
                    {restaurant && (
                        <p className="text-gray-500 text-sm mt-0.5">{restaurant.name} · {restaurant.municipality}</p>
                    )}
                </div>

                {/* Empty state */}
                {isEmpty ? (
                    <div className="text-center py-24">
                        <span className="text-6xl block mb-4">🛒</span>
                        <p className="text-gray-500 font-semibold text-lg mb-2">Your cart is empty.</p>
                        <p className="text-gray-400 text-sm mb-6">Add some food from a restaurant to get started.</p>
                        <Link
                            href={route('restaurants.index')}
                            className="inline-block px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                            Browse restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">

                        {/* Left: Items list */}
                        <div className="lg:col-span-2 space-y-3 mb-8 lg:mb-0">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                        {item.menu_item.image_url ? (
                                            <img
                                                src={item.menu_item.image_url}
                                                alt={item.menu_item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                                        )}
                                    </div>

                                    {/* Name + unit price */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm truncate">{item.menu_item.name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{fmt(item.menu_item.price)} each</p>
                                    </div>

                                    {/* Qty controls */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => updateQty(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-500 disabled:opacity-40 transition-colors font-bold text-base leading-none"
                                        >−</button>
                                        <span className="w-6 text-center text-sm font-bold text-gray-800 tabular-nums">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQty(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= 99}
                                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-500 disabled:opacity-40 transition-colors font-bold text-base leading-none"
                                        >+</button>
                                    </div>

                                    {/* Line total */}
                                    <p className="shrink-0 text-sm font-bold text-gray-800 min-w-[68px] text-right tabular-nums">
                                        {fmt(Number(item.menu_item.price) * item.quantity)}
                                    </p>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        aria-label="Remove item"
                                        className="shrink-0 ml-1 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    ✕ Clear all items
                                </button>
                            </div>
                        </div>

                        {/* Right: Order summary sidebar */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* Order Type Toggle */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <h2 className="font-bold text-gray-800 text-sm mb-3">Order Type</h2>
                                <div className="space-y-2">
                                    {[
                                        { value: 'pickup',   label: 'Pick-up',  sub: 'Pick up at the restaurant — free', icon: '🏪' },
                                        { value: 'delivery', label: 'Delivery', sub: `Flat delivery fee of ${fmt(DELIVERY_FEE)}`, icon: '🛵' },
                                    ].map(opt => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                                                orderType === opt.value
                                                    ? 'border-green-500 bg-green-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="order_type"
                                                value={opt.value}
                                                checked={orderType === opt.value}
                                                onChange={() => setOrderType(opt.value)}
                                                className="accent-green-500"
                                            />
                                            <span className="text-xl">{opt.icon}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.sub}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Order Summary */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                                <h2 className="font-bold text-gray-800 text-sm mb-3">Order Summary</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                        <span className="font-semibold text-gray-800 tabular-nums">{fmt(subtotal)}</span>
                                    </div>
                                    {orderType === 'delivery' && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery Fee</span>
                                            <span className="font-semibold text-gray-800 tabular-nums">{fmt(DELIVERY_FEE)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                                    <span className="font-extrabold text-gray-800">Total</span>
                                    <span className="font-extrabold text-lg text-gray-800 tabular-nums">{fmt(total)}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2">
                                    {orderType === 'delivery'
                                        ? 'Pay cash upon delivery to your door.'
                                        : 'Pay cash on pickup at the restaurant.'}
                                </p>
                            </div>

                            {/* Proceed to Checkout button */}
                            <button
                                type="button"
                                onClick={proceedToCheckout}
                                disabled={submitting}
                                className="w-full py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    'Loading checkout…'
                                ) : (
                                    <>
                                        Review & Place Order
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
