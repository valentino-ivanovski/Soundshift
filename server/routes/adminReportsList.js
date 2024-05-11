const express = require("express");
const router = express.Router();
const dbConn = require('../database/dbConn');

router.get('/', (req, res) => {
    console.log("adminReportsList route reached");
    res.render("adminReportsList");
})

router.get('/getReports', (req, res) => {
    dbConn.getReports((err, reports) => {
        if (err) {
            console.error("Error fetching reports:", err);
            return res.status(500).send("Error fetching reports");
        } else{
            res.json(reports);
        }
    });
});

router.get('/deleteReport/:comment_id', (req, res) => {
    const id = req.params.comment_id;
    dbConn.deleteReport(id, (err, result) => {
        if (err) {
            console.error("Error deleting report:", err);
            return res.status(500).send("Error deleting report");
        } else {
            res.render("adminSongsList");
        }
    });
});

module.exports = router;