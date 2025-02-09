import React, { useState, useEffect } from 'react';
import { getUserDetailsWithComprehensiveAnalysis } from '../api'; // Import the new API request
import '../styles/Profile.css';

const Profile = ({ userId }) => {
    const [userDetails, setUserDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId) {
                setError('User ID is missing.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await getUserDetailsWithComprehensiveAnalysis(userId); // Fetch user details with analysis
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError('Failed to fetch user details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    if (loading) return <div>Loading user details...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            {userDetails ? (
                <div className="profile-content">
                    <section className="profile-section">
                        <h2>Personal Information</h2>
                        <div className="profile-item">
                            <i className="fas fa-user"></i>
                            <span><strong>Name:</strong> {userDetails.username}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-envelope"></i>
                            <span><strong>Email:</strong> {userDetails.email}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-user-graduate"></i>
                            <span><strong>Learning Style:</strong> {userDetails.learning_style}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-bullseye"></i>
                            <span><strong>Learning Goals:</strong> {userDetails.learning_goal}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-heart"></i>
                            <span><strong>Areas of Interest:</strong> {userDetails.area_of_interest}</span>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h2>Course Statistics</h2>
                        <div className="profile-item">
                            <i className="fas fa-book"></i>
                            <span><strong>Total Courses Enrolled:</strong> {userDetails.course_count}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-chart-line"></i>
                            <span><strong>Average Progress:</strong> {userDetails.avg_progress}%</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-star"></i>
                            <span><strong>Average Rating:</strong> {userDetails.avg_rating}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-clock"></i>
                            <span><strong>Time Spent:</strong> {userDetails.time_spent} hours</span>
                        </div>
                        <div className="profile-item">
                            <i className="fas fa-fire"></i>
                            <span><strong>Engagement Score:</strong> {userDetails.engagement_score}</span>
                        </div>
                    </section>

                    <section className="profile-section">
                        <h2>Course Categories</h2>
                        <ul className="profile-categories">
                            {userDetails.course_categories && userDetails.course_categories.length > 0 ? (
                                userDetails.course_categories.map((category, index) => (
                                    <li key={index}>
                                        <i className="fas fa-tag"></i>
                                        <span>{category.category}: {category.category_count} courses</span>
                                    </li>
                                ))
                            ) : (
                                <li>No course categories available.</li>
                            )}
                        </ul>
                    </section>
                </div>
            ) : (
                <p>No user details available.</p>
            )}
        </div>
    );
};

export default Profile;
