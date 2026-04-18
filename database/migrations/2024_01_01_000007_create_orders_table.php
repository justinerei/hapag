<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->decimal('total_amount', 8, 2);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->decimal('final_amount', 8, 2);
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->nullOnDelete();
            $table->enum('status', ['pending', 'preparing', 'ready'])->default('pending');
            $table->text('pickup_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
