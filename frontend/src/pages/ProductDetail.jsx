import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import api from '../api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const { success: toastSuccess, error: toastError } = useToast();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist')) || []);

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      await api.post('/cart', { userId: user._id, productId: id, quantity: 1 });
      updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const toggleWishlist = () => {
    let updatedWishlist;
    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== id);
    } else {
      updatedWishlist = [...wishlist, id];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  if (!product) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={product.images[0]} alt={product.name} className="w-full h-96 object-cover rounded-lg shadow-lg" />
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-primary mb-4">{product.name}</h1>
          <p className="text-lg text-textPrimary mb-4">{product.description}</p>
          <div className="mb-6">
            <p className="text-2xl font-bold text-amber-700">
              Live Price: ₹{(product.price || 0).toLocaleString('en-IN')}
            </p>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
              <span className="text-[10px] text-green-700 font-medium">● LIVE MARKET RATE</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={addToCart} className="bg-primary text-secondary px-6 py-3 rounded-lg hover:bg-accent transition-colors shadow-lg">Add to Cart</button>
            <button onClick={toggleWishlist} className={`px-6 py-3 rounded-lg transition-colors shadow-lg ${wishlist.includes(id) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {wishlist.includes(id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
