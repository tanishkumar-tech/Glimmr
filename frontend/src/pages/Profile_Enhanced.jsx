import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    loyaltyPoints: 850
  });

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    isDefault: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setBasicInfo({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      });
      setAddresses(res.data.addresses || []);
      
      // Load stats
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setStats(prev => ({
        ...prev,
        wishlistCount: wishlist.length,
        loyaltyPoints: res.data.loyaltyPoints || 850
      }));
    } catch (err) {
      console.error('Failed to load profile:', err);
      showPopup('error', 'Failed to load profile');
    }
  };

  const showPopup = (type, msg) => {
    setPopup({ type, message: msg });
    setTimeout(() => setPopup(null), 3000);
  };

  const updateBasicInfo = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile', basicInfo);
      showPopup('success', '✨ Profile updated successfully!');
      loadProfile();
    } catch (err) {
      showPopup('error', err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showPopup('error', 'New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showPopup('success', '🔒 Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showPopup('error', err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    setLoading(true);
    try {
      if (editingAddress) {
        await api.put(`/user/addresses/${editingAddress._id}`, addressForm);
        showPopup('success', '📍 Address updated successfully!');
      } else {
        await api.post('/user/addresses', addressForm);
        showPopup('success', '📍 Address added successfully!');
      }
      loadProfile();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        isDefault: false
      });
    } catch (err) {
      showPopup('error', err.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/user/addresses/${id}`);
      showPopup('success', '🗑️ Address deleted successfully!');
      loadProfile();
    } catch (err) {
      showPopup('error', err.response?.data?.error || 'Failed to delete address');
    }
  };

  const editAddress = (address) => {
    setAddressForm(address);
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Please log in to view your profile.</p>
          <Link to="/auth" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-rose-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
      </div>
      
      {/* Animated Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border-2 ${
                popup.type === 'success'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-300 text-white'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 border-red-300 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-2xl"
                >
                  {popup.type === 'success' ? '✨' : '⚠️'}
                </motion.span>
                <span className="font-bold text-lg">{popup.message}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Premium Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative mb-8"
        >
          <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border-4 border-white/30 shadow-lg">
                    <span className="text-5xl">💎</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-white/30 blur-xl"
                  />
                </motion.div>
                <div className="text-white">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-2"
                  >
                    Welcome, {user.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/90 text-lg"
                  >
                    Elite Member • {stats.loyaltyPoints} Loyalty Points ✨
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg border border-white/30"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: '🛍️', label: 'Total Orders', value: stats.totalOrders, color: 'from-blue-500 to-cyan-500' },
            { icon: '💰', label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, color: 'from-emerald-500 to-teal-500' },
            { icon: '❤️', label: 'Wishlist', value: stats.wishlistCount, color: 'from-rose-500 to-pink-500' },
            { icon: '⭐', label: 'Loyalty Points', value: stats.loyaltyPoints, color: 'from-amber-500 to-yellow-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl text-white relative overflow-hidden`}
            >
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                className="text-4xl mb-2"
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
        >
          {/* Enhanced Tabs */}
          <div className="border-b border-gray-200/50 bg-white/50">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'basic', label: 'Personal Info', icon: '👤' },
                { id: 'addresses', label: 'Addresses', icon: '📍' },
                { id: 'orders', label: 'Orders', icon: '📦' },
                { id: 'wishlist', label: 'Wishlist', icon: '💝' },
                { id: 'wallet', label: 'Wallet', icon: '💳' },
                { id: 'rewards', label: 'Rewards', icon: '🎁' },
                { id: 'password', label: 'Security', icon: '🔒' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-rose-500 rounded-t-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Account Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>⚡</span> Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Track Orders', icon: '📦', action: () => setActiveTab('orders') },
                        { label: 'View Wishlist', icon: '💝', action: () => setActiveTab('wishlist') },
                        { label: 'Manage Addresses', icon: '📍', action: () => setActiveTab('addresses') },
                        { label: 'Check Rewards', icon: '🎁', action: () => setActiveTab('rewards') }
                      ].map((item, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ x: 5 }}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 bg-white p-3 rounded-xl hover:shadow-md transition-all"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>🕐</span> Recent Activity
                    </h3>
                    <div className="space-y-3 text-gray-600">
                      <p>✅ Profile updated today</p>
                      <p>🎯 {stats.wishlistCount} items in wishlist</p>
                      <p>⭐ Earned {stats.loyaltyPoints} loyalty points</p>
                      <p>🎁 Member since {new Date().getFullYear()}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">My Wishlist</h2>
                  <Link to="/wishlist">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      View All Items
                    </motion.button>
                  </Link>
                </div>
                <div className="text-center py-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    💝
                  </motion.div>
                  <p className="text-gray-600 text-lg">You have {stats.wishlistCount} items in your wishlist</p>
                </div>
              </motion.div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">My Wallet</h2>
                
                <motion.div
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                  className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                  <div className="relative">
                    <p className="text-white/80 mb-2">Available Balance</p>
                    <motion.h3
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-5xl font-bold mb-6"
                    >
                      ₹0.00
                    </motion.h3>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold"
                      >
                        💳 Add Money
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold"
                      >
                        📊 Transactions
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: '💰', label: 'Cashback', value: '₹0' },
                    { icon: '🎟️', label: 'Coupons', value: '0' },
                    { icon: '🎁', label: 'Gift Cards', value: '0' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center"
                    >
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                      <div className="text-gray-600">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Rewards & Loyalty</h2>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-8 border-2 border-amber-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-amber-800 mb-2">Your Loyalty Points</p>
                      <motion.h3
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl font-bold text-amber-600"
                      >
                        {stats.loyaltyPoints} ⭐
                      </motion.h3>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-8xl"
                    >
                      🏆
                    </motion.div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <p className="text-amber-800">Earn 1 point for every ₹100 spent</p>
                    <div className="mt-4 bg-amber-200 h-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                      />
                    </div>
                    <p className="text-sm text-amber-700 mt-2">150 more points to next reward!</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: '🎁', title: 'Birthday Bonus', desc: 'Get 500 bonus points on your birthday', locked: false },
                    { icon: '💎', title: 'VIP Member', desc: 'Unlock exclusive deals & early access', locked: true },
                    { icon: '🚚', title: 'Free Shipping', desc: 'Lifetime free shipping on all orders', locked: true },
                    { icon: '✨', title: 'Special Offers', desc: 'Get personalized offers & discounts', locked: false }
                  ].map((reward, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      className={`rounded-2xl p-6 border-2 ${
                        reward.locked
                          ? 'bg-gray-50 border-gray-300 opacity-60'
                          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{reward.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{reward.title}</h4>
                          <p className="text-gray-600 text-sm">{reward.desc}</p>
                          {reward.locked && (
                            <span className="inline-block mt-2 text-xs bg-gray-200 px-3 py-1 rounded-full">🔒 Locked</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    📦
                  </motion.div>
                  <p className="text-gray-600 text-lg">No orders yet. Start shopping now!</p>
                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 bg-gradient-to-r from-primary to-amber-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      Browse Products
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateBasicInfo}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-amber-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </motion.button>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Change Password</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={changePassword}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-amber-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Addresses Tab - reusing existing logic */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">Saved Addresses</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddressForm(true)}
                    className="bg-gradient-to-r from-primary to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                  >
                    + Add Address
                  </motion.button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white"
                  >
                    <h3 className="text-xl font-semibold mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <label className="flex items-center col-span-2">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="mr-2 w-5 h-5"
                        />
                        Set as default address
                      </label>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveAddress}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary to-amber-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Address'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setAddressForm({
                            name: '',
                            line1: '',
                            line2: '',
                            city: '',
                            state: '',
                            pincode: '',
                            country: '',
                            isDefault: false
                          });
                        }}
                        className="bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{address.name}</h3>
                            {address.isDefault && (
                              <span className="bg-gradient-to-r from-primary to-amber-500 text-white text-xs px-3 py-1 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600">{address.line1}</p>
                          {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => editAddress(address)}
                            className="text-primary hover:text-amber-500 transition-colors px-4 py-2 rounded-lg bg-primary/10"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteAddress(address._id)}
                            className="text-red-600 hover:text-red-800 transition-colors px-4 py-2 rounded-lg bg-red-50"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                      <p className="text-gray-500 text-lg">No addresses saved yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
