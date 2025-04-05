import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './CategoryManagement.module.css';

const API_BASE = 'https://lmsapp-plvj.onrender.com/admin/blog';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Njk4M2VhODQ5OTRlMDllNTJjMWIxYyIsImlhdCI6MTczNDk2ODQxNX0.0mxzxb4WBh_GAWHfyfMudWl5cPn6thbigI8VH_AFV8A';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/category/getAll`, {
        headers: { 'x-admin-token': ADMIN_TOKEN }
      });
      setCategories(response.data.data);
    } catch (error) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    }
  };

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE}/category/update/${categoryId}`,
        { isDeleted: !currentStatus },
        { headers: { 'x-admin-token': ADMIN_TOKEN } }
      );
      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await axios.put(`${API_BASE}/category/update/${editId}`, 
          { categoryName },
          { headers: { 'x-admin-token': ADMIN_TOKEN } }
        );
      } else {
        await axios.post(`${API_BASE}/category/create`, 
          { categoryName },
          { headers: { 'x-admin-token': ADMIN_TOKEN } }
        );
      }
      setCategoryName('');
      setEditId(null);
      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving category');
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.categoryName);
    setEditId(category._id);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Category Management</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submitButton}>
          {editId ? 'Update Category' : 'Create Category'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.categorySection}>
        <h3 className={styles.sectionTitle}>Existing Categories</h3>
        {categories.length === 0 ? (
          <p className={styles.empty}>No categories found</p>
        ) : (
          <ul className={styles.list}>
            {categories.map(category => (
              <li key={category._id} className={`${styles.listItem} ${category.isDeleted ? styles.deletedItem : ''}`}>
                <div className={styles.itemContent}>
                  <span className={styles.categoryName}>
                    {category.categoryName}
                    {category.isDeleted && <span className={styles.statusIndicator}> (Deleted)</span>}
                  </span>
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleEdit(category)}
                      className={styles.editButton}
                      disabled={category.isDeleted}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category._id, category.isDeleted)}
                      className={`${styles.statusButton} ${category.isDeleted ? styles.activateButton : styles.deleteButton}`}
                    >
                      {category.isDeleted ? 'Mark Active' : 'Mark Deleted'}
                    </button>
                    <div className={styles.linkGroup}>
                      <Link 
                        to={`/dashboard/blog-list/${category._id}`} 
                        className={styles.link}
                      >
                        View Blogs
                      </Link>
                      <Link 
                        to={`/dashboard/blogs/${category._id}`} 
                        className={styles.link}
                      >
                        Create Blog
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;