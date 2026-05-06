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

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    preparing: 'bg-blue-50  text-blue-700  ring-1 ring-blue-200',
    ready:     'bg-green-50 text-green-700 ring-1 ring-green-200',
};

const STATUS_LABELS = {
    pending:   'Pending',
    preparing: 'Preparing',
    ready:     'Ready',
};

const TIMELINE_STEPS = [
    {
        key: 'pending',
        label: 'Order Placed',
        sublabel: 'Waiting for restaurant to confirm',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
        ),
    },
    {
        key: 'preparing',
        label: 'Preparing',
        sublabel: 'The kitchen is working on your order',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
            </svg>
        ),
    },
    {
        key: 'ready',
        label: 'Ready',
        sublabel: 'Your order is ready!',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
        ),
    },
];

const STATUS_STEP_INDEX = { pending: 0, preparing: 1, ready: 2 };

// ── Status Timeline ────────────────────────────────────────────────────────────

function StatusTimeline({ status }) {
    const currentIndex = STATUS_STEP_INDEX[status] ?? 0;

    return (
        <div className="bg-gradient-to-br from-green-50 via-white to-green-50/30 border border-green-100 rounded-2xl px-5 py-5">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-5">Order Status</p>
            <div className="flex items-start gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                    const isDone    = i < currentIndex;
                    const isActive  = i === currentIndex;
                    const isPending = i > currentIndex;

                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center relative">
                            {i > 0 && (
                                <div className={`
                                    absolute left-0 top-[24px] w-1/2 h-1 rounded-full -translate-y-1/2 transition-all duration-500
                                    ${isDone || isActive ? 'bg-green-500' : 'bg-gray-200'}
                                `} />
                            )}

                            {i < TIMELINE_STEPS.length - 1 && (
                                <div className={`
                                    absolute right-0 top-[24px] w-1/2 h-1 rounded-full -translate-y-1/2 transition-all duration-500
                                    ${isDone ? 'bg-green-500' : 'bg-gray-200'}
                                `} />
                            )}

                            <div className={`
                                relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                                ${isDone    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : ''}
                               ${isActive ? 'bg-green-600 text-white shadow-md shadow-green-600/20 scale-105' : ''}
                                ${isPending ? 'bg-white border-2 border-gray-200 text-gray-300 shadow-sm' : ''}
                            `}>
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
                                )}
                                {isDone ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                ) : (
                                    step.icon
                                )}
                            </div>

                            <p className={`text-[11px] font-extrabold text-center leading-tight tracking-wide
                                ${isActive  ? 'text-green-600' : ''}
                                ${isDone    ? 'text-gray-600' : ''}
                                ${isPending ? 'text-gray-300' : ''}
                            `}>
                                {step.label}
                            </p>
                            {isActive && (
                                <p className="text-[10px] text-green-500 font-medium text-center leading-tight mt-1 px-1 hidden sm:block">
                                    {step.sublabel}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Badge components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function OrderTypeBadge({ type }) {
    return type === 'delivery' ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 ring-1 ring-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 10a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4h4"/>
            </svg>
            Delivery
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-600 ring-1 ring-gray-200">
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

    const isActive = order.status === 'pending' || order.status === 'preparing';

    return (
        <div className={`
            bg-white rounded-2xl overflow-hidden transition-all duration-200
            ${isActive
                ? 'border border-green-200 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100'
                : 'border border-gray-200 shadow-sm hover:shadow-md'}
        `}>
            {isActive && (
                <div className="h-[3px] bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 animate-pulse" />
            )}

            <button
                type="button"
                onClick={onToggle}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/70 transition-colors duration-150"
            >
                {/* Order meta */}
                <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-900 text-[15px] truncate leading-snug mb-1.5">
                        {order.restaurant?.name ?? '—'}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <StatusBadge status={order.status} />
                        <OrderTypeBadge type={order.order_type} />
                        <span className="text-[11px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                            #{order.id}
                        </span>
                    </div>

                    <p className="text-gray-500 text-xs truncate">{itemsSummary}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{fmtDate(order.created_at)}</p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2.5">
                    <p className="font-extrabold text-gray-900 text-base tabular-nums">{fmt(order.final_amount)}</p>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${isExpanded ? 'bg-green-100 rotate-180' : 'bg-gray-100'}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-3.5 w-3.5 transition-colors duration-200 ${isExpanded ? 'text-green-600' : 'text-gray-400'}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </div>
            </button>

            {/* ── Expanded body ──────────────────────────────────────────── */}
            {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <StatusTimeline status={order.status} />

                    {/* Items list */}
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Items</p>
                        <div className="space-y-2.5">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
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
                                        <p className="text-xs text-gray-400">{fmt(item.unit_price)} × {item.quantity}</p>
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
                            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wide mb-0.5">Delivery Address</p>
                            <p className="text-sm text-gray-800">{order.delivery_address}</p>
                        </div>
                    )}

                    {/* Pickup note */}
                    {order.order_type === 'pickup' && order.pickup_note && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Pickup Note</p>
                            <p className="text-sm text-gray-700">{order.pickup_note}</p>
                        </div>
                    )}

                    {/* Scheduled pickup */}
                    {order.order_type === 'pickup' && order.scheduled_at && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Scheduled Pickup</p>
                                <p className="text-sm text-blue-600 font-medium">
                                    {new Date(order.scheduled_at).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    {' at '}
                                    {new Date(order.scheduled_at).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="tabular-nums font-medium">{fmt(order.total_amount)}</span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount{order.voucher ? ` (${order.voucher.code})` : ''}</span>
                                <span className="tabular-nums font-medium">− {fmt(order.discount_amount)}</span>
                            </div>
                        )}
                        {Number(order.delivery_fee) > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery Fee</span>
                                <span className="tabular-nums font-medium">{fmt(order.delivery_fee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
                            <span>Total</span>
                            <span className="tabular-nums">{fmt(order.final_amount)}</span>
                        </div>
                        <p className="text-xs text-gray-400 pt-0.5">
                            {order.order_type === 'delivery' ? 'Cash on delivery.' : 'Cash on pickup.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Filter Tabs ────────────────────────────────────────────────────────────────

const TABS = [
    {
        key: 'active',
        label: 'Active',
        filter: o => o.status === 'pending' || o.status === 'preparing',
        emptyIcon: '⏳',
        emptyText: 'No active orders',
        emptySubtext: 'Your ongoing orders will appear here.',
    },
    {
        key: 'ready',
        label: 'Ready',
        filter: o => o.status === 'ready',
        emptyIcon: '✅',
        emptyText: 'No ready orders',
        emptySubtext: 'Orders ready for pickup or delivery will appear here.',
    },
    {
        key: 'all',
        label: 'All',
        filter: () => true,
        emptyIcon: '🧾',
        emptyText: 'No orders yet',
        emptySubtext: 'Your order history will appear here once you place an order.',
    },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OrdersIndex({ orders, cartCount = 0 }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab]   = useState('active');
    const [expanded, setExpanded]     = useState(() => new Set());
    const [toast, setToast]           = useState(null);
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

   

    useEffect(() => {
        const hasActive = orders.some(o => o.status === 'pending' || o.status === 'preparing');
        if (!hasActive) setActiveTab('all');
    }, [orders]);

    function toggle(orderId) {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(orderId) ? next.delete(orderId) : next.add(orderId);
            return next;
        });
    }

    const currentTab     = TABS.find(t => t.key === activeTab);
    const filteredOrders = orders.filter(currentTab.filter);

    const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const readyCount  = orders.filter(o => o.status === 'ready').length;

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
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                    </p>
                </div>

                <div className="flex items-center gap-2 mb-5 flex-wrap">
                    {TABS.map(tab => {
                        const count = tab.key === 'active' ? activeCount
                                    : tab.key === 'ready'  ? readyCount
                                    : orders.length;
                        const isSelected = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 ${
                                    isSelected
                                        ? 'bg-green-500 text-white shadow-md shadow-green-200'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={`text-[11px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ${
                                        isSelected
                                            ? 'bg-white/25 text-white'
                                            : tab.key === 'active' && activeCount > 0
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">{currentTab.emptyIcon}</span>
                        <p className="text-gray-600 font-bold text-base mb-1">{currentTab.emptyText}</p>
                        <p className="text-gray-400 text-sm mb-6">{currentTab.emptySubtext}</p>
                        {activeTab === 'all' && (
                            <Link
                                href={route('restaurants.index')}
                                className="inline-block px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-md shadow-green-200"
                            >
                                Browse restaurants
                            </Link>
                        )}
                    </div>
                ) : (
                    /* This is the section updated for responsive multi-column layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 items-start">
                        {filteredOrders.map(order => (
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
