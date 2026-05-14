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

        // ── PALUGI / INACTIVE BRANCHES ────────────────────────────────────
        // 8 struggling branches — mix of very-low-order (palugi) and inactive (closed)
        //
        // INACTIVE (status = 'inactive'):
        //   - Lutong Bahay - San Pablo          (too far from base, low traffic)
        //   - Grill Masters - San Pablo         (palugi, eventually closed)
        //   - La Preciosa - Biñan               (couldn't compete with mall bakeries)
        //   - Mama Nena's - San Pablo           (poorest performer, shut down)
        //
        // PALUGI but still open (status = 'active', but very few orders in OrderSeeder):
        //   - Kape't Tinapay - Cabuyao          (low foot traffic area)
        //   - Bida Burger - Los Baños           (students prefer carinderias)
        //   - La Preciosa - San Pablo           (struggling, barely breaking even)
        //   - Mama Nena's - Cabuyao             (decent area but poor management)

        $restaurants = [

            // ── LUTONG BAHAY NI ALING ROSA (Filipino) ─────────────────────
            [
                'owner_id'     => $own['owner1@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Santa Cruz',
                'description'  => 'Authentic Filipino home cooking served fresh daily in the heart of Santa Cruz.',
                'address'      => '12 Rizal Avenue, Brgy. Poblacion',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2794,
                'lng'          => 121.4117,
                'status'       => 'active',  // ✅ Top performer
                'opening_time' => '10:00 AM',
                'closing_time' => '9:00 PM',
            ],
            [
                'owner_id'     => $own['owner1@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Pagsanjan',
                'description'  => 'Home-cooked Filipino comfort food right by the famous Pagsanjan Falls area.',
                'address'      => '5 Burgos Street, Brgy. Pinagsanjan',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2713,
                'lng'          => 121.4559,
                'status'       => 'active',  // ✅ Solid performer
                'opening_time' => '10:00 AM',
                'closing_time' => '9:00 PM',
            ],
            [
                'owner_id'     => $own['owner2@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Los Baños',
                'description'  => 'Hearty Filipino meals made the traditional way, near UPLB campus.',
                'address'      => '88 National Highway, Brgy. Batong Malake',
                'municipality' => 'Los Baños',
                'lat'          => 14.1692,
                'lng'          => 121.2436,
                'status'       => 'active',  // ✅ Growing steadily
                'opening_time' => '10:00 AM',
                'closing_time' => '9:00 PM',
            ],
            [
                'owner_id'     => $own['owner2@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - Calamba',
                'description'  => 'Lutong bahay na lasa sa bawat subo — now serving Calamba City.',
                'address'      => '34 Parian Road, Brgy. Parian',
                'municipality' => 'Calamba',
                'lat'          => 14.2116,
                'lng'          => 121.1653,
                'status'       => 'active',  // ✅ Moderate performer
                'opening_time' => '10:00 AM',
                'closing_time' => '9:00 PM',
            ],
            [
                'owner_id'     => $own['owner3@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => 'Lutong Bahay ni Aling Rosa - San Pablo',
                'description'  => 'Classic Filipino ulam served fresh every day in the City of Seven Lakes.',
                'address'      => '21 Mabini Street, Brgy. San Buenaventura',
                'municipality' => 'San Pablo',
                'lat'          => 14.0653,
                'lng'          => 121.3244,
                'status'       => 'inactive', // ❌ CLOSED — too far from base, low traffic
                'opening_time' => '10:00 AM',
                'closing_time' => '9:00 PM',
            ],

            // ── GRILL MASTERS PH (BBQ / Ihaw-Ihaw) ───────────────────────
            [
                'owner_id'     => $own['owner4@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Santa Cruz',
                'description'  => 'Charcoal-grilled Filipino BBQ at its finest, right in Santa Cruz.',
                'address'      => '7 Quezon Avenue, Brgy. Poblacion',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2821,
                'lng'          => 121.4089,
                'status'       => 'active',  // ✅ Strong performer
                'opening_time' => '11:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner4@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Calamba',
                'description'  => 'Fresh grilled meats and seafood over live charcoal in Calamba City.',
                'address'      => '56 Real Street, Brgy. Real',
                'municipality' => 'Calamba',
                'lat'          => 14.2089,
                'lng'          => 121.1701,
                'status'       => 'active',  // ✅ Top performer overall
                'opening_time' => '11:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner5@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - Sta. Rosa',
                'description'  => 'BBQ done right in the lifestyle capital of Laguna — Sta. Rosa City.',
                'address'      => 'G/F Paseo de Sta. Rosa, Brgy. Tagapo',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3122,
                'lng'          => 121.1114,
                'status'       => 'active',  // ✅ Decent mall-area traffic
                'opening_time' => '11:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner5@hapag.com'],
                'category_id'  => $cat['BBQ / Ihaw-Ihaw'],
                'name'         => 'Grill Masters PH - San Pablo',
                'description'  => 'Smoked and grilled Filipino favorites served fresh in San Pablo City.',
                'address'      => '14 Real Avenue, Brgy. Concepcion',
                'municipality' => 'San Pablo',
                'lat'          => 14.0678,
                'lng'          => 121.3289,
                'status'       => 'inactive', // ❌ CLOSED — palugi, eventually shut down
                'opening_time' => '11:00 AM',
                'closing_time' => '10:00 PM',
            ],

            // ── KAPE'T TINAPAY (Cafe) ─────────────────────────────────────
            [
                'owner_id'     => $own['owner6@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Pagsanjan",
                'description'  => 'Your cozy coffee-and-bread stop in the heritage town of Pagsanjan.',
                'address'      => '3 General Luna Street, Brgy. Poblacion',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2698,
                'lng'          => 121.4612,
                'status'       => 'active',  // ✅ Best cafe branch
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],
            [
                'owner_id'     => $own['owner6@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Santa Cruz",
                'description'  => 'Brewed-to-order kape and freshly baked tinapay in the capital of Laguna.',
                'address'      => '2/F Laguna Town Center, Brgy. Bubukal',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2774,
                'lng'          => 121.4143,
                'status'       => 'active',  // ✅ Consistent orders
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],
            [
                'owner_id'     => $own['owner7@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Los Baños",
                'description'  => 'A quiet café favorite among UPLB students and faculty in Los Baños.',
                'address'      => '101 JP Rizal Street, Brgy. Anos',
                'municipality' => 'Los Baños',
                'lat'          => 14.1705,
                'lng'          => 121.2451,
                'status'       => 'active',  // ✅ Student crowd keeps it alive
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],
            [
                'owner_id'     => $own['owner7@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Biñan",
                'description'  => 'Warm coffee and fresh pastries for your morning commute in Biñan City.',
                'address'      => 'Halang Road corner Magsaysay Avenue, Brgy. Halang',
                'municipality' => 'Biñan',
                'lat'          => 14.3394,
                'lng'          => 121.0789,
                'status'       => 'active',  // ✅ Commuter traffic
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],
            [
                'owner_id'     => $own['owner8@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Sta. Rosa",
                'description'  => 'Specialty coffee and artisan bread in the busy commercial hub of Sta. Rosa.',
                'address'      => 'Nueno Avenue, Brgy. Tagapo',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3098,
                'lng'          => 121.1089,
                'status'       => 'active',  // ✅ Good mall-adjacent footfall
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],
            [
                'owner_id'     => $own['owner8@hapag.com'],
                'category_id'  => $cat['Cafe'],
                'name'         => "Kape't Tinapay - Cabuyao",
                'description'  => 'A neighborhood café serving great kape and tinapay in Cabuyao City.',
                'address'      => 'Governor\'s Drive, Brgy. Banay-Banay',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2742,
                'lng'          => 121.1253,
                'status'       => 'active',  // ⚠️  PALUGI — low foot traffic, barely surviving
                'opening_time' => '7:00 AM',
                'closing_time' => '8:00 PM',
            ],

            // ── LA PRECIOSA BAKERY (Bakery) ───────────────────────────────
            [
                'owner_id'     => $own['owner9@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Pagsanjan',
                'description'  => 'Handcrafted breads and Filipino kakanin baked fresh daily in Pagsanjan.',
                'address'      => '8 Zamora Street, Brgy. Lambac',
                'municipality' => 'Pagsanjan',
                'lat'          => 14.2721,
                'lng'          => 121.4531,
                'status'       => 'active',  // ✅ Star branch — thriving
                'opening_time' => '5:30 AM',
                'closing_time' => '7:00 PM',
            ],
            [
                'owner_id'     => $own['owner9@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Calamba',
                'description'  => 'Freshly baked pastries and cakes delivered with love in Calamba City.',
                'address'      => '22 Nacional Street, Brgy. Uno',
                'municipality' => 'Calamba',
                'lat'          => 14.2143,
                'lng'          => 121.1632,
                'status'       => 'active',  // ✅ Decent revenue
                'opening_time' => '5:30 AM',
                'closing_time' => '7:00 PM',
            ],
            [
                'owner_id'     => $own['owner10@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - San Pablo',
                'description'  => 'Beloved bakery bringing soft pandesal and sweet pastries to San Pablo City.',
                'address'      => '45 Rizal Street, Brgy. San Rafael',
                'municipality' => 'San Pablo',
                'lat'          => 14.0629,
                'lng'          => 121.3271,
                'status'       => 'active',  // ⚠️  PALUGI — struggling, barely breaking even
                'opening_time' => '5:30 AM',
                'closing_time' => '7:00 PM',
            ],
            [
                'owner_id'     => $own['owner10@hapag.com'],
                'category_id'  => $cat['Bakery'],
                'name'         => 'La Preciosa Bakery - Biñan',
                'description'  => 'Wake up to fresh-baked bread and pastries every morning in Biñan City.',
                'address'      => 'Gen. Luna Road, Brgy. Poblacion',
                'municipality' => 'Biñan',
                'lat'          => 14.3412,
                'lng'          => 121.0814,
                'status'       => 'inactive', // ❌ CLOSED — mall bakeries dominated, couldn't compete
                'opening_time' => '5:30 AM',
                'closing_time' => '7:00 PM',
            ],

            // ── MAMA NENA'S CARINDERIA (Filipino) ─────────────────────────
            [
                'owner_id'     => $own['owner11@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Los Baños",
                'description'  => 'Turo-turo style home cooking with the best ulam in Los Baños.',
                'address'      => '55 CP Garcia Avenue, Brgy. Putho Tuntungin',
                'municipality' => 'Los Baños',
                'lat'          => 14.1678,
                'lng'          => 121.2462,
                'status'       => 'active',  // ✅ Top carinderia branch
                'opening_time' => '7:00 AM',
                'closing_time' => '3:00 PM',
            ],
            [
                'owner_id'     => $own['owner11@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Santa Cruz",
                'description'  => 'Sarap ng lutong bahay — Mama Nena\'s brings comfort food to Santa Cruz.',
                'address'      => '19 Bonifacio Street, Brgy. Market Area',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2812,
                'lng'          => 121.4132,
                'status'       => 'active',  // ✅ Market area = steady crowd
                'opening_time' => '7:00 AM',
                'closing_time' => '3:00 PM',
            ],
            [
                'owner_id'     => $own['owner12@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Cabuyao",
                'description'  => 'Affordable and filling Filipino ulam for the hardworking folk of Cabuyao.',
                'address'      => 'Governor\'s Drive, Brgy. Sala',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2763,
                'lng'          => 121.1231,
                'status'       => 'active',  // ⚠️  PALUGI — poor management, inconsistent quality
                'opening_time' => '7:00 AM',
                'closing_time' => '3:00 PM',
            ],
            [
                'owner_id'     => $own['owner12@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - Sta. Rosa",
                'description'  => 'Hot and ready Filipino meals served cafeteria-style in Sta. Rosa City.',
                'address'      => 'Balibago, Brgy. Balibago',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3145,
                'lng'          => 121.1098,
                'status'       => 'active',  // ✅ Solid worker crowd at lunch
                'opening_time' => '7:00 AM',
                'closing_time' => '3:00 PM',
            ],
            [
                'owner_id'     => $own['owner13@hapag.com'],
                'category_id'  => $cat['Filipino'],
                'name'         => "Mama Nena's Carinderia - San Pablo",
                'description'  => 'Simple, satisfying Filipino food at honest prices in San Pablo City.',
                'address'      => '7 Coliseum Road, Brgy. San Gregorio',
                'municipality' => 'San Pablo',
                'lat'          => 14.0641,
                'lng'          => 121.3258,
                'status'       => 'inactive', // ❌ CLOSED — poorest performer, shut down after losses
                'opening_time' => '7:00 AM',
                'closing_time' => '3:00 PM',
            ],

            // ── BIDA BURGER (Fast Food) ────────────────────────────────────
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Calamba',
                'description'  => 'Juicy burgers and crispy sides with a Filipino twist in Calamba City.',
                'address'      => 'Brgy. Real, National Highway',
                'municipality' => 'Calamba',
                'lat'          => 14.2134,
                'lng'          => 121.1678,
                'status'       => 'active',  // ✅ Great location, high traffic
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Biñan',
                'description'  => 'Fast and filling burgers for the busy crowd in Biñan City.',
                'address'      => 'Biñan Commercial Complex, Brgy. Ganado',
                'municipality' => 'Biñan',
                'lat'          => 14.3378,
                'lng'          => 121.0801,
                'status'       => 'active',  // ✅ Commuter and student traffic
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner14@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Sta. Rosa',
                'description'  => 'Your go-to burger spot near Nuvali and the malls of Sta. Rosa.',
                'address'      => 'Sta. Rosa-Tagaytay Road, Brgy. Balibago',
                'municipality' => 'Sta. Rosa',
                'lat'          => 14.3109,
                'lng'          => 121.1136,
                'status'       => 'active',  // ✅ Best Bida branch — mall-adjacent boom
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Cabuyao',
                'description'  => 'Hot burgers and cold drinks served fast in Cabuyao City.',
                'address'      => 'Governor\'s Drive, Brgy. Bigaa',
                'municipality' => 'Cabuyao',
                'lat'          => 14.2751,
                'lng'          => 121.1269,
                'status'       => 'active',  // ✅ Moderate but reliable
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Santa Cruz',
                'description'  => 'Classic Bida Burger flavor now available in the Laguna capital.',
                'address'      => 'Maharlika Highway, Brgy. Bubukal',
                'municipality' => 'Santa Cruz',
                'lat'          => 14.2802,
                'lng'          => 121.4098,
                'status'       => 'active',  // ✅ Good highway exposure
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
            [
                'owner_id'     => $own['owner15@hapag.com'],
                'category_id'  => $cat['Fast Food'],
                'name'         => 'Bida Burger - Los Baños',
                'description'  => 'Burgers and fries for the students and researchers of Los Baños.',
                'address'      => '33 National Highway, Brgy. Bayog',
                'municipality' => 'Los Baños',
                'lat'          => 14.1712,
                'lng'          => 121.2418,
                'status'       => 'active',  // ⚠️  PALUGI — students prefer carinderias, slow sales
                'opening_time' => '9:00 AM',
                'closing_time' => '10:00 PM',
            ],
        ];

        // Map brand names to cover images in public/images/restaurants/
        $brandImages = [
            'Lutong Bahay'   => '/images/restaurants/lutong-bahay.png',
            'Grill Masters'  => '/images/restaurants/grill-masters.png',
            "Kape't Tinapay" => '/images/restaurants/kape-tinapay.png',
            'La Preciosa'    => '/images/restaurants/la-preciosa.png',
            "Mama Nena"      => '/images/restaurants/mama-nenas.png',
            'Bida Burger'    => '/images/restaurants/bida-burger.png',
        ];

        foreach ($restaurants as $data) {
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