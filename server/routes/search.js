const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn');

router.get('/', (req, res) => {
    console.log("profile route reached");
    res.render("search");
})

router.get('/songResults/:query', (req, res) => {
    const query = req.params.query;

    dbConn.searchSongs(query, (err, songs) => {
        if (err) {
            console.error("Error fetching songs:", err);
            return res.status(500).send("Error fetching songs");
        }
        res.json(songs);
    });
});

router.get('/userResults/:query', (req, res) => {
    const query = req.params.query;

    dbConn.searchUsers(query, (err, users) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).send("Error fetching users");
        }
        res.json(users);
    });
});

module.exports = router;