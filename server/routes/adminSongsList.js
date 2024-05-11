const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("adminSongsList route reached");
    res.render("adminSongsList");
})

router.get('/getSongs', (req, res) => {
    dbConn.getSongs((err, songs) => {
        if (err) {
            console.error("Error fetching songs:", err);
            return res.status(500).send("Error fetching songs");
        } else{
            res.json(songs);
        }
    });
});

router.get('/deleteSong/:song_id', (req, res) => {
    const id = req.params.song_id;
    dbConn.deleteSong(id, (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).send("Error deleting user");
        } else {
            res.render("adminSongsList");
        }
    });
});

module.exports = router;