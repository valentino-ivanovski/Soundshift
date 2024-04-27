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
        console.log("welcome, " + results[0].username);
    });
});

module.exports = router; //exporting the module for users