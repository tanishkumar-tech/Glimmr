import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export { CartContext };

export const useCart = () => useContext(CartContext);

const AUTH_EVENT = 'auth-change';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  // Persistent guestId for anonymous sessions
  const [guestId] = useState(() => {
    let g = localStorage.getItem('guestId');
    if (!g) {
      // Lightweight random guest id
      g = 'guest-' + Math.random().toString(36).slice(2, 11);
      localStorage.setItem('guestId', g);
    }
    return g;
  });
  const { user } = useAuth();

  const syncUserId = useCallback(() => {
    const newUserId = localStorage.getItem('userId');
    console.log('[CartContext] Syncing userId:', newUserId);
    setUserId(newUserId);
  }, []);

  const updateCartCount = useCallback(async () => {
    const currentUserId = user?._id || localStorage.getItem('userId');
    const activeId = currentUserId || guestId; // fall back to guestId
    console.log('[CartContext] updateCartCount called with activeId:', activeId);
    try {
      const res = await api.get(`/cart/${activeId}`);
      console.log('[CartContext] Cart response:', res.data);
      const items = (res.data && res.data.items) ? res.data.items : [];
      setCart(items);
      const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (err) {
      console.error('[CartContext] Error fetching cart:', err);
      setCart([]);
      setCartCount(0);
    }
  }, [user, guestId]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!productId) return;
    const payload = { productId, quantity };
    if (user?._id) payload.userId = user._id; else payload.guestId = guestId;
    try {
      await api.post('/cart', payload);
      await updateCartCount();
    } catch (err) {
      console.error('[CartContext] addToCart error:', err);
    }
  }, [user, guestId, updateCartCount]);

  // Update cart when userId changes
  useEffect(() => {
    // Keep localStorage userId aligned if user logs in/out
    if (user?._id && localStorage.getItem('userId') !== user._id) {
      localStorage.setItem('userId', user._id);
    }
    setUserId(localStorage.getItem('userId'));
    updateCartCount();
  }, [user, updateCartCount]);

  // Listen for auth and storage events
  useEffect(() => {
    window.addEventListener('storage', syncUserId);
    window.addEventListener(AUTH_EVENT, syncUserId);
    return () => {
      window.removeEventListener('storage', syncUserId);
      window.removeEventListener(AUTH_EVENT, syncUserId);
    };
  }, [syncUserId]);

  return (
    <CartContext.Provider value={{ cart, cartCount, updateCartCount, addToCart, guestId }}>
      {children}
    </CartContext.Provider>
  );
};
