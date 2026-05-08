<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_type', ['pickup', 'delivery'])->default('pickup')->after('status');
            $table->text('delivery_address')->nullable()->after('order_type');
            $table->decimal('delivery_fee', 8, 2)->default(0)->after('delivery_address');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_type', 'delivery_address', 'delivery_fee']);
        });
    }
};
