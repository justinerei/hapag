<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    // Round price to the nearest ₱5 after applying the city multiplier
    private function price(float $base, string $municipality): string
    {
        $multipliers = [
            'Biñan'      => 1.10,
            'Sta. Rosa'  => 1.10,
            'Calamba'    => 1.08,
            'Cabuyao'    => 1.08,
            'Santa Cruz' => 1.00,
            'Los Baños'  => 1.00,
            'Pagsanjan'  => 1.00,
            'San Pablo'  => 0.95,
        ];

        $multiplier = $multipliers[$municipality] ?? 1.00;
        return number_format(round(($base * $multiplier) / 5) * 5, 2, '.', '');
    }

    // Base menus per brand — 15 items each
    // Prices are in Philippine Pesos at Santa Cruz base rate (2024 realistic pricing)
    private function brandMenu(string $brand): array
    {
        return match (true) {

            // ── LUTONG BAHAY NI ALING ROSA ────────────────────────────────
            // Sit-down Filipino restaurant, mid-range pricing
            str_contains($brand, 'Lutong Bahay') => [
                ['name' => 'Sinigang na Baboy',   'description' => 'Tender pork ribs in a sour tamarind broth with kangkong and radish.',         'price' => 220, 'category' => 'Sabaw'],
                ['name' => 'Adobong Manok',        'description' => 'Chicken braised in vinegar, soy sauce, garlic, and bay leaves.',               'price' => 195, 'category' => 'Ulam'],
                ['name' => 'Kare-Kare',            'description' => 'Oxtail and tripe stew in a creamy peanut sauce, served with bagoong.',        'price' => 310, 'category' => 'Ulam'],
                ['name' => 'Pinakbet',             'description' => 'Mixed vegetables sautéed with bagoong alamang and pork.',                      'price' => 175, 'category' => 'Ulam'],
                ['name' => 'Lechon Kawali',        'description' => 'Deep-fried pork belly with crispy skin, served with liver sauce.',             'price' => 245, 'category' => 'Ulam'],
                ['name' => 'Nilaga ng Baka',       'description' => 'Slow-cooked beef with potatoes and pechay in a clear broth.',                  'price' => 280, 'category' => 'Sabaw'],
                ['name' => 'Tinolang Manok',       'description' => 'Ginger-broth chicken soup with green papaya and chili leaves.',                'price' => 195, 'category' => 'Sabaw'],
                ['name' => 'Paksiw na Bangus',     'description' => 'Milkfish simmered in vinegar with garlic and vegetables.',                     'price' => 175, 'category' => 'Ulam'],
                ['name' => 'Pancit Bihon',         'description' => 'Stir-fried rice noodles with vegetables and chicken in soy-citrus sauce.',     'price' => 185, 'category' => 'Pansit'],
                ['name' => 'Pritong Tilapia',      'description' => 'Whole tilapia deep-fried to golden crisp, served with spiced vinegar.',        'price' => 185, 'category' => 'Ulam'],
                ['name' => 'Bulalo',               'description' => 'Slow-simmered beef bone marrow soup — a true Laguna classic.',                 'price' => 380, 'category' => 'Sabaw'],
                ['name' => 'Tortang Talong',       'description' => 'Grilled eggplant egg omelet, pan-fried until golden.',                         'price' => 145, 'category' => 'Ulam'],
                ['name' => 'Steamed Rice',         'description' => 'Freshly cooked plain white rice.',                                             'price' =>  45, 'category' => 'Kanin'],
                ['name' => 'Garlic Rice',          'description' => 'Fragrant sinangag with toasted garlic.',                                       'price' =>  55, 'category' => 'Kanin'],
                ['name' => 'Buko Juice',           'description' => 'Fresh young coconut juice served chilled.',                                    'price' =>  75, 'category' => 'Inumin'],
            ],

            // ── GRILL MASTERS PH ──────────────────────────────────────────
            // BBQ restaurant — charcoal-grilled, slightly premium pricing
            str_contains($brand, 'Grill Masters') => [
                ['name' => 'Inihaw na Liempo',        'description' => 'Marinated pork belly grilled over charcoal, served with atchara.',             'price' => 285, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Chicken Inasal',          'description' => 'Bacolod-style grilled chicken in lemongrass and calamansi marinade.',          'price' => 245, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'BBQ Pork Skewer (3 pcs)', 'description' => 'Classic Filipino BBQ pork skewers with sweet soy glaze.',                      'price' => 120, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Inihaw na Pusit',         'description' => 'Whole squid grilled with butter and soy sauce.',                              'price' => 250, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Grilled Tilapia',         'description' => 'Whole tilapia grilled in banana leaf with onions and tomatoes.',               'price' => 220, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Chicharon Bulaklak',      'description' => 'Deep-fried pork intestines, crispy and golden.',                              'price' => 195, 'category' => 'Extras'],
                ['name' => 'Lechon Manok (half)',     'description' => 'Rotisserie-style half chicken served with silog sauce.',                       'price' => 295, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Pork Belly BBQ Platter',  'description' => 'Thick-cut charcoal-grilled pork belly served with java rice.',                 'price' => 340, 'category' => 'Ihaw-Ihaw'],
                ['name' => 'Grilled Eggplant Salad',  'description' => 'Charred eggplant with tomatoes, onions, and salted egg.',                      'price' => 115, 'category' => 'Extras'],
                ['name' => 'Java Rice',               'description' => 'Tomato-and-garlic fried rice — the perfect grilled meat companion.',           'price' =>  75, 'category' => 'Kanin'],
                ['name' => 'Atchara',                 'description' => 'House-made pickled green papaya, a refreshing palate cleanser.',               'price' =>  60, 'category' => 'Extras'],
                ['name' => 'Corn on the Cob',         'description' => 'Grilled sweet corn with butter and grated cheese.',                            'price' =>  85, 'category' => 'Extras'],
                ['name' => 'Bottomless Iced Tea',     'description' => 'Freshly brewed iced tea with unlimited refills.',                              'price' =>  99, 'category' => 'Inumin'],
                ['name' => 'Buko Juice',              'description' => 'Cold young coconut juice.',                                                   'price' =>  75, 'category' => 'Inumin'],
                ['name' => 'Softdrinks (can)',         'description' => 'Canned softdrinks in assorted flavors.',                                       'price' =>  55, 'category' => 'Inumin'],
            ],

            // ── KAPE'T TINAPAY ────────────────────────────────────────────
            // Café — coffee shop pricing, espresso-based drinks included
            str_contains($brand, "Kape't Tinapay") => [
                ['name' => 'Brewed Coffee',       'description' => 'House-blend drip coffee, served hot.',                                         'price' =>  85, 'category' => 'Mainit na Inumin'],
                ['name' => 'Kapeng Barako',        'description' => 'Bold Batangas barako coffee, served hot.',                                     'price' =>  95, 'category' => 'Mainit na Inumin'],
                ['name' => 'Cafe Latte',           'description' => 'Espresso with steamed milk, served hot.',                                      'price' => 155, 'category' => 'Mainit na Inumin'],
                ['name' => 'Spanish Latte',        'description' => 'Espresso with condensed milk and steamed milk.',                              'price' => 165, 'category' => 'Mainit na Inumin'],
                ['name' => 'Iced Coffee',          'description' => 'Cold-brewed coffee over ice with your choice of milk.',                       'price' => 145, 'category' => 'Malamig na Inumin'],
                ['name' => 'Hot Chocolate',        'description' => 'Rich and creamy hot tablea chocolate.',                                       'price' => 130, 'category' => 'Mainit na Inumin'],
                ['name' => 'Matcha Latte',         'description' => 'Japanese matcha powder with steamed milk, available hot or iced.',            'price' => 165, 'category' => 'Malamig na Inumin'],
                ['name' => 'Pandesal (per piece)', 'description' => 'Classic Filipino bread roll, soft and slightly sweet.',                       'price' =>  18, 'category' => 'Tinapay'],
                ['name' => 'Ensaymada',            'description' => 'Soft brioche bun topped with butter, sugar, and grated cheese.',             'price' =>  75, 'category' => 'Pastry'],
                ['name' => 'Mamon',                'description' => 'Light and fluffy Filipino chiffon cupcake.',                                  'price' =>  60, 'category' => 'Pastry'],
                ['name' => 'Putok',                'description' => 'Hard-crusted bun with a soft, chewy inside.',                                'price' =>  25, 'category' => 'Tinapay'],
                ['name' => 'Monay',                'description' => 'Dense and slightly sweet bread roll, best with coffee.',                      'price' =>  30, 'category' => 'Tinapay'],
                ['name' => 'Bibingka',             'description' => 'Traditional rice cake with salted egg and coconut, baked to order.',         'price' =>  95, 'category' => 'Kakanin'],
                ['name' => 'Buko Pie (slice)',     'description' => 'Creamy young coconut filling in a flaky pastry crust.',                      'price' => 105, 'category' => 'Pastry'],
                ['name' => 'Polvoron (3 pcs)',     'description' => 'Crumbly Filipino shortbread candy with milk and toasted flour.',             'price' =>  65, 'category' => 'Pastry'],
            ],

            // ── LA PRECIOSA BAKERY ────────────────────────────────────────
            // Neighborhood bakery — accessible everyday pricing
            str_contains($brand, 'La Preciosa') => [
                ['name' => 'Pandesal (per piece)', 'description' => 'Soft Filipino bread roll dusted with fine breadcrumbs.',                      'price' =>  12, 'category' => 'Pan at Tinapay'],
                ['name' => 'Ube Pandesal',         'description' => 'Purple yam-flavored pandesal with creamy ube filling.',                      'price' =>  22, 'category' => 'Pan at Tinapay'],
                ['name' => 'Spanish Bread',        'description' => 'Rolled bread stuffed with sweetened breadcrumbs and butter.',                'price' =>  28, 'category' => 'Pan at Tinapay'],
                ['name' => 'Cheese Bread',         'description' => 'Soft pull-apart bread topped with melted cheese and cream.',                 'price' =>  35, 'category' => 'Pan at Tinapay'],
                ['name' => 'Monay',                'description' => 'Classic dense bread roll, pairs well with coffee.',                          'price' =>  22, 'category' => 'Pan at Tinapay'],
                ['name' => 'Putok',                'description' => 'Star-shaped bun with a crusty exterior and soft inside.',                    'price' =>  18, 'category' => 'Pan at Tinapay'],
                ['name' => 'Ensaymada',            'description' => 'Buttery coiled bread with a generous grated cheese topping.',               'price' =>  75, 'category' => 'Pastry'],
                ['name' => 'Mamon',                'description' => 'Light Filipino sponge cupcake, perfect with butter.',                        'price' =>  55, 'category' => 'Pastry'],
                ['name' => 'Cinnamon Roll',        'description' => 'Freshly baked cinnamon swirl roll with cream cheese glaze.',                'price' =>  85, 'category' => 'Pastry'],
                ['name' => 'Chocolate Cake Slice', 'description' => 'Moist layered chocolate cake with dark ganache frosting.',                  'price' => 145, 'category' => 'Cake'],
                ['name' => 'Ube Cake Slice',       'description' => 'Fluffy purple yam cake filled and frosted with ube halaya cream.',          'price' => 145, 'category' => 'Cake'],
                ['name' => 'Buko Pie (whole)',     'description' => 'Whole buko pie with creamy coconut filling — serves 6 to 8.',               'price' => 420, 'category' => 'Pastry'],
                ['name' => 'Maja Blanca',          'description' => 'Creamy coconut milk pudding topped with corn and latik.',                   'price' =>  95, 'category' => 'Kakanin'],
                ['name' => 'Leche Flan',           'description' => 'Classic caramel custard, steamed to silky perfection.',                     'price' => 105, 'category' => 'Kakanin'],
                ['name' => 'Yema Cake Slice',      'description' => 'Soft chiffon cake filled and frosted with sweet yema cream.',              'price' => 125, 'category' => 'Cake'],
            ],

            // ── MAMA NENA'S CARINDERIA ────────────────────────────────────
            // Budget carinderia — turo-turo pricing, affordable everyday meals
            str_contains($brand, "Mama Nena") => [
                ['name' => 'Pritong Isda',       'description' => 'Deep-fried fish of the day, crispy and golden.',                                'price' => 110, 'category' => 'Ulam'],
                ['name' => 'Adobong Manok',      'description' => 'Classic chicken adobo, slow-cooked until tender.',                             'price' => 105, 'category' => 'Ulam'],
                ['name' => 'Menudo',             'description' => 'Pork and liver stew with potatoes and tomato sauce.',                           'price' => 110, 'category' => 'Ulam'],
                ['name' => 'Tortang Talong',     'description' => 'Grilled eggplant egg omelet, pan-fried.',                                      'price' =>  85, 'category' => 'Ulam'],
                ['name' => 'Ginisang Ampalaya',  'description' => 'Sautéed bitter melon with egg and garlic.',                                    'price' =>  75, 'category' => 'Gulay'],
                ['name' => 'Paksiw na Bangus',   'description' => 'Milkfish cooked in vinegar with ginger and vegetables.',                       'price' => 105, 'category' => 'Ulam'],
                ['name' => 'Dinuguan',           'description' => 'Savory pork blood stew with chili and vinegar.',                               'price' => 110, 'category' => 'Ulam'],
                ['name' => 'Sinigang na Baboy',  'description' => 'Classic tamarind pork soup with kangkong and radish.',                         'price' => 130, 'category' => 'Sabaw'],
                ['name' => 'Chopsuey',           'description' => 'Stir-fried mixed vegetables with quail eggs.',                                 'price' =>  95, 'category' => 'Gulay'],
                ['name' => 'Monggo Guisado',     'description' => 'Mung bean soup with pork and malunggay leaves.',                              'price' =>  85, 'category' => 'Sabaw'],
                ['name' => 'Lechon Kawali',      'description' => 'Crispy deep-fried pork belly served with spiced vinegar.',                     'price' => 130, 'category' => 'Ulam'],
                ['name' => 'Steamed Rice',       'description' => 'Plain white rice.',                                                            'price' =>  40, 'category' => 'Kanin'],
                ['name' => 'Softdrinks',         'description' => 'Canned or bottled softdrink in assorted flavors.',                             'price' =>  40, 'category' => 'Inumin'],
                ['name' => "Sago't Gulaman",     'description' => 'Sweet gulaman and sago pearls in brown sugar syrup.',                          'price' =>  35, 'category' => 'Inumin'],
                ['name' => 'Mais con Hielo',     'description' => 'Sweet corn shaved ice with milk and sugar.',                                   'price' =>  55, 'category' => 'Inumin'],
            ],

            // ── BIDA BURGER ───────────────────────────────────────────────
            // Fast food — burger-shop pricing, Filipino-style value meals
            str_contains($brand, 'Bida Burger') => [
                ['name' => 'Classic Bida Burger',          'description' => 'Juicy beef patty with lettuce, tomato, and house sauce in a soft bun.',    'price' => 149, 'category' => 'Burgers'],
                ['name' => 'Double Bida Burger',           'description' => 'Two beef patties stacked with double cheese and pickles.',                 'price' => 199, 'category' => 'Burgers'],
                ['name' => 'Cheeseburger',                 'description' => 'Classic beef patty with melted cheddar and caramelized onions.',           'price' => 165, 'category' => 'Burgers'],
                ['name' => 'Chicken Burger',               'description' => 'Grilled chicken thigh fillet with coleslaw and mayo.',                     'price' => 175, 'category' => 'Burgers'],
                ['name' => 'Crispy Chicken Sandwich',      'description' => 'Fried chicken fillet with pickles and spicy mayo in a toasted bun.',       'price' => 185, 'category' => 'Burgers'],
                ['name' => 'Hotdog Sandwich',              'description' => 'Filipino-style sweet hotdog in a toasted bun with cheese.',                'price' => 115, 'category' => 'Burgers'],
                ['name' => 'French Fries (regular)',       'description' => 'Golden crispy shoestring fries served with banana ketchup.',               'price' =>  89, 'category' => 'Sides'],
                ['name' => 'French Fries (large)',         'description' => 'Large serving of crispy shoestring fries.',                                'price' => 119, 'category' => 'Sides'],
                ['name' => 'Onion Rings',                  'description' => 'Beer-battered onion rings, crispy and golden.',                            'price' => 109, 'category' => 'Sides'],
                ['name' => 'Chicken Nuggets (6 pcs)',      'description' => 'Tender breaded chicken pieces with sweet chili dipping sauce.',            'price' => 135, 'category' => 'Sides'],
                ['name' => 'Burger Meal',                  'description' => 'Classic Bida Burger with regular fries and a medium drink.',               'price' => 229, 'category' => 'Meals'],
                ['name' => 'Chicken Meal',                 'description' => 'Crispy Chicken Sandwich with regular fries and a medium drink.',           'price' => 245, 'category' => 'Meals'],
                ['name' => 'Softdrinks (medium)',          'description' => 'Pepsi, Mountain Dew, or 7-Up served over ice.',                            'price' =>  65, 'category' => 'Drinks'],
                ['name' => 'Iced Tea (medium)',            'description' => 'Freshly brewed sweet iced tea.',                                           'price' =>  65, 'category' => 'Drinks'],
                ['name' => 'Banana Ketchup Dipping Fries', 'description' => 'Extra-thick fries served with a generous side of banana ketchup.',        'price' =>  99, 'category' => 'Sides'],
            ],

            default => [],
        };
    }

    // Map food keywords to Unsplash placeholder images
    private function foodImage(string $name, string $category): string
    {
        $map = [
            'burger'    => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
            'fries'     => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
            'nugget'    => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
            'hotdog'    => 'https://images.unsplash.com/photo-1612392062126-2fca84e2d6d5?w=400&h=400&fit=crop',
            'chicken'   => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
            'adobo'     => 'https://images.unsplash.com/photo-1625938145744-e380515399bf?w=400&h=400&fit=crop',
            'sinigang'  => 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&h=400&fit=crop',
            'pork'      => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
            'liempo'    => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
            'lechon'    => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
            'bbq'       => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            'grill'     => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            'ihaw'      => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            'rice'      => 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop',
            'coffee'    => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
            'kape'      => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
            'latte'     => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
            'matcha'    => 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop',
            'chocolate' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop',
            'tea'       => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
            'juice'     => 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
            'buko'      => 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
            'softdrink' => 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=400&fit=crop',
            'bread'     => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            'pandesal'  => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            'ensaymada' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            'pastry'    => 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=400&h=400&fit=crop',
            'cake'      => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
            'pie'       => 'https://images.unsplash.com/photo-1621955511667-e2c316e4575d?w=400&h=400&fit=crop',
            'noodle'    => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
            'pancit'    => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
            'soup'      => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
            'salad'     => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
            'egg'       => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop',
            'fish'      => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'bangus'    => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'tilapia'   => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'squid'     => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'pusit'     => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'corn'      => 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
            'leche'     => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
        ];

        $lower = strtolower($name . ' ' . $category);
        foreach ($map as $keyword => $url) {
            if (str_contains($lower, $keyword)) return $url;
        }

        $catMap = [
            'Ulam'              => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'Sabaw'             => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
            'Kanin'             => 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop',
            'Inumin'            => 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
            'Ihaw-Ihaw'         => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            'Extras'            => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'Tinapay'           => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            'Pan at Tinapay'    => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
            'Pastry'            => 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=400&h=400&fit=crop',
            'Kakanin'           => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop',
            'Cake'              => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
            'Burgers'           => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
            'Meals'             => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
            'Sides'             => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop',
            'Drinks'            => 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
            'Mainit na Inumin'  => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
            'Malamig na Inumin' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
            'Gulay'             => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
            'Pansit'            => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
        ];

        return $catMap[$category] ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop';
    }

    public function run(): void
    {
        $restaurants = Restaurant::all();

        foreach ($restaurants as $restaurant) {
            $items = $this->brandMenu($restaurant->name);

            foreach ($items as $item) {
                MenuItem::create([
                    'restaurant_id' => $restaurant->id,
                    'name'          => $item['name'],
                    'description'   => $item['description'],
                    'price'         => $this->price($item['price'], $restaurant->municipality),
                    'category'      => $item['category'],
                    'image_url'     => $this->foodImage($item['name'], $item['category']),
                    'is_available'  => true,
                ]);
            }
        }
    }
}
