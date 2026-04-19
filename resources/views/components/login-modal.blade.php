@guest
{{-- ══════════════════════════════════════════════════════════════════════════
     Login Modal — split-panel sign-in form
     Include once in each layout: <x-login-modal />
     Trigger from anywhere: openLoginModal()
══════════════════════════════════════════════════════════════════════════ --}}

<div id="login-modal-overlay"
     class="fixed inset-0 z-[200] hidden"
     role="dialog" aria-modal="true" aria-labelledby="login-modal-title">

    {{-- Backdrop --}}
    <div id="login-modal-backdrop"
         class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"></div>

    {{-- Centered card --}}
    <div class="relative flex min-h-screen items-center justify-center p-4">
        <div id="login-modal-card"
             class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden
                    transition-all duration-200 scale-95 opacity-0">

            {{-- Close button --}}
            <button id="login-modal-close"
                    onclick="closeLoginModal()"
                    class="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors duration-150"
                    style="color:rgba(255,255,255,0.8)"
                    aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {{-- Split layout --}}
            <div class="flex" style="min-height:480px">

                {{-- Left: Red branding panel --}}
                <div class="hidden sm:flex w-[42%] bg-hapag-red flex-col px-8 py-10 text-white shrink-0">
                    <div class="mt-auto mb-10">
                        <h2 class="text-3xl font-extrabold leading-tight tracking-tight mb-3">
                            Good food is just a tap away.
                        </h2>
                        <p class="text-white/75 text-sm leading-relaxed">
                            Browse local restaurants, place your order, and pick up fresh — no delivery fees, no hassle.
                        </p>
                    </div>
                </div>

                {{-- Right: Form --}}
                <div class="flex-1 px-8 py-10 flex flex-col justify-center">

                    <h2 id="login-modal-title"
                        class="text-2xl font-extrabold text-hapag-ink tracking-tight">
                        Welcome back!
                    </h2>
                    <p class="text-hapag-gray text-sm mt-1 mb-6 leading-snug">
                        Sign in to your account to continue ordering from your favorite Laguna restaurants.
                    </p>

                    {{-- Session status (e.g. password reset success) --}}
                    @if(session('status'))
                    <div class="mb-4 flex items-center gap-2.5 bg-teal-50 border border-hapag-teal
                                text-hapag-teal px-4 py-3 rounded-xl text-xs font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ session('status') }}
                    </div>
                    @endif

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

                    <form method="POST" action="{{ route('login') }}" novalidate>
                        @csrf

                        {{-- Email --}}
                        <div class="mb-4">
                            <label for="login-email"
                                   class="block text-xs font-semibold text-hapag-gray mb-1">
                                Email
                            </label>
                            <input id="login-email" name="email" type="email"
                                   value="{{ old('email') }}"
                                   required autocomplete="username"
                                   placeholder="e.g. johndoe@email.com"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                          placeholder:text-hapag-gray/50 outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                          {{ $errors->has('email') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                        </div>

                        {{-- Password --}}
                        <div class="mb-1">
                            <label for="login-password"
                                   class="block text-xs font-semibold text-hapag-gray mb-1">
                                Password
                            </label>
                            <input id="login-password" name="password" type="password"
                                   required autocomplete="current-password"
                                   placeholder="Enter your password"
                                   class="w-full px-3 py-2.5 rounded-xl border text-sm text-hapag-ink
                                          outline-none transition-colors duration-150
                                          focus:ring-2 focus:ring-hapag-red/30 focus:border-hapag-red
                                          {{ $errors->has('password') ? 'border-hapag-red bg-red-50' : 'border-hapag-cream2 bg-hapag-cream hover:border-hapag-gray/50' }}">
                        </div>

                        {{-- Forgot password --}}
                        @if(Route::has('password.request'))
                        <div class="text-right mb-4">
                            <a href="{{ route('password.request') }}"
                               class="text-xs text-hapag-red hover:underline font-semibold">
                                Forgot your password?
                            </a>
                        </div>
                        @endif

                        {{-- Remember me --}}
                        <div class="flex items-center gap-2.5 mb-5">
                            <input id="login-remember" name="remember" type="checkbox"
                                   class="w-4 h-4 rounded border-hapag-cream2 text-hapag-red
                                          focus:ring-hapag-red/30 cursor-pointer">
                            <label for="login-remember"
                                   class="text-xs text-hapag-gray cursor-pointer select-none">
                                Remember me
                            </label>
                        </div>

                        <button type="submit"
                                class="w-full py-3 rounded-xl font-bold text-white text-sm bg-hapag-ink
                                       hover:bg-black transition-all duration-150
                                       hover:-translate-y-0.5 hover:shadow-md">
                            Sign In
                        </button>
                    </form>

                    <p class="text-center text-xs text-hapag-gray mt-4">
                        Don't have an account?
                        <button onclick="closeLoginModal(); openAuthModal();"
                                class="font-semibold text-hapag-ink hover:underline">
                            Sign Up
                        </button>
                    </p>
                </div>

            </div>{{-- /split --}}

        </div>{{-- /card --}}
    </div>
</div>

<script>
(function () {
    const overlay  = document.getElementById('login-modal-overlay');
    const card     = document.getElementById('login-modal-card');
    const backdrop = document.getElementById('login-modal-backdrop');

    function openLoginModal() {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });
    }

    function closeLoginModal() {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(function () {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 180);
    }

    backdrop.addEventListener('click', closeLoginModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeLoginModal();
        }
    });

    window.openLoginModal  = openLoginModal;
    window.closeLoginModal = closeLoginModal;

    // Auto-open when navigated directly to /login (or on validation error)
    @if(request()->is('login') || $errors->any() || session('status'))
        document.addEventListener('DOMContentLoaded', openLoginModal);
    @endif
})();
</script>
@endguest