import React, { useState, useEffect } from 'react';
import { getEnrolledCourses, getRecommendations, enrollCourse } from '../api'; // Import the API request
import '../styles/Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = ({ userId }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userId) {
                setError('User ID is missing.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const enrolledResponse = await getEnrolledCourses(userId); // Fetch enrolled courses
                setEnrolledCourses(enrolledResponse.data);

                const recommendResponse = await getRecommendations(userId, 'hybrid'); // Fetch recommended courses
                const recommendationsData = recommendResponse.data?.recommendations || [];
                setRecommendedCourses(recommendationsData.map(rec => ({
                    course_id: rec[0],
                    course_name: rec[1],
                    category: rec[2],
                    difficulty: rec[3],
                    youtube_link: rec[4],
                    course_description: rec[5]
                })));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to fetch dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]);

    const handleEnroll = async (courseId) => {
        try {
            await enrollCourse(userId, courseId);
            // Check if the course is already enrolled
            if (!enrolledCourses.some(course => course.course_id === courseId)) {
                setEnrolledCourses([...enrolledCourses, { 
                    course_id: courseId, 
                    course_name: recommendedCourses.find(course => course.course_id === courseId).course_name 
                }]);
            }
            // Remove the course from recommendations
            setRecommendedCourses(recommendedCourses.filter(course => course.course_id !== courseId));
        } catch (error) {
            console.error('Error enrolling in course:', error);
        }
    };

    const totalProgress = enrolledCourses.reduce((acc, course) => acc + course.progress, 0);
    const averageProgress = enrolledCourses.length > 0 ? (totalProgress / enrolledCourses.length).toFixed(2) : 0;

    if (loading) return <div>Loading dashboard data...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <section className="dashboard-section">
                <h2>Learning Goals:</h2>
                <p>Achieve proficiency in web development by completing advanced courses in JavaScript, React, and Node.js.</p>
            </section>

            <section className="dashboard-section">
                <h2>Enrolled Courses:</h2>
                {enrolledCourses.length > 0 ? (
                    <>
                        <div className="courses-grid">
                            {enrolledCourses.map((course) => (
                                <div key={course.course_id} className="course-box">
                                    <h3>{course.course_name}</h3>
                                    <p>Progress: {course.progress}%</p>
                                    <a href={`/course/${course.course_id}?userId=${userId}`} className="go-to-course">Go to Course</a>
                                </div>
                            ))}
                        </div>
                        <p>Average Progress: {averageProgress}%</p>
                    </>
                ) : (
                    <p>No enrolled courses available. Start by exploring and enrolling in some courses!</p>
                )}
            </section>

            <section className="dashboard-section">
                <h2>Recommended Courses:</h2>
                {recommendedCourses.length > 0 ? (
                    <div className="courses-grid">
                        {recommendedCourses.map((course, index) => (
                            <div key={index} className="course-box">
                                <h3>{course.course_name}</h3>
                                <p>Category: {course.category}</p>
                                <p>Difficulty: {course.difficulty}</p>
                                {enrolledCourses.some(enrolled => enrolled.course_id === course.course_id) ? (
                                    <a href={`/course/${course.course_id}?userId=${userId}`} className="go-to-course">Go to Course</a>
                                ) : (
                                    <button className="enroll-button" onClick={() => handleEnroll(course.course_id)}>Enroll</button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recommendations available.</p>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
