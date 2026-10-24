import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    // Fetch featured products with live prices
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=6');
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const data = await res.json();
        
        // Fetch live per-gram rates with fallback
        let perGramGold = 6500; // fallback INR per gram
        let perGramSilver = 75; // fallback INR per gram
        
        try {
          const pricesRes = await axios.get('/api/prices/latest');
          if (pricesRes.data.gold && pricesRes.data.gold.price) {
            perGramGold = pricesRes.data.gold.price;
          }
          if (pricesRes.data.silver && pricesRes.data.silver.price) {
            perGramSilver = pricesRes.data.silver.price;
          }
        } catch (priceErr) {
          console.warn('Failed to fetch live prices, using fallback rates:', priceErr);
        }
        
        // Calculate live prices for each product
        const productsWithLivePrice = (data.products || []).map(product => {
          let livePrice = product.price || 0; // fallback to stored price or 0
          
          if (product.material && product.weight && !isNaN(product.weight)) {
            const material = product.material.toLowerCase();
            const weight = parseFloat(product.weight);
            
            if (material === 'gold' && perGramGold && !isNaN(perGramGold)) {
              const karat = parseFloat(product.karat) || 24;
              const purity = karat / 24;
              livePrice = Math.round(perGramGold * weight * purity);
            } else if (material === 'silver' && perGramSilver && !isNaN(perGramSilver)) {
              livePrice = Math.round(perGramSilver * weight);
            }
          }
          
          // Final safety check
          if (isNaN(livePrice) || livePrice <= 0) {
            livePrice = product.price || 0;
          }
          
          return { ...product, price: livePrice };
        });
        
        setFeaturedProducts(productsWithLivePrice);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const collections = [
    { name: 'Wedding Collection', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', link: '/products?category=wedding' },
    { name: 'Daily Wear', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', link: '/products?category=daily-wear' },
    { name: 'Gold Jewellery', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', link: '/products?material=gold' },
    { name: 'Diamond Specials', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', link: '/products?material=diamond' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-r from-accent to-secondary"
        >
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Elegant jewelry collection"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="relative z-10 text-center text-textPrimary">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 font-heading"
          >
            Celebrate Timeless Elegance
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8"
          >
            Discover exquisite jewelry pieces crafted with passion and precision at Glimmr.
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/auth" className="btn-primary text-2xl px-8 py-4 mr-4">
              Login / Signup
            </Link>
            <Link to="/products" className="btn-secondary text-2xl px-8 py-4">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-secondary" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 font-heading">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer"
              >
                <Link to={collection.link}>
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-secondary text-2xl font-bold font-heading">{collection.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-accent" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 font-heading">Featured Products</h2>
          {loading ? (
            <p className="text-center text-lg">Loading featured products...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="bg-secondary rounded-lg shadow-lg overflow-hidden group cursor-pointer"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/400x300?text=Jewelry'}
                        alt={product.name}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <button className="btn-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 font-heading">{product.name}</h3>
                      
                      {/* Material & Weight Info */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <span className="font-medium capitalize">{product.material || 'Gold'}</span>
                        {product.material?.toLowerCase() === 'gold' && product.karat && (
                          <span>• {product.karat}K</span>
                        )}
                        {product.weight && (
                          <span>• {product.weight}g</span>
                        )}
                      </div>

                      {/* Live Price with Badge */}
                      <div className="flex items-center gap-2">
                        <p className="text-primary text-2xl font-bold">₹{product.price?.toLocaleString('en-IN') || '---'}</p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Market rate updated daily</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Mid-Page Promotions */}
      <section className="py-16 bg-secondary" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="New Arrivals"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-secondary">
                  <h3 className="text-3xl font-bold mb-4 font-heading">New Arrivals</h3>
                  <p className="mb-6">Discover the latest in exquisite jewelry</p>
                  <Link to="/products" className="btn-primary">Shop Now</Link>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Festival Specials"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-secondary">
                  <h3 className="text-3xl font-bold mb-4 font-heading">Festival Specials</h3>
                  <p className="mb-6">Celebrate with our festive collection</p>
                  <Link to="/products?category=wedding" className="btn-primary">Explore</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-accent" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-8 font-heading">Our Story</h2>
            <p className="text-lg max-w-3xl mx-auto mb-8">
              At Glimmr, we believe that every piece of jewelry tells a story. With over decades of craftsmanship
              and a commitment to authenticity, we create timeless pieces that celebrate life's most precious moments.
              From engagement rings to wedding sets, each creation is made with the finest materials and unparalleled attention to detail.
            </p>
            <Link to="/about" className="btn-secondary">
              Learn More About Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-secondary" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 font-heading">Stay in the Loop</h2>
            <p className="mb-8">Subscribe to our newsletter for exclusive offers, new arrivals, and jewelry tips.</p>
            <div className="flex justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none text-textPrimary"
              />
              <button className="bg-hover text-secondary px-6 py-3 rounded-r-lg font-semibold hover:bg-textPrimary transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
