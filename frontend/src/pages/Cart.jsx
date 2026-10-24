import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../api';
import { useToast } from '../contexts/ToastContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Global toast replaces per-page popup
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (!user) {
      toastError('Please log in first to view your cart');
      navigate('/auth');
      return;
    }
    fetchCart();
  }, [user, navigate, toastError]);

  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/cart/${user._id}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user || quantity < 1) return;
    
    try {
      const res = await api.put(`/cart/${user._id}`, { productId, quantity });
      setCartItems(res.data.items || []);
      updateCartCount();
      toastSuccess('Quantity updated');
    } catch (err) {
      console.error('Error updating quantity:', err);
      toastError('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    
    try {
      const res = await api.delete(`/cart/${user._id}/${productId}`);
      setCartItems(res.data.items || []);
      updateCartCount();
      toastSuccess('Removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      toastError('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 py-8 px-4">
      {/* Global toast handles feedback */}
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-600 to-rose-600 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length === 0 ? 'Your cart is empty' : `${calculateTotalItems()} items in your cart`}
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🛒
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
              >
                0
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover our amazing jewelry collection!</p>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-amber-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Shopping
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item._id || item.product?._id || item.product || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group relative"
                    style={{
                      transform: 'perspective(1000px)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row p-6 gap-6">
                      {/* Product Image */}
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-rose-100 shadow-inner"
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <img
                          src={item.product?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/products/${item.product._id}`}>
                            <h3 className="text-xl font-bold text-gray-800 hover:text-primary transition-colors mb-2">
                              {item.product?.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.product?.category} • {item.product?.material}
                            {item.product?.material?.toLowerCase() === 'gold' && ` • ${item.product?.karat || 24}K`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Weight: {item.product?.weight}g
                          </p>
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
                            <span className="text-[10px] text-green-700 font-medium">● LIVE PRICE</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              −
                            </motion.button>
                            <span className="w-12 text-center font-semibold text-lg">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              +
                            </motion.button>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
                              ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{(item.product?.price || 0).toLocaleString('en-IN')} each
                            </p>
                            <p className="text-[10px] text-green-600 mt-0.5">Live market rate</p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeItem(item.product._id)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({calculateTotalItems()} items)</span>
                    <span className="font-semibold">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary via-amber-600 to-rose-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all mb-4"
                  >
                    Proceed to Checkout
                  </motion.button>
                </Link>

                <Link to="/products">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                  >
                    Continue Shopping
                  </motion.button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-2xl">🔒</span>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-2xl">🚚</span>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-2xl">↩️</span>
                    <span>Easy 30-day returns</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
