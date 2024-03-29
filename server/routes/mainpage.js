const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("mainpage route reached");
    res.render("mainpage");
})

router.post('/submitsong', (req, res) => {
    const { songTitle, artistName, genre } = req.body; //extract data from request body
    const userId = req.session.user.id; //retrieve user ID from session
    const explicit = req.body.explicit === 'on'; //true if checked, false otherwise

    //check if the song already exists
    dbConn.checkSongExists(songTitle, artistName, (err, exists) => {
        if (err) {
            console.error('Error checking song:', err);
            res.status(500).send('Error checking song');
        } else {
            if (exists) {
                //song already exists, send an error message
                res.render('mainpage', { errorSongExists: "Song already exists." });
            } else {
                //song doesn't exist, insert it into the database
                dbConn.insertSong(songTitle, artistName, userId, genre, explicit, (err) => {
                    if (err) {
                        console.error('Error submitting song:', err);
                        res.status(500).send('Error submitting song');
                    } else {
                        console.log("Successfully sent song.");
                        res.render('mainpage', { errorSongExists: "Song Submitted!" });
                    }
                });
            }
        }
    });
});

router.post("/getrandomsong", (req, res) => {
    //retrieve genre and explicit from the request body
    const genre = req.body.genre;
    const explicit = req.body.explicit;

    if (genre === "Any") {
        dbConn.getRandomSongAny(explicit, (error, song) => {
            if (error) {
                console.error("Error retrieving random song:", error);
                res.status(500).json({
                    error: "An error occurred while retrieving the random song.",
                });
            } else {
                //send the retrieved song as the response
                res.json(song);
                console.log(song);
            }
        });

        //DODAJ ZA EXPLICIT DA BIRAT I EXPLICIT I NON EXPLICIT A KO KE E UNCHECKED, TOGAS DA E SAMO NON EXPLICIT

    } else {
        dbConn.getRandomSong(genre, explicit, (error, song) => {
            if (error) {
                console.error("Error retrieving random song:", error);
                res.status(500).json({
                    error: "An error occurred while retrieving the random song.",
                });
            } else {
                //send the retrieved song as the response
                res.json(song);
                console.log(song);
            }
        });
    }
});

router.post('/updateUserLocation', (req, res) => {
    const location = req.body.location; // Retrieve location from request body
    const userId = req.session.user.id; // Assuming you also need userId

    dbConn.updateLocation(location, userId, (err) => {
        if (err) {
            console.error('Error updating location:', err);
            res.status(500).send('Error updating location');
        } else {
            res.status(200).send('Location updated');
        }
    });

});

router.post('/updateLikeCount', (req, res) => {
    const songId = req.body.songid; // Retrieve songId from request body
    const userId = req.session.user.id; // Assuming you also need userId

    dbConn.incrementLikeCount(songId, (err) => {
        if (err) {
            console.error('Error updating like count:', err);
            return res.status(500).send('Error updating like count');
        }

        dbConn.recordLike(songId, userId, (err) => {
            if (err) {
                console.error('Error recording like:', err);
                return res.status(500).send('Error recording like');
            } 

            res.status(200).send('Like count updated and like recorded');
        });
    });
});

router.post('/checkIfUserLiked', (req, res) => {
    const songId = req.body.songid;
    const userId = req.session.user.id;

    dbConn.checkIfUserLiked(songId, userId, (err, liked) => {
        if (err) {
            console.error('Error checking if user liked:', err);
            return res.status(500).send('Error checking if user liked');
        }
        res.json({ liked: liked });
    });
});


router.post

module.exports = router; //exporting the module for users