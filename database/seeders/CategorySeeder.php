<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Filipino',        'icon' => '🍜', 'weather_tag' => 'rainy'],
            ['name' => 'BBQ / Ihaw-Ihaw', 'icon' => '🔥', 'weather_tag' => 'cool'],
            ['name' => 'Cafe',            'icon' => '☕', 'weather_tag' => 'rainy'],
            ['name' => 'Bakery',          'icon' => '🍞', 'weather_tag' => 'cloudy'],
            ['name' => 'Fast Food',       'icon' => '🍔', 'weather_tag' => 'hot'],
            ['name' => 'Desserts',        'icon' => '🍨', 'weather_tag' => 'hot'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
