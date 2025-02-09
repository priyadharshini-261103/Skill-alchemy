const express = require("express");
const ai_model = require("../models/ai_model");
const router = express.Router();

router.get("/:type/:userId", async (req, res) => {
    const { type, userId } = req.params;

    // Ensure both type and userId are valid
    if (!type || !userId) {
        return res.status(400).json({ message: "Type and User ID are required" });
    }

    try {
        // Logic to get recommendations based on type and userId
        console.log(`Getting recommendations for Type: ${type}, User ID: ${userId}`);
        const recommendations = await ai_model.getRecommendations(type, userId);
        console.log(`Recommendations for User ID: ${userId}`, recommendations);
        res.json(recommendations);
    } catch (error) {
        console.error("Error getting recommendations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
