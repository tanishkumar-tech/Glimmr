import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const footerLinks = {
    shop: [
      { name: 'All Jewelry', path: '/products' },
      { name: 'Gold Collection', path: '/products?material=gold' },
      { name: 'Diamond Collection', path: '/products?material=diamond' },
      { name: 'Wedding Collection', path: '/products?category=wedding' },
      { name: 'New Arrivals', path: '/products?sort=newest' },
    ],
    categories: [
      { name: 'Rings', path: '/products?category=rings' },
      { name: 'Necklaces', path: '/products?category=necklaces' },
      { name: 'Earrings', path: '/products?category=earrings' },
      { name: 'Bracelets', path: '/products?category=bracelets' },
      { name: 'Pendants', path: '/products?category=pendants' },
    ],
    account: [
      { name: 'My Profile', path: '/profile' },
      { name: 'My Orders', path: '/profile' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Cart', path: '/cart' },
      { name: 'Sign In', path: '/auth' },
    ],
    help: [
      { name: 'Price Calculator', path: '/prices' },
      { name: 'Recommendations', path: '/recommender' },
      { name: 'Size Guide', path: '/size-guide' },
      { name: 'Care Instructions', path: '/care-instructions' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact Us', path: '/contact' },
    ],
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: 'https://instagram.com',
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://facebook.com',
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.747-1.378l-.744 2.84c-.269 1.045-1.064 2.352-1.549 3.235 1.167.36 2.407.557 3.693.557 6.627 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
        </svg>
      ),
      url: 'https://pinterest.com',
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: 'https://twitter.com',
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Top Section - Logo and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Link to="/">
            <motion.h2
              whileHover={{ scale: 1.05 }}
              className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-rose-500"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Glimmr
            </motion.h2>
          </Link>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover timeless elegance with our exquisite collection of handcrafted jewelry. 
            Where luxury meets artistry.
          </p>
        </motion.div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary font-heading flex items-center gap-2">
              <span className="text-2xl">💎</span>
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary font-heading flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Categories
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary font-heading flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Account
            </h3>
            <ul className="space-y-3">
              {footerLinks.account.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Help & Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary font-heading flex items-center gap-2">
              <span className="text-2xl">🛟</span>
              Help & Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-amber-500/10 backdrop-blur-sm border border-primary/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              ✉️ Stay Connected
            </h3>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for exclusive offers, new arrivals, and jewelry care tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400 flex-1 max-w-md"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-primary to-amber-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-6 mb-12"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary hover:text-white hover:bg-gradient-to-br hover:from-primary hover:to-amber-600 transition-all shadow-lg hover:shadow-primary/50"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {social.icon}
            </motion.a>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
        >
          {[
            { icon: '🔒', text: 'Secure Payment' },
            { icon: '🚚', text: 'Free Shipping' },
            { icon: '↩️', text: 'Easy Returns' },
            { icon: '💎', text: 'Certified Quality' },
          ].map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-sm text-gray-400">{badge.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              &copy; 2025 Glimmr. All rights reserved. Made with ❤️ for jewelry lovers.
            </motion.p>
            <div className="flex gap-6 text-sm">
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating sparkles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: 0,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
