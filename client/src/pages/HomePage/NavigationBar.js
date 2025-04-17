import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../../components/CartContext";

const NavigationBar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const { cartCount, cartTotal } = useCart();

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        navigate("/home"); // Redirect to home as a guest
    };

    return (
        <div>
            {/* Top bar with account, cart */}
            <div 
                style={{
                    borderBottom: "1px solid var(--border-color)",
                    padding: "10px 0",
                    backgroundColor: "white",
                    position: "relative"
                }}
            >
                <div className="container" style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    {/* Account and Cart */}
                    <div style={{ display: "flex", gap: "20px", alignItems: "center", position: "relative" }}>
                        <div style={{ position: "relative" }}>
                            <Link to={token ? "#" : "/login"} 
                                onClick={token ? handleToggle : null}
                                style={{ 
                                    textDecoration: "none", 
                                    color: "var(--primary-color)",
                                    fontSize: "14px"
                                }}
                            >
                                ACCOUNT
                            </Link>
                            
                            {/* Dropdown for account */}
                            {isOpen && (
                                <div style={{
                                    position: "absolute",
                                    top: "30px",
                                    right: 0,
                                    backgroundColor: "#fff",
                                    border: "1px solid var(--border-color)",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    padding: "15px",
                                    width: "200px",
                                    zIndex: 1000
                                }}>
                                    {token ? (
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}>
                                            <p style={{ margin: 0, fontWeight: "500" }}>Hello, {userName || "User"}</p>
                                            <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                                            <Link
                                                to="/orders"
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--primary-color)",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                Order History
                                            </Link>
                                            <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsOpen(false);
                                                }}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    textAlign: "left",
                                                    padding: "5px 0",
                                                    cursor: "pointer",
                                                    color: "var(--primary-color)"
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--primary-color)",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                Log in
                                            </Link>
                                            <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                                            <Link
                                                to="/register"
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--primary-color)",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                Create an Account
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <Link to="/cart" style={{ 
                            textDecoration: "none", 
                            color: "var(--primary-color)",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}>
                            <FaShoppingCart />
                            CART ({cartCount > 0 ? `$${cartTotal.toFixed(2)}` : "0"})
                        </Link>
                        <Link to="#" style={{ 
                            textDecoration: "none", 
                            color: "var(--primary-color)" 
                        }}>
                            <FaSearch />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main navigation */}
            <header style={{
                padding: "20px 0",
                backgroundColor: "white",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)"
            }}>
                <div className="container" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    {/* Logo */}
                    <div>
                        <Link to="/home" style={{ textDecoration: "none" }}>
                            <h1 style={{ 
                                margin: 0, 
                                fontFamily: "'Playfair Display', serif",
                                color: "var(--primary-color)"
                            }}>
                                STORE 26
                            </h1>
                        </Link>
                    </div>

                    {/* Main Menu */}
                    <nav style={{ display: "flex" }}>
                        <Link to="/home" className="nav-link">HOME</Link>
                        <Link to="/about" className="nav-link">ABOUT</Link>
                        <Link to="/products" className="nav-link">PRODUCTS</Link>
                    </nav>
                </div>
            </header>
        </div>
    );
};

export default NavigationBar;
