<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            // Add product-related fields while keeping backwards compatibility
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete()->after('user_id');
            $table->float('rating')->nullable()->after('product_id');
            
            // Rename text column to comment to match convention and add text_feedback column
            $table->renameColumn('text', 'comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            // Revert changes by dropping the added columns
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
            $table->dropColumn('rating');
            
            // Rename comment back to text
            $table->renameColumn('comment', 'text');
        });
    }
};
