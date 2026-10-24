import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const Auth = ({ initialMode = 'login' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [particles, setParticles] = useState([]);
  const [mode, setMode] = useState(initialMode);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const { login, signup, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const particleCount = 80;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.6 + 0.2,
        color: ['#FFD700', '#C0C0C0', '#E6E6FA', '#F0E68C', '#DDA0DD'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
    setParticles(newParticles);

    // Mouse movement effect
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vx: particle.x < 0 || particle.x > window.innerWidth ? -particle.vx : particle.vx,
          vy: particle.y < 0 || particle.y > window.innerHeight ? -particle.vy : particle.vy
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        if (isAdminLogin) {
          // Admin login (requires password + admin key)
          const response = await api.post('/auth/admin-login', {
            email,
            password,
            adminKey
          });
          const { token, user: userData } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(userData); // immediately set context to avoid redirect race
          navigate('/admin');
        } else {
          // Regular login
          const result = await login(email, password);
          if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          } else {
            setError(result.error);
          }
        }
      } else {
        // Signup
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const result = await signup(name, email, phone, password);
        if (result.success) {
          setMessage('Account created successfully! Please login.');
          setMode('login');
          setName('');
          setPhone('');
          setConfirmPassword('');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setMessage('');
    setIsAdminLogin(false);
    setAdminKey('');
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative overflow-hidden" style={{
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
    }}>
      {/* Animated gem particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            backgroundColor: particle.color,
            borderRadius: '50%',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      {/* Floating jewellery-inspired shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Diamond shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 opacity-20 rotate-45 animate-pulse shadow-lg"></div>
        <div className="absolute top-3/4 right-1/4 w-12 h-12 bg-gradient-to-br from-gold-300 to-gold-500 opacity-15 rotate-12 animate-bounce shadow-md"></div>
        <div className="absolute top-1/2 left-3/4 w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-700 opacity-25 rotate-30 animate-ping shadow-lg"></div>

        {/* Circular gem patterns */}
        <div className="absolute top-1/6 right-1/3 w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-yellow-500 opacity-30 animate-pulse shadow-gold-400/50 shadow-lg"></div>
        <div className="absolute bottom-1/4 left-1/6 w-6 h-6 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 opacity-25 animate-bounce shadow-gold-400/40 shadow-md"></div>

        {/* Chain-like patterns */}
        <div className="absolute top-2/3 left-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/6 w-16 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-15 animate-bounce"></div>
      </div>

      <div
        ref={cardRef}
        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 w-full max-w-lg shadow-2xl border border-white/20 transform transition-all duration-500 hover:scale-105"
        style={{
          transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold-400 opacity-60"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold-400 opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold-400 opacity-60"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold-400 opacity-60"></div>

        {/* Golden crown-like decorative elements */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 opacity-40">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-6 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-full"></div>
            <div className="w-2 h-4 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-full"></div>
            <div className="w-3 h-6 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-full"></div>
            <div className="w-2 h-5 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-full"></div>
            <div className="w-2 h-4 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-full"></div>
          </div>
        </div>

        {/* Side golden accents */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-1 h-24 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-30"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 w-1 h-24 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-30"></div>

        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          {mode === 'signup' && (
            <h2 className="text-2xl font-bold text-gray-300 mb-2 drop-shadow-md">
              Glimmr
            </h2>
          )}
          <h1 className="text-4xl font-bold text-gray-300 mb-3 animate-pulse drop-shadow-lg">
            {mode === 'login' ? 'Welcome Back' : 'Join Our World'}
          </h1>
          <p className="text-gray-300 text-lg font-medium drop-shadow-md">
            {mode === 'login' ? 'Continue your luxury journey' : 'Enter the realm of exquisite jewellery'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-6 py-4 rounded-xl mb-6 backdrop-blur-sm animate-bounce">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-100 px-6 py-4 rounded-xl mb-6 backdrop-blur-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your phone number"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </>
          )}

          <div className="group">
            <label className="block text-sm font-semibold text-gold-400 mb-3 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Confirm your password"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  id="adminLogin"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="h-5 w-5 text-gold-400 focus:ring-gold-400 border-white/20 rounded bg-white/5"
                />
                <label htmlFor="adminLogin" className="ml-3 block text-sm font-medium text-gray-300 hover:text-gold-400 transition-colors cursor-pointer">
                  Admin Access
                </label>
              </div>

              {isAdminLogin && (
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
                    Admin Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300 backdrop-blur-sm"
                      placeholder="Enter admin key (GLIMMR-ADMIN-DEFAULT)"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Requires valid password + admin key.</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:via-gold-500 hover:to-gold-600 text-gray-300 font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-2xl hover:shadow-gold-400/25 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  {mode === 'login' ? 'Enter the Realm' : 'Begin Your Journey'}
                </span>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={toggleMode}
            className="text-gray-400 hover:text-gold-400 transition-all duration-300 font-medium relative group"
          >
            <span className="relative z-10">
              {mode === 'login'
                ? "New to our world? Create Account"
                : 'Already a member? Sign In'
              }
            </span>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-400 group-hover:w-full transition-all duration-300"></div>
          </button>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>


    </div>
  );
};

export default Auth;
