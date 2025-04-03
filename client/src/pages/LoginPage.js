import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3001/api/users/login", { email, password })
      .then((result) => {
        console.log(result);
      
        if (result.data && result.data.message === "Login successful") {
          // Store the token
          localStorage.setItem("token", result.data.token);
      
          // **Store the userId**:
          // Make sure your backend actually sends "user": {...} with an "id" or "_id"
          localStorage.setItem("userId", result.data.user.id);

          // Store userName
          localStorage.setItem("userName", result.data.user.name);
      
          // Navigate to Home
          navigate("/home");
        } else {
          setErrorMessage("Invalid credentials or unexpected response!");
        }
      })
      
      .catch((err) => {
        // If there's an error from the server, display it
        if (err.response && err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Invalid email or password!");
        }
      });
  };

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        height: "100vh",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        },
      },
      React.createElement(
        "h2",
        { style: { textAlign: "center", marginBottom: "20px" } },
        "Login"
      ),

      errorMessage &&
        React.createElement(
          "div",
          { style: { color: "red", marginBottom: "15px" } },
          errorMessage
        ),

      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement(
          "div",
          { style: { marginBottom: "15px" } },
          React.createElement(
            "label",
            { htmlFor: "email", style: { display: "block" } },
            "Email"
          ),
          React.createElement("input", {
            type: "email",
            placeholder: "Enter Email",
            autoComplete: "off",
            name: "email",
            style: {
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            },
            onChange: (e) => setEmail(e.target.value),
          })
        ),

        React.createElement(
          "div",
          { style: { marginBottom: "15px" } },
          React.createElement(
            "label",
            { htmlFor: "password", style: { display: "block" } },
            "Password"
          ),
          React.createElement("input", {
            type: "password",
            placeholder: "Enter Password",
            name: "password",
            style: {
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            },
            onChange: (e) => setPassword(e.target.value),
          })
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            style: {
              width: "100%",
              padding: "12px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            },
          },
          "Login"
        ),

        React.createElement(
          "p",
          { style: { textAlign: "center", marginTop: "15px" } },
          "Don't have an account?"
        ),

        React.createElement(
          Link,
          {
            to: "/register",
            style: {
              display: "block",
              textAlign: "center",
              marginTop: "10px",
              color: "#007bff",
              textDecoration: "none",
            },
          },
          "Register"
        )
      )
    )
  );
}

export default Login;
