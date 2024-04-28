const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/me', (req, res) => {
    const userId = req.session.user.id;
    console.log(`Profile route reached for user ${userId}`);

    dbConn.getLikedSongs(userId, (err, songs) => {
        if (err) {
            console.error('Error fetching liked songs:', err);
            return res.status(500).send('Error fetching liked songs');
        }

        dbConn.getUserData(userId, (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err);
                return res.status(500).send('Error fetching user data');
            }

            dbConn.getSubmittedSongs(userId, (err, submittedSongs) => {
                if (err) {
                    console.error('Error fetching submitted songs:', err);
                    return res.status(500).send('Error fetching submitted songs');
                }

                dbConn.getRetrievedSongs(userId, (err, retrievedSongs) => {
                    if (err) {
                        console.error('Error fetching retrieved songs:', err);
                        return res.status(500).send('Error fetching retrieved songs');
                    }

                    res.render('profile', { userr: results[0], likedSongs: songs,  submittedSongs: submittedSongs, retrievedSongs: retrievedSongs});
                    
                });

            });
        });
    });
});

router.get('/:username', (req, res) => {
    const username = req.params.username;

    dbConn.getUserByUsername(username, (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user.id;

        dbConn.getLikedSongs(userId, (err, likedSongs) => {
            if (err) {
                console.error('Error fetching liked songs:', err);
                return res.status(500).send('Error fetching liked songs');
            }

            dbConn.getSubmittedSongs(userId, (err, submittedSongs) => {
                if (err) {
                    console.error('Error fetching submitted songs:', err);
                    return res.status(500).send('Error fetching submitted songs');
                }

                dbConn.getRetrievedSongs(userId, (err, retrievedSongs) => {
                    if (err) {
                        console.error('Error fetching retrieved songs:', err);
                        return res.status(500).send('Error fetching retrieved songs');
                    }

                    res.render('otherProfile', { userr: user, likedSongs: likedSongs, submittedSongs: submittedSongs, retrievedSongs: retrievedSongs });
                });
            });
        });
    });
});

router.post('/me/updatebio', function(req, res) {
    const userId = req.body.id;
    const newBio = req.body.bio;
    dbConn.updateBio(userId, newBio, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/profile/me');
        } else {
            res.redirect('/profile/me');
        }
    });
});

router.post('/me/updateSpotify', function(req, res) {
    const userId = req.session.user.id;
    const newSpotify = req.body.spotify;
    dbConn.updateSpotify(userId, newSpotify, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/profile/me');
        } else {
            res.redirect('/profile/me');
        }
    });
});

router.post('/me/updateAM', function(req, res) {
    const userId = req.body.id;
    const newAM = req.body.am;
    dbConn.updateAM(userId, newAM, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/profile/me');
        } else {
            res.redirect('/profile/me');
        }
    });
});

router.post('/me/updateSoundcloud', function(req, res) {
    const userId = req.body.id;
    const newSoundcloud = req.body.soundcloud;
    dbConn.updateSoundcloud(userId, newSoundcloud, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/profile/me');
        } else {
            res.redirect('/profile/me');
        }
    });
});

router.post('/me/update-profile-picture', function(req, res) {
    const userId = req.session.user.id;;
    const newProfilePictureUrl = req.body.imageUrl;
    dbConn.updateProfilePicture(userId, newProfilePictureUrl, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/profile/me');
        } else {
            res.redirect('/profile/me');
        }
    });
});

module.exports = router; //exporting the module for users