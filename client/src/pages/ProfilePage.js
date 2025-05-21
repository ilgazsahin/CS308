import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        address: "",
        userType: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Get user information when component mounts
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        console.log("Token:", token ? "exists" : "missing");
        console.log("User ID:", userId || "missing");
        
        if (!token || !userId) {
            navigate("/login");
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                console.log("Fetching user data from:", `http://localhost:3001/api/users/${userId}`);
                
                const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                console.log("User data response:", response.data);
                setUser(response.data);
                setFormData({
                    name: response.data.name || "",
                    address: response.data.address || ""
                });
            } catch (err) {
                console.error("Error fetching user data:", err);
                if (err.response) {
                    console.error("Response status:", err.response.status);
                    console.error("Response data:", err.response.data);
                }
                setError("Failed to load profile information. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            
            const response = await axios.put(`http://localhost:3001/api/users/${userId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update local user state and localStorage if name changed
            setUser({
                ...user,
                name: formData.name,
                address: formData.address
            });
            
            if (user.name !== formData.name) {
                localStorage.setItem("userName", formData.name);
            }
            
            setSuccessMessage("Profile updated successfully!");
            setIsEditing(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                setError("");
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Format the role/userType to be more readable
    const formatRole = (role) => {
        if (!role) return "Customer";
        
        switch (role.toLowerCase()) {
            case "customer":
                return "Customer";
            case "product":
                return "Product Manager";
            case "sales":
                return "Sales Manager";
            default:
                return role.charAt(0).toUpperCase() + role.slice(1);
        }
    };

    return (
        <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
            <NavigationBar />
            
            <div className="container" style={{ padding: "60px 0" }}>
                <div style={{
                    backgroundColor: "white",
                    padding: "40px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                    maxWidth: "800px",
                    margin: "0 auto"
                }}>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "2.5rem",
                        marginBottom: "30px",
                        color: "var(--primary-color)",
                        textAlign: "center"
                    }}>
                        My Profile
                    </h1>
                    
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p>Loading profile information...</p>
                        </div>
                    ) : error ? (
                        <div style={{
                            backgroundColor: "#fbe9e7",
                            color: "#d32f2f",
                            padding: "15px",
                            borderRadius: "4px",
                            marginBottom: "20px",
                            textAlign: "center"
                        }}>
                            {error}
                        </div>
                    ) : (
                        <>
                            {successMessage && (
                                <div style={{
                                    backgroundColor: "#e8f5e9",
                                    color: "#388e3c",
                                    padding: "15px",
                                    borderRadius: "4px",
                                    marginBottom: "20px",
                                    textAlign: "center"
                                }}>
                                    {successMessage}
                                </div>
                            )}
                            
                            {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "500",
                                            color: "var(--primary-color)"
                                        }}>
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "4px",
                                                fontSize: "1rem"
                                            }}
                                            required
                                        />
                                    </div>
                                    
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "500",
                                            color: "var(--primary-color)"
                                        }}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "4px",
                                                fontSize: "1rem",
                                                backgroundColor: "#f5f5f5"
                                            }}
                                            disabled
                                        />
                                        <p style={{ fontSize: "0.8rem", color: "var(--light-text)", marginTop: "5px" }}>
                                            Email cannot be changed
                                        </p>
                                    </div>
                                    
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "500",
                                            color: "var(--primary-color)"
                                        }}>
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "4px",
                                                fontSize: "1rem",
                                                minHeight: "100px",
                                                resize: "vertical"
                                            }}
                                        />
                                    </div>
                                    
                                    <div style={{ marginBottom: "30px" }}>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "500",
                                            color: "var(--primary-color)"
                                        }}>
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={formatRole(user.userType)}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "4px",
                                                fontSize: "1rem",
                                                backgroundColor: "#f5f5f5"
                                            }}
                                            disabled
                                        />
                                    </div>
                                    
                                    <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: "12px 25px",
                                                backgroundColor: "var(--primary-color)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                fontSize: "1rem"
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save Changes"}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: user.name || "",
                                                    address: user.address || ""
                                                });
                                            }}
                                            style={{
                                                padding: "12px 25px",
                                                backgroundColor: "transparent",
                                                color: "var(--primary-color)",
                                                border: "1px solid var(--primary-color)",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                fontSize: "1rem"
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ 
                                        display: "flex", 
                                        flexDirection: "column", 
                                        gap: "20px"
                                    }}>
                                        <div>
                                            <h3 style={{ 
                                                color: "var(--light-text)", 
                                                fontSize: "0.9rem", 
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}>
                                                Name
                                            </h3>
                                            <p style={{
                                                fontSize: "1.2rem",
                                                color: "var(--primary-color)"
                                            }}>
                                                {user.name || "Not set"}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 style={{ 
                                                color: "var(--light-text)", 
                                                fontSize: "0.9rem", 
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}>
                                                Email
                                            </h3>
                                            <p style={{
                                                fontSize: "1.2rem",
                                                color: "var(--primary-color)"
                                            }}>
                                                {user.email}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 style={{ 
                                                color: "var(--light-text)", 
                                                fontSize: "0.9rem", 
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}>
                                                Address
                                            </h3>
                                            <p style={{
                                                fontSize: "1.2rem",
                                                color: "var(--primary-color)",
                                                whiteSpace: "pre-wrap"
                                            }}>
                                                {user.address || "Not set"}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 style={{ 
                                                color: "var(--light-text)", 
                                                fontSize: "0.9rem", 
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "1px"
                                            }}>
                                                Role
                                            </h3>
                                            <p style={{
                                                fontSize: "1.2rem",
                                                color: "var(--primary-color)"
                                            }}>
                                                {formatRole(user.userType)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: "flex", 
                                        justifyContent: "center",
                                        marginTop: "40px" 
                                    }}>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{
                                                padding: "12px 25px",
                                                backgroundColor: "var(--primary-color)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                fontSize: "1rem"
                                            }}
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default ProfilePage; 