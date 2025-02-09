const pool = require("../config/db");

const User = {
    async findByEmail(email) {
        try {
            const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            return result.rows[0]; // Return the first matching user
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw error;
        }
    },

    async createUser(username, age, gender, preference, area_of_interest, learning_goal, email, password) {
        try {
            const result = await pool.query(
                `INSERT INTO users (username, age, gender, preference, area_of_interest, learning_goal, email, password) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *`, 
                [username, age, gender, preference, area_of_interest, learning_goal, email, password]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async getUserDetails(userId) {
        try {
            const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
            return result.rows[0]; // Return the user details
        } catch (error) {
            console.error("Error getting user details:", error);
            throw error;
        }
    }
};

module.exports = User;
