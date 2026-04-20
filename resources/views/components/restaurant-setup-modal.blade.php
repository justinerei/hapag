@auth
@if(auth()->user()->role === 'owner')
@php $setupCategories = \App\Models\Category::orderBy('name')->get(); @endphp

{{-- ══════════════════════════════════════════════════════════════════════════
     Restaurant Setup Modal — split-panel registration form for new owners
     Include once in the authenticated layout: <x-restaurant-setup-modal />
     Trigger from anywhere: openRestaurantSetupModal()
══════════════════════════════════════════════════════════════════════════ --}}

<div id="rsetup-modal-overlay"
     class="fixed inset-0 z-[200] hidden"
     role="dialog" aria-modal="true" aria-labelledby="rsetup-modal-title">

    {{-- Backdrop --}}
    <div id="rsetup-modal-backdrop"
         class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"></div>

    {{-- Centered card --}}
    <div class="relative flex min-h-screen items-center justify-center p-4">
        <div id="rsetup-modal-card"
             class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden
                    transition-all duration-200 scale-95 opacity-0">

            {{-- Close button --}}
            <button onclick="closeRestaurantSetupModal()"
                    class="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors duration-150"
                    style="color:rgba(255,255,255,0.8)"
                    aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {{-- Split layout --}}
            <div class="flex" style="min-height:520px">

                {{-- Left: Red branding panel --}}
                <div class="hidden sm:flex w-[42%] bg-hapag-red flex-col px-8 py-10 text-white shrink-0">
                    <div class="mt-auto mb-10">
                        <h2 class="text-3xl font-extrabold leading-tight tracking-tight mb-3">
                            Bring your kitchen online.
                        </h2>
                        <p class="text-white/75 text-sm leading-relaxed">
                            List your restaurant, manage your menu, and start receiving orders from local customers in Laguna.
                        </p>
                    </div>
                </div>

                {{-- Right: Form --}}
                <div class="flex-1 px-7 py-8 overflow-y-auto">

                    <h2 id="rsetup-modal-title"
                        class="text-xl font-extrabold text-hapag-ink tracking-tight">
                        Register your <span class="text-hapag-red">restaurant</span>
                    </h2>
                    <p class="text-hapag-gray text-xs mt-0.5 mb-5 leading-snug">
                        Once submitted, our team will review and approve your listing.
                    </p>

                    {{-- Validation errors --}}
                    @if($errors->any())
                    <div class="mb-4 flex items-start gap-2.5 bg-red-50 border border-hapag-red/30
                                text-hapag-red px-4 py-3 rounded-xl text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 shrink-0"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            @foreach($errors->all() as $error)
                                <div>{{ $error }}</div>
                            @endforeach
                        </div>
                    </div>
                    @endif

                    <form method="POST" action="{{ route('owner.setup.store') }}" novalidate>
                        @csrf

                        {{-- Restaurant Name --}}
                        <div class="mb-3">
                            <label for="rsetup-name"
                                   class="block text-xs font-semibold text-hapag-gray mb-1">
                                Restaurant Name <span class="text-hapag-red">*</span>
                            </label>
                            <input id="rsetup-name" name="name" type="text"
                                   value="{{ old('name') }}"
                                   required
                                   placeholder="e.g. Burn's Kitchen"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                          placeholder:text-hapag-gray/50 outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                          {{ $errors->has('name') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                        </div>

                        {{-- Category + Municipality side by side --}}
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label for="rsetup-category"
                                       class="block text-xs font-semibold text-hapag-gray mb-1">
                                    Category <span class="text-hapag-red">*</span>
                                </label>
                                <div class="relative">
                                    <select id="rsetup-category" name="category_id" required
                                            class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                                   appearance-none outline-none transition-colors duration-150
                                                   focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                                   {{ $errors->has('category_id') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                                        <option value="" disabled {{ old('category_id') ? '' : 'selected' }}>Select category</option>
                                        @foreach($setupCategories as $cat)
                                            <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>
                                                {{ $cat->icon }} {{ $cat->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hapag-gray"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label for="rsetup-municipality"
                                       class="block text-xs font-semibold text-hapag-gray mb-1">
                                    Municipality <span class="text-hapag-red">*</span>
                                </label>
                                <div class="relative">
                                    <select id="rsetup-municipality" name="municipality" required
                                            class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                                   appearance-none outline-none transition-colors duration-150
                                                   focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                                   {{ $errors->has('municipality') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                                        <option value="" disabled {{ old('municipality') ? '' : 'selected' }}>Select municipality</option>
                                        @foreach(['Santa Cruz', 'Pagsanjan', 'Los Baños', 'Calamba', 'San Pablo'] as $m)
                                            <option value="{{ $m }}" {{ old('municipality') === $m ? 'selected' : '' }}>{{ $m }}</option>
                                        @endforeach
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hapag-gray"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {{-- Description --}}
                        <div class="mb-3">
                            <label for="rsetup-description"
                                   class="block text-xs font-semibold text-hapag-gray mb-1">
                                Description
                            </label>
                            <textarea id="rsetup-description" name="description" rows="3"
                                      placeholder='e.g. "Filipino comfort food made with generations of love and tradition."'
                                      class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                             placeholder:text-hapag-gray/50 outline-none transition-colors duration-150 resize-none
                                             focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                             {{ $errors->has('description') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">{{ old('description') }}</textarea>
                        </div>

                        {{-- Image URL --}}
                        <div class="mb-5">
                            <label for="rsetup-image-url"
                                   class="block text-xs font-semibold text-hapag-gray mb-1">
                                Image URL
                            </label>
                            <input id="rsetup-image-url" name="image_url" type="url"
                                   value="{{ old('image_url') }}"
                                   placeholder="https://example.com/your-image.jpg"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                          placeholder:text-hapag-gray/50 outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                          {{ $errors->has('image_url') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                        </div>

                        <button type="submit"
                                class="w-full py-3 rounded-xl font-bold text-white text-sm bg-hapag-ink
                                       hover:bg-black transition-all duration-150
                                       hover:-translate-y-0.5 hover:shadow-md">
                            Submit for Review
                        </button>
                    </form>

                    <p class="text-center text-xs text-hapag-gray mt-3 leading-relaxed">
                        Your restaurant will appear on Hapag once approved by our admin team.
                    </p>
                </div>

            </div>{{-- /split --}}

        </div>{{-- /card --}}
    </div>
</div>

<script>
(function () {
    const overlay  = document.getElementById('rsetup-modal-overlay');
    const card     = document.getElementById('rsetup-modal-card');
    const backdrop = document.getElementById('rsetup-modal-backdrop');

    function openRestaurantSetupModal() {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });
    }

    function closeRestaurantSetupModal() {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(function () {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 180);
    }

    backdrop.addEventListener('click', closeRestaurantSetupModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeRestaurantSetupModal();
        }
    });

    window.openRestaurantSetupModal  = openRestaurantSetupModal;
    window.closeRestaurantSetupModal = closeRestaurantSetupModal;

    // Auto-open on the setup route or when there are validation errors from the form
    @if(request()->routeIs('owner.setup') || $errors->any())
        document.addEventListener('DOMContentLoaded', openRestaurantSetupModal);
    @endif
})();
</script>
@endif
@endauth