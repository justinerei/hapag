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