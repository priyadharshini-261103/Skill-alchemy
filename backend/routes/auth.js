const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");

const router = express.Router();

// 🔹 User Signup
router.post("/register", async (req, res) => {
    try {
        const { username, age, gender, preference, area_of_interest, learning_goal, email, password } = req.body;
        const existingUser = await User.findByEmail(email);
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.createUser(username, age, gender, preference, area_of_interest, learning_goal, email, hashedPassword);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 🔹 User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "1h" });
        res.json({ token, user });
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
