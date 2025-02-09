import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../api";
import "../styles/Page.css";

const Page = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getCourses();
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };
        fetchCourses();
    }, []);

    const handleCourseClick = () => {
        navigate("/login"); // Redirect to login page
    };

    return (
        <div className="page-container">
            {/* Hero Section */}
            <header className="hero-section">
                <h1>SkillAlchemy</h1>
                <p>Turning Ambitions into Mastery</p>
                <button className="explore-btn" onClick={() => navigate("/signup")}>
                    Get Started
                </button>
            </header>

            {/* Available Courses */}
            <section className="courses-section">
                <h2>Explore Our Courses</h2>
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div key={course.course_id} className="course-box" onClick={handleCourseClick}>
                            <h3>{course.course_name}</h3>
                            <p>Category: {course.category}</p>
                            <p>Difficulty: {course.difficulty}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Page;
