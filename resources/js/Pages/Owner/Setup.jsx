import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

const MUNICIPALITIES = [
    'Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba',
    'San Pablo', 'Bay', 'Nagcarlan', 'Pila',
];

const inputCls = [
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white',
    'text-sm text-gray-800 placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    'transition-colors disabled:bg-gray-50 disabled:text-gray-400',
].join(' ');

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}

export default function OwnerSetup({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name:         '',
        description:  '',
        category_id:  '',
        municipality: '',
        image_url:    '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('owner.setup.store'));
    }

    return (
        <GuestLayout>
            <Head title="Register Your Restaurant — Hapag" />

            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-gray-800">Register Your Restaurant</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Fill in the details below. Your restaurant will be reviewed before it goes live.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <Field label="Restaurant Name" error={errors.name}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Bida Burger — San Pablo"
                        required
                    />
                </Field>

                <Field label="Description" error={errors.description}>
                    <textarea
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        className={inputCls + ' resize-none'}
                        rows={3}
                        placeholder="A short description of your restaurant (optional)"
                    />
                </Field>

                <Field label="Category" error={errors.category_id}>
                    <select
                        value={data.category_id}
                        onChange={e => setData('category_id', e.target.value)}
                        className={inputCls}
                        required
                    >
                        <option value="">— Select a category —</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Municipality" error={errors.municipality}>
                    <select
                        value={data.municipality}
                        onChange={e => setData('municipality', e.target.value)}
                        className={inputCls}
                        required
                    >
                        <option value="">— Select municipality —</option>
                        {MUNICIPALITIES.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Cover Image URL" error={errors.image_url}>
                    <input
                        type="url"
                        value={data.image_url}
                        onChange={e => setData('image_url', e.target.value)}
                        className={inputCls}
                        placeholder="https://... (optional)"
                    />
                </Field>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Submitting…' : 'Submit for Review'}
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                    Your restaurant will appear on the platform once an admin approves it.
</p>

            </form>
        </GuestLayout>
    );
}
