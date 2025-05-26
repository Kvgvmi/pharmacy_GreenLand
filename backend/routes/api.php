<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DiagnosticController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


// Home route
Route::get('/', function () {
    return response()->json(['message' => 'Welcome to the API!']);
});

// Auth routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);


// Product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products-search', action: [ProductController::class, 'search']);
Route::get('/product/{id}', [ProductController::class, 'show']);
Route::post('/add-product', [ProductController::class, 'store']);
Route::put('/update-product/{id}', [ProductController::class, 'update']);

// Test route for product creation - simplified for debugging
Route::get('/test-add-product', function() {
    try {
        // Create a test product directly
        $product = new \App\Models\Product();
        $product->name = 'Test Product';
        $product->description = 'Test Description';
        $product->price = 9.99;
        $product->category_id = 1;
        $product->stock = 10;
        $product->save();
        
        return response()->json([
            'message' => 'Test product created successfully',
            'product' => $product
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error creating test product',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::post('/delete-product/{id}', [ProductController::class, 'customDeleteProduct']);
Route::get('/best-sellers', [ProductController::class, 'bestSellers']);
Route::get('/new-products', [ProductController::class, 'newProducts']);
// Category routes
Route::get('/categories', [ProductController::class, 'getCategories']);
Route::get('/medicines', [ProductController::class, 'getMedicines']);
Route::get('/baby', action: [ProductController::class, 'baby']);
Route::get('/supplements', [ProductController::class, 'getSupplements']);
Route::get('/bio', [ProductController::class, 'bio']);

// Cart routes


// Cart routes
Route::get('cart-items/{userId}', [CartController::class, 'getCartItemsByUserId']);
Route::put('update-cart-items', [CartController::class, 'updateCartItems']);
Route::delete('delete-cart-item', [CartController::class, 'deleteCartItem']);
Route::delete('clear-cart/{userId}', [CartController::class, 'clearCartByUserId']);






Route::post('/add-to-cart', [ProductController::class, 'addToCart']);
Route::put('/update-cart-item', [CartController::class, 'updateItem']);
Route::delete('/delete-cart-item', [CartController::class, 'deleteItem']);
Route::put('/update-cart-items', [CartController::class, 'updateItems']);
Route::get('/cart-items/{userId}', [CartController::class, 'getItems']);
Route::delete('/clear-cart/{userId}', [CartController::class, 'clearCart']);
Route::get('/cart-items/{userId}', [CartController::class, 'getItems']);
Route::put('/update-cart-items', [CartController::class, 'updateItems']);
Route::delete('/delete-cart-item', [CartController::class, 'deleteItem']);
Route::delete('/clear-cart/{userId}', [CartController::class, 'clearCart']);

// Order routes
Route::post('/orders', [OrderController::class, 'store']);
Route::post('/order-details', [OrderController::class, 'storeDetails']);
Route::get('/orders/{userId}', [OrderController::class, 'getUserOrders']);
Route::get('/see-orders', [OrderController::class, 'getAllOrders']);
Route::get('/order-details/{id}', [OrderController::class, 'getOrderDetails']);

// Feedback routes
Route::post('/submit-feedback', [FeedbackController::class, 'storeSimpleFeedback']); // Use the new method for simple feedback
Route::post('/product-feedback', [FeedbackController::class, 'store']); // Use original method for product-specific feedback
Route::get('/feedbacks', [FeedbackController::class, 'index']);

// Prescription routes
Route::post('/add-prescription', [PrescriptionController::class, 'store']);
Route::get('/prescriptions', [PrescriptionController::class, 'index']);
Route::get('/user-prescriptions', [PrescriptionController::class, 'getUserPrescriptions']);

Route::get('/diagnostics', [DiagnosticController::class, 'index']);
