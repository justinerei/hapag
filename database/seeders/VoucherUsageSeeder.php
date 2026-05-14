<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VoucherUsageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('voucher_usages')->delete();
        DB::table('vouchers')->update(['used_count' => 0]);

        $completedOrders = DB::table('orders')->where('status', 'completed')->get();

        if ($completedOrders->isEmpty()) {
            $this->command->warn('No completed orders found. Run OrderSeeder first.');
            return;
        }

        $vouchers = DB::table('vouchers')->where('is_active', true)->get();

        if ($vouchers->isEmpty()) {
            $this->command->warn('No active vouchers found. Run VoucherSeeder first.');
            return;
        }

        // Apply vouchers to ~20% of completed orders
        $targetCount    = (int) ceil($completedOrders->count() * 0.20);
        $selectedOrders = $completedOrders->shuffle()->take($targetCount);

        // Track used combos (user_id:voucher_id) to enforce one-use-per-user rule
        $usedCombos        = [];
        $voucherUsedCounts = [];

        $applied = 0;
        $skipped = 0;

        foreach ($selectedOrders as $order) {
            $validVoucher = null;

            foreach ($vouchers->shuffle() as $voucher) {
                // Must match the order's restaurant or be a global voucher
                if ($voucher->restaurant_id !== null && $voucher->restaurant_id != $order->restaurant_id) {
                    continue;
                }

                // Must meet minimum order amount
                if ($voucher->min_order_amount !== null && $order->total_amount < $voucher->min_order_amount) {
                    continue;
                }

                // Must not exceed max_uses (accounting for usages applied in this seeder run)
                $usedSoFar = $voucherUsedCounts[$voucher->id] ?? 0;
                if ($voucher->max_uses !== null && $usedSoFar >= $voucher->max_uses) {
                    continue;
                }

                // Must not be expired
                if ($voucher->expires_at !== null && Carbon::parse($voucher->expires_at)->isPast()) {
                    continue;
                }

                // Same user must not have already used this voucher
                $comboKey = "{$order->user_id}:{$voucher->id}";
                if (isset($usedCombos[$comboKey])) {
                    continue;
                }

                $validVoucher = $voucher;
                break;
            }

            if ($validVoucher === null) {
                $skipped++;
                continue;
            }

            $discountAmount = $validVoucher->type === 'percentage'
                ? round((float) $order->total_amount * ((float) $validVoucher->value / 100), 2)
                : min((float) $validVoucher->value, (float) $order->total_amount);

            $finalAmount = round(
                (float) $order->total_amount - $discountAmount + (float) $order->delivery_fee,
                2
            );

            DB::table('orders')->where('id', $order->id)->update([
                'voucher_id'      => $validVoucher->id,
                'discount_amount' => $discountAmount,
                'final_amount'    => $finalAmount,
                'updated_at'      => $order->updated_at,
            ]);

            DB::table('voucher_usages')->insert([
                'voucher_id' => $validVoucher->id,
                'user_id'    => $order->user_id,
                'order_id'   => $order->id,
                'created_at' => $order->created_at,
                'updated_at' => $order->created_at,
            ]);

            $comboKey = "{$order->user_id}:{$validVoucher->id}";
            $usedCombos[$comboKey]               = true;
            $voucherUsedCounts[$validVoucher->id] = ($voucherUsedCounts[$validVoucher->id] ?? 0) + 1;

            $applied++;
        }

        foreach ($voucherUsedCounts as $voucherId => $count) {
            DB::table('vouchers')->where('id', $voucherId)->increment('used_count', $count);
        }

        $this->command->info("✅ Done! Vouchers applied: {$applied} | Skipped (no valid match): {$skipped}");
    }
}
