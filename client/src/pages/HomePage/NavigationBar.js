import React, { useState, useContext, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaSpinner, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../../components/CartContext";
import CategorySidebar from "../../components/CategorySidebar";
const role = localStorage.getItem("role");

const NavigationBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const { cartCount, cartTotal, isLoading } = useCart();
    
    // Extract search query from URL on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [location.pathname]);
    
    // Debounce function to avoid too many URL updates
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };
    
    // Update URL with search parameter - debounced
    const updateSearchURL = useCallback(
        debounce((query) => {
            // Only update URL if we're on the products page or search has text
            if (location.pathname === '/products' || query.trim()) {
                const urlParams = new URLSearchParams(location.search);
                
                if (query.trim()) {
                    urlParams.set('search', query);
                } else {
                    urlParams.delete('search');
                }
                
                // Create new URL without navigating if on products page
                if (location.pathname === '/products') {
                    const newUrl = `${location.pathname}?${urlParams.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                    
                    // Create a new search event for components to detect
                    window.dispatchEvent(new CustomEvent('urlSearchUpdate', {
                        detail: { search: query }
                    }));
                } else if (query.trim()) {
                    // Navigate to products page with search if not already there
                    navigate(`/products?${urlParams.toString()}`);
                }
            }
        }, 300),
        [location.pathname, location.search, navigate]
    );
    
    // Handle search input change
    const handleSearchChange = (e) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);
        updateSearchURL(newQuery);
    };

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        navigate("/home"); // Redirect to home as a guest
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div>
            {/* Category Sidebar */}
            <CategorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--primary-color)",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                Profile
                                            </Link>

                                            <Link
                                                to="/wishlist"
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "var(--primary-color)",
                                                    padding: "5px 0"
                                                }}
                                            >
                                                Wishlist
                                            </Link>

                                            <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                                            {role === "product manager" && (
                                            <Link
                                            to="/admin"
                                            onClick={() => setIsOpen(false)}
                                            style={{
                                                textDecoration: "none",
                                                color: "var(--primary-color)",
                                                padding: "5px 0"
                                            }}
                                            >
                                                 Product Manager
                                             </Link>
                                            )}
                                            {role === "sales manager" && (
                                            <Link
                                            to="/sales-manager"
                                            onClick={() => setIsOpen(false)}
                                            style={{
                                                textDecoration: "none",
                                                color: "var(--primary-color)",
                                                padding: "5px 0"
                                            }}
                                            >
                                                 Sales Manager
                                             </Link>
                                            )}


                                            
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
                            {isLoading ? (
                                <>
                                    <FaSpinner className="fa-spin" />
                                    CART (loading...)
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart />
                                    CART ({cartCount > 0 ? `$${cartTotal.toFixed(2)}` : "0"})
                                </>
                            )}
                            <style>
                                {`
                                    @keyframes fa-spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                    .fa-spin {
                                        animation: fa-spin 1s infinite linear;
                                    }
                                `}
                            </style>
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
                    alignItems: "flex-end"
                }}>
                    {/* Left section with menu button and logo */}
                    <div style={{ 
                        display: "flex", 
                        alignItems: "flex-end",
                        flex: "0 0 auto",
                        marginRight: "20px"
                    }}>
                        {/* Categories Menu Button - Changed to hamburger icon */}
                        <button 
                            onClick={toggleSidebar}
                            style={{
                                background: "none",
                                border: "none",
                                marginRight: "15px",
                                cursor: "pointer",
                                color: "var(--primary-color)",
                                fontSize: "20px",
                                padding: "8px",
                                borderRadius: "4px",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: isSidebarOpen ? "0.7" : "1",
                                marginBottom: "2px"
                            }}
                            aria-label="Toggle categories menu"
                        >
                            <FaBars />
                        </button>

                        {/* Logo */}
                        <Link to="/home" style={{ textDecoration: "none" }}>
                            <h1 style={{ 
                                margin: 0, 
                                fontFamily: "'Playfair Display', serif",
                                color: "var(--primary-color)",
                                lineHeight: 1.1
                            }}>
                                STORE 26
                            </h1>
                        </Link>
                    </div>

                    {/* Center section with main menu - aligned to bottom */}
                    <nav style={{ 
                        display: "flex",
                        marginRight: "auto",
                        alignItems: "flex-end",
                        paddingBottom: "3px"
                    }}>
                        <Link to="/home" className="nav-link">HOME</Link>
                        <Link to="/about" className="nav-link">ABOUT</Link>
                        <Link to="/products" className="nav-link">PRODUCTS</Link>
        </nav>

                    {/* Right section with search bar - also aligned to bottom */}
                    <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        paddingBottom: "3px"
                    }}>
                        <form 
                            onSubmit={handleSearch}
                            style={{
                                display: "flex",
                                position: "relative",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{
                                    width: "220px",
                                    padding: "10px 35px 10px 15px",
                                    border: "1px solid #e8e8e8",
                                    borderRadius: "50px",
                                    fontSize: "14px",
                                    color: "#555",
                                    backgroundColor: "#f9f9f9",
                                    outline: "none"
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        updateSearchURL("");
                                    }}
                                    style={{
                                        position: "absolute",
                                        right: "30px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        color: "#999",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 2
                                    }}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                            <button
                                type="submit"
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#777",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                aria-label="Search"
                            >
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default NavigationBar;
