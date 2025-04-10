import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        {/* Partner Logos */}
        <div className="partner-logos">
          <div className="partner-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/2789/2789778.png" alt="Books" height="50" />
          </div>
          <div className="partner-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/5833/5833290.png" alt="Bookstore" height="50" />
          </div>
          <div className="partner-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/3574/3574823.png" alt="Bookdoor" height="50" />
          </div>
          <div className="partner-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/1596/1596340.png" alt="Library" height="50" />
          </div>
          <div className="partner-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/2702/2702134.png" alt="Flaprise" height="50" />
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          marginTop: '40px', 
          paddingTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '30px'
        }}>
          {/* Column 1: About */}
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '1.3rem', 
              marginBottom: '20px',
              color: 'var(--primary-color)'
            }}>BOOKSAW</h3>
            <p style={{ 
              lineHeight: '1.7', 
              color: 'var(--light-text)', 
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              At Booksaw, we believe that reading is not just a hobby, it's a journey that expands minds 
              and transforms lives. Our curated collection of books spans across genres to satisfy every 
              reader's taste.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '1.1rem', 
              marginBottom: '20px',
              color: 'var(--primary-color)'
            }}>QUICK LINKS</h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>Home</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/about" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>About</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/products" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>Products</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '1.1rem', 
              marginBottom: '20px',
              color: 'var(--primary-color)'
            }}>CATEGORIES</h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/category/fiction" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>Fiction</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/category/non-fiction" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>Non-Fiction</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/category/science" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>Science</Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/category/history" style={{ textDecoration: 'none', color: 'var(--light-text)' }}>History</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '1.1rem', 
              marginBottom: '20px',
              color: 'var(--primary-color)'
            }}>CONTACT US</h3>
            <p style={{ 
              lineHeight: '1.7', 
              color: 'var(--light-text)', 
              marginBottom: '10px',
              fontSize: '0.9rem'
            }}>
              123 Book Street<br />
              Reading City, RC 12345<br />
              contact@booksaw.com<br />
              +1 (555) 123-4567
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          marginTop: '40px', 
          paddingTop: '20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          fontSize: '0.8rem'
        }}>
          &copy; {new Date().getFullYear()} Booksaw. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 