import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    AreaChart, BarChart, PieChart, Pie, Cell,
    Area, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Motion variants ────────────────────────────────────────────────────────────

const STAGGER  = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const FADE_UP  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 30 } } };
const FADE_IN  = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { duration: 0.3 } } };

// ── Constants ──────────────────────────────────────────────────────────────────

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const WEATHER_TAGS = ['rainy', 'hot', 'cool', 'cloudy'];

const WEATHER_BADGE = {
    rainy:  'bg-blue-900/50 text-blue-300 border border-blue-700/50',
    hot:    'bg-orange-900/50 text-orange-300 border border-orange-700/50',
    cool:   'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
    cloudy: 'bg-gray-700/50 text-gray-300 border border-gray-600/50',
};

const EMPTY_CATEGORY = { name: '', icon: '', weather_tag: 'rainy' };
const EMPTY_VOUCHER  = { code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', is_active: true, expires_at: '' };

const inputCls = [
    'w-full px-3 py-2 rounded-lg border border-gray-600',
    'bg-gray-700/50 text-white placeholder:text-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors text-sm',
].join(' ');

const TIME_PERIODS = [
    { id: 'today', label: 'Today' },
    { id: 'week',  label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all',   label: 'All Time' },
];

const STATUS_COLORS = {
    pending:   '#FACC15',
    preparing: '#FB923C',
    ready:     '#60A5FA',
    completed: '#4ADE80',
    cancelled: '#F87171',
};
const STATUS_FALLBACK = '#6B7280';

const MEDAL = ['#F59E0B', '#9CA3AF', '#92400E'];

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
        const e = new Error(res.statusText);
        e.status = res.status;
        e.data   = data;
        throw e;
    }
    return data;
}

const cap        = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmtCurrency = v => `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtShortDate(dateStr) {
    if (!dateStr) return '';
    const [, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

function filterByPeriod(data, period) {
    if (period === 'all' || !data?.length) return data ?? [];
    const now    = new Date();
    const pad    = n => String(n).padStart(2, '0');
    const ymd    = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today  = ymd(now);
    if (period === 'today') return data.filter(d => d.date === today);
    const days   = period === 'week' ? 6 : 29;
    const cutoff = ymd(new Date(now.getTime() - days * 86400000));
    return data.filter(d => d.date >= cutoff);
}

function toCumulative(data) {
    let s = 0;
    return data.map(d => ({ ...d, value: (s += Number(d.count)) }));
}

function mergeUserGrowth(customers, owners) {
    const map = {};
    (customers ?? []).forEach(d => { map[d.date] = { date: d.date, customers: Number(d.count), owners: 0 }; });
    (owners ?? []).forEach(d => {
        if (map[d.date]) map[d.date].owners = Number(d.count);
        else             map[d.date] = { date: d.date, customers: 0, owners: Number(d.count) };
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

// ── Icons (inline SVG) ─────────────────────────────────────────────────────────

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IcoHome    = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoStore   = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M2 7h20M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M3 7l2 13h14l2-13"/><path d="M9 11v4M15 11v4"/></svg>;
const IcoUsers   = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><circle cx="9" cy="7" r="4"/><circle cx="17" cy="9" r="3"/><path d="M1 21v-1a7 7 0 0114 0v1"/><path d="M17 13a5 5 0 016 5v1"/></svg>;
const IcoBag     = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcoCoin    = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-3-7h6m-6 3h6"/></svg>;
const IcoTag     = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoDB      = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>;
const IcoOut     = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoCheck   = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX       = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoMenu    = ({ c = 'w-5 h-5' }) => <svg className={c} viewBox="0 0 24 24" {...S}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoTrend   = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoFire    = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path d="M9.879 16.121A3 3 0 1012.015 11"/></svg>;
const IcoGrid    = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcoStar    = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoMap     = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoRepeat  = ({ c = 'w-4 h-4' }) => <svg className={c} viewBox="0 0 24 24" {...S}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;

// ── CountUp ────────────────────────────────────────────────────────────────────

function CountUp({ to, prefix = '', decimals = 0 }) {
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!to && to !== 0) return;
        let startTime = null;
        const duration = 1400;

        function step(ts) {
            if (!startTime) startTime = ts;
            const p = Math.min((ts - startTime) / duration, 1);
            setVal(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, [to]);

    const display = decimals > 0
        ? val.toLocaleString('en-PH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(val).toLocaleString('en-PH');

    return <>{prefix}{display}</>;
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ id, msg, type, onRemove }) {
    useEffect(() => {
        const t = setTimeout(() => onRemove(id), 4000);
        return () => clearTimeout(t);
    }, [id, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium',
                'border backdrop-blur-sm max-w-xs w-full',
                type === 'error'
                    ? 'bg-gray-900 border-red-700/50 text-red-400'
                    : 'bg-gray-900 border-green-700/50 text-green-400',
            ].join(' ')}
        >
            <span>{type === 'error' ? <IcoX c="w-4 h-4" /> : <IcoCheck c="w-4 h-4" />}</span>
            <span className="text-gray-200">{msg}</span>
        </motion.div>
    );
}

function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed bottom-5 right-5 z-[500] flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast id={t.id} msg={t.msg} type={t.type} onRemove={onRemove} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav, pendingCount, onSignOut }) {
    const group = 'mb-6';
    const label = 'px-3 mb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest';

    const navItem = (id, icon, text, badge) => (
        <button
            key={id}
            onClick={() => onNav(id)}
            className={[
                'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                active === id
                    ? 'text-green-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
            ].join(' ')}
        >
            {active === id && (
                <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 bg-green-500/15 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
            )}
            <span className="relative z-10 shrink-0">{icon}</span>
            <span className="relative z-10 flex-1">{text}</span>
            {badge != null && badge > 0 && (
                <span className="relative z-10 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <aside className="flex flex-col h-full px-3 py-5 overflow-y-auto">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-3 mb-8">
                <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">H</span>
                </div>
                <span className="text-white font-extrabold tracking-tight text-base">Hapag</span>
                <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md ml-auto">ADMIN</span>
            </div>

            {/* Analytics */}
            <div className={group}>
                <p className={label}>Analytics</p>
                {navItem('overview', <IcoHome c="w-4 h-4" />, 'Overview')}
            </div>

            {/* Management */}
            <div className={group}>
                <p className={label}>Management</p>
                {navItem('pending',    <IcoStore c="w-4 h-4" />, 'Pending',    pendingCount)}
                {navItem('categories', <IcoGrid c="w-4 h-4" />,  'Categories')}
                {navItem('vouchers',   <IcoTag c="w-4 h-4" />,   'Vouchers')}
            </div>

            {/* System */}
            <div className={group}>
                <p className={label}>System</p>
                {navItem('backup', <IcoDB c="w-4 h-4" />, 'Backup')}
                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                    <IcoOut c="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

const CARD_GRADIENTS = {
    'red-pink':    'from-rose-500 to-pink-500',
    'purple':      'from-violet-500 to-purple-600',
    'blue-cyan':   'from-blue-500 to-cyan-400',
    'green':       'from-emerald-500 to-green-400',
    'teal':        'from-teal-500 to-cyan-400',
    'rose':        'from-rose-600 to-red-500',
};

function StatCard({ label, value, prefix = '', decimals = 0, subtitle, gradient = 'green', icon }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const grad   = CARD_GRADIENTS[gradient] ?? CARD_GRADIENTS.green;

    return (
        <motion.div
            ref={ref}
            variants={FADE_UP}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/60 transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    {icon}
                </div>
            </div>
            <p className="text-[26px] font-bold text-white tracking-tight leading-none tabular-nums mb-1.5">
                {inView ? <CountUp to={value} prefix={prefix} decimals={decimals} /> : `${prefix}0`}
            </p>
            <p className="text-xs font-semibold text-gray-400">{label}</p>
            {subtitle && <p className="text-[10px] text-gray-600 mt-1">{subtitle}</p>}
        </motion.div>
    );
}

// ── Dark Chart Tooltip ─────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label, isCurrency }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl px-3 py-2 text-xs">
            {label && <p className="text-gray-400 font-medium mb-1.5">{fmtShortDate(label) || label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="font-semibold" style={{ color: p.color || p.fill || '#22C55E' }}>
                    {p.name}: {isCurrency ? fmtCurrency(p.value) : Number(p.value).toLocaleString('en-PH')}
                </p>
            ))}
        </div>
    );
}

function DarkPieTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl px-3 py-2 text-xs">
            <p className="font-semibold text-white">{p.name}: {Number(p.value).toLocaleString('en-PH')}</p>
        </div>
    );
}

// ── Dark Chart Card ────────────────────────────────────────────────────────────

function DarkChartCard({ title, icon, stat, statLabel, children, height = 'h-48', className = '' }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className={`bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5 ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {icon && <span className="text-gray-500">{icon}</span>}
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
                    </div>
                    {stat !== undefined && (
                        <p className="text-xl font-bold text-white tracking-tight tabular-nums">
                            {stat}
                            {statLabel && <span className="text-xs font-normal text-gray-500 ml-1">{statLabel}</span>}
                        </p>
                    )}
                </div>
            </div>
            <div className={height}>{children}</div>
        </motion.div>
    );
}

