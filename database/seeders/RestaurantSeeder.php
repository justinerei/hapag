<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch category IDs keyed by name
        $cat = Category::pluck('id', 'name');

        // Fetch owner IDs keyed by email
        $own = User::where('role', 'owner')->pluck('id', 'email');

        // 30 branches across 8 Laguna cities
        // Coordinates are hardcoded — never geocoded (per project rules)
        $restaurants = [

            // ── LUTONG BAHAY NI ALING ROSA (Filipino) ─────────────────────
            [
                'owner_id'     => $own['owner1@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Santa Cruz',
                'description'  => 'Authentic Filipino home cooking served fresh daily in the heart of Santa Cruz.',
                'address'      => '12 Rizal Avenue, Poblacion',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2794,
                'lng'          => 121.4117,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner1@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Pagsanjan',
                'description'  => 'Home-cooked Filipino comfort food right by the famous Pagsanjan Falls area.',
                'address'      => '5 Burgos Street, Barangay Pinagsanjan',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2713,
                'lng'          => 121.4559,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner2@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Los Baños',
                'description'  => 'Hearty Filipino meals made the traditional way, near UPLB campus.',
                'address'      => '88 National Highway, Batong Malake',
                'municipality' => 'Los Baños',
                'lat'          => 14.1692,
                'lng'          => 121.2436,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner2@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Calamba',
                'description'  => 'Lutong bahay na lasa sa bawat subo — now serving Calamba City.',
                'address'      => '34 Parian Road, Barangay Parian',
                'municipality' => 'Calamba',
                'lat'          => 14.2116,
                'lng'          => 121.1653,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner3@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - San Pablo',
                'description'  => 'Classic Filipino ulam served fresh every day in the City of Seven Lakes.',
                'address'      => '21 Mabini Street, Barangay San Buenaventura',
                'municipality' => 'San Pablo',
                'lat'          => 14.0653,
                'lng'          => 121.3244,
                'status'       => 'active',
            ],

            // ── GRILL MASTERS PH (BBQ / Ihaw-Ihaw) ───────────────────────
            [
                'owner_id'     => $own['owner4@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Santa Cruz',
                'description'  => 'Charcoal-grilled Filipino BBQ at its finest, right in Santa Cruz.',
                'address'      => '7 Quezon Avenue, Poblacion',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2821,
                'lng'          => 121.4089,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner4@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Calamba',
                'description'  => 'Fresh grilled meats and seafood over live charcoal in Calamba City.',
                'address'      => '56 Real Street, Barangay Real',
                'municipality' => 'Calamba',
                'lat'          => 14.2089,
                'lng'          => 121.1701,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner5@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Sta. Rosa',
                'description'  => 'BBQ done right in the lifestyle capital of Laguna — Sta. Rosa City.',
                'address'      => 'G/F Paseo de Sta. Rosa, Tagaytay Road',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3122,
                'lng'          => 121.1114,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner5@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - San Pablo',
                'description'  => 'Smoked and grilled Filipino favorites served fresh in San Pablo City.',
                'address'      => '14 Real Avenue, Barangay Concepcion',
                'municipality' => 'San Pablo',
                'lat'          => 14.0678,
                'lng'          => 121.3289,
                'status'       => 'active',
            ],

            // ── KAPE'T TINAPAY (Cafe) ─────────────────────────────────────
            [
                'owner_id'     => $own['owner6@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Pagsanjan",
                'description'  => 'Your cozy coffee-and-bread stop in the heritage town of Pagsanjan.',
                'address'      => '3 General Luna Street, Poblacion',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2698,
                'lng'          => 121.4612,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner6@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Santa Cruz",
                'description'  => 'Brewed-to-order kape and freshly baked tinapay in the capital of Laguna.',
                'address'      => '2/F Laguna Town Center, Maharlika Highway',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2774,
                'lng'          => 121.4143,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner7@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Los Baños",
                'description'  => 'A quiet café favorite among UPLB students and faculty in Los Baños.',
                'address'      => '101 JP Rizal Street, Barangay Anos',
                'municipality' => 'Los Baños',
                'lat'          => 14.1705,
                'lng'          => 121.2451,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner7@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Biñan",
                'description'  => 'Warm coffee and fresh pastries for your morning commute in Biñan City.',
                'address'      => 'Halang Road corner Magsaysay Avenue',
                'municipality' => 'Biñan',
                'lat'          => 14.3394,
                'lng'          => 121.0789,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner8@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Sta. Rosa",
                'description'  => 'Specialty coffee and artisan bread in the busy commercial hub of Sta. Rosa.',
                'address'      => 'Nueno Avenue, Barangay Tagapo',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3098,
                'lng'          => 121.1089,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner8@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Cabuyao",
                'description'  => 'A neighborhood café serving great kape and tinapay in Cabuyao City.',
                'address'      => 'Barangay Banay-Banay, Cabuyao City',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2742,
                'lng'          => 121.1253,
                'status'       => 'active',
            ],

            // ── LA PRECIOSA BAKERY (Bakery) ───────────────────────────────
            [
                'owner_id'     => $own['owner9@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Pagsanjan',
                'description'  => 'Handcrafted breads and Filipino kakanin baked fresh daily in Pagsanjan.',
                'address'      => '8 Zamora Street, Barangay Lambac',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2721,
                'lng'          => 121.4531,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner9@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Calamba',
                'description'  => 'Freshly baked pastries and cakes delivered with love in Calamba City.',
                'address'      => '22 Nacional Street, Barangay Uno',
                'municipality' => 'Calamba',
                'lat'          => 14.2143,
                'lng'          => 121.1632,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner10@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - San Pablo',
                'description'  => 'Beloved bakery bringing soft pandesal and sweet pastries to San Pablo City.',
                'address'      => '45 Rizal Street, Barangay San Rafael',
                'municipality' => 'San Pablo',
                'lat'          => 14.0629,
                'lng'          => 121.3271,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner10@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Biñan',
                'description'  => 'Wake up to fresh-baked bread and pastries every morning in Biñan City.',
                'address'      => 'Gen. Luna Road, Barangay Poblacion',
                'municipality' => 'Biñan',
                'lat'          => 14.3412,
                'lng'          => 121.0814,
                'status'       => 'active',
            ],

            // ── MAMA NENA'S CARINDERIA (Filipino) ────────────────────────
            [
                'owner_id'     => $own['owner11@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Los Baños",
                'description'  => 'Turo-turo style home cooking with the best ulam in Los Baños.',
                'address'      => '55 CP Garcia Avenue, Barangay Putho Tuntungin',
                'municipality' => 'Los Baños',
                'lat'          => 14.1678,
                'lng'          => 121.2462,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner11@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Santa Cruz",
                'description'  => 'Sarap ng lutong bahay — Mama Nena\'s brings comfort food to Santa Cruz.',
                'address'      => '19 Bonifacio Street, Barangay Market Area',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2812,
                'lng'          => 121.4132,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner12@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Cabuyao",
                'description'  => 'Affordable and filling Filipino ulam for the hardworking folk of Cabuyao.',
                'address'      => 'Governor\'s Drive, Barangay Sala',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2763,
                'lng'          => 121.1231,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner12@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Sta. Rosa",
                'description'  => 'Hot and ready Filipino meals served cafeteria-style in Sta. Rosa City.',
                'address'      => 'Balibago, Sta. Rosa-Tagaytay Road',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3145,
                'lng'          => 121.1098,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner13@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - San Pablo",
                'description'  => 'Simple, satisfying Filipino food at honest prices in San Pablo City.',
                'address'      => '7 Coliseum Road, Barangay San Gregorio',
                'municipality' => 'San Pablo',
                'lat'          => 14.0641,
                'lng'          => 121.3258,
                'status'       => 'active',
            ],

            // ── BIDA BURGER (Fast Food) ───────────────────────────────────
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Calamba',
                'description'  => 'Juicy burgers and crispy sides with a Filipino twist in Calamba City.',
                'address'      => 'Brgy. Real, National Highway, Calamba City',
                'municipality' => 'Calamba',
                'lat'          => 14.2134,
                'lng'          => 121.1678,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Biñan',
                'description'  => 'Fast and filling burgers for the busy crowd in Biñan City.',
                'address'      => 'Biñan Commercial Complex, McArthur Highway',
                'municipality' => 'Biñan',
                'lat'          => 14.3378,
                'lng'          => 121.0801,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Sta. Rosa',
                'description'  => 'Your go-to burger spot near Nuvali and the malls of Sta. Rosa.',
                'address'      => 'Sta. Rosa-Tagaytay Road, Barangay Balibago',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3109,
                'lng'          => 121.1136,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Cabuyao',
                'description'  => 'Hot burgers and cold drinks served fast in Cabuyao City.',
                'address'      => 'Governor\'s Drive, Barangay Bigaa',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2751,
                'lng'          => 121.1269,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Santa Cruz',
                'description'  => 'Classic Bida Burger flavor now available in the Laguna capital.',
                'address'      => 'Maharlika Highway, Barangay Bubukal',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2802,
                'lng'          => 121.4098,
                'status'       => 'active',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Los Baños',
                'description'  => 'Burgers and fries for the students and researchers of Los Baños.',
                'address'      => '33 National Highway, Barangay Bayog',
                'municipality' => 'Los Baños',
                'lat'          => 14.1712,
                'lng'          => 121.2418,
                'status'       => 'active',
            ],
        ];

        // Map brand names to cover images in public/images/restaurants/
        $brandImages = [
            'Lutong Bahay'     => '/images/restaurants/lutong-bahay.png',
            'Grill Masters'    => '/images/restaurants/grill-masters.png',
            "Kape't Tinapay"   => '/images/restaurants/kape-tinapay.png',
            'La Preciosa'      => '/images/restaurants/la-preciosa.png',
            "Mama Nena"        => '/images/restaurants/mama-nenas.png',
            'Bida Burger'      => '/images/restaurants/bida-burger.png',
        ];

        foreach ($restaurants as $data) {
            // Auto-assign image_url based on brand name prefix
            foreach ($brandImages as $prefix => $img) {
                if (str_starts_with($data['name'], $prefix)) {
                    $data['image_url'] = $img;
                    break;
                }
            }
            Restaurant::create($data);
        }
    }
}