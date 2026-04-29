<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    // ── Customer: food recommender (legacy single-turn) ────────────────────────

    public function recommend(Request $request)
    {
        $request->validate([
            'prompt'        => 'required|string|max:300',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ]);

        // Scope to one restaurant if provided, otherwise sample across all active ones
        $itemQuery = MenuItem::where('is_available', true)
            ->with('restaurant:id,name,municipality');

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
Given a customer's craving or preference, suggest 2–3 specific dishes from the menu list provided.
Keep your reply conversational, warm, and under 120 words. Write in English.
Always include the dish name, restaurant name, and price. Do not invent dishes not in the list.
PROMPT;

        $userPrompt = "Customer says: \"{$request->prompt}\"\n\nAvailable menu items:\n{$menuList}";

        $reply = $this->callGroq($systemPrompt, $userPrompt);

        if ($reply === null) {
            return response()->json(['error' => 'AI service is unavailable. Please try again later.'], 503);
        }

        return response()->json(['recommendation' => $reply]);
    }

    // ── Customer: multi-turn chatbot ───────────────────────────────────────────

    public function chat(Request $request)
    {
        $request->validate([
            'messages'      => 'required|array|min:1|max:20',
            'messages.*.role'    => 'required|in:user,assistant',
            'messages.*.content' => 'required|string|max:2000',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ]);

        $itemQuery = MenuItem::where('is_available', true)
            ->with('restaurant:id,name,municipality');

        if ($request->filled('restaurant_id')) {
            $itemQuery->where('restaurant_id', $request->restaurant_id);
            $restaurant = Restaurant::find($request->restaurant_id);
            $scopeLabel = $restaurant ? "You are currently helping a customer browsing \"{$restaurant->name}\"." : '';
        } else {
            $itemQuery->whereHas('restaurant', fn ($q) => $q->where('status', 'active'));
            $scopeLabel = 'The customer is browsing all restaurants on Hapag.';
        }

        $items = $itemQuery->inRandomOrder()->limit(80)->get();

        $menuList = $items->map(fn ($i) => sprintf(
            '- %s (₱%.0f) at %s, %s [%s]',
            $i->name, $i->price, $i->restaurant->name ?? 'Unknown', $i->restaurant->municipality ?? '', $i->category
        ))->join("\n");

        // Build restaurant list for context
        $restaurantList = Restaurant::where('status', 'active')
            ->with('category')
            ->get()
            ->map(fn ($r) => sprintf('- %s (%s) in %s', $r->name, $r->category->name ?? 'General', $r->municipality))
            ->join("\n");

        $systemPrompt = <<<PROMPT
You are **Hapag AI**, a friendly and knowledgeable food assistant for Hapag — a food ordering platform serving Laguna, Philippines.

{$scopeLabel}

Your job:
• Help customers discover dishes, pick restaurants, and decide what to order.
• Be conversational, warm, and concise (under 150 words per reply).
• When recommending, always cite the exact dish name, price, and restaurant from the menu list.
• Never invent dishes or restaurants not in the provided lists.
• If the customer asks something unrelated to food or restaurants, politely redirect.
• You can answer follow-up questions and have a natural back-and-forth conversation.
• If asked about dietary needs, allergies, or budget, filter recommendations accordingly.
• Use a friendly, casual Filipino-English tone when it feels natural (e.g. "Solid choice!", "Masarap 'yan!").

Available restaurants:
{$restaurantList}

Available menu items:
{$menuList}
PROMPT;

        // Build messages array for the API
        $apiMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($request->messages as $msg) {
            $apiMessages[] = [
                'role'    => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $reply = $this->callGroqMultiTurn($apiMessages);

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

    // ── Shared GROQ helpers ────────────────────────────────────────────────────

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
            \Log::error('Groq API failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;
        }

        return $response->json('choices.0.message.content');
    }

    private function callGroqMultiTurn(array $messages): ?string
    {
        $maxRetries = 2;

        for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
            $response = Http::timeout(20)
                ->withToken(config('services.groq.key'))
                ->post(config('services.groq.url'), [
                    'model'       => config('services.groq.model'),
                    'messages'    => $messages,
                    'max_tokens'  => 300,
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            // If rate-limited (429), wait and retry
            if ($response->status() === 429 && $attempt < $maxRetries) {
                $wait = (int) ($response->header('retry-after') ?? ($attempt + 1) * 2);
                \Log::warning("Groq rate-limited, retrying in {$wait}s (attempt " . ($attempt + 1) . ")");
                sleep(min($wait, 5));
                continue;
            }

            \Log::error('Groq multi-turn API failed', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'attempt' => $attempt + 1,
            ]);
            return null;
        }

        return null;
    }
}