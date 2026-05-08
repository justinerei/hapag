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

        // Reset used_count on all vouchers
        Voucher::query()->update(['used_count' => 0]);

        // ── Step 1: Seed claimed_vouchers ─────────────────────────────────
        // This is what $totalClaimed = ClaimedVoucher::count() reads.
        // Each customer can claim each voucher only once (unique constraint).
        // We distribute claims across all vouchers with varying popularity.

        $claimCounts = [
            'HAPAG20'   => 32,  // matches screenshot: 32/100
            'KAINDITO'  => 35,  // matches screenshot: 35/200
            'MASARAP10' => 30,  // matches screenshot: 30/50
            'GRILL30'   => 18,
            'KAFETIME'  => 22,
            'BIDANOW'   => 15,
        ];

        foreach ($vouchers as $voucher) {
            $targetCount = $claimCounts[$voucher->code] ?? 10;

            // Cap at max_uses if set, and cap at available customers
            if ($voucher->max_uses !== null) {
                $targetCount = min($targetCount, $voucher->max_uses);
            }
            $targetCount = min($targetCount, $customers->count());

            // shuffle() + take() guarantees NO duplicate user per voucher
            // (safe against the unique(['user_id','voucher_id']) constraint)
            $pickedCustomers = $customers->shuffle()->take($targetCount);

            $inserted = 0;
            foreach ($pickedCustomers as $customer) {
                // Spread created_at dates naturally over 60 days
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
        // This is what $totalVouchersUsed = VoucherUsage::count() reads.
        // Also feeds voucherUsageGrowth chart (daily count over time).
        // A usage = voucher was actually applied to a completed order.

        $usageCounts = [
            'HAPAG20'   => 32,  // same as claimed — all who claimed also used
            'KAINDITO'  => 35,
            'MASARAP10' => 30,
            'GRILL30'   => 18,
            'KAFETIME'  => 22,
            'BIDANOW'   => 15,
        ];

        // We need unique order_id per usage (order can only have 1 voucher)
        $availableOrders = $orders->shuffle();
        $orderIndex      = 0;

        foreach ($vouchers as $voucher) {
            $targetCount = $usageCounts[$voucher->code] ?? 10;
            $usedSoFar   = 0;

            for ($i = 0; $i < $targetCount; $i++) {
                if ($orderIndex >= $availableOrders->count()) break;

                $order    = $availableOrders[$orderIndex++];
                $customer = $customers->random();
                $daysAgo  = rand(1, 30); // usages are more recent than claims

                VoucherUsage::create([
                    'voucher_id' => $voucher->id,
                    'user_id'    => $customer->id,
                    'order_id'   => $order->id,
                    'created_at' => now()->subDays($daysAgo),
                    'updated_at' => now()->subDays($daysAgo),
                ]);

                $usedSoFar++;
            }

            // Update used_count on the voucher itself (for top codes bar chart)
            $voucher->update(['used_count' => $usedSoFar]);

            $this->command->info("✅ {$usedSoFar} usages → voucher [{$voucher->code}]");
        }

        $totalClaimed = ClaimedVoucher::count();
        $totalUsed    = VoucherUsage::count();

        $this->command->info("🎉 Done! Total claimed: {$totalClaimed} | Total redeemed: {$totalUsed}");
    }
}