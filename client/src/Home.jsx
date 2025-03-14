import React from 'react';
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };
    const handleLogin = () => {
        navigate('/login');

    };
    const handleRegister = () => {
        navigate('/register');

    };



    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <h2>Welcome</h2>
                <button onClick={handleLogout} className="btn btn-danger w-100 rounded-0">
                    Logout
                </button>

                <button 
                    onClick={handleLogin} 
                    className="btn btn-success rounded-0"
                    style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                    Login
                </button>
                <button 
                    onClick={handleRegister} 
                    className="btn btn-success w = 100 rounded-0"
                    style={{ position: "absolute", top: "10px", left: "10px" }}
                >
                    Register
                </button>
                
            </div>
        </div>
    );
}

export default Home;
