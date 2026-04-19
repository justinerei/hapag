@guest
{{-- ══════════════════════════════════════════════════════════════════════════
     Auth Modal — role selection → registration form (vanilla JS, two panels)
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
             class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl
                    transition-all duration-200 scale-95 opacity-0">

            {{-- Close button --}}
            <button id="auth-modal-close"
                    onclick="closeAuthModal()"
                    class="absolute top-4 right-4 p-2 rounded-full text-hapag-gray
                           hover:bg-hapag-cream2 hover:text-hapag-ink transition-colors duration-150"
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
                        class="text-2xl sm:text-3xl font-extrabold text-hapag-ink tracking-tight">
                        What brings you to <span class="text-hapag-red">Hapag?</span>
                    </h2>
                    <p class="mt-2 text-hapag-gray text-sm sm:text-base">
                        We'll tailor your experience to fit your needs.
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {{-- Customer card --}}
                    <button onclick="selectRole('customer')"
                            class="group text-left flex flex-col items-start gap-3 border-2 border-hapag-cream2
                                   rounded-2xl p-6 hover:border-hapag-amber hover:bg-amber-50/40
                                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-hapag-amber">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-50
                                    text-hapag-amber group-hover:bg-hapag-amber group-hover:text-white
                                    transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14
                                         M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-hapag-ink text-base
                                      group-hover:text-hapag-amber transition-colors duration-200">
                                Customer
                            </p>
                            <p class="text-hapag-gray text-sm mt-0.5 leading-snug">
                                Order from local Laguna restaurants and pick up your food fresh.
                            </p>
                        </div>
                    </button>

                    {{-- Restaurant Owner card --}}
                    <button onclick="selectRole('owner')"
                            class="group text-left flex flex-col items-start gap-3 border-2 border-hapag-cream2
                                   rounded-2xl p-6 hover:border-hapag-brown hover:bg-orange-50/40
                                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-hapag-brown">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-50
                                    text-hapag-brown group-hover:bg-hapag-brown group-hover:text-white
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
                            <p class="font-bold text-hapag-ink text-base
                                      group-hover:text-hapag-brown transition-colors duration-200">
                                Restaurant Owner
                            </p>
                            <p class="text-hapag-gray text-sm mt-0.5 leading-snug">
                                List your restaurant, manage your menu, and receive orders.
                            </p>
                        </div>
                    </button>
                </div>

                <p class="text-center text-sm text-hapag-gray mt-7">
                    Already have an account?
                    <a href="{{ route('login') }}"
                       class="font-semibold text-hapag-red hover:underline">Sign in</a>
                </p>
            </div>

            {{-- ── Panel 2: Registration form ──────────────────────────────── --}}
            <div id="auth-panel-form" class="hidden px-8 py-10 sm:px-12 sm:py-12">

                {{-- Back link --}}
                <button onclick="showPanel('role')"
                        class="flex items-center gap-1.5 text-sm text-hapag-gray hover:text-hapag-ink
                               transition-colors duration-150 mb-6 group">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-150"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Choose a different role
                </button>

                {{-- Dynamic header --}}
                <div class="mb-6">
                    <h2 class="text-2xl font-extrabold text-hapag-ink tracking-tight">
                        Join as a <span id="auth-role-label" class="text-hapag-red">Customer</span>
                    </h2>
                    <p class="mt-1 text-hapag-gray text-sm">
                        Create your free Hapag account.
                    </p>
                </div>

                {{-- Validation error summary --}}
                @if($errors->any())
                <div class="mb-5 flex items-start gap-3 bg-red-50 border border-hapag-red/30
                            text-hapag-red px-4 py-3 rounded-xl text-sm">
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

                    {{-- Name --}}
                    <div class="mb-4">
                        <label for="auth-name"
                               class="block text-sm font-semibold text-hapag-ink mb-1.5">
                            Full Name
                        </label>
                        <input id="auth-name" name="name" type="text"
                               value="{{ old('name') }}"
                               required autocomplete="name" autofocus
                               class="w-full px-4 py-2.5 rounded-xl border text-sm text-hapag-ink
                                      placeholder:text-hapag-gray/60 outline-none transition-colors duration-150
                                      focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                      {{ $errors->has('name') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-white hover:border-hapag-gray/50' }}"
                               placeholder="e.g. Juan dela Cruz">
                        @error('name')
                            <p class="mt-1 text-xs text-hapag-red">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Email --}}
                    <div class="mb-4">
                        <label for="auth-email"
                               class="block text-sm font-semibold text-hapag-ink mb-1.5">
                            Email Address
                        </label>
                        <input id="auth-email" name="email" type="email"
                               value="{{ old('email') }}"
                               required autocomplete="username"
                               class="w-full px-4 py-2.5 rounded-xl border text-sm text-hapag-ink
                                      placeholder:text-hapag-gray/60 outline-none transition-colors duration-150
                                      focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                      {{ $errors->has('email') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-white hover:border-hapag-gray/50' }}"
                               placeholder="you@example.com">
                        @error('email')
                            <p class="mt-1 text-xs text-hapag-red">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Password --}}
                    <div class="mb-4">
                        <label for="auth-password"
                               class="block text-sm font-semibold text-hapag-ink mb-1.5">
                            Password
                        </label>
                        <input id="auth-password" name="password" type="password"
                               required autocomplete="new-password"
                               class="w-full px-4 py-2.5 rounded-xl border text-sm text-hapag-ink
                                      outline-none transition-colors duration-150
                                      focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                      {{ $errors->has('password') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-white hover:border-hapag-gray/50' }}"
                               placeholder="Min. 8 characters">
                        @error('password')
                            <p class="mt-1 text-xs text-hapag-red">{{ $message }}</p>
                        @enderror
                    </div>

                    {{-- Confirm password --}}
                    <div class="mb-6">
                        <label for="auth-password-confirm"
                               class="block text-sm font-semibold text-hapag-ink mb-1.5">
                            Confirm Password
                        </label>
                        <input id="auth-password-confirm" name="password_confirmation"
                               type="password" required autocomplete="new-password"
                               class="w-full px-4 py-2.5 rounded-xl border text-sm text-hapag-ink
                                      outline-none transition-colors duration-150
                                      focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                      border-hapag-cream2 bg-white hover:border-hapag-gray/50"
                               placeholder="Repeat your password">
                    </div>

                    <button type="submit"
                            class="w-full py-3 rounded-full font-bold text-white text-sm bg-hapag-red
                                   hover:bg-red-700 transition-all duration-150
                                   hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                        Create Account
                    </button>
                </form>

                <p class="text-center text-sm text-hapag-gray mt-5">
                    Already have an account?
                    <a href="{{ route('login') }}"
                       class="font-semibold text-hapag-red hover:underline">Sign in</a>
                </p>
            </div>

        </div>{{-- /card --}}
    </div>
</div>

<script>
(function () {
    const overlay  = document.getElementById('auth-modal-overlay');
    const card     = document.getElementById('auth-modal-card');
    const backdrop = document.getElementById('auth-modal-backdrop');
    const panelRole = document.getElementById('auth-panel-role');
    const panelForm = document.getElementById('auth-panel-form');
    const roleInput = document.getElementById('auth-role-input');
    const roleLabel = document.getElementById('auth-role-label');

    const roleNames = { customer: 'Customer', owner: 'Restaurant Owner' };

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
        roleInput.value = role;
        if (roleLabel) roleLabel.textContent = roleNames[role] || role;
    }

    function _showPanel(name) {
        panelRole.classList.toggle('hidden', name !== 'role');
        panelForm.classList.toggle('hidden', name !== 'form');
    }

    // Close on backdrop click
    backdrop.addEventListener('click', closeAuthModal);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeAuthModal();
        }
    });

    // Expose globals
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