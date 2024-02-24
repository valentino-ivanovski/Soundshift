const express = require("express")
const router = express.Router()
const dbConn = require('../database/dbConn');

router.get('/', (req, res) => {
    res.render("register");
})

router.post('/registerUser', (req, res) => {
    const { username, email, password } = req.body;

    // Check if the username already exists
    dbConn.checkUsernameExists(username, email, (err, exists) => {
        if (err) {
            console.error("Error checking username:", err);
            res.status(500).send("Registration failed. Please try again.");
        } else if (exists) {
            res.render('register', { errorReg: "Username or email already exists." });
        } else {
            // Username doesn't exist, proceed with registration
            dbConn.insertUser(username, email, password, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    res.status(500).send("Registration failed. Please try again.");
                } else {
                    console.log("User registered successfully");
                    res.redirect('/'); // Redirect to the login page after successful registration
                }
            });
        }
    });
});


module.exports = router; //exporting the module for users

// also, it's better to rename this file by the name of the endpoint (in this case /users.js), and place here all routes related to users, which are

// creating user: router.post('/users', (req, res) => {})
// editing user: router.put('/users/{id}', (req, res) => {})
// deleting user: router.delete('/users/{id}', (req, res) => {})