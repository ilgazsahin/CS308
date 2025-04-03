import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";


const NavigationBar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");

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
        <nav
            style={{
                padding: "10px",
                background: "#007bff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
        >
            {/* Left Side: Logo */}
            <div>
                <Link
                    to="/home"
                    style={{
                        textDecoration: "none",
                        fontWeight: "bold",
                        fontSize: "20px",
                        color: "#fff",
                    }}
                >
                    Bookstore
                </Link>
            </div>

            {/* Right Side: Cart Icon + User Account */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

                {/* User Dropdown */}
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "8px",
                            color: "#fff",
                        }}
                        onClick={handleToggle}
                    >
                        <FaUserCircle size={24} />
                        <span style={{ fontWeight: "bold" }}>My Account</span>
                        <span style={{ fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {isOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "40px",
                                right: 0,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                padding: "8px 0",
                                width: "180px",
                                zIndex: 999,
                            }}
                        >
                            {token ? (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "8px 16px",
                                            width: "100%",
                                            textAlign: "left",
                                            color: "#333",
                                            borderBottom: "1px solid #eee",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        Hello, {userName || "User"}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            textAlign: "left",
                                            width: "100%",
                                            padding: "8px 16px",
                                            cursor: "pointer",
                                            color: "#333",
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            textDecoration: "none",
                                            color: "#333",
                                            padding: "8px 16px",
                                            display: "block",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            textDecoration: "none",
                                            color: "#333",
                                            padding: "8px 16px",
                                            display: "block",
                                        }}
                                    >
                                        Create an Account
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
