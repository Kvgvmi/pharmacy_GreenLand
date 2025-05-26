import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // Import the Home component
import Login from './Login';
import SignUp from './SignUp';
import Account from './Account';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Products from './Products';
import AddProductPage from './AddProductPage';
import Cart from './Cart';
import Medicines from './Medicines';
import Baby from './Baby';
import Supplements from './Supplements';
import Bio from './Bio';
import ContactUs from './Contactus';
import BestSellers from './BestSellers';
import NewProducts from './NewProducts';
import Prescription from './Prescription';
import SearchResults from './SearchResults';
import DisplayProductsPage from './DisplayProductsPage';
import UpdateProductPage from './UpdateProductPage';
import HomeAdmin from './HomeAdmin';
import SeeFeedbacks from './SeeFeedbacks';
import SeePrescriptions from './SeePrescriptions';
import SeeOrders from './SeeOrders';
import OrderDetails from './OrderDetails';
import PrivateAdminRoute from './PrivateAdminRoute';
import ProductPage from './Components/ProductPage/ProductPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes for All Users */}
        <Route path="/" element={<Home />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/products" element={<Products />} />
        <Route path="/bio" element={<Bio />} />
        <Route path="/baby" element={<Baby />} />
        <Route path="/prescriptions" element={<Prescription />} />
        <Route path="/supplements" element={<Supplements />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/new-products" element={<NewProducts />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductPage />} />

        {/* Private Routes for Authenticated Users */}
        <Route path="/personal-info" element={<PrivateRoute element={Account} />} />
        <Route path="/your-orders" element={<PrivateRoute element={Account} />} />
        <Route path="/cart" element={<PrivateRoute element={Cart} />} />
        <Route path="/account" element={<PrivateRoute element={Account} />} />

        {/* Public Routes for Auth Users */}
        <Route path="/signup" element={<PublicRoute element={SignUp} />} />
        <Route path="/login" element={<PublicRoute element={Login} />} />

        {/* Admin Routes */}
        <Route path="/home-admin" element={<PrivateAdminRoute element={HomeAdmin} />} />
        <Route path="/see-feedbacks" element={<PrivateAdminRoute element={SeeFeedbacks} />} />
        <Route path="/see-prescriptions" element={<PrivateAdminRoute element={SeePrescriptions} />} />
        <Route path="/see-orders" element={<PrivateAdminRoute element={SeeOrders} />} />
        <Route path="/order-details/:id" element={<PrivateAdminRoute element={OrderDetails} />} />
        <Route path="/display-products" element={<PrivateAdminRoute element={DisplayProductsPage} />} />
        <Route path="/add-product" element={<PrivateAdminRoute element={AddProductPage} />} />
        <Route path="/update-product/:id" element={<PrivateAdminRoute element={UpdateProductPage} />} />
      </Routes>
    </Router>
  );
}

export default App;
