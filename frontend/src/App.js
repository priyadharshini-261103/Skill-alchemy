import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Page from './pages/Page';
import CoursePage from './pages/CoursePage';
//import "./styles/App.css";

const App = () => {
    const [userId, setUserId] = useState(null); // Store userId from login or token

    const handleLogout = () => {
        setUserId(null); // Clear userId on logout
        window.location.reload(); // Refresh the page
        // navigate to login page
    };

    return (
        <Router>
            <div className="app-container"> {/* Keep styles intact */}
                <Navbar userId={userId} onLogout={handleLogout} />
                <main className="content"> {/* Ensure styles are applied properly */}
                    <Routes>
                        <Route path="/" element={<Page />} />
                        <Route path="/login" element={<Login setUserId={setUserId} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/home" element={<Home userId={userId} />} />
                        <Route path="/profile" element={<Profile userId={userId} />} />
                        <Route path="/dashboard" element={<Dashboard userId={userId} />} />
                        <Route path="/course/:courseId" element={<CoursePage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
