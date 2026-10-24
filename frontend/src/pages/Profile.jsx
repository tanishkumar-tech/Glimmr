import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import api from '../api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    loyaltyPoints: 0
  });
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, history: [] });
  const [reviews, setReviews] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: ''
  });
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
    isDefault: false,
    isDefaultShipping: false,
    isDefaultBilling: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check URL for tab parameter
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
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
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: wishlist.length,
        loyaltyPoints: res.data.loyaltyPoints || 0
      });
      // Load orders
      const ordersRes = await api.get('/user/orders');
      setOrders(ordersRes.data.orders || []);
      setStats(prev => ({ ...prev, totalOrders: ordersRes.data.orders?.length || 0 }));

      // Load coupons & rewards
      const [couponsRes, rewardsRes] = await Promise.all([
        api.get('/user/coupons'),
        api.get('/user/rewards')
      ]);
      setCoupons(couponsRes.data.coupons || []);
      setRewards(rewardsRes.data || { points: 0, history: [] });
      setStats(prev => ({ ...prev, loyaltyPoints: rewardsRes.data?.points ?? prev.loyaltyPoints }));
    } catch (err) {
      console.error('Failed to load profile:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate('/auth');
        return;
      }
      toastError('Failed to load profile');
    }
  };

  const updateBasicInfo = async () => {
    // Basic validation
    if (!basicInfo.name || !basicInfo.email || !basicInfo.phone) {
      toastError('Name, email, and phone are required');
      return;
    }
    const emailOk = /.+@.+\..+/.test(basicInfo.email);
    const phoneOk = /^\+?\d{7,15}$/.test(basicInfo.phone);
    if (!emailOk) {
      toastError('Please enter a valid email');
      return;
    }
    if (!phoneOk) {
      toastError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/user/profile', basicInfo);
      toastSuccess('Profile updated successfully');
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toastSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    // Address validation
    if (!addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.country) {
      toastError('Please fill all required address fields');
      return;
    }
    if (!/^\d{4,10}$/.test(addressForm.pincode)) {
      toastError('Please enter a valid pincode');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingAddress) {
        await api.put(`/user/addresses/${editingAddress._id}`, addressForm);
        toastSuccess('Address updated successfully');
      } else {
        await api.post('/user/addresses', addressForm);
        toastSuccess('Address added successfully');
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
      toastError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const [confirmState, setConfirmState] = useState({ open: false, id: null });

  const deleteAddress = async (id) => {
    setConfirmState({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmState.id;
    setConfirmState({ open: false, id: null });
    try {
      await api.delete(`/user/addresses/${id}`);
      toastSuccess('Address deleted successfully');
      loadProfile();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleCancelDelete = () => setConfirmState({ open: false, id: null });

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
      
      {/* Confirm Delete Address Modal */}
      <ConfirmDialog
        open={confirmState.open}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Global toast used for feedback */}
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Premium Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative mb-8"
        >
          <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
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
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'basic', icon: '👤', label: 'Profile' },
                { id: 'orders', icon: '📦', label: 'Orders' },
                { id: 'addresses', icon: '📍', label: 'Addresses' },
                { id: 'wishlist', icon: '❤️', label: 'Wishlist' },
                { id: 'savedForLater', icon: '🔖', label: 'Saved' },
                { id: 'reviews', icon: '⭐', label: 'Reviews' },
                { id: 'payments', icon: '💳', label: 'Payments' },
                { id: 'rewards', icon: '🎁', label: 'Rewards' },
                { id: 'referral', icon: '👥', label: 'Refer & Earn' },
                { id: 'notifications', icon: '🔔', label: 'Notifications' },
                { id: 'password', icon: '🔒', label: 'Security' },
                { id: 'settings', icon: '⚙️', label: 'Settings' },
                { id: 'support', icon: '💬', label: 'Support' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-amber-800 border-b-4 border-amber-600 bg-gradient-to-b from-amber-50/50 to-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
              >
                {error}
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
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender (optional)</label>
                    <select
                      value={basicInfo.gender || ''}
                      onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth (optional)</label>
                    <input
                      type="date"
                      value={basicInfo.dob || ''}
                      onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={() => {}}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={updateBasicInfo}
                  disabled={loading}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-hover transition-colors"
                  >
                    Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="mr-2"
                          />
                          Default (general)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultShipping}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultShipping: e.target.checked })}
                            className="mr-2"
                          />
                          Default Shipping
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefaultBilling}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefaultBilling: e.target.checked })}
                            className="mr-2"
                          />
                          Default Billing
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={saveAddress}
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
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
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{address.name}</h3>
                            {address.isDefault && (
                              <span className="bg-primary text-white text-xs px-2 py-1 rounded">Default</span>
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
                          <button
                            onClick={() => editAddress(address)}
                            className="text-primary hover:text-hover transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAddress(address._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Login & Security */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h3 className="font-semibold mb-2">Two-factor authentication</h3>
                    <p className="text-gray-600 mb-2">Add an extra layer of security to your account.</p>
                    <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Enable 2FA</button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Login activity</h3>
                    <p className="text-gray-600">Last login: just now • Device: Chrome on Windows</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Connected accounts</h3>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Connect Google</button>
                      <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Connect Apple</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">📦</span>
                  Order History
                </h2>
                
                {/* Order Filter */}
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-amber-50 hover:border-amber-600 transition-all text-sm font-medium"
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🛍️</span>
                      <p className="text-gray-500 mb-4">No orders yet</p>
                      <Link to="/products">
                        <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                          Start Shopping
                        </button>
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">Order #{order._id.slice(-8).toUpperCase()}</span>
                              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                            <div className="text-2xl font-bold text-amber-800">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {order.items.slice(0, 4).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.product?.images?.[0]}
                                alt=""
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600">
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm">
                            View Details
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm"
                            onClick={async () => {
                              try {
                                const inv = await api.get(`/user/orders/${order._id}/invoice`);
                                toastSuccess('📄 Invoice downloaded');
                                console.log('Invoice', inv.data.invoice);
                              } catch (e) {
                                toastError('Failed to download invoice');
                              }
                            }}
                          >
                            📥 Download Invoice
                          </button>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-medium text-sm">
                              📍 Track Order
                            </button>
                          )}
                          {order.status === 'delivered' && (
                            <button className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all font-medium text-sm">
                              ⭐ Write Review
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all font-medium text-sm">
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">❤️</span>
                  My Wishlist
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(JSON.parse(localStorage.getItem('wishlist') || '[]')).length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                      <span className="text-6xl mb-4 block">💝</span>
                      <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                      <Link to="/products">
                        <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                          Discover Products
                        </button>
                      </Link>
                    </div>
                  ) : (
                    (JSON.parse(localStorage.getItem('wishlist') || '[]')).map((pid, idx) => (
                      <motion.div
                        key={pid}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all group"
                      >
                        <div className="relative">
                          <div className="w-full h-48 bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center">
                            <span className="text-6xl">💍</span>
                          </div>
                          <button
                            onClick={() => {
                              const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
                              localStorage.setItem('wishlist', JSON.stringify(wl.filter(id => id !== pid)));
                              toastSuccess('Removed from wishlist');
                              loadProfile();
                            }}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-all shadow-lg"
                          >
                            <span className="text-red-500">❌</span>
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 text-gray-800">Product {pid.slice(0, 8)}</h3>
                          <p className="text-amber-800 font-bold text-lg mb-3">₹--,---</p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                              Add to Cart
                            </button>
                            <Link to={`/products/${pid}`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                              <span>👁️</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Payment Methods */}
            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Saved Cards</h3>
                    <p className="text-gray-600 mb-3">No saved cards.</p>
                    <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Add card</button>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">UPI IDs</h3>
                    <p className="text-gray-600 mb-3">No UPI IDs added.</p>
                    <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Add UPI</button>
                  </div>
                  <div className="border rounded-lg p-4 bg-white md:col-span-2">
                    <h3 className="font-semibold mb-2">Wallet</h3>
                    <p className="text-gray-600 mb-3">Balance: ₹0</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Add payment method</button>
                      <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Remove method</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Coupons & Rewards */}
            {activeTab === 'rewards' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Coupons & Rewards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Available Coupons</h3>
                    {coupons.length === 0 ? (
                      <p className="text-gray-600">No coupons available.</p>
                    ) : (
                      <ul className="space-y-2">
                        {coupons.map(c => (
                          <li key={c.code} className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{c.code}</div>
                              <div className="text-sm text-gray-600">{c.description}</div>
                            </div>
                            <button className="px-3 py-1 rounded-lg border hover:bg-gray-50" onClick={() => showPopup('success', `Applied ${c.code}`)}>Apply</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Reward Points</h3>
                    <p className="text-gray-600">You have {rewards.points} points.</p>
                    <div className="mt-3">
                      <h4 className="font-semibold mb-1">History</h4>
                      {rewards.history.length === 0 ? (
                        <p className="text-gray-600">No history yet.</p>
                      ) : (
                        <ul className="space-y-1 text-sm text-gray-700">
                          {rewards.history.map((h, idx) => (
                            <li key={idx}>{new Date(h.date).toLocaleDateString()} • {h.type} • +{h.points} points</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-white md:col-span-2">
                    <h3 className="font-semibold mb-2">Cashback History</h3>
                    <p className="text-gray-600">No cashback records.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Email/SMS Preferences</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked /> Email updates
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked /> SMS updates
                    </label>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Marketing/Promotional Opt-in</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" /> Receive promotions
                    </label>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Stock Alerts</h3>
                    <p className="text-gray-600">Get notified when items are back in stock.</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Order Updates</h3>
                    <p className="text-gray-600">Receive updates on your orders.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Support & Help */}
            {activeTab === 'support' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Raise a Ticket</h3>
                    <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Create ticket</button>
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    <h3 className="font-semibold mb-2">Chat Support</h3>
                    <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Start chat</button>
                  </div>
                  <div className="border rounded-lg p-4 bg-white md:col-span-2">
                    <h3 className="font-semibold mb-2">FAQ</h3>
                    <p className="text-gray-600">Find answers to common questions.</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-white md:col-span-2">
                    <h3 className="font-semibold mb-2">Return/Refund Requests</h3>
                    <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">Request return/refund</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews & Ratings */}
            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">⭐</span>
                  My Reviews & Ratings
                </h2>
                <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">Your Average Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-amber-600">4.5</span>
                        <span className="text-amber-500">★★★★☆</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 mb-1">Total Reviews</p>
                      <span className="text-3xl font-bold text-gray-800">{reviews.length}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">📝</span>
                      <p className="text-gray-500 mb-4">You haven't reviewed any products yet</p>
                      <Link to="/products">
                        <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                          Shop Now
                        </button>
                      </Link>
                    </div>
                  ) : (
                    reviews.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <img src={review.productImage} alt="" className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{review.productName}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                              <span className="text-gray-500 text-sm">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex gap-2">
                              <button className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50">Edit</button>
                              <button className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50 text-red-600">Delete</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Saved For Later */}
            {activeTab === 'savedForLater' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">🔖</span>
                  Saved For Later
                </h2>
                <p className="text-gray-600">Items you've saved to purchase later</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedForLater.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                      <span className="text-6xl mb-4 block">📋</span>
                      <p className="text-gray-500 mb-4">No items saved for later</p>
                      <Link to="/products">
                        <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                          Browse Products
                        </button>
                      </Link>
                    </div>
                  ) : (
                    savedForLater.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all"
                      >
                        <img src={item.image} alt="" className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{item.name}</h3>
                          <p className="text-amber-800 font-bold text-lg mb-3">₹{item.price.toLocaleString('en-IN')}</p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all">
                              Move to Cart
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Refer & Earn */}
            {activeTab === 'referral' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">👥</span>
                  Refer & Earn
                </h2>
                <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                  />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-3">Invite Friends & Earn Rewards! 🎁</h3>
                    <p className="text-white/90 mb-6 text-lg">
                      Share your unique referral code and get ₹500 when your friend makes their first purchase. They get ₹500 too!
                    </p>
                    <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
                      <p className="text-white/80 mb-2 text-sm">Your Referral Code</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-mono font-bold">{user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase()}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user?.referralCode || 'GLIM' + user?._id?.slice(-6).toUpperCase());
                            toastSuccess('Referral code copied!');
                          }}
                          className="px-4 py-2 bg-white text-amber-700 rounded-lg font-semibold hover:bg-white/90 transition-all"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="text-4xl mb-3">📤</div>
                    <h4 className="font-bold text-2xl text-amber-600 mb-2">0</h4>
                    <p className="text-gray-600">Invites Sent</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h4 className="font-bold text-2xl text-green-600 mb-2">0</h4>
                    <p className="text-gray-600">Successful Referrals</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <h4 className="font-bold text-2xl text-purple-600 mb-2">₹0</h4>
                    <p className="text-gray-600">Total Earned</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-lg mb-3 text-blue-900">How It Works</h4>
                  <ol className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Share your unique referral code with friends & family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>They sign up and make their first purchase using your code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>You both receive ₹500 in your wallet instantly!</span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">⚙️</span>
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-xl p-6 bg-white">
                    <h3 className="font-semibold text-lg mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Show my profile to other users</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Allow personalized recommendations</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Share purchase history for better deals</span>
                        <input type="checkbox" className="w-5 h-5" />
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6 bg-white">
                    <h3 className="font-semibold text-lg mb-4">Language & Currency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                          <option>English</option>
                          <option>हिंदी (Hindi)</option>
                          <option>తెలుగు (Telugu)</option>
                          <option>தமிழ் (Tamil)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6 bg-white">
                    <h3 className="font-semibold text-lg mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                        <span>Download my data</span>
                        <span>📥</span>
                      </button>
                      <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between">
                        <span>Clear browsing history</span>
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <h3 className="font-semibold text-lg mb-2 text-red-900">Danger Zone</h3>
                    <p className="text-red-700 mb-4 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                          toastError('Account deletion is not yet implemented');
                        }
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
                    >
                      Delete Account
                    </button>
                  </div>
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
