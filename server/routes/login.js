const express = require("express");
const router = express.Router()
const dbConn = require('../database/dbConn');

router.get('/', (req, res) => {
    console.log("login route reached");
    res.render("login");
})

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  //check the username and password against the database
  dbConn.checkUserCredentials(username, password, (err, user) => {
      if (err) {
          console.error("Error checking user credentials:", err);
          res.status(500).send("Login failed. Please try again.");
      } else if (!user) {
          console.log("User not found or incorrect password");
          res.render('login', { error: "Invalid username or password." }); //render the login page with an error message
      } else {
          console.log("User logged in successfully");

          //set the user session
          req.session.user = user;

          res.redirect("/mainpage");
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