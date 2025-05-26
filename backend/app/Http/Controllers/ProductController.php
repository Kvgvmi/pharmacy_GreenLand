<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Get all products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Get all products
            $products = Product::all();
            
            // Transform products to ensure consistent field naming
            $products = $products->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($products, 200);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching products: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error fetching products', 'error' => $e->getMessage()], 
                500
            );
        }
    }

    /**
     * Get all supplements products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSupplements()
    {
        try {
            // Get all products with category_id 2 (supplements)
            $supplements = Product::where('category_id', 2)->get();
            
            // Transform products to ensure consistent field naming
            $supplements = $supplements->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($supplements, 200);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching supplements: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error fetching supplements', 'error' => $e->getMessage()], 
                500
            );
        }
    }
    
    /**
     * Get all bio products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bio()
    {
        try {
            // Log method call for debugging
            Log::info('Bio method called - fetching from database');
            
            // Get bio products from the database (category_id 3 is Bio)
            $bioProducts = Product::where('category_id', 3)->get();
            
            // If no products found and we're in development, provide empty array
            if ($bioProducts->isEmpty()) {
                Log::info('No bio products found in database');
                return response()->json([], 200);
            }
            
            // Transform products to ensure consistent field naming
            $formattedProducts = $bioProducts->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($formattedProducts, 200);
        } catch (\Exception $e) {
            // Log the error with more details
            Log::error('Bio products error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error fetching bio products', 'error' => $e->getMessage()], 
                500
            );
        }
    }

    /**
     * Get all baby products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function baby()
    {
        try {
            // Log method call for debugging
            Log::info('Baby method called - fetching from database');
            
            // Get baby products from the database (category_id 4 is Baby)
            $babyProducts = Product::where('category_id', 4)->get();
            
            // If no products found, provide empty array
            if ($babyProducts->isEmpty()) {
                Log::info('No baby products found in database');
                return response()->json([], 200);
            }
            
            // Transform products to ensure consistent field naming
            $formattedProducts = $babyProducts->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($formattedProducts, 200);
        } catch (\Exception $e) {
            // Log the error with more details
            Log::error('Baby products error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error fetching baby products', 'error' => $e->getMessage()], 
                500
            );
        }
    }
    
    /**
     * Get all medicine products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMedicines()
    {
        try {
            // Get products with category_id 1 (Medicine)
            $medicines = Product::where('category_id', 1)->get();
            
            // Transform products to ensure consistent field naming
            $medicines = $medicines->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($medicines, 200);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error fetching medicines: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error fetching medicines', 'error' => $e->getMessage()], 
                500
            );
        }
    }

    /**
     * Add product to cart
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Log the entire request data
            Log::info('Add to cart request received: ' . json_encode($request->all()));
            
            // Validate request using lowercase column names to match database schema
            $validated = $request->validate([
                'id_product' => 'required|integer',
                'id_user' => 'required|integer',
                'quantity' => 'required|integer|min:1',
            ]);
            
            // Get the product ID and user ID
            $productId = $validated['id_product'];
            $userId = $validated['id_user'];
            $quantity = $validated['quantity'];
            
            // Check if product actually exists
            $product = DB::table('products')->where('id', $productId)->first();
            
            if (!$product) {
                DB::rollBack();
                Log::error('Product not found with ID: ' . $productId);
                return response()->json([
                    'message' => 'Product not found',
                    'id_product' => $productId
                ], 404);
            }
            
            // Check if user exists
            $user = DB::table('users')->where('id', $userId)->first();
            
            if (!$user) {
                DB::rollBack();
                Log::error('User not found with ID: ' . $userId);
                return response()->json([
                    'message' => 'User not found',
                    'id_user' => $userId
                ], 404);
            }
            
            // Find or create user's cart
            $cart = DB::table('carts')->where('user_id', $userId)->first();
            $cartId = null;
            
            if (!$cart) {
                // Create a new cart for the user if it doesn't exist
                $cartId = DB::table('carts')->insertGetId([
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                Log::info('Created new cart with ID: ' . $cartId . ' for user: ' . $userId);
            } else {
                $cartId = $cart->id;
                Log::info('Using existing cart with ID: ' . $cartId);
            }
            
            // Check if this product is already in the cart
            $existingCartItem = DB::table('cart_product')
                ->where('cart_id', $cartId)
                ->where('product_id', $productId)
                ->first();
            
            $finalQuantity = $quantity;
                
            if ($existingCartItem) {
                // Update the quantity if product already exists in cart
                $finalQuantity = $existingCartItem->quantity + $quantity;
                DB::table('cart_product')
                    ->where('id', $existingCartItem->id)
                    ->update([
                        'quantity' => $finalQuantity,
                        'updated_at' => now()
                    ]);
                Log::info('Updated quantity for existing cart item to: ' . $finalQuantity);
            } else {
                // Add new product to cart
                DB::table('cart_product')->insert([
                    'cart_id' => $cartId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                Log::info('Added new product to cart with quantity: ' . $quantity);
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Product added to cart successfully',
                'cart_id' => $cartId,
                'product_id' => $productId,
                'quantity' => $finalQuantity
            ], 200);
            
        } catch (\Exception $e) {
            // Rollback any database transactions
            DB::rollBack();
            
            Log::error('Error adding product to cart: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error adding product to cart', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Get new products (recently added products)
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function newProducts()
{
    try {
        // First check if database connection is working
        try {
            DB::connection()->getPdo();
            Log::info('Database connection successful in newProducts method');
        } catch (\Exception $e) {
            Log::error('Database connection failed in newProducts: ' . $e->getMessage());
            return response()->json(
                ['message' => 'Database connection error', 'error' => $e->getMessage()], 
                500
            );
        }
        
        try {
            // Get the most recently added products (last 10 products)
            // Assuming you have created_at column, if not, we'll use id ordering
            $newProducts = Product::orderBy('created_at', 'desc')
                ->take(10)
                ->get();
            
            // If created_at doesn't exist, use id ordering as fallback
            if ($newProducts->isEmpty()) {
                $newProducts = Product::orderBy('id', 'desc')
                    ->take(10)
                    ->get();
            }
            
            // Transform products to ensure consistent field naming
            $newProducts = $newProducts->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($newProducts, 200);
        } catch (\Exception $e) {
            Log::error('New products query error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(
                ['message' => 'Error querying new products', 'error' => $e->getMessage()], 
                500
            );
        }
    } catch (\Exception $e) {
        // Log the error with more details
        Log::error('New products unhandled error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        
        // Return error response
        return response()->json(
            ['message' => 'Error fetching new products', 'error' => $e->getMessage()], 
            500
        );
    }
}





    
    /**
     * Store a new product
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Product creation request data:', $request->all());
            
            // Skip validation temporarily to debug the issue
            // $request->validate([
            //     'name' => 'required|string|max:255',
            //     'price' => 'required|numeric',
            //     'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            //     'category_id' => 'required|integer|exists:categories,id_category',
            //     'description' => 'nullable|string',
            //     'stock' => 'nullable|integer',
            //     'expiry_date' => 'nullable|date',
            // ]);

            $imagePath = null;

            if ($request->hasFile('image')) {
                Log::info('Image detected in request');
                try {
                    $imagePath = $request->file('image')->store('products', 'public');
                    Log::info('Image stored at: ' . $imagePath);
                } catch (\Exception $imageEx) {
                    Log::error('Image storage error: ' . $imageEx->getMessage());
                }
            } else {
                Log::info('No image in request');
            }
            
            // Use direct DB insertion for debugging
            try {
                $data = [
                    'name' => $request->input('name'),
                    'description' => $request->input('description'),
                    'price' => (float) $request->input('price'),
                    'category_id' => (int) $request->input('category_id'),
                    'image' => $imagePath,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                
                // Add optional fields if present
                if ($request->has('stock')) {
                    $data['stock'] = (int) $request->input('stock');
                }
                
                if ($request->has('expiry_date')) {
                    $data['expiry_date'] = $request->input('expiry_date');
                }
                
                Log::info('Attempting to insert product with data:', $data);
                
                // Insert directly using DB facade
                $productId = DB::table('products')->insertGetId($data);
                
                Log::info('Product created with ID: ' . $productId);
                
                // Fetch the created product
                $product = Product::find($productId);
                
                return response()->json([
                    'message' => 'Product created successfully',
                    'product' => $this->formatProduct($product)
                ], 201);
                
            } catch (\Exception $dbEx) {
                Log::error('Database insertion error: ' . $dbEx->getMessage());
                Log::error($dbEx->getTraceAsString());
                throw $dbEx; // Re-throw to be caught by outer catch
            }
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(
                ['message' => 'Error creating product', 'error' => $e->getMessage()],
                500
            );
        }
    }
    
    /**
     * Simple test endpoint to verify API connectivity
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function test()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working correctly',
            'timestamp' => now()->toDateTimeString()
        ]);
    }
    
    /**
     * Get all product categories
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategories()
    {
        try {
            Log::info('getCategories method called with hardcoded data');
            
            // Return hardcoded categories for testing
            $categories = [
                [
                    'id_category' => 1, 
                    'name_category' => 'Medicines'
                ],
                [
                    'id_category' => 2, 
                    'name_category' => 'Supplements'
                ],
                [
                    'id_category' => 3, 
                    'name_category' => 'Bio Products'
                ],
                [
                    'id_category' => 4, 
                    'name_category' => 'Baby Products'
                ]
            ];
            
            return response()->json($categories, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json(
                ['message' => 'Error fetching categories', 'error' => $e->getMessage()], 
                500
            );
        }
    }
    
    /**
     * Get a specific product by ID
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            Log::info('Fetching product from database for ID: ' . $id);
            
            // Find the product in the database
            $product = Product::find($id);
            
            if (!$product) {
                Log::error('Product not found with ID: ' . $id);
                return response()->json(['message' => 'Product not found'], 404);
            }
            
            // Format the product data with uppercase field names for frontend compatibility
            $productData = [
                'ID_PRODUCT' => $product->id,
                'NAME_PRODUCT' => $product->name,
                'DESCRIPTION_PRODUCT' => $product->description,
                'PRICE_PRODUCT' => $product->price,
                'CATEGORY_ID' => $product->category_id,
                'STOCK_PRODUCT' => $product->stock,
                'EXPIRY_DATE' => $product->expiry_date,
                'IMAGE_PRODUCT' => $product->image
            ];
            
            Log::info('Successfully retrieved product data', ['product' => $productData]);
            return response()->json($productData, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Error fetching product', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Delete a product
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            // Log the ID we're trying to delete for debugging
            Log::info('Attempting to delete product with ID: ' . $id);
            
            // Get a PDO connection directly
            $pdo = DB::connection()->getPdo();
            
            // Prepare and execute the delete statement
            $stmt = $pdo->prepare("DELETE FROM products WHERE ID_PRODUCT = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                Log::info('Product deleted successfully: ' . $id);
                return response()->json(['message' => 'Product deleted successfully'], 200);
            } else {
                Log::error('Failed to delete product: ' . $id);
                return response()->json(['message' => 'Failed to delete product'], 500);
            }
        } catch (\Exception $e) {
            // Log the error with detailed information
            Log::error('Error deleting product: ' . $e->getMessage());
            Log::error('Exception class: ' . get_class($e));
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return error response with more details
            return response()->json([
                'message' => 'Error deleting product',
                'error' => $e->getMessage(),
                'exception_type' => get_class($e)
            ], 500);
        }
    }
    
    /**
     * Update an existing product
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Log the update attempt with detailed information
            Log::info('Attempting to update product with ID: ' . $id);
            Log::info('Update data received: ' . json_encode($request->all()));
            
            // Check if the product exists before attempting update - using lowercase 'id' column name
            $productExists = DB::table('products')->where('id', $id)->exists();
            
            if (!$productExists) {
                Log::error('Product not found for update with ID: ' . $id);
                return response()->json(['message' => 'Product not found'], 404);
            }
            
            // Prepare update data with detailed validation and error handling
            // Using lowercase column names to match the database schema
            $updateData = [];
            
            // Handle required fields with validation
            if ($request->has('name')) {
                $updateData['name'] = $request->input('name');
                Log::info('Setting name to: ' . $request->input('name'));
            }
            
            if ($request->has('description')) {
                $updateData['description'] = $request->input('description');
                Log::info('Setting description to: ' . $request->input('description'));
            }
            
            if ($request->has('price')) {
                $updateData['price'] = $request->input('price');
                Log::info('Setting price to: ' . $request->input('price'));
            }
            
            if ($request->has('stock')) {
                $updateData['stock'] = $request->input('stock');
                Log::info('Setting stock to: ' . $request->input('stock'));
            }
            
            // Handle category_id, may come as single value or array
            if ($request->has('category_id')) {
                $categoryId = $request->input('category_id');
                // If it's an array, take the first element
                if (is_array($categoryId) && !empty($categoryId)) {
                    $categoryId = $categoryId[0];
                }
                $updateData['category_id'] = $categoryId;
                Log::info('Setting category_id to: ' . $categoryId);
            }
            
            // Add timestamp
            $updateData['updated_at'] = now();
            
            // Handle expiry date if provided (might be called expdate or expiry_date)
            if ($request->has('expiry_date')) {
                $updateData['expiry_date'] = $request->input('expiry_date');
                Log::info('Setting expiry_date to: ' . $request->input('expiry_date'));
            } elseif ($request->has('expdate')) {
                $updateData['expiry_date'] = $request->input('expdate');
                Log::info('Setting expiry_date to: ' . $request->input('expdate'));
            }
            
            // Handle image upload if provided
            if ($request->hasFile('image')) {
                try {
                    $image = $request->file('image');
                    $imageName = time() . '_' . str_replace(' ', '_', $request->input('name', 'product')) . '.' . $image->getClientOriginalExtension();
                    
                    // Make sure the directory exists
                    if (!file_exists(storage_path('app/public/products'))) {
                        mkdir(storage_path('app/public/products'), 0755, true);
                    }
                    
                    $image->storeAs('public/products', $imageName);
                    $updateData['image'] = 'products/' . $imageName;
                    Log::info('New image stored at: ' . $updateData['image']);
                } catch (\Exception $imageException) {
                    Log::error('Error processing image: ' . $imageException->getMessage());
                    // Continue with update without image if there's an error
                }
            }
            
            Log::info('Final update data: ' . json_encode($updateData));
            
            // Update the product with detailed error handling - using lowercase 'id' column name
            try {
                $updated = DB::table('products')
                    ->where('id', $id)
                    ->update($updateData);
                
                Log::info('Update result: ' . ($updated ? 'Success' : 'No changes'));
                
                // Return the updated product data with uppercase field names for frontend compatibility
                $updatedProduct = Product::find($id);
                if ($updatedProduct) {
                    $formattedProduct = $this->formatProduct($updatedProduct);
                    return response()->json([
                        'message' => 'Product updated successfully',
                        'product' => $formattedProduct
                    ], 200);
                }
                
                return response()->json(['message' => 'Product updated successfully'], 200);
            } catch (\Exception $dbException) {
                Log::error('Database error during update: ' . $dbException->getMessage());
                return response()->json(
                    ['message' => 'Database error during update', 'error' => $dbException->getMessage()], 
                    500
                );
            }
        } catch (\Exception $e) {
            // Log the error with full details
            Log::error('Unhandled error updating product: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return user-friendly error response
            return response()->json(
                ['message' => 'Error updating product', 'error' => $e->getMessage()], 
                500
            );
        }
    }
    
    /**
     * Custom delete method using direct database access to bypass any potential issues
     * with Eloquent or route handling
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function customDeleteProduct($id)
    {
        try {
            // Log the deletion attempt
            Log::info('Attempting custom product deletion for ID: ' . $id);
            
            // Try using Eloquent first for a cleaner approach
            $product = Product::find($id);
            
            if ($product) {
                $product->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ], 200);
            }
            
            // If Eloquent fails, try direct SQL as a backup
            $dbConnection = DB::connection()->getPdo();
            $dbConnection->beginTransaction();
            
            try {
                // Use lowercase column names that match the actual database structure
                $query = "DELETE FROM products WHERE id = :id";
                $statement = $dbConnection->prepare($query);
                $statement->bindParam(':id', $id, \PDO::PARAM_INT);
                $statement->execute();
                
                Log::info('SQL executed: ' . $query . ' with ID: ' . $id);
                
                $rowsAffected = $statement->rowCount();
                Log::info('Rows affected by deletion: ' . $rowsAffected);
                
                $dbConnection->commit();
                
                if ($rowsAffected > 0) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Product deleted successfully via direct SQL',
                        'rows_affected' => $rowsAffected
                    ], 200);
                } else {
                    return response()->json([
                        'success' => false, 
                        'message' => 'No product found with that ID',
                        'rows_affected' => 0
                    ], 404);
                }
            } catch (\Exception $innerException) {
                // Rollback the transaction on error
                if ($dbConnection->inTransaction()) {
                    $dbConnection->rollBack();
                }
                throw $innerException;
            }
        } catch (\Exception $e) {
            // Log detailed error information
            Log::error('Custom delete method failed: ' . $e->getMessage());
            Log::error('Exception class: ' . get_class($e));
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Error deleting product', 
                'error' => $e->getMessage(),
                'exception_type' => get_class($e)
            ], 500);
        }
    }
    
    /**
     * Search for products by name or description
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            $searchTerm = $request->input('search');
            
            if (!$searchTerm) {
                return response()->json([], 200);
            }
            
            // Search products by name or description
            $products = Product::where('name', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%")
                ->get();
            
            // Transform products to ensure consistent field naming
            $products = $products->map(function ($product) {
                return $this->formatProduct($product);
            });
            
            return response()->json($products, 200);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error searching products: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Return error response
            return response()->json(
                ['message' => 'Error searching products', 'error' => $e->getMessage()], 
                500
            );
        }
    }
    

    /**
 * Get best selling products
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function bestSellers()
{
    try {
        // Log the start of this method for debugging
        Log::info('bestSellers method called - fetching from database');
        
        // In a real system, you would calculate best sellers based on order history
        // For now, we'll just get some products from the database (limit to 8)
        $bestSellerProducts = Product::take(8)->get();
        
        // If no products found, return empty array
        if ($bestSellerProducts->isEmpty()) {
            Log::info('No products found for best sellers');
            return response()->json([], 200);
        }
        
        // Transform products to ensure consistent field naming
        $formattedProducts = $bestSellerProducts->map(function ($product) {
            return $this->formatProduct($product);
        });
        
        return response()->json($formattedProducts, 200);
    } catch (\Exception $e) {
        // Log the error with more details
        Log::error('Best sellers error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        
        // Return error response
        return response()->json(
            ['message' => 'Error fetching best sellers', 'error' => $e->getMessage()], 
            500
        );
    }
}

    /**
     * Format product data for consistent field naming across all routes
     *
     * @param  \App\Models\Product  $product
     * @return array
     */
    private function formatProduct($product)
    {
        // Create a standardized product representation that maintains compatibility with frontend
        // The frontend expects uppercase names, but our database uses lowercase
        $formattedProduct = [
            'ID_PRODUCT' => $product->id,
            'NAME_PRODUCT' => $product->name,
            'DESCRIPTION_PRODUCT' => $product->description,
            'PRICE_PRODUCT' => $product->price,
            'CATEGORY_ID' => $product->category_id,
            'STOCK' => $product->stock,
            'EXPIRY_DATE' => $product->expiry_date,
        ];
        
        // Handle the image
        if ($product->image) {
            // Check if image is a storage path or binary data
            if (is_string($product->image) && Storage::exists($product->image)) {
                // It's a file path, get the URL
                $formattedProduct['IMAGE_PRODUCT'] = [
                    'data' => Storage::url($product->image)
                ];
            } else {
                // It's binary data, prepare for frontend
                $formattedProduct['IMAGE_PRODUCT'] = [
                    'data' => $product->image
                ];
            }
        } else {
            $formattedProduct['IMAGE_PRODUCT'] = null;
        }
        
        return $formattedProduct;
    }
}