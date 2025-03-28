import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

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
      .post("http://localhost:3001/register", { email, name, password })
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
        "Register"
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
            { htmlFor: "email", style: { display: "block" } },
            "Name"
          ),
          React.createElement("input", {
            type: "name",
            placeholder: "Enter Name: ",
            autoComplete: "off",
            name: "name",
            style: {
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            },
            onChange: (e) => setName(e.target.value),
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
          "div",
          { style: { marginBottom: "15px" } },
          React.createElement(
            "label",
            { htmlFor: "confirmPassword", style: { display: "block" } },
            "Confirm Password"
          ),
          React.createElement("input", {
            type: "password",
            placeholder: "Confirm Password",
            name: "confirmPassword",
            style: {
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            },
            onChange: (e) => setConfirmPassword(e.target.value),
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
          "Register"
        ),

        React.createElement(
          "p",
          { style: { textAlign: "center", marginTop: "15px" } },
          "Already have an account?"
        ),

        React.createElement(
          Link,
          {
            to: "/login",
            style: {
              display: "block",
              textAlign: "center",
              marginTop: "10px",
              color: "#007bff",
              textDecoration: "none",
            },
          },
          "Login"
        )
      )
    )
  );
}

export default Register;
