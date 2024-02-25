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

// Function to check if a song already exists in the database
const checkSongExists = (title, artist, callback) => {
    const sql = "SELECT COUNT(*) AS count FROM songs WHERE title = ? AND artist = ?";
    conn.query(sql, [title, artist], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            // If count is greater than 0, the song already exists
            callback(null, results[0].count > 0);
        }
    });
};

// Function to insert a new song into the database
function insertSong(title, artist, userId, genre, explicit, callback) {
    // Generate links
    const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}%20${encodeURIComponent(artist)}`;
    const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(title)}%20${encodeURIComponent(artist)}`;
    const soundcloudLink = `https://soundcloud.com/search?q=${encodeURIComponent(title)}%20${encodeURIComponent(artist)}`;

    // Prepare query and data
    const query = `
        INSERT INTO songs 
            (title, artist, genre, yt_link, spotify_link, soundcloud_link, user_id, upload_date, like_count, comment_count, explicit) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, ?)
    `;
    const data = [title, artist, genre, ytLink, spotifyLink, soundcloudLink, userId, explicit];

    // Execute query
    conn.query(query, data, (error, results) => {
        if (error) {
            console.error('Error inserting song:', error);
            callback('Error inserting song into the database');
            return;
        }
        callback(null);
    });
}






module.exports = {
    insertUser,
    checkUserCredentials,
    checkUsernameExists,
    insertSong,
    checkSongExists
    // Other database-related functions
};