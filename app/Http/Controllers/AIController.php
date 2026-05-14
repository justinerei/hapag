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
            'messages'             => 'required|array|min:1|max:20',
            'messages.*.role'      => 'required|in:user,assistant',
            'messages.*.content'   => 'required|string|max:500',
            'restaurant_id'        => 'nullable|exists:restaurants,id',
        ]);

        $restaurantContext = '';
        if ($request->filled('restaurant_id')) {
            $restaurant = Restaurant::find($request->restaurant_id);
            if ($restaurant) {
                $items = MenuItem::where('restaurant_id', $restaurant->id)
                    ->where('is_available', true)
                    ->get(['name', 'price', 'category', 'description']);

                $menuList = $items->map(fn ($i) => sprintf(
                    '- %s (₱%.0f) [%s]%s',
                    $i->name,
                    $i->price,
                    $i->category,
                    $i->description ? ': ' . mb_substr($i->description, 0, 60) : ''
                ))->join("\n");

                $restaurantContext = "\n\nYou are specifically helping a customer at {$restaurant->name} "
                    . "in {$restaurant->municipality}. Their available menu:\n{$menuList}";
            }
        }

        $systemPrompt = 'You are Hapag AI, a friendly food assistant for restaurants in Laguna, Philippines. '
            . 'Help customers discover great food, answer questions about the menu, and make personalized recommendations. '
            . 'Keep replies short, warm, and conversational (2–4 sentences max). '
            . 'You may sprinkle a little Filipino/Taglish when it feels natural.'
            . $restaurantContext;

        $messages = collect($request->messages)
            ->map(fn ($m) => ['role' => $m['role'], 'content' => $m['content']])
            ->toArray();

        $reply = $this->callGroqMessages($systemPrompt, $messages);

        if ($reply === null) {
            return response()->json(['error' => 'AI service is unavailable. Please try again later.'], 503);
        }

        return response()->json(['reply' => $reply]);
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

    private function callGroqMessages(string $systemPrompt, array $messages): ?string
    {
        $response = Http::timeout(15)
            ->withToken(config('services.groq.key'))
            ->post(config('services.groq.url'), [
                'model'       => config('services.groq.model'),
                'messages'    => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $messages
                ),
                'max_tokens'  => 300,
                'temperature' => 0.8,
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