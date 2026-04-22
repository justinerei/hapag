<?php

namespace App\Http\Controllers;

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

        return view('home-guest');
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

        return view('home-customer', compact(
            'restaurants', 'categories', 'weather', 'weatherTag',
            'suggested', 'deals', 'cartCount', 'promoRestaurantIds',
            'popular', 'featuredItemMap', 'favoriteIds'
        ));
    }

    private function fetchWeather(): array
    {
        $response = Http::timeout(5)->get(config('services.owm.url'), [
            'q'     => config('services.owm.city'),
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