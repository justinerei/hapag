import { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(price) {
    return '₱ ' + Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Badge components ───────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:   'bg-yellow-100 text-yellow-700',
    preparing: 'bg-blue-100   text-blue-600',
    ready:     'bg-green-100  text-green-600',
};

const STATUS_LABELS = {
    pending:   'Pending',
    preparing: 'Preparing',
    ready:     'Ready',
};

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function OrderTypeBadge({ type }) {
    return type === 'delivery' ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 10a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4h4"/>
            </svg>
            Delivery
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Pickup
        </span>
    );
}

// ── Order card ─────────────────────────────────────────────────────────────────

function OrderCard({ order, isExpanded, onToggle }) {
    const itemsSummary = order.items.length === 0
        ? 'No items'
        : order.items.slice(0, 2).map(i => `${i.quantity}× ${i.menu_item.name}`).join(', ')
            + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '');

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            {/* ── Collapsed header — always visible, click to toggle ─────── */}
            <button
                type="button"
                onClick={onToggle}
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
            >
                {/* Order meta */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
                        <StatusBadge status={order.status} />
                        <OrderTypeBadge type={order.order_type} />
                    </div>
                    <p className="font-bold text-gray-800 text-sm truncate">{order.restaurant?.name ?? '—'}</p>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{itemsSummary}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{fmtDate(order.created_at)}</p>
                </div>

                {/* Total + chevron */}
                <div className="shrink-0 flex items-center gap-3">
                    <p className="font-extrabold text-gray-800 text-sm tabular-nums">{fmt(order.final_amount)}</p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
            </button>

            {/* ── Expanded body ──────────────────────────────────────────── */}
            {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">

                    {/* Items list */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                        <div className="space-y-2">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    {/* Thumbnail */}
                                    <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        {item.menu_item?.image_url ? (
                                            <img
                                                src={item.menu_item.image_url}
                                                alt={item.menu_item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm">🍽️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 font-semibold truncate">{item.menu_item?.name ?? '—'}</p>
                                        <p className="text-xs text-gray-500">{fmt(item.unit_price)} × {item.quantity}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-bold text-gray-800 tabular-nums">
                                        {fmt(Number(item.unit_price) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery address */}
                    {order.order_type === 'delivery' && order.delivery_address && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                            <p className="text-xs font-bold text-orange-600 mb-0.5">Delivery Address</p>
                            <p className="text-sm text-gray-800">{order.delivery_address}</p>
                        </div>
                    )}

                    {/* Pickup note */}
                    {order.order_type === 'pickup' && order.pickup_note && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-xs font-bold text-gray-500 mb-0.5">Pickup Note</p>
                            <p className="text-sm text-gray-700">{order.pickup_note}</p>
                        </div>
                    )}

                    {/* Pricing breakdown */}
                    <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{fmt(order.total_amount)}</span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount{order.voucher ? ` (${order.voucher.code})` : ''}</span>
                                <span className="tabular-nums">− {fmt(order.discount_amount)}</span>
                            </div>
                        )}
                        {Number(order.delivery_fee) > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span className="tabular-nums">{fmt(order.delivery_fee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-extrabold text-gray-800 pt-1 border-t border-gray-100">
                            <span>Total</span>
                            <span className="tabular-nums">{fmt(order.final_amount)}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {order.order_type === 'delivery' ? 'Cash on delivery.' : 'Cash on pickup.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrdersIndex({ orders, cartCount = 0 }) {
    const { flash } = usePage().props;
    const [expanded, setExpanded] = useState(() => new Set());
    const [toast, setToast]       = useState(null);
    const toastTimer = useRef(null);

    function showToast(message, isError = false) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, isError });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    // Show flash message from checkout redirect
    useEffect(() => {
        if (flash?.success) showToast(flash.success);
        if (flash?.error)   showToast(flash.error, true);
    }, [flash?.success, flash?.error]);

    function toggle(orderId) {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(orderId) ? next.delete(orderId) : next.add(orderId);
            return next;
        });
    }

    return (
        <CustomerLayout cartCount={cartCount}>
            <Head title="My Orders — Hapag" />

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
                    <h1 className="text-2xl font-extrabold text-gray-800">My Orders</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                    </p>
                </div>

                {/* ── Empty state ────────────────────────────────────────────── */}
                {orders.length === 0 ? (
                    <div className="text-center py-24">
                        <span className="text-6xl block mb-4">🧾</span>
                        <p className="text-gray-500 font-semibold text-lg mb-2">No orders yet.</p>
                        <p className="text-gray-400 text-sm mb-6">Your order history will appear here once you place an order.</p>
                        <Link
                            href={route('restaurants.index')}
                            className="inline-block px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                            Browse restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-2xl space-y-3">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isExpanded={expanded.has(order.id)}
                                onToggle={() => toggle(order.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
