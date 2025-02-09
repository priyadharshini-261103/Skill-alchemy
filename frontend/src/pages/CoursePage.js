import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getCourseDetails } from '../api/index.js';
import "../styles/CoursePage.css";

const CoursePage = () => {
    const { courseId } = useParams(); // Get courseId from the URL
    const location = useLocation();
    const navigate = useNavigate();
    const [courseName, setCourseName] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState(''); // Store video URL
    const [pdfUrl, setPdfUrl] = useState(''); // Store PDF URL
    const [progress, setProgress] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [watchDuration, setWatchDuration] = useState(0);
    const [rating, setRating] = useState(0);
    const [difficulty, setDifficulty] = useState('');
    const [learningStyle, setLearningStyle] = useState('');
    const [engagementScore, setEngagementScore] = useState(0);

    // Function to convert YouTube URL to embed URL
    const convertToEmbedUrl = (url) => {
        let videoId = '';

        // Extract video ID from different YouTube URL formats
        if (url.includes('youtube.com/watch')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/live/')) {
            videoId = url.split('youtube.com/live/')[1]?.split('?')[0];
        } else {
            videoId = url;
        }

        return `https://www.youtube.com/embed/${videoId}`;
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const userIdFromParams = searchParams.get('userId');

        const fetchCourseDetails = async () => {
            if (courseId && userIdFromParams) {
                try {
                    const response = await getCourseDetails(courseId, userIdFromParams);
                    setCourseName(response.data.courseName);
                    setVideoUrl(convertToEmbedUrl(response.data.videoUrl));
                    setPdfUrl(response.data.pdfUrl); // Set the PDF URL
                    setContent(response.data.courseContent);
                } catch (error) {
                    console.error('Error fetching course details:', error);
                }
            }
        };

        fetchCourseDetails();
    }, [courseId, location.search]); // Added location.search to dependency array to ensure userId is re-evaluated

    const handleProgressUpdate = async (completionStatus, watchedTime) => {
        const searchParams = new URLSearchParams(location.search);
        const userIdFromParams = searchParams.get('userId');

        try {
            const status = await axios.post('http://localhost:5000/course/updateProgress', {
                userId: userIdFromParams,
                courseId,
                progress: completionStatus,
                rating,
                difficulty,
                learningStyle,
                timeSpent: watchedTime,
                engagementScore
            });

            if (status.data.success) {
                setProgress(completionStatus);
                setWatchDuration(watchedTime);
                navigate('/home'); // Redirect to the home page using useNavigate
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleVideoEvents = (event) => {
        switch(event.type) {
            case 'play':
                setStartTime(Date.now());
                break;
            case 'pause':
            case 'ended':
                const endTime = Date.now();
                const timeSpent = Math.round((endTime - startTime) / 1000); // time in seconds
                handleProgressUpdate(progress, watchDuration + timeSpent);
                setStartTime(0); // Reset the start time
                break;
            default:
                break;
        }
    };

    return (
        <div className="course-content">
            <h2>{courseName}</h2>
            <div className="video-container">
                {videoUrl ? (
                    <iframe
                        width="560"
                        height="315"
                        src={videoUrl} // Embed the video from the fetched URL
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Course Video"
                        onPlay={handleVideoEvents}
                        onPause={handleVideoEvents}
                        onEnded={handleVideoEvents}
                    ></iframe>
                ) : (
                    <p>Sorry, the video is unavailable at the moment. Please try again later.</p>
                )}
            </div>
            <div className="pdf-container">
                <h2>PDF</h2>
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="600px"
                        title="Course PDF"
                    ></iframe>
                ) : (
                    <p>Sorry, the PDF is unavailable at the moment. Please try again later.</p>
                )}
            </div>
            <p>{content}</p>
            <div>
                <label>Rating:</label>
                <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div>
                <label>Difficulty:</label>
                <input type="text" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
            </div>
            <div>
                <label>Learning Style:</label>
                <input type="text" value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)} />
            </div>
            <div>
                <label>Engagement Score:</label>
                <input type="number" value={engagementScore} onChange={(e) => setEngagementScore(e.target.value)} />
            </div>
            <div className="progress-bar">
                <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
            </div>
            <button onClick={() => handleProgressUpdate(100, watchDuration)}>Mark as Complete</button>
        </div>
    );
};

export default CoursePage;
