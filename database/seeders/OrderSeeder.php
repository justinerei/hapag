<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    private array $statusWeights = [
        'completed' => 65,
        'cancelled'  => 15,
        'preparing'  => 7,
        'accepted'   => 5,
        'ready'      => 5,
        'pending'    => 3,
    ];

    private array $deliveryAddresses = [
        '123 Rizal St., Santa Cruz, Laguna',
        '456 Mabini Ave., Calamba City, Laguna',
        '78 Burgos St., Los Baños, Laguna',
        '22 Quezon Blvd., Pagsanjan, Laguna',
        '9 Bonifacio St., San Pablo City, Laguna',
    ];

    private array $pickupNotes = [
        'Extra napkins please',
        'No utensils needed',
        null,
        null,
        null,
        null,
    ];

    public function run(): void
    {
        DB::transaction(function () {
            DB::table('order_items')->delete();
            DB::table('orders')->delete();

            $customers = DB::table('users')->where('role', 'customer')->get();

            if ($customers->isEmpty()) {
                $this->command->warn('No customers found. Run UserSeeder first.');
                return;
            }

            $restaurants = DB::table('restaurants')->get();

            if ($restaurants->isEmpty()) {
                $this->command->warn('No restaurants found. Run RestaurantSeeder first.');
                return;
            }

            $menuItemsByRestaurant = DB::table('menu_items')
                ->where('is_available', true)
                ->get()
                ->groupBy('restaurant_id');

            $validRestaurants = $restaurants
                ->filter(fn ($r) => $menuItemsByRestaurant->has($r->id))
                ->values();

            if ($validRestaurants->isEmpty()) {
                $this->command->warn('No restaurants with available menu items found.');
                return;
            }

            $now           = Carbon::now();
            $firstCustomer = $customers->first();

            $this->seedGuaranteedOrders($firstCustomer, $validRestaurants, $menuItemsByRestaurant, $now);

            $total = 0;
            foreach ($customers as $customer) {
                $count = rand(4, 8);
                for ($i = 0; $i < $count; $i++) {
                    $restaurant = $validRestaurants->random();
                    $this->insertOrder(
                        $customer,
                        $restaurant,
                        $menuItemsByRestaurant->get($restaurant->id),
                        null,
                        $now
                    );
                    $total++;
                }
            }

            $this->command->info("✅ Done! {$total} random orders + 5 guaranteed demo orders seeded.");
        });
    }

    private function seedGuaranteedOrders(
        object $firstCustomer,
        $validRestaurants,
        $menuItemsByRestaurant,
        Carbon $now
    ): void {
        $pool   = $validRestaurants->shuffle()->values();
        $picked = [];
        for ($i = 0; $i < 5; $i++) {
            $picked[] = $pool->get($i % $pool->count());
        }

        // 2 × pending — created in the last 2 hours
        for ($i = 0; $i < 2; $i++) {
            $this->insertOrder(
                $firstCustomer,
                $picked[$i],
                $menuItemsByRestaurant->get($picked[$i]->id),
                'pending',
                $now,
                $now->copy()->subMinutes(rand(10, 120))
            );
        }

        // 2 × preparing — created in the last 3 hours
        for ($i = 2; $i < 4; $i++) {
            $this->insertOrder(
                $firstCustomer,
                $picked[$i],
                $menuItemsByRestaurant->get($picked[$i]->id),
                'preparing',
                $now,
                $now->copy()->subMinutes(rand(30, 180))
            );
        }

        // 1 × ready — created in the last hour
        $this->insertOrder(
            $firstCustomer,
            $picked[4],
            $menuItemsByRestaurant->get($picked[4]->id),
            'ready',
            $now,
            $now->copy()->subMinutes(rand(5, 60))
        );
    }

    private function insertOrder(
        object $customer,
        object $restaurant,
        $menuItems,
        ?string $forcedStatus,
        Carbon $now,
        ?Carbon $forcedCreatedAt = null
    ): void {
        $status = $forcedStatus ?? $this->weightedRandom($this->statusWeights);

        $createdAt = $forcedCreatedAt ?? match ($status) {
            'pending', 'accepted', 'preparing' => $now->copy()->subMinutes(rand(5, 1440)),
            'ready'                             => $now->copy()->subMinutes(rand(5, 2880)),
            default                             => $now->copy()
                ->subDays(rand(0, 30))
                ->setTime(rand(7, 21), rand(0, 59)),
        };

        $updatedAt = in_array($status, ['completed', 'cancelled'])
            ? $createdAt->copy()->addMinutes(rand(5, 30))
            : $createdAt->copy();

        $orderType   = (mt_rand(1, 10) <= 7) ? 'pickup' : 'delivery';
        $deliveryFee = $orderType === 'delivery' ? 49.00 : 0.00;

        $itemCount   = rand(1, min(4, $menuItems->count()));
        $pickedItems = $menuItems->shuffle()->take($itemCount);

        $totalAmount = 0.0;
        $lineItems   = [];
        foreach ($pickedItems as $item) {
            $qty          = rand(1, 3);
            $unitPrice    = (float) $item->price;
            $totalAmount += $unitPrice * $qty;
            $lineItems[]  = [
                'menu_item_id' => $item->id,
                'quantity'     => $qty,
                'unit_price'   => $unitPrice,
            ];
        }

        $totalAmount = round($totalAmount, 2);
        $finalAmount = round($totalAmount + $deliveryFee, 2);

        $pickupNote = null;
        if ($orderType === 'pickup') {
            $pickupNote = $this->pickupNotes[array_rand($this->pickupNotes)];
        }

        $scheduledAt = null;
        if (mt_rand(1, 10) === 1) {
            $scheduledAt = $createdAt->copy()->addMinutes(rand(30, 120));
        }

        $orderId = DB::table('orders')->insertGetId([
            'user_id'          => $customer->id,
            'restaurant_id'    => $restaurant->id,
            'total_amount'     => $totalAmount,
            'discount_amount'  => 0.00,
            'delivery_fee'     => $deliveryFee,
            'final_amount'     => $finalAmount,
            'voucher_id'       => null,
            'status'           => $status,
            'order_type'       => $orderType,
            'delivery_address' => $orderType === 'delivery'
                ? $this->deliveryAddresses[array_rand($this->deliveryAddresses)]
                : null,
            'pickup_note'      => $pickupNote,
            'scheduled_at'     => $scheduledAt,
            'created_at'       => $createdAt,
            'updated_at'       => $updatedAt,
        ]);

        $rows = [];
        foreach ($lineItems as $line) {
            $rows[] = [
                'order_id'     => $orderId,
                'menu_item_id' => $line['menu_item_id'],
                'quantity'     => $line['quantity'],
                'unit_price'   => $line['unit_price'],
                'created_at'   => $createdAt,
                'updated_at'   => $updatedAt,
            ];
        }

        DB::table('order_items')->insert($rows);
    }

    private function weightedRandom(array $weights): string
    {
        $rand = mt_rand(1, array_sum($weights));
        foreach ($weights as $status => $weight) {
            if ($rand <= $weight) return $status;
            $rand -= $weight;
        }
        return array_key_first($weights);
    }
}
