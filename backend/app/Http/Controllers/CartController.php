<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get cart items for a specific user ID with product details.
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function getCartItemsByUserId($userId)
    {
        try {
            // Log the request for debugging purposes
            \Illuminate\Support\Facades\Log::info('Fetching cart items for user ID: ' . $userId);
            
            // Find the user's cart
            $cart = Cart::where('user_id', $userId)->first();
            
            if (!$cart) {
                // If no cart exists, return empty array
                \Illuminate\Support\Facades\Log::info('No cart found for user ID: ' . $userId);
                return response()->json([]);
            }
            
            \Illuminate\Support\Facades\Log::info('Found cart ID: ' . $cart->id . ' for user ID: ' . $userId);
            
            // Get products in the cart with their details using lowercase column names
            $cartItems = DB::table('cart_product')
                ->join('products', 'cart_product.product_id', '=', 'products.id') // Fixed column name to lowercase 'id'
                ->where('cart_product.cart_id', $cart->id)
                ->select(
                    'products.id as id_product',             // Using lowercase column names
                    'products.name as name_product',         // But keeping uppercase response field names
                    'products.price as price_product',       // for frontend compatibility
                    'products.stock as stock_product',
                    'cart_product.quantity',
                    'cart_product.id as cart_item_id'
                )
                ->get();
                
            \Illuminate\Support\Facades\Log::info('Retrieved ' . count($cartItems) . ' cart items');
            
            return response()->json($cartItems);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching cart items: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get items in the cart for a specific user ID.
     * This method is required by the route api/cart-items/{userId}
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function getItems($userId)
    {
        return $this->getCartItemsByUserId($userId);
    }
    
    /**
     * Update an item in the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateItem(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'cart_item_id' => 'required|integer',
                'quantity' => 'required|integer|min:1',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }
            
            $cartItemId = $request->input('cart_item_id');
            $quantity = $request->input('quantity');
            
            // Update the cart item quantity
            DB::table('cart_product')
                ->where('id', $cartItemId)
                ->update(['quantity' => $quantity]);
                
            return response()->json(['message' => 'Cart item updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Delete an item from the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function deleteItem(Request $request)
    {
        try {
            // Log the request data for debugging
            \Illuminate\Support\Facades\Log::info('Delete cart item request data:', $request->all());
            
            // Check if the request contains cart_item_id or product_id
            if ($request->has('cart_item_id')) {
                $cartItemId = $request->input('cart_item_id');
                
                // Delete by cart_item_id
                DB::table('cart_product')
                    ->where('id', $cartItemId)
                    ->delete();
            } 
            elseif ($request->has('id_product')) {
                // Get the product ID and user ID
                $productId = $request->input('id_product');
                $userId = $request->input('id_user');
                
                // First, find the cart for this user
                $cart = Cart::where('user_id', $userId)->first();
                
                if (!$cart) {
                    return response()->json(['message' => 'Cart not found'], 404);
                }
                
                // Delete the specific product from this cart
                DB::table('cart_product')
                    ->where('cart_id', $cart->id)
                    ->where('product_id', $productId)
                    ->delete();
                    
                \Illuminate\Support\Facades\Log::info('Deleted product {$productId} from cart {$cart->id}');
            }
            else {
                return response()->json(['message' => 'Missing cart_item_id or id_product parameter'], 400);
            }
                
            return response()->json(['message' => 'Item removed from cart successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error removing item from cart: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Clear all items from a user's cart.
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function clearCart($userId)
    {
        try {
            // Find the user's cart
            $cart = Cart::where('user_id', $userId)->first();
            
            if (!$cart) {
                return response()->json(['message' => 'Cart not found'], 404);
            }
            
            // Delete all items in the cart
            DB::table('cart_product')
                ->where('cart_id', $cart->id)
                ->delete();
                
            return response()->json(['message' => 'Cart cleared successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update multiple cart items at once.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateItems(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'items' => 'required|array',
                'items.*.cart_item_id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }
            
            $items = $request->input('items');
            
            DB::beginTransaction();
            
            foreach ($items as $item) {
                DB::table('cart_product')
                    ->where('id', $item['cart_item_id'])
                    ->update(['quantity' => $item['quantity']]);
            }
            
            DB::commit();
                
            return response()->json(['message' => 'Cart items updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}