<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    // ── Customer: food recommender ────────────────────────────────────────────

    public function recommend(Request $request)
    {
        $request->validate([
            'prompt'        => 'required|string|max:300',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ]);

        $itemQuery = MenuItem::where('is_available', true)
            ->with('restaurant:id,name,municipality,image_url');

        if ($request->filled('restaurant_id')) {
            $itemQuery->where('restaurant_id', $request->restaurant_id);
        } else {
            $itemQuery->whereHas('restaurant', fn ($q) => $q->where('status', 'active'));
        }

        $items = $itemQuery->inRandomOrder()->limit(60)->get();

        if ($items->isEmpty()) {
            return response()->json(['error' => 'No menu items available to recommend from.'], 422);
        }

        $menuList = $items->map(fn ($i) => sprintf(
            '- %s (₱%.0f) at %s, %s [%s]',
            $i->name, $i->price, $i->restaurant->name, $i->restaurant->municipality, $i->category
        ))->join("\n");

        $systemPrompt = <<<PROMPT
            You are Hapag's friendly food recommender for restaurants in Laguna, Philippines.
            Given a customer's craving or preference, suggest 2–4 specific dishes from the menu list provided.

            IMPORTANT: You MUST respond in valid JSON only. No markdown, no backticks, no extra text.
            Use this exact format:
            {
            "intro": "A short, warm 1-2 sentence intro about why these picks are great. Skip if you have nothing meaningful beyond listing dishes.",
            "picks": ["Exact Dish Name 1", "Exact Dish Name 2", "Exact Dish Name 3"]
            }

            Rules:
            - "picks" must contain EXACT dish names from the menu list (case-sensitive match)
            - "intro" should be conversational and brief (under 30 words). Set to "" if unnecessary.
            - Do NOT invent dish names not in the list
            - 2-4 picks maximum
            PROMPT;

        $userPrompt = "Customer says: \"{$request->prompt}\"\n\nAvailable menu items:\n{$menuList}";

        $rawReply = $this->callGroq($systemPrompt, $userPrompt);

        if ($rawReply === null) {
            return response()->json(['error' => 'AI service is unavailable. Please try again later.'], 503);
        }

        // Parse the AI JSON response
        $cleaned = trim($rawReply);
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);

        $parsed = json_decode($cleaned, true);

        if (! $parsed || ! isset($parsed['picks']) || ! is_array($parsed['picks'])) {
            // Fallback: return raw text if AI didn't follow format
            return response()->json([
                'intro' => $rawReply,
                'dishes' => [],
            ]);
        }

        // Match pick names to actual menu items
        $pickNames = collect($parsed['picks'])->map(fn ($n) => mb_strtolower(trim($n)));
        $matchedDishes = $items->filter(function ($item) use ($pickNames) {
            return $pickNames->contains(mb_strtolower($item->name));
        })->unique('id')->values()->map(fn ($i) => [
            'id'              => $i->id,
            'name'            => $i->name,
            'price'           => (float) $i->price,
            'description'     => $i->description,
            'category'        => $i->category,
            'image_url'       => $i->image_url,
            'restaurant_id'   => $i->restaurant->id,
            'restaurant_name' => $i->restaurant->name,
            'municipality'    => $i->restaurant->municipality,
        ]);

        return response()->json([
            'intro'  => $parsed['intro'] ?? '',
            'dishes' => $matchedDishes,
        ]);
    }

    // ── Customer: conversational chatbot ─────────────────────────────────────

    public function chat(Request $request)
    {
        $request->validate([
            'messages'           => 'required|array|min:1|max:20',
            'messages.*.role'    => 'required|in:user,assistant',
            'messages.*.content' => 'required|string|max:2000',
            'restaurant_id'      => 'nullable|exists:restaurants,id',
        ]);

        $user             = auth()->user();
        $userMunicipality = $user?->municipality ?? null;

        // ── Build context ──────────────────────────────────────────────────
        if ($request->filled('restaurant_id')) {
            // Single-restaurant context (menu page)
            $restaurant = Restaurant::with('menuItems')->find($request->restaurant_id);
            $items      = $restaurant
                ? MenuItem::where('restaurant_id', $restaurant->id)
                    ->where('is_available', true)
                    ->get(['id', 'name', 'price', 'category', 'description'])
                : collect();

            $menuList = $items->map(fn ($i) => sprintf(
                '[ID:%d] %s (₱%.0f) [%s]%s',
                $i->id, $i->name, $i->price, $i->category,
                $i->description ? ': ' . mb_substr($i->description, 0, 60) : ''
            ))->join("\n");

            $dataContext = "\n\n--- RESTAURANT CONTEXT ---"
                . "\nRestaurant: {$restaurant->name} in {$restaurant->municipality}."
                . "\nOnly suggest dishes from this menu. Each item has an [ID:X] — use these IDs in menu_ids."
                . "\n\nMenu:\n{$menuList}"
                . "\n--- END CONTEXT ---";

            $activeVouchers = \App\Models\Voucher::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses'))
                ->where(fn ($q) => $q->whereNull('restaurant_id')->orWhere('restaurant_id', $restaurant?->id))
                ->get(['id', 'code', 'type', 'value', 'min_order_amount', 'expires_at', 'restaurant_id']);
        } else {
            // System-wide context (customer dashboard)
            $restaurants = Restaurant::where('status', 'active')
                ->select('id', 'name', 'municipality')
                ->get();

            $localRestaurants = $userMunicipality
                ? $restaurants->where('municipality', $userMunicipality)
                : collect();

            $otherRestaurants = $userMunicipality
                ? $restaurants->where('municipality', '!=', $userMunicipality)
                : $restaurants;

            $localList = $localRestaurants->isEmpty()
                ? 'None in their municipality.'
                : $localRestaurants->map(fn ($r) => "• {$r->name} ({$r->municipality})")->join("\n");

            $otherList = $otherRestaurants->map(fn ($r) => "• {$r->name} ({$r->municipality})")->join("\n");

            $activeVouchers = \App\Models\Voucher::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses'))
                ->with('restaurant:id,name')
                ->get(['id', 'code', 'type', 'value', 'min_order_amount', 'expires_at', 'restaurant_id']);

            $voucherList = $activeVouchers->isEmpty()
                ? 'No active promos right now.'
                : $activeVouchers->map(fn ($v) => sprintf(
                    '[ID:%d] Code: %s | %s %s%s%s',
                    $v->id,
                    $v->code,
                    $v->type === 'percentage' ? number_format($v->value, 0) . '% off' : '₱' . number_format($v->value, 0) . ' off',
                    $v->restaurant ? "at {$v->restaurant->name}" : '(all restaurants)',
                    $v->min_order_amount ? ' | Min. ₱' . number_format($v->min_order_amount, 0) : '',
                    $v->expires_at ? ' | Expires ' . $v->expires_at->format('M d') : ''
                ))->join("\n");

            $locationNote = $userMunicipality
                ? "The customer is in {$userMunicipality}. Prioritize local restaurants, but you can suggest others — just note they're from a different municipality."
                : "Customer municipality is unknown — suggest freely across Laguna.";

            $dataContext = "\n\n--- HAPAG SYSTEM DATA ---"
                . "\n{$locationNote}"
                . "\n\nLocal restaurants (same municipality — recommend these first):\n{$localList}"
                . "\n\nOther restaurants in Laguna:\n{$otherList}"
                . "\n\nActive promos (use [ID:X] in voucher_ids when mentioning promos):\n{$voucherList}"
                . "\n--- END SYSTEM DATA ---";
        }

        $systemPrompt = <<<PROMPT
You are Hapag AI — a fun, food-obsessed assistant for Hapag, a food ordering platform in Laguna, Philippines.

Your personality:
- Like a food-loving friend — warm, witty, a little extra about food
- Natural Filipino/Taglish when it fits ("Ay sarap nyan!", "Subukan mo 'to!")
- Enthusiastic but never annoying

CRITICAL — Response format:
You MUST always respond in valid JSON with this exact structure:
{
  "reply": "Your conversational response here. Use \\n for line breaks. Use • for bullet lists.",
  "menu_ids": [1, 4, 7],
  "voucher_ids": [2]
}

Rules for menu_ids and voucher_ids:
- Include menu_ids ONLY when you have [ID:X] values in the system data (restaurant page context). On the dashboard, always use []
- Include voucher_ids when mentioning promos — use the [ID:X] values from the voucher list
- Use empty arrays [] when not applicable
- Max 4 menu_ids, max 3 voucher_ids per response
- ONLY use IDs that exist in the system data — never invent IDs

Rules for the reply text:
- Structure: short intro → • bullet list → closing line
- One blank line (\\n\\n) between sections
- Medium length — helpful but never a wall of text
- Municipality awareness: if customer is in a specific area, recommend local places first; if suggesting other municipalities, say so naturally

Hard rules — NEVER break:
- ONLY mention restaurants, dishes, and promos from the system data
- Never invent restaurant names, dishes, prices, or promo codes
- Refuse off-topic questions: "Haha sorry, food lang ang alam ko! 🍽️"
- Laguna only — never suggest outside Laguna
- Never mention competitors
PROMPT;

        $systemPrompt .= $dataContext;

        // Strip card data from message history before sending to AI
        // (cards are UI-only, the AI only needs the text)
        $messages = collect($request->messages)
            ->map(fn ($m) => ['role' => $m['role'], 'content' => $m['content']])
            ->toArray();

        $rawReply = $this->callGroqMessages($systemPrompt, $messages, 600);

        if ($rawReply === null) {
            return response()->json(['error' => 'AI service is unavailable. Please try again later.'], 503);
        }

        // Parse structured JSON response from AI
        $cleaned = trim($rawReply);
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);
        $parsed  = json_decode($cleaned, true);

        $replyText  = $parsed['reply']       ?? $rawReply; // fallback to raw if AI ignores format
        $menuIds    = $parsed['menu_ids']    ?? [];
        $voucherIds = $parsed['voucher_ids'] ?? [];

        // Resolve menu cards from real DB data
        $menuCards = [];
        if (!empty($menuIds)) {
            $menuCards = MenuItem::whereIn('id', $menuIds)
                ->where('is_available', true)
                ->with('restaurant:id,name,municipality')
                ->get(['id', 'restaurant_id', 'name', 'price', 'category', 'image_url', 'description'])
                ->map(fn ($i) => [
                    'id'              => $i->id,
                    'name'            => $i->name,
                    'price'           => (float) $i->price,
                    'category'        => $i->category,
                    'image_url'       => $i->image_url,
                    'description'     => $i->description,
                    'restaurant_id'   => $i->restaurant_id,
                    'restaurant_name' => $i->restaurant->name,
                    'municipality'    => $i->restaurant->municipality,
                ])->values()->toArray();
        }

        // Resolve voucher cards from real DB data
        $voucherCards = [];
        if (!empty($voucherIds)) {
            $usedVoucherIds = $user
                ? \App\Models\VoucherUsage::where('user_id', $user->id)->pluck('voucher_id')->toArray()
                : [];
            $claimedIds = $user
                ? \App\Models\ClaimedVoucher::where('user_id', $user->id)->pluck('voucher_id')->toArray()
                : [];

            $voucherCards = \App\Models\Voucher::whereIn('id', $voucherIds)
                ->where('is_active', true)
                ->with('restaurant:id,name')
                ->get()
                ->map(fn ($v) => [
                    'id'               => $v->id,
                    'code'             => $v->code,
                    'type'             => $v->type,
                    'value'            => (float) $v->value,
                    'min_order_amount' => $v->min_order_amount ? (float) $v->min_order_amount : null,
                    'expires_at'       => $v->expires_at?->format('M d, Y'),
                    'restaurant_name'  => $v->restaurant?->name ?? null,
                    'is_claimed'       => in_array($v->id, $claimedIds),
                    'is_used'          => in_array($v->id, $usedVoucherIds),
                ])->values()->toArray();
        }

        return response()->json([
            'reply'        => $replyText,
            'menu_cards'   => $menuCards,
            'voucher_cards'=> $voucherCards,
        ]);
    }

    // ── Owner: menu item description generator ───────────────────────────────

    public function describe(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:120',
            'category'        => 'required|string|max:80',
            'restaurant_name' => 'nullable|string|max:120',
        ]);

        $context = $request->restaurant_name
            ? "restaurant named \"{$request->restaurant_name}\""
            : 'a Filipino restaurant in Laguna, Philippines';

        $systemPrompt = <<<PROMPT
