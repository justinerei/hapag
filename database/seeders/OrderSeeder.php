<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Per-branch order volumes — designed to clearly show successful vs palugi branches.
     *
     * ✅ SUCCESSFUL branches (high, growing order counts):
     *   #1  La Preciosa - Pagsanjan         ~220  (star bakery branch)
     *   #2  Lutong Bahay - Santa Cruz        ~200  (top Filipino resto)
     *   #3  Grill Masters - Calamba          ~185  (best BBQ branch)
     *   #4  Bida Burger - Sta. Rosa          ~160  (mall-adjacent boom)
     *   #5  Mama Nena's - Los Baños          ~155  (student crowd)
     *
     * ⚠️  PALUGI branches (still active but very low, stagnant/declining orders):
     *   Kape't Tinapay - Cabuyao             ~18   (almost no traffic)
     *   Bida Burger - Los Baños              ~22   (students prefer carinderias)
     *   La Preciosa - San Pablo              ~25   (struggling, barely breaking even)
     *   Mama Nena's - Cabuyao               ~28   (poor management)
     *
     * ❌ INACTIVE branches — 0 orders (they're closed):
     *   Lutong Bahay - San Pablo
     *   Grill Masters - San Pablo
     *   La Preciosa - Biñan
     *   Mama Nena's - San Pablo
     *
     * Format: 'Exact Restaurant Name' => [ [minDays, maxDays, count], ... ]
     * Four time windows give the chart a visible growth/decline curve:
     *   old(60-90d) → mid(30-60d) → recent(7-30d) → this week(0-7d)
     */
    private array $branchOrders = [

        // ── Lutong Bahay ni Aling Rosa ────────────────────────────────────
        'Lutong Bahay ni Aling Rosa - Santa Cruz'  => [[60,90,35],[30,60,55],[7,30,70],[0,7,40]],  // ✅ ~200
        'Lutong Bahay ni Aling Rosa - Pagsanjan'   => [[60,90,18],[30,60,28],[7,30,35],[0,7,14]],  // ✅ ~95
        'Lutong Bahay ni Aling Rosa - Los Baños'   => [[60,90,14],[30,60,22],[7,30,28],[0,7,11]],  // ✅ ~75
        'Lutong Bahay ni Aling Rosa - Calamba'     => [[60,90,10],[30,60,18],[7,30,22],[0,7,8]],   // ✅ ~58
        // San Pablo = inactive, no orders

        // ── Grill Masters PH ─────────────────────────────────────────────
        'Grill Masters PH - Calamba'               => [[60,90,32],[30,60,50],[7,30,62],[0,7,33]],  // ✅ ~177 growing
        'Grill Masters PH - Santa Cruz'            => [[60,90,15],[30,60,25],[7,30,32],[0,7,12]],  // ✅ ~84
        'Grill Masters PH - Sta. Rosa'             => [[60,90,10],[30,60,18],[7,30,24],[0,7,9]],   // ✅ ~61
        // San Pablo = inactive, no orders

        // ── Mama Nena's Carinderia ────────────────────────────────────────
        "Mama Nena's Carinderia - Los Baños"       => [[60,90,28],[30,60,45],[7,30,55],[0,7,27]],  // ✅ ~155
        "Mama Nena's Carinderia - Sta. Rosa"       => [[60,90,12],[30,60,22],[7,30,28],[0,7,11]],  // ✅ ~73
        "Mama Nena's Carinderia - Santa Cruz"      => [[60,90,10],[30,60,18],[7,30,24],[0,7,9]],   // ✅ ~61
        "Mama Nena's Carinderia - Cabuyao"         => [[60,90,8], [30,60,9], [7,30,7], [0,7,4]],   // ⚠️  ~28 PALUGI declining
        // San Pablo = inactive, no orders

        // ── Bida Burger ──────────────────────────────────────────────────
        'Bida Burger - Sta. Rosa'                  => [[60,90,25],[30,60,42],[7,30,55],[0,7,28]],  // ✅ ~150 growing fast
        'Bida Burger - Calamba'                    => [[60,90,11],[30,60,20],[7,30,26],[0,7,9]],   // ✅ ~66
        'Bida Burger - Biñan'                      => [[60,90,9], [30,60,16],[7,30,21],[0,7,8]],   // ✅ ~54
        'Bida Burger - Cabuyao'                    => [[60,90,7], [30,60,12],[7,30,16],[0,7,6]],   // ✅ ~41
        'Bida Burger - Santa Cruz'                 => [[60,90,5], [30,60,10],[7,30,14],[0,7,5]],   // ✅ ~34
        'Bida Burger - Los Baños'                  => [[60,90,7], [30,60,7], [7,30,6], [0,7,2]],   // ⚠️  ~22 PALUGI flat/declining

        // ── Kape't Tinapay ───────────────────────────────────────────────
        "Kape't Tinapay - Pagsanjan"               => [[60,90,22],[30,60,36],[7,30,48],[0,7,22]],  // ✅ ~128
        "Kape't Tinapay - Sta. Rosa"               => [[60,90,10],[30,60,18],[7,30,24],[0,7,9]],   // ✅ ~61
        "Kape't Tinapay - Santa Cruz"              => [[60,90,8], [30,60,16],[7,30,20],[0,7,8]],   // ✅ ~52
        "Kape't Tinapay - Los Baños"               => [[60,90,7], [30,60,13],[7,30,18],[0,7,6]],   // ✅ ~44
        "Kape't Tinapay - Biñan"                   => [[60,90,5], [30,60,11],[7,30,14],[0,7,5]],   // ✅ ~35
        "Kape't Tinapay - Cabuyao"                 => [[60,90,5], [30,60,6], [7,30,5], [0,7,2]],   // ⚠️  ~18 PALUGI near-zero

        // ── La Preciosa Bakery ────────────────────────────────────────────
        'La Preciosa Bakery - Pagsanjan'           => [[60,90,38],[30,60,58],[7,30,78],[0,7,38]],  // ✅ ~212 star branch
        'La Preciosa Bakery - Calamba'             => [[60,90,9], [30,60,16],[7,30,20],[0,7,7]],   // ✅ ~52
        'La Preciosa Bakery - San Pablo'           => [[60,90,7], [30,60,8], [7,30,7], [0,7,3]],   // ⚠️  ~25 PALUGI stagnant
        // Biñan = inactive, no orders
    ];

    private array $statusWeights = [
        'pending'   => 5,
        'preparing' => 10,
        'ready'     => 85,
    ];

    private array $orderTypes = ['pickup', 'delivery'];

    // Barangay-level delivery addresses per municipality
    private array $deliveryAddresses = [
        'Santa Cruz'  => [
            'Brgy. Poblacion, Santa Cruz, Laguna',
            'Brgy. Bubukal, Santa Cruz, Laguna',
            'Brgy. Market Area, Santa Cruz, Laguna',
            'Brgy. Ganado, Santa Cruz, Laguna',
        ],
        'Pagsanjan'   => [
            'Brgy. Pinagsanjan, Pagsanjan, Laguna',
            'Brgy. Lambac, Pagsanjan, Laguna',
            'Brgy. Poblacion, Pagsanjan, Laguna',
        ],
        'Los Baños'   => [
            'Brgy. Batong Malake, Los Baños, Laguna',
            'Brgy. Anos, Los Baños, Laguna',
            'Brgy. Bayog, Los Baños, Laguna',
            'Brgy. Putho Tuntungin, Los Baños, Laguna',
        ],
        'Calamba'     => [
            'Brgy. Parian, Calamba City, Laguna',
            'Brgy. Real, Calamba City, Laguna',
            'Brgy. Halang, Calamba City, Laguna',
            'Brgy. Uno, Calamba City, Laguna',
        ],
        'San Pablo'   => [
            'Brgy. San Buenaventura, San Pablo City, Laguna',
            'Brgy. Concepcion, San Pablo City, Laguna',
            'Brgy. San Rafael, San Pablo City, Laguna',
            'Brgy. San Gregorio, San Pablo City, Laguna',
        ],
        'Sta. Rosa'   => [
            'Brgy. Tagapo, Sta. Rosa City, Laguna',
            'Brgy. Balibago, Sta. Rosa City, Laguna',
            'Brgy. Malusak, Sta. Rosa City, Laguna',
            'Brgy. Baclaran, Sta. Rosa City, Laguna',
        ],
        'Biñan'       => [
            'Brgy. Poblacion, Biñan City, Laguna',
            'Brgy. Halang, Biñan City, Laguna',
            'Brgy. Ganado, Biñan City, Laguna',
            'Brgy. Soro-Soro, Biñan City, Laguna',
        ],
        'Cabuyao'     => [
            'Brgy. Banay-Banay, Cabuyao City, Laguna',
            'Brgy. Sala, Cabuyao City, Laguna',
            'Brgy. Bigaa, Cabuyao City, Laguna',
        ],
    ];

    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Run UserSeeder first.');
            return;
        }

        $restaurants = Restaurant::all();

        if ($restaurants->isEmpty()) {
            $this->command->warn('No restaurants found. Run RestaurantSeeder first.');
            return;
        }

        $now          = Carbon::now();
        $overallTotal = 0;

        foreach ($restaurants as $restaurant) {
            // Skip inactive branches — they have no orders
            if ($restaurant->status === 'inactive') {
                $this->command->info("⏭️  Skipping inactive: \"{$restaurant->name}\"");
                continue;
            }

            $orderConfigs = $this->branchOrders[$restaurant->name] ?? null;

            if (! $orderConfigs) {
                $this->command->warn("Skipping \"{$restaurant->name}\" — not in branch config.");
                continue;
            }

            $menuItems = MenuItem::where('restaurant_id', $restaurant->id)
                ->where('is_available', true)
                ->get();

            if ($menuItems->isEmpty()) {
                $this->command->warn("Skipping \"{$restaurant->name}\" — no available menu items.");
                continue;
            }

            $municipality = $restaurant->municipality ?? 'Santa Cruz';
            $addresses    = $this->deliveryAddresses[$municipality]
                ?? $this->deliveryAddresses['Santa Cruz'];

            $restaurantTotal = 0;

            foreach ($orderConfigs as [$minDays, $maxDays, $count]) {
                for ($i = 0; $i < $count; $i++) {

                    $orderDate = $now->copy()
                        ->subDays(rand($minDays, $maxDays))
                        ->setTime(rand(7, 21), rand(0, 59), 0);

                    $customer    = $customers->random();
                    $itemCount   = rand(1, min(4, $menuItems->count()));
                    $pickedItems = $menuItems->random($itemCount);
                    $orderType   = $this->orderTypes[array_rand($this->orderTypes)];
                    $status      = $this->weightedRandom($this->statusWeights);

                    $totalAmount = 0;
                    $lineItems   = [];

                    foreach ($pickedItems as $menuItem) {
                        $qty          = rand(1, 3);
                        $unitPrice    = (float) $menuItem->price;
                        $totalAmount += $unitPrice * $qty;
                        $lineItems[]  = [
                            'menu_item_id' => $menuItem->id,
                            'quantity'     => $qty,
                            'unit_price'   => $unitPrice,
                        ];
                    }

                    $deliveryFee = $orderType === 'delivery'
                        ? (rand(0, 1) ? 50.00 : 30.00)
                        : 0.00;

                    $order = Order::create([
                        'user_id'          => $customer->id,
                        'restaurant_id'    => $restaurant->id,
                        'total_amount'     => round($totalAmount, 2),
                        'discount_amount'  => 0,
                        'delivery_fee'     => $deliveryFee,
                        'final_amount'     => round($totalAmount + $deliveryFee, 2),
                        'voucher_id'       => null,
                        'status'           => $status,
                        'order_type'       => $orderType,
                        'delivery_address' => $orderType === 'delivery'
                            ? $addresses[array_rand($addresses)]
                            : null,
                        'pickup_note'      => ($orderType === 'pickup' && rand(0, 4) === 0)
                            ? 'Extra rice please'
                            : null,
                        'created_at'       => $orderDate,
                        'updated_at'       => $orderDate,
                    ]);

                    foreach ($lineItems as $line) {
                        OrderItem::create([
                            'order_id'     => $order->id,
                            'menu_item_id' => $line['menu_item_id'],
                            'quantity'     => $line['quantity'],
                            'unit_price'   => $line['unit_price'],
                            'created_at'   => $orderDate,
                            'updated_at'   => $orderDate,
                        ]);
                    }

                    $restaurantTotal++;
                    $overallTotal++;
                }
            }

            $this->command->info("✅ {$restaurantTotal} orders → \"{$restaurant->name}\"");
        }

        $this->command->info("🎉 Done! Total orders seeded: {$overallTotal}");
    }

    private function weightedRandom(array $weights): string
    {
        $total      = array_sum($weights);
        $rand       = rand(1, $total);
        $cumulative = 0;

        foreach ($weights as $key => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) return $key;
        }

        return array_key_first($weights);
    }
}
