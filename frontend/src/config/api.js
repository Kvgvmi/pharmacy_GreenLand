// API Configuration
const API_BASE_URL = 'http://localhost:8000';

export default {
  baseURL: API_BASE_URL,
  endpoints: {
    // Products
    products: `${API_BASE_URL}/api/products`,
    product: (id) => `${API_BASE_URL}/api/products/${id}`,
    categories: `${API_BASE_URL}/api/categories`,
    addProduct: `${API_BASE_URL}/api/add-product`,
    updateProduct: (id) => `${API_BASE_URL}/api/update-product/${id}`,
    getProduct: (id) => `${API_BASE_URL}/api/product/${id}`,
    addToCart: `${API_BASE_URL}/api/add-to-cart`,
    bio: `${API_BASE_URL}/api/bio`,
    baby: `${API_BASE_URL}/api/baby`,
    medicines: `${API_BASE_URL}/api/medicines`,
    supplements: `${API_BASE_URL}/api/supplements`,
    bestSellers: `${API_BASE_URL}/api/best-sellers`,
    newProducts: `${API_BASE_URL}/api/new-products`,
    productSearch: (term) => `${API_BASE_URL}/api/products-search?search=${term}`,
    
    // Cart
    cart: (userId) => `${API_BASE_URL}/api/cart/${userId}`,
    cartDebug: (userId) => `${API_BASE_URL}/api/cart-debug/${userId}`,
    
    // User
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    orders: (userId) => `${API_BASE_URL}/api/orders/${userId}`,
    orderDetails: (id) => `${API_BASE_URL}/api/order-details/${id}`,
    
    // Admin
    seeOrders: `${API_BASE_URL}/api/see-orders`,
    
    // Feedback
    submitFeedback: `${API_BASE_URL}/api/submit-feedback`,
    feedbacks: `${API_BASE_URL}/api/feedbacks`,
    
    // Prescription
    addPrescription: `${API_BASE_URL}/api/add-prescription`,
    prescriptions: `${API_BASE_URL}/api/prescriptions`,
    userPrescriptions: `${API_BASE_URL}/api/user-prescriptions`
  }
};
