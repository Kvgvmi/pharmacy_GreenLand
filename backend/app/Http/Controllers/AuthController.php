<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'city' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = User::create([
            'username' => $request->username,
            'phone' => $request->phone,
            'city' => $request->city,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash the password
            'is_admin' => false,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Login user and create token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email or password are incorrect'
            ], 401);
        }

        // Format admin status as string to match original behavior
        $adminStatus = $user->is_admin ? 'True' : 'False';

        return response()->json([
            'message' => 'User login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'phone' => $user->phone,
                'city' => $user->city,
                'email' => $user->email,
                'isAdmin' => $adminStatus,
            ],
        ], 200);
    }
}