function EmptyChart() {
    return (
        <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            No data for this period
        </div>
    );
}

// ── Donut Card ─────────────────────────────────────────────────────────────────

function DonutCard({ title, icon, data, colorMap, centerValue, centerLabel, height = 'h-52' }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5"
        >
            <div className="flex items-center gap-2 mb-3">
                {icon && <span className="text-gray-500">{icon}</span>}
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
            </div>

            {!data?.length ? <div className={`${height} flex items-center justify-center text-gray-600 text-sm`}>No data</div> : (
                <>
                    <div className={`relative ${height}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="52%"
                                    outerRadius="72%"
                                    dataKey="value"
                                    paddingAngle={3}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {data.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={colorMap?.[entry.status ?? entry.name] ?? '#6B7280'}
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<DarkPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-xl font-bold text-white tabular-nums">{centerValue}</p>
                                <p className="text-[10px] text-gray-500">{centerLabel}</p>
                            </div>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        {data.map((entry, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorMap?.[entry.status ?? entry.name] ?? '#6B7280' }} />
                                {entry.name}: <span className="text-gray-300 font-semibold">{Number(entry.value).toLocaleString('en-PH')}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
}

// ── Peak Hours Heatmap ─────────────────────────────────────────────────────────

const HEATMAP_HOURS    = Array.from({ length: 18 }, (_, i) => i + 6); // 6AM–11PM
const HEATMAP_DAYS     = [2, 3, 4, 5, 6, 7, 1]; // Mon–Sun (MySQL DAYOFWEEK: 1=Sun)
const HEATMAP_DAY_LBLS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function heatmapBg(ratio) {
    if (ratio <= 0)   return '#111827'; // gray-900
    if (ratio < 0.15) return '#14532D'; // green-900
    if (ratio < 0.35) return '#166534'; // green-800
    if (ratio < 0.6)  return '#16A34A'; // green-600
    if (ratio < 0.85) return '#22C55E'; // green-500
    return '#4ADE80';                   // green-400
}

function PeakHoursHeatmap({ data }) {
    const [hovered, setHovered] = useState(null);
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    const matrix = useMemo(() => {
        const m = {};
        (data ?? []).forEach(d => {
            m[`${d.day}_${d.hour}`] = Number(d.count);
        });
        return m;
    }, [data]);

    const maxCount = useMemo(() => Math.max(...Object.values(matrix), 1), [matrix]);

    const fmtHour = h => {
        if (h === 0)  return '12a';
        if (h === 12) return '12p';
        return h > 12 ? `${h - 12}p` : `${h}a`;
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5"
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500"><IcoFire c="w-4 h-4" /></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Peak ordering hours</p>
            </div>
            <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-fit">
                    {/* Y-axis hour labels */}
                    <div className="flex flex-col gap-[3px] pr-2">
                        <div className="h-5" />
                        {HEATMAP_HOURS.map(h => (
                            <div key={h} className="h-5 flex items-center text-[9px] text-gray-600 font-mono w-6">
                                {fmtHour(h)}
                            </div>
                        ))}
                    </div>
                    {/* Columns */}
                    {HEATMAP_DAYS.map((day, di) => (
                        <div key={day} className="flex flex-col gap-[3px]">
                            <div className="h-5 flex items-center justify-center text-[9px] text-gray-500 font-semibold w-7">
                                {HEATMAP_DAY_LBLS[di]}
                            </div>
                            {HEATMAP_HOURS.map((hour, hi) => {
                                const count  = matrix[`${day}_${hour}`] ?? 0;
                                const ratio  = count / maxCount;
                                const cellId = `${day}-${hour}`;
                                const delay  = inView ? (di * HEATMAP_HOURS.length + hi) * 0.004 : 0;

                                return (
                                    <motion.div
                                        key={cellId}
                                        initial={{ opacity: 0 }}
                                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                                        transition={{ delay, duration: 0.15 }}
                                        className="relative w-7 h-5 rounded-sm cursor-default"
                                        style={{ backgroundColor: heatmapBg(ratio) }}
                                        onMouseEnter={() => setHovered({ day: HEATMAP_DAY_LBLS[di], hour, count })}
                                        onMouseLeave={() => setHovered(null)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {/* Tooltip */}
            {hovered && (
                <p className="mt-3 text-[11px] text-gray-400">
                    <span className="text-white font-semibold">{hovered.day}</span>{' '}
                    {hovered.hour > 12 ? hovered.hour - 12 : hovered.hour}{hovered.hour >= 12 ? 'PM' : 'AM'}
                    {' — '}
                    <span className="text-green-400 font-semibold">{hovered.count} orders</span>
                </p>
            )}
            {/* Legend scale */}
            <div className="mt-3 flex items-center gap-2">
                <span className="text-[9px] text-gray-600">Low</span>
                {[0, 0.2, 0.4, 0.65, 0.85, 1].map((r, i) => (
                    <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: heatmapBg(r) }} />
                ))}
                <span className="text-[9px] text-gray-600">High</span>
            </div>
        </motion.div>
    );
}

// ── Top Restaurants Table ──────────────────────────────────────────────────────

function TopRestaurantsTable({ data }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl overflow-hidden"
        >
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <span className="text-gray-500"><IcoStar c="w-4 h-4" /></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top restaurants</p>
            </div>
            {!data?.length ? (
                <p className="px-5 pb-5 text-sm text-gray-600">No order data yet.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700/50">
                            <th className="text-left px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">#</th>
                            <th className="text-left px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Restaurant</th>
                            <th className="text-right px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden sm:table-cell">Revenue</th>
                            <th className="text-right px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Orders</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                        {data.map((r, i) => (
                            <tr key={r.id} className="hover:bg-gray-700/20 transition-colors">
                                <td className="px-5 py-3 w-10">
                                    {i < 3 ? (
                                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                                            style={{ backgroundColor: `${MEDAL[i]}22`, color: MEDAL[i] }}>
                                            {i + 1}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-gray-600 tabular-nums">{i + 1}</span>
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    <p className="font-semibold text-gray-200 text-xs truncate max-w-[140px]">{r.name}</p>
                                    <p className="text-[10px] text-gray-500">{r.municipality}</p>
                                </td>
                                <td className="px-5 py-3 text-right text-xs font-semibold text-green-400 tabular-nums hidden sm:table-cell">
                                    {fmtCurrency(r.revenue ?? 0)}
                                </td>
                                <td className="px-5 py-3 text-right text-xs text-gray-300 tabular-nums">
                                    {Number(r.order_count ?? 0).toLocaleString('en-PH')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </motion.div>
    );
}

// ── Top Menu Items Table ───────────────────────────────────────────────────────

function TopMenuItemsTable({ data }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl overflow-hidden"
        >
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <span className="text-gray-500"><IcoTrend c="w-4 h-4" /></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top menu items</p>
            </div>
            {!data?.length ? (
                <p className="px-5 pb-5 text-sm text-gray-600">No order data yet.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700/50">
                            <th className="text-left px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">#</th>
                            <th className="text-left px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Item</th>
                            <th className="text-right px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sold</th>
                            <th className="text-right px-5 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden sm:table-cell">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                        {data.map((item, i) => (
                            <tr key={item.id ?? i} className="hover:bg-gray-700/20 transition-colors">
                                <td className="px-5 py-2.5 w-10">
                                    {i < 3 ? (
                                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                                            style={{ backgroundColor: `${MEDAL[i]}22`, color: MEDAL[i] }}>
                                            {i + 1}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-gray-600 tabular-nums">{i + 1}</span>
                                    )}
                                </td>
                                <td className="px-5 py-2.5">
                                    <p className="font-semibold text-gray-200 text-xs truncate max-w-[130px]">{item.item_name}</p>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[130px]">{item.restaurant_name}</p>
                                </td>
                                <td className="px-5 py-2.5 text-right text-xs font-bold text-orange-400 tabular-nums">
                                    {Number(item.total_sold ?? 0).toLocaleString('en-PH')}
                                </td>
                                <td className="px-5 py-2.5 text-right text-xs text-gray-400 tabular-nums hidden sm:table-cell">
                                    {fmtCurrency(item.revenue ?? 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </motion.div>
    );
}

// ── Municipality Chart ─────────────────────────────────────────────────────────

function MunicipalityChart({ data }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const chartData = (data ?? []).map(d => ({ name: d.municipality, count: Number(d.count), revenue: Number(d.revenue) }));

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5"
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500"><IcoMap c="w-4 h-4" /></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Orders by municipality</p>
            </div>
            {!chartData.length ? <EmptyChart /> : (
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(55,65,81,0.4)" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={76} />
                            <Tooltip content={<DarkTooltip />} />
                            <Bar dataKey="count" name="Orders" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}

// ── Voucher Performance Card ───────────────────────────────────────────────────

function VoucherPerformanceCard({ topVouchers, totalClaimed, totalVouchersUsed }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const top3   = (topVouchers ?? []).slice(0, 3);
    const maxUsed = Math.max(...(top3.map(v => Number(v.used_count ?? 0))), 1);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={FADE_IN}
            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5"
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500"><IcoTag c="w-4 h-4" /></span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voucher performance</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-700/40 rounded-xl p-3">
                    <p className="text-lg font-bold text-white tabular-nums">{Number(totalClaimed ?? 0).toLocaleString('en-PH')}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Total claimed</p>
                </div>
                <div className="bg-gray-700/40 rounded-xl p-3">
                    <p className="text-lg font-bold text-orange-400 tabular-nums">{Number(totalVouchersUsed ?? 0).toLocaleString('en-PH')}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Total redeemed</p>
                </div>
            </div>

            {top3.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Top codes</p>
                    {top3.map(v => (
                        <div key={v.id}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[11px] font-bold text-gray-300 tracking-widest">{v.code}</span>
                                <span className="text-[11px] text-gray-400 tabular-nums">
                                    {Number(v.used_count ?? 0)}{v.max_uses ? ` / ${v.max_uses}` : ''}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(100, (Number(v.used_count ?? 0) / maxUsed) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ── Overview Section ───────────────────────────────────────────────────────────

function OverviewSection({
    timePeriod, setTimePeriod,
    totalRestaurants, activeRestaurants,
    totalUsers, totalCustomers, totalOwners,
    totalOrders, totalRevenue,
    totalCompletedOrders, totalCancelledOrders,
    completionRate, cancellationRate,
    totalVouchersUsed, revenueSavedByVouchers,
    totalClaimed, repeatCustomers,
    totalCustomersWithOrders, retentionRate,
    restaurantGrowth, customerGrowth, ownerGrowth,
    orderGrowth, revenueGrowth, voucherUsageGrowth,
    ordersByStatus, peakHoursData, topVouchers,
    topRestaurants, topMenuItems, ordersByMunicipality,
}) {
    const filteredOrders  = useMemo(() => filterByPeriod(orderGrowth ?? [], timePeriod).map(d => ({ ...d, count: Number(d.count) })),   [orderGrowth, timePeriod]);
    const filteredRevenue = useMemo(() => filterByPeriod(revenueGrowth ?? [], timePeriod).map(d => ({ ...d, revenue: Number(d.revenue) })), [revenueGrowth, timePeriod]);

    const periodOrders  = filteredOrders.reduce((s, d) => s + d.count, 0);
    const periodRevenue = filteredRevenue.reduce((s, d) => s + d.revenue, 0);

    const statusData = useMemo(() => (ordersByStatus ?? []).map(s => ({
        name:   cap(s.status),
        status: s.status,
        value:  Number(s.count),
    })), [ordersByStatus]);

    const totalStatusOrders = statusData.reduce((s, d) => s + d.value, 0);

    const retentionData = useMemo(() => [
        { name: 'Repeat',   value: repeatCustomers ?? 0 },
        { name: 'One-time', value: Math.max(0, (totalCustomersWithOrders ?? 0) - (repeatCustomers ?? 0)) },
    ], [repeatCustomers, totalCustomersWithOrders]);

    const retentionColorMap = { Repeat: '#22C55E', 'One-time': '#374151' };

    const AXIS_STYLE = { fontSize: 10, fill: '#6B7280' };
    const GRID_STROKE = 'rgba(55,65,81,0.4)';

    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>

            {/* Row 1 — Stat cards */}
            <motion.div variants={STAGGER} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <StatCard label="Total restaurants" value={totalRestaurants} gradient="red-pink"  icon={<IcoStore c="w-5 h-5" />} subtitle={`${activeRestaurants} active`} />
                <StatCard label="Total users"        value={totalUsers}        gradient="purple"    icon={<IcoUsers c="w-5 h-5" />} subtitle={`${totalCustomers} customers · ${totalOwners} owners`} />
                <StatCard label="Total orders"       value={totalOrders}       gradient="blue-cyan" icon={<IcoBag c="w-5 h-5" />}   subtitle={`${periodOrders.toLocaleString('en-PH')} this period`} />
                <StatCard label="Total revenue"      value={totalRevenue}      gradient="green"     icon={<IcoCoin c="w-5 h-5" />}  prefix="₱" decimals={2} subtitle={`${fmtCurrency(revenueSavedByVouchers)} saved via vouchers`} />
                <StatCard label="Completion rate"    value={completionRate}    gradient="teal"      icon={<IcoCheck c="w-5 h-5" />} prefix="" decimals={1} subtitle={`${totalCompletedOrders} completed`} />
                <StatCard label="Cancellation rate"  value={cancellationRate}  gradient="rose"      icon={<IcoX c="w-5 h-5" />}     prefix="" decimals={1} subtitle={`${totalCancelledOrders} cancelled`} />
            </motion.div>

            {/* Row 2 — Order trends + Status donut */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
                <DarkChartCard
                    className="lg:col-span-3"
                    title="Order trends"
                    icon={<IcoBag c="w-3.5 h-3.5" />}
                    stat={periodOrders.toLocaleString('en-PH')}
                    statLabel="orders this period"
                >
                    {filteredOrders.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredOrders} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={28} />
                                <Tooltip content={<DarkTooltip />} />
                                <Area type="monotone" dataKey="count" name="Orders" stroke="#22C55E" fill="url(#gradOrders)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22C55E' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </DarkChartCard>

                <DonutCard
                    className="lg:col-span-2"
                    title="Orders by status"
                    icon={<IcoGrid c="w-3.5 h-3.5" />}
                    data={statusData}
                    colorMap={STATUS_COLORS}
                    centerValue={totalStatusOrders.toLocaleString('en-PH')}
                    centerLabel="total orders"
                    height="h-44"
                />
            </motion.div>

            {/* Row 3 — Revenue trend + Voucher performance */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
                <DarkChartCard
                    className="lg:col-span-3"
                    title="Revenue trend"
                    icon={<IcoCoin c="w-3.5 h-3.5" />}
                    stat={fmtCurrency(periodRevenue)}
                    statLabel="this period"
                >
                    {filteredRevenue.length === 0 ? <EmptyChart /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                                <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={AXIS_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₱${(v/1000).toFixed(0)}k` : `₱${v}`} width={44} />
                                <Tooltip content={<DarkTooltip isCurrency />} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22C55E" fill="url(#gradRevenue)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22C55E' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </DarkChartCard>

                <div className="lg:col-span-2">
                    <VoucherPerformanceCard
                        topVouchers={topVouchers}
                        totalClaimed={totalClaimed}
                        totalVouchersUsed={totalVouchersUsed}
                    />
                </div>
            </motion.div>

            {/* Row 4 — Peak hours heatmap */}
            <motion.div variants={FADE_UP} className="mb-5">
                <PeakHoursHeatmap data={peakHoursData} />
            </motion.div>

            {/* Row 5 — Top tables */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <TopRestaurantsTable data={topRestaurants} />
                <TopMenuItemsTable   data={topMenuItems} />
            </motion.div>

            {/* Row 6 — Municipality + Customer retention */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3">
                    <MunicipalityChart data={ordersByMunicipality} />
                </div>

                <DonutCard
                    className="lg:col-span-2"
                    title="Customer retention"
                    icon={<IcoRepeat c="w-3.5 h-3.5" />}
                    data={retentionData}
                    colorMap={retentionColorMap}
                    centerValue={`${retentionRate}%`}
                    centerLabel="retention"
                    height="h-44"
                />
            </motion.div>

        </motion.div>
    );
}

// ── Field ──────────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

// ── Category Modal (dark) ──────────────────────────────────────────────────────

function CategoryModal({ mode, category, onClose, onSaved }) {
    const [form,       setForm]       = useState(mode === 'add' ? { ...EMPTY_CATEGORY } : { name: category.name, icon: category.icon, weather_tag: category.weather_tag });
    const [errors,     setErrors]     = useState({});
    const [processing, setProcessing] = useState(false);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setProcessing(true);
        try {
            const url    = mode === 'add' ? route('admin.categories.store') : route('admin.categories.update', category.id);
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
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
                <h2 className="text-base font-bold text-white mb-4">
                    {mode === 'add' ? 'Add category' : 'Edit category'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Name" error={errors.name?.[0]}>
                        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                            className={inputCls} required />
                    </Field>
                    <Field label="Icon (emoji)" error={errors.icon?.[0]}>
                        <input type="text" value={form.icon} onChange={e => set('icon', e.target.value)}
                            placeholder="e.g. 🍜" className={inputCls} required maxLength={10} />
                    </Field>
                    <Field label="Weather tag" error={errors.weather_tag?.[0]}>
                        <select value={form.weather_tag} onChange={e => set('weather_tag', e.target.value)} className={inputCls}>
                            {WEATHER_TAGS.map(t => <option key={t} value={t}>{cap(t)}</option>)}
                        </select>
                    </Field>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-gray-600 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 transition-all">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ── Voucher Modal (dark) ───────────────────────────────────────────────────────

function VoucherModal({ mode, voucher, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === 'add' ? { ...EMPTY_VOUCHER } : {
            code:             voucher.code,
            type:             voucher.type,
            value:            voucher.value,
            min_order_amount: voucher.min_order_amount ?? '',
            max_uses:         voucher.max_uses ?? '',
            is_active:        voucher.is_active,
            expires_at:       voucher.expires_at ? String(voucher.expires_at).substring(0, 10) : '',
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
            const url    = mode === 'add' ? route('admin.vouchers.store') : route('admin.vouchers.update', voucher.id);
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
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
                <h2 className="text-base font-bold text-white mb-4">
                    {mode === 'add' ? 'Create site-wide voucher' : 'Edit voucher'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Field label="Code" error={errors.code?.[0]}>
                        <input type="text" value={form.code}
                            onChange={e => set('code', e.target.value.toUpperCase())}
                            placeholder="e.g. WELCOME20"
                            className={inputCls + ' uppercase tracking-widest font-mono'} required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type" error={errors.type?.[0]}>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed (₱)</option>
                            </select>
                        </Field>
                        <Field label={form.type === 'percentage' ? 'Value (%)' : 'Value (₱)'} error={errors.value?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.value}
                                onChange={e => set('value', e.target.value)} className={inputCls} required />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min order (₱)" error={errors.min_order_amount?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.min_order_amount}
                                onChange={e => set('min_order_amount', e.target.value)}
                                placeholder="None" className={inputCls} />
                        </Field>
                        <Field label="Max uses" error={errors.max_uses?.[0]}>
                            <input type="number" min="1" value={form.max_uses}
                                onChange={e => set('max_uses', e.target.value)}
                                placeholder="Unlimited" className={inputCls} />
                        </Field>
                    </div>
                    <Field label="Expires at" error={errors.expires_at?.[0]}>
                        <input type="date" value={form.expires_at}
                            onChange={e => set('expires_at', e.target.value)}
                            className={inputCls + ' [color-scheme:dark]'} />
                    </Field>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.is_active}
                            onChange={e => set('is_active', e.target.checked)}
                            className="w-4 h-4 accent-green-500" />
                        <span className="text-sm text-gray-300">Active</span>
                    </label>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-gray-600 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 transition-all">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ── Pending Section (dark) ─────────────────────────────────────────────────────

function PendingSection({ pending, onAction }) {
    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>
            <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-bold text-white">Pending approvals</h2>
                {pending.length > 0 && (
                    <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md border border-yellow-700/30">
                        {pending.length} waiting
                    </span>
                )}
            </motion.div>

            {pending.length === 0 ? (
                <motion.div variants={FADE_UP}
                    className="py-16 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-center">
                    <IcoCheck c="w-8 h-8 mx-auto text-green-600 mb-3" />
                    <p className="text-sm text-gray-500">All caught up — no pending restaurants.</p>
                </motion.div>
            ) : (
                <motion.div variants={STAGGER} className="space-y-3">
                    {pending.map(r => (
                        <motion.div key={r.id} variants={FADE_UP}
                            className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-5 flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-white text-sm truncate">{r.name}</span>
                                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 font-bold border border-yellow-700/30">
                                        pending
                                    </span>
                                </div>
                                <dl className="text-xs text-gray-400 space-y-1">
                                    <div><span className="text-gray-600">Category:</span>{' '}{r.category?.icon} {r.category?.name ?? '—'}</div>
                                    <div><span className="text-gray-600">Location:</span>{' '}{r.municipality}</div>
                                    <div>
                                        <span className="text-gray-600">Owner:</span>{' '}
                                        {r.owner?.name ?? '—'}
                                        {r.owner?.email && <span className="text-gray-600"> ({r.owner.email})</span>}
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Submitted:</span>{' '}
                                        {new Date(r.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </dl>
                                {r.description && (
                                    <p className="text-xs text-gray-600 italic mt-2 line-clamp-2">{r.description}</p>
                                )}
                            </div>
                            <div className="shrink-0 flex flex-col gap-2">
                                <button onClick={() => onAction(r, 'active')}
                                    className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 active:scale-[0.98] transition-all">
                                    Approve
                                </button>
                                <button onClick={() => onAction(r, 'rejected')}
                                    className="px-4 py-1.5 rounded-lg border border-red-700/50 text-red-400 text-xs font-bold hover:bg-red-500/10 active:scale-[0.98] transition-all">
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}

// ── Categories Section (dark) ──────────────────────────────────────────────────

function CategoriesSection({ categories, onAdd, onEdit, onDelete }) {
    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>
            <motion.div variants={FADE_UP} className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Food categories</h2>
                <button onClick={onAdd}
                    className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 active:scale-[0.98] transition-all">
                    + Add category
                </button>
            </motion.div>
            <motion.div variants={FADE_UP}
                className="bg-gray-800/80 border border-gray-700/50 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700/50">
                            <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Category</th>
                            <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Weather tag</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-5 py-10 text-center text-gray-600 text-sm">
                                    No categories yet.
                                </td>
                            </tr>
                        )}
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-700/20 transition-colors">
                                <td className="px-5 py-3">
                                    <span className="mr-2">{cat.icon}</span>
                                    <span className="font-semibold text-gray-200">{cat.name}</span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${WEATHER_BADGE[cat.weather_tag] ?? 'bg-gray-700/50 text-gray-400'}`}>
                                        {cap(cat.weather_tag)}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-4">
                                        <button onClick={() => onEdit(cat)} className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors">Edit</button>
                                        <button onClick={() => onDelete(cat)} className="text-xs text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}

// ── Vouchers Section (dark) ────────────────────────────────────────────────────

function VouchersSection({ vouchers, onAdd, onEdit, onDelete }) {
    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>
            <motion.div variants={FADE_UP} className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Site-wide vouchers</h2>
                <button onClick={onAdd}
                    className="px-4 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 active:scale-[0.98] transition-all">
                    + Create voucher
                </button>
            </motion.div>
            <motion.div variants={FADE_UP}
                className="bg-gray-800/80 border border-gray-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Code</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Discount</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden md:table-cell">Expiry</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Uses</th>
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {vouchers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-gray-600 text-sm">
                                        No site-wide vouchers yet.
                                    </td>
                                </tr>
                            )}
                            {vouchers.map(v => (
                                <tr key={v.id} className="hover:bg-gray-700/20 transition-colors">
                                    <td className="px-5 py-3 font-mono font-bold text-gray-200 text-xs tracking-wider">{v.code}</td>
                                    <td className="px-5 py-3">
                                        <span className="font-semibold text-gray-300">
                                            {v.type === 'percentage' ? `${v.value}% off` : `₱${Number(v.value).toFixed(2)} off`}
                                        </span>
                                        {v.min_order_amount && (
                                            <span className="block text-[10px] text-gray-600">
                                                min ₱{Number(v.min_order_amount).toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">
                                        {v.expires_at
                                            ? new Date(v.expires_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : <span className="text-gray-700">—</span>}
                                    </td>
                                    <td className="px-5 py-3 text-sm tabular-nums text-gray-400">
                                        {v.used_count ?? 0}{v.max_uses ? ` / ${v.max_uses}` : ''}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={[
                                            'text-[10px] px-2 py-0.5 rounded-md font-bold border',
                                            v.is_active
                                                ? 'bg-green-500/15 text-green-400 border-green-700/40'
                                                : 'bg-gray-700/50 text-gray-500 border-gray-600/40',
                                        ].join(' ')}>
                                            {v.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => onEdit(v)} className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors">Edit</button>
                                            <button onClick={() => onDelete(v)} className="text-xs text-red-500 hover:text-red-400 font-semibold transition-colors">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Backup Section (dark) ──────────────────────────────────────────────────────

function BackupSection({ lastBackup, backupFile, onBackup, loading }) {
    return (
        <motion.div initial="hidden" animate="show" variants={STAGGER}>
            <motion.h2 variants={FADE_UP} className="text-base font-bold text-white mb-5">Database backup</motion.h2>

            <motion.div variants={FADE_UP} className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-6 max-w-lg">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                        <IcoDB c="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Full database export</p>
                        <p className="text-xs text-gray-500">Creates a SQL dump of all tables</p>
                    </div>
                </div>

                <dl className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700/40">
                        <span className="text-gray-500">Last backup</span>
                        <span className="text-gray-300 font-medium">{lastBackup ?? 'Never'}</span>
                    </div>
                    {backupFile && (
                        <div className="flex justify-between py-2 border-b border-gray-700/40">
                            <span className="text-gray-500">File</span>
                            <span className="text-gray-400 font-mono text-xs truncate max-w-[200px]">{backupFile}</span>
                        </div>
                    )}
                </dl>

                <button
                    onClick={onBackup}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                    <IcoDB c="w-4 h-4" />
                    {loading ? 'Running backup…' : 'Run backup now'}
                </button>
            </motion.div>
        </motion.div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminDashboard({
    pendingRestaurants:    initialPending,
    categories:            initialCategories,
    vouchers:              initialVouchers,
    lastBackup:            initialLastBackup,
    lastBackupFile:        initialLastBackupFile,
    totalRestaurants       = 0,
    activeRestaurants      = 0,
    totalUsers             = 0,
    totalCustomers         = 0,
    totalOwners            = 0,
    totalOrders            = 0,
    totalRevenue           = 0,
    totalCompletedOrders   = 0,
    totalCancelledOrders   = 0,
    completionRate         = 0,
    cancellationRate       = 0,
    totalVouchersUsed      = 0,
    revenueSavedByVouchers = 0,
    totalClaimed           = 0,
    repeatCustomers        = 0,
    totalCustomersWithOrders = 0,
    retentionRate          = 0,
    restaurantGrowth       = [],
    customerGrowth         = [],
    ownerGrowth            = [],
    orderGrowth            = [],
    revenueGrowth          = [],
    voucherUsageGrowth     = [],
    ordersByStatus         = [],
    peakHoursData          = [],
    topVouchers            = [],
    topRestaurants         = [],
    topMenuItems           = [],
    ordersByMunicipality   = [],
}) {
    const [pending,       setPending]       = useState(initialPending);
    const [categories,    setCategories]    = useState(initialCategories);
    const [vouchers,      setVouchers]      = useState(initialVouchers);
    const [lastBackup,    setLastBackup]    = useState(initialLastBackup);
    const [backupFile,    setBackupFile]    = useState(initialLastBackupFile);

    const [activeSection,  setActiveSection]  = useState('overview');
    const [sidebarOpen,    setSidebarOpen]    = useState(false);
    const [timePeriod,     setTimePeriod]     = useState('month');
    const [categoryModal,  setCategoryModal]  = useState(null);
    const [voucherModal,   setVoucherModal]   = useState(null);
    const [backupLoading,  setBackupLoading]  = useState(false);
    const [toasts,         setToasts]         = useState([]);

    function addToast(msg, type = 'success') {
        setToasts(prev => [...prev, { id: Date.now(), msg, type }]);
    }
    function removeToast(id) {
        setToasts(prev => prev.filter(t => t.id !== id));
    }

    function handleNav(section) {
        setActiveSection(section);
        setSidebarOpen(false);
    }

    // ── Restaurant actions ──────────────────────────────────────────────────────

    async function handleRestaurantAction(restaurant, status) {
        try {
            await apiFetch(route('admin.restaurants.approve', restaurant.id), 'PATCH', { status });
            setPending(prev => prev.filter(r => r.id !== restaurant.id));
            addToast(`Restaurant ${status === 'active' ? 'approved' : 'rejected'}.`);
        } catch {
            addToast('Action failed. Please try again.', 'error');
        }
    }

    // ── Category actions ────────────────────────────────────────────────────────

    function handleCategorySaved(category, mode) {
        if (mode === 'add') setCategories(prev => [...prev, category]);
        else setCategories(prev => prev.map(c => c.id === category.id ? category : c));
        setCategoryModal(null);
        addToast(`Category ${mode === 'add' ? 'added' : 'updated'}.`);
    }

    async function handleCategoryDelete(category) {
        if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
        try {
            await apiFetch(route('admin.categories.destroy', category.id), 'DELETE');
            setCategories(prev => prev.filter(c => c.id !== category.id));
            addToast('Category deleted.');
        } catch (err) {
            addToast(err.data?.error ?? 'Cannot delete this category.', 'error');
        }
    }

    // ── Voucher actions ─────────────────────────────────────────────────────────

    function handleVoucherSaved(voucher, mode) {
        if (mode === 'add') setVouchers(prev => [...prev, voucher]);
        else setVouchers(prev => prev.map(v => v.id === voucher.id ? voucher : v));
        setVoucherModal(null);
        addToast(`Voucher ${mode === 'add' ? 'created' : 'updated'}.`);
    }

    async function handleVoucherDelete(voucher) {
        if (!confirm(`Delete voucher "${voucher.code}"?`)) return;
        try {
            await apiFetch(route('admin.vouchers.destroy', voucher.id), 'DELETE');
            setVouchers(prev => prev.filter(v => v.id !== voucher.id));
            addToast('Voucher deleted.');
        } catch {
            addToast('Cannot delete this voucher.', 'error');
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
            addToast('Database backup complete.');
        } catch {
            addToast('Backup failed. Check server logs.', 'error');
        } finally {
            setBackupLoading(false);
        }
    }

    const overviewProps = {
        timePeriod, setTimePeriod,
        totalRestaurants, activeRestaurants,
        totalUsers, totalCustomers, totalOwners,
        totalOrders, totalRevenue,
        totalCompletedOrders, totalCancelledOrders,
        completionRate, cancellationRate,
        totalVouchersUsed, revenueSavedByVouchers,
        totalClaimed, repeatCustomers,
        totalCustomersWithOrders, retentionRate,
        restaurantGrowth, customerGrowth, ownerGrowth,
        orderGrowth, revenueGrowth, voucherUsageGrowth,
        ordersByStatus, peakHoursData, topVouchers,
        topRestaurants, topMenuItems, ordersByMunicipality,
    };

    return (
        <>
            <Head title="Admin — Hapag">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div style={{ fontFamily: "'Outfit', system-ui, sans-serif" }} className="flex min-h-[100dvh] bg-gray-950">

                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <aside
                    className={[
                        'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col',
                        'transition-transform duration-300 ease-in-out',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                        'md:translate-x-0',
                    ].join(' ')}
                >
                    <Sidebar
                        active={activeSection}
                        onNav={handleNav}
                        pendingCount={pending.length}
                        onSignOut={() => router.post(route('logout'))}
                    />
                </aside>

                {/* Main content */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-[100dvh]">

                    {/* Top bar */}
                    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center gap-4 px-5 h-14">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <IcoMenu />
                        </button>

                        {/* Section title */}
                        <p className="text-sm font-semibold text-gray-300 hidden sm:block">
                            {activeSection === 'overview'   && 'Overview'}
                            {activeSection === 'pending'    && 'Pending approvals'}
                            {activeSection === 'categories' && 'Categories'}
                            {activeSection === 'vouchers'   && 'Vouchers'}
                            {activeSection === 'backup'     && 'Backup'}
                        </p>

                        <div className="flex-1" />

                        {/* Time filter (shown on overview) */}
                        {activeSection === 'overview' && (
                            <div className="flex gap-0.5 bg-gray-800 p-1 rounded-xl">
                                {TIME_PERIODS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setTimePeriod(p.id)}
                                        className={[
                                            'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                                            timePeriod === p.id
                                                ? 'bg-gray-700 text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-300',
                                        ].join(' ')}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Backup DB button */}
                        <button
                            onClick={handleBackup}
                            disabled={backupLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 text-xs font-semibold disabled:opacity-50 transition-all"
                        >
                            <IcoDB c="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{backupLoading ? 'Backing up…' : 'Backup DB'}</span>
                        </button>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-5 sm:p-6 overflow-auto">
                        <AnimatePresence mode="wait">
                            {activeSection === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                                    <OverviewSection {...overviewProps} />
                                </motion.div>
                            )}
                            {activeSection === 'pending' && (
                                <motion.div key="pending" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                                    <PendingSection pending={pending} onAction={handleRestaurantAction} />
                                </motion.div>
                            )}
                            {activeSection === 'categories' && (
                                <motion.div key="categories" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                                    <CategoriesSection
                                        categories={categories}
                                        onAdd={() => setCategoryModal({ mode: 'add' })}
                                        onEdit={cat => setCategoryModal({ mode: 'edit', category: cat })}
                                        onDelete={handleCategoryDelete}
                                    />
                                </motion.div>
                            )}
                            {activeSection === 'vouchers' && (
                                <motion.div key="vouchers" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                                    <VouchersSection
                                        vouchers={vouchers}
                                        onAdd={() => setVoucherModal({ mode: 'add' })}
                                        onEdit={v => setVoucherModal({ mode: 'edit', voucher: v })}
                                        onDelete={handleVoucherDelete}
                                    />
                                </motion.div>
                            )}
                            {activeSection === 'backup' && (
                                <motion.div key="backup" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}>
                                    <BackupSection
                                        lastBackup={lastBackup}
                                        backupFile={backupFile}
                                        onBackup={handleBackup}
                                        loading={backupLoading}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {categoryModal && (
                    <CategoryModal
                        key="cat-modal"
                        mode={categoryModal.mode}
                        category={categoryModal.category}
                        onClose={() => setCategoryModal(null)}
                        onSaved={handleCategorySaved}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {voucherModal && (
                    <VoucherModal
                        key="vou-modal"
                        mode={voucherModal.mode}
                        voucher={voucherModal.voucher}
                        onClose={() => setVoucherModal(null)}
                        onSaved={handleVoucherSaved}
                    />
                )}
            </AnimatePresence>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}
