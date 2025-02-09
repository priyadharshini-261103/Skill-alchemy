const express = require("express");
const User = require("../models/User");
const pool = require("../config/db");

const router = express.Router();

// 🔹 Get User Details
router.get("/user_details", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const userDetails = await User.getUserDetails(userId);
        res.json(userDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user details" });
    }
});

// Enroll in a course
router.post("/enroll", async (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({ message: "User ID and Course ID are required" });
    }
    try {
        await pool.query(
            "INSERT INTO interactions (user_id, course_id, progress, rating) VALUES ($1, $2, 0, 1)",
            [userId, courseId]
        );
        res.status(200).json({ message: "Course enrolled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error enrolling in course" });
    }
});

// Get enrolled courses with YouTube links
router.get("/enrolled_courses", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const result = await pool.query(
            `SELECT c.course_id, c.course_name, c.youtube_link, i.progress 
            FROM interactions i 
            JOIN courses c ON i.course_id = c.course_id 
            WHERE i.user_id = $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching enrolled courses" });
    }
});

// 🔹 Get User Details with Comprehensive Analysis
router.get("/user_details_with_comprehensive_analysis", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const userDetails = await User.getUserDetails(userId);

        const interactionAnalysis = await pool.query(
            `SELECT COUNT(i.course_id) as course_count, AVG(i.progress) as avg_progress, AVG(i.rating) as avg_rating 
            FROM interactions i 
            WHERE i.user_id = $1`,
            [userId]
        );

        const learningStyleData = await pool.query(
            `SELECT learning_style, time_spent, engagement_score 
            FROM user_data 
            WHERE user_id = $1`,
            [userId]
        );

        const courseCategories = await pool.query(
            `SELECT c.category, COUNT(i.course_id) as category_count 
            FROM interactions i 
            JOIN courses c ON i.course_id = c.course_id 
            WHERE i.user_id = $1 
            GROUP BY c.category`,
            [userId]
        );

        const response = {
            ...userDetails,
            course_count: interactionAnalysis.rows[0].course_count,
            avg_progress: interactionAnalysis.rows[0].avg_progress,
            avg_rating: interactionAnalysis.rows[0].avg_rating,
            learning_style: learningStyleData.rows[0].learning_style,
            time_spent: learningStyleData.rows[0].time_spent,
            engagement_score: learningStyleData.rows[0].engagement_score,
            course_categories: courseCategories.rows,
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user details with comprehensive analysis" });
    }
});

module.exports = router;
