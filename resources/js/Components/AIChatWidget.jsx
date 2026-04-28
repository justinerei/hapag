import { useState, useEffect, useRef, useCallback } from 'react';

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

// ── Sparkle Icon ─────────────────────────────────────────────────────────────

function SparkleIcon({ className = 'h-5 w-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className="flex items-start gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                <SparkleIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

// ── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }) {
    const isUser = role === 'user';

    return (
        <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''} max-w-[85%] ${isUser ? 'ml-auto' : ''}`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <SparkleIcon className="h-3.5 w-3.5 text-white" />
                </div>
            )}
            <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                        ? 'bg-green-500 text-white rounded-tr-md'
                        : 'bg-gray-100 text-gray-700 rounded-tl-md'
                }`}
            >
                {content}
            </div>
        </div>
    );
}

// ── Suggestions ──────────────────────────────────────────────────────────────

const DEFAULT_SUGGESTIONS = [
    'Masarap na sabaw',
    'Something sweet',
    'Budget meal under ₱100',
    'Best for rainy day',
];

const RESTAURANT_SUGGESTIONS = [
    'What\'s popular here?',
    'Best value meal?',
    'Something light',
    'Your top pick?',
];

// ── Main Widget ──────────────────────────────────────────────────────────────

export default function AIChatWidget({ restaurantId = null, restaurantName = null }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const messageEndRef = useRef(null);
    const loadingRef = useRef(false);
    const messagesRef = useRef(messages);

    // Keep ref in sync with state
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const suggestions = restaurantId ? RESTAURANT_SUGGESTIONS : DEFAULT_SUGGESTIONS;
    const subtitle = restaurantName
        ? `Ask me about ${restaurantName}'s menu`
        : 'Tell me what you\'re craving';

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    // Focus input when opened
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const sendMessage = useCallback(async (text) => {
        if (!text.trim() || loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setInput('');
        setError('');

        const userMessage = { role: 'user', content: text.trim() };
        const updatedMessages = [...messagesRef.current, userMessage];

        // Update UI immediately with user's message
        setMessages(updatedMessages);

        try {
            const res = await fetch(route('ai.chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    restaurant_id: restaurantId,
                }),
            });

            const data = await res.json();

            if (res.ok && data.reply) {
                setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
            } else if (res.status === 503) {
                setError('Hapag AI is a bit busy right now. Wait a few seconds and try again!');
            } else {
                setError(data.error || 'Something went wrong. Try again.');
            }
        } catch (err) {
            console.error('Hapag AI error:', err);
            setError('Could not connect to Hapag AI. Try again.');
        }

        setLoading(false);
        loadingRef.current = false;
    }, [restaurantId]);

    function handleSubmit(e) {
        e.preventDefault();
        sendMessage(input);
    }

    function handleSuggestion(text) {
        setInput('');
        sendMessage(text);
    }

    function handleClearChat() {
        setMessages([]);
        setError('');
    }

    const hasMessages = messages.length > 0;

    return (
        <>
            {/* ── Floating Action Button ──────────────────────────────── */}
            <button
                onClick={() => setOpen(v => !v)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center ${
                    open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                aria-label="Hapag AI Chat"
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <SparkleIcon className="h-6 w-6" />
                )}

                {/* Unread dot when closed with messages */}
                {!open && hasMessages && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white" />
                )}
            </button>

            {/* ── Chat Panel ──────────────────────────────────────────── */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                     style={{ height: 'min(520px, calc(100vh - 8rem))' }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3.5 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                    <SparkleIcon className="h-4.5 w-4.5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm leading-tight">Hapag AI</h3>
                                    <p className="text-white/60 text-[11px] leading-tight">{subtitle}</p>
                                </div>
                            </div>

                            {/* Clear chat button */}
                            {hasMessages && (
                                <button
                                    onClick={handleClearChat}
                                    className="text-white/50 hover:text-white/90 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    title="New conversation"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Messages area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {/* Empty state: welcome + suggestions */}
                        {!hasMessages && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-2">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                    <SparkleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="text-gray-800 font-bold text-sm mb-1">
                                    {restaurantName ? `Exploring ${restaurantName}?` : 'What are you craving?'}
                                </p>
                                <p className="text-gray-400 text-xs mb-5 leading-relaxed max-w-[240px]">
                                    {restaurantName
                                        ? 'I can help you pick the best dishes from this menu.'
                                        : 'I know every restaurant on Hapag. Ask me anything about food in Laguna!'
                                    }
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {suggestions.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSuggestion(s)}
                                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message bubbles */}
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} role={msg.role} content={msg.content} />
                        ))}

                        {/* Typing indicator */}
                        {loading && <TypingIndicator />}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 rounded-xl px-3.5 py-2.5 border border-red-100">
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messageEndRef} />
                    </div>

                    {/* Quick suggestions after first reply */}
                    {hasMessages && !loading && messages.length <= 4 && (
                        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                            {['Tell me more', 'Something cheaper', 'Any promos?'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSuggestion(s)}
                                    className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input bar */}
                    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 flex gap-2 shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="I'm craving…"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                            maxLength={300}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:opacity-40 disabled:hover:bg-green-500 transition-all shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}