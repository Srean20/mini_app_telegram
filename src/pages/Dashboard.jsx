import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  MdAdd, MdEdit, MdDelete, MdLogout, MdSave, 
  MdClose, MdCloudUpload, MdAttachMoney, MdCategory, 
  MdTitle, MdImage 
} from 'react-icons/md';

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
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const [debugLog, setDebugLog] = useState([]);
  
  const addLog = (msg, type = 'info') => {
    setDebugLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const productsCollection = collection(db, 'products');

  const fetchProducts = async () => {
    setLoading(true);
    addLog("Fetching products from database 'admin56'...");
    try {
      const data = await getDocs(productsCollection);
      setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      addLog(`Loaded ${data.docs.length} products.`, 'success');
    } catch (err) {
      addLog(`Database Error: ${err.message}`, 'error');
      console.error("Database Connection Error:", err);
      if (err.message.includes("Database '(default)' not found")) {
        alert("CRITICAL ERROR: Firestore Database not found! \n\nPlease go to your Firebase Console -> Firestore Database and click 'Create Database'.");
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      addLog(`Image selected: ${file.name} (${file.size} bytes)`);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      if (!imageFile) return resolve(formData.image || '');
      
      setIsUploading(true);
      addLog("Starting image upload to Storage...");
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          addLog(`Upload Failed: ${error.message}`, 'error');
          console.error("Upload error:", error);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          addLog("Image uploaded successfully!", 'success');
          setIsUploading(false);
          setUploadProgress(0);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    addLog("Saving product...");
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (uploadErr) {
          addLog(`Step 1 (Upload) failed: ${uploadErr.message}`, 'error');
          alert(`Photo upload failed! Error: ${uploadErr.message}`);
          return;
        }
      }

      const productData = { 
        ...formData, 
        image: imageUrl,
        price: parseFloat(formData.price)
      };

      try {
        addLog("Writing to Firestore 'admin56'...");
        if (editingId) {
          const productDoc = doc(db, 'products', editingId);
          await updateDoc(productDoc, productData);
          addLog("Update successful!", 'success');
        } else {
          await addDoc(productsCollection, productData);
          addLog("Product created successful!", 'success');
        }
        alert("Product saved successfully!");
        resetForm();
        fetchProducts();
      } catch (dbErr) {
        addLog(`Step 2 (Firestore) failed: ${dbErr.message}`, 'error');
        console.error("Firestore Error Details:", dbErr);
        if (dbErr.code === 'permission-denied') {
          alert("Permission Denied! Check your Firestore Rules.");
        } else {
          alert(`Failed to save to database: ${dbErr.message}`);
        }
      }

    } catch (err) {
      addLog(`Unexpected Error: ${err.message}`, 'error');
      console.error("General Error:", err);
      alert("An unexpected error occurred.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', price: '', category: '', image: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleTestConnection = async () => {
    addLog("Testing database connection...");
    try {
      const snap = await getDocs(productsCollection);
      addLog(`Connection Test: OK (found ${snap.docs.length} docs)`, 'success');
      alert("✅ Success! Database is connected.");
    } catch (err) {
      addLog(`Connection Test: FAILED (${err.message})`, 'error');
      alert("❌ Database Error: " + err.message);
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
    setImagePreview(product.image);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        addLog(`Deleting product ${id}...`);
        const productDoc = doc(db, 'products', id);
        await deleteDoc(productDoc);
        addLog("Delete successful!", 'success');
        fetchProducts();
      } catch (err) {
        addLog(`Delete failed: ${err.message}`, 'error');
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>Product Management</h1>
          <p>{products.length} Items in Inventory (DB: admin56)</p>
        </div>
        <div className="header-actions">
          <button className="seed-btn" onClick={handleTestConnection} style={{ background: '#007aff', color: 'white' }}>
            Check Connection
          </button>
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <MdAdd /> Create New
          </button>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <MdLogout />
          </button>
        </div>
      </header>


      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content premium-form animate-fade-in-up">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={resetForm}><MdClose /></button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
              <div className="form-sections">
                <div className="form-section image-section">
                  <label className="image-upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="upload-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <MdCloudUpload size={40} />
                        <span>Click to Upload Product Photo</span>
                      </div>
                    )}
                    <input type="file" onChange={handleFileChange} accept="image/*" hidden />
                  </label>
                  {isUploading && (
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                      <span className="progress-text">{Math.round(uploadProgress)}%</span>
                    </div>
                  )}
                </div>

                <div className="form-section details-section">
                  <div className="input-group">
                    <label><MdTitle /> Product Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. iPhone 15 Pro Max" required />
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label><MdAttachMoney /> Price ($)</label>
                      <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="0.00" required />
                    </div>
                    <div className="input-group">
                      <label><MdCategory /> Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required>
                        <option value="">Select Category</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="save-btn" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : editingId ? 'Update Product' : 'Save Product'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading Inventory...</div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-info">
                        <img src={product.image} alt={product.title} />
                        <span className="table-product-title">{product.title}</span>
                      </div>
                    </td>
                    <td><span className="category-tag">{product.category}</span></td>
                    <td className="table-price">${product.price.toFixed(2)}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => handleEditClick(product)} className="edit-icon" title="Edit"><MdEdit /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="delete-icon" title="Delete"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {debugLog.length > 0 && (
        <div className="debug-console">
          <div className="debug-header">
            <span>System Diagnostics (DB: admin56)</span>
            <button onClick={() => setDebugLog([])}>Clear</button>
          </div>
          <div className="debug-body">
            {debugLog.map((log, i) => (
              <div key={i} className={`debug-item ${log.type}`}>
                <span className="debug-time">[{log.time}]</span> {log.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
