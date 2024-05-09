const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("adminSearch route reached");
    res.render("adminSearch");
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

router.get('/commentsResults/:query', (req, res) => {
    const query = req.params.query;

    dbConn.searchComments(query, (err, comments) => {
        if (err) {
            console.error("Error fetching comments:", err);
            return res.status(500).send("Error fetching comments");
        }
        res.json(comments);
    });
});

module.exports = router; //exporting the module for users