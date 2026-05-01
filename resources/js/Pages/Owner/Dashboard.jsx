import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CSRF = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

const STATUS_META = {
    pending:   { label: 'Pending',   pill: 'bg-amber-100 text-amber-700 border border-amber-200'   },
    preparing: { label: 'Preparing', pill: 'bg-blue-100 text-blue-700 border border-blue-200'       },
    ready:     { label: 'Ready',     pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
};
const NEXT_STATUS = { pending: 'preparing', preparing: 'ready' };
const EMPTY_ITEM    = { name: '', description: '', price: '', category: '', image_url: '', is_available: true };
const EMPTY_VOUCHER = { code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', is_active: true, expires_at: '' };
const MUNICIPALITIES = ['Santa Cruz','Pagsanjan','Los Baños','Calamba','San Pablo','Bay','Nagcarlan','Pila'];

const inp = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all duration-150';

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

const NAV_ITEMS = [
    { key: 'overview', label: 'Overview',       icon: OverviewIcon  },
    { key: 'orders',   label: 'Orders',          icon: OrdersIcon    },
    { key: 'menu',     label: 'Menu Management', icon: MenuIcon      },
    { key: 'vouchers', label: 'Vouchers',         icon: VoucherIcon   },
    { key: 'history',  label: 'Order History',   icon: HistoryIcon   },
    { key: 'settings', label: 'Settings',         icon: SettingsIcon  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
function OverviewIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>;}
function OrdersIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;}
function MenuIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/></svg>;}
function VoucherIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"/></svg>;}
function HistoryIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;}
function SettingsIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;}
function BellIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>;}
function SparkleIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>;}
function TrendUpIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>;}
function ImageIcon({cls}){return<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>;}

