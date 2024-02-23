const express = require("express");
const router = express.Router()

router.get('/', (req, res) => {
    console.log("mainpage route reached");
    res.render("mainpage");
})

module.exports = router; //exporting the module for users