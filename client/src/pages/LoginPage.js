import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await axios.post("http://localhost:3001/api/users/login", { email, password });
      
      if (result.data && result.data.message === "Login successful") {
        // Store the token
        localStorage.setItem("token", result.data.token);
    
        // Store the userId
        const userId = result.data.user.id || result.data.user._id;
        localStorage.setItem("userId", userId);

        // Store userName
        localStorage.setItem("userName", result.data.user.name);
    
        // Handle cart merging
        await handleLogin(userId);
    
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