// ─────────────────────────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure-SVG Line Chart
// ─────────────────────────────────────────────────────────────────────────────
function LineChart({ data, height = 160, color = '#22C55E' }) {
    if (!data || data.length < 2)
        return <div className="flex items-center justify-center text-gray-300 text-xs" style={{height}}>No data yet for this period</div>;
    const W=640, H=height, pad={t:12,r:12,b:30,l:44};
    const iW=W-pad.l-pad.r, iH=H-pad.t-pad.b;
    const vals=data.map(d=>d.value), mn=Math.min(...vals), mx=Math.max(...vals), rng=mx-mn||1;
    const px=i=>pad.l+(i/(data.length-1))*iW;
    const py=v=>pad.t+(1-(v-mn)/rng)*iH;
    const pts=data.map((d,i)=>[px(i),py(d.value)]);
    const poly=pts.map(([x,y])=>`${x},${y}`).join(' ');
    const area=`${pad.l},${pad.t+iH} `+pts.map(([x,y])=>`${x},${y}`).join(' ')+` ${pad.l+iW},${pad.t+iH}`;
    const gid=`g${color.replace('#','')}`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height}}>
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
                </linearGradient>
            </defs>
            {[0,.25,.5,.75,1].map(t=>{
                const y=pad.t+t*iH, v=mx-t*rng;
                return <g key={t}>
                    <line x1={pad.l} y1={y} x2={pad.l+iW} y2={y} stroke="#F1F5F9" strokeWidth="1"/>
                    <text x={pad.l-6} y={y+4} textAnchor="end" fontSize="9" fill="#94A3B8">
                        {v>=1000?`${(v/1000).toFixed(1)}k`:Math.round(v)}
                    </text>
                </g>;
            })}
            <polygon points={area} fill={`url(#${gid})`}/>
            <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            {pts.map(([x,y],i)=>(
                <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2.5"/>
                    {(data.length<=16) && <text x={x} y={H-8} textAnchor="middle" fontSize="9" fill="#94A3B8">{data[i].label}</text>}
                </g>
            ))}
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card — improved with icon slot & trend
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent='green', icon, trend }) {
    const styles = {
        green:  { wrap:'bg-white border-green-100',  icon:'bg-green-100 text-green-600',  val:'text-gray-900' },
        orange: { wrap:'bg-white border-orange-100', icon:'bg-orange-100 text-orange-500',val:'text-gray-900' },
        blue:   { wrap:'bg-white border-blue-100',   icon:'bg-blue-100 text-blue-500',    val:'text-gray-900' },
        amber:  { wrap:'bg-white border-amber-100',  icon:'bg-amber-100 text-amber-600',  val:'text-gray-900' },
        gray:   { wrap:'bg-white border-gray-200',   icon:'bg-gray-100 text-gray-400',    val:'text-gray-900' },
    };
    const s = styles[accent] ?? styles.gray;
    return (
        <div className={`${s.wrap} border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center justify-between">
                {icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.icon}`}>{icon}</div>}
                {trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-2xl font-extrabold leading-tight ${s.val}`}>{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_META[status]?.pill ?? 'bg-gray-100 text-gray-500'}`}>{STATUS_META[status]?.label ?? cap(status)}</span>;
}
function TypePill({ type }) {
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${type==='delivery'?'bg-orange-100 text-orange-600':'bg-blue-100 text-blue-600'}`}>{type==='delivery'?'DELIVERY':'PICKUP'}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Modal — now includes image_url field
// ─────────────────────────────────────────────────────────────────────────────
function ItemModal({ mode, item, restaurantId, restaurantName, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode==='add' ? {...EMPTY_ITEM}
            : { name:item.name, description:item.description??'', price:item.price, category:item.category, image_url:item.image_url??'', is_available:item.is_available }
    );
    const [errors,setErrors]=useState({});
    const [processing,setProcessing]=useState(false);
    const [aiLoading,setAiLoading]=useState(false);
    const [aiError,setAiError]=useState('');
    const set=(k,v)=>setForm(p=>({...p,[k]:v}));

    async function handleSubmit(e) {
        e.preventDefault(); setErrors({}); setProcessing(true);
        try {
            const url=mode==='add'?route('owner.items.store'):route('owner.items.update',item.id);
            const method=mode==='add'?'POST':'PATCH';
            const body=mode==='add'?{...form,restaurant_id:restaurantId}:form;
            const data=await apiFetch(url,method,body);
            onSaved(data.item,mode);
        } catch(err){if(err.status===422)setErrors(err.data?.errors??{});}
        finally{setProcessing(false);}
    }

    async function generateDescription() {
        if(!form.name||!form.category){setAiError('Fill in name and category first.');return;}
        setAiError(''); setAiLoading(true);
        try {
            const data=await apiFetch(route('owner.ai.describe'),'POST',{name:form.name,category:form.category,restaurant_name:restaurantName});
            set('description',data.description??'');
        } catch{setAiError('AI unavailable. Try again.');}
        finally{setAiLoading(false);}
    }

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-extrabold text-gray-800">{mode==='add'?'+ Add Menu Item':'Edit Menu Item'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Item Name *" error={errors.name?.[0]}>
                        <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} className={inp} placeholder="e.g. Sinigang na Baboy" required/>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Category *" error={errors.category?.[0]}>
                            <input type="text" value={form.category} onChange={e=>set('category',e.target.value)} className={inp} placeholder="e.g. Soups" required/>
                        </Field>
                        <Field label="Price (₱) *" error={errors.price?.[0]}>
                            <input type="number" step="0.01" min="0" value={form.price} onChange={e=>set('price',e.target.value)} className={inp} required/>
                        </Field>
                    </div>

                    {/* Image URL with preview */}
                    <Field label="Photo URL" error={errors.image_url?.[0]}>
                        <input type="url" value={form.image_url} onChange={e=>set('image_url',e.target.value)} className={inp} placeholder="https://…"/>
                        {form.image_url && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 h-28 bg-gray-50">
                                <img src={form.image_url} alt="preview" className="w-full h-full object-cover"
                                     onError={e=>{e.target.style.display='none';}}/>
                            </div>
                        )}
                    </Field>

                    <Field label="Description" error={errors.description?.[0]}>
                        <div className="relative">
                            <textarea value={form.description} onChange={e=>set('description',e.target.value)}
                                      className={inp+' resize-none pr-28'} rows={3} placeholder="Short appetizing description…"/>
                            <button type="button" onClick={generateDescription} disabled={aiLoading}
                                    className="absolute right-2 bottom-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-60 transition-colors">
                                <SparkleIcon cls="w-3.5 h-3.5"/>
                                {aiLoading?'Writing…':'AI Write'}
                            </button>
                        </div>
                        {aiError&&<p className="text-xs text-red-500 mt-1">{aiError}</p>}
                    </Field>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.is_available} onChange={e=>set('is_available',e.target.checked)}
                               className="rounded border-gray-300 text-green-500 focus:ring-green-400"/>
                        <span className="text-sm text-gray-700">Available now</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing}
                                className="px-5 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors">
                            {processing?'Saving…':mode==='add'?'Add Item':'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Voucher Modal
// ─────────────────────────────────────────────────────────────────────────────
function VoucherModal({ mode, voucher, restaurantId, onClose, onSaved }) {
    const [form,setForm]=useState(mode==='add'?{...EMPTY_VOUCHER}:{code:voucher.code,type:voucher.type,value:voucher.value,min_order_amount:voucher.min_order_amount??'',max_uses:voucher.max_uses??'',is_active:voucher.is_active,expires_at:voucher.expires_at?voucher.expires_at.slice(0,10):''});
    const [errors,setErrors]=useState({});
    const [processing,setProcessing]=useState(false);
    const set=(k,v)=>setForm(p=>({...p,[k]:v}));

    async function handleSubmit(e) {
        e.preventDefault(); setErrors({}); setProcessing(true);
        try {
            const url=mode==='add'?route('owner.vouchers.store'):route('owner.vouchers.update',voucher.id);
            const data=await apiFetch(url,mode==='add'?'POST':'PATCH',{...form,restaurant_id:restaurantId});
            onSaved(data.voucher,mode);
        } catch(err){if(err.status===422)setErrors(err.data?.errors??{});}
        finally{setProcessing(false);}
    }

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-extrabold text-gray-800">{mode==='add'?'Create Voucher':'Edit Voucher'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <Field label="Code *" error={errors.code?.[0]}>
                        <input type="text" value={form.code} onChange={e=>set('code',e.target.value.toUpperCase())} className={inp} placeholder="SAVE20" required/>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type *"><select value={form.type} onChange={e=>set('type',e.target.value)} className={inp}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₱)</option></select></Field>
                        <Field label={form.type==='percentage'?'Value (%)':'Value (₱)'} error={errors.value?.[0]}>
                            <input type="number" step="0.01" min="0" max={form.type==='percentage'?100:undefined} value={form.value} onChange={e=>set('value',e.target.value)} className={inp} required/>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Min. Order (₱)"><input type="number" step="0.01" min="0" value={form.min_order_amount} onChange={e=>set('min_order_amount',e.target.value)} className={inp} placeholder="Optional"/></Field>
                        <Field label="Max Uses"><input type="number" min="1" value={form.max_uses} onChange={e=>set('max_uses',e.target.value)} className={inp} placeholder="Unlimited"/></Field>
                    </div>
                    <Field label="Expires At"><input type="date" value={form.expires_at} onChange={e=>set('expires_at',e.target.value)} className={inp}/></Field>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} className="rounded border-gray-300 text-green-500 focus:ring-green-400"/>
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors">{processing?'Saving…':'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Card
// ─────────────────────────────────────────────────────────────────────────────
function OrderCard({ order, onAdvance }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-gray-800">Order #{order.id}</span>
                    <TypePill type={order.order_type}/>
                    <StatusPill status={order.status}/>
                </div>
                <span className="text-xs text-gray-400">{fmtD(order.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">{order.user?.name??'Customer'}</span>
                {order.user?.municipality&&<span className="text-gray-400 text-xs ml-1">· {order.user.municipality}</span>}
            </p>
            {order.order_type==='delivery'&&order.delivery_address&&(
                <div className="inline-flex items-start gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5 mb-3">
                    <span>📍</span><span>{order.delivery_address}</span>
                </div>
            )}
            <ul className="text-xs text-gray-500 space-y-0.5 mb-3">
                {order.items?.map(oi=>(
                    <li key={oi.id}>×{oi.quantity} {oi.menu_item?.name??'Item'} <span className="text-gray-400">— ₱{fmt(oi.unit_price*oi.quantity)}</span></li>
                ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="text-sm">
                    <span className="text-gray-500">Total </span>
                    <span className="font-extrabold text-gray-800">₱{fmt(order.final_amount??order.total_amount)}</span>
                    {Number(order.delivery_fee)>0&&<span className="text-xs text-gray-400 ml-1">(+₱{fmt(order.delivery_fee)} delivery)</span>}
                </div>
                {onAdvance&&NEXT_STATUS[order.status]?(
                    <button onClick={()=>onAdvance(order)}
                            className="px-4 py-1.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors">
                        Mark as {cap(NEXT_STATUS[order.status])}
                    </button>
                ):order.status==='ready'?(
                    <span className="text-xs font-semibold text-green-600">✓ Ready for {order.order_type==='delivery'?'dispatch':'pickup'}</span>
                ):null}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Overview — improved layout & visuals
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ restaurant }) {
    const orders   = restaurant.orders    ?? [];
    const items    = restaurant.menu_items ?? [];
    const [incomeRange, setIncomeRange] = useState('today');

    const hourlySales = useMemo(()=>{
        const today=new Date().toDateString();
        const b=Array.from({length:24},(_,h)=>({label:`${h}h`,value:0}));
        orders.forEach(o=>{const d=new Date(o.created_at);if(d.toDateString()===today)b[d.getHours()].value+=Number(o.final_amount??0);});
        let s=0;while(s<16&&b[s].value===0)s++;
        return b.slice(Math.min(s,8));
    },[orders]);

    const incomeData = useMemo(()=>{
        const now=new Date();
        const filt=o=>{const d=new Date(o.created_at);if(incomeRange==='today')return d.toDateString()===now.toDateString();if(incomeRange==='week')return(now-d)<7*86400000;if(incomeRange==='month')return(now-d)<30*86400000;return true;};
        const filtered=orders.filter(filt);
        if(incomeRange==='today'){const b=Array.from({length:24},(_,h)=>({label:`${h}h`,value:0}));filtered.forEach(o=>{b[new Date(o.created_at).getHours()].value+=Number(o.final_amount??0);});let s=0;while(s<16&&b[s].value===0)s++;return b.slice(Math.min(s,8));}
        if(incomeRange==='week'){const b=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(6-i));return{label:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],value:0,date:d.toDateString()};});filtered.forEach(o=>{const bk=b.find(x=>x.date===new Date(o.created_at).toDateString());if(bk)bk.value+=Number(o.final_amount??0);});return b;}
        if(incomeRange==='month'){const b=Array.from({length:30},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(29-i));return{label:d.getDate().toString(),value:0,date:d.toDateString()};});filtered.forEach(o=>{const bk=b.find(x=>x.date===new Date(o.created_at).toDateString());if(bk)bk.value+=Number(o.final_amount??0);});return b;}
        const months={};filtered.forEach(o=>{const d=new Date(o.created_at);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months[k]=(months[k]??0)+Number(o.final_amount??0);});
        return Object.entries(months).sort().map(([k,v])=>({label:k.slice(5),value:v}));
    },[orders,incomeRange]);

    const today       = new Date().toDateString();
    const todayTotal  = orders.filter(o=>new Date(o.created_at).toDateString()===today).reduce((s,o)=>s+Number(o.final_amount??0),0);
    const totalIncome = orders.reduce((s,o)=>s+Number(o.final_amount??0),0);
    const pending     = orders.filter(o=>o.status==='pending').length;
    const available   = items.filter(i=>i.is_available).length;

    const RANGES=[{k:'today',label:'Today'},{k:'week',label:'This Week'},{k:'month',label:'This Month'},{k:'all',label:'All Time'}];

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Good day 👋</p>
                    <h2 className="text-xl font-extrabold">{restaurant.name}</h2>
                    <p className="text-green-100 text-sm mt-0.5">{restaurant.municipality} · {restaurant.status === 'active' ? '🟢 Open' : '🔴 Closed'}</p>
                </div>
                <div className="text-right">
                    <p className="text-green-100 text-xs">Today's Revenue</p>
                    <p className="text-3xl font-extrabold">₱{fmt(todayTotal)}</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Income"   value={`₱${fmt(totalIncome)}`} sub="All-time revenue"  accent="green"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>}/>
                <StatCard label="Total Orders"   value={orders.length}           sub="All-time orders"  accent="blue"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}/>
                <StatCard label="Pending Orders" value={pending}                 sub="Need attention"   accent={pending>0?'amber':'gray'}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}/>
                <StatCard label="Menu Items"     value={`${available}/${items.length}`} sub="Available items" accent="orange"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/></svg>}/>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Daily sales */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h3 className="text-sm font-extrabold text-gray-800">Daily Sales</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 pl-4">Hourly revenue — spot your peak hours</p>
                    <LineChart data={hourlySales} height={160} color="#22C55E"/>
                </div>

                {/* Income chart */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <h3 className="text-sm font-extrabold text-gray-800">Total Income</h3>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {RANGES.map(r=>(
                                <button key={r.k} onClick={()=>setIncomeRange(r.k)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${incomeRange===r.k?'bg-orange-400 text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 pl-4">Revenue breakdown by period</p>
                    <LineChart data={incomeData} height={160} color="#F97316"/>
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-gray-800">Recent Orders</h3>
                    <span className="text-xs text-gray-400">{orders.length} total</span>
                </div>
                {orders.length===0
                    ? <p className="text-xs text-gray-400 text-center py-10">No orders yet.</p>
                    : <div className="divide-y divide-gray-50">
                        {orders.slice(0,6).map(o=>(
                            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-extrabold text-gray-500 w-8">#{o.id}</span>
                                    <TypePill type={o.order_type}/>
                                    <StatusPill status={o.status}/>
                                    <span className="text-xs text-gray-500 hidden sm:inline">{o.user?.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">{fmtD(o.created_at)}</span>
                                    <span className="text-sm font-extrabold text-gray-800">₱{fmt(o.final_amount??o.total_amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Orders
// ─────────────────────────────────────────────────────────────────────────────
function OrdersTab({ restaurant, onAdvance }) {
    const orders=restaurant.orders??[];
    const [filter,setFilter]=useState('pending');
    const counts={pending:orders.filter(o=>o.status==='pending').length,preparing:orders.filter(o=>o.status==='preparing').length,ready:orders.filter(o=>o.status==='ready').length};
    const FILTERS=[{k:'pending',label:`Pending (${counts.pending})`},{k:'preparing',label:`Preparing (${counts.preparing})`},{k:'ready',label:`Ready (${counts.ready})`},{k:'all',label:`All (${orders.length})`}];
    const visible=filter==='all'?orders:orders.filter(o=>o.status===filter);
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f=>(
                    <button key={f.k} onClick={()=>setFilter(f.k)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter===f.k?'bg-green-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {f.label}
                    </button>
                ))}
            </div>
            {visible.length===0
                ?<div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16"><p className="text-gray-400 text-sm">No orders here.</p></div>
                :<div className="space-y-3">{visible.map(o=><OrderCard key={o.id} order={o} onAdvance={onAdvance}/>)}</div>
            }
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Menu Management — CARD view with product photos
// ─────────────────────────────────────────────────────────────────────────────
function MenuTab({ restaurant, onToggle, onDelete, onOpenAdd, onOpenEdit }) {
    const menuItems=restaurant.menu_items??[];
    const [catFilter,setCatFilter]=useState('all');
    const [view,setView]=useState('card'); // 'card' | 'list'

    const categories=useMemo(()=>[...new Set(menuItems.map(i=>i.category))].sort(),[menuItems]);
    const visible=catFilter==='all'?menuItems:menuItems.filter(i=>i.category===catFilter);
    const grouped=useMemo(()=>{const g={};visible.forEach(i=>{if(!g[i.category])g[i.category]=[];g[i.category].push(i);});return g;},[visible]);

    // Placeholder gradient based on category name
    const catColor = cat => {
        const colors = ['from-green-400 to-emerald-500','from-orange-400 to-amber-500','from-blue-400 to-cyan-500','from-purple-400 to-violet-500','from-rose-400 to-pink-500','from-teal-400 to-green-500'];
        let h=0; for(let c of (cat||'')) h=(h*31+c.charCodeAt(0))%colors.length;
        return colors[Math.abs(h)%colors.length];
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={()=>setCatFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${catFilter==='all'?'bg-green-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        All ({menuItems.length})
                    </button>
                    {categories.map(c=>(
                        <button key={c} onClick={()=>setCatFilter(c)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${catFilter===c?'bg-green-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        <button onClick={()=>setView('card')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view==='card'?'bg-white shadow-sm text-gray-800':'text-gray-500'}`}>
                            ⊞ Cards
                        </button>
                        <button onClick={()=>setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view==='list'?'bg-white shadow-sm text-gray-800':'text-gray-500'}`}>
                            ☰ List
                        </button>
                    </div>
                    <button onClick={onOpenAdd}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                        <span className="text-base leading-none">+</span> Add Menu Item
                    </button>
                </div>
            </div>

            {Object.keys(grouped).length===0
                ?<div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16">
                    <div className="text-center"><p className="text-gray-400 text-sm mb-2">No menu items yet.</p><button onClick={onOpenAdd} className="text-green-500 text-sm font-bold hover:underline">+ Add your first item</button></div>
                 </div>
                : view==='card'
                    /* ── CARD VIEW ── */
                    ? <div className="space-y-6">
                        {Object.entries(grouped).map(([cat,items])=>(
                            <div key={cat}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">{cat}</span>
                                    <div className="flex-1 border-t border-gray-100"/>
                                    <span className="text-xs text-gray-400">{items.length} item{items.length!==1?'s':''}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {items.map(item=>(
                                        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 group">
                                            {/* Photo */}
                                            <div className="relative h-36 overflow-hidden">
                                                {item.image_url
                                                    ?<img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/>
                                                    :null
                                                }
                                                <div className={`${item.image_url?'hidden':'flex'} w-full h-full bg-gradient-to-br ${catColor(cat)} items-center justify-center`}>
                                                    <span className="text-4xl opacity-80">🍽️</span>
                                                </div>
                                                {/* Available badge overlay */}
                                                <div className="absolute top-2 right-2">
                                                    <button onClick={()=>onToggle(item)}
                                                            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition-colors ${item.is_available?'bg-green-500 text-white hover:bg-green-600':'bg-red-600 text-white hover:bg-red-700'}`}>
                                                        {item.is_available?'● Available':'○ Sold Out'}
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="p-3.5">
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-1">{item.name}</p>
                                                    <p className="font-extrabold text-green-600 text-sm whitespace-nowrap">₱{fmt(item.price)}</p>
                                                </div>
                                                {item.description&&<p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>}
                                                <div className="flex gap-2 mt-auto">
                                                    <button onClick={()=>onOpenEdit(item)}
                                                            className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                                    <button onClick={()=>onDelete(item)}
                                                            className="flex-1 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    /* ── LIST VIEW ── */
                    : <div className="space-y-4">
                        {Object.entries(grouped).map(([cat,items])=>(
                            <div key={cat} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">{cat}</span>
                                    <span className="text-xs text-gray-400">{items.length} item{items.length!==1?'s':''}</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {items.map(item=>(
                                        <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.image_url
                                                    ?<img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/>
                                                    :null
                                                }
                                                <div className={`${item.image_url?'hidden':'flex'} w-full h-full bg-gradient-to-br ${catColor(cat)} items-center justify-center text-xl`}>🍽️</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                                {item.description&&<p className="text-xs text-gray-400 truncate">{item.description}</p>}
                                            </div>
                                            <p className="font-bold text-gray-800 text-sm whitespace-nowrap">₱{fmt(item.price)}</p>
                                            <button onClick={()=>onToggle(item)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${item.is_available?'bg-green-100 text-green-700 hover:bg-green-200':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                                {item.is_available?'● Available':'○ Sold Out'}
                                            </button>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={()=>onOpenEdit(item)} className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                                <button onClick={()=>onDelete(item)} className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Vouchers
// ─────────────────────────────────────────────────────────────────────────────
function VouchersTab({ restaurant, onOpenAdd, onOpenEdit, onDelete }) {
    const vouchers=restaurant.vouchers??[];
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{vouchers.length} voucher{vouchers.length!==1?'s':''}</p>
                <button onClick={onOpenAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                    <span className="text-base leading-none">+</span> Create Voucher
                </button>
            </div>
            {vouchers.length===0
                ?<div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16"><p className="text-gray-400 text-sm">No vouchers yet.</p></div>
                :<div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
                            {vouchers.map(v=>(
                                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3"><span className="font-bold text-gray-800 tracking-widest font-mono text-xs">{v.code}</span></td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{v.type==='percentage'?`${Number(v.value)}% off`:`₱${fmt(v.value)} off`}{v.min_order_amount&&<span className="text-xs text-gray-400 ml-1">(min ₱{Number(v.min_order_amount).toFixed(0)})</span>}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{v.expires_at?new Date(v.expires_at).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):<span className="text-gray-300">No expiry</span>}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 text-center hidden md:table-cell">{v.used_count??0}/{v.max_uses??'∞'}</td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.is_active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>{v.is_active?'Active':'Inactive'}</span></td>
                                    <td className="px-4 py-3"><div className="flex items-center gap-2 justify-end">
                                        <button onClick={()=>onOpenEdit(v)} className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Edit</button>
                                        <button onClick={()=>onDelete(v)} className="px-2.5 py-1 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete</button>
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Order History
// ─────────────────────────────────────────────────────────────────────────────
function HistoryTab({ restaurant }) {
    const orders=restaurant.orders??[];
    const [statusFilter,setStatusFilter]=useState('all');
    const [typeFilter,setTypeFilter]=useState('all');
    const [search,setSearch]=useState('');
    const visible=orders.filter(o=>{
        if(statusFilter!=='all'&&o.status!==statusFilter)return false;
        if(typeFilter!=='all'&&o.order_type!==typeFilter)return false;
        if(search&&!`${o.id} ${o.user?.name??''}`.toLowerCase().includes(search.toLowerCase()))return false;
        return true;
    });
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or order #…"
                       className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 w-48"/>
                <div className="flex gap-1.5 flex-wrap">
                    {['all','pending','preparing','ready'].map(s=>(
                        <button key={s} onClick={()=>setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${statusFilter===s?'bg-green-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {s==='all'?'All Status':cap(s)}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {['all','pickup','delivery'].map(t=>(
                        <button key={t} onClick={()=>setTypeFilter(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${typeFilter===t?'bg-orange-400 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {t==='all'?'All Types':cap(t)}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-400">{visible.length} order{visible.length!==1?'s':''} found</p>
            {visible.length===0
                ?<div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-16"><p className="text-gray-400 text-sm">No orders match.</p></div>
                :<div className="space-y-3">{visible.map(o=><OrderCard key={o.id} order={o} onAdvance={null}/>)}</div>
            }
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Settings
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab({ restaurant }) {
    const [form,setForm]=useState({name:restaurant.name??'',description:restaurant.description??'',municipality:restaurant.municipality??'',address:restaurant.address??'',image_url:restaurant.image_url??'',opening_time:restaurant.opening_time??'',closing_time:restaurant.closing_time??''});
    const [saving,setSaving]=useState(false);
    const [success,setSuccess]=useState(false);
    const [errors,setErrors]=useState({});
    const set=(k,v)=>{setForm(p=>({...p,[k]:v}));setSuccess(false);};

    async function handleSave(e) {
        e.preventDefault();setErrors({});setSaving(true);setSuccess(false);
        try{await apiFetch(route('owner.settings.update',restaurant.id),'PATCH',form);setSuccess(true);}
        catch(err){if(err.status===422)setErrors(err.data?.errors??{});}
        finally{setSaving(false);}
    }

    return (
        <div className="max-w-xl space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-extrabold text-gray-800 mb-5">Restaurant Settings</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <Field label="Restaurant Name *" error={errors.name?.[0]}><input type="text" value={form.name} onChange={e=>set('name',e.target.value)} className={inp} required/></Field>
                    <Field label="Description" error={errors.description?.[0]}><textarea value={form.description} onChange={e=>set('description',e.target.value)} className={inp+' resize-none'} rows={3} placeholder="Brief description…"/></Field>
                    <Field label="Municipality *" error={errors.municipality?.[0]}><select value={form.municipality} onChange={e=>set('municipality',e.target.value)} className={inp} required><option value="">Select municipality…</option>{MUNICIPALITIES.map(m=><option key={m} value={m}>{m}</option>)}</select></Field>
                    <Field label="Address / Landmark" error={errors.address?.[0]}><input type="text" value={form.address} onChange={e=>set('address',e.target.value)} className={inp} placeholder="e.g. Near SM City, Brgy. Poblacion"/></Field>
                    <Field label="Cover Image URL" error={errors.image_url?.[0]}><input type="url" value={form.image_url} onChange={e=>set('image_url',e.target.value)} className={inp} placeholder="https://…"/></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Opening Time"><input type="time" value={form.opening_time} onChange={e=>set('opening_time',e.target.value)} className={inp}/></Field>
                        <Field label="Closing Time"><input type="time" value={form.closing_time} onChange={e=>set('closing_time',e.target.value)} className={inp}/></Field>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors">{saving?'Saving…':'Save Changes'}</button>
                        {success&&<span className="text-xs font-semibold text-green-600">✓ Saved successfully!</span>}
                    </div>
                </form>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-3">Quick Info</h3>
                <div className="space-y-2 text-sm">
                    {[['Status',<span className={`font-bold ${restaurant.status==='active'?'text-green-600':'text-yellow-600'}`}>{cap(restaurant.status)}</span>],['Location',restaurant.municipality],['Hours',restaurant.opening_time?`${restaurant.opening_time} – ${restaurant.closing_time}`:'—'],['Menu Items',restaurant.menu_items?.length??0]].map(([k,v])=>(
                        <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-semibold text-gray-700">{v}</span></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function OwnerDashboard({ restaurants: initialRestaurants }) {
    const [restaurants,setRestaurants]   = useState(initialRestaurants);
    const [selectedId,setSelectedId]     = useState(initialRestaurants[0]?.id??null);
    const [activeTab,setActiveTab]       = useState('overview');
    const [sidebarOpen,setSidebarOpen]   = useState(false);
    const [itemModal,setItemModal]       = useState(null);
    const [voucherModal,setVoucherModal] = useState(null);

    const restaurant = restaurants.find(r=>r.id===selectedId)??restaurants[0]??null;

    if (!restaurant) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 text-sm">No restaurant data found.</p></div>;

    function patchRestaurant(fn) { setRestaurants(prev=>prev.map(r=>r.id===restaurant.id?fn(r):r)); }

    async function toggleItem(item) {
        try { const d=await apiFetch(route('owner.items.toggle',item.id),'PATCH'); patchRestaurant(r=>({...r,menu_items:r.menu_items.map(i=>i.id===item.id?{...i,is_available:d.is_available}:i)})); } catch{}
    }
    async function deleteItem(item) {
        if(!confirm(`Delete "${item.name}"?`))return;
        try { await apiFetch(route('owner.items.destroy',item.id),'DELETE'); patchRestaurant(r=>({...r,menu_items:r.menu_items.filter(i=>i.id!==item.id)})); } catch(e){if(e?.data?.error)alert(e.data.error);}
    }
    function onItemSaved(saved,mode) {
        patchRestaurant(r=>({...r,menu_items:mode==='add'?[...r.menu_items,saved]:r.menu_items.map(i=>i.id===saved.id?saved:i)}));
        setItemModal(null);
    }
    async function advanceStatus(order) {
        const next=NEXT_STATUS[order.status]; if(!next)return;
        try { const d=await apiFetch(route('owner.orders.status',order.id),'PATCH',{status:next}); patchRestaurant(r=>({...r,orders:r.orders.map(o=>o.id===order.id?{...o,status:d.status}:o)})); } catch{}
    }
    async function deleteVoucher(v) {
        if(!confirm(`Delete voucher "${v.code}"?`))return;
        try { await apiFetch(route('owner.vouchers.destroy',v.id),'DELETE'); patchRestaurant(r=>({...r,vouchers:r.vouchers.filter(vch=>vch.id!==v.id)})); } catch{}
    }
    function onVoucherSaved(saved,mode) {
        patchRestaurant(r=>({...r,vouchers:mode==='add'?[saved,...r.vouchers]:r.vouchers.map(v=>v.id===saved.id?saved:v)}));
        setVoucherModal(null);
    }

    const pendingCount=(restaurant.orders??[]).filter(o=>o.status==='pending').length;

    function renderTab() {
        switch(activeTab) {
            case 'overview': return <OverviewTab restaurant={restaurant}/>;
            case 'orders':   return <OrdersTab restaurant={restaurant} onAdvance={advanceStatus}/>;
            case 'menu':     return <MenuTab restaurant={restaurant} onToggle={toggleItem} onDelete={deleteItem} onOpenAdd={()=>setItemModal('add')} onOpenEdit={item=>setItemModal(item)}/>;
            case 'vouchers': return <VouchersTab restaurant={restaurant} onOpenAdd={()=>setVoucherModal('add')} onOpenEdit={v=>setVoucherModal(v)} onDelete={deleteVoucher}/>;
            case 'history':  return <HistoryTab restaurant={restaurant}/>;
            case 'settings': return <SettingsTab restaurant={restaurant}/>;
            default: return null;
        }
    }

    const activeLabel=NAV_ITEMS.find(n=>n.key===activeTab)?.label??'';

    return (
        <>
            <Head title={`${restaurant.name} — Dashboard`}/>
            <div className="min-h-screen bg-slate-50 flex">

                {/* Mobile overlay */}
                {sidebarOpen&&<div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

                {/* ── Sidebar ── */}
                <aside className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

                    {/* Logo */}
                    <div className="h-16 flex items-center px-5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white text-base">🍽️</div>
                            <span className="text-lg font-extrabold text-gray-800 tracking-tight">Hapag</span>
                        </div>
                    </div>

                    {/* Owner info */}
                    <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-3 text-xl shadow-sm">👨‍🍳</div>
                        <p className="text-sm font-extrabold text-gray-800 leading-snug">{restaurant.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${restaurant.status==='active'?'bg-green-500':'bg-gray-300'}`}/>
                            {restaurant.municipality}
                        </p>

                        {restaurants.length>1&&(
                            <select value={selectedId} onChange={e=>{setSelectedId(Number(e.target.value));setActiveTab('overview');}}
                                    className="mt-3 w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:border-green-400">
                                {restaurants.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        <p className="px-3 pt-1 pb-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Menu</p>
                        {NAV_ITEMS.map(({key,label,icon:Icon})=>{
                            const active=activeTab===key;
                            return (
                                <button key={key} onClick={()=>{setActiveTab(key);setSidebarOpen(false);}}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${active?'bg-green-50 text-green-700':'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                                    <Icon cls={`w-[18px] h-[18px] flex-shrink-0 ${active?'text-green-600':''}`}/>
                                    <span>{label}</span>
                                    {key==='orders'&&pendingCount>0&&(
                                        <span className="ml-auto bg-orange-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">{pendingCount}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="px-3 py-4 border-t border-gray-100">
                        <button onClick={()=>router.post(route('logout'))}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top bar */}
                    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={()=>setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
                            </button>
                            <div>
                                <h1 className="text-base font-extrabold text-gray-800 leading-tight">{activeLabel}</h1>
                                <p className="text-xs text-gray-400 hidden sm:block">{restaurant.name} · {restaurant.municipality}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pendingCount>0&&(
                                <button onClick={()=>setActiveTab('orders')}
                                        className="relative p-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                                    <BellIcon cls="w-5 h-5 text-orange-500"/>
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">{pendingCount}</span>
                                </button>
                            )}
                            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${restaurant.status==='active'?'bg-green-50 text-green-700 border-green-200':'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${restaurant.status==='active'?'bg-green-500':'bg-yellow-500'}`}/>
                                {cap(restaurant.status)}
                            </span>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
                        {renderTab()}
                    </main>
                </div>
            </div>

            {/* Modals */}
            {itemModal!==null&&<ItemModal mode={itemModal==='add'?'add':'edit'} item={itemModal==='add'?null:itemModal} restaurantId={restaurant.id} restaurantName={restaurant.name} onClose={()=>setItemModal(null)} onSaved={onItemSaved}/>}
            {voucherModal!==null&&<VoucherModal mode={voucherModal==='add'?'add':'edit'} voucher={voucherModal==='add'?null:voucherModal} restaurantId={restaurant.id} onClose={()=>setVoucherModal(null)} onSaved={onVoucherSaved}/>}
        </>
    );
}