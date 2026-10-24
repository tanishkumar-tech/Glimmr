import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '../api';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const Admin = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: '', material: '', karat: 24, weight: '', image: null });
  // Keep in sync with backend ALLOWED_CATEGORIES
  const allowedCategories = ['rings', 'necklaces', 'bracelets', 'earrings', 'pendants', 'sets', 'wedding'];
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [showAdminKeyModal, setShowAdminKeyModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminKeyError, setAdminKeyError] = useState('');
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    if (authLoading) return; // wait for auth context to finish validating token
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role !== 'admin') {
      setShowAdminKeyModal(true);
      return;
    }
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'orders') fetchOrders();
  }, [activeTab, user, authLoading, productCategoryFilter]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (productCategoryFilter) params.category = productCategoryFilter;
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '' && key !== 'image') {
          formData.append(key, form[key]);
        }
      });
      
      // Append image file if provided
      if (form.image) {
        formData.append('image', form.image);
      }
      
      // Ensure category normalized
      if (form.category) {
        formData.set('category', form.category.trim().toLowerCase());
      }

      if (editing) {
        const res = await api.put(`/products/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Updated product', res.data._id);
        setEditing(null);
        await fetchProducts();
      } else {
        const res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.debug('[ADMIN] Created product', res.data._id, 'category:', res.data.category);
        // Rely on fresh fetch to avoid stale list discrepancies
        await fetchProducts();
      }
      setForm({ name: '', description: '', category: '', material: '', karat: 24, weight: '', image: null });
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save product';
      toastError(`Error saving product: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      material: product.material,
      karat: product.karat || 24,
      weight: product.weight,
      image: null // Don't pre-fill file input
    });
    setEditing(product._id);
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const deleteProduct = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmProductDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      toastError('Failed to delete product');
    }
  };

  const handleCancelProductDelete = () => setConfirmDelete({ open: false, id: null });

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating user role:', err);
      toastError('Failed to update user role');
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '', category: '', material: '', karat: 24, weight: '', image: null });
  };

  const verifyAdminKey = async () => {
    setActionLoading(true);
    setAdminKeyError('');
    try {
      const response = await api.post('/auth/admin-login', { email: user.email, adminKey });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Update user state to admin
      setUser(userData);
      setIsAdminVerified(true);
      setShowAdminKeyModal(false);
    } catch (err) {
      setAdminKeyError(err.response?.data?.error || 'Invalid admin key');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-primary">Admin Panel</h1>

      {/* Confirm Delete Product Modal */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmProductDelete}
        onCancel={handleCancelProductDelete}
      />

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
        >
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Product Management</h2>
          <form onSubmit={handleSubmit} className="mb-8 bg-secondary p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border border-accent rounded" required />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-2 border border-accent rounded" required>
                <option value="">Select Category</option>
                {allowedCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <input type="text" placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="p-2 border border-accent rounded" required />
              {String(form.material).trim().toLowerCase() === 'gold' && (
                <select value={form.karat} onChange={(e) => setForm({ ...form, karat: Number(e.target.value) })} className="p-2 border border-accent rounded">
                  <option value={24}>24k</option>
                  <option value={22}>22k</option>
                  <option value={18}>18k</option>
                </select>
              )}
              <input type="number" placeholder="Weight (g)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="p-2 border border-accent rounded" required />
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} className="p-2 border border-accent rounded" />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="block mt-4 p-2 border border-accent rounded w-full" required />
            <div className="mt-4 flex gap-2">
              <button type="submit" disabled={actionLoading} className="bg-primary text-secondary px-4 py-2 rounded hover:bg-accent transition-colors disabled:opacity-50">
                {actionLoading ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
              {editing && <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">Cancel</button>}
            </div>
          </form>
          <h3 className="text-xl font-bold mb-4">Existing Products</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm text-gray-700">Filter by category:</label>
                      <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="p-2 border border-accent rounded">
                        <option value="">All</option>
                        {allowedCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product._id} className="border border-accent p-4 rounded-lg shadow bg-secondary">
                <img src={(product.images && product.images[0]) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} alt={product.name} className="w-full h-32 object-cover mb-2 rounded" />
                <h4 className="font-bold">{product.name}</h4>
                <p className="text-sm text-gray-600">₹{product.price} | {product.weight}g {String(product.material).trim().toLowerCase() === 'gold' ? `| ${product.karat || 24}k` : ''}</p>
                <p className="text-sm">{product.category} - {product.material}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => editProduct(product)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">Edit</button>
                  <button onClick={() => deleteProduct(product._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="bg-secondary p-4 rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.phone}</td>
                    <td className="p-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="p-1 border border-accent rounded"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Order Management</h2>
          <div className="bg-secondary p-4 rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b">
                    <td className="p-2">{order._id}</td>
                    <td className="p-2">{order.user?.name || 'N/A'}</td>
                    <td className="p-2">₹{order.total}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Admin Key Modal */}
      {showAdminKeyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Admin Access Required</h2>
            <p className="text-gray-600 mb-6 text-center">
              Please enter the admin key to access the admin panel.
            </p>
            <input
              type="password"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Admin Key: GLIMMR-ADMIN-DEFAULT
            </p>
            {adminKeyError && (
              <p className="text-red-600 mb-4">{adminKeyError}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={verifyAdminKey}
                disabled={actionLoading}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;
