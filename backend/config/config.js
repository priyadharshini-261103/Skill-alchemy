require("dotenv").config();

module.exports = {
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
    },
    jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
};
