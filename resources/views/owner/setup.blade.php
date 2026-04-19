<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-hapag-ink leading-tight">
            Set Up Your Restaurant
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="bg-white rounded-3xl shadow-sm border border-hapag-cream2 px-10 py-14">
                <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-orange-50 text-hapag-brown">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 22V12h6v10" />
                    </svg>
                </div>
                <h1 class="text-2xl font-extrabold text-hapag-ink tracking-tight mb-2">
                    Welcome, {{ auth()->user()->name }}!
                </h1>
                <p class="text-hapag-gray text-sm leading-relaxed mb-8">
                    Your account is ready. Head to your dashboard to add your restaurant and start managing your menu.
                </p>
                <a href="{{ route('owner.dashboard') }}"
                   class="inline-block px-8 py-3 rounded-full bg-hapag-red text-white text-sm font-bold
                          hover:bg-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                    Go to Dashboard
                </a>
            </div>
        </div>
    </div>
</x-app-layout>