const express = require("express");
const router = express.Router()
const dbConn = require('../database/dbConn');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    console.log("login route reached");
    res.render("login");
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // get the user from the database
    dbConn.getUserByUsername(username, (err, user) => {
        if (err) {
            console.error("Error getting user:", err);
            res.status(500).send("Login failed. Please try again.");
        } else if (!user) {
            console.log("User not found");
            res.render('login', { error: "Invalid username or password." }); // render the login page with an error message
        } else {
            // check the entered password against the hashed password in the database
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    res.status(500).send("Login failed. Please try again.");
                } else if (!result) {
                    console.log("Incorrect password");
                    res.render('login', { error: "Invalid username or password." }); // render the login page with an error message
                } else {
                    console.log("User logged in successfully");

                    // set the user session
                    req.session.user = user;

                    if (user.admin === 0) {
                        res.redirect("/adminMainpage");
                    } else {
                        res.redirect("/mainpage");
                    }
                }
            });
        }
    });
});

router.get('/mainpage', (req, res) => {
    // Check if the user is logged in
    if (req.session.user) {
        const username = req.session.user.username;
        res.render('mainpage', { username: username });
    } else {
        // Redirect to the login page if user is not logged in
        res.redirect('/login');
    }
  });

module.exports = router; //exporting the module for users