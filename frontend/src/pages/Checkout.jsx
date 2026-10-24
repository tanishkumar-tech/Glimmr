import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, upi

  useEffect(() => {
    if (!user) {
      toastError('Please log in to checkout');
      navigate('/auth');
      return;
    }
    api.get(`/cart/${user._id}`).then(res => setCart(res.data));
  }, [user, navigate]);

  const handleCheckout = async () => {
    if (!user) {
      toastError('Please log in to checkout');
      return;
    }
    
    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      toastError('Please fill all shipping details');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/orders', { 
        userId: user._id,
        shippingAddress,
        paymentMethod
      });
      toastSuccess('Order placed successfully!');
      setCart({ items: [] });
      navigate('/profile?tab=orders');
    } catch (err) {
      console.error('Checkout failed:', err);
      toastError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.03); // 3% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50 py-12 relative overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/20 to-stone-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 35, repeat: Infinity }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-neutral-200/20 to-zinc-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"
          >
            Checkout
          </motion.h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-center"
        >
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Review Order' },
              { num: 2, label: 'Shipping' },
              { num: 3, label: 'Payment' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${
                    step >= s.num
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {step > s.num ? '✓' : s.num}
                  {step === s.num && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-amber-400/30 blur-md"
                    />
                  )}
                </motion.div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`mx-4 h-0.5 w-16 ${step > s.num ? 'bg-amber-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">📦</span>
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {cart.items.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                        <Link to="/products">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg"
                          >
                            Continue Shopping
                          </motion.button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {cart.items.map((item, idx) => (
                          <motion.div
                            key={item._id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 hover:shadow-md transition-shadow"
                          >
                            <img
                              src={item.product?.images?.[0] || ''}
                              alt={item.product?.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-sm"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                              <p className="text-sm text-gray-600">
                                {item.product?.material}
                                {item.product?.material?.toLowerCase() === 'gold' && ` • ${item.product?.karat || 24}K`}
                                {' • '}{item.product?.weight}g
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-800">
                                ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₹{(item.product?.price || 0).toLocaleString('en-IN')} each
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setStep(2)}
                          className="w-full mt-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Continue to Shipping
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">🏠</span>
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={shippingAddress.line1}
                      onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                      className="md:col-span-2 p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={shippingAddress.line2}
                      onChange={(e) => setShippingAddress({...shippingAddress, line2: e.target.value})}
                      className="md:col-span-2 p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/50"
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border-2 border-stone-300 text-gray-700 rounded-xl font-semibold hover:bg-stone-50 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg"
                    >
                      Continue to Payment
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-3xl">💳</span>
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                      { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                      { id: 'upi', label: 'UPI Payment', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' }
                    ].map((pm) => (
                      <motion.div
                        key={pm.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === pm.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{pm.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{pm.label}</p>
                            <p className="text-sm text-gray-600">{pm.desc}</p>
                          </div>
                          {paymentMethod === pm.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm"
                            >
                              ✓
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border-2 border-stone-300 text-gray-700 rounded-xl font-semibold hover:bg-stone-50 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : `Place Order • ₹${calculateTotal().toLocaleString('en-IN')}`}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-stone-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 3%)</span>
                  <span className="font-semibold">₹{calculateTax().toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-stone-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">🔒</span>
                  <span>Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">✓</span>
                  <span>100% Certified Jewelry</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">↩️</span>
                  <span>Easy 30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">📞</span>
                  <span>24/7 Customer support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

