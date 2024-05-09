const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("adminUsersList route reached");
    res.render("adminUsersList");
})

router.get('/getUsers', (req, res) => {
    dbConn.getUsers((err, users) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).send("Error fetching users");
        } else{
            res.json(users);
        }
    });
});

router.get('/deleteUser/:username', (req, res) => {
    const username = req.params.username;
    dbConn.deleteUser(username, (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).send("Error deleting user");
        } else {
            res.render("adminUsersList");
        }
    });
});

router.get('/makeAdmin/:username', (req, res) => {
    const username = req.params.username;
    dbConn.makeAdmin(username, (err, result) => {
        if (err) {
            console.error("Error making user admin:", err);
            return res.status(500).send("Error making user admin");
        } else {
            res.render("adminUsersList");
        }
    });
});

router.get('/removeAdmin/:username', (req, res) => {
    const username = req.params.username;
    dbConn.removeAdmin(username, (err, result) => {
        if (err) {
            console.error("Error removing admin status:", err);
            return res.status(500).send("Error removing admin status");
        } else {
            res.render("adminUsersList");
        }
    });
});

module.exports = router;