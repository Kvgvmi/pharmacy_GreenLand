<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Prescription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'image',       // Matches the actual database column
        'description', // Matches the actual database column
        'status',      // This might be missing from the database
        'admin_notes'  // This might be missing from the database
    ];

    /**
     * Get the validation rules that apply to the model.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'image' => 'required',
            'description' => 'nullable|string',
        ];
    }

    /**
     * Get the user that owns the prescription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}