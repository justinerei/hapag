<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'used_count',
        'restaurant_id',
        'created_by',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(VoucherUsage::class);
    }
}
