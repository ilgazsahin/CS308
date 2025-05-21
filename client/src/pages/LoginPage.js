import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { useWishlist } from "../components/WishlistContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { handleLogin: mergeCart } = useCart();
  const { handleLogin: mergeWishlist } = useWishlist();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (userId && token) {
        try {
          const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
          setUserInfo(response.data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await axios.post("http://localhost:3001/api/users/login", { email, password });
      
      console.log("Login response:", result.data);
      console.log("User type from login:", result.data.user.userType);
      
        if (result.data && result.data.message === "Login successful") {
          // Store the token
          localStorage.setItem("token", result.data.token);
      
        // Store the userId
        const userId = result.data.user.id || result.data.user._id;
        localStorage.setItem("userId", userId);

          // Store userName
          localStorage.setItem("userName", result.data.user.name);
          
          // Store userType
          localStorage.setItem("userType", result.data.user.userType || "");
          
          console.log("Saved to localStorage - userId:", userId);
          console.log("Saved to localStorage - userType:", result.data.user.userType || "");
      
        // Handle cart merging
        await mergeCart(userId);
        
        // Handle wishlist merging
        await mergeWishlist(userId);
        
        // Update user info state
        setUserInfo(result.data.user);
    
        // Navigate to Home or redirect to original destination
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
        } else {
          setErrorMessage("Invalid credentials or unexpected response!");
        }
    } catch (err) {
        // If there's an error from the server, display it
        if (err.response && err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Invalid email or password!");
        }
    } finally {
      setIsLoading(false);
    }
  };

  // Check role access
  const checkAccess = async (role) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:3001/api/users/check-role/${userId}?role=${role}`);
      alert(`Access to ${role} role: ${response.data.hasRole ? 'YES' : 'NO'}\nUser type: ${response.data.userType}`);
    } catch (error) {
      console.error("Error checking access:", error);
      alert(`Error checking access to ${role} role`);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container">
        <div style={{ 
        display: "flex",
        justifyContent: "center",
          padding: "80px 0" 
        }}>
          <div style={{ 
            backgroundColor: "white", 
            padding: "40px", 
          width: "100%",
            maxWidth: "500px"
          }}>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: "2rem", 
              marginBottom: "30px", 
              color: "var(--primary-color)",
              textAlign: "center"
            }}>
              Login to Your Account
            </h1>

            {errorMessage && (
              <div style={{ 
                color: "#721c24", 
                backgroundColor: "#f8d7da", 
                padding: "12px 15px", 
                borderRadius: "4px", 
                marginBottom: "20px",
                fontSize: "0.9rem"
              }}>
                {errorMessage}
              </div>
            )}

            {/* Show user info if logged in */}
            {userInfo && (
              <div style={{
                backgroundColor: "#e8f5e9",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "20px"
              }}>
                <p><strong>Logged in as:</strong> {userInfo.name}</p>
                <p style={{ 
                  fontSize: "1.1rem", 
                  padding: "5px 0",
                  backgroundColor: "#4caf50",
                  color: "white",
                  textAlign: "center",
                  marginBottom: "10px",
                  borderRadius: "4px"
                }}>
                  <strong>User Type:</strong> {userInfo.userType || "Not set"}
                </p>
                
                <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                  <p><strong>Update User Role:</strong></p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button 
                      onClick={async () => {
                        try {
                          const userId = localStorage.getItem('userId');
                          if (!userId) return;
                          
                          const response = await axios.patch(`http://localhost:3001/api/users/${userId}/type`, {
                            userType: 'customer'
                          });
                          
                          alert('Updated to customer role');
                          window.location.reload();
                        } catch (error) {
                          console.error("Error updating role:", error);
                          alert('Failed to update role');
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        backgroundColor: "#9e9e9e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      Set as Customer
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const userId = localStorage.getItem('userId');
                          if (!userId) return;
                          
                          const response = await axios.patch(`http://localhost:3001/api/users/${userId}/type`, {
                            userType: 'product'
                          });
                          
                          alert('Updated to product manager role');
                          window.location.reload();
                        } catch (error) {
                          console.error("Error updating role:", error);
                          alert('Failed to update role');
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        backgroundColor: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      Set as Product Manager
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const userId = localStorage.getItem('userId');
                          if (!userId) return;
                          
                          const response = await axios.patch(`http://localhost:3001/api/users/${userId}/type`, {
                            userType: 'sales'
                          });
                          
                          alert('Updated to sales manager role');
                          window.location.reload();
                        } catch (error) {
                          console.error("Error updating role:", error);
                          alert('Failed to update role');
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        backgroundColor: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      Set as Sales Manager
                    </button>
                  </div>
                </div>
                
                <div style={{ marginTop: "10px" }}>
                  <button 
                    onClick={() => checkAccess('product')}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "10px",
                      fontSize: "0.8rem"
                    }}
                  >
                    Check Product Manager Access
                  </button>
                  <button 
                    onClick={() => checkAccess('sales')}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    Check Sales Manager Access
                  </button>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <Link to="/product-manager" style={{
                    padding: "8px 12px",
                    backgroundColor: "#4b6043",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    display: "inline-block"
                  }}>
                    Go to Product Manager Dashboard
                  </Link>
                  <Link to="/sales-manager" style={{
                    padding: "8px 12px",
                    backgroundColor: "#4b6043",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    display: "inline-block"
                  }}>
                    Go to Sales Manager Dashboard
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "25px" }}>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.9rem", 
                    color: "var(--primary-color)",
                    fontWeight: "500"
                  }}
                >
                  Email Address
                </label>
                <input 
                  type="email"
                  id="email" 
                  placeholder="Enter your email" 
                  autoComplete="off" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
              width: "100%",
                    padding: "12px 15px", 
                    border: "1px solid var(--border-color)", 
                    fontSize: "1rem",
                    backgroundColor: "#f9f9f9"
                  }} 
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label 
                  htmlFor="password" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.9rem", 
                    color: "var(--primary-color)",
                    fontWeight: "500"
                  }}
                >
                  Password
                </label>
                <input 
                  type="password" 
                  id="password"
                  placeholder="Enter your password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
              width: "100%",
                    padding: "12px 15px", 
                    border: "1px solid var(--border-color)", 
                    fontSize: "1rem",
                    backgroundColor: "#f9f9f9"
                  }} 
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ 
              width: "100%",
                    padding: "14px", 
                    backgroundColor: isLoading ? "#ccc" : "var(--primary-color)", 
                    color: "white", 
              border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                    position: "relative"
                  }}
                >
                  {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </div>

              <div style={{ 
              textAlign: "center",
                color: "var(--light-text)",
                fontSize: "0.9rem"
              }}>
                <p>Don't have an account? {" "}
                  <Link 
                    to="/register" 
                    style={{ 
                      color: "var(--primary-color)", 
              textDecoration: "none",
                      fontWeight: "500"
                    }}
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Login;
