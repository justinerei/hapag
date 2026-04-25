@guest
{{-- ══════════════════════════════════════════════════════════════════════════
     Auth Modal — role selection → split-layout registration form
     Include once in each layout: <x-auth-modal />
     Trigger from anywhere: openAuthModal()
══════════════════════════════════════════════════════════════════════════ --}}

<div id="auth-modal-overlay"
     class="fixed inset-0 z-[200] hidden"
     role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">

    {{-- Backdrop --}}
    <div id="auth-modal-backdrop"
         class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"></div>

    {{-- Centered card --}}
    <div class="relative flex min-h-screen items-center justify-center p-4">
        <div id="auth-modal-card"
             class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden
                    transition-all duration-200 scale-95 opacity-0">

            {{-- Close button --}}
            <button id="auth-modal-close"
                    onclick="closeAuthModal()"
                    class="absolute top-4 right-4 z-20 p-2 rounded-full text-white/70
                           hover:bg-white/20 hover:text-white transition-colors duration-150
                           mix-blend-normal"
                    aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {{-- ── Panel 1: Role selection ─────────────────────────────────── --}}
            <div id="auth-panel-role" class="px-8 py-10 sm:px-12 sm:py-12">

                <div class="text-center mb-8">
                    <h2 id="auth-modal-title"
                        class="text-2xl sm:text-3xl font-extrabold font-sans text-gray-800 tracking-tight">
                        What brings you to <span class="text-green-600">Hapag?</span>
                    </h2>
                    <p class="mt-2 text-gray-500 text-sm sm:text-base">
                        We'll tailor your experience to fit your needs.
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {{-- Customer card --}}
                    <button onclick="selectRole('customer')"
                            class="group text-left flex flex-col items-start gap-3 border-2 border-gray-200
                                   rounded-2xl p-6 hover:border-orange-500 hover:bg-orange-50/40
                                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-50
                                    text-orange-500 group-hover:bg-orange-500 group-hover:text-white
                                    transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14
                                         M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-base
                                      group-hover:text-orange-500 transition-colors duration-200">
                                Customer
                            </p>
                            <p class="text-gray-500 text-sm mt-0.5 leading-snug">
                                Order from local Laguna restaurants and pick up your food fresh.
                            </p>
                        </div>
                    </button>

                    {{-- Restaurant Owner card --}}
                    <button onclick="selectRole('owner')"
                            class="group text-left flex flex-col items-start gap-3 border-2 border-gray-200
                                   rounded-2xl p-6 hover:border-gray-700 hover:bg-orange-50/40
                                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-50
                                    text-gray-700 group-hover:bg-gray-700 group-hover:text-white
                                    transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M9 22V12h6v10" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-base
                                      group-hover:text-gray-700 transition-colors duration-200">
                                Restaurant Owner
                            </p>
                            <p class="text-gray-500 text-sm mt-0.5 leading-snug">
                                List your restaurant, manage your menu, and receive orders.
                            </p>
                        </div>
                    </button>
                </div>

                <p class="text-center text-sm text-gray-500 mt-7">
                    Already have an account?
                    <a href="{{ route('login') }}"
                       class="font-semibold text-green-600 hover:underline">Sign in</a>
                </p>
            </div>

            {{-- ── Panel 2: Split layout registration ─────────────────────── --}}
            <div id="auth-panel-form" class="hidden" style="min-height:520px">

                {{-- Left: Green branding panel --}}
                <div class="hidden sm:flex w-[42%] bg-green-600 flex-col px-8 py-10 text-white shrink-0">

                    {{-- Back --}}
                    <button onclick="showPanel('role')"
                            class="flex items-center gap-1.5 text-white/70 hover:text-white text-sm
                                   transition-colors duration-150 mb-auto self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {{-- Role copy --}}
                    <div class="mb-10">
                        <h2 id="auth-brand-heading"
                            class="text-3xl font-extrabold leading-tight tracking-tight mb-3">
                            Your next meal is waiting.
                        </h2>
                        <p id="auth-brand-sub"
                           class="text-white/75 text-sm leading-relaxed">
                            Browse menus, place orders, and pick up food from your favorite Laguna restaurants.
                        </p>
                    </div>
                </div>

                {{-- Right: Form --}}
                <div class="flex-1 px-7 py-8 overflow-y-auto">

                    {{-- Mobile back --}}
                    <button onclick="showPanel('role')"
                            class="sm:hidden flex items-center gap-1 text-sm text-gray-500
                                   hover:text-gray-800 transition-colors mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <h2 class="text-xl font-extrabold text-gray-800 tracking-tight">
                        Create Your Account
                    </h2>
                    <p id="auth-form-sub" class="text-gray-500 text-xs mt-0.5 mb-5">
                        Enter your personal data to create your account
                    </p>

                    {{-- Validation errors --}}
                    @if($errors->any())
                    <div class="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-500/30
                                text-red-500 px-4 py-3 rounded-xl text-xs">
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

                    <form method="POST" action="{{ route('register') }}" novalidate>
                        @csrf
                        <input type="hidden" name="role" id="auth-role-input"
                               value="{{ old('role', 'customer') }}">

                        {{-- First Name + Last Name --}}
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label for="auth-first-name"
                                       class="block text-xs font-semibold text-gray-500 mb-1">
                                    First Name
                                </label>
                                <input id="auth-first-name" name="first_name" type="text"
                                       value="{{ old('first_name') }}"
                                       required autocomplete="given-name"
                                       placeholder="e.g. Juan"
                                       class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                              placeholder:text-gray-400 outline-none transition-colors duration-150
                                              focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                              {{ $errors->has('first_name') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300' }}">
                                @error('first_name')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>
                            <div>
                                <label for="auth-last-name"
                                       class="block text-xs font-semibold text-gray-500 mb-1">
                                    Last Name
                                </label>
                                <input id="auth-last-name" name="last_name" type="text"
                                       value="{{ old('last_name') }}"
                                       required autocomplete="family-name"
                                       placeholder="e.g. dela Cruz"
                                       class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                              placeholder:text-gray-400 outline-none transition-colors duration-150
                                              focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                              {{ $errors->has('last_name') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300' }}">
                                @error('last_name')
                                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        {{-- Email --}}
                        <div class="mb-3">
                            <label for="auth-email"
                                   class="block text-xs font-semibold text-gray-500 mb-1">
                                Email
                            </label>
                            <input id="auth-email" name="email" type="email"
                                   value="{{ old('email') }}"
                                   required autocomplete="username"
                                   placeholder="e.g. johndoe@email.com"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                          placeholder:text-gray-400 outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                          {{ $errors->has('email') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300' }}">
                            @error('email')
                                <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Municipality (customer only) --}}
                        <div id="auth-municipality-field" class="mb-3">
                            <label for="auth-municipality"
                                   class="block text-xs font-semibold text-gray-500 mb-1">
                                Municipality
                            </label>
                            <div class="relative">
                                <select id="auth-municipality" name="municipality"
                                        class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                               appearance-none outline-none transition-colors duration-150
                                               focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                               {{ $errors->has('municipality') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300' }}">
                                    <option value="">Select your municipality</option>
                                    @foreach(['Alaminos','Bay','Biñan','Cabuyao','Calamba','Calauan','Cavinti','Famy','Kalayaan','Liliw','Los Baños','Luisiana','Lumban','Mabitac','Magdalena','Majayjay','Nagcarlan','Paete','Pagsanjan','Pakil','Pangil','Pila','Rizal','San Pablo City','San Pedro','Santa Cruz','Santa Maria','Siniloan','Victoria'] as $m)
                                        <option value="{{ $m }}" {{ old('municipality') === $m ? 'selected' : '' }}>{{ $m }}</option>
                                    @endforeach
                                </select>
                                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            @error('municipality')
                                <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Password --}}
                        <div class="mb-3">
                            <label for="auth-password"
                                   class="block text-xs font-semibold text-gray-500 mb-1">
                                Password
                            </label>
                            <input id="auth-password" name="password" type="password"
                                   required autocomplete="new-password"
                                   placeholder="Enter your password"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                          outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                          {{ $errors->has('password') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300' }}">
                            @error('password')
                                <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                            @enderror
                        </div>

                        {{-- Confirm Password --}}
                        <div class="mb-5">
                            <label for="auth-password-confirm"
                                   class="block text-xs font-semibold text-gray-500 mb-1">
                                Confirm Password
                            </label>
                            <input id="auth-password-confirm" name="password_confirmation"
                                   type="password" required autocomplete="new-password"
                                   placeholder="Re-enter your password"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-gray-800
                                          outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                                          border-gray-200 bg-gray-50 hover:border-gray-300">
                        </div>

                        <button type="submit" id="auth-submit-btn"
                                class="w-full py-3 rounded-xl font-bold text-white text-sm bg-gray-800
                                       hover:bg-gray-900 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                            Sign Up
                        </button>
                    </form>

                    <p class="text-center text-xs text-gray-500 mt-4">
                        Already have an account?
                        <a href="{{ route('login') }}"
                           class="font-semibold text-gray-800 hover:underline">Login</a>
                    </p>
                </div>

            </div>{{-- /panel-form --}}

        </div>{{-- /card --}}
    </div>
</div>

<script>
(function () {
    const overlay          = document.getElementById('auth-modal-overlay');
    const card             = document.getElementById('auth-modal-card');
    const backdrop         = document.getElementById('auth-modal-backdrop');
    const panelRole        = document.getElementById('auth-panel-role');
    const panelForm        = document.getElementById('auth-panel-form');
    const roleInput        = document.getElementById('auth-role-input');
    const brandHeading     = document.getElementById('auth-brand-heading');
    const brandSub         = document.getElementById('auth-brand-sub');
    const formSub          = document.getElementById('auth-form-sub');
    const submitBtn        = document.getElementById('auth-submit-btn');
    const municipalityField = document.getElementById('auth-municipality-field');
    const closeBtn         = document.getElementById('auth-modal-close');

    const roleConfigs = {
        customer: {
            brandHeading:    'Your next meal is waiting.',
            brandSub:        'Browse menus, place orders, and pick up food from your favorite Laguna restaurants.',
            formSub:         'Enter your personal data to create your account',
            submitText:      'Sign Up',
            showMunicipality: true,
            closeDark:       false,
        },
        owner: {
            brandHeading:    'Bring your kitchen online.',
            brandSub:        'List your restaurant, manage your menu, and start receiving orders from local customers.',
            formSub:         'Set up your personal account first — your restaurant details come next.',
            submitText:      'Continue',
            showMunicipality: false,
            closeDark:       false,
        },
    };

    function openAuthModal(panel, role) {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });

        if (panel === 'form' && role) {
            _setRole(role);
            _showPanel('form');
        } else {
            _showPanel('role');
        }
    }

    function closeAuthModal() {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(function () {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 180);
    }

    function selectRole(role) {
        _setRole(role);
        _showPanel('form');
    }

    function showPanel(name) {
        _showPanel(name);
    }

    function _setRole(role) {
        const cfg = roleConfigs[role] || roleConfigs.customer;
        roleInput.value = role;
        if (brandHeading)     brandHeading.textContent = cfg.brandHeading;
        if (brandSub)         brandSub.textContent     = cfg.brandSub;
        if (formSub)          formSub.textContent      = cfg.formSub;
        if (submitBtn)        submitBtn.textContent    = cfg.submitText;
        if (municipalityField) municipalityField.classList.toggle('hidden', !cfg.showMunicipality);
    }

    function _showPanel(name) {
        panelRole.classList.toggle('hidden', name !== 'role');
        if (name === 'form') {
            panelForm.classList.remove('hidden');
            panelForm.style.display = 'flex';
            if (closeBtn) closeBtn.style.color = 'rgba(255,255,255,0.8)';
        } else {
            panelForm.classList.add('hidden');
            panelForm.style.display = '';
            if (closeBtn) closeBtn.style.color = '#6B7280';
        }
    }

    // Initialise close button color for role panel (default view)
    if (closeBtn) closeBtn.style.color = '#6B7280';

    backdrop.addEventListener('click', closeAuthModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeAuthModal();
        }
    });

    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    window.selectRole = selectRole;
    window.showPanel = showPanel;

    // Auto-reopen on validation errors
    @if($errors->any())
        document.addEventListener('DOMContentLoaded', function () {
            openAuthModal('form', '{{ old('role', 'customer') }}');
        });
    @endif
})();
</script>
@endguest
