<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'total_amount',
        'discount_amount',
        'delivery_fee',
        'final_amount',
        'voucher_id',
        'status',
        'order_type',
        'delivery_address',
        'pickup_note',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount'    => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'delivery_fee'    => 'decimal:2',
            'final_amount'    => 'decimal:2',
            'scheduled_at'    => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function voucherUsage(): HasOne
    {
        return $this->hasOne(VoucherUsage::class);
    }
}
