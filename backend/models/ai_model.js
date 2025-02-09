const axios = require("axios");

const AI_API_URL = "http://localhost:5001";

const ai_model = {
    async getRecommendations(type, userId) {
        try {
            console.log(`Fetching recommendations from AI Model... Type: ${type}, User ID: ${userId}`);
            const response = await axios.get(`${AI_API_URL}/recommend/${type}/${userId}`);
            console.log('Response data:', response.data);
            return response.data;
        } catch (error) {
            console.error("AI Model Error:", error);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data: ${error.response.data}`);
            } else if (error.request) {
                console.error(`No response received: ${error.request}`);
            } else {
                console.error(`Error in request setup: ${error.message}`);
            }
            throw new Error("Error fetching AI-based recommendations");
        }
    },
};

module.exports = ai_model;
