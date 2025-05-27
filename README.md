# Pharmacy GreenLand E-Commerce

A full-stack e-commerce application for a pharmacy, built with Laravel (backend) and React (frontend).

## Features

- Product browsing by categories (Medicines, Supplements, Bio, Baby products)
- User authentication and registration
- Shopping cart functionality
- Order management system
- Prescription upload system
- Admin dashboard for product and order management


### Frontend
- React.js
- Axios for API requests
- SweetAlert2 for notifications
- CSS for styling

### Backend
- Laravel PHP framework
- MySQL database
- RESTful API architecture

## Project Structure

The project is organized into two main directories:

- `/backend` - Laravel API backend
- `/frontend` - React frontend application

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   composer install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```

4. Generate application key:
   ```
   php artisan key:generate
   ```

5. Run migrations and seed database:
   ```
   php artisan migrate --seed
   ```

6. Start the Laravel server:
   ```
   php artisan serve
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## API Endpoints

- Products: `/api/products`
- Categories: `/api/categories`
- Cart: `/api/cart/{userId}`
- Orders: `/api/orders`
- User Authentication: `/api/login`, `/api/register`

## Contributors

- [Kvgvmi](https://github.com/Kvgvmi) - Developer

