import { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist')) || []);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart();
  const [perGramGold, setPerGramGold] = useState(null);
  const [perGramSilver, setPerGramSilver] = useState(null);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {};
    params.forEach((value, key) => {
      initialFilters[key] = value;
    });
    setFilters(initialFilters);
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        // Convert numeric filter values if present
        const params = { ...filters };
        if (params.minPrice) params.minPrice = Number(params.minPrice);
        if (params.maxPrice) params.maxPrice = Number(params.maxPrice);

        const res = await api.get('/products', { params });
        if (!cancelled) {
          setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (!cancelled) {
          setError('Failed to load products. Please try again later.');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [filters]);

  // Fetch latest per-gram for dynamic pricing (gold and silver)
  useEffect(() => {
    let cancel = false;
    async function fetchLatest() {
      try {
        const res = await axios.get('/api/prices/latest?currency=inr');
        if (!cancel) {
          setPerGramGold(res.data?.gold?.price || null);
          setPerGramSilver(res.data?.silver?.price || null);
        }
      } catch (e) {
        try {
          const res2 = await axios.get('/api/prices?currency=inr');
          if (!cancel) {
            setPerGramGold(res2.data?.gold?.price || null);
            setPerGramSilver(res2.data?.silver?.price || null);
          }
        } catch {}
      }
    }
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => { cancel = true; clearInterval(interval); };
  }, []);

  const handleFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const addToCart = async (productId) => {
    if (!user) {
      toastError('Please log in first to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      console.log('[Products] Adding to cart, userId:', user._id, 'productId:', productId);
      await api.post('/cart', { userId: user._id, productId, quantity: 1 });
      console.log('[Products] Product added, calling updateCartCount');
      await updateCartCount();
      toastSuccess('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastError('Failed to add product to cart');
    }
  };

  const toggleWishlist = (productId) => {
    let updatedWishlist;
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
    } else {
      updatedWishlist = [...wishlist, productId];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-primary">Products</h1>
      
      {/* Search Results Indicator */}
      {filters.search && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-blue-800">
              Showing results for: <strong>"{filters.search}"</strong>
            </span>
          </div>
          <button 
            onClick={() => handleFilter('search', '')} 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap mb-4 gap-4">
        <div className="flex space-x-2">
          <button onClick={() => handleFilter('category', '')} className={`px-4 py-2 rounded ${!filters.category ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>All Categories</button>
          <button onClick={() => handleFilter('category', 'earrings')} className={`px-4 py-2 rounded ${filters.category === 'earrings' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Earrings</button>
          <button onClick={() => handleFilter('category', 'necklaces')} className={`px-4 py-2 rounded ${filters.category === 'necklaces' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Necklaces</button>
          <button onClick={() => handleFilter('category', 'rings')} className={`px-4 py-2 rounded ${filters.category === 'rings' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Rings</button>
          <button onClick={() => handleFilter('category', 'wedding')} className={`px-4 py-2 rounded ${filters.category === 'wedding' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Wedding</button>
        </div>
        <select onChange={(e) => handleFilter('material', e.target.value)} className="p-2 border border-accent rounded">
          <option value="">All Materials</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="diamond">Diamond</option>
          <option value="platinum">Platinum</option>
          <option value="rose gold">Rose Gold</option>
          <option value="white gold">White Gold</option>
        </select>
        <input type="number" placeholder="Min Price (₹)" onChange={(e) => handleFilter('minPrice', e.target.value)} className="p-2 border border-accent rounded" />
        <input type="number" placeholder="Max Price (₹)" onChange={(e) => handleFilter('maxPrice', e.target.value)} className="p-2 border border-accent rounded" />
        <select onChange={(e) => handleFilter('sort', e.target.value)} className="p-2 border border-accent rounded">
          <option value="">Sort By</option>
          <option value="price">Price</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      {loading ? (
        <p className="text-center text-lg">Loading products...</p>
      ) : !products || products.length === 0 ? (
        <p className="text-center text-lg">No products found for the selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="border border-accent p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-secondary">
              <img src={product.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
              <h2 className="text-xl font-bold text-textPrimary mb-1">{product.name}</h2>
              <p className="text-xl font-bold text-amber-700 mb-2">
                {(() => {
                  const isGold = (product.material || '').toLowerCase() === 'gold';
                  const isSilver = (product.material || '').toLowerCase() === 'silver';
                  const perGram = isSilver ? perGramSilver : perGramGold;
                  if (!perGram || !product.weight) return 'Live Price: —';
                  const karat = Number(product.karat || 24);
                  const purity = isGold ? (karat / 24) : 1.0;
                  const live = Math.round(perGram * product.weight * purity);
                  return `Live Price: ₹${live.toLocaleString('en-IN')}`;
                })()}
              </p>
              <p className="text-sm text-gray-600 mb-2">Weight: {product.weight}g</p>
              <div className="flex justify-between items-center">
                <button onClick={() => addToCart(product._id)} className="bg-primary text-secondary px-3 py-1 rounded hover:bg-accent transition-colors">Add to Cart</button>
                <button onClick={() => toggleWishlist(product._id)} className={`px-3 py-1 rounded transition-colors ${wishlist.includes(product._id) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {wishlist.includes(product._id) ? '❤️' : '🤍'}
                </button>
              </div>
              <Link to={`/products/${product._id}`} className="text-primary hover:text-accent transition-colors mt-2 inline-block">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
