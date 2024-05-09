const mysql = require("mysql");
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "SoundshiftTest",
});
const async = require('async');

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
function insertSong(title, artist, userId, genre, explicit, retrLocation, callback) {
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
            (title, artist, genre, yt_link, spotify_link, soundcloud_link, user_id, upload_date, like_count, comment_count, explicit, retrLocation) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, ?, ?)
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
        retrLocation,
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
        SELECT songsNew.*, usersNew.username, usersNew.location 
        FROM songsNew 
        LEFT JOIN usersNew ON songsNew.user_id = usersNew.id 
        WHERE songsNew.genre = ? AND songsNew.explicit = 0
        ORDER BY RAND() 
        LIMIT 1
    `;
    } else {
        sql = `
        SELECT songsNew.*, usersNew.username, usersNew.location 
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
    const sql = `SELECT comments.*, usersNew.username 
                FROM comments 
                INNER JOIN usersNew 
                ON comments.user_id = usersNew.id 
                WHERE song_id = ?`; //FIX TH8IS THERE IS A BUG

    conn.query(sql, [songId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

function addComment(songId, userId, comment, callback) {
    const sql = `INSERT INTO comments (song_id, user_id, content) VALUES (?, ?, ?)`;
    conn.query(sql, [songId, userId, comment], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully added comment:", results.affectedRows);
            callback(null);
        }
    });
}

function reportComment(userId, reason, commentId, callback) {
    const sql = `INSERT INTO reports (user_id, reason, comment_id) VALUES (?, ?, ?)`;
    conn.query(sql, [userId, reason, commentId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully reported comment:", results.affectedRows);
            callback(null);
        }
    });
}

function deleteComment(commentId, callback) {
    const sql = `DELETE FROM comments WHERE comment_id = ?`;
    conn.query(sql, [commentId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully deleted comment:", results.affectedRows);
            callback(null);
        }
    });
}

function getUserData(userId, callback) {
    const sql = `SELECT * FROM usersNew WHERE id = ?`;
    conn.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched user data:", results);
            callback(null, results);
        }
    });
}

function updateBio(userId, newBio, callback) {
    const sql = `UPDATE usersNew SET bio = ? WHERE id = ?`;
    conn.query(sql, [newBio, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully updated bio:", results.affectedRows);
            callback(null);
        }
    });
}

function updateSpotify(userId, newSpotify, callback) {
    const sql = `UPDATE usersNew SET spotify_link = ? WHERE id = ?`;
    conn.query(sql, [newSpotify, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully updated Spotify link:",
                results.affectedRows
            );
            callback(null);
        }
    });
}

function updateAM(userId, newAM, callback) {
    const sql = `UPDATE usersNew SET applemusic_link = ? WHERE id = ?`;
    conn.query(sql, [newAM, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully updated AM link:", results.affectedRows);
            callback(null);
        }
    });
}

function updateSoundcloud(userId, newSoundcloud, callback) {
    const sql = `UPDATE usersNew SET soundcloud_link = ? WHERE id = ?`;
    conn.query(sql, [newSoundcloud, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully updated Soundcloud link:",
                results.affectedRows
            );
            callback(null);
        }
    });
}

function getLikedSongs(userId, callback) {
    const query = `
        SELECT songsNew.*
        FROM liked_songs
        LEFT JOIN songsNew ON liked_songs.song_id = songsNew.song_id
        WHERE liked_songs.user_id = ?
        ORDER BY songsNew.upload_date DESC
    `;

    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched liked songs:", results.length);
            callback(null, results);
        }
    });
}

function getSubmittedSongs(userId, callback) {
    const query = `SELECT * FROM songsNew WHERE user_id = ? ORDER BY songsNew.upload_date DESC`;

    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully fetched submitted songs:",
                results.length
            );
            callback(null, results);
        }
    });
}

function storeRetrievedSong(songId, userId, retrievalDate, callback) {
    const query = `INSERT INTO retrievedSongs (song_id, user_id, retrieval_date) VALUES (?, ?, ?)`;

    conn.query(query, [songId, userId, retrievalDate], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully stored retrieved song:",
                results.affectedRows
            );
            callback(null);
        }
    });
}

