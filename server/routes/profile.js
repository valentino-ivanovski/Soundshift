const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/me', (req, res) => {
    const userId = req.session.user.id;
    console.log(`Profile route reached for user ${userId}`);

    dbConn.getUserData(userId, (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching user data');
        }
        
        res.render('profile', { userr: results[0] });
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

module.exports = router; //exporting the module for users