const express = require("express");
const router = express.Router()
const dbConn = require('../database/dbConn');

router.get('/', (req, res) => {
    console.log("login route reached");
    res.render("login");
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check the username and password against the database
    dbConn.checkUserCredentials(username, password, (err, user) => {
      if (err) {
        console.error("Error checking user credentials:", err);
        res.status(500).send("Login failed. Please try again.");
      } else if (!user) {
        console.log("User not found or incorrect password");
        res.status(401).send("Invalid username or password.");
      } else {
        console.log("User logged in successfully");
  
        // Set the user session
        req.session.user = user;

        res.redirect("/mainpage");
      }
    });
  });

module.exports = router; //exporting the module for users