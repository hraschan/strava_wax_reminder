// Mysql connection configuration

const mysql = require("mysql2/promise");
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "admin";
const DB_NAME = process.env.DB_NAME || "strava";

// create the connection to database
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  multipleStatements: true,
  charset: "utf8mb4",
  decimalNumbers: true,
});

pool
  .getConnection()
  .then((conn) => {
    const res = conn.query("SELECT 1");
    conn.release();
    return res;
  })
  .then((results) => {
    console.log("Connected to MySQL DB");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = pool;
