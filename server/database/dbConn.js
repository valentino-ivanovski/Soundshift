const mysql = require("mysql");
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'SoundshiftTest'
});

conn.connect((err) => {
    if (err) {
        console.error("ERROR: " + err);
        return;
    }
    console.log('Database connection established');
});

const insertUser = (username, email, password, callback) => {
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    conn.query(sql, [username, email, password], (err, result) => {
        callback(err, result);
    });
};

const checkUserCredentials = (username, password, callback) => {
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    conn.query(sql, [username, password], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            if (results.length === 1) {
                // If a matching user is found, return the user data
                callback(null, results[0]);
            } else {
                // If no matching user is found, return null
                callback(null, null);
            }
        }
    });
};

const checkUsernameExists = (username, email, callback) => {
    const sql = "SELECT COUNT(*) AS count FROM users WHERE username = ? OR email = ?";
    conn.query(sql, [username, email], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            // If count is greater than 0, username or email already exists
            callback(null, results[0].count > 0);
        }
    });
};

module.exports = {
    insertUser,
    checkUserCredentials,
    checkUsernameExists
    // Other database-related functions
};
