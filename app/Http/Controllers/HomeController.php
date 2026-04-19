<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Restaurant;
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

        $query = Restaurant::where('status', 'active')->with('category');

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $restaurants = $query->orderBy('name')->get();

        $weather    = $this->fetchWeather();
        $weatherTag = empty($weather) ? 'hot' : $this->resolveTag($weather);
        $suggested  = Category::where('weather_tag', $weatherTag)->get();

        return view('home-customer', compact('restaurants', 'categories', 'weather', 'weatherTag', 'suggested'));
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
