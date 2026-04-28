<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->check() && auth()->user()->role === 'customer') {
            return $this->customerDashboard($request);
        }

        return Inertia::render('Home/Guest');
    }

    private function customerDashboard(Request $request)
    {
        $categories = Category::orderBy('name')->get();

        $restaurants = Restaurant::where('status', 'active')
            ->with('category')
            ->withCount('menuItems')
            ->orderBy('name')
            ->get();

        $promoRestaurantIds = Voucher::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->whereNotNull('restaurant_id')
            ->pluck('restaurant_id')
            ->unique()
            ->toArray();

        $deals = Voucher::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->with('restaurant')
            ->get();

        // Popular: user's municipality first, fallback to first 5
        $userMunicipality = auth()->user()->municipality;
        $popular = $userMunicipality
            ? $restaurants->where('municipality', $userMunicipality)->take(5)->values()
            : collect();
        if ($popular->count() < 3) {
            $popular = $restaurants->take(5);
        }

        // First available menu item per restaurant for quick-add cart button
        $featuredItemMap = MenuItem::where('is_available', true)
            ->whereIn('restaurant_id', $restaurants->pluck('id'))
            ->orderBy('id')
            ->get(['id', 'restaurant_id'])
            ->groupBy('restaurant_id')
            ->map(fn ($items) => $items->first()->id);

        $cartCount = auth()->user()->cartItems()->count();

        $favoriteIds = auth()->user()->favorites()->pluck('restaurant_id')->toArray();

        $weather    = $this->fetchWeather();
        $weatherTag = empty($weather) ? 'hot' : $this->resolveTag($weather);
        $suggested  = Category::where('weather_tag', $weatherTag)->get();

        // Weather-recommended menu items: dishes from restaurants whose cuisine matches the weather
        $suggestedCategoryIds = $suggested->pluck('id');
        $weatherItems = MenuItem::where('is_available', true)
            ->whereHas('restaurant', fn ($q) => $q->where('status', 'active')->whereIn('category_id', $suggestedCategoryIds))
            ->with('restaurant:id,name,municipality,image_url')
            ->inRandomOrder()
            ->limit(8)
            ->get(['id', 'restaurant_id', 'name', 'description', 'price', 'category', 'image_url']);

        // Claimed voucher codes for the current user
        $claimedCodes = [];
        if (auth()->check()) {
            $claimedCodes = \App\Models\ClaimedVoucher::where('user_id', auth()->id())
                ->join('vouchers', 'claimed_vouchers.voucher_id', '=', 'vouchers.id')
                ->pluck('vouchers.code')
                ->toArray();
        }

        return Inertia::render('Home/Customer', [
            'restaurants'       => $restaurants,
            'categories'        => $categories,
            'weather'           => $weather,
            'weatherTag'        => $weatherTag,
            'suggested'         => $suggested,
            'weatherItems'      => $weatherItems,
            'deals'             => $deals,
            'cartCount'         => $cartCount,
            'promoRestaurantIds'=> $promoRestaurantIds,
            'popular'           => $popular,
            'featuredItemMap'   => $featuredItemMap,
            'favoriteIds'       => $favoriteIds,
            'claimedCodes'      => $claimedCodes,
        ]);
    }

    private function fetchWeather(?string $city = null): array
    {
        $city = $city ?: (auth()->check() ? auth()->user()->municipality : null);
        $city = $city ? "{$city},PH" : config('services.owm.city');

        $response = Http::timeout(5)->get(config('services.owm.url'), [
            'q'     => $city,
            'appid' => config('services.owm.key'),
            'units' => 'metric',
        ]);

        return $response->successful() ? $response->json() : [];
    }

    private function resolveTag(array $weather): string
    {
        $main = $weather['weather'][0]['main'] ?? '';
        $temp = $weather['main']['temp'] ?? 30;

        return match (true) {
            in_array($main, ['Thunderstorm', 'Drizzle', 'Rain'])                                          => 'rainy',
            in_array($main, ['Clouds', 'Mist', 'Fog', 'Haze', 'Smoke', 'Dust', 'Sand', 'Ash', 'Squall']) => 'cloudy',
            $main === 'Snow'                                                                               => 'cool',
            $main === 'Clear' && $temp <= 24                                                               => 'cool',
            default                                                                                        => 'hot',
        };
    }
}