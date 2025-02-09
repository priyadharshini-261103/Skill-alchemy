import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import "../styles/Login.css";

const Login = ({ setUserId }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login({ email, password });
            console.log('Login successful:', response.data); // Log the response for debugging purposes
            const userId = response.data.user.id;
            setUserId(userId); // Set userId after successful login
            navigate('/home'); // Redirect to home page
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="login-container"> {/* Add the class here */}
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Email:
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
