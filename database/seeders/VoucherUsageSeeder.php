<?php

namespace Database\Seeders;

use App\Models\ClaimedVoucher;
use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherUsageSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers  = Voucher::all();
        $orders    = Order::all();
        $customers = User::where('role', 'customer')->get();

        if ($vouchers->isEmpty() || $orders->isEmpty() || $customers->isEmpty()) {
            $this->command->warn('Missing vouchers, orders, or customers. Run other seeders first.');
            return;
        }

        // ── Clean slate ───────────────────────────────────────────────────
        DB::table('voucher_usages')->truncate();
        DB::table('claimed_vouchers')->truncate();
        Voucher::query()->update(['used_count' => 0]);

        // ── Step 1: Seed claimed_vouchers ─────────────────────────────────
        // Scaled down to match 30 customers (was 60).
        // Admin vouchers are claimed widely; owner vouchers are niche.
        // MASARAP10 has a max_uses of 50 so capping at 20 is safe.

        $claimCounts = [
            'HAPAG20'   => 22,  // popular site-wide promo — most customers claim it
            'KAINDITO'  => 18,  // good promo but higher min order, fewer claims
            'MASARAP10' => 20,  // no min order, easy to grab
            'GRILL30'   => 10,  // restaurant-specific, only Grill Masters fans
            'KAFETIME'  => 12,  // cafe crowd, decent uptake
            'BIDANOW'   => 8,   // smallest reach, burger-specific
        ];

        foreach ($vouchers as $voucher) {
            $targetCount = $claimCounts[$voucher->code] ?? 8;

            if ($voucher->max_uses !== null) {
                $targetCount = min($targetCount, $voucher->max_uses);
            }
            $targetCount = min($targetCount, $customers->count());

            // shuffle + take guarantees no duplicate user per voucher
            $pickedCustomers = $customers->shuffle()->take($targetCount);

            $inserted = 0;
            foreach ($pickedCustomers as $customer) {
                $daysAgo = rand(1, 60);

                DB::table('claimed_vouchers')->insertOrIgnore([
                    'user_id'    => $customer->id,
                    'voucher_id' => $voucher->id,
                    'created_at' => now()->subDays($daysAgo),
                    'updated_at' => now()->subDays($daysAgo),
                ]);

                $inserted++;
            }

            $this->command->info("✅ {$inserted} claims → voucher [{$voucher->code}]");
        }

        // ── Step 2: Seed voucher_usages ───────────────────────────────────
        // Usage = voucher was actually applied to a completed order.
        // Usages are a subset of claims (not everyone who claims, redeems).
        // Spread over last 30 days so the growth chart looks smooth.

        $usageCounts = [
            'HAPAG20'   => 18,  // most claimers also redeemed
            'KAINDITO'  => 14,
            'MASARAP10' => 16,
            'GRILL30'   => 8,
            'KAFETIME'  => 10,
            'BIDANOW'   => 6,
        ];

        // Shuffle orders to avoid patterns; each order can only have 1 voucher
        $availableOrders = $orders->shuffle();
        $orderIndex      = 0;

        foreach ($vouchers as $voucher) {
            $targetCount = $usageCounts[$voucher->code] ?? 6;
            $usedSoFar   = 0;

            for ($i = 0; $i < $targetCount; $i++) {
                if ($orderIndex >= $availableOrders->count()) break;

                $order    = $availableOrders[$orderIndex++];
                $customer = $customers->random();
                // Usages are more recent than claims — last 30 days
                $daysAgo  = rand(1, 30);

                VoucherUsage::create([
                    'voucher_id' => $voucher->id,
                    'user_id'    => $customer->id,
                    'order_id'   => $order->id,
                    'created_at' => now()->subDays($daysAgo),
                    'updated_at' => now()->subDays($daysAgo),
                ]);

                $usedSoFar++;
            }

            // Keep used_count in sync for the top vouchers bar chart
            $voucher->update(['used_count' => $usedSoFar]);

            $this->command->info("✅ {$usedSoFar} usages → voucher [{$voucher->code}]");
        }

        $totalClaimed = ClaimedVoucher::count();
        $totalUsed    = VoucherUsage::count();

        $this->command->info("🎉 Done! Total claimed: {$totalClaimed} | Total redeemed: {$totalUsed}");
    }
}
