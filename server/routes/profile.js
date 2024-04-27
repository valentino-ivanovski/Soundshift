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

                res.render('profile', { userr: results[0], likedSongs: songs,  submittedSongs: submittedSongs });

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
    const userId = req.body.id;
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

module.exports = router; //exporting the module for users