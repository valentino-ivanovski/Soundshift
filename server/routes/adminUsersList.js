const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn'); //importing the database connection module

router.get('/', (req, res) => {
    console.log("adminUsersList route reached");
    res.render("adminUsersList");
})

module.exports = router;