You are a menu copywriter for Filipino restaurants.
Write a single appetizing description (1–2 sentences, max 80 words) for a menu item.
Be vivid and specific. Do not start with the item name. Write in English.
PROMPT;

        $userPrompt = "Write a menu description for \"{$request->name}\" "
            . "(category: {$request->category}) served at {$context}.";

        $reply = $this->callGroq($systemPrompt, $userPrompt);

        if ($reply === null) {
            return response()->json(['error' => 'AI service is unavailable. Please try again later.'], 503);
        }

        return response()->json(['description' => $reply]);
    }

    // ── Shared GROQ helper ────────────────────────────────────────────────────

    private function callGroqMessages(string $systemPrompt, array $messages, int $maxTokens = 400): ?string
    {
        $response = Http::timeout(20)
            ->withToken(config('services.groq.key'))
            ->post(config('services.groq.url'), [
                'model'       => config('services.groq.model'),
                'messages'    => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $messages
                ),
                'max_tokens'  => $maxTokens,
                'temperature' => 0.7,
            ]);

        if ($response->failed()) {
            return null;
        }

        return $response->json('choices.0.message.content');
    }

    private function callGroq(string $systemPrompt, string $userPrompt): ?string
    {
        $response = Http::timeout(15)
            ->withToken(config('services.groq.key'))
            ->post(config('services.groq.url'), [
                'model'       => config('services.groq.model'),
                'messages'    => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userPrompt],
                ],
                'max_tokens'  => 200,
                'temperature' => 0.7,
            ]);

        if ($response->failed()) {
            return null;
        }

        return $response->json('choices.0.message.content');
    }
}