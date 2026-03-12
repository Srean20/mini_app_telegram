import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdLogout, MdSave, MdClose } from 'react-icons/md';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    image: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const productsCollection = collection(db, 'products');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getDocs(productsCollection);
      setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'price' ? parseFloat(value) : value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(productsCollection, formData);
      setFormData({ title: '', price: '', category: '', image: '' });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productDoc = doc(db, 'products', editingId);
      await updateDoc(productDoc, formData);
      setEditingId(null);
      setFormData({ title: '', price: '', category: '', image: '' });
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const productDoc = doc(db, 'products', id);
        await deleteDoc(productDoc);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <MdAdd /> Add Product
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
              <input name="price" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
              <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
              <input name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} required />
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
              <input name="price" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
              <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
              <input name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} required />
              <div className="form-actions">
                <button type="submit" className="save-btn">Update</button>
                <button type="button" className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><img src={product.image} alt={product.title} width="50" /></td>
                  <td>{product.title}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td className="table-actions">
                    <button onClick={() => handleEditClick(product)} className="edit-icon"><MdEdit /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-icon"><MdDelete /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
