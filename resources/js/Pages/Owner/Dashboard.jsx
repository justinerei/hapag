import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// ── Constants ──────────────────────────────────────────────────────────────────

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const NEXT_STATUS  = { pending: 'preparing', preparing: 'ready' };
const STATUS_BADGE = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    preparing: 'bg-blue-100 text-blue-700 border-blue-200',
    ready:     'bg-green-100 text-green-700 border-green-200',
};

const EMPTY_ITEM    = { name: '', description: '', price: '', category: '', is_available: true };
const EMPTY_VOUCHER = { code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', is_active: true, expires_at: '' };

const inputCls = [
    'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors',
].join(' ');

// ── Helpers ────────────────────────────────────────────────────────────────────

async function apiFetch(url, method, body) {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type':           'application/json',
            'Accept':                 'application/json',
            'X-CSRF-TOKEN':           CSRF(),
            'X-Requested-With':       'XMLHttpRequest',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(res.statusText);
        err.status = res.status;
        err.data   = data;
        throw err;
    }
    return data;
}

function cap(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Item Modal ─────────────────────────────────────────────────────────────────

function ItemModal({ mode, item, restaurantId, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add'
            ? { ...EMPTY_ITEM }
            : {
                name:         item.name,
                description:  item.description ?? '',
                price:        item.price,
                category:     item.category,
                is_available: item.is_available,
              }
    );
    const [errors,     setErrors]     = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            const url    = mode === 'add' ? route('owner.items.store') : route('owner.items.update', item.id);
            const method = mode === 'add' ? 'POST' : 'PATCH';
            const body   = mode === 'add' ? { ...form, restaurant_id: restaurantId } : form;
            const data   = await apiFetch(url, method, body);
            onSaved(data.item, mode);
        } catch (err) {
            if (err.status === 422) setErrors(err.data?.errors ?? {});
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-base font-extrabold text-gray-800 mb-4">
                    {mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Name *" error={errors.name?.[0]}>
                        <input type="text" value={form.name}
                            onChange={e => set('name', e.target.value)}
                            className={inputCls} required />
                    </Field>
                    <Field label="Category *" error={errors.category?.[0]}>
                        <input type="text" value={form.category}
                            onChange={e => set('category', e.target.value)}
                            placeholder="e.g. Main Course, Drinks"
                            className={inputCls} required />
                    </Field>
                    <Field label="Price (₱) *" error={errors.price?.[0]}>
                        <input type="number" step="0.01" min="0" value={form.price}
                            onChange={e => set('price', e.target.value)}
                            className={inputCls} required />
                    </Field>
                    <Field label="Description" error={errors.description?.[0]}>
                        <textarea value={form.description}
                            onChange={e => set('description', e.target.value)}
                            className={inputCls + ' resize-none'} rows={2}
                            placeholder="Short description (optional)" />
                    </Field>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.is_available}
                            onChange={e => set('is_available', e.target.checked)}
                            className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                        <span className="text-sm text-gray-700">Available now</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Voucher Modal ──────────────────────────────────────────────────────────────

function VoucherModal({ mode, voucher, restaurantId, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add'
            ? { ...EMPTY_VOUCHER }
            : {
                code:             voucher.code,
                type:             voucher.type,
                value:            voucher.value,
                min_order_amount: voucher.min_order_amount ?? '',
                max_uses:         voucher.max_uses ?? '',
                is_active:        voucher.is_active,
                expires_at:       voucher.expires_at ? voucher.expires_at.slice(0, 10) : '',
              }
    );
    const [errors,     setErrors]     = useState({});
    const [processing, setProcessing] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            const url    = mode === 'add' ? route('owner.vouchers.store') : route('owner.vouchers.update', voucher.id);
            const method = mode === 'add' ? 'POST' : 'PATCH';
            const data   = await apiFetch(url, method, { ...form, restaurant_id: restaurantId });
            onSaved(data.voucher, mode);
        } catch (err) {
            if (err.status === 422) setErrors(err.data?.errors ?? {});
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-base font-extrabold text-gray-800 mb-4">
                    {mode === 'add' ? 'Create Voucher' : 'Edit Voucher'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Code *" error={errors.code?.[0]}>
                        <input type="text" value={form.code}
                            onChange={e => set('code', e.target.value.toUpperCase())}
                            className={inputCls} placeholder="SAVE20" required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type *" error={errors.type?.[0]}>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed (₱)</option>
                            </select>
                        </Field>
                        <Field label={form.type === 'percentage' ? 'Value (%) *' : 'Value (₱) *'} error={errors.value?.[0]}>
                            <input type="number" step="0.01" min="0"
                                max={form.type === 'percentage' ? 100 : undefined}
                                value={form.value}
                                onChange={e => set('value', e.target.value)}
                                className={inputCls} required />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min. Order (₱)" error={errors.min_order_amount?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.min_order_amount}
                                onChange={e => set('min_order_amount', e.target.value)}
                                className={inputCls} placeholder="Optional" />
                        </Field>
                        <Field label="Max Uses" error={errors.max_uses?.[0]}>
                            <input type="number" min="1" value={form.max_uses}
                                onChange={e => set('max_uses', e.target.value)}
                                className={inputCls} placeholder="Unlimited" />
                        </Field>
                    </div>
                    <Field label="Expires At" error={errors.expires_at?.[0]}>
                        <input type="date" value={form.expires_at}
                            onChange={e => set('expires_at', e.target.value)}
                            className={inputCls} />
                    </Field>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.is_active}
                            onChange={e => set('is_active', e.target.checked)}
                            className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────

export default function OwnerDashboard({ restaurants: initialRestaurants }) {
    const [restaurants,   setRestaurants]  = useState(initialRestaurants);
    const [selectedId,    setSelectedId]   = useState(initialRestaurants[0]?.id ?? null);
    const [activeTab,     setActiveTab]    = useState('menu');
    const [ordersFilter,  setOrdersFilter] = useState('all');
    const [itemModal,     setItemModal]    = useState(null); // null | 'add' | item-object
    const [voucherModal,  setVoucherModal] = useState(null); // null | 'add' | voucher-object

    const restaurant = restaurants.find(r => r.id === selectedId) ?? restaurants[0] ?? null;

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-sm">No restaurant data found.</p>
            </div>
        );
    }

    const menuItems = restaurant.menu_items ?? [];
    const orders    = restaurant.orders    ?? [];
    const vouchers  = restaurant.vouchers  ?? [];

    // ── State updater helper ───────────────────────────────────────────────
    function patchRestaurant(fn) {
        setRestaurants(prev => prev.map(r => r.id === restaurant.id ? fn(r) : r));
    }

    // ── Menu item actions ──────────────────────────────────────────────────
    async function toggleItem(item) {
        try {
            const data = await apiFetch(route('owner.items.toggle', item.id), 'PATCH');
            patchRestaurant(r => ({
                ...r,
                menu_items: r.menu_items.map(i => i.id === item.id ? { ...i, is_available: data.is_available } : i),
            }));
        } catch { /* silent fail */ }
    }

    async function deleteItem(item) {
        if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
        try {
            await apiFetch(route('owner.items.destroy', item.id), 'DELETE');
            patchRestaurant(r => ({ ...r, menu_items: r.menu_items.filter(i => i.id !== item.id) }));
        } catch (err) {
            if (err?.data?.error) alert(err.data.error);
        }
    }

    function onItemSaved(saved, mode) {
        patchRestaurant(r => ({
            ...r,
            menu_items: mode === 'add'
                ? [...r.menu_items, saved]
                : r.menu_items.map(i => i.id === saved.id ? saved : i),
        }));
        setItemModal(null);
    }

    // ── Order actions ──────────────────────────────────────────────────────
    async function advanceStatus(order) {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        try {
            const data = await apiFetch(route('owner.orders.status', order.id), 'PATCH', { status: next });
            patchRestaurant(r => ({
                ...r,
                orders: r.orders.map(o => o.id === order.id ? { ...o, status: data.status } : o),
            }));
        } catch { /* silent fail */ }
    }

    // ── Voucher actions ────────────────────────────────────────────────────
    async function deleteVoucher(v) {
        if (!confirm(`Delete voucher "${v.code}"?`)) return;
        try {
            await apiFetch(route('owner.vouchers.destroy', v.id), 'DELETE');
            patchRestaurant(r => ({ ...r, vouchers: r.vouchers.filter(vch => vch.id !== v.id) }));
        } catch { /* silent fail */ }
    }

    function onVoucherSaved(saved, mode) {
        patchRestaurant(r => ({
            ...r,
            vouchers: mode === 'add'
                ? [saved, ...r.vouchers]
                : r.vouchers.map(v => v.id === saved.id ? saved : v),
        }));
        setVoucherModal(null);
    }

    // ── Derived order counts ───────────────────────────────────────────────
    const orderCounts = {
        all:       orders.length,
        pending:   orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready:     orders.filter(o => o.status === 'ready').length,
    };
    const filteredOrders = ordersFilter === 'all' ? orders : orders.filter(o => o.status === ordersFilter);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <Head title={`${restaurant.name} — Owner Dashboard`} />

            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-gray-800 tracking-tight">🍽️ Hapag</span>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 hidden sm:block">Owner Dashboard</span>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* ── Restaurant selector ─────────────────────────────────── */}
                {restaurants.length > 1 && (
                    <div className="mb-5">
                        <select
                            value={selectedId}
                            onChange={e => { setSelectedId(Number(e.target.value)); setActiveTab('menu'); setOrdersFilter('all'); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:border-green-500"
                        >
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ── Restaurant header ──────────────────────────────────── */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-gray-800">{restaurant.name}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            restaurant.status === 'active'  ? 'bg-green-100 text-green-700 border-green-200' :
                            restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                              'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                            {cap(restaurant.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{restaurant.municipality}</p>
                </div>

                {/* ── Tab bar ────────────────────────────────────────────── */}
                <div className="flex gap-0 mb-6 border-b border-gray-200">
                    {[
                        { key: 'menu',     label: `Menu Items (${menuItems.length})` },
                        { key: 'orders',   label: `Orders (${orderCounts.pending + orderCounts.preparing} active)` },
                        { key: 'vouchers', label: `Vouchers (${vouchers.length})` },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    Tab: Menu Items
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'menu' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-500">{menuItems.length} item{menuItems.length !== 1 ? 's' : ''}</p>
                            <button
                                onClick={() => setItemModal('add')}
                                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                            >
                                + Add Item
                            </button>
                        </div>

                        {menuItems.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                                <p className="text-gray-400 text-sm">No menu items yet. Add your first item.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Item</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Price</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Status</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {menuItems.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.category}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                    ₱{Number(item.price).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => toggleItem(item)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                                            item.is_available
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {item.is_available ? '● Available' : '○ Sold Out'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button onClick={() => setItemModal(item)}
                                                            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => deleteItem(item)}
                                                            className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    Tab: Orders
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'orders' && (
                    <div>
                        {/* Filter pills */}
                        <div className="flex gap-2 flex-wrap mb-4">
                            {[
                                { key: 'all',       label: `All (${orderCounts.all})` },
                                { key: 'pending',   label: `Pending (${orderCounts.pending})` },
                                { key: 'preparing', label: `Preparing (${orderCounts.preparing})` },
                                { key: 'ready',     label: `Ready (${orderCounts.ready})` },
                            ].map(f => (
                                <button key={f.key} onClick={() => setOrdersFilter(f.key)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                        ordersFilter === f.key
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                                <p className="text-gray-400 text-sm">No orders here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">

                                        {/* Order header */}
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-extrabold text-gray-800">
                                                    Order #{order.id}
                                                </span>

                                                {/* PICKUP / DELIVERY badge */}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    order.order_type === 'delivery'
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {order.order_type === 'delivery' ? 'DELIVERY' : 'PICKUP'}
                                                </span>

                                                {/* Status badge */}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[order.status] ?? ''}`}>
                                                    {cap(order.status)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleString('en-PH', {
                                                    month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Customer */}
                                        <p className="text-sm text-gray-700 mb-2">
                                            <span className="font-semibold">{order.user?.name ?? 'Customer'}</span>
                                            {order.user?.municipality && (
                                                <span className="text-gray-400 text-xs ml-1">· {order.user.municipality}</span>
                                            )}
                                        </p>

                                        {/* Delivery address */}
                                        {order.order_type === 'delivery' && order.delivery_address && (
                                            <div className="inline-flex items-start gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mb-3">
                                                <span>📍</span>
                                                <span>{order.delivery_address}</span>
                                            </div>
                                        )}

                                        {/* Pickup note */}
                                        {order.order_type === 'pickup' && order.pickup_note && (
                                            <div className="inline-block text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 mb-3">
                                                {order.pickup_note}
                                            </div>
                                        )}

                                        {/* Items */}
                                        <ul className="text-xs text-gray-500 space-y-0.5 mb-3">
                                            {order.items?.map(oi => (
                                                <li key={oi.id}>
                                                    ×{oi.quantity} {oi.menu_item?.name ?? 'Item'}
                                                    <span className="text-gray-400 ml-1">
                                                        — ₱{(Number(oi.unit_price) * oi.quantity).toFixed(2)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Totals row + status button */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                                            <div className="text-sm">
                                                <span className="text-gray-500">Total </span>
                                                <span className="font-extrabold text-gray-800">
                                                    ₱{Number(order.final_amount ?? order.total_amount).toFixed(2)}
                                                </span>
                                                {Number(order.delivery_fee) > 0 && (
                                                    <span className="text-xs text-gray-400 ml-1">
                                                        (+ ₱{Number(order.delivery_fee).toFixed(2)} delivery)
                                                    </span>
                                                )}
                                            </div>

                                            {NEXT_STATUS[order.status] ? (
                                                <button
                                                    onClick={() => advanceStatus(order)}
                                                    className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    Mark as {cap(NEXT_STATUS[order.status])}
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-green-600">✓ Ready for {order.order_type === 'delivery' ? 'pickup by driver' : 'customer pickup'}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    Tab: Vouchers
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'vouchers' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-500">{vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}</p>
                            <button
                                onClick={() => setVoucherModal('add')}
                                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                            >
                                + Create Voucher
                            </button>
                        </div>

                        {vouchers.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                                <p className="text-gray-400 text-sm">No vouchers yet. Create one to attract customers.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Discount</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Expires</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center hidden md:table-cell">Uses</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Active</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vouchers.map(v => (
                                            <tr key={v.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-gray-800 tracking-widest font-mono text-xs">
                                                        {v.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                                                    {v.type === 'percentage'
                                                        ? `${Number(v.value)}% off`
                                                        : `₱${Number(v.value).toFixed(2)} off`}
                                                    {v.min_order_amount && (
                                                        <span className="text-xs text-gray-400 ml-1">
                                                            (min ₱{Number(v.min_order_amount).toFixed(0)})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                                                    {v.expires_at
                                                        ? new Date(v.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : <span className="text-gray-300">No expiry</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 text-center hidden md:table-cell">
                                                    {v.used_count ?? 0}/{v.max_uses ?? '∞'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {v.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button onClick={() => setVoucherModal(v)}
                                                            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => deleteVoucher(v)}
                                                            className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── Modals ─────────────────────────────────────────────────── */}
            {itemModal !== null && (
                <ItemModal
                    mode={itemModal === 'add' ? 'add' : 'edit'}
                    item={itemModal === 'add' ? null : itemModal}
                    restaurantId={restaurant.id}
                    onClose={() => setItemModal(null)}
                    onSaved={onItemSaved}
                />
            )}
            {voucherModal !== null && (
                <VoucherModal
                    mode={voucherModal === 'add' ? 'add' : 'edit'}
                    voucher={voucherModal === 'add' ? null : voucherModal}
                    restaurantId={restaurant.id}
                    onClose={() => setVoucherModal(null)}
                    onSaved={onVoucherSaved}
                />
            )}
        </>
    );
}
