const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config.db);

pool.connect()
    .then(() => console.log("✅ PostgreSQL Database Connected!"))
    .catch(err => console.error("❌ Database Connection Error:", err));

module.exports = pool;
