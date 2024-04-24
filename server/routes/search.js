const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("profile route reached");
    res.render("search");
})

module.exports = router; //exporting the module for users