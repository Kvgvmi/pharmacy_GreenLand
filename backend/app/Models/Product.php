<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Define primary key name to match your database
    protected $primaryKey = 'id';
    
    // Tell Laravel the table name if it's not the plural of the model name
    protected $table = 'products';
    
    // Define fillable fields based on your frontend requirements
    protected $fillable = [
        'name',
        'description',
        'expiry_date',
        'price',
        'stock',
        'image',
        'category_id', // Add this if you have it in your database
       
    ];

    // Define date fields
    protected $dates = [
        'expiry_date',
        'created_at',
        'updated_at',
    ];

    // Add casts for proper data types
    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'category_id' => 'integer',
    ];

    // Relationship with categories
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'product_categories', 
            'product_id', 
            'category_id'
        );
    }
    
    // If you have a direct category relationship via category_id
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id_category');
    }
    
    // Relationship with cart items
   public function carts()
    {
        return $this->belongsToMany(Cart::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    // Accessor for image to handle both file paths and binary data
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        if (is_string($this->image)) {
            // If it's a file path
            if (strpos($this->image, 'http') === 0) {
                return $this->image;
            }
            return asset('storage/' . ltrim($this->image, '/'));
        }

        // If it's binary data
        return 'data:image/jpeg;base64,' . base64_encode($this->image);
    }
}