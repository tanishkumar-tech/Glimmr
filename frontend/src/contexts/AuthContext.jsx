import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate persisted token with backend to avoid stale/auto-login issues
    (async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (!token || !storedUser) {
        setLoading(false);
        return;
      }
      try {
        const parsedUser = JSON.parse(storedUser);
        // Hit /auth/me to confirm token validity
        const res = await api.get('/auth/me');
        const freshUser = res.data.user;
        // Prevent implicit admin role from stale data: require role verification via admin-login
        if (parsedUser.role === 'admin' && freshUser.role !== 'admin') {
          // downgrade if mismatch
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          setUser(null);
        } else {
          setUser(freshUser);
          // Ensure userId is in localStorage
          if (freshUser._id) {
            localStorage.setItem('userId', freshUser._id);
            window.dispatchEvent(new Event('auth-change'));
          }
        }
      } catch (err) {
        // Invalid token — clear
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      setUser(userData);

      // Dispatch event to notify cart context
      window.dispatchEvent(new Event('auth-change'));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const signup = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, phone, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData._id);
      setUser(userData);

      // Dispatch event to notify cart context
      window.dispatchEvent(new Event('auth-change'));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  };

  const logout = () => {
    // Call logout endpoint
    const token = localStorage.getItem('token');
    if (token) {
      api.post('/auth/logout').catch(() => {
        // Ignore logout errors
      });
    }

    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);

    // Dispatch event to notify cart context
    window.dispatchEvent(new Event('auth-change'));
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
