import { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import '@/bootstrap';
import { formatOrderId } from '@/utils/formatOrderId';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Constants & Helpers ────────────────────────────────────────────────────

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const STATUS_META = {
    pending:   { label: 'Pending',   pill: 'bg-amber-100 text-amber-700 border border-amber-200'      },
    accepted:  { label: 'Accepted',  pill: 'bg-cyan-100 text-cyan-700 border border-cyan-200'         },
    preparing: { label: 'Preparing', pill: 'bg-blue-100 text-blue-700 border border-blue-200'          },
    ready:     { label: 'Ready',     pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    completed: { label: 'Completed', pill: 'bg-green-100 text-green-700 border border-green-200'       },
    cancelled: { label: 'Cancelled', pill: 'bg-red-100 text-red-700 border border-red-200'             },
};
const NEXT_STATUS   = { pending: 'accepted', accepted: 'preparing', preparing: 'ready' };
const EMPTY_ITEM    = { name: '', description: '', price: '', category: '', image_url: '', is_available: true };
const EMPTY_VOUCHER = { code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', is_active: true, expires_at: '' };
const MUNICIPALITIES = ['Santa Cruz','Pagsanjan','Los Baños','Calamba','San Pablo','Bay','Nagcarlan','Pila'];

const STATUS_CHART_COLORS = {
    pending: '#f59e0b', accepted: '#06b6d4', preparing: '#3b82f6', ready: '#10b981',
    completed: '#22c55e', cancelled: '#ef4444',
};

const inp = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all duration-150';

const DARK_TIP = {
    contentStyle: { backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' },
    labelStyle: { color: '#9ca3af' },
    cursor: { fill: 'rgba(0,0,0,0.04)' },
};

async function apiFetch(url, method, body) {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) { const e = new Error(res.statusText); e.status = res.status; e.data = data; throw e; }
    return data;
}

const cap  = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt  = n => Number(n || 0).toFixed(2);
const fmtD = d => new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDate = () => new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const NAV_ITEMS = [
    { key: 'overview', label: 'Overview',       icon: OverviewIcon  },
    { key: 'orders',   label: 'Orders',          icon: OrdersIcon    },
    { key: 'menu',     label: 'Menu Management', icon: MenuIcon      },
    { key: 'vouchers', label: 'Vouchers',         icon: VoucherIcon   },
    { key: 'history',  label: 'Order History',   icon: HistoryIcon   },
    { key: 'settings', label: 'Settings',         icon: SettingsIcon  },
];

// ─── Count-up hook ───────────────────────────────────────────────────────────

function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
        setValue(0);
        const start = performance.now();
        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(target * eased);
            if (t < 1) raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    }, [target, duration]);
    return value;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function OverviewIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>;}
function OrdersIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;}
function MenuIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/></svg>;}
function VoucherIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"/></svg>;}
function HistoryIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;}
function SettingsIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;}
function BellIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>;}
function SparkleIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>;}
function ImageIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>;}
function MoneyIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>;}
function ClockIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;}
function ListIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;}
function ChartBarIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>;}
function StarIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>;}
function MenuItemsIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/></svg>;}
function AvgIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>;}

