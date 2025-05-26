<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Display a listing of all feedback.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            // Use a query that safely handles the possibility of null product_id
            $feedbacks = Feedback::with(['user'])->get();
            
            // Format the feedbacks for the frontend to match expected field names
            $formattedFeedbacks = [];
            
            foreach ($feedbacks as $feedback) {
                // Format each feedback with the fields expected by the frontend
                $formattedFeedbacks[] = [
                    'id' => $feedback->id,
                    'username_user' => $feedback->user ? $feedback->user->username : 'Unknown User',
                    'city_user' => $feedback->user && $feedback->user->city ? $feedback->user->city : 'Unknown',
                    'phone_user' => $feedback->user && $feedback->user->phone ? $feedback->user->phone : 'Unknown',
                    'text_feedback' => $feedback->comment, // Map comment to text_feedback for frontend
                    'product_name' => $feedback->product ? $feedback->product->name : null,
                    'rating' => $feedback->rating,
                    'created_at' => $feedback->created_at->format('Y-m-d H:i:s')
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $formattedFeedbacks
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching feedbacks: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve feedbacks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created feedback in database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if product exists
        $product = Product::find($request->product_id);
        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found'
            ], 404);
        }

        // Check if user has already reviewed this product
        $existingFeedback = Feedback::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();
            
        if ($existingFeedback) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already reviewed this product'
            ], 400);
        }

        $feedback = Feedback::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment ?? null,
        ]);

        // Update product average rating
        $this->updateProductRating($request->product_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }

    /**
     * Display the specified feedback.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $feedback = Feedback::with(['user:id,name', 'product:id,name'])->find($id);
        
        if (!$feedback) {
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $feedback
        ]);
    }

    /**
     * Update the specified feedback in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $feedback = Feedback::find($id);
        
        if (!$feedback) {
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback not found'
            ], 404);
        }

        // Check if user owns this feedback
        if ($feedback->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this feedback'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $feedback->update([
            'rating' => $request->rating,
            'comment' => $request->comment ?? $feedback->comment,
        ]);

        // Update product average rating
        $this->updateProductRating($feedback->product_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Feedback updated successfully',
            'data' => $feedback
        ]);
    }

    /**
     * Remove the specified feedback from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $feedback = Feedback::find($id);
        
        if (!$feedback) {
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback not found'
            ], 404);
        }

        // Check if user owns this feedback or is admin
        if ($feedback->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this feedback'
            ], 403);
        }

        $productId = $feedback->product_id;
        $feedback->delete();
        
        // Update product average rating
        $this->updateProductRating($productId);

        return response()->json([
            'status' => 'success',
            'message' => 'Feedback deleted successfully'
        ]);
    }

    /**
     * Get all feedback for a specific product.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\Response
     */
    public function getProductFeedback($productId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found'
            ], 404);
        }

        $feedback = Feedback::with('user:id,name')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'average_rating' => $product->average_rating
                ],
                'feedback' => $feedback
            ]
        ]);
    }

    /**
     * Get all feedback by the authenticated user.
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserFeedback()
    {
        $feedback = Feedback::with('product:id,name')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $feedback
        ]);
    }

    /**
     * Update the average rating of a product.
     *
     * @param  int  $productId
     * @return void
     */
    private function updateProductRating($productId)
    {
        $product = Product::find($productId);
        
        if ($product) {
            $avgRating = Feedback::where('product_id', $productId)->avg('rating') ?? 0;
            $product->average_rating = round($avgRating, 1);
            $product->save();
        }
    }
    
    /**
     * Store a simple user feedback (without product rating).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function storeSimpleFeedback(Request $request)
    {
        // Log the incoming request data for debugging
        \Illuminate\Support\Facades\Log::info('Simple feedback submission request:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'id_user' => 'required|exists:users,id',
            'text_feedback' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $feedback = new Feedback();
            $feedback->user_id = $request->id_user;
            $feedback->product_id = null; // No product associated
            $feedback->rating = null; // No rating
            $feedback->comment = $request->text_feedback;
            $feedback->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Feedback submitted successfully',
                'data' => $feedback
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error saving feedback: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}