import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";

function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    axios
      .post("http://localhost:3001/api/users/register", { email, name, password })
      .then((result) => {
        console.log(result);
        // After successful registration, navigate to login
        navigate("/login");
      })
      .catch((err) => {
        if (err.response && err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Error occurred during registration!");
        }
      });
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
              Create an Account
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
                  htmlFor="name" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.9rem", 
                    color: "var(--primary-color)",
                    fontWeight: "500"
                  }}
                >
                  Full Name
                </label>
                <input 
                  type="text"
                  id="name" 
                  placeholder="Enter your name" 
                  autoComplete="off" 
                  name="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label 
                  htmlFor="confirmPassword" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.9rem", 
                    color: "var(--primary-color)",
                    fontWeight: "500"
                  }}
                >
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  placeholder="Confirm your password" 
                  name="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  style={{ 
              width: "100%",
                    padding: "14px", 
                    backgroundColor: "var(--primary-color)", 
                    color: "white", 
              border: "none",
              cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "0.9rem"
                  }}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <div style={{ 
              textAlign: "center",
                color: "var(--light-text)",
                fontSize: "0.9rem"
              }}>
                <p>Already have an account? {" "}
                  <Link 
                    to="/login" 
                    style={{ 
                      color: "var(--primary-color)", 
              textDecoration: "none",
                      fontWeight: "500"
                    }}
                  >
                    Login here
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

export default Register;
