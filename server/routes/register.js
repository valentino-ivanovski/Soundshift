const express = require("express")
const router = express.Router()
const dbConn = require('../database/dbConn');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render("register");
})

router.post('/registerUser', (req, res) => {
    const { username, email, password } = req.body;

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
        if (err) {
            console.error("Error hashing password:", err);
            res.status(500).send("Registration failed. Please try again.");
        } else {
            //check if the username already exists
            dbConn.checkUsernameExists(username, email, (err, exists) => {
                if (err) {
                    console.error("Error checking username:", err);
                    res.status(500).send("Registration failed. Please try again.");
                } else if (exists) {
                    res.render('register', { errorReg: "Username or email already exists." });
                } else {
                    //username doesn't exist, proceed with registration
                    dbConn.insertUser(username, email, hashedPassword, (err, result) => {
                        if (err) {
                            console.error("Error inserting user:", err);
                            res.status(500).send("Registration failed. Please try again.");
                        } else {
                            console.log("User registered successfully");
                            res.redirect('/'); 
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;