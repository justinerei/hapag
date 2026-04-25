import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// ── Constants ──────────────────────────────────────────────────────────────────

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const WEATHER_TAGS = ['rainy', 'hot', 'cool', 'cloudy'];

const WEATHER_BADGE = {
    rainy:  'bg-blue-100 text-blue-700',
    hot:    'bg-orange-100 text-orange-700',
    cool:   'bg-cyan-100 text-cyan-700',
    cloudy: 'bg-gray-100 text-gray-600',
};

const EMPTY_CATEGORY = { name: '', icon: '', weather_tag: 'rainy' };
const EMPTY_VOUCHER  = {
    code: '', type: 'percentage', value: '', min_order_amount: '',
    max_uses: '', is_active: true, expires_at: '',
};

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
            'Content-Type':     'application/json',
            'Accept':           'application/json',
            'X-CSRF-TOKEN':     CSRF(),
            'X-Requested-With': 'XMLHttpRequest',
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

// ── Category Modal ─────────────────────────────────────────────────────────────

function CategoryModal({ mode, category, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add' ? { ...EMPTY_CATEGORY } : {
            name:        category.name,
            icon:        category.icon,
            weather_tag: category.weather_tag,
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
            const url    = mode === 'add'
                ? route('admin.categories.store')
                : route('admin.categories.update', category.id);
            const method = mode === 'add' ? 'POST' : 'PATCH';
            const data   = await apiFetch(url, method, form);
            onSaved(data.category, mode);
        } catch (err) {
            if (err.status === 422) setErrors(err.data?.errors ?? {});
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h2 className="text-base font-extrabold text-gray-800 mb-4">
                    {mode === 'add' ? 'Add Category' : 'Edit Category'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Name *" error={errors.name?.[0]}>
                        <input type="text" value={form.name}
                            onChange={e => set('name', e.target.value)}
                            className={inputCls} required />
                    </Field>
                    <Field label="Icon (emoji) *" error={errors.icon?.[0]}>
                        <input type="text" value={form.icon}
                            onChange={e => set('icon', e.target.value)}
                            placeholder="e.g. 🍜"
                            className={inputCls} required maxLength={10} />
                    </Field>
                    <Field label="Weather Tag *" error={errors.weather_tag?.[0]}>
                        <select value={form.weather_tag}
                            onChange={e => set('weather_tag', e.target.value)}
                            className={inputCls}>
                            {WEATHER_TAGS.map(t => (
                                <option key={t} value={t}>{cap(t)}</option>
                            ))}
                        </select>
                    </Field>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Voucher Modal ──────────────────────────────────────────────────────────────

function VoucherModal({ mode, voucher, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add' ? { ...EMPTY_VOUCHER } : {
            code:             voucher.code,
            type:             voucher.type,
            value:            voucher.value,
            min_order_amount: voucher.min_order_amount ?? '',
            max_uses:         voucher.max_uses ?? '',
            is_active:        voucher.is_active,
            expires_at:       voucher.expires_at
                ? String(voucher.expires_at).substring(0, 10)
                : '',
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
            const url    = mode === 'add'
                ? route('admin.vouchers.store')
                : route('admin.vouchers.update', voucher.id);
            const method = mode === 'add' ? 'POST' : 'PATCH';
            const data   = await apiFetch(url, method, form);
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
                    {mode === 'add' ? 'Create Site-wide Voucher' : 'Edit Voucher'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Code *" error={errors.code?.[0]}>
                        <input type="text" value={form.code}
                            onChange={e => set('code', e.target.value.toUpperCase())}
                            placeholder="e.g. WELCOME20"
                            className={inputCls + ' uppercase tracking-widest'} required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type *" error={errors.type?.[0]}>
                            <select value={form.type}
                                onChange={e => set('type', e.target.value)}
                                className={inputCls}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed (₱)</option>
                            </select>
                        </Field>
                        <Field label={form.type === 'percentage' ? 'Value (%)' : 'Value (₱)'} error={errors.value?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.value}
                                onChange={e => set('value', e.target.value)}
                                className={inputCls} required />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min Order (₱)" error={errors.min_order_amount?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.min_order_amount}
                                onChange={e => set('min_order_amount', e.target.value)}
                                placeholder="None"
                                className={inputCls} />
                        </Field>
                        <Field label="Max Uses" error={errors.max_uses?.[0]}>
                            <input type="number" min="1" value={form.max_uses}
                                onChange={e => set('max_uses', e.target.value)}
                                placeholder="Unlimited"
                                className={inputCls} />
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
                            className="w-4 h-4 accent-green-500" />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminDashboard({
    pendingRestaurants: initialPending,
    categories:         initialCategories,
    vouchers:           initialVouchers,
    lastBackup:         initialLastBackup,
    lastBackupFile:     initialLastBackupFile,
}) {
    const [pending,    setPending]    = useState(initialPending);
    const [categories, setCategories] = useState(initialCategories);
    const [vouchers,   setVouchers]   = useState(initialVouchers);
    const [lastBackup, setLastBackup] = useState(initialLastBackup);
    const [backupFile, setBackupFile] = useState(initialLastBackupFile);

    const [activeTab,     setActiveTab]     = useState('restaurants');
    const [categoryModal, setCategoryModal] = useState(null);
    const [voucherModal,  setVoucherModal]  = useState(null);
    const [backupLoading, setBackupLoading] = useState(false);

    // ── Restaurant actions ──────────────────────────────────────────────────────

    async function handleRestaurantAction(restaurant, status) {
        try {
            await apiFetch(route('admin.restaurants.approve', restaurant.id), 'PATCH', { status });
            setPending(prev => prev.filter(r => r.id !== restaurant.id));
        } catch {
            alert('Action failed. Please try again.');
        }
    }

    // ── Category actions ────────────────────────────────────────────────────────

    function handleCategorySaved(category, mode) {
        if (mode === 'add') {
            setCategories(prev => [...prev, category]);
        } else {
            setCategories(prev => prev.map(c => c.id === category.id ? category : c));
        }
        setCategoryModal(null);
    }

    async function handleCategoryDelete(category) {
        if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
        try {
            await apiFetch(route('admin.categories.destroy', category.id), 'DELETE');
            setCategories(prev => prev.filter(c => c.id !== category.id));
        } catch (err) {
            alert(err.data?.error ?? 'Cannot delete this category.');
        }
    }

    // ── Voucher actions ─────────────────────────────────────────────────────────

    function handleVoucherSaved(voucher, mode) {
        if (mode === 'add') {
            setVouchers(prev => [...prev, voucher]);
        } else {
            setVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v));
        }
        setVoucherModal(null);
    }

    async function handleVoucherDelete(voucher) {
        if (!confirm(`Delete voucher "${voucher.code}"?`)) return;
        try {
            await apiFetch(route('admin.vouchers.destroy', voucher.id), 'DELETE');
            setVouchers(prev => prev.filter(v => v.id !== voucher.id));
        } catch {
            alert('Cannot delete this voucher.');
        }
    }

    // ── Backup ──────────────────────────────────────────────────────────────────

    async function handleBackup() {
        if (!confirm('Run a full database backup now?')) return;
        setBackupLoading(true);
        try {
            const data = await apiFetch(route('admin.backup'), 'POST');
            setLastBackup(data.last_backup_at);
            setBackupFile(data.last_backup_file);
        } catch {
            alert('Backup failed. Check server logs.');
        } finally {
            setBackupLoading(false);
        }
    }

    // ── Tabs ────────────────────────────────────────────────────────────────────

    const TABS = [
        { id: 'restaurants', label: `Pending (${pending.length})` },
        { id: 'categories',  label: `Categories (${categories.length})` },
        { id: 'vouchers',    label: `Vouchers (${vouchers.length})` },
    ];

    return (
        <>
            <Head title="Admin Dashboard — Hapag" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <span className="text-lg font-extrabold text-green-600 tracking-tight">
                    Hapag <span className="text-gray-400 font-normal text-sm ml-1">Admin</span>
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackup}
                        disabled={backupLoading}
                        className="px-4 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        {backupLoading ? 'Backing up…' : '💾 Backup DB'}
                    </button>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* Last backup strip */}
                {lastBackup && (
                    <div className="mb-5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                        <span>Last backup:</span>
                        <span className="font-semibold text-gray-700">{lastBackup}</span>
                        {backupFile && <span className="text-gray-400 truncate">— {backupFile}</span>}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                                activeTab === tab.id
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Pending Restaurants ──────────────────────────────────────── */}

                {activeTab === 'restaurants' && (
                    <div>
                        <h2 className="text-base font-extrabold text-gray-800 mb-4">
                            Pending Restaurant Approvals
                        </h2>

                        {pending.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl text-gray-400 text-sm">
                                No pending restaurants — all caught up!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pending.map(r => (
                                    <div key={r.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-bold text-gray-800 text-sm truncate">
                                                    {r.name}
                                                </span>
                                                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                    pending
                                                </span>
                                            </div>
                                            <dl className="text-xs text-gray-500 space-y-0.5">
                                                <div>
                                                    <span className="text-gray-400">Category:</span>{' '}
                                                    {r.category?.icon} {r.category?.name ?? '—'}
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Municipality:</span>{' '}
                                                    {r.municipality}
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Owner:</span>{' '}
                                                    {r.owner?.name ?? '—'}
                                                    {r.owner?.email && (
                                                        <span className="text-gray-400"> ({r.owner.email})</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Submitted:</span>{' '}
                                                    {new Date(r.created_at).toLocaleDateString('en-PH', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                    })}
                                                </div>
                                            </dl>
                                            {r.description && (
                                                <p className="text-xs text-gray-400 italic mt-2 line-clamp-2">
                                                    {r.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleRestaurantAction(r, 'active')}
                                                className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRestaurantAction(r, 'rejected')}
                                                className="px-4 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Categories ───────────────────────────────────────────────── */}

                {activeTab === 'categories' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-extrabold text-gray-800">Food Categories</h2>
                            <button
                                onClick={() => setCategoryModal({ mode: 'add' })}
                                className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                            >
                                + Add Category
                            </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Category
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Weather Tag
                                        </th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-10 text-center text-gray-400 text-sm">
                                                No categories yet.
                                            </td>
                                        </tr>
                                    )}
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="mr-2 text-base">{cat.icon}</span>
                                                <span className="font-semibold text-gray-800">{cat.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WEATHER_BADGE[cat.weather_tag] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {cap(cat.weather_tag)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setCategoryModal({ mode: 'edit', category: cat })}
                                                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategoryDelete(cat)}
                                                        className="text-xs text-red-400 hover:text-red-500 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Site-wide Vouchers ───────────────────────────────────────── */}

                {activeTab === 'vouchers' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-extrabold text-gray-800">Site-wide Vouchers</h2>
                            <button
                                onClick={() => setVoucherModal({ mode: 'add' })}
                                className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                            >
                                + Create Voucher
                            </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Uses</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {vouchers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                                                No site-wide vouchers yet.
                                            </td>
                                        </tr>
                                    )}
                                    {vouchers.map(v => (
                                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-gray-800 tracking-wider">
                                                {v.code}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {v.type === 'percentage'
                                                    ? `${v.value}% off`
                                                    : `₱${Number(v.value).toFixed(2)} off`}
                                                {v.min_order_amount && (
                                                    <span className="block text-xs text-gray-400">
                                                        min ₱{Number(v.min_order_amount).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {v.expires_at
                                                    ? new Date(v.expires_at).toLocaleDateString('en-PH', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                    })
                                                    : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {v.used_count ?? 0}
                                                {v.max_uses ? ` / ${v.max_uses}` : ''}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={[
                                                    'text-xs px-2 py-0.5 rounded-full font-medium border',
                                                    v.is_active
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200',
                                                ].join(' ')}>
                                                    {v.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setVoucherModal({ mode: 'edit', voucher: v })}
                                                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleVoucherDelete(v)}
                                                        className="text-xs text-red-400 hover:text-red-500 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {categoryModal && (
                <CategoryModal
                    mode={categoryModal.mode}
                    category={categoryModal.category}
                    onClose={() => setCategoryModal(null)}
                    onSaved={handleCategorySaved}
                />
            )}
            {voucherModal && (
                <VoucherModal
                    mode={voucherModal.mode}
                    voucher={voucherModal.voucher}
                    onClose={() => setVoucherModal(null)}
                    onSaved={handleVoucherSaved}
                />
            )}
        </>
    );
}
