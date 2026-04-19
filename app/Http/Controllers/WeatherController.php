<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function index()
    {
        $response = Http::timeout(5)->get(config('services.owm.url'), [
            'q'     => config('services.owm.city'),
            'appid' => config('services.owm.key'),
            'units' => 'metric',
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Weather data unavailable.'], 503);
        }

        $data = $response->json();
        $main = $data['weather'][0]['main'] ?? '';
        $temp = $data['main']['temp'] ?? 30;

        return response()->json([
            'city'        => $data['name'] ?? config('services.owm.city'),
            'condition'   => $main,
            'description' => $data['weather'][0]['description'] ?? '',
            'icon'        => $data['weather'][0]['icon'] ?? '',
            'temp'        => round($temp),
            'feels_like'  => round($data['main']['feels_like'] ?? $temp),
            'humidity'    => $data['main']['humidity'] ?? null,
            'weather_tag' => $this->resolveTag($main, $temp),
        ]);
    }

    private function resolveTag(string $main, float $temp): string
    {
        return match (true) {
            in_array($main, ['Thunderstorm', 'Drizzle', 'Rain'])                                          => 'rainy',
            in_array($main, ['Clouds', 'Mist', 'Fog', 'Haze', 'Smoke', 'Dust', 'Sand', 'Ash', 'Squall']) => 'cloudy',
            $main === 'Snow'                                                                               => 'cool',
            $main === 'Clear' && $temp <= 24                                                               => 'cool',
            default                                                                                        => 'hot',
        };
    }
}