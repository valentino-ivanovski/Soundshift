const mysql = require("mysql");
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "SoundshiftTest",
});

conn.connect((err) => {
    if (err) {
        console.error("ERROR: " + err);
        return;
    }
    console.log("Database connection established");
});

const insertUser = (username, email, password, callback) => {
    const sql =
        "INSERT INTO usersNew (username, email, password) VALUES (?, ?, ?)";
    conn.query(sql, [username, email, password], (err, result) => {
        callback(err, result);
    });
};

const checkUserCredentials = (username, password, callback) => {
    const sql = "SELECT * FROM usersNew WHERE username = ? AND password = ?";
    conn.query(sql, [username, password], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            if (results.length === 1) {
                //if a matching user is found, return the user data
                callback(null, results[0]);
            } else {
                //if no matching user is found, return null
                callback(null, null);
            }
        }
    });
};

const checkUsernameExists = (username, email, callback) => {
    const sql =
        "SELECT COUNT(*) AS count FROM usersNew WHERE username = ? OR email = ?";
    conn.query(sql, [username, email], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            //if count is greater than 0, username or email already exists
            callback(null, results[0].count > 0);
        }
    });
};

//function to check if a song already exists in the database
const checkSongExists = (title, artist, callback) => {
    const sql =
        "SELECT COUNT(*) AS count FROM songsNew WHERE title = ? AND artist = ?";
    conn.query(sql, [title, artist], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            //if count is greater than 0, the song already exists
            callback(null, results[0].count > 0);
        }
    });
};

//function to insert a new song into the database
function insertSong(title, artist, userId, genre, explicit, callback) {
    // Generate links
    const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        title
    )}%20${encodeURIComponent(artist)}`;
    const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(
        title
    )}%20${encodeURIComponent(artist)}`;
    const soundcloudLink = `https://soundcloud.com/search?q=${encodeURIComponent(
        title
    )}%20${encodeURIComponent(artist)}`;

    //prepare query and data
    const query = `
        INSERT INTO songsNew 
            (title, artist, genre, yt_link, spotify_link, soundcloud_link, user_id, upload_date, like_count, comment_count, explicit) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, ?)
    `;
    const data = [
        title,
        artist,
        genre,
        ytLink,
        spotifyLink,
        soundcloudLink,
        userId,
        explicit,
    ];

    //execute query
    conn.query(query, data, (error, results) => {
        if (error) {
            console.error("Error inserting song:", error);
            callback("Error inserting song into the database");
            return;
        }
        callback(null);
    });
}

//function to get a random song from the database
function getRandomSong(songGenre, explicit, callback) {
    let sql = ``;
    if (explicit === false) {
        sql = `
        SELECT songsNew.*, usersNew.username 
        FROM songsNew 
        LEFT JOIN usersNew ON songsNew.user_id = usersNew.id 
        WHERE songsNew.genre = ? AND songsNew.explicit = 0
        ORDER BY RAND() 
        LIMIT 1
    `;
    } else {
        sql = `
        SELECT songsNew.*, usersNew.username 
        FROM songsNew 
        LEFT JOIN usersNew ON songsNew.user_id = usersNew.id 
        WHERE songsNew.genre = ? 
        ORDER BY RAND() 
        LIMIT 1
    `;
    }

    conn.query(sql, [songGenre, explicit], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

function getRandomSongAny(explicit, callback) {
    let sql = ``;
    if (explicit === false) {
        sql = `
        SELECT songsNew.*, usersNew.username, usersNew.location 
        FROM songsNew 
        LEFT JOIN usersNew ON songsNew.user_id = usersNew.id 
        WHERE songsNew.explicit = ?
        ORDER BY RAND() 
        LIMIT 1
    `;
    } else {
        sql = `
        SELECT songsNew.*, usersNew.username, usersNew.location 
        FROM songsNew 
        LEFT JOIN usersNew ON songsNew.user_id = usersNew.id 
        ORDER BY RAND() 
        LIMIT 1
    `;
    }
    conn.query(sql, [explicit], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

function updateLocation(location, userId, callback) {
    console.log(
        "Updating location for user:",
        userId,
        "New location:",
        location
    );

    const sql = `UPDATE usersNew SET location = ? WHERE id = ?`;
    conn.query(sql, [location, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Location set successfully. Affected rows:",
                results.affectedRows
            );
            callback(null);
        }
    });
}

function incrementLikeCount(songId, callback) {
    const sql = `UPDATE songsNew SET like_count = like_count + 1 WHERE song_id = ?`;
    conn.query(sql, [songId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully incremented like count:",
                results.affectedRows
            );
            callback(null);
        }
    });
}

function recordLike(songId, userId, callback) {
    const sql = `INSERT INTO liked_songs (song_id, user_id) VALUES (?, ?)`;
    conn.query(sql, [songId, userId], (err, results) => {
        if (err) {
            console.error("Error liking SQL query recordLike():", err);
            callback(err);
        } else {
            console.log("Successfully recorded like:", results.affectedRows);
            callback(null);
        }
    });
}

function checkIfUserLiked(songId, userId, callback) {
    const sql = `SELECT * FROM liked_songs WHERE song_id = ? AND user_id = ?`;
    conn.query(sql, [songId, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully checked if user liked:",
                results.length > 0
            );
            callback(null, results.length > 0);
        }
    });
}

function getCommentsBySongId(songId, callback) {
    const sql =`SELECT comments.*, usersNew.username 
                FROM comments 
                INNER JOIN usersNew 
                ON comments.user_id = usersNew.id 
                WHERE song_id = ?`; //FIX TH8IS THERE IS A BUG

    conn.query(sql, [songId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched comments:", results);
            callback(null, results);
        }
    });
}

function insertComment(songId, userId, comment, callback) {
    const sql = `INSERT INTO comments (song_id, user_id, content) VALUES (?, ?, ?)`;
    conn.query(sql, [songId, userId, comment], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully inserted comment:", results.affectedRows);
            callback(null);
        }
    });
}

function submitReport(userId, reason, repDate, commentId, callback) {
    const formattedDate = repDate.toISOString().slice(0, 19).replace('T', ' ');
    const sql = `INSERT INTO reports (user_id, reason, report_date, comment_id) VALUES (?, ?, ?, ?)`;
    conn.query(sql, [userId, reason, formattedDate, commentId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully submitted report:", results.affectedRows);
            callback(null);
        }
    });
}

module.exports = {
    insertUser,
    checkUserCredentials,
    checkUsernameExists,
    insertSong,
    checkSongExists,
    getRandomSong,
    getRandomSongAny,
    updateLocation,
    incrementLikeCount,
    recordLike,
    checkIfUserLiked,
    getCommentsBySongId,
    insertComment,
    submitReport
};