// ─── Field ───────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = 'green', icon, trend, animateTarget, formatValue }) {
    const styles = {
        green:   { icon: 'bg-green-100 text-green-600'    },
        emerald: { icon: 'bg-emerald-100 text-emerald-600' },
        orange:  { icon: 'bg-orange-100 text-orange-500'  },
        blue:    { icon: 'bg-blue-100 text-blue-500'       },
        amber:   { icon: 'bg-amber-100 text-amber-600'    },
        purple:  { icon: 'bg-purple-100 text-purple-600'  },
        gray:    { icon: 'bg-gray-100 text-gray-400'       },
    };
    const s = styles[accent] ?? styles.gray;
    const count = useCountUp(animateTarget ?? 0);
    const displayed = animateTarget !== undefined
        ? (formatValue ? formatValue(count) : String(Math.round(count)))
        : value;

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } } }}
            className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex items-center justify-between">
                {icon && <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${s.icon}`}>{icon}</div>}
                {trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {trend >= 0 ? '+' : ''}{Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-2xl font-extrabold leading-tight text-gray-900 tabular-nums">{displayed}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusPill({ status }) {
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_META[status]?.pill ?? 'bg-gray-100 text-gray-500'}`}>{STATUS_META[status]?.label ?? cap(status)}</span>;
}
function TypePill({ type }) {
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${type === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{type === 'delivery' ? 'DELIVERY' : 'PICKUP'}</span>;
}

// ─── Item Modal ───────────────────────────────────────────────────────────────

function ItemModal({ mode, item, existingCategories, restaurantId, restaurantName, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add' ? { ...EMPTY_ITEM }
            : { name: item.name, description: item.description ?? '', price: item.price, category: item.category, image_url: item.image_url ?? '', is_available: item.is_available }
    );
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [aiLoading, setAiLoading]         = useState(false);
    const [aiError, setAiError]             = useState('');
    const [aiPreview, setAiPreview]         = useState('');
    const [aiGenCount, setAiGenCount]       = useState(0);
    const AI_GEN_LIMIT = 3;
    const [imageFile, setImageFile] = useState(null);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSubmit(e) {
        e.preventDefault(); setErrors({}); setProcessing(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('description', form.description ?? '');
            fd.append('price', form.price);
            fd.append('category', form.category);
            fd.append('is_available', form.is_available ? '1' : '0');
            if (mode === 'add') fd.append('restaurant_id', restaurantId);
            if (imageFile) fd.append('image', imageFile);
            if (mode === 'edit') fd.append('_method', 'PATCH');

            const url = mode === 'add'
                ? route('owner.items.store')
                : route('owner.items.update', item.id);

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { if (res.status === 422) setErrors(data.errors ?? {}); return; }
            onSaved(data.item, mode);
        } finally { setProcessing(false); }
    }

    async function generateDescription() {
        if (!form.name || !form.category) { setAiError('Fill in item name and category first.'); return; }
        if (aiGenCount >= AI_GEN_LIMIT) { setAiError(`Limit reached — max ${AI_GEN_LIMIT} generations per item.`); return; }
        setAiError(''); setAiLoading(true);
        try {
            const data = await apiFetch(route('owner.ai.describe'), 'POST', {
                name:            form.name,
                category:        form.category,
                price:           form.price || null,
                restaurant_name: restaurantName,
            });
            setAiPreview(data.description ?? '');
            setAiGenCount(c => c + 1);
        } catch { setAiError('AI unavailable. Try again.'); }
        finally { setAiLoading(false); }
    }

    function acceptAiPreview() {
        set('description', aiPreview);
        setAiPreview('');
    }

    function discardAiPreview() {
        setAiPreview('');
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-extrabold text-gray-800 tracking-tight">{mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xl leading-none transition-colors">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`space-y-4 ${processing ? 'opacity-60 pointer-events-none' : ''}`}>
                    {/* Top row: image preview left, core fields right */}
                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-20 space-y-1.5">
                            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Photo</label>
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                                {(imageFile ? URL.createObjectURL(imageFile) : form.image_url)
                                    ? <img src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                    : <ImageIcon cls="w-7 h-7 text-gray-300" />
                                }
                            </div>
                            <label className="block w-full text-center cursor-pointer">
                                <span className="text-[10px] text-green-600 font-semibold hover:text-green-700 transition-colors">
                                    {imageFile ? 'Change' : 'Upload'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={e => { const file = e.target.files[0]; if (file) setImageFile(file); }}
                                />
                            </label>
                            <p className="text-[9px] text-gray-400 text-center leading-tight">Max 2MB</p>
                            {errors.image?.[0] && <p className="text-[10px] text-red-500">{errors.image[0]}</p>}
                        </div>
                        <div className="flex-1 space-y-3">
                            <Field label="Item Name *" error={errors.name?.[0]}>
                                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="e.g. Sinigang na Baboy" required />
                            </Field>
                            <div className="grid grid-cols-2 gap-2.5">
                                <Field label="Category *" error={errors.category?.[0]}>
                                    <input type="text" list="cat-suggestions" value={form.category} onChange={e => set('category', e.target.value)} className={inp} placeholder="e.g. Soups" required />
                                    <datalist id="cat-suggestions">
                                        {existingCategories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </Field>
                                <Field label="Price (₱) *" error={errors.price?.[0]}>
                                    <input type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} className={inp} required />
                                </Field>
                            </div>
                        </div>
                    </div>
                    {/* Description */}
                    <Field label="Description" error={errors.description?.[0]}>
                        <div className="relative">
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                className={inp + ' resize-none pr-28'} rows={4} placeholder="Short appetizing description…" />
                            <button
                                type="button"
                                onClick={generateDescription}
                                disabled={aiLoading || aiGenCount >= AI_GEN_LIMIT}
                                className="absolute right-2 bottom-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <SparkleIcon cls="w-3.5 h-3.5" />
                                {aiLoading ? 'Writing…' : 'AI Write'}
                            </button>
                        </div>

                        {/* Generation limit indicator */}
                        <p className={`text-[10px] mt-1 ${aiGenCount >= AI_GEN_LIMIT ? 'text-red-400' : 'text-gray-400'}`}>
                            {aiGenCount}/{AI_GEN_LIMIT} generations used
                        </p>

                        {/* AI Preview */}
                        {aiPreview && (
                            <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                    <SparkleIcon cls="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-700 leading-relaxed flex-1">{aiPreview}</p>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-green-100">
                                    <button
                                        type="button"
                                        onClick={acceptAiPreview}
                                        className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                                    >
                                        ✓ Use this
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generateDescription}
                                        disabled={aiLoading || aiGenCount >= AI_GEN_LIMIT}
                                        className="flex-1 py-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ↺ Regenerate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={discardAiPreview}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
                    </Field>
                    <button type="button" onClick={() => set('is_available', !form.is_available)} className="flex items-center gap-3 select-none">
                        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${form.is_available ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_available ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm text-gray-700">Available now</span>
                    </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors shadow-sm shadow-green-200">
                            {processing ? 'Saving…' : mode === 'add' ? 'Add Item' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Voucher Modal ────────────────────────────────────────────────────────────

function VoucherModal({ mode, voucher, restaurantId, onClose, onSaved }) {
    const [form, setForm] = useState(mode === 'add' ? { ...EMPTY_VOUCHER } : { code: voucher.code, type: voucher.type, value: voucher.value, min_order_amount: voucher.min_order_amount ?? '', max_uses: voucher.max_uses ?? '', is_active: voucher.is_active, expires_at: voucher.expires_at ? voucher.expires_at.slice(0, 10) : '' });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [codeFlash, setCodeFlash] = useState(false);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSubmit(e) {
        e.preventDefault(); setErrors({}); setProcessing(true);
        try {
            const url = mode === 'add' ? route('owner.vouchers.store') : route('owner.vouchers.update', voucher.id);
            const data = await apiFetch(url, mode === 'add' ? 'POST' : 'PATCH', { ...form, restaurant_id: restaurantId });
            onSaved(data.voucher, mode);
        } catch (err) { if (err.status === 422) setErrors(err.data?.errors ?? {}); }
        finally { setProcessing(false); }
    }

    function handleCodeBlur() {
        if (form.code) { setCodeFlash(true); setTimeout(() => setCodeFlash(false), 600); }
    }

    const fv = {
        hidden: { opacity: 0, y: 6 },
        show: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.2 } }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-green-50 border-b border-green-100 px-6 py-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-gray-800 tracking-tight">
                            {mode === 'add' ? 'Create Voucher' : 'Edit Voucher'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Set up a discount code for your customers.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-green-100 transition-colors ml-4 flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Body */}
                    <div className={`px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto transition-opacity duration-150 ${processing ? 'opacity-60 pointer-events-none' : ''}`}>

                        {/* Code */}
                        <motion.div custom={0} variants={fv} initial="hidden" animate="show">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Voucher Code <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text" value={form.code}
                                onChange={e => set('code', e.target.value.toUpperCase())}
                                onBlur={handleCodeBlur}
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-150 font-mono tracking-widest uppercase bg-white ${codeFlash ? 'border-green-400' : 'border-gray-200'}`}
                                placeholder="e.g. WELCOME20"
                                required
                            />
                            {errors.code?.[0] && <p className="text-xs text-red-500 mt-1">{errors.code[0]}</p>}
                        </motion.div>

                        {/* Type + Value */}
                        <motion.div custom={1} variants={fv} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <select value={form.type} onChange={e => set('type', e.target.value)} className={inp + ' appearance-none pr-8'}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (₱)</option>
                                    </select>
                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                    {form.type === 'percentage' ? 'Value (%)' : 'Value (₱)'} <span className="text-red-400">*</span>
                                </label>
                                <input type="number" step="0.01" min="0" max={form.type === 'percentage' ? 100 : undefined} value={form.value} onChange={e => set('value', e.target.value)} className={inp} required />
                                {errors.value?.[0] && <p className="text-xs text-red-500 mt-1">{errors.value[0]}</p>}
                            </div>
                        </motion.div>

                        {/* Min Order + Max Uses */}
                        <motion.div custom={2} variants={fv} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min. Order</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₱</span>
                                    <input type="number" step="0.01" min="0" value={form.min_order_amount} onChange={e => set('min_order_amount', e.target.value)} className={inp + ' pl-7'} placeholder="Optional" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Max Uses</label>
                                <input type="number" min="1" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} className={inp} placeholder="Unlimited" />
                            </div>
                        </motion.div>

                        {/* Expires At */}
                        <motion.div custom={3} variants={fv} initial="hidden" animate="show">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expires At</label>
                            <div className="relative">
                                <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className={inp + ' pr-10'} />
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                            </div>
                        </motion.div>

                        {/* Active toggle */}
                        <motion.div custom={4} variants={fv} initial="hidden" animate="show">
                            <button type="button" onClick={() => set('is_active', !form.is_active)} className="flex items-center gap-3 select-none">
                                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{form.is_active ? 'Active' : 'Paused'}</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-60 transition-colors shadow-sm shadow-green-200">
                            {processing && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                            {processing ? 'Saving…' : mode === 'add' ? 'Create Voucher' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({ confirm, onCancel, onConfirm }) {
    const [processing, setProcessing] = useState(false);
    async function handleConfirm() {
        setProcessing(true);
        await onConfirm();
        setProcessing(false);
    }
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-base font-extrabold text-gray-800 mb-2">
                    Delete {confirm.type === 'item' ? `"${confirm.target.name}"` : 'voucher'}?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {confirm.type === 'item'
                        ? "This can't be undone."
                        : `Voucher ${confirm.target.code} will be permanently deleted.`}
                </p>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={handleConfirm} disabled={processing}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors">
                        {processing ? 'Deleting…' : 'Yes, delete'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onAdvance }) {
    const isPending = order.status === 'pending';
    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${isPending ? 'border-l-[3px] border-l-amber-400' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-gray-800">Order #{formatOrderId(order.id)}</span>
                    <TypePill type={order.order_type} />
                    <StatusPill status={order.status} />
                </div>
                <span className="text-xs text-gray-400">{fmtD(order.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">{order.user?.name ?? 'Customer'}</span>
                {order.user?.municipality && <span className="text-gray-400 text-xs ml-1">· {order.user.municipality}</span>}
            </p>
            {order.order_type === 'delivery' && order.delivery_address && (
                <div className="inline-flex items-start gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mb-3">
                    <span>📍</span><span>{order.delivery_address}</span>
                </div>
            )}
            <ul className="text-xs text-gray-500 space-y-0.5 mb-3">
                {order.items?.map(oi => (
                    <li key={oi.id}>×{oi.quantity} {oi.menu_item?.name ?? 'Item'} <span className="text-gray-400">— ₱{fmt(oi.unit_price * oi.quantity)}</span></li>
                ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="text-sm">
                    <span className="text-gray-500">Total </span>
                    <span className="font-extrabold text-gray-800 tabular-nums">₱{fmt(order.final_amount ?? order.total_amount)}</span>
                    {Number(order.delivery_fee) > 0 && <span className="text-xs text-gray-400 ml-1">(+₱{fmt(order.delivery_fee)} delivery)</span>}
                </div>
                {onAdvance && NEXT_STATUS[order.status] ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => onAdvance(order, NEXT_STATUS[order.status])}
                            className="px-6 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 active:scale-95 transition-all shadow-sm shadow-green-200">
                            Mark as {cap(NEXT_STATUS[order.status])}
                        </button>
                        {(order.status === 'pending' || order.status === 'accepted') && (
                            <button onClick={() => onAdvance(order, 'cancelled')}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all">
                                Cancel
                            </button>
                        )}
                    </div>
                ) : order.status === 'ready' ? (
                    <span className="text-xs font-semibold text-green-600">✓ Ready for {order.order_type === 'delivery' ? 'dispatch' : 'pickup'}</span>
                ) : null}
            </div>
        </div>
    );
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, subtitle, dot = 'bg-green-500', children, actions }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <h3 className="text-sm font-extrabold text-gray-800">{title}</h3>
                </div>
                {actions}
            </div>
            {subtitle && <p className="text-xs text-gray-400 mb-4 pl-4">{subtitle}</p>}
            {children}
        </div>
    );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ restaurant, onSwitchTab }) {
    const orders = restaurant.orders ?? [];
    const items  = restaurant.menu_items ?? [];
    const [chartRange, setChartRange] = useState('week');
    const [exporting, setExporting]     = useState(false);
    const [exportRange, setExportRange] = useState('month');
    const [exportError, setExportError] = useState('');
    const [exportSuccess, setExportSuccess] = useState(false);

    async function handleExport() {
        setExporting(true);
        setExportError('');
        try {
            const params = new URLSearchParams({
                restaurant_id: restaurant.id,
                range: exportRange,
            });
            const res = await fetch(`/owner/export/sales?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': CSRF(),
                },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Export failed');
            const data = await res.json();
            generatePDF(data);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 2000);
        } catch {
            setExportError('Could not generate report. Try again.');
        } finally {
            setExporting(false);
        }
    }

    function generatePDF(data) {
        const { restaurant: r, range, generated_at, summary, top_items, orders: ords } = data;

        const rangeLabels = { today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' };

        const fmt = n => '₱' + Number(n || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
        });

        const fmtDate = d => new Date(d).toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

        const statusLabel = {
            pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing',
            ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
        };

        const ordersHTML = ords.map(o => `
            <div class="order-block">
                <div class="order-header">
                    <span class="order-id">Order #${String(o.id).padStart(5, '0')}</span>
                    <span class="order-meta">${fmtDate(o.created_at)}</span>
                    <span class="order-meta">${o.customer_name}</span>
                    <span class="order-meta">${o.order_type.toUpperCase()}</span>
                    <span class="status-badge status-${o.status}">${statusLabel[o.status] ?? o.status}</span>
                </div>
                ${o.delivery_address ? `<div class="delivery-addr">&#128205; ${o.delivery_address}</div>` : ''}
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="right">Qty</th>
                            <th class="right">Unit Price</th>
                            <th class="right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${o.items.map(i => `
                            <tr>
                                <td>${i.name}</td>
                                <td class="right">${i.quantity}</td>
                                <td class="right">${fmt(i.unit_price)}</td>
                                <td class="right">${fmt(i.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="order-totals">
                    ${Number(o.discount_amount) > 0
                        ? `<div class="total-row"><span>Subtotal</span><span>${fmt(o.total_amount)}</span></div>
                           <div class="total-row discount"><span>Discount${o.voucher_code ? ` (${o.voucher_code})` : ''}</span><span>- ${fmt(o.discount_amount)}</span></div>`
                        : ''}
                    ${Number(o.delivery_fee) > 0
                        ? `<div class="total-row"><span>Delivery Fee</span><span>${fmt(o.delivery_fee)}</span></div>`
                        : ''}
                    <div class="total-row final"><span>Total</span><span>${fmt(o.final_amount)}</span></div>
                </div>
            </div>
        `).join('');

        const topItemsHTML = Object.entries(top_items).map(([name, d]) => `
            <tr>
                <td>${name}</td>
                <td class="right">${d.qty}</td>
                <td class="right">${fmt(d.revenue)}</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sales Report &#8212; ${r.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #1f2937; padding: 32px 40px; }
        .header { border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 2px; }
        .header p { color: #6b7280; font-size: 11px; }
        .header .range-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 99px; margin-top: 6px; }
        .section-title { font-size: 13px; font-weight: 700; color: #374151; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
        .summary-card .label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
        .summary-card .value { font-size: 17px; font-weight: 800; color: #111827; }
        .summary-card .sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f9fafb; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
        td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
        .right { text-align: right; }
        .order-block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; page-break-inside: avoid; }
        .order-header { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
        .order-id { font-weight: 700; font-size: 13px; }
        .order-meta { color: #6b7280; font-size: 11px; }
        .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin-left: auto; }
        .status-completed { background:#dcfce7; color:#166534; }
        .status-cancelled { background:#fee2e2; color:#991b1b; }
        .status-ready     { background:#d1fae5; color:#065f46; }
        .status-preparing { background:#dbeafe; color:#1e40af; }
        .status-accepted  { background:#cffafe; color:#155e75; }
        .status-pending   { background:#fef3c7; color:#92400e; }
        .delivery-addr { font-size: 11px; color: #ea580c; background: #fff7ed; border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; }
        .items-table { margin-bottom: 8px; }
        .items-table th, .items-table td { font-size: 11px; padding: 5px 8px; }
        .order-totals { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; border-top: 1px solid #f3f4f6; padding-top: 6px; }
        .total-row { display: flex; gap: 16px; font-size: 11px; }
        .total-row.discount { color: #16a34a; }
        .total-row.final { font-weight: 800; font-size: 13px; color: #111827; margin-top: 2px; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
        @media print { body { padding: 20px 28px; } .order-block { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${r.name}</h1>
        <p>${r.municipality}, Laguna, Philippines</p>
        <span class="range-badge">${rangeLabels[range] ?? range}</span>
        <p style="margin-top:6px;color:#9ca3af">Generated: ${fmtDate(generated_at)}</p>
    </div>
    <div class="section-title">Summary</div>
    <div class="summary-grid">
        <div class="summary-card"><div class="label">Total Revenue</div><div class="value">${fmt(summary.total_revenue)}</div></div>
        <div class="summary-card"><div class="label">Total Orders</div><div class="value">${summary.total_orders}</div><div class="sub">${summary.completed_orders} completed &middot; ${summary.cancelled_orders} cancelled</div></div>
        <div class="summary-card"><div class="label">Avg. Order Value</div><div class="value">${fmt(summary.avg_order_value)}</div></div>
        <div class="summary-card"><div class="label">Pickup</div><div class="value">${fmt(summary.pickup_revenue)}</div><div class="sub">${summary.pickup_orders} orders</div></div>
        <div class="summary-card"><div class="label">Delivery</div><div class="value">${fmt(summary.delivery_revenue)}</div><div class="sub">${summary.delivery_orders} orders</div></div>
    </div>
    ${Object.keys(top_items).length > 0 ? `
    <div class="section-title">Top Menu Items</div>
    <table><thead><tr><th>Item</th><th class="right">Qty Sold</th><th class="right">Revenue</th></tr></thead><tbody>${topItemsHTML}</tbody></table>
    ` : ''}
    <div class="section-title">Orders (${ords.length})</div>
    ${ords.length === 0 ? '<p style="color:#9ca3af;font-size:12px">No orders for this period.</p>' : ordersHTML}
    <div class="footer">Hapag &middot; Sales Report &middot; ${r.name} &middot; Generated ${fmtDate(generated_at)}</div>
</body>
</html>`;

        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;';
        document.body.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();
        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        };
    }

    const now = new Date();
    const today = now.toDateString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const todayTotal  = useMemo(() => orders.filter(o => new Date(o.created_at).toDateString() === today).reduce((s, o) => s + Number(o.final_amount ?? 0), 0), [orders]);
    const totalIncome = useMemo(() => orders.reduce((s, o) => s + Number(o.final_amount ?? 0), 0), [orders]);
    const weekTotal   = useMemo(() => orders.filter(o => new Date(o.created_at) >= startOfWeek).reduce((s, o) => s + Number(o.final_amount ?? 0), 0), [orders]);
    const pending     = useMemo(() => orders.filter(o => o.status === 'pending').length, [orders]);
    const available   = useMemo(() => items.filter(i => i.is_available).length, [items]);
    const avgOrderValue = orders.length > 0 ? totalIncome / orders.length : 0;
    const isDataCapped  = orders.length >= 100;
    const cappedNote    = isDataCapped ? ' · dashboard shows last 100 orders' : '';

    const ordersByStatus = useMemo(() => {
        const counts = { pending: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
        orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
        return Object.entries(counts)
            .filter(([, v]) => v > 0)
            .map(([status, value]) => ({ name: cap(status), status, value }));
    }, [orders]);

    const topItems = useMemo(() => {
        const counts = {};
        orders.forEach(o => {
            (o.items || []).forEach(oi => {
                const name = oi.menu_item?.name || 'Item';
                counts[name] = (counts[name] || 0) + (oi.quantity || 1);
            });
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sorted.length > 0) return sorted.map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + '…' : name, count }));
        return [];
    }, [orders]);

    const { incomeData, volumeData } = useMemo(() => {
        const filt = o => {
            const d = new Date(o.created_at);
            if (chartRange === 'today') return d.toDateString() === now.toDateString();
            if (chartRange === 'week')  return (now - d) < 7 * 86400000;
            if (chartRange === 'month') return (now - d) < 30 * 86400000;
            return true;
        };
        const filtered = orders.filter(filt);

        if (chartRange === 'today') {
            const ib = Array.from({ length: 24 }, (_, h) => ({ label: `${h}h`, value: 0, vol: 0 }));
            filtered.forEach(o => { const h = new Date(o.created_at).getHours(); ib[h].value += Number(o.final_amount ?? 0); ib[h].vol += 1; });
            let s = 0; while (s < 16 && ib[s].value === 0 && ib[s].vol === 0) s++;
            const sl = ib.slice(Math.min(s, 8));
            return { incomeData: sl.map(({ label, value }) => ({ label, value })), volumeData: sl.map(({ label, vol }) => ({ label, value: vol })) };
        }
        if (chartRange === 'week') {
            const b = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now); d.setDate(d.getDate() - (6 - i));
                return { label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], value: 0, vol: 0, date: d.toDateString() };
            });
            filtered.forEach(o => { const bk = b.find(x => x.date === new Date(o.created_at).toDateString()); if (bk) { bk.value += Number(o.final_amount ?? 0); bk.vol += 1; } });
            return { incomeData: b.map(({ label, value }) => ({ label, value })), volumeData: b.map(({ label, vol }) => ({ label, value: vol })) };
        }
        if (chartRange === 'month') {
            const b = Array.from({ length: 30 }, (_, i) => {
                const d = new Date(now); d.setDate(d.getDate() - (29 - i));
                return { label: d.getDate().toString(), value: 0, vol: 0, date: d.toDateString() };
            });
            filtered.forEach(o => { const bk = b.find(x => x.date === new Date(o.created_at).toDateString()); if (bk) { bk.value += Number(o.final_amount ?? 0); bk.vol += 1; } });
            return { incomeData: b.map(({ label, value }) => ({ label, value })), volumeData: b.map(({ label, vol }) => ({ label, value: vol })) };
        }
        // all time - group by month
        const months = {};
        filtered.forEach(o => {
            const d = new Date(o.created_at);
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!months[k]) months[k] = { income: 0, vol: 0 };
            months[k].income += Number(o.final_amount ?? 0);
            months[k].vol += 1;
        });
        const entries = Object.entries(months).sort();
        return {
            incomeData: entries.map(([k, v]) => ({ label: k.slice(5), value: v.income })),
            volumeData: entries.map(([k, v]) => ({ label: k.slice(5), value: v.vol })),
        };
    }, [orders, chartRange]);

    const RANGES = [{ k: 'today', l: 'Today' }, { k: 'week', l: 'Week' }, { k: 'month', l: 'Month' }, { k: 'all', l: 'All' }];

    const rangeButtons = (
        <div className="flex gap-1">
            {RANGES.map(r => (
                <button key={r.k} onClick={() => setChartRange(r.k)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${chartRange === r.k ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {r.l}
                </button>
            ))}
        </div>
    );

    const cardVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
    };

    return (
        <div className="space-y-6">

            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-green-100/80 text-xs font-semibold uppercase tracking-widest mb-1.5">Good day</p>
                        <h2 className="text-xl font-extrabold tracking-tight">{restaurant.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${restaurant.status === 'active' ? 'bg-green-200 animate-pulse' : 'bg-white/40'}`} />
                            <p className="text-green-100/80 text-sm">{restaurant.municipality} · {cap(restaurant.status)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-green-100/70 text-xs mb-0.5">{fmtDate()}</p>
                        <p className="text-green-100/80 text-xs font-medium mb-1">Today's Revenue</p>
                        <p className="text-4xl font-extrabold tracking-tight tabular-nums">₱{fmt(todayTotal)}</p>
                        {pending > 0 && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                                <span className="text-xs font-bold text-white">{pending} pending order{pending !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Export Sales Report */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-5"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left: icon + text */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                            <ChartBarIcon cls="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-gray-800 leading-tight">Sales Report</p>
                            <p className="text-xs text-gray-400 mt-0.5">Export your revenue and order data as a PDF.</p>
                        </div>
                    </div>
                    {/* Right: range + button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative">
                            <select
                                value={exportRange}
                                onChange={e => setExportRange(e.target.value)}
                                className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white appearance-none transition-all duration-150"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                        <motion.button
                            onClick={handleExport}
                            disabled={exporting}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm disabled:opacity-60 ${exportSuccess ? 'bg-green-600 text-white shadow-green-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'}`}
                        >
                            {exporting ? (
                                <>
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span className="animate-pulse">Generating…</span>
                                </>
                            ) : exportSuccess ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                                    Done
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                                    Download PDF
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
                {exportError && <p className="text-xs text-red-500 mt-3">{exportError}</p>}
                <p className="text-xs text-gray-400 mt-2 md:hidden">Opens your browser's print dialog — select Save as PDF as the destination.</p>
            </motion.div>

            {/* 6 Stat cards */}
            <motion.div
                key={restaurant.id}
                className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                variants={cardVariants}
                initial="hidden"
                animate="show"
            >
                <StatCard label="Total Income" sub={`All-time revenue${cappedNote}`} accent="green"
                    animateTarget={totalIncome} formatValue={v => `₱${fmt(v)}`}
                    icon={<MoneyIcon cls="w-5 h-5" />} />
                <StatCard label="Today's Revenue" sub="Revenue today" accent="emerald"
                    animateTarget={todayTotal} formatValue={v => `₱${fmt(v)}`}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard label="Total Orders" sub={`All-time orders${cappedNote}`} accent="blue"
                    animateTarget={orders.length} formatValue={v => String(Math.round(v))}
                    icon={<ListIcon cls="w-5 h-5" />} />
                <StatCard label="Pending Orders" sub={pending > 0 ? 'Need attention' : 'All caught up'} accent={pending > 0 ? 'amber' : 'gray'}
                    animateTarget={pending} formatValue={v => String(Math.round(v))}
                    icon={<ClockIcon cls="w-5 h-5" />} />
                <StatCard label="Menu Items" sub={`${available} available`} accent="orange"
                    value={`${available}/${items.length}`}
                    icon={<MenuItemsIcon cls="w-5 h-5" />} />
                <StatCard label="Avg. Order Value" sub={`Per transaction${cappedNote}`} accent="purple"
                    animateTarget={avgOrderValue} formatValue={v => `₱${fmt(v)}`}
                    icon={<AvgIcon cls="w-5 h-5" />} />
            </motion.div>

            {/* Charts row 1 — Revenue + Volume (shared range filter) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="Revenue Trend" subtitle="Income over selected period" dot="bg-green-500" actions={rangeButtons}>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={incomeData} margin={{ top: 5, right: 4, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 0" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false}
                                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={32} />
                            <Tooltip {...DARK_TIP} formatter={v => [`₱${fmt(v)}`, 'Revenue']} />
                            <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5}
                                fill="url(#revGrad)" dot={false}
                                activeDot={{ r: 4, fill: '#22c55e', stroke: 'white', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Order Volume" subtitle="Number of orders per period" dot="bg-blue-400" actions={rangeButtons}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={volumeData} margin={{ top: 5, right: 4, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 0" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                            <Tooltip {...DARK_TIP} formatter={v => [v, 'Orders']} />
                            <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts row 2 — Status donut + Top items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="Orders by Status" subtitle="Breakdown of all order statuses" dot="bg-amber-400">
                    {ordersByStatus.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-300 text-xs">No orders yet</div>
                    ) : (
                        <>
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={ordersByStatus} cx="50%" cy="50%"
                                            innerRadius={62} outerRadius={88}
                                            paddingAngle={3} dataKey="value">
                                            {ordersByStatus.map((entry, i) => (
                                                <Cell key={i} fill={STATUS_CHART_COLORS[entry.status] ?? '#9ca3af'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }}
                                            formatter={(value, name) => {
                                                const pct = ((value / orders.length) * 100).toFixed(1);
                                                return [`${value} (${pct}%)`, name];
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-gray-800">{orders.length}</p>
                                        <p className="text-xs text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                                {ordersByStatus.map(({ name, status, value }) => (
                                    <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_CHART_COLORS[status] ?? '#9ca3af' }} />
                                        {name} <span className="font-bold text-gray-700">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </ChartCard>

                <ChartCard title="Top Menu Items" subtitle="By order frequency" dot="bg-orange-400">
                    {topItems.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-300 text-xs">No menu items yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 0" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                                <Tooltip {...DARK_TIP} formatter={v => [v, 'Orders']} />
                                <Bar dataKey="count" fill="#fb923c" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <h3 className="text-sm font-extrabold text-gray-800">Recent Orders</h3>
                    </div>
                    <button onClick={() => onSwitchTab('orders')}
                        className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
                        View all →
                    </button>
                </div>
                {orders.length === 0
                    ? <div className="flex flex-col items-center justify-center py-14 gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
                            <ListIcon cls="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400">No orders yet</p>
                        <p className="text-xs text-gray-300">Orders will appear here once customers start ordering</p>
                    </div>
                    : <div className="divide-y divide-gray-50">
                        {orders.slice(0, 6).map(o => (
                            <div key={o.id} className={`flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-gray-50 transition-colors ${o.status === 'pending' ? 'border-l-[3px] border-l-amber-400' : ''}`}>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-extrabold text-gray-400 w-8">#{formatOrderId(o.id)}</span>
                                    <TypePill type={o.order_type} />
                                    <StatusPill status={o.status} />
                                    <span className="text-xs text-gray-600 font-medium hidden sm:inline">{o.user?.name ?? 'Customer'}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 hidden md:inline">{fmtD(o.created_at)}</span>
                                    <span className="text-sm font-extrabold text-gray-800">₱{fmt(o.final_amount ?? o.total_amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>

            {/* Roadmap card */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-600">What's next</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Upcoming features in development</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200 border border-gray-300 px-2.5 py-1 rounded-full uppercase tracking-wider">In progress</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {[
                        'Real-time order notifications via WebSockets',
                        'Customer reviews and ratings per menu item',
                        'Weekly performance email digest',
                        'Menu item popularity tracking (live data)',
                        'Revenue vs. previous period comparison',
                        'Export reports as PDF or CSV',
                        'Inventory and stock level tracking',
                        'Multi-branch analytics comparison',
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                            <p className="text-xs text-gray-400 flex-1">{item}</p>
                            <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">Soon</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────

function OrdersTab({ restaurant, onAdvance }) {
    const orders = restaurant.orders ?? [];
    const [filter, setFilter] = useState('pending');
    const counts = { pending: orders.filter(o => o.status === 'pending').length, accepted: orders.filter(o => o.status === 'accepted').length, preparing: orders.filter(o => o.status === 'preparing').length, ready: orders.filter(o => o.status === 'ready').length };
    const activeCount = orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)).length;
    const FILTERS = [{ k: 'pending', label: `Pending (${counts.pending})` }, { k: 'accepted', label: `Accepted (${counts.accepted})` }, { k: 'preparing', label: `Preparing (${counts.preparing})` }, { k: 'ready', label: `Ready (${counts.ready})` }, { k: 'all', label: `All Active (${activeCount})` }];
    const visible = filter === 'all' ? orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)) : orders.filter(o => o.status === filter);
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button key={f.k} onClick={() => setFilter(f.k)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === f.k ? 'bg-green-500 text-white shadow-sm shadow-green-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                        {f.label}
                    </button>
                ))}
            </div>
            {orders.some(o => o.status === 'completed' || o.status === 'cancelled') && (
                <p className="text-xs text-gray-400">Completed and cancelled orders are in Order History.</p>
            )}
            {visible.length === 0
                ? <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1"><ListIcon cls="w-6 h-6 text-gray-300" /></div>
                    <p className="text-gray-400 text-sm">No orders here.</p>
                </div>
                : <div className="space-y-3">{visible.map(o => <OrderCard key={o.id} order={o} onAdvance={onAdvance} />)}</div>
            }
        </div>
    );
}

// ─── Tab: Menu ────────────────────────────────────────────────────────────────

function MenuTab({ restaurant, onToggle, onDelete, onOpenAdd, onOpenEdit }) {
    const menuItems = restaurant.menu_items ?? [];
    const [catFilter, setCatFilter] = useState('all');
    const [view, setView] = useState('card');

    const categories = useMemo(() => [...new Set(menuItems.map(i => i.category))].sort(), [menuItems]);
    const visible = catFilter === 'all' ? menuItems : menuItems.filter(i => i.category === catFilter);
    const grouped = useMemo(() => { const g = {}; visible.forEach(i => { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); }); return g; }, [visible]);

    const catColor = cat => {
        const colors = ['from-green-400 to-emerald-500', 'from-orange-400 to-amber-500', 'from-blue-400 to-cyan-500', 'from-purple-400 to-violet-500', 'from-rose-400 to-pink-500', 'from-teal-400 to-green-500'];
        let h = 0; for (let c of (cat || '')) h = (h * 31 + c.charCodeAt(0)) % colors.length;
        return colors[Math.abs(h) % colors.length];
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={() => setCatFilter('all')} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${catFilter === 'all' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>All ({menuItems.length})</button>
                    {categories.map(c => (
                        <button key={c} onClick={() => setCatFilter(c)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${catFilter === c ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{c}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        <button onClick={() => setView('card')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'card' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Cards</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>List</button>
                    </div>
                    <button onClick={onOpenAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                        <span className="text-base leading-none">+</span> Add Item
                    </button>
                </div>
            </div>

            {Object.keys(grouped).length === 0
                ? <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16">
                    <div className="text-center"><p className="text-gray-400 text-sm mb-2">No menu items yet.</p><button onClick={onOpenAdd} className="text-green-500 text-sm font-bold hover:underline">+ Add your first item</button></div>
                </div>
                : view === 'card'
                    ? <div className="space-y-6">
                        {Object.entries(grouped).map(([cat, catItems]) => (
                            <div key={cat}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">{cat}</span>
                                    <div className="flex-1 border-t border-gray-100" />
                                    <span className="text-xs text-gray-400">{catItems.length} item{catItems.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {catItems.map(item => (
                                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                                            <div className="relative h-44 overflow-hidden">
                                                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                                <div className={`${item.image_url ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br ${catColor(cat)} items-center justify-center`}>
                                                    <ImageIcon cls="w-8 h-8 text-white/60" />
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <button onClick={() => onToggle(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition-colors ${item.is_available ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                                        {item.is_available ? '● Available' : '○ Sold Out'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-3.5">
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-1">{item.name}</p>
                                                    <p className="font-extrabold text-green-600 text-sm whitespace-nowrap">₱{fmt(item.price)}</p>
                                                </div>
                                                {item.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>}
                                                <div className="flex gap-2">
                                                    <button onClick={() => onOpenEdit(item)} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                                    <button onClick={() => onDelete(item)} className="flex-1 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    : <div className="space-y-4">
                        {Object.entries(grouped).map(([cat, catItems]) => (
                            <div key={cat} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">{cat}</span>
                                    <span className="text-xs text-gray-400">{catItems.length} item{catItems.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {catItems.map(item => (
                                        <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors ${item.is_available ? 'border-l-2 border-l-green-500' : 'border-l-2 border-l-transparent'}`}>
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                                <div className={`${item.image_url ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br ${catColor(cat)} items-center justify-center`}><ImageIcon cls="w-5 h-5 text-white/60" /></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                                {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                                            </div>
                                            <p className="font-bold text-gray-800 text-sm whitespace-nowrap">₱{fmt(item.price)}</p>
                                            <button onClick={() => onToggle(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                                {item.is_available ? '● Available' : '○ Sold Out'}
                                            </button>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => onOpenEdit(item)} className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                                <button onClick={() => onDelete(item)} className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
            }
        </div>
    );
}

// ─── Tab: Vouchers ────────────────────────────────────────────────────────────

function VouchersTab({ restaurant, onOpenAdd, onOpenEdit, onDelete }) {
    const vouchers = restaurant.vouchers ?? [];
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}</p>
                <button onClick={onOpenAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                    <span className="text-base leading-none">+</span> Create Voucher
                </button>
            </div>
            {vouchers.length === 0
                ? <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-1"><VoucherIcon cls="w-6 h-6 text-gray-300" /></div>
                    <p className="text-gray-400 text-sm">No vouchers yet.</p>
                </div>
                : <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 bg-gray-50">
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-left">Code</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell text-left">Discount</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell text-left">Expires</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center hidden md:table-cell">Uses</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {vouchers.map(v => (
                                <tr key={v.id} className="odd:bg-white even:bg-gray-50/40 hover:bg-gray-50/80 transition-colors">
                                    <td className="px-4 py-3"><span className="font-bold text-gray-800 tracking-widest font-mono text-xs">{v.code}</span></td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{v.type === 'percentage' ? `${Number(v.value)}% off` : `₱${fmt(v.value)} off`}{v.min_order_amount && <span className="text-xs text-gray-400 ml-1">(min ₱{Number(v.min_order_amount).toFixed(0)})</span>}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{v.expires_at ? new Date(v.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-gray-300">No expiry</span>}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 text-center hidden md:table-cell">{v.used_count ?? 0}/{v.max_uses ?? '∞'}</td>
                                    <td className="px-4 py-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${v.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{v.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3"><div className="flex items-center gap-2 justify-end">
                                        <button onClick={() => onOpenEdit(v)} className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                        <button onClick={() => onDelete(v)} className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ restaurant }) {
    const orders = restaurant.orders ?? [];
    const [dateFilter, setDateFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const visible = orders.filter(o => {
        if (dateFilter === 'today' && new Date(o.created_at).toDateString() !== new Date().toDateString()) return false;
        if (dateFilter === 'week' && (Date.now() - new Date(o.created_at)) >= 7 * 86400000) return false;
        if (dateFilter === 'month' && (Date.now() - new Date(o.created_at)) >= 30 * 86400000) return false;
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
        if (search && !`${o.id} ${o.user?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });
    const chip = (active) =>
        `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border active:scale-[0.98] [transition:all_200ms_cubic-bezier(0.16,1,0.3,1)] ${
            active
                ? 'bg-green-500 text-white border-green-500 shadow-sm shadow-green-200'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
        }`;

    return (
        <div className="space-y-3">
            {/* Row 1 — date pills · mobile toggle · desktop search + results */}
            <div className="flex flex-wrap items-center gap-2">
                {[{ k: 'all', label: 'All' }, { k: 'today', label: 'Today' }, { k: 'week', label: 'This Week' }, { k: 'month', label: 'This Month' }].map(({ k, label }) => (
                    <button key={k} onClick={() => setDateFilter(k)} className={chip(dateFilter === k)}>
                        {label}
                    </button>
                ))}

                {/* Mobile-only: Filters toggle */}
                <button
                    onClick={() => setFiltersOpen(v => !v)}
                    className={`lg:hidden ml-auto flex items-center gap-1.5 ${chip(false)}`}
                >
                    Filters
                    <svg className={`w-3 h-3 [transition:transform_200ms_cubic-bezier(0.16,1,0.3,1)] ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Desktop-only: search input + results badge */}
                <div className="hidden lg:flex items-center gap-3 ml-auto">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name or order #…"
                            className="h-9 pl-9 pr-3 text-sm rounded-full border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-500/10 outline-none transition-all w-52"
                        />
                    </div>
                    <span className="text-xs text-gray-400 font-medium shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold tabular-nums">{visible.length}</span>
                        <span className="ml-1.5">results</span>
                    </span>
                </div>
            </div>

            {/* Mobile-only: search (full width, below date row) */}
            <div className="lg:hidden relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name or order #…"
                    className="h-9 pl-9 pr-3 text-sm rounded-full border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-500/10 outline-none transition-all w-full"
                />
            </div>

            {/* Status + type filters — mobile collapses, lg+ always visible */}
            <div className={`flex-col gap-y-3 ${filtersOpen ? 'flex' : 'hidden'} lg:flex`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center shrink-0">Status</span>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
                                {s === 'all' ? 'All Status' : cap(s)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center shrink-0">Type</span>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pickup', 'delivery'].map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>
                                {t === 'all' ? 'All Types' : cap(t)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile-only: results count */}
            <div className="lg:hidden flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Results</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold tabular-nums">{visible.length}</span>
            </div>

            {visible.length === 0
                ? <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16"><p className="text-gray-400 text-sm">No orders match.</p></div>
                : <div className="space-y-3">{visible.map(o => <OrderCard key={o.id} order={o} onAdvance={null} />)}</div>
            }
        </div>
    );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({ restaurant, categories, onDirtyChange }) {
    const [form, setForm] = useState({
        name: restaurant.name ?? '',
        description: restaurant.description ?? '',
        category_id: restaurant.category_id ?? '',
        municipality: restaurant.municipality ?? '',
        address: restaurant.address ?? '',
        image_url: restaurant.image_url ?? '',
        opening_time: restaurant.opening_time ?? '',
        closing_time: restaurant.closing_time ?? ''
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setSuccess(false);
        setIsDirty(true);
    };

    async function handleSave(e) {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        setSuccess(false);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
            if (imageFile) fd.append('image', imageFile);
            fd.append('_method', 'PATCH');

            const res = await fetch(route('owner.settings.update', restaurant.id), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest' },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { if (res.status === 422) setErrors(data.errors ?? {}); return; }
            setSuccess(true);
            setIsDirty(false);
            setImageFile(null);
        } finally {
            setSaving(false);
        }
    }

    function fmtTime(t) {
        if (!t) return null;
        const [h, m] = t.split(':');
        const hour = parseInt(h, 10);
        return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl space-y-6 pb-20"
        >
            {/* Page header */}
            <div className="pb-2">
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Settings</h2>
                <p className="text-sm text-gray-400 mt-0.5">{restaurant.name}</p>
            </div>

            <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                {/* Left column */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Restaurant profile card */}
                    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Restaurant profile</h3>
                        </div>
                        <div className="px-6 py-6 space-y-5">
                            <Field label="Restaurant name *" error={errors.name?.[0]}>
                                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inp} required />
                            </Field>

                            <Field label="Description" error={errors.description?.[0]}>
                                <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inp + ' resize-none'} rows={4} placeholder="Tell customers about your kitchen…" />
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Municipality *" error={errors.municipality?.[0]}>
                                    <div className="relative">
                                        <select value={form.municipality} onChange={e => set('municipality', e.target.value)} className={inp + ' appearance-none pr-8'} required>
                                            <option value="">Select municipality</option>
                                            {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </Field>
                                <Field label="Category" error={errors.category_id?.[0]}>
                                    <div className="relative">
                                        <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inp + ' appearance-none pr-8'}>
                                            <option value="">Select category</option>
                                            {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </Field>
                                <Field label="Address / Landmark" error={errors.address?.[0]}>
                                    <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className={inp} placeholder="Street, building, landmark" />
                                </Field>
                            </div>

                            <Field label="Cover Image" error={errors.image?.[0]}>
                                <div className="space-y-2">
                                    {form.image_url && (
                                        <img src={form.image_url} alt="Current cover" className="w-full h-32 object-cover rounded-xl" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={e => { setImageFile(e.target.files[0]); setSuccess(false); setIsDirty(true); }}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-400">Max 2MB · JPG, PNG, or WEBP. Leave empty to keep current image.</p>
                                </div>
                            </Field>
                        </div>
                    </section>

                    {/* Business hours card */}
                    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <ClockIcon cls="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Business hours</h3>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Opening time">
                                    <input type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)} className={inp} />
                                </Field>
                                <Field label="Closing time">
                                    <input type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)} className={inp} />
                                </Field>
                            </div>
                            {form.opening_time && form.closing_time && (
                                <p className="mt-3 text-xs text-gray-400">
                                    Customers will see: <span className="font-semibold text-gray-600">{fmtTime(form.opening_time)} – {fmtTime(form.closing_time)}</span>
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right column — sticky */}
                <div className="space-y-4 lg:sticky lg:top-6">

                    {/* Cover preview */}
                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-md relative aspect-video group">
                        {form.image_url ? (
                            <img
                                src={form.image_url}
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                                alt={`${form.name} cover`}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900">
                                <ImageIcon cls="w-8 h-8 text-gray-600" />
                                <p className="text-xs text-gray-600">No cover image</p>
                            </div>
                        )}
                        <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                            <p className="text-white font-bold text-sm leading-tight truncate">{form.name || 'Restaurant name'}</p>
                            <p className="text-white/55 text-xs mt-0.5 truncate">{form.municipality || 'Location'}</p>
                        </div>
                    </div>

                    {/* Store status */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Store status</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${restaurant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {cap(restaurant.status)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                <span className="text-sm text-gray-500">Menu items</span>
                                <span className="text-sm font-bold text-gray-800 tabular-nums">{restaurant.menu_items?.length ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                <span className="text-sm text-gray-500">Hours</span>
                                <span className="text-sm font-bold text-gray-800 tabular-nums text-right">
                                    {form.opening_time
                                        ? <>{fmtTime(form.opening_time)}<br />{fmtTime(form.closing_time)}</>
                                        : <span className="text-gray-400 font-normal">Not set</span>
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </form>

            {/* Sticky save footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 py-3 px-1 flex items-center justify-between gap-4">
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                            Changes saved
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    form="settings-form"
                    type="submit"
                    disabled={saving}
                    className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 shadow-sm shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function OwnerDashboard({ restaurants: initialRestaurants, categories, auth, notifications = [], unreadCount = 0, rejectedRestaurants = [] }) {
    const [restaurants, setRestaurants]   = useState(initialRestaurants);
    const [selectedId, setSelectedId]     = useState(initialRestaurants[0]?.id ?? null);
    const [activeTab, setActiveTab]       = useState('overview');
    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [itemModal, setItemModal]       = useState(null);
    const [voucherModal, setVoucherModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [orderToast, setOrderToast]       = useState(null);
    const orderToastTimer                   = useRef(null);
    const [statusToast, setStatusToast]     = useState(null);
    const statusToastTimer                  = useRef(null);
    const [ownerBellOpen, setOwnerBellOpen]           = useState(false);
    const [ownerNotifications, setOwnerNotifications] = useState(notifications);
    const [ownerUnread, setOwnerUnread]               = useState(unreadCount);
    const ownerBellRef                                = useRef(null);
    const [restaurantDropOpen, setRestaurantDropOpen] = useState(false);
    const restaurantDropRef                           = useRef(null);
    const [isSettingsDirty, setIsSettingsDirty]       = useState(false);

    // ── Restaurant profile progress bar state ─────────────────────────────────
    const [dismissedProgress, setDismissedProgress]   = useState(() => !!auth?.user?.has_dismissed_progress_bar);
    const [quickFillOpen, setQuickFillOpen]           = useState(false);
    const [quickFillSaving, setQuickFillSaving]       = useState(false);
    const [quickFillImage, setQuickFillImage]         = useState(null);
    const [quickFillPreview, setQuickFillPreview]     = useState(null);
    const [quickFillDesc, setQuickFillDesc]           = useState('');
    const [quickFillOpenTime, setQuickFillOpenTime]   = useState('');
    const [quickFillCloseTime, setQuickFillCloseTime] = useState('');

    // ── Owner tour state ──────────────────────────────────────────────────────
    const [ownerTourStep, setOwnerTourStep] = useState(null);
    const [ownerTourRect, setOwnerTourRect] = useState(null);

    const OWNER_TOUR_STEPS = [
        { target: 'orders',   description: 'New orders appear here in real time. Accept, prepare, and mark them ready from this panel.' },
        { target: 'menu',     description: 'Manage your menu here — add new dishes, update prices, upload photos, or toggle items as unavailable when sold out.' },
        { target: 'vouchers', description: 'Create promo codes for your restaurant. Set a discount, minimum order, expiry date, and usage limit.' },
        { target: 'overview', description: 'Track your revenue, order volume, and top-selling items here. You can also export your sales data as CSV.' },
        { target: 'settings', description: 'Update your restaurant details, opening hours, and other settings here.' },
    ];

    useEffect(() => {
        if (auth?.user?.has_seen_owner_tour) return;
        const firstRestaurant = initialRestaurants[0];
        if (!firstRestaurant || firstRestaurant.status !== 'active') return;
        const t = setTimeout(() => setOwnerTourStep(0), 950);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (ownerTourStep === null) { setOwnerTourRect(null); return; }
        const step = OWNER_TOUR_STEPS[ownerTourStep];
        if (!step) return;
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        setOwnerTourRect(el ? el.getBoundingClientRect() : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerTourStep]);

    async function completeOwnerTour() {
        setOwnerTourStep(null);
        try {
            await fetch('/profile/owner-tour-complete', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest' },
            });
        } catch { /* ignore */ }
    }

    function getOwnerTourTooltipPos(rect) {
        if (!rect) return { top: 120, left: 20 };
        const W = 296, OFFSET = 16;
        const vw = window.innerWidth, vh = window.innerHeight;
        let top = rect.top + rect.height / 2 - 80;
        let left;
        if (rect.right + OFFSET + W < vw) {
            left = rect.right + OFFSET;
        } else {
            left = Math.max(16, Math.min((vw - W) / 2, vw - W - 16));
        }
        top = Math.max(80, Math.min(top, vh - 250));
        return { top, left, width: W };
    }

    useEffect(() => {
        if (!auth?.user?.id) return;
        const channel = window.Echo.private('owner.' + auth.user.id);
        channel.listen('.new-order', (event) => {
            setNewOrderCount(prev => prev + 1);
            setOwnerUnread(prev => prev + 1);
            setOwnerNotifications(prev => [
                {
                    id: Date.now(),
                    order_id: event.order_id,
                    customer_name: event.customer_name,
                    order_type: event.order_type,
                    total: event.total,
                    received_at: 'just now',
                },
                ...prev,
            ]);
            if (orderToastTimer.current) clearTimeout(orderToastTimer.current);
            setOrderToast(event);
            orderToastTimer.current = setTimeout(() => setOrderToast(null), 5000);

            fetch(`/api/owner/orders/${event.order_id}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data?.order) return;
                setRestaurants(prev => prev.map(r =>
                    r.id === data.order.restaurant_id
                        ? { ...r, orders: [data.order, ...r.orders] }
                        : r
                ));
            })
            .catch(() => {});
        });
        channel.listen('.order-status-updated', (event) => {
            setRestaurants(prev => prev.map(r => ({
                ...r,
                orders: r.orders.map(o =>
                    o.id === event.order_id
                        ? { ...o, status: event.status }
                        : o
                ),
            })));
        });
        const notifChannel = window.Echo.private(`App.Models.User.${auth.user.id}`);
        notifChannel.notification((notification) => {
            if (notification.type === 'restaurant.status.updated') {
                router.reload({
                    only: ['restaurants', 'rejectedRestaurants'],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        });

        return () => {
            window.Echo.leave('owner.' + auth.user.id);
            window.Echo.leave(`App.Models.User.${auth.user.id}`);
            if (orderToastTimer.current) clearTimeout(orderToastTimer.current);
        };
    }, [auth?.user?.id]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ownerBellRef.current && !ownerBellRef.current.contains(e.target)) {
                setOwnerBellOpen(false);
            }
            if (restaurantDropRef.current && !restaurantDropRef.current.contains(e.target)) {
                setRestaurantDropOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const restaurant = restaurants.find(r => r.id === selectedId) ?? restaurants[0] ?? null;

    if (!restaurant) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-sm">No restaurant data found.</p>
        </div>
    );

    function patchRestaurant(fn) { setRestaurants(prev => prev.map(r => r.id === restaurant.id ? fn(r) : r)); }

    async function toggleItem(item) {
        try { const d = await apiFetch(route('owner.items.toggle', item.id), 'PATCH'); patchRestaurant(r => ({ ...r, menu_items: r.menu_items.map(i => i.id === item.id ? { ...i, is_available: d.is_available } : i) })); } catch { }
    }
    function deleteItem(item) {
        setDeleteConfirm({ type: 'item', target: item });
    }
    function onItemSaved(saved, mode) {
        patchRestaurant(r => ({ ...r, menu_items: mode === 'add' ? [...r.menu_items, saved] : r.menu_items.map(i => i.id === saved.id ? saved : i) }));
        setItemModal(null);
    }
    async function advanceStatus(order, targetStatus) {
        if (!targetStatus) return;
        try {
            const d = await apiFetch(route('owner.orders.status', order.id), 'PATCH', { status: targetStatus });
            patchRestaurant(r => ({ ...r, orders: r.orders.map(o => o.id === order.id ? { ...o, status: d.status } : o) }));
            if (targetStatus === 'accepted' || targetStatus === 'cancelled') {
                setOwnerUnread(prev => Math.max(0, prev - 1));
                setNewOrderCount(prev => Math.max(0, prev - 1));
            }
            if (statusToastTimer.current) clearTimeout(statusToastTimer.current);
            const label = { accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready for pickup', cancelled: 'Cancelled' };
            setStatusToast(`Order #${formatOrderId(order.id)} marked as ${label[targetStatus] ?? targetStatus}`);
            statusToastTimer.current = setTimeout(() => setStatusToast(null), 3000);
        } catch { }
    }
    function deleteVoucher(v) {
        setDeleteConfirm({ type: 'voucher', target: v });
    }
    function onVoucherSaved(saved, mode) {
        patchRestaurant(r => ({ ...r, vouchers: mode === 'add' ? [saved, ...r.vouchers] : r.vouchers.map(v => v.id === saved.id ? saved : v) }));
        setVoucherModal(null);
    }

    const pendingCount = (restaurant.orders ?? []).filter(o => o.status === 'pending').length;

    // ── Restaurant profile completion ─────────────────────────────────────────
    const restaurantFields = [
        { label: 'Restaurant Image', filled: !!(restaurant.image_url?.trim()) },
        { label: 'Description',       filled: !!(restaurant.description?.trim()) },
        { label: 'Opening Hours',     filled: !!(restaurant.opening_time && restaurant.closing_time) },
    ];
    const profileCompletionPct = Math.round(restaurantFields.filter(f => f.filled).length / restaurantFields.length * 100);
    const profileMissingFields = restaurantFields.filter(f => !f.filled).map(f => f.label);

    function openQuickFill() {
        setQuickFillDesc(restaurant.description ?? '');
        setQuickFillOpenTime(restaurant.opening_time ?? '');
        setQuickFillCloseTime(restaurant.closing_time ?? '');
        setQuickFillImage(null);
        setQuickFillPreview(restaurant.image_url ?? null);
        setQuickFillOpen(true);
    }

    async function dismissRestaurantProgress() {
        setDismissedProgress(true);
        try {
            await fetch('/profile/dismiss-progress', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest' },
            });
        } catch { /* ignore */ }
    }

    async function saveQuickFill(e) {
        e.preventDefault();
        setQuickFillSaving(true);
        try {
            const fd = new FormData();
            fd.append('_method', 'PATCH');
            fd.append('name', restaurant.name);
            fd.append('municipality', restaurant.municipality);
            fd.append('description', quickFillDesc);
            fd.append('opening_time', quickFillOpenTime);
            fd.append('closing_time', quickFillCloseTime);
            if (quickFillImage) fd.append('image', quickFillImage);
            const res = await fetch(route('owner.settings.update', restaurant.id), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': CSRF(), 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error('Failed');
            patchRestaurant(r => ({ ...r, ...data.restaurant }));
            setQuickFillOpen(false);
            if (statusToastTimer.current) clearTimeout(statusToastTimer.current);
            setStatusToast('Restaurant profile updated');
            statusToastTimer.current = setTimeout(() => setStatusToast(null), 3000);
        } catch { /* ignore */ } finally {
            setQuickFillSaving(false);
        }
    }

    function handleTabChange(key) {
        if (activeTab === 'settings' && isSettingsDirty) {
            if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
        }
        if (key === 'orders') setNewOrderCount(0);
        setActiveTab(key);
        setSidebarOpen(false);
    }

    function renderTab() {
        switch (activeTab) {
            case 'overview': return <OverviewTab restaurant={restaurant} onSwitchTab={handleTabChange} />;
            case 'orders':   return <OrdersTab restaurant={restaurant} onAdvance={advanceStatus} />;
            case 'menu':     return <MenuTab restaurant={restaurant} onToggle={toggleItem} onDelete={deleteItem} onOpenAdd={() => setItemModal({ mode: 'add', categories: [...new Set(restaurant.menu_items.map(i => i.category))] })} onOpenEdit={item => setItemModal({ mode: 'edit', item, categories: [...new Set(restaurant.menu_items.map(i => i.category))] })} />;
            case 'vouchers': return <VouchersTab restaurant={restaurant} onOpenAdd={() => setVoucherModal('add')} onOpenEdit={v => setVoucherModal(v)} onDelete={deleteVoucher} />;
            case 'history':  return <HistoryTab restaurant={restaurant} />;
            case 'settings': return <SettingsTab restaurant={restaurant} categories={categories} onDirtyChange={setIsSettingsDirty} />;
            default: return null;
        }
    }

    const activeLabel = NAV_ITEMS.find(n => n.key === activeTab)?.label ?? '';

    return (
        <>
            <Head title={`${restaurant.name} — Dashboard`} />
            <div className="min-h-screen bg-slate-50 flex">

                {/* Mobile overlay */}
                {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* ── Sidebar ── */}
              <aside className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto`}>

                    {/* Logo */}
                    <div className="h-16 flex items-center px-5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-200">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-lg font-extrabold text-gray-800 tracking-tight">Hapag</span>
                        </div>
                    </div>

                    {/* Restaurant info */}
                    <div className="px-4 pt-5 pb-4 border-b border-gray-100">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-3 shadow-sm shadow-green-100">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <p className="text-sm font-extrabold text-gray-800 leading-snug">{restaurant.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${restaurant.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <p className="text-xs text-gray-400">{restaurant.municipality}</p>
                        </div>
                        {restaurants.length > 1 && (
                            <div className="relative mt-3" ref={restaurantDropRef}>
                                <button
                                    onClick={() => setRestaurantDropOpen(v => !v)}
                                    className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-gray-300 bg-gray-50 transition-colors"
                                >
                                    <span className="truncate">{restaurant.name}</span>
                                    <svg className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-150 ${restaurantDropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <AnimatePresence>
                                    {restaurantDropOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                            transition={{ duration: 0.12 }}
                                            style={{ transformOrigin: 'top' }}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                                        >
                                            {restaurants.map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => { setSelectedId(r.id); setActiveTab('overview'); setRestaurantDropOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${r.id === selectedId ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {r.name}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        <p className="px-3 pt-1 pb-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Navigation</p>
                        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                            const active = activeTab === key;
                            return (
                                <div key={key} className="relative">
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-green-500 rounded-r-full" />
                                    )}
                                    <button
                                        onClick={() => handleTabChange(key)}
                                        data-tour={key}
                                        aria-label={`Navigate to ${label}`}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                                            ${active ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                    >
                                        <Icon cls={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-green-600' : ''}`} />
                                        <span className="flex-1 text-left">{label}</span>
                                        {key === 'orders' && pendingCount > 0 && (
                                            <span className="bg-orange-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">{pendingCount}</span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="px-3 py-4 border-t border-gray-100">
                        <a
                            href={route('restaurants.show', restaurant.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                        >
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            View my page
                        </a>
                        <button onClick={() => router.post(route('logout'))}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top bar */}
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                            </button>
                            <div>
                                <h1 className="text-base font-extrabold text-gray-800 leading-tight">{activeLabel}</h1>
                                <p className="text-xs text-gray-400 hidden sm:block">{restaurant.name} · {restaurant.municipality}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs text-gray-400 hidden lg:inline">{fmtDate()}</span>
                            <div className="relative" ref={ownerBellRef}>
                                <button
                                    onClick={() => {
                                        setOwnerBellOpen(v => !v);
                                        setOwnerUnread(0);
                                    }}
                                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    title="Notifications"
                                >
                                    <BellIcon cls="w-5 h-5 text-gray-500" />
                                    {ownerUnread > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                                            {ownerUnread > 9 ? '9+' : ownerUnread}
                                        </span>
                                    )}
                                </button>

                                {ownerBellOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-800">New Orders</p>
                                            {ownerNotifications.length > 0 && (
                                                <button
                                                    onClick={() => { handleTabChange('orders'); setOwnerBellOpen(false); }}
                                                    className="text-xs text-green-600 font-semibold hover:text-green-700 transition-colors"
                                                >
                                                    View all orders →
                                                </button>
                                            )}
                                        </div>
                                        {ownerNotifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-gray-400">No new orders yet</div>
                                        ) : (
                                            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                                {ownerNotifications.map(n => (
                                                    <li
                                                        key={n.id}
                                                        onClick={() => { handleTabChange('orders'); setOwnerBellOpen(false); }}
                                                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-semibold text-gray-800">Order #{formatOrderId(n.order_id)}</p>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                                {n.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">From {n.customer_name} · ₱{Number(n.total).toFixed(2)}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{n.received_at}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${restaurant.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${restaurant.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                {cap(restaurant.status)}
                            </span>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
                        {rejectedRestaurants.length > 0 && (
                            <div className="mb-5 space-y-3">
                                {rejectedRestaurants.map(r => (
                                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-red-700 leading-tight">{r.name} — Application Rejected</p>
                                                {r.rejection_reason ? (
                                                    <p className="text-xs text-red-600 mt-0.5 line-clamp-2">{r.rejection_reason}</p>
                                                ) : (
                                                    <p className="text-xs text-red-400 mt-0.5">No reason provided.</p>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={route('owner.rejected', r.id)}
                                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors text-center"
                                        >
                                            Fix &amp; Resubmit
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* ── Restaurant profile completion banner ──────────────────── */}
                        {restaurant.status === 'active' && !dismissedProgress && profileCompletionPct < 100 && (
                            <div className="mb-5">
                                <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 pr-12">
                                    <button
                                        type="button"
                                        onClick={dismissRestaurantProgress}
                                        className="absolute top-4 right-4 w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                        aria-label="Dismiss"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 mb-1.5">
                                                Restaurant profile {profileCompletionPct}% complete
                                            </p>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-[width] duration-700"
                                                    style={{ width: `${profileCompletionPct}%` }}
                                                />
                                            </div>
                                            {profileMissingFields.length > 0 && (
                                                <p className="text-xs text-gray-400 mb-3">
                                                    Missing: {profileMissingFields.join(', ')}
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={openQuickFill}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                                            >
                                                Complete your profile
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            >
                                {renderTab()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Modals with AnimatePresence */}
            <AnimatePresence>
                {itemModal !== null && (
                    <ItemModal
                        key="item-modal"
                        mode={itemModal.mode}
                        item={itemModal.mode === 'edit' ? itemModal.item : null}
                        existingCategories={itemModal.categories}
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        onClose={() => setItemModal(null)}
                        onSaved={onItemSaved}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {voucherModal !== null && (
                    <VoucherModal
                        key="voucher-modal"
                        mode={voucherModal === 'add' ? 'add' : 'edit'}
                        voucher={voucherModal === 'add' ? null : voucherModal}
                        restaurantId={restaurant.id}
                        onClose={() => setVoucherModal(null)}
                        onSaved={onVoucherSaved}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {deleteConfirm !== null && (
                    <DeleteConfirmModal
                        key="delete-confirm-modal"
                        confirm={deleteConfirm}
                        onCancel={() => setDeleteConfirm(null)}
                        onConfirm={async () => {
                            if (deleteConfirm.type === 'item') {
                                try {
                                    await apiFetch(route('owner.items.destroy', deleteConfirm.target.id), 'DELETE');
                                    patchRestaurant(r => ({ ...r, menu_items: r.menu_items.filter(i => i.id !== deleteConfirm.target.id) }));
                                } catch (e) { if (e?.data?.error) alert(e.data.error); }
                            } else {
                                try {
                                    await apiFetch(route('owner.vouchers.destroy', deleteConfirm.target.id), 'DELETE');
                                    patchRestaurant(r => ({ ...r, vouchers: r.vouchers.filter(vch => vch.id !== deleteConfirm.target.id) }));
                                } catch {}
                            }
                            setDeleteConfirm(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Status advance toast */}
            <AnimatePresence>
                {statusToast && (
                    <motion.div
                        key="status-toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white bg-gray-800 pointer-events-none"
                    >
                        ✓ {statusToast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Quick-Fill Modal ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {quickFillOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setQuickFillOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-gray-800">Complete your profile</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Fill in the missing details to attract more customers</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setQuickFillOpen(false)}
                                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                        aria-label="Close"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveQuickFill}>
                                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

                                    {/* Restaurant Image */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Restaurant Image</label>
                                        {quickFillPreview && (
                                            <div className="mb-2 w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                                <img src={quickFillPreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                                            </svg>
                                            <span className="truncate">{quickFillImage ? quickFillImage.name : 'Click to upload image'}</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="hidden"
                                                onChange={e => {
                                                    const f = e.target.files[0];
                                                    if (!f) return;
                                                    setQuickFillImage(f);
                                                    setQuickFillPreview(URL.createObjectURL(f));
                                                }}
                                            />
                                        </label>
                                        <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP — max 2 MB</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                                        <textarea
                                            value={quickFillDesc}
                                            onChange={e => setQuickFillDesc(e.target.value)}
                                            maxLength={1000}
                                            rows={3}
                                            placeholder="Describe your restaurant — specialties, vibe, what makes you unique..."
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all duration-150 resize-none"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 text-right">{quickFillDesc.length} / 1000</p>
                                    </div>

                                    {/* Opening Hours */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Opening Hours</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-400 mb-1">Opens at</label>
                                                <input
                                                    type="time"
                                                    value={quickFillOpenTime}
                                                    onChange={e => setQuickFillOpenTime(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all duration-150"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400 mb-1">Closes at</label>
                                                <input
                                                    type="time"
                                                    value={quickFillCloseTime}
                                                    onChange={e => setQuickFillCloseTime(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all duration-150"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setQuickFillOpen(false)}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={quickFillSaving}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors active:scale-95 disabled:opacity-50"
                                    >
                                        {quickFillSaving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                                        {quickFillSaving ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Owner Onboarding Tour ─────────────────────────────────────────── */}
            {ownerTourStep !== null && (
                <>
                    {/* Backdrop — clicking outside completes the tour */}
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 900 }}
                        onClick={completeOwnerTour}
                    />

                    {/* Green-ring highlight cutout around target element */}
                    {ownerTourRect && (
                        <div
                            className="fixed pointer-events-none"
                            style={{
                                top: ownerTourRect.top - 6,
                                left: ownerTourRect.left - 6,
                                width: ownerTourRect.width + 12,
                                height: ownerTourRect.height + 12,
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.58)',
                                border: '2px solid #22c55e',
                                borderRadius: '14px',
                                zIndex: 901,
                            }}
                        />
                    )}

                    {/* Tooltip card */}
                    <div
                        className="fixed bg-white rounded-2xl shadow-2xl p-5"
                        style={{ ...getOwnerTourTooltipPos(ownerTourRect), zIndex: 902 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                {ownerTourStep + 1} of {OWNER_TOUR_STEPS.length}
                            </span>
                            <button
                                type="button"
                                onClick={completeOwnerTour}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                            >
                                Skip tour
                            </button>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            {OWNER_TOUR_STEPS[ownerTourStep].description}
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 flex-1">
                                {OWNER_TOUR_STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === ownerTourStep ? 'bg-green-500 flex-1' : 'w-4 bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => ownerTourStep < OWNER_TOUR_STEPS.length - 1 ? setOwnerTourStep(s => s + 1) : completeOwnerTour()}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors active:scale-95 shrink-0"
                            >
                                {ownerTourStep === OWNER_TOUR_STEPS.length - 1 ? 'Got it!' : 'Next'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* New-order toast */}
            <AnimatePresence>
                {orderToast && (
                    <motion.div
                        key="order-toast"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => { handleTabChange('orders'); setOrderToast(null); }}
                        className="fixed bottom-6 right-6 z-[200] flex items-start gap-3 bg-green-500 text-white px-5 py-4 rounded-2xl shadow-xl max-w-sm cursor-pointer"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold leading-snug">New order #{formatOrderId(orderToast.order_id)} received!</p>
                            <p className="text-xs font-medium mt-0.5 opacity-90">
                                From {orderToast.customer_name} · {orderToast.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setOrderToast(null); }}
                            className="shrink-0 p-0.5 rounded-full hover:bg-green-600 transition-colors"
                            aria-label="Dismiss"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}