const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// 🔹 Get All Courses
router.get("/courses", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM courses");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Error fetching courses" });
    }
});

// 🔹 Update Progress
router.post('/updateProgress', async (req, res) => {
    const { userId, courseId, progress, rating, difficulty, learningStyle, timeSpent, engagementScore } = req.body;
    try {
        // Ensure all required fields are available
        if (!userId || !courseId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Update interactions table
        const interactionsResult = await pool.query(
            `UPDATE interactions 
            SET progress = $1, completion_date = NOW() 
            WHERE user_id = $2 AND course_id = $3`, 
            [progress, userId, courseId]
        );

        if (interactionsResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Interaction not found' });
        }

        // Update user_data table
        const userDataResult = await pool.query(
            `UPDATE user_data 
            SET progress = $1, rating = $2, difficulty = $3, learning_style = $4, 
                time_spent = $5, engagement_score = $6, last_updated = NOW() 
            WHERE user_id = $7`, 
            [progress, rating, difficulty, learningStyle, timeSpent, engagementScore, userId]
        );

        if (userDataResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'User data not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ success: false, error: 'Error updating progress' });
    }
});

// 🔹 Get Course Details
router.get('/getCourseDetails', async (req, res) => {
    const { courseId } = req.query; // Accessing query parameters here
    try {
        // Fetch course details from the database
        const courseDetails = await pool.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
        const courseData = courseDetails.rows[0]; // Get the first row (assuming the courseId is unique)

        if (!courseData) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({
            videoUrl: courseData.youtube_link, // Assuming youtube_link is the correct column for video URL
            courseContent: courseData.course_description, // Assuming course_description is where content is stored
        });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
