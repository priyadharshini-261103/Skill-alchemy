import React, { useState, useEffect } from 'react';
import { getRecommendations, getCourses, enrollCourse, getEnrolledCourses } from '../api';
import '../styles/Home.css';
import { Link } from 'react-router-dom';


const Home = ({ userId }) => {
    const [courses, setCourses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [recommendType, setRecommendType] = useState('hybrid');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        const fetchRecommendationsAndCourses = async () => {
            console.log('User ID:', userId);
            console.log('Recommend Type:', recommendType);
            if (!userId || !recommendType) {
                setError('User ID and recommend type are required.');
                return;
            }
            try {
                setLoading(true);
                const recResponse = await getRecommendations(userId, recommendType);
                const recommendationsData = recResponse.data?.recommendations || [];
                setRecommendations(recommendationsData.map(rec => ({
                    course_id: rec[0],
                    course_name: rec[1],
                    category: rec[2],
                    difficulty: rec[3],
                    youtube_link: rec[4],
                    course_description: rec[5]
                })));
                const courseResponse = await getCourses();
                setCourses(courseResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendationsAndCourses();
    }, [userId, recommendType]);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const enrolledResponse = await getEnrolledCourses(userId);
                setEnrolledCourses(enrolledResponse.data);
            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
            }
        };

        fetchEnrolledCourses();
    }, [userId]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleEnroll = async (courseId) => {
        try {
            await enrollCourse(userId, courseId);
            setEnrolledCourses([...enrolledCourses, courses.find(course => course.course_id === courseId)]);
            setRecommendations(recommendations.filter(course => course.course_id !== courseId));
        } catch (error) {
            console.error('Error enrolling in course:', error);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === '' || course.category === selectedCategory)
    );

    const popularCourses = courses.sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    const featuredCourse = courses.length > 0 ? courses[0] : null;

    if (loading) return <div>Loading data...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="home-container">
            <h2>All Courses:</h2>
            <input
                type="text"
                placeholder="Search courses by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-bar"
            />
            <select value={selectedCategory} onChange={handleCategoryChange} className="category-filter">
                <option value="">All Categories</option>
                {Array.from(new Set(courses.map(course => course.category))).map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
            <div className="courses-grid">
                {filteredCourses.map((course) => (
                    <div key={course.course_id} className="course-box">
                        <h3>{course.course_name}</h3>
                        <p>Category: {course.category}</p>
                        <p>Difficulty: {course.difficulty}</p>
                        {enrolledCourses.some(enrolled => enrolled.course_id === course.course_id) ? (
                            <Link to={`/course/${course.course_id}?userId=${userId}`} className="go-to-course">Go to Course</Link>
                        ) : (
                            <button className="enroll-button" onClick={() => handleEnroll(course.course_id)}>Enroll</button>
                        )}
                    </div>
                ))}
            </div>
            <h2>Recommended Courses:</h2>
            {recommendations.length > 0 ? (
                <div className="courses-grid">
                    {recommendations.map((course, index) => (
                        <div key={index} className="course-box">
                            <h3>{course.course_name}</h3>
                            <p>Category: {course.category}</p>
                            <p>Difficulty: {course.difficulty}</p>
                            {enrolledCourses.some(enrolled => enrolled.course_id === course.course_id) ? (
                                <Link to={`/course/${course.course_id}?userId=${userId}`} className="go-to-course">Go to Course</Link>
                            ) : (
                                <button className="enroll-button" onClick={() => handleEnroll(course.course_id)}>Enroll</button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No recommendations available.</p>
            )}
            <h2>Popular Courses:</h2>
            <div className="courses-grid">
                {popularCourses.map((course) => (
                    <div key={course.course_id} className="course-box">
                        <h3>{course.course_name}</h3>
                        <p>Category: {course.category}</p>
                        <p>Popularity: {course.popularity}</p>
                        {enrolledCourses.some(enrolled => enrolled.course_id === course.course_id) ? (
                            <Link to={`/course/${course.course_id}?userId=${userId}`} className="go-to-course">Go to Course</Link>
                        ) : (
                            <button className="enroll-button" onClick={() => handleEnroll(course.course_id)}>Enroll</button>
                        )}
                    </div>
                ))}
            </div>
            <h2>Featured Course:</h2>
            {featuredCourse && (
                <div className="featured-course">
                    <h3>{featuredCourse.course_name}</h3>
                    <p>{featuredCourse.course_description}</p>
                    {enrolledCourses.some(enrolled => enrolled.course_id === featuredCourse.course_id) ? (
                        <Link to={`/course/${featuredCourse.course_id}?userId=${userId}`} className="go-to-course">Go to Course</Link>
                    ) : (
                        <button className="enroll-button" onClick={() => handleEnroll(featuredCourse.course_id)}>Enroll</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
