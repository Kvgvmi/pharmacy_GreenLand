<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $orders = Order::with('orderDetails.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Log the incoming request for debugging
        \Illuminate\Support\Facades\Log::info('Order creation request: ' . json_encode($request->all()));
        
        $validator = Validator::make($request->all(), [
            'id_user' => 'required|integer|exists:users,id',
            'price_order' => 'required|numeric|min:0',
            'date_order' => 'required|string',
            'products' => 'required|array',
            'products.*.id_product' => 'required|integer|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Order validation failed: ' . json_encode($validator->errors()));
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Extract data from request
        $userId = $request->input('id_user');
        $totalAmount = $request->input('price_order');
        $products = $request->input('products');

        // Check stock availability
        $orderItems = [];
        
        foreach ($products as $item) {
            $productId = $item['id_product'];
            $quantity = $item['quantity'];
            
            // Get the product from database
            $product = DB::table('products')->where('id', $productId)->first();
            
            if (!$product) {
                \Illuminate\Support\Facades\Log::error('Product not found: ' . $productId);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found: ' . $productId
                ], 400);
            }
            
            if ($quantity > $product->stock) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient stock for ' . $product->name,
                    'available_stock' => $product->stock
                ], 400);
            }
            
            $price = $product->price;
            $subtotal = $price * $quantity;
            
            $orderItems[] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'subtotal' => $subtotal
            ];
        }

        // Create order transaction
        DB::beginTransaction();
        
        try {
            // Create order with simplified data from frontend - using correct column names
            $order = DB::table('orders')->insertGetId([
                'user_id' => $userId,
                'price' => $totalAmount,
                'order_date' => now()->toDateString(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            \Illuminate\Support\Facades\Log::info('Order created with ID: ' . $order);
            
            // Create order details - without subtotal field as it doesn't exist in the table
            foreach ($orderItems as $item) {
                DB::table('order_details')->insert([
                    'order_id' => $order,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                // Update product stock
                DB::table('products')
                    ->where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }
            
            DB::commit();
            
            // Return formatted response with uppercase field names for frontend compatibility
            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully',
                'orderId' => $order,
                'data' => [
                    'ID_ORDER' => $order,
                    'PRICE_ORDER' => $totalAmount,
                    'DATE_ORDER' => now()->toDateString() 
                ]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to place order: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to place order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    


    /**
     * Display the specified order.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::with('orderDetails.product')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    /**
     * Cancel an order (if it's still pending).
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function cancel($id)
    {
        $order = Order::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot cancel order with status: ' . $order->status
            ], 400);
        }

        DB::beginTransaction();
        
        try {
            // Update order status
            $order->status = 'cancelled';
            $order->save();
            
            // Restore product stock
            $orderDetails = OrderDetail::where('order_id', $order->id)->get();
            
            foreach ($orderDetails as $detail) {
                $product = Product::find($detail->product_id);
                $product->stock += $detail->quantity;
                $product->save();
            }
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Order cancelled successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order tracking information.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function trackOrder($id)
    {
        $order = Order::select('id', 'status', 'created_at', 'updated_at')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        // Generate tracking information based on order status
        $trackingInfo = [];
        
        $trackingInfo[] = [
            'status' => 'Order Placed',
            'description' => 'Your order has been placed.',
            'timestamp' => $order->created_at,
            'completed' => true
        ];
        
        if (in_array($order->status, ['processing', 'shipped', 'delivered'])) {
            $trackingInfo[] = [
                'status' => 'Processing',
                'description' => 'Your order is being processed.',
                'timestamp' => $order->updated_at,
                'completed' => true
            ];
        }
        
        if (in_array($order->status, ['shipped', 'delivered'])) {
            $trackingInfo[] = [
                'status' => 'Shipped',
                'description' => 'Your order has been shipped.',
                'timestamp' => $order->updated_at,
                'completed' => true
            ];
        }
        
        if ($order->status === 'delivered') {
            $trackingInfo[] = [
                'status' => 'Delivered',
                'description' => 'Your order has been delivered.',
                'timestamp' => $order->updated_at,
                'completed' => true
            ];
        }
        
        if ($order->status === 'cancelled') {
            $trackingInfo[] = [
                'status' => 'Cancelled',
                'description' => 'Your order has been cancelled.',
                'timestamp' => $order->updated_at,
                'completed' => true
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'order_id' => $order->id,
                'current_status' => $order->status,
                'tracking_info' => $trackingInfo
            ]
        ]);
    }

    /**
     * Get admin dashboard stats.
     * (Requires admin middleware in routes)
     *
     * @return \Illuminate\Http\Response
     */
    public function getAdminStats()
    {
        // Get total sales, pending orders, etc.
        $totalSales = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'delivered')->count();
        $totalOrders = Order::count();
        
        // Get recent orders
        $recentOrders = Order::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        // Get sales by day for the last week
        $salesByDay = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_sales' => $totalSales,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'total_orders' => $totalOrders,
                'recent_orders' => $recentOrders,
                'sales_by_day' => $salesByDay
            ]
        ]);
    }
    
    /**
     * Store order details (simplified version for frontend)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeDetails(Request $request)
    {
        // Log the incoming request for debugging
        \Illuminate\Support\Facades\Log::info('Order details request: ' . json_encode($request->all()));
        
        try {
            $validator = Validator::make($request->all(), [
                'id_order' => 'required|integer',
                'orderDetails' => 'required|array',
                'orderDetails.*.id_product' => 'required|integer',
                'orderDetails.*.quantity_product' => 'required|integer|min:1',
                'orderDetails.*.price_product' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $orderId = $request->id_order;
            $orderDetails = $request->orderDetails;

            // Begin transaction
            DB::beginTransaction();

            // Insert order details
            foreach ($orderDetails as $detail) {
                // Insert with correct column names matching the database schema (no subtotal column)
                DB::table('order_details')->insert([
                    'order_id' => $orderId,
                    'product_id' => $detail['id_product'],
                    'quantity' => $detail['quantity_product'],
                    'price' => $detail['price_product'], // Store total price 
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Update product stock
                $product = DB::table('products')->where('id', $detail['id_product'])->first();
                if ($product) {
                    $newStock = max(0, $product->stock - $detail['quantity_product']);
                    DB::table('products')
                        ->where('id', $detail['id_product'])
                        ->update(['stock' => $newStock]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order details saved successfully',
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Error saving order details: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save order details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order details for a specific order
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getOrderDetails($id)
    {
        try {
            // Log the request for debugging
            \Illuminate\Support\Facades\Log::info('Fetching order details for order ID: ' . $id);
            
            // Join with products table and select fields with uppercase names for frontend compatibility
            $orderDetails = DB::table('order_details')
                ->join('products', 'order_details.product_id', '=', 'products.id')
                ->where('order_details.order_id', $id)
                ->select(
                    'order_details.id as ID_ORDERDETAIL',
                    'order_details.product_id as ID_PRODUCT',
                    'products.name as NAME_PRODUCT',
                    'products.image as IMAGE_PRODUCT',
                    'order_details.quantity as QUANTITY_PRODUCT',
                    'order_details.price as PRICE_PRODUCT'
                    // Removed non-existent subtotal field
                )
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $orderDetails
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching order details: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch order details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get user orders
     *
     * @param int $userId
     * @return \Illuminate\Http\Response
     */
    public function getUserOrders($userId)
    {
        try {
            // Get user orders with formatted field names for frontend compatibility
            $orders = DB::table('orders')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->select(
                    'id as ID_ORDER',
                    'user_id as ID_USER',
                    'total_amount as PRICE_ORDER',
                    'created_at as DATE_ORDER',
                    'status'
                )
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching user orders: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders for admin view.
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllOrders()
    {
        try {
            // Get all orders with user information
            $orders = Order::with(['user' => function($query) {
                $query->select('id', 'username', 'phone', 'city');
            }])->orderBy('created_at', 'desc')->get();
            
            // Format the orders for the frontend
            $formattedOrders = [];
            
            foreach ($orders as $order) {
                // Use price instead of total_amount to match the database column name
                $formattedOrders[] = [
                    'ID_ORDER' => $order->id,
                    'username_user' => $order->user ? $order->user->username : 'Unknown User',
                    'PRICE_ORDER' => $order->price, // Changed from total_amount to price
                    'DATE_ORDER' => $order->created_at,
                    'status' => $order->status ?? 'pending'
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedOrders
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching all orders: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}