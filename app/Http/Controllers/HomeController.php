<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Support\Facades\Http;

class HomeController extends Controller
{
    public function index()
    {
        $weather    = $this->fetchWeather();
        $weatherTag = $this->resolveTag($weather);

        $featured = Restaurant::with('category')
            ->where('status', 'active')
            ->whereHas('category', fn ($q) => $q->where('weather_tag', $weatherTag))
            ->inRandomOrder()
            ->limit(6)
            ->get();

        // Fallback: if no restaurants match the tag, show any active ones
        if ($featured->isEmpty()) {
            $featured = Restaurant::with('category')
                ->where('status', 'active')
                ->inRandomOrder()
                ->limit(6)
                ->get();
        }

        return view('home', compact('weather', 'weatherTag', 'featured'));
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
