import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../api';
import { useToast } from '../contexts/ToastContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const fetchWishlistProducts = async () => {
    setLoading(true);
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(wishlist);

      if (wishlist.length > 0) {
        // Fetch all products in wishlist
        const productPromises = wishlist.map(id => api.get(`/products/${id}`));
        const responses = await Promise.allSettled(productPromises);
        const fetchedProducts = responses
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value.data);
        setProducts(fetchedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlistItems(updatedWishlist);
    setProducts(products.filter(p => p._id !== productId));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const addToCart = async (productId) => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      await api.post('/cart', { userId: user._id, productId, quantity: 1 });
      await updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const moveToCart = async (productId) => {
    await addToCart(productId);
    removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-600 to-pink-600">
              My Wishlist
            </h1>
          </div>
          <p className="text-gray-600 ml-13">
            {products.length === 0 ? 'Your wishlist is empty' : `${products.length} ${products.length === 1 ? 'item' : 'items'} saved`}
          </p>
        </motion.div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-9xl"
              >
                💝
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-200 rounded-full blur-3xl -z-10"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save your favorite jewelry pieces here!</p>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-2xl transition-all"
              >
                Explore Collection
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {/* Product Image */}
                    <Link to={`/products/${product._id}`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative h-64 bg-gradient-to-br from-amber-50 to-rose-50 overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <img
                          src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Floating heart icon */}
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-4 left-4"
                        >
                          <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </motion.div>
                      </motion.div>
                    </Link>

                    {/* Product Details */}
                    <div className="p-6">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                          {product.category}
                        </span>
                        <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full">
                          {product.material}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        Weight: {product.weight}g
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
                          ₹{product.price?.toLocaleString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => moveToCart(product._id)}
                          className="flex-1 py-3 bg-gradient-to-r from-primary to-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Move to Cart
                        </motion.button>
                        <Link to={`/products/${product._id}`} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
                          >
                            View Details
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* 3D Shadow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ transform: 'translateY(10px)' }} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Actions */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-amber-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Continue Shopping
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (confirm('Are you sure you want to clear your entire wishlist?')) {
                  localStorage.setItem('wishlist', '[]');
                  setWishlistItems([]);
                  setProducts([]);
                  window.dispatchEvent(new Event('wishlist-updated'));
                }
              }}
              className="px-8 py-4 border-2 border-red-500 text-red-500 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all"
            >
              Clear Wishlist
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
