<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Define primary key name to match your database
    protected $primaryKey = 'id_category';
    
    // Define fillable fields
    protected $fillable = [
        'name_category',
    ];

    // Relationship with products
    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'product_categories', 
            'category_id', 
            'product_id'
        );
    }
}