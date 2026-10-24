import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };
    
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    window.addEventListener('wishlist-updated', updateWishlistCount);
    
    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`bg-secondary text-textPrimary transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''} sticky top-0 z-50`}>
      {/* Main Navbar */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-primary font-heading">
            Glimmr
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/products" className="hover:text-primary transition-colors">All Jewellery</Link>
            {/* Collections dropdown removed as requested */}
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Gold</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?material=gold" className="block px-4 py-2 hover:bg-accent">Gold Jewellery</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Silver</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?material=silver" className="block px-4 py-2 hover:bg-accent">Silver Jewellery</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Diamond</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?material=diamond" className="block px-4 py-2 hover:bg-accent">Diamond Jewellery</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Earrings</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?category=earrings" className="block px-4 py-2 hover:bg-accent">Studs</Link>
                <Link to="/products?category=earrings" className="block px-4 py-2 hover:bg-accent">Jhumkas</Link>
                <Link to="/products?category=earrings" className="block px-4 py-2 hover:bg-accent">Drops</Link>
                <Link to="/products?category=earrings" className="block px-4 py-2 hover:bg-accent">Hoops</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Necklaces</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?category=necklaces" className="block px-4 py-2 hover:bg-accent">Chains</Link>
                <Link to="/products?category=necklaces" className="block px-4 py-2 hover:bg-accent">Pendants</Link>
                <Link to="/products?category=necklaces" className="block px-4 py-2 hover:bg-accent">Chokers</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Rings</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?category=rings" className="block px-4 py-2 hover:bg-accent">Engagement</Link>
                <Link to="/products?category=rings" className="block px-4 py-2 hover:bg-accent">Daily Wear</Link>
                <Link to="/products?category=rings" className="block px-4 py-2 hover:bg-accent">Couple Rings</Link>
              </div>
            </div>
            <div className="relative group">
              <span className="cursor-pointer hover:text-primary transition-colors">Wedding</span>
              <div className="absolute left-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link to="/products?category=wedding" className="block px-4 py-2 hover:bg-accent">Bridal Sets</Link>
                <Link to="/products?category=wedding" className="block px-4 py-2 hover:bg-accent">Gift Sets</Link>
              </div>
            </div>
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleSearch} className="hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {user ? (
              <div className="relative group">
                <button className="hover:text-primary transition-colors flex items-center gap-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-secondary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-accent">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-accent">Admin Panel</Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-accent"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            <Link to="/wishlist" className="hover:text-primary transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="hover:text-primary transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13l1.1-5m8.9 5L17 8m0 0l1.1 5M9 21a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-primary text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            </Link>
            <button onClick={toggleMobileMenu} className="md:hidden hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-accent">
            <div className="flex flex-col space-y-2">
              <Link to="/products?category=all" className="py-2 hover:text-primary transition-colors">All Jewellery</Link>
              <Link to="/products?material=gold" className="py-2 hover:text-primary transition-colors">Gold</Link>
                <Link to="/products?material=silver" className="py-2 hover:text-primary transition-colors">Silver</Link>
              <Link to="/products?material=diamond" className="py-2 hover:text-primary transition-colors">Diamond</Link>
              <Link to="/products?category=earrings" className="py-2 hover:text-primary transition-colors">Earrings</Link>
              <Link to="/products?category=necklaces" className="py-2 hover:text-primary transition-colors">Necklaces</Link>
              <Link to="/products?category=rings" className="py-2 hover:text-primary transition-colors">Rings</Link>
              <Link to="/products?category=wedding" className="py-2 hover:text-primary transition-colors">Wedding</Link>
              <Link to="/collections" className="py-2 hover:text-primary transition-colors">Collections</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Search Bar Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-secondary shadow-lg border-t border-accent z-40 animate-slideDown">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jewelry, diamonds, gold..."
                  className="w-full px-4 py-3 pr-12 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={toggleSearch}
                className="px-4 py-3 text-gray-600 hover:text-primary transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
