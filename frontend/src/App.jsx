import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastProvider } from './contexts/ToastContext';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Recommender from './pages/Recommender';
import Prices from './pages/Prices';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Wishlist from './pages/Wishlist';
import Collections from './pages/Collections';
import SizeGuide from './pages/SizeGuide';
import CareInstructions from './pages/CareInstructions';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/recommender" element={<Recommender />} />
                <Route path="/prices" element={<Prices />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/size-guide" element={<SizeGuide />} />
                <Route path="/care-instructions" element={<CareInstructions />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<AboutUs />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
