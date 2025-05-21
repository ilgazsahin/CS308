import React from "react";
import { Link } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import { FaShoppingCart, FaTrash, FaArrowLeft, FaExchangeAlt } from "react-icons/fa";

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (addToCart(product)) {
      // Optionally, you can also remove the item from wishlist after adding to cart
      // removeFromWishlist(product._id);
    }
  };

  const handleMoveToCart = (product) => {
    if (addToCart(product)) {
      removeFromWishlist(product._id);
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to remove all items from your wishlist?")) {
      clearWishlist();
    }
  };

  const renderEmptyWishlist = () => (
    <div style={{
      padding: "40px 20px",
      textAlign: "center",
      backgroundColor: "white",
      borderRadius: "8px",
      marginBottom: "40px"
    }}>
      <h2 style={{
        fontSize: "1.5rem",
        color: "var(--primary-color)",
        marginBottom: "20px"
      }}>Your wishlist is empty</h2>
      
      <p style={{
        color: "var(--light-text)",
        marginBottom: "30px"
      }}>
        Add items to your wishlist to save them for later.
      </p>
      
      <Link
        to="/products"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "12px 25px",
          backgroundColor: "var(--primary-color)",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "500",
          fontSize: "0.9rem",
          gap: "10px"
        }}
      >
        <FaArrowLeft />
        Continue shopping
      </Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{ padding: "60px 0" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "30px" 
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.5rem",
            fontWeight: "500",
            color: "var(--primary-color)",
            margin: 0
          }}>
            My Wishlist
          </h1>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearWishlist}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 15px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem"
              }}
            >
              <FaTrash size={14} />
              Clear All
            </button>
          )}
        </div>
        
        {wishlistLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>Loading wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          renderEmptyWishlist()
        ) : (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "30px",
              marginBottom: "50px"
            }}>
              {wishlistItems.map((item) => (
                <div key={item._id} style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  {/* Product image */}
                  <Link to={`/book/${item._id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      height: "200px",
                      backgroundColor: "#f8f8f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain"
                        }}
                      />
                    </div>
                  </Link>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#d32f2f",
                      zIndex: 2
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash size={14} />
                  </button>
                  
                  {/* Product details */}
                  <div style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1
                  }}>
                    <h3 style={{
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      marginBottom: "6px",
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--primary-color)"
                    }}>
                      {item.title}
                    </h3>
                    
                    <p style={{
                      fontSize: "0.9rem",
                      color: "var(--light-text)",
                      marginBottom: "5px"
                    }}>
                      {item.author}
                    </p>
                    
                    <p style={{
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      color: "var(--accent-color)",
                      marginTop: "auto",
                      marginBottom: "15px"
                    }}>
                      ${item.price ? item.price.toFixed(2) : "0.00"}
                    </p>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleAddToCart(item)}
                        style={{
                          flex: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "10px 5px",
                          backgroundColor: item.stock <= 0 ? "#cccccc" : "var(--primary-color)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: item.stock <= 0 ? "not-allowed" : "pointer",
                          fontWeight: "500",
                          fontSize: "0.8rem"
                        }}
                        disabled={item.stock <= 0}
                      >
                        <FaShoppingCart size={12} />
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={() => handleMoveToCart(item)}
                        style={{
                          flex: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "10px 5px",
                          backgroundColor: item.stock <= 0 ? "#cccccc" : "#4b6043",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: item.stock <= 0 ? "not-allowed" : "pointer",
                          fontWeight: "500",
                          fontSize: "0.8rem"
                        }}
                        disabled={item.stock <= 0}
                        title="Move to Cart"
                      >
                        <FaExchangeAlt size={12} />
                        Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Link
                to="/products"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 25px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  gap: "10px"
                }}
              >
                <FaArrowLeft />
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default WishlistPage;
