<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Restaurant;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'type'             => ['required', Rule::in(['percentage', 'fixed'])],
            'value'            => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'is_active'        => ['boolean'],
            'expires_at'       => ['nullable', 'date', 'after:today'],
            'restaurant_id'    => ['nullable', 'exists:restaurants,id'],
        ]);

        if ($user->role === 'owner') {
            abort_if(empty($data['restaurant_id']), 403);
            $restaurant = Restaurant::findOrFail($data['restaurant_id']);
            abort_if($restaurant->owner_id !== $user->id, 403);
        }

        $data['code']       = strtoupper($data['code']);
        $data['created_by'] = $user->id;

        $voucher = Voucher::create($data);

        return response()->json(['created' => true, 'voucher' => $voucher]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $user = auth()->user();

        if ($user->role === 'owner') {
            abort_if($voucher->restaurant_id === null || $voucher->restaurant->owner_id !== $user->id, 403);
        }

        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucher->id)],
            'type'             => ['required', Rule::in(['percentage', 'fixed'])],
            'value'            => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses'         => ['nullable', 'integer', 'min:1'],
            'is_active'        => ['boolean'],
            'expires_at'       => ['nullable', 'date'],
            'restaurant_id'    => ['nullable', 'exists:restaurants,id'],
        ]);

        $data['code'] = strtoupper($data['code']);

        $voucher->update($data);

        return response()->json(['updated' => true, 'voucher' => $voucher->fresh()]);
    }

    public function destroy(Voucher $voucher)
    {
        $user = auth()->user();

        if ($user->role === 'owner') {
            abort_if($voucher->restaurant_id === null || $voucher->restaurant->owner_id !== $user->id, 403);
        }

        $voucher->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * AJAX voucher validation from the cart page.
     * Checks all 6 conditions. Does NOT create a VoucherUsage record.
     * That happens inside CartController@checkout within the DB transaction.
     */
    public function validate(Request $request)
    {
        $request->validate(['code' => 'required|string|max:50']);

        $user      = auth()->user();
        $cartItems = CartItem::where('user_id', $user->id)->with('menuItem')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['valid' => false, 'message' => 'Your cart is empty.'], 422);
        }

        $restaurantId = $cartItems->first()->menuItem->restaurant_id;
        $cartTotal    = $cartItems->sum(fn ($i) => $i->menuItem->price * $i->quantity);

        // Condition 1 — code exists and is active
        $voucher = Voucher::where('code', strtoupper($request->code))->first();

        if (! $voucher || ! $voucher->is_active) {
            return response()->json(['valid' => false, 'message' => 'Invalid or inactive voucher code.'], 422);
        }

        // Condition 2 — not expired
        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return response()->json(['valid' => false, 'message' => 'This voucher has expired.'], 422);
        }

        // Condition 3 — global cap not hit
        if ($voucher->max_uses !== null && $voucher->used_count >= $voucher->max_uses) {
            return response()->json(['valid' => false, 'message' => 'This voucher has reached its usage limit.'], 422);
        }

        // Condition 4 — customer has not already used it
        if (VoucherUsage::where('voucher_id', $voucher->id)->where('user_id', $user->id)->exists()) {
            return response()->json(['valid' => false, 'message' => 'You have already used this voucher.'], 422);
        }

        // Condition 5 — cart meets minimum order amount
        if ($voucher->min_order_amount !== null && $cartTotal < $voucher->min_order_amount) {
            return response()->json([
                'valid'   => false,
                'message' => 'Minimum order of ₱' . number_format($voucher->min_order_amount, 2) . ' required for this voucher.',
            ], 422);
        }

        // Condition 6 — scope matches (null = site-wide, otherwise must match cart restaurant)
        if ($voucher->restaurant_id !== null && $voucher->restaurant_id !== $restaurantId) {
            return response()->json(['valid' => false, 'message' => 'This voucher is not valid for this restaurant.'], 422);
        }

        // All conditions passed — compute discount for display
        $discount = $voucher->type === 'percentage'
            ? $cartTotal * ($voucher->value / 100)
            : (float) $voucher->value;

        $discount    = min($discount, $cartTotal);
        $finalAmount = max(0, $cartTotal - $discount);

        return response()->json([
            'valid'        => true,
            'code'         => $voucher->code,
            'type'         => $voucher->type,
            'value'        => $voucher->value,
            'discount'     => round($discount, 2),
            'cart_total'   => round($cartTotal, 2),
            'final_amount' => round($finalAmount, 2),
        ]);
    }
}