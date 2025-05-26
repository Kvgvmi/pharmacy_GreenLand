<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of all prescriptions.
     * Admin only endpoint.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Check if user is admin
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $prescriptions = Prescription::with('user:id,name,email')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $prescriptions
        ]);
    }

    /**
     * Store a newly created prescription in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Log the incoming request data for debugging
        \Illuminate\Support\Facades\Log::info('Prescription creation request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'notes' => 'nullable|string|max:500', // We'll map 'notes' to 'description'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Upload and store the prescription image
        if ($request->hasFile('image')) {
            try {
                // First, handle file upload and convert to binary if needed
                $uploadedFile = $request->file('image');
                
                // For debugging
                \Illuminate\Support\Facades\Log::info('Image file details:', [
                    'original_name' => $uploadedFile->getClientOriginalName(),
                    'mime_type' => $uploadedFile->getMimeType(),
                    'size' => $uploadedFile->getSize()
                ]);
                
                // We have two options here, depending on how the database is set up:
                // 1. Store the binary image data directly in the database
                // $imageData = file_get_contents($uploadedFile->getRealPath());
                
                // 2. Store the image in the filesystem and save the path
                $path = $uploadedFile->store('prescriptions', 'public');
                
                // Create the prescription record with the correct field names
                $prescription = new Prescription();
                $prescription->user_id = $request->user_id ?? Auth::id();
                $prescription->image = $path; // Using 'image' column as in the database
                $prescription->description = $request->notes; // Map 'notes' to 'description'
                
                // Only set status if it exists in the database schema
                // This might cause an error if the column doesn't exist
                // $prescription->status = 'pending';
                
                $prescription->save();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Prescription uploaded successfully',
                    'data' => $prescription
                ], 201);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error saving prescription: ' . $e->getMessage());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to save prescription',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to upload prescription'
        ], 500);
    }

    /**
     * Display the specified prescription.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $prescription = Prescription::find($id);
        
        if (!$prescription) {
            return response()->json([
                'status' => 'error',
                'message' => 'Prescription not found'
            ], 404);
        }

        // Check if user owns this prescription or is admin
        if ($prescription->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this prescription'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $prescription
        ]);
    }

    /**
     * Update the specified prescription in storage.
     * Only admins can update prescription status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $prescription = Prescription::find($id);
        
        if (!$prescription) {
            return response()->json([
                'status' => 'error',
                'message' => 'Prescription not found'
            ], 404);
        }

        // If updating status, only admin can do that
        if ($request->has('status') && !Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update prescription status'
            ], 403);
        }

        // If user is updating their own prescription notes
        if (!Auth::user()->isAdmin() && $prescription->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this prescription'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:pending,approved,rejected',
            'notes' => 'nullable|string|max:500',
            'admin_notes' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update prescription data
        if ($request->has('status')) {
            $prescription->status = $request->status;
        }
        
        if ($request->has('notes')) {
            $prescription->notes = $request->notes;
        }
        
        if (Auth::user()->isAdmin() && $request->has('admin_notes')) {
            $prescription->admin_notes = $request->admin_notes;
        }

        // Update prescription image if provided
        if ($request->hasFile('image')) {
            // Delete old image
            if ($prescription->image_path) {
                Storage::disk('public')->delete($prescription->image_path);
            }
            
            // Upload new image
            $path = $request->file('image')->store('prescriptions', 'public');
            $prescription->image_path = $path;
        }

        $prescription->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Prescription updated successfully',
            'data' => $prescription
        ]);
    }

    /**
     * Remove the specified prescription from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $prescription = Prescription::find($id);
        
        if (!$prescription) {
            return response()->json([
                'status' => 'error',
                'message' => 'Prescription not found'
            ], 404);
        }

        // Check if user owns this prescription or is admin
        if ($prescription->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this prescription'
            ], 403);
        }

        // Delete prescription image
        if ($prescription->image_path) {
            Storage::disk('public')->delete($prescription->image_path);
        }

        $prescription->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Prescription deleted successfully'
        ]);
    }

    /**
     * Get all prescriptions for the authenticated user or all prescriptions for demo purposes.
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserPrescriptions()
    {
        try {
            // Get all prescriptions from the database
            $rawPrescriptions = Prescription::with('user')
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Format the prescriptions to match what the frontend expects
            $formattedPrescriptions = [];
            
            foreach ($rawPrescriptions as $prescription) {
                // Get the user information if available
                $username = $prescription->user ? $prescription->user->name : 'Unknown User';
                $city = $prescription->user && $prescription->user->city ? $prescription->user->city : 'Unknown';
                $phone = $prescription->user && $prescription->user->phone ? $prescription->user->phone : 'Unknown';
                
                // Handle the image - check if it's a file path or binary data
                $imageData = null;
                if ($prescription->image) {
                    if (is_string($prescription->image) && Storage::disk('public')->exists($prescription->image)) {
                        // It's a file path, convert to base64
                        $imageData = base64_encode(Storage::disk('public')->get($prescription->image));
                    } else {
                        // It's already binary data
                        $imageData = base64_encode($prescription->image);
                    }
                }
                
                // Format the prescription for the frontend
                $formattedPrescriptions[] = [
                    'id_prescription' => $prescription->id,
                    'username_user' => $username,
                    'city_user' => $city,
                    'phone_user' => $phone,
                    'image_prescription' => $imageData,
                    'description_prescription' => $prescription->description
                ];
            }
            
            // If no prescriptions are found, provide sample data for demonstration
            if (count($formattedPrescriptions) === 0) {
                $formattedPrescriptions = [
                    [
                        'id_prescription' => 1,
                        'username_user' => 'John Doe (Sample)',
                        'city_user' => 'New York',
                        'phone_user' => '555-123-4567',
                        'image_prescription' => null,
                        'description_prescription' => 'Sample: Prescription for antibiotics and pain relief medication'
                    ],
                    [
                        'id_prescription' => 2,
                        'username_user' => 'Jane Smith (Sample)',
                        'city_user' => 'Los Angeles',
                        'phone_user' => '555-987-6543',
                        'image_prescription' => null,
                        'description_prescription' => 'Sample: Monthly prescription for blood pressure medication'
                    ]
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedPrescriptions
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching prescriptions: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process prescription and create an order based on it.
     * Admin only endpoint.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function processPrescription(Request $request, $id)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $prescription = Prescription::find($id);
        
        if (!$prescription) {
            return response()->json([
                'status' => 'error',
                'message' => 'Prescription not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
            'products' => 'required_if:status,approved|array',
            'products.*.product_id' => 'required_if:status,approved|exists:products,id',
            'products.*.quantity' => 'required_if:status,approved|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update prescription status
        $prescription->status = $request->status;
        $prescription->admin_notes = $request->admin_notes;
        $prescription->save();

        // If rejected, just return the updated prescription
        if ($request->status === 'rejected') {
            return response()->json([
                'status' => 'success',
                'message' => 'Prescription rejected',
                'data' => $prescription
            ]);
        }

        // If approved, create an order with the prescribed products
        $total = 0;
        $orderDetails = [];

        foreach ($request->products as $item) {
            $product = Product::find($item['product_id']);
            
            if (!$product) {
                continue;
            }
            
            $subtotal = $product->price * $item['quantity'];
            $total += $subtotal;
            
            $orderDetails[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'subtotal' => $subtotal
            ];
        }

        // Create order
        $order = Order::create([
            'user_id' => $prescription->user_id,
            'total_amount' => $total,
            'status' => 'processing',
            'payment_status' => 'pending',
            'shipping_address' => null, // Will need to be updated by user
            'billing_address' => null, // Will need to be updated by user
            'prescription_id' => $prescription->id,
        ]);

        // Create order details
        $order->orderDetails()->createMany($orderDetails);

        return response()->json([
            'status' => 'success',
            'message' => 'Prescription approved and order created',
            'data' => [
                'prescription' => $prescription,
                'order' => $order->load('orderDetails')
            ]
        ]);
    }
}