function getRetrievedSongs(userId, callback){
    const query = `
    SELECT retrievedSongs.*, songsNew.title, songsNew.artist, songsNew.spotify_link 
    FROM retrievedSongs 
    LEFT JOIN songsNew ON retrievedSongs.song_id = songsNew.song_id 
    WHERE retrievedSongs.user_id = ? 
    ORDER BY retrieval_date DESC
    LIMIT 50`;

    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log(
                "Successfully fetched retrieved songs:",
                results.length
            );
            console.log("====================================");
            callback(null, results);
        }
    });
}

function getUserByUsername(username, callback) {
    const query = `SELECT * FROM usersNew WHERE username = ?`;

    conn.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            callback(null, results[0]);
        }
    });
}

function updateProfilePicture(userId, imageUrl, callback) {
    const query = `UPDATE usersNew SET imageUrl = ? WHERE id = ?`;

    conn.query(query, [imageUrl, userId], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
            console.log("Error updating profile picture:", err);
        } else {
            console.log(
                "Successfully updated profile picture:",
                results.affectedRows
            );
            callback(null, results);
        }
    });
}

function searchSongs(query, callback) {
    const sql = `SELECT * FROM songsNew WHERE title LIKE ? OR artist LIKE ? ORDER BY title`;

    conn.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched search results:", results.length);
            callback(null, results);
        }
    });
}

function searchUsers(query, callback) {
    const sql = `SELECT * FROM usersNew WHERE username LIKE ? OR id LIKE ? ORDER BY username`;

    conn.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched search results:", results.length);
            callback(null, results);
        }
    });
}

function getUsers(callback) {
    const sql = `SELECT * FROM usersNew ORDER BY id`;

    conn.query(sql, (err, results) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            callback(err);
        } else {
            console.log("Successfully fetched all users:", results.length);
            callback(null, results);
        }
    });
}

function deleteUser(userId, callback) {
    conn.beginTransaction(function(err) {
        if (err) { callback(err); return; }

        async.series([
            function(callback) {
                const sql = `DELETE FROM comments WHERE user_id = ?`;
                conn.query(sql, [userId], callback);
            },
            function(callback) {
                const sql = `DELETE FROM liked_songs WHERE user_id = ?`;
                conn.query(sql, [userId], callback);
            },
            function(callback) {
                const sql = `DELETE FROM reports WHERE user_id = ?`;
                conn.query(sql, [userId], callback);
            },
            function(callback) {
                const sql = `DELETE FROM retrievedSongs WHERE user_id = ?`;
                conn.query(sql, [userId], callback);
            },
            function(callback) {
                const sql = `DELETE FROM songsNew WHERE user_id = ?`;
                conn.query(sql, [userId], callback);
            },
            function(callback) {
                const sql = `DELETE FROM usersNew WHERE id = ?`;
                conn.query(sql, [userId], callback);
            }
        ], function(err, results) {
            if (err) {
                console.error("Error deleting user:", err);
                conn.rollback(function() {
                    callback(err);
                });
            } else {
                console.log("Successfully deleted user with id:", userId);
                conn.commit(function(err) {
                    if (err) {
                        conn.rollback(function() {
                            callback(err);
                        });
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    });
}

function makeAdmin(username, callback) {
    const sql = `UPDATE usersNew SET admin = 1 WHERE username = ?`;

    conn.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Error making user admin:", err);
            callback(err);
        } else {
            console.log("Successfully made user admin:", username);
            callback(null, results);
        }
    });
}

function removeAdmin(username, callback) {
    const sql = `UPDATE usersNew SET admin = 0 WHERE username = ?`;

    conn.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Error removing admin status:", err);
            callback(err);
        } else {
            console.log("Successfully removed admin status:", username);
            callback(null, results);
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
    addComment,
    reportComment,
    deleteComment,
    getUserData,
    updateBio,
    updateSpotify,
    updateAM,
    updateSoundcloud,
    getLikedSongs,
    getSubmittedSongs,
    storeRetrievedSong,
    getRetrievedSongs,
    getUserByUsername,
    updateProfilePicture,
    searchSongs,
    searchUsers,
    getUsers,
    makeAdmin,
    removeAdmin,
    deleteUser
};
