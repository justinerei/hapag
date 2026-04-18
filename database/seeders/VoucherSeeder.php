<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $admin   = User::where('email', 'admin@hapag.com')->first();
        $owner4  = User::where('email', 'owner4@hapag.com')->first(); // Grill Masters SC + Calamba
        $owner6  = User::where('email', 'owner6@hapag.com')->first(); // Kape't Tinapay Pagsanjan + SC
        $owner15 = User::where('email', 'owner15@hapag.com')->first(); // Bida Burger Cabuyao + SC + LB

        $grillMastersSC  = Restaurant::where('name', 'Grill Masters PH - Santa Cruz')->first();
        $kapetPagsanjan  = Restaurant::where('name', "Kape't Tinapay - Pagsanjan")->first();
        $bidaBurgerSC    = Restaurant::where('name', 'Bida Burger - Santa Cruz')->first();

        // ── Site-wide vouchers (admin-created, restaurant_id = null) ──────
        Voucher::create([
            'code'             => 'HAPAG20',
            'type'             => 'percentage',
            'value'            => 20.00,
            'min_order_amount' => 200.00,
            'max_uses'         => 100,
            'used_count'       => 0,
            'restaurant_id'    => null,
            'created_by'       => $admin->id,
            'is_active'        => true,
            'expires_at'       => now()->addMonths(3),
        ]);

        Voucher::create([
            'code'             => 'KAINDITO',
            'type'             => 'fixed',
            'value'            => 50.00,
            'min_order_amount' => 300.00,
            'max_uses'         => 200,
            'used_count'       => 0,
            'restaurant_id'    => null,
            'created_by'       => $admin->id,
            'is_active'        => true,
            'expires_at'       => now()->addMonths(2),
        ]);

        Voucher::create([
            'code'             => 'MASARAP10',
            'type'             => 'percentage',
            'value'            => 10.00,
            'min_order_amount' => null,
            'max_uses'         => 50,
            'used_count'       => 0,
            'restaurant_id'    => null,
            'created_by'       => $admin->id,
            'is_active'        => true,
            'expires_at'       => null,
        ]);

        // ── Restaurant-specific vouchers (owner-created) ──────────────────
        Voucher::create([
            'code'             => 'GRILL30',
            'type'             => 'fixed',
            'value'            => 30.00,
            'min_order_amount' => 150.00,
            'max_uses'         => null,
            'used_count'       => 0,
            'restaurant_id'    => $grillMastersSC->id,
            'created_by'       => $owner4->id,
            'is_active'        => true,
            'expires_at'       => now()->addMonth(),
        ]);

        Voucher::create([
            'code'             => 'KAFETIME',
            'type'             => 'percentage',
            'value'            => 15.00,
            'min_order_amount' => 100.00,
            'max_uses'         => 80,
            'used_count'       => 0,
            'restaurant_id'    => $kapetPagsanjan->id,
            'created_by'       => $owner6->id,
            'is_active'        => true,
            'expires_at'       => now()->addWeeks(6),
        ]);

        Voucher::create([
            'code'             => 'BIDANOW',
            'type'             => 'fixed',
            'value'            => 25.00,
            'min_order_amount' => 120.00,
            'max_uses'         => null,
            'used_count'       => 0,
            'restaurant_id'    => $bidaBurgerSC->id,
            'created_by'       => $owner15->id,
            'is_active'        => true,
            'expires_at'       => now()->addMonths(2),
        ]);
    }
}
