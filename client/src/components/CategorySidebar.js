import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes, FaList, FaFilter } from 'react-icons/fa';

const CategorySidebar = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/books/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    // Navigate to products page with the selected category as a query parameter
    navigate(`/products?category=${encodeURIComponent(category)}`);
    onClose(); // Close the sidebar after selection
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-300px',
          width: '300px',
          height: '100%',
          backgroundColor: 'white',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.3s ease',
          zIndex: 101,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #eee',
          }}
        >
          <h2
            style={{
              margin: 0,
              color: 'var(--primary-color)',
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem',
            }}
          >
            Categories
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--primary-color)',
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Categories List */}
        <div style={{ padding: '20px' }}>
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length > 0 ? (
            <>
              <div
                style={{
                  marginBottom: '20px',
                }}
              >
                <Link
                  to="/products"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 15px',
                    textDecoration: 'none',
                    color: 'var(--primary-color)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    marginBottom: '10px',
                  }}
                  onClick={onClose}
                >
                  <FaList style={{ marginRight: '10px' }} />
                  All Books
                </Link>
              </div>

              <h3
                style={{
                  color: 'var(--light-text)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '15px',
                }}
              >
                Browse by Category
              </h3>

              {categories.map((category) => (
                <div
                  key={category}
                  style={{
                    marginBottom: '10px',
                  }}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 15px',
                      textAlign: 'left',
                      background: 'white',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--primary-color)',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </>
          ) : (
            <p>No categories found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CategorySidebar; 