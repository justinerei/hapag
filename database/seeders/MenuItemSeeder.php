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
            str_contains($brand, 'Lutong Bahay') => [
                ['name' => 'Sinigang na Baboy',   'description' => 'Tender pork ribs in a sour tamarind broth with kangkong and radish.',         'price' => 220, 'category' => 'Sabaw',  'image' => 'lutong-bahay-ni-aling-rosa/sinigang-na-baboy.jpg'],
                ['name' => 'Adobong Manok',        'description' => 'Chicken braised in vinegar, soy sauce, garlic, and bay leaves.',               'price' => 195, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/adobong-manok.jpg'],
                ['name' => 'Kare-Kare',            'description' => 'Oxtail and tripe stew in a creamy peanut sauce, served with bagoong.',        'price' => 310, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/kare-kare.jpg'],
                ['name' => 'Pinakbet',             'description' => 'Mixed vegetables sautéed with bagoong alamang and pork.',                      'price' => 175, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/pinakbet.jpg'],
                ['name' => 'Lechon Kawali',        'description' => 'Deep-fried pork belly with crispy skin, served with liver sauce.',             'price' => 245, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/lechon-kawali.jpg'],
                ['name' => 'Nilaga ng Baka',       'description' => 'Slow-cooked beef with potatoes and pechay in a clear broth.',                  'price' => 280, 'category' => 'Sabaw',  'image' => 'lutong-bahay-ni-aling-rosa/nilaga-ng-baka.jpg'],
                ['name' => 'Tinolang Manok',       'description' => 'Ginger-broth chicken soup with green papaya and chili leaves.',                'price' => 195, 'category' => 'Sabaw',  'image' => 'lutong-bahay-ni-aling-rosa/tinolang-manok.jpg'],
                ['name' => 'Paksiw na Bangus',     'description' => 'Milkfish simmered in vinegar with garlic and vegetables.',                     'price' => 175, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/paksiw-na-bangus.jpg'],
                ['name' => 'Pancit Bihon',         'description' => 'Stir-fried rice noodles with vegetables and chicken in soy-citrus sauce.',     'price' => 185, 'category' => 'Pansit', 'image' => 'lutong-bahay-ni-aling-rosa/pancit-bihon.jpg'],
                ['name' => 'Pritong Tilapia',      'description' => 'Whole tilapia deep-fried to golden crisp, served with spiced vinegar.',        'price' => 185, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/pritong-tilapia.jpg'],
                ['name' => 'Bulalo',               'description' => 'Slow-simmered beef bone marrow soup — a true Laguna classic.',                 'price' => 380, 'category' => 'Sabaw',  'image' => 'lutong-bahay-ni-aling-rosa/bulalo.jpg'],
                ['name' => 'Tortang Talong',       'description' => 'Grilled eggplant egg omelet, pan-fried until golden.',                         'price' => 145, 'category' => 'Ulam',   'image' => 'lutong-bahay-ni-aling-rosa/tortang-talong.jpg'],
                ['name' => 'Steamed Rice',         'description' => 'Freshly cooked plain white rice.',                                             'price' =>  45, 'category' => 'Kanin',  'image' => 'lutong-bahay-ni-aling-rosa/steamed-rice.jpg'],
                ['name' => 'Garlic Rice',          'description' => 'Fragrant sinangag with toasted garlic.',                                       'price' =>  55, 'category' => 'Kanin',  'image' => 'lutong-bahay-ni-aling-rosa/garlic-rice.jpg'],
                ['name' => 'Buko Juice',           'description' => 'Fresh young coconut juice served chilled.',                                    'price' =>  75, 'category' => 'Inumin', 'image' => 'lutong-bahay-ni-aling-rosa/buko-juice.jpg'],
            ],

            // ── GRILL MASTERS PH ──────────────────────────────────────────
            str_contains($brand, 'Grill Masters') => [
                ['name' => 'Inihaw na Liempo',        'description' => 'Marinated pork belly grilled over charcoal, served with atchara.',          'price' => 285, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/inihaw-na-liempo.jpg'],
                ['name' => 'Chicken Inasal',          'description' => 'Bacolod-style grilled chicken in lemongrass and calamansi marinade.',       'price' => 245, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/chicken-inasal.jpg'],
                ['name' => 'BBQ Pork Skewer (3 pcs)', 'description' => 'Classic Filipino BBQ pork skewers with sweet soy glaze.',                   'price' => 120, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/bbq-Pork-Skewer-(3 pcs).jpg'],
                ['name' => 'Inihaw na Pusit',         'description' => 'Whole squid grilled with butter and soy sauce.',                           'price' => 250, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/inihaw-na-pusit.jpg'],
                ['name' => 'Grilled Tilapia',         'description' => 'Whole tilapia grilled in banana leaf with onions and tomatoes.',            'price' => 220, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/grilled-tilapia.jpg'],
                ['name' => 'Chicharon Bulaklak',      'description' => 'Deep-fried pork intestines, crispy and golden.',                           'price' => 195, 'category' => 'Extras',    'image' => 'grill-masters-ph/chicharon-bulaklak.jpg'],
                ['name' => 'Lechon Manok (half)',     'description' => 'Rotisserie-style half chicken served with silog sauce.',                    'price' => 295, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/lechon-manok-(half).jpg'],
                ['name' => 'Pork Belly BBQ Platter',  'description' => 'Thick-cut charcoal-grilled pork belly served with java rice.',              'price' => 340, 'category' => 'Ihaw-Ihaw', 'image' => 'grill-masters-ph/pork-belly-bbq-platter.jpg'],
                ['name' => 'Grilled Eggplant Salad',  'description' => 'Charred eggplant with tomatoes, onions, and salted egg.',                   'price' => 115, 'category' => 'Extras',    'image' => 'grill-masters-ph/grilled-eggplant-salad.jpg'],
                ['name' => 'Java Rice',               'description' => 'Tomato-and-garlic fried rice — the perfect grilled meat companion.',        'price' =>  75, 'category' => 'Kanin',     'image' => 'grill-masters-ph/java-rice.jpg'],
                ['name' => 'Atchara',                 'description' => 'House-made pickled green papaya, a refreshing palate cleanser.',            'price' =>  60, 'category' => 'Extras',    'image' => 'grill-masters-ph/atchara.jpg'],
                ['name' => 'Corn on the Cob',         'description' => 'Grilled sweet corn with butter and grated cheese.',                         'price' =>  85, 'category' => 'Extras',    'image' => 'grill-masters-ph/corn-on-the-cob.jpg'],
                ['name' => 'Bottomless Iced Tea',     'description' => 'Freshly brewed iced tea with unlimited refills.',                           'price' =>  99, 'category' => 'Inumin',    'image' => 'grill-masters-ph/bottomless-iced-tea.jpg'],
                ['name' => 'Buko Juice',              'description' => 'Cold young coconut juice.',                                                 'price' =>  75, 'category' => 'Inumin',    'image' => 'grill-masters-ph/buko-juice-grill.jpg'],
                ['name' => 'Softdrinks (can)',         'description' => 'Canned softdrinks in assorted flavors.',                                    'price' =>  55, 'category' => 'Inumin',    'image' => 'grill-masters-ph/softdrinks-can.jpg'],
            ],

            // ── KAPE'T TINAPAY ────────────────────────────────────────────
            str_contains($brand, "Kape't Tinapay") => [
                ['name' => 'Brewed Coffee',       'description' => 'House-blend drip coffee, served hot.',                                       'price' =>  85, 'category' => 'Mainit na Inumin',  'image' => 'kape-t-tinapay/brewed-coffee.jpg'],
                ['name' => 'Kapeng Barako',        'description' => 'Bold Batangas barako coffee, served hot.',                                   'price' =>  95, 'category' => 'Mainit na Inumin',  'image' => 'kape-t-tinapay/kapeng-barako.jpg'],
                ['name' => 'Cafe Latte',           'description' => 'Espresso with steamed milk, served hot.',                                    'price' => 155, 'category' => 'Mainit na Inumin',  'image' => 'kape-t-tinapay/cafe-latte.jpg'],
                ['name' => 'Spanish Latte',        'description' => 'Espresso with condensed milk and steamed milk.',                             'price' => 165, 'category' => 'Mainit na Inumin',  'image' => 'kape-t-tinapay/spanish-latte.jpg'],
                ['name' => 'Iced Coffee',          'description' => 'Cold-brewed coffee over ice with your choice of milk.',                      'price' => 145, 'category' => 'Malamig na Inumin', 'image' => 'kape-t-tinapay/iced-coffee.jpg'],
                ['name' => 'Hot Chocolate',        'description' => 'Rich and creamy hot tablea chocolate.',                                      'price' => 130, 'category' => 'Mainit na Inumin',  'image' => 'kape-t-tinapay/hot-chocolate.jpg'],
                ['name' => 'Matcha Latte',         'description' => 'Japanese matcha powder with steamed milk, available hot or iced.',           'price' => 165, 'category' => 'Malamig na Inumin', 'image' => 'kape-t-tinapay/matcha-latte.jpg'],
                ['name' => 'Pandesal (per piece)', 'description' => 'Classic Filipino bread roll, soft and slightly sweet.', 'price' => 18, 'category' => 'Tinapay', 'image' => 'kape-t-tinapay/pandesal-(per-piece).jpg'],
                ['name' => 'Ensaymada',            'description' => 'Soft brioche bun topped with butter, sugar, and grated cheese.',            'price' =>  75, 'category' => 'Pastry',            'image' => 'kape-t-tinapay/ensaymada.jpg'],
                ['name' => 'Mamon',                'description' => 'Light and fluffy Filipino chiffon cupcake.',                                 'price' =>  60, 'category' => 'Pastry',            'image' => 'kape-t-tinapay/mamon.jpg'],
                ['name' => 'Putok',                'description' => 'Hard-crusted bun with a soft, chewy inside.',                               'price' =>  25, 'category' => 'Tinapay',           'image' => 'kape-t-tinapay/putok.jpg'],
                ['name' => 'Monay',                'description' => 'Dense and slightly sweet bread roll, best with coffee.',                     'price' =>  30, 'category' => 'Tinapay',           'image' => 'kape-t-tinapay/monay.jpg'],
                ['name' => 'Bibingka',             'description' => 'Traditional rice cake with salted egg and coconut, baked to order.',        'price' =>  95, 'category' => 'Kakanin',           'image' => 'kape-t-tinapay/bibingka.jpg'],
                ['name' => 'Buko Pie (slice)',     'description' => 'Creamy young coconut filling in a flaky pastry crust.',                     'price' => 105, 'category' => 'Pastry',            'image' => 'kape-t-tinapay/buko-pie-slice.jpg'],
                ['name' => 'Polvoron (3 pcs)',     'description' => 'Crumbly Filipino shortbread candy with milk and toasted flour.',            'price' =>  65, 'category' => 'Pastry',            'image' => 'kape-t-tinapay/polvoron 3pcs.jpg'],
            ],

            // ── LA PRECIOSA BAKERY ────────────────────────────────────────
            str_contains($brand, 'La Preciosa') => [
                ['name' => 'Pandesal (per piece)', 'description' => 'Soft Filipino bread roll dusted with fine breadcrumbs.',                     'price' =>  12, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/pandesal-bakery.jpg'],
                ['name' => 'Ube Pandesal',         'description' => 'Purple yam-flavored pandesal with creamy ube filling.',                     'price' =>  22, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/ube-pandesal.jpg'],
                ['name' => 'Spanish Bread',        'description' => 'Rolled bread stuffed with sweetened breadcrumbs and butter.',               'price' =>  28, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/spanish-bread.jpg'],
                ['name' => 'Cheese Bread',         'description' => 'Soft pull-apart bread topped with melted cheese and cream.',                'price' =>  35, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/cheese-bread.jpg'],
                ['name' => 'Monay',                'description' => 'Classic dense bread roll, pairs well with coffee.',                         'price' =>  22, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/monay-bakery.jpg'],
                ['name' => 'Putok',                'description' => 'Star-shaped bun with a crusty exterior and soft inside.',                   'price' =>  18, 'category' => 'Pan at Tinapay', 'image' => 'la-preciosa-bakery/putok-bakery.jpg'],
                ['name' => 'Ensaymada',            'description' => 'Buttery coiled bread with a generous grated cheese topping.',              'price' =>  75, 'category' => 'Pastry',         'image' => 'la-preciosa-bakery/ensaymada-bakery.jpg'],
                ['name' => 'Mamon',                'description' => 'Light Filipino sponge cupcake, perfect with butter.',                       'price' =>  55, 'category' => 'Pastry',         'image' => 'la-preciosa-bakery/mamon-bakery.jpg'],
                ['name' => 'Cinnamon Roll',        'description' => 'Freshly baked cinnamon swirl roll with cream cheese glaze.',               'price' =>  85, 'category' => 'Pastry',         'image' => 'la-preciosa-bakery/cinnamon-roll.jpg'],
                ['name' => 'Chocolate Cake Slice', 'description' => 'Moist layered chocolate cake with dark ganache frosting.',                 'price' => 145, 'category' => 'Cake',           'image' => 'la-preciosa-bakery/chocolate-cake-slice.jpg'],
                ['name' => 'Ube Cake Slice',       'description' => 'Fluffy purple yam cake filled and frosted with ube halaya cream.',         'price' => 145, 'category' => 'Cake',           'image' => 'la-preciosa-bakery/ube-cake-slice.jpg'],
                ['name' => 'Buko Pie (whole)',     'description' => 'Whole buko pie with creamy coconut filling — serves 6 to 8.',              'price' => 420, 'category' => 'Pastry',         'image' => 'la-preciosa-bakery/buko-pie-whole.jpg'],
                ['name' => 'Maja Blanca',          'description' => 'Creamy coconut milk pudding topped with corn and latik.',                  'price' =>  95, 'category' => 'Kakanin',        'image' => 'la-preciosa-bakery/maja-blanca.jpg'],
                ['name' => 'Leche Flan',           'description' => 'Classic caramel custard, steamed to silky perfection.',                    'price' => 105, 'category' => 'Kakanin',        'image' => 'la-preciosa-bakery/leche-flan.jpg'],
                ['name' => 'Yema Cake Slice',      'description' => 'Soft chiffon cake filled and frosted with sweet yema cream.',             'price' => 125, 'category' => 'Cake',           'image' => 'la-preciosa-bakery/yema-cake-slice.jpg'],
            ],

            // ── MAMA NENA'S CARINDERIA ────────────────────────────────────
            str_contains($brand, "Mama Nena") => [
                ['name' => 'Pritong Isda',       'description' => 'Deep-fried fish of the day, crispy and golden.',                              'price' => 110, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/pritong-isda.jpg'],
                ['name' => 'Adobong Manok',      'description' => 'Classic chicken adobo, slow-cooked until tender.',                           'price' => 105, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/adobong-manok-carinderia.jpg'],
                ['name' => 'Menudo',             'description' => 'Pork and liver stew with potatoes and tomato sauce.',                         'price' => 110, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/menudo.jpg'],
                ['name' => 'Tortang Talong',     'description' => 'Grilled eggplant egg omelet, pan-fried.',                                    'price' =>  85, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/tortang-talong-carinderia.jpg'],
                ['name' => 'Ginisang Ampalaya',  'description' => 'Sautéed bitter melon with egg and garlic.',                                  'price' =>  75, 'category' => 'Gulay',  'image' => 'mama-nenas-carinderia/ginisang-ampalaya.jpg'],
                ['name' => 'Paksiw na Bangus',   'description' => 'Milkfish cooked in vinegar with ginger and vegetables.',                     'price' => 105, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/paksiw-na-bangus-carinderia.jpg'],
                ['name' => 'Dinuguan',           'description' => 'Savory pork blood stew with chili and vinegar.',                             'price' => 110, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/dinuguan.jpg'],
                ['name' => 'Sinigang na Baboy',  'description' => 'Classic tamarind pork soup with kangkong and radish.',                       'price' => 130, 'category' => 'Sabaw',  'image' => 'mama-nenas-carinderia/sinigang-na-baboy-carinderia.jpg'],
                ['name' => 'Chopsuey',           'description' => 'Stir-fried mixed vegetables with quail eggs.',                               'price' =>  95, 'category' => 'Gulay',  'image' => 'mama-nenas-carinderia/chopsuey.jpg'],
                ['name' => 'Monggo Guisado',     'description' => 'Mung bean soup with pork and malunggay leaves.',                            'price' =>  85, 'category' => 'Sabaw',  'image' => 'mama-nenas-carinderia/monggo-guisado.jpg'],
                ['name' => 'Lechon Kawali',      'description' => 'Crispy deep-fried pork belly served with spiced vinegar.',                   'price' => 130, 'category' => 'Ulam',   'image' => 'mama-nenas-carinderia/lechon-kawali-carinderia.jpg'],
                ['name' => 'Steamed Rice',       'description' => 'Plain white rice.',                                                          'price' =>  40, 'category' => 'Kanin',  'image' => 'mama-nenas-carinderia/steamed-rice-carinderia.jpg'],
                ['name' => 'Softdrinks',         'description' => 'Canned or bottled softdrink in assorted flavors.',                           'price' =>  40, 'category' => 'Inumin', 'image' => 'mama-nenas-carinderia/softdrinks-carinderia.jpg'],
                ['name' => "Sago't Gulaman", 'description' => 'Sweet gulaman and sago pearls in brown sugar syrup.', 'price' => 35, 'category' => 'Inumin', 'image' => "mama-nenas-carinderia/sago't-gulaman.jpg"],
                ['name' => 'Mais con Hielo',     'description' => 'Sweet corn shaved ice with milk and sugar.',                                 'price' =>  55, 'category' => 'Inumin', 'image' => 'mama-nenas-carinderia/mais-con-hielo.jpg'],
            ],

            // ── BIDA BURGER ───────────────────────────────────────────────
            str_contains($brand, 'Bida Burger') => [
                ['name' => 'Classic Bida Burger',          'description' => 'Juicy beef patty with lettuce, tomato, and house sauce in a soft bun.',  'price' => 149, 'category' => 'Burgers', 'image' => 'bida-burger/classic-bida-burger.jpg'],
                ['name' => 'Double Bida Burger',           'description' => 'Two beef patties stacked with double cheese and pickles.',               'price' => 199, 'category' => 'Burgers', 'image' => 'bida-burger/double-bida-burger.jpg'],
                ['name' => 'Cheeseburger',                 'description' => 'Classic beef patty with melted cheddar and caramelized onions.',         'price' => 165, 'category' => 'Burgers', 'image' => 'bida-burger/cheeseburger.jpg'],
                ['name' => 'Chicken Burger',               'description' => 'Grilled chicken thigh fillet with coleslaw and mayo.',                   'price' => 175, 'category' => 'Burgers', 'image' => 'bida-burger/chicken-burger.jpg'],
                ['name' => 'Crispy Chicken Sandwich',      'description' => 'Fried chicken fillet with pickles and spicy mayo in a toasted bun.',     'price' => 185, 'category' => 'Burgers', 'image' => 'bida-burger/crispy-chicken-sandwich.jpg'],
                ['name' => 'Hotdog Sandwich',              'description' => 'Filipino-style sweet hotdog in a toasted bun with cheese.',              'price' => 115, 'category' => 'Burgers', 'image' => 'bida-burger/hotdog-sandwich.jpg'],
                ['name' => 'French Fries (regular)',       'description' => 'Golden crispy shoestring fries served with banana ketchup.',             'price' =>  89, 'category' => 'Sides',   'image' => 'bida-burger/french-fries-regular.jpg'],
                ['name' => 'French Fries (large)',         'description' => 'Large serving of crispy shoestring fries.',                              'price' => 119, 'category' => 'Sides',   'image' => 'bida-burger/french-fries-large.jpg'],
                ['name' => 'Onion Rings',                  'description' => 'Beer-battered onion rings, crispy and golden.',                          'price' => 109, 'category' => 'Sides',   'image' => 'bida-burger/onion-rings.jpg'],
                ['name' => 'Chicken Nuggets (6 pcs)',      'description' => 'Tender breaded chicken pieces with sweet chili dipping sauce.',          'price' => 135, 'category' => 'Sides',   'image' => 'bida-burger/chicken-nuggets.jpg'],
                ['name' => 'Burger Meal',                  'description' => 'Classic Bida Burger with regular fries and a medium drink.',             'price' => 229, 'category' => 'Meals',   'image' => 'bida-burger/burger-meal.jpg'],
                ['name' => 'Chicken Meal',                 'description' => 'Crispy Chicken Sandwich with regular fries and a medium drink.',         'price' => 245, 'category' => 'Meals',   'image' => 'bida-burger/chicken-meal.jpg'],
                ['name' => 'Softdrinks (medium)',          'description' => 'Pepsi, Mountain Dew, or 7-Up served over ice.',                          'price' =>  65, 'category' => 'Drinks',  'image' => 'bida-burger/softdrinks-medium.jpg'],
                ['name' => 'Iced Tea (medium)',            'description' => 'Freshly brewed sweet iced tea.',                                         'price' =>  65, 'category' => 'Drinks',  'image' => 'bida-burger/iced-tea-medium.jpg'],
                ['name' => 'Banana Ketchup Dipping Fries', 'description' => 'Extra-thick fries served with a generous side of banana ketchup.',      'price' =>  99, 'category' => 'Sides',   'image' => 'bida-burger/banana-ketchup-dipping-fries.jpg'],
            ],

            default => [],
        };
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
                    'image_url'     => '/images/menu/' . $item['image'],
                    'is_available'  => true,
                ]);
            }
        }
    }
}