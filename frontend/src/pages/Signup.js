import React, { useState } from "react";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Signup.css';

const Signup = () => {
    const [username, setUsername] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [preference, setPreference] = useState("");
    const [area_of_interest, setAreaOfInterest] = useState("");
    const [learning_goal, setLearningGoal] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register({
                username,
                age,
                gender,
                preference,
                area_of_interest,
                learning_goal,
                email,
                password,
            });
            setSuccess(true);
            setUsername("");
            setAge("");
            setGender("");
            setPreference("");
            setAreaOfInterest("");
            setLearningGoal("");
            setEmail("");
            setPassword("");
            setError("");
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">User Registered Successfully!</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Age:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Gender:</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Preference:</label>
                    <input
                        type="text"
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Area of Interest:</label>
                    <input
                        type="text"
                        value={area_of_interest}
                        onChange={(e) => setAreaOfInterest(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Learning Goals:</label>
                    <input
                        type="text"
                        value={learning_goal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Signup;
