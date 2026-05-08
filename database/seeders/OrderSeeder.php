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
     * Per-branch order volumes — intentionally varied so the admin leaderboard
     * shows a natural mix of brands in the top 5.
     *
     * Projected top 5 (by total orders):
     *  #1  Lutong Bahay - Santa Cruz      ~230
     *  #2  Grill Masters - Calamba        ~190
     *  #3  Mama Nena's - Los Baños        ~175
     *  #4  Bida Burger - Sta. Rosa        ~160
     *  #5  Kape't Tinapay - Pagsanjan     ~145
     *
     * Format: 'Exact Restaurant Name' => [ [minDays, maxDays, count], ... ]
     * Four time windows give the chart a visible growth curve:
     *   old(60-90d) → mid(30-60d) → recent(7-30d) → this week(0-7d)
     */
    private array $branchOrders = [

        // ── Lutong Bahay ni Aling Rosa ────────────────────────────────────
        'Lutong Bahay ni Aling Rosa - Santa Cruz'  => [[60,90,40],[30,60,60],[7,30,80],[0,7,50]],  // ~230
        'Lutong Bahay ni Aling Rosa - Calamba'     => [[60,90,20],[30,60,30],[7,30,35],[0,7,15]],  // ~100
        'Lutong Bahay ni Aling Rosa - Los Baños'   => [[60,90,15],[30,60,25],[7,30,30],[0,7,15]],  // ~85
        'Lutong Bahay ni Aling Rosa - Pagsanjan'   => [[60,90,10],[30,60,20],[7,30,25],[0,7,10]],  // ~65
        'Lutong Bahay ni Aling Rosa - San Pablo'   => [[60,90,8], [30,60,15],[7,30,20],[0,7,8]],   // ~51

        // ── Grill Masters PH ─────────────────────────────────────────────
        'Grill Masters PH - Calamba'               => [[60,90,35],[30,60,55],[7,30,65],[0,7,35]],  // ~190
        'Grill Masters PH - Santa Cruz'            => [[60,90,18],[30,60,28],[7,30,35],[0,7,14]],  // ~95
        'Grill Masters PH - Sta. Rosa'             => [[60,90,12],[30,60,22],[7,30,28],[0,7,10]],  // ~72
        'Grill Masters PH - San Pablo'             => [[60,90,8], [30,60,15],[7,30,20],[0,7,8]],   // ~51

        // ── Mama Nena's Carinderia ────────────────────────────────────────
        "Mama Nena's Carinderia - Los Baños"       => [[60,90,30],[30,60,50],[7,30,60],[0,7,35]],  // ~175
        "Mama Nena's Carinderia - Sta. Rosa"       => [[60,90,15],[30,60,25],[7,30,32],[0,7,13]],  // ~85
        "Mama Nena's Carinderia - Santa Cruz"      => [[60,90,12],[30,60,20],[7,30,28],[0,7,10]],  // ~70
        "Mama Nena's Carinderia - Cabuyao"         => [[60,90,10],[30,60,18],[7,30,22],[0,7,8]],   // ~58
        "Mama Nena's Carinderia - San Pablo"       => [[60,90,8], [30,60,14],[7,30,18],[0,7,6]],   // ~46

        // ── Bida Burger ──────────────────────────────────────────────────
        'Bida Burger - Sta. Rosa'                  => [[60,90,28],[30,60,45],[7,30,55],[0,7,32]],  // ~160
        'Bida Burger - Calamba'                    => [[60,90,12],[30,60,22],[7,30,28],[0,7,10]],  // ~72
        'Bida Burger - Biñan'                      => [[60,90,10],[30,60,18],[7,30,24],[0,7,8]],   // ~60
        'Bida Burger - Cabuyao'                    => [[60,90,8], [30,60,14],[7,30,18],[0,7,6]],   // ~46
        'Bida Burger - Santa Cruz'                 => [[60,90,6], [30,60,12],[7,30,16],[0,7,5]],   // ~39
        'Bida Burger - Los Baños'                  => [[60,90,5], [30,60,10],[7,30,14],[0,7,4]],   // ~33

        // ── Kape't Tinapay ────────────────────────────────────────────────
        "Kape't Tinapay - Pagsanjan"               => [[60,90,25],[30,60,40],[7,30,55],[0,7,25]],  // ~145
        "Kape't Tinapay - Sta. Rosa"               => [[60,90,12],[30,60,20],[7,30,26],[0,7,10]],  // ~68
        "Kape't Tinapay - Santa Cruz"              => [[60,90,10],[30,60,18],[7,30,22],[0,7,8]],   // ~58
        "Kape't Tinapay - Los Baños"               => [[60,90,8], [30,60,15],[7,30,20],[0,7,7]],   // ~50
        "Kape't Tinapay - Biñan"                   => [[60,90,6], [30,60,12],[7,30,16],[0,7,5]],   // ~39
        "Kape't Tinapay - Cabuyao"                 => [[60,90,5], [30,60,10],[7,30,13],[0,7,4]],   // ~32

        // ── La Preciosa Bakery ────────────────────────────────────────────
        'La Preciosa Bakery - Pagsanjan'           => [[60,90,40],[30,60,60],[7,30,80],[0,7,40]],  // ~220
        'La Preciosa Bakery - Calamba'             => [[60,90,10],[30,60,18],[7,30,22],[0,7,8]],   // ~58
        'La Preciosa Bakery - San Pablo'           => [[60,90,8], [30,60,14],[7,30,18],[0,7,6]],   // ~46
        'La Preciosa Bakery - Biñan'               => [[60,90,6], [30,60,11],[7,30,14],[0,7,5]],   // ~36
    ];

    // NOTE: 'completed' and 'cancelled' are added here so the admin dashboard
    // completionRate and cancellationRate stats have real data.
    // The migration only has pending/preparing/ready — ADD these two values
    // to your orders migration enum if you want them, or remove them below
    // and keep only: pending, preparing, ready.
    private array $statusWeights = [
        'pending'   => 5,
        'preparing' => 10,
        'ready'     => 85,
    ];

    private array $orderTypes = ['pickup', 'delivery'];

    private array $deliveryAddresses = [
        'Santa Cruz'  => ['12 Rizal Ave, Poblacion, Santa Cruz', '8 Bonifacio Road, Santa Cruz', '22 Quezon St, Santa Cruz'],
        'Pagsanjan'   => ['5 Burgos St, Pagsanjan', '3 Gen. Luna St, Pagsanjan'],
        'Los Baños'   => ['88 National Highway, Los Baños', '101 JP Rizal St, Los Baños'],
        'Calamba'     => ['34 Parian Road, Calamba', '56 Real Street, Calamba'],
        'San Pablo'   => ['21 Mabini St, San Pablo', '45 Rizal St, San Pablo'],
        'Sta. Rosa'   => ['Paseo de Sta. Rosa, Tagaytay Road', 'Nueno Ave, Sta. Rosa'],
        'Biñan'       => ['Halang Road, Biñan', 'Gen. Luna Road, Biñan'],
        'Cabuyao'     => ["Governor's Drive, Cabuyao", 'Barangay Banay-Banay, Cabuyao'